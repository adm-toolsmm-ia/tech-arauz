"""
Observability instrumentation package.

Usage::

    from app.instrumentation import init_observability, wrap_llm_call

    # At app startup:
    init_observability()

    # Per request:
    with with_run_context(session_id="s1", user_id="u1") as ctx:
        response = await wrap_llm_call(llm_fn, model="gpt-4o", ...)
"""

from app.instrumentation.budget import (
    BudgetExceededError,
    BudgetManager,
    get_budget_manager,
)
from app.instrumentation.costs import (
    CostResult,
    estimate_cost,
    estimate_cost_by_text,
    get_model_names,
)
from app.instrumentation.logging import (
    get_log_file_path,
    log_event,
    setup_logging,
)
from app.instrumentation.redaction import (
    redact_dict,
    redact_pii,
    truncate,
)
from app.instrumentation.tracing import (
    RunContext,
    SpanRecord,
    clear_span_buffer,
    create_span,
    get_current_run,
    get_span_buffer,
    get_trace_url,
    init_tracer,
    with_run_context,
)
from app.instrumentation.wrappers import (
    wrap_llm_call,
    wrap_retrieval,
    wrap_tool_call,
)


def init_observability() -> None:
    """One-call initialiser — sets up tracing and logging.

    Safe to call multiple times.
    """
    setup_logging()
    init_tracer()
    log_event("observability.init", status="ok")


__all__ = [
    # Init
    "init_observability",
    # Tracing
    "init_tracer",
    "RunContext",
    "SpanRecord",
    "with_run_context",
    "create_span",
    "get_current_run",
    "get_span_buffer",
    "get_trace_url",
    "clear_span_buffer",
    # Costs
    "CostResult",
    "estimate_cost",
    "estimate_cost_by_text",
    "get_model_names",
    # Budget
    "BudgetManager",
    "BudgetExceededError",
    "get_budget_manager",
    # Wrappers
    "wrap_llm_call",
    "wrap_tool_call",
    "wrap_retrieval",
    # Logging
    "log_event",
    "setup_logging",
    "get_log_file_path",
    # Redaction
    "redact_pii",
    "redact_dict",
    "truncate",
]
