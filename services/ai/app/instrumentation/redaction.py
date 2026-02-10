"""
PII redaction utilities.

Masks common PII patterns (e-mails, phone numbers, CPFs, API keys) in
free-text and in dictionary values before they are logged or exported as
span attributes.

Controlled by ``OBS_PII_REDACT`` env var (default ``true``).
"""

from __future__ import annotations

import os
import re
from typing import Any

# ---------------------------------------------------------------------------
# Feature flag
# ---------------------------------------------------------------------------

def _is_redaction_enabled() -> bool:
    return os.getenv("OBS_PII_REDACT", "true").lower() in ("true", "1", "yes")


# ---------------------------------------------------------------------------
# Patterns
# ---------------------------------------------------------------------------

# Order matters — more specific patterns first.
_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    # API keys / Bearer tokens  (sk-..., key-..., Bearer ...)
    (
        "[REDACTED_KEY]",
        re.compile(
            r"(?i)"
            r"(?:sk-[a-zA-Z0-9]{20,})"
            r"|(?:key-[a-zA-Z0-9]{20,})"
            r"|(?:Bearer\s+[A-Za-z0-9\-._~+/]+=*)"
            r"|(?:eyJ[A-Za-z0-9\-_]+\.eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_.+/=]*)"  # JWT
        ),
    ),
    # CPF  (xxx.xxx.xxx-xx)
    (
        "[REDACTED_CPF]",
        re.compile(r"\b\d{3}\.\d{3}\.\d{3}-\d{2}\b"),
    ),
    # E-mail
    (
        "[REDACTED_EMAIL]",
        re.compile(r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Z|a-z]{2,}\b"),
    ),
    # Brazilian phone  (+55 xx xxxxx-xxxx  or  (xx) xxxxx-xxxx)
    (
        "[REDACTED_PHONE]",
        re.compile(
            r"(?:\+55\s?)?\(?\d{2}\)?\s?\d{4,5}[\-\s]?\d{4}\b"
        ),
    ),
]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def redact_pii(text: str) -> str:
    """Return *text* with PII patterns replaced by placeholders.

    If ``OBS_PII_REDACT`` is disabled the original text is returned.
    """
    if not _is_redaction_enabled():
        return text

    for placeholder, pattern in _PATTERNS:
        text = pattern.sub(placeholder, text)
    return text


def redact_dict(
    data: dict[str, Any],
    *,
    sensitive_keys: frozenset[str] | None = None,
) -> dict[str, Any]:
    """Deep-copy *data* with string values redacted.

    Keys whose names match *sensitive_keys* are fully replaced by
    ``[REDACTED]``.  All other string values go through :func:`redact_pii`.
    """
    if not _is_redaction_enabled():
        return dict(data)

    _sensitive = sensitive_keys or frozenset({
        "password", "secret", "token", "api_key", "apikey",
        "authorization", "cookie", "credential",
    })

    out: dict[str, Any] = {}
    for key, value in data.items():
        lower_key = key.lower()
        if lower_key in _sensitive:
            out[key] = "[REDACTED]"
        elif isinstance(value, str):
            out[key] = redact_pii(value)
        elif isinstance(value, dict):
            out[key] = redact_dict(value, sensitive_keys=_sensitive)
        elif isinstance(value, list):
            out[key] = [
                redact_pii(v) if isinstance(v, str) else v for v in value
            ]
        else:
            out[key] = value
    return out


def truncate(text: str, max_len: int = 200) -> str:
    """Truncate *text* to *max_len* chars, appending ``…[truncated]`` if cut."""
    if len(text) <= max_len:
        return text
    return text[:max_len] + "…[truncated]"
