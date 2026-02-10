"""
Instrumentation wrappers for LLM calls, tool calls, and retrieval steps.

Each wrapper:
  1. Creates a span under the current RunContext.
  2. Measures latency.
  3. Extracts / estimates token usage and cost.
  4. Applies PII redaction before logging.
  5. Charges the BudgetManager.
  6. Emits a structured log event.
  7. Returns the original result untouched.

All wrappers are **transparent** — if observability is disabled the wrapped
function executes exactly as before.
"""

from __future__ import annotations

import asyncio
import functools
import logging
import os
import time
from collections.abc import Awaitable
from typing import Any, Callable, TypeVar

from app.instrumentation.budget import get_budget_manager
from app.instrumentation.costs import CostResult, estimate_cost, estimate_cost_by_text
from app.instrumentation.logging import log_event
from app.instrumentation.redaction import redact_pii, truncate
from app.instrumentation.tracing import create_span, get_current_run

logger = logging.getLogger("obs.wrappers")

T = TypeVar("T")


def _is_enabled() -> bool:
    return os.getenv("OBS_ENABLED", "true").lower() in ("true", "1", "yes")


# ---------------------------------------------------------------------------
# wrap_llm_call  (for direct invocation, not decorator)
# ---------------------------------------------------------------------------

async def wrap_llm_call(
    call_fn: Callable[..., Awaitable[Any]],
    *,
    model: str,
    messages: list[dict[str, str]] | None = None,
    session_id: str | None = None,
    user_id: str | None = None,
    agent_id: str | None = None,
    **kwargs: Any,
) -> Any:
    """Execute *call_fn* inside an ``llm.call`` span.

    *call_fn* should be an async callable that returns an LLM response
    (e.g. ``client.chat.completions.create``).

    The wrapper extracts ``usage`` from the response when available,
    otherwise it estimates tokens from the raw text.

    Returns the original response object.
    """
    if not _is_enabled():
        return await call_fn(**kwargs)

    ctx = get_current_run()
    _session = session_id or (ctx.session_id if ctx else None)
    _user = user_id or (ctx.user_id if ctx else None)
    _agent = agent_id or (ctx.agent_id if ctx else None)

    # Pre-flight budget check
    bm = get_budget_manager()
    bm.assert_remaining(session_id=_session, user_id=_user, agent_id=_agent)

    # Redacted preview of input
    input_preview = ""
    if messages:
        last_msg = messages[-1].get("content", "") if messages else ""
        input_preview = truncate(redact_pii(str(last_msg)))

    with create_span("llm.call", kind="llm.call", attributes={"model": model}) as span:
        t0 = time.perf_counter()
        try:
            response = await call_fn(**kwargs)
        except Exception as exc:
            latency_ms = round((time.perf_counter() - t0) * 1000, 1)
            span.attributes.update({
                "input.preview": input_preview,
                "latency_ms": latency_ms,
                "status": "error",
                "error": str(exc)[:300],
            })
            log_event(
                "llm.call.error",
                model=model,
                latency_ms=latency_ms,
                status="error",
                error=str(exc)[:300],
            )
            raise

        latency_ms = round((time.perf_counter() - t0) * 1000, 1)

        # Extract usage
        cost_result = _extract_usage_and_cost(response, model)

        # Output preview
        output_text = _extract_output_text(response)
        output_preview = truncate(redact_pii(output_text))

        span.attributes.update({
            "input.preview": input_preview,
            "output.preview": output_preview,
            "output.truncated": len(output_text) > 200,
            "model": model,
            "prompt_tokens": cost_result.prompt_tokens,
            "completion_tokens": cost_result.completion_tokens,
            "total_tokens": cost_result.total_tokens,
            "cost_usd": cost_result.cost_usd,
            "usage.estimated": cost_result.estimated,
            "latency_ms": latency_ms,
            "status": "ok",
        })

        # Charge budget
        if cost_result.cost_usd > 0:
            bm.charge(
                cost_result.cost_usd,
                session_id=_session,
                user_id=_user,
                agent_id=_agent,
            )

        log_event(
            "llm.call.complete",
            model=model,
            prompt_tokens=cost_result.prompt_tokens,
            completion_tokens=cost_result.completion_tokens,
            total_tokens=cost_result.total_tokens,
            cost_usd=cost_result.cost_usd,
            latency_ms=latency_ms,
            status="ok",
            usage_estimated=cost_result.estimated,
        )

    return response


def _extract_usage_and_cost(response: Any, model: str) -> CostResult:
    """Try to get usage from the response; fall back to text estimation."""
    usage = getattr(response, "usage", None)
    if usage:
        prompt_tokens = getattr(usage, "prompt_tokens", 0) or 0
        completion_tokens = getattr(usage, "completion_tokens", 0) or 0
        if prompt_tokens or completion_tokens:
            return estimate_cost(model, prompt_tokens, completion_tokens)

    # Fallback: estimate from output text
    output_text = _extract_output_text(response)
    if output_text:
        return estimate_cost_by_text(model, output_text, direction="output")

    # Absolute fallback — zero cost
    return CostResult(
        model=model,
        prompt_tokens=0,
        completion_tokens=0,
        total_tokens=0,
        cost_usd=0.0,
        estimated=True,
    )


def _extract_output_text(response: Any) -> str:
    """Best-effort extraction of text from an LLM response."""
    # OpenAI ChatCompletion
    choices = getattr(response, "choices", None)
    if choices and len(choices) > 0:
        msg = getattr(choices[0], "message", None)
        if msg:
            return getattr(msg, "content", "") or ""
    # LangChain AIMessage
    content = getattr(response, "content", None)
    if isinstance(content, str):
        return content
    # dict response
    if isinstance(response, dict):
        return str(response.get("output", response.get("content", "")))
    return str(response)[:500]


# ---------------------------------------------------------------------------
# wrap_tool_call  (decorator)
# ---------------------------------------------------------------------------

def wrap_tool_call(name: str | None = None):
    """Decorator that wraps a tool function with a ``tool.call`` span.

    Works with both sync and async functions.

    Example::

        @wrap_tool_call("search_documents")
        async def search_documents(query: str) -> list[dict]:
            ...
    """

    def decorator(fn: Callable[..., T]) -> Callable[..., T]:
        tool_name = name or fn.__name__

        if _is_async(fn):

            @functools.wraps(fn)
            async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
                if not _is_enabled():
                    return await _await_fn(fn, *args, **kwargs)

                input_preview = truncate(redact_pii(str(args[:3]) + str(kwargs)[:200]))

                with create_span(
                    tool_name, kind="tool.call",
                    attributes={"tool.name": tool_name},
                ) as span:
                    t0 = time.perf_counter()
                    try:
                        result = await _await_fn(fn, *args, **kwargs)
                    except Exception as exc:
                        latency_ms = round((time.perf_counter() - t0) * 1000, 1)
                        span.attributes.update({
                            "input.preview": input_preview,
                            "latency_ms": latency_ms,
                            "status": "error",
                            "error": str(exc)[:300],
                        })
                        log_event(
                            "tool.call.error",
                            tool=tool_name, latency_ms=latency_ms,
                            status="error", error=str(exc)[:300],
                        )
                        raise

                    latency_ms = round((time.perf_counter() - t0) * 1000, 1)
                    result_preview = truncate(redact_pii(str(result)))

                    span.attributes.update({
                        "input.preview": input_preview,
                        "output.preview": result_preview,
                        "output.truncated": len(str(result)) > 200,
                        "latency_ms": latency_ms,
                        "status": "ok",
                    })
                    log_event(
                        "tool.call.complete",
                        tool=tool_name, latency_ms=latency_ms, status="ok",
                    )
                return result

            return async_wrapper  # type: ignore[return-value]

        else:

            @functools.wraps(fn)
            def sync_wrapper(*args: Any, **kwargs: Any) -> Any:
                if not _is_enabled():
                    return fn(*args, **kwargs)

                input_preview = truncate(redact_pii(str(args[:3]) + str(kwargs)[:200]))

                with create_span(
                    tool_name, kind="tool.call",
                    attributes={"tool.name": tool_name},
                ) as span:
                    t0 = time.perf_counter()
                    try:
                        result = fn(*args, **kwargs)
                    except Exception as exc:
                        latency_ms = round((time.perf_counter() - t0) * 1000, 1)
                        span.attributes.update({
                            "input.preview": input_preview,
                            "latency_ms": latency_ms,
                            "status": "error",
                            "error": str(exc)[:300],
                        })
                        log_event(
                            "tool.call.error",
                            tool=tool_name, latency_ms=latency_ms,
                            status="error", error=str(exc)[:300],
                        )
                        raise

                    latency_ms = round((time.perf_counter() - t0) * 1000, 1)
                    result_preview = truncate(redact_pii(str(result)))

                    span.attributes.update({
                        "input.preview": input_preview,
                        "output.preview": result_preview,
                        "output.truncated": len(str(result)) > 200,
                        "latency_ms": latency_ms,
                        "status": "ok",
                    })
                    log_event(
                        "tool.call.complete",
                        tool=tool_name, latency_ms=latency_ms, status="ok",
                    )
                return result

            return sync_wrapper  # type: ignore[return-value]

    return decorator


# ---------------------------------------------------------------------------
# wrap_retrieval  (decorator)
# ---------------------------------------------------------------------------

def wrap_retrieval(name: str | None = None):
    """Decorator that wraps a retrieval function with a ``rag.retrieve`` span.

    Captures: query length, k, latency, top-N scores, context token count,
    and truncation rate.

    Example::

        @wrap_retrieval("vector_search")
        async def vector_search(query: str, k: int = 5) -> list[dict]:
            ...
    """

    def decorator(fn: Callable[..., T]) -> Callable[..., T]:
        retrieval_name = name or fn.__name__

        if _is_async(fn):

            @functools.wraps(fn)
            async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
                if not _is_enabled():
                    return await _await_fn(fn, *args, **kwargs)

                query_str = str(args[0]) if args else str(kwargs.get("query", ""))
                k_val = kwargs.get("k", kwargs.get("top_k", "?"))

                with create_span(
                    retrieval_name, kind="rag.retrieve",
                    attributes={"retriever.name": retrieval_name},
                ) as span:
                    t0 = time.perf_counter()
                    try:
                        result = await _await_fn(fn, *args, **kwargs)
                    except Exception as exc:
                        latency_ms = round((time.perf_counter() - t0) * 1000, 1)
                        span.attributes.update({
                            "query.preview": truncate(redact_pii(query_str), 100),
                            "k": k_val,
                            "latency_ms": latency_ms,
                            "status": "error",
                            "error": str(exc)[:300],
                        })
                        log_event(
                            "rag.retrieve.error",
                            retriever=retrieval_name, latency_ms=latency_ms,
                            status="error", error=str(exc)[:300],
                        )
                        raise

                    latency_ms = round((time.perf_counter() - t0) * 1000, 1)
                    rag_meta = _extract_retrieval_metrics(result)

                    span.attributes.update({
                        "query.preview": truncate(redact_pii(query_str), 100),
                        "query.length": len(query_str),
                        "k": k_val,
                        "latency_ms": latency_ms,
                        "results_count": rag_meta["results_count"],
                        "context_tokens": rag_meta["context_tokens"],
                        "truncation_rate": rag_meta["truncation_rate"],
                        "top_scores": rag_meta["top_scores"],
                        "status": "ok",
                    })
                    log_event(
                        "rag.retrieve.complete",
                        retriever=retrieval_name,
                        latency_ms=latency_ms,
                        k=k_val,
                        results_count=rag_meta["results_count"],
                        context_tokens=rag_meta["context_tokens"],
                        truncation_rate=rag_meta["truncation_rate"],
                        status="ok",
                    )
                return result

            return async_wrapper  # type: ignore[return-value]

        else:

            @functools.wraps(fn)
            def sync_wrapper(*args: Any, **kwargs: Any) -> Any:
                if not _is_enabled():
                    return fn(*args, **kwargs)

                query_str = str(args[0]) if args else str(kwargs.get("query", ""))
                k_val = kwargs.get("k", kwargs.get("top_k", "?"))

                with create_span(
                    retrieval_name, kind="rag.retrieve",
                    attributes={"retriever.name": retrieval_name},
                ) as span:
                    t0 = time.perf_counter()
                    try:
                        result = fn(*args, **kwargs)
                    except Exception as exc:
                        latency_ms = round((time.perf_counter() - t0) * 1000, 1)
                        span.attributes.update({
                            "query.preview": truncate(redact_pii(query_str), 100),
                            "k": k_val,
                            "latency_ms": latency_ms,
                            "status": "error",
                            "error": str(exc)[:300],
                        })
                        log_event(
                            "rag.retrieve.error",
                            retriever=retrieval_name, latency_ms=latency_ms,
                            status="error", error=str(exc)[:300],
                        )
                        raise

                    latency_ms = round((time.perf_counter() - t0) * 1000, 1)
                    rag_meta = _extract_retrieval_metrics(result)

                    span.attributes.update({
                        "query.preview": truncate(redact_pii(query_str), 100),
                        "query.length": len(query_str),
                        "k": k_val,
                        "latency_ms": latency_ms,
                        "results_count": rag_meta["results_count"],
                        "context_tokens": rag_meta["context_tokens"],
                        "truncation_rate": rag_meta["truncation_rate"],
                        "top_scores": rag_meta["top_scores"],
                        "status": "ok",
                    })
                    log_event(
                        "rag.retrieve.complete",
                        retriever=retrieval_name,
                        latency_ms=latency_ms,
                        k=k_val,
                        results_count=rag_meta["results_count"],
                        context_tokens=rag_meta["context_tokens"],
                        truncation_rate=rag_meta["truncation_rate"],
                        status="ok",
                    )
                return result

            return sync_wrapper  # type: ignore[return-value]

    return decorator


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _extract_retrieval_metrics(result: Any) -> dict[str, Any]:
    """Best-effort extraction of metrics from retrieval results."""
    results_count = 0
    context_tokens = 0
    truncation_rate = 0.0
    top_scores: list[float] = []

    if isinstance(result, list):
        results_count = len(result)
        for item in result:
            if isinstance(item, dict):
                # LangChain Document-like
                text = item.get("page_content", item.get("content", ""))
                context_tokens += max(1, len(str(text)) // 4)
                score = item.get("score", item.get("relevance_score"))
                if score is not None:
                    top_scores.append(float(score))
                if item.get("truncated"):
                    truncation_rate += 1
            elif hasattr(item, "page_content"):
                context_tokens += max(1, len(item.page_content) // 4)
                score = getattr(item, "metadata", {}).get("score")
                if score is not None:
                    top_scores.append(float(score))

    if results_count > 0 and truncation_rate > 0:
        truncation_rate = truncation_rate / results_count

    return {
        "results_count": results_count,
        "context_tokens": context_tokens,
        "truncation_rate": round(truncation_rate, 3),
        "top_scores": sorted(top_scores, reverse=True)[:5],
    }


def _is_async(fn: Any) -> bool:
    """Check if a function is async."""
    return asyncio.iscoroutinefunction(fn)


async def _await_fn(fn: Any, *args: Any, **kwargs: Any) -> Any:
    """Call *fn* and await the result. Used to satisfy the type-checker."""
    return await fn(*args, **kwargs)
