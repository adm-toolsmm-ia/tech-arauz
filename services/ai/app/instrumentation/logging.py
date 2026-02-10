"""
Structured JSON logging.

Sets up a ``logging.Logger`` that emits JSON lines to both **console**
(``stderr``) and a **rotating file** (``logs/ai-service.log``).

Each log record automatically includes the current ``RunContext`` fields
(``run_id``, ``trace_id``, ``session_id``, ``agent_id``) when available.

Log level is controlled by ``OBS_LOG_LEVEL`` (default ``INFO``).
"""

from __future__ import annotations

import json
import logging
import logging.handlers
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.instrumentation.tracing import get_current_run

# ---------------------------------------------------------------------------
# JSON Formatter
# ---------------------------------------------------------------------------

class JSONFormatter(logging.Formatter):
    """Formats each log record as a single JSON line."""

    def format(self, record: logging.LogRecord) -> str:
        ctx = get_current_run()

        entry: dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Inject run context when available
        if ctx:
            entry["run_id"] = ctx.run_id
            entry["trace_id"] = ctx.trace_id
            if ctx.session_id:
                entry["session_id"] = ctx.session_id
            if ctx.user_id:
                entry["user_id"] = ctx.user_id
            if ctx.agent_id:
                entry["agent_id"] = ctx.agent_id

        # Merge extra fields passed via log_event()
        extra = getattr(record, "_obs_extra", None)
        if extra and isinstance(extra, dict):
            entry.update(extra)

        # Exception info
        if record.exc_info and record.exc_info[1]:
            entry["error"] = str(record.exc_info[1])[:500]
            entry["error_type"] = type(record.exc_info[1]).__name__

        return json.dumps(entry, default=str, ensure_ascii=False)


# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------

_configured = False


def setup_logging() -> logging.Logger:
    """Configure the ``obs`` logger hierarchy and return the root logger.

    Safe to call multiple times (idempotent).
    """
    global _configured
    if _configured:
        return logging.getLogger("obs")

    level_name = os.getenv("OBS_LOG_LEVEL", "INFO").upper()
    level = getattr(logging, level_name, logging.INFO)

    root_logger = logging.getLogger("obs")
    root_logger.setLevel(level)
    root_logger.propagate = False

    fmt = JSONFormatter()

    # Console handler (stderr)
    console = logging.StreamHandler(sys.stderr)
    console.setFormatter(fmt)
    root_logger.addHandler(console)

    # File handler (rotating)
    log_dir = Path("logs")
    log_dir.mkdir(parents=True, exist_ok=True)
    file_handler = logging.handlers.RotatingFileHandler(
        log_dir / "ai-service.log",
        maxBytes=10 * 1024 * 1024,  # 10 MB
        backupCount=5,
        encoding="utf-8",
    )
    file_handler.setFormatter(fmt)
    root_logger.addHandler(file_handler)

    _configured = True
    return root_logger


# ---------------------------------------------------------------------------
# Convenience helper
# ---------------------------------------------------------------------------

def log_event(
    action: str,
    *,
    level: int = logging.INFO,
    **kwargs: Any,
) -> None:
    """Emit a structured log event enriched with the current RunContext.

    ``kwargs`` are merged into the JSON payload (e.g. ``latency_ms``,
    ``tokens``, ``cost_usd``, ``status``).

    Example::

        log_event("llm.call.complete", model="gpt-4o", latency_ms=320,
                  tokens=1540, cost_usd=0.0041, status="ok")
    """
    logger = logging.getLogger("obs.events")
    # Attach extra data via a custom record attribute
    record = logger.makeRecord(
        name=logger.name,
        level=level,
        fn="",
        lno=0,
        msg=action,
        args=(),
        exc_info=None,
    )
    record._obs_extra = {"action": action, **kwargs}  # type: ignore[attr-defined]
    logger.handle(record)


def get_log_file_path() -> str:
    """Return the absolute path to the current log file."""
    return str(Path("logs/ai-service.log").resolve())
