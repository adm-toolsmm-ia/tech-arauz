"""
Tracing module — LangSmith as primary backend.

Provides run context propagation (run_id / trace_id / span_id) via
contextvars so that every coroutine in the same request automatically
inherits the current trace.

Feature flag: OBS_ENABLED (env).  When disabled every public helper
becomes a transparent no-op.
"""

from __future__ import annotations

import os
import uuid
from contextlib import contextmanager
from contextvars import ContextVar
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Generator, Optional

# ---------------------------------------------------------------------------
# LangSmith imports (lazy – only used when backend == langsmith)
# ---------------------------------------------------------------------------
_langsmith_client = None


def _get_langsmith_client():
    """Lazy-init the LangSmith client (singleton)."""
    global _langsmith_client
    if _langsmith_client is None:
        try:
            from langsmith import Client  # type: ignore[import-untyped]

            _langsmith_client = Client()
        except Exception:
            _langsmith_client = None
    return _langsmith_client


# ---------------------------------------------------------------------------
# Run context (propagated via contextvars)
# ---------------------------------------------------------------------------

@dataclass
class RunContext:
    """Immutable bag carried through a single execution run."""

    run_id: str = field(default_factory=lambda: uuid.uuid4().hex)
    trace_id: str = field(default_factory=lambda: uuid.uuid4().hex)
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    agent_id: Optional[str] = None
    started_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: dict[str, Any] = field(default_factory=dict)


_current_run: ContextVar[Optional[RunContext]] = ContextVar(
    "obs_current_run", default=None,
)


def get_current_run() -> Optional[RunContext]:
    """Return the active RunContext or ``None``."""
    return _current_run.get()


@contextmanager
def with_run_context(
    *,
    run_id: Optional[str] = None,
    session_id: Optional[str] = None,
    user_id: Optional[str] = None,
    agent_id: Optional[str] = None,
    metadata: Optional[dict[str, Any]] = None,
) -> Generator[RunContext, None, None]:
    """Context-manager that establishes a new ``RunContext``.

    Usage::

        with with_run_context(session_id="s1") as ctx:
            # ctx.run_id is available everywhere in this scope
            ...
    """
    ctx = RunContext(
        run_id=run_id or uuid.uuid4().hex,
        trace_id=uuid.uuid4().hex,
        session_id=session_id,
        user_id=user_id,
        agent_id=agent_id,
        metadata=metadata or {},
    )
    token = _current_run.set(ctx)
    try:
        yield ctx
    finally:
        _current_run.reset(token)


# ---------------------------------------------------------------------------
# Span helpers
# ---------------------------------------------------------------------------

@dataclass
class SpanRecord:
    """Lightweight value-object that represents a completed span."""

    span_id: str
    name: str
    kind: str
    run_id: str
    trace_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    attributes: dict[str, Any] = field(default_factory=dict)
    status: str = "ok"  # ok | error
    error_message: Optional[str] = None


# In-memory buffer so that the demo / tests can introspect spans without a
# live LangSmith connection.
_span_buffer: list[SpanRecord] = []


def get_span_buffer() -> list[SpanRecord]:
    """Return a **copy** of the in-memory span buffer."""
    return list(_span_buffer)


def clear_span_buffer() -> None:
    _span_buffer.clear()


@contextmanager
def create_span(
    name: str,
    kind: str = "generic",
    attributes: Optional[dict[str, Any]] = None,
) -> Generator[SpanRecord, None, None]:
    """Create a child span under the current RunContext.

    *kind* should be one of ``llm.call``, ``tool.call``, ``rag.retrieve``,
    ``agent.step``, or ``generic``.

    The span is automatically closed when the context-manager exits.
    If OBS_ENABLED is ``false`` the span is still yielded (for attribute
    collection) but nothing is exported.
    """
    ctx = get_current_run()
    span = SpanRecord(
        span_id=uuid.uuid4().hex,
        name=name,
        kind=kind,
        run_id=ctx.run_id if ctx else "unknown",
        trace_id=ctx.trace_id if ctx else "unknown",
        start_time=datetime.now(timezone.utc),
        attributes=dict(attributes or {}),
    )
    try:
        yield span
    except Exception as exc:
        span.status = "error"
        span.error_message = str(exc)[:500]
        raise
    finally:
        span.end_time = datetime.now(timezone.utc)
        _span_buffer.append(span)

        # Export to LangSmith when enabled
        if _is_enabled() and _is_langsmith():
            _export_span_langsmith(span)


# ---------------------------------------------------------------------------
# LangSmith exporter
# ---------------------------------------------------------------------------

def _export_span_langsmith(span: SpanRecord) -> None:
    """Best-effort push of a span to LangSmith as a Run."""
    try:
        client = _get_langsmith_client()
        if client is None:
            return

        inputs = {
            k: v
            for k, v in span.attributes.items()
            if k.startswith("input")
        }
        outputs = {
            k: v
            for k, v in span.attributes.items()
            if k.startswith("output") or k.startswith("result")
        }

        run_type_map = {
            "llm.call": "llm",
            "tool.call": "tool",
            "rag.retrieve": "retriever",
            "agent.step": "chain",
            "generic": "chain",
        }

        client.create_run(
            name=span.name,
            run_type=run_type_map.get(span.kind, "chain"),
            inputs=inputs or {"query": span.name},
            outputs=outputs or {},
            run_id=span.span_id,
            trace_id=span.trace_id,
            start_time=span.start_time,
            end_time=span.end_time,
            extra={"metadata": span.attributes},
            error=span.error_message,
            project_name=os.getenv("LANGCHAIN_PROJECT", "tech-arauz"),
        )
    except Exception:
        # Never let exporting break the application
        pass


# ---------------------------------------------------------------------------
# Init / feature-flag helpers
# ---------------------------------------------------------------------------

_initialized: bool = False


def _is_enabled() -> bool:
    return os.getenv("OBS_ENABLED", "true").lower() in ("true", "1", "yes")


def _is_langsmith() -> bool:
    return os.getenv("OBS_BACKEND", "langsmith").lower() == "langsmith"


def get_trace_url(run_id: str) -> Optional[str]:
    """Return the LangSmith URL for a given run, or ``None``.

    Uses the official ``Client.get_run_url()`` when available.
    Returns ``None`` instead of a potentially broken hardcoded URL.
    """
    if not _is_enabled() or not _is_langsmith():
        return None
    try:
        client = _get_langsmith_client()
        if client is None:
            return None
        return client.get_run_url(run=run_id)  # type: ignore[arg-type]
    except Exception:
        return None


def init_tracer() -> None:
    """One-time initialisation called at app startup.

    For LangSmith the SDK auto-configures via env vars
    (``LANGCHAIN_TRACING_V2``, ``LANGCHAIN_API_KEY``,
    ``LANGCHAIN_PROJECT``).  We just validate and log.

    The project convention uses ``LANGSMITH_API_KEY`` in ``.env`` files.
    The LangSmith SDK reads ``LANGCHAIN_API_KEY``.  This function bridges
    the two so both names work transparently.
    """
    global _initialized
    if _initialized:
        return

    if not _is_enabled():
        _initialized = True
        return

    if _is_langsmith():
        # Bridge: LANGSMITH_API_KEY -> LANGCHAIN_API_KEY
        # The LangSmith SDK reads LANGCHAIN_API_KEY from the environment.
        # Our .env.example uses LANGSMITH_API_KEY for clarity.
        # Map one to the other so the SDK always finds the key.
        langsmith_key = os.getenv("LANGSMITH_API_KEY", "")
        if langsmith_key and not os.getenv("LANGCHAIN_API_KEY"):
            os.environ["LANGCHAIN_API_KEY"] = langsmith_key

        # Force the env vars that LangSmith SDK needs
        os.environ.setdefault("LANGCHAIN_TRACING_V2", "true")
        os.environ.setdefault("LANGCHAIN_PROJECT", "tech-arauz")
        # Warm up client (validates API key)
        _get_langsmith_client()

    _initialized = True
