"""
Cost estimation module.

Maintains a pricing table (USD per 1 000 tokens) for common models and
provides helpers to compute costs from token counts or raw text.

When a model is unknown the module falls back to gpt-4o pricing (the most
expensive common model) and logs a warning so it's never silently cheap.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Optional

logger = logging.getLogger("obs.costs")

# ---------------------------------------------------------------------------
# Pricing table — USD per 1 000 tokens  (input / output)
# Source: provider pricing pages, fetched 2026-02-08.
# Update periodically or load from a config file.
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class ModelPrice:
    input_per_1k: float   # USD per 1 000 input (prompt) tokens
    output_per_1k: float  # USD per 1 000 output (completion) tokens


MODEL_PRICES: dict[str, ModelPrice] = {
    # OpenAI
    "gpt-4o": ModelPrice(0.0025, 0.0100),
    "gpt-4o-2024-11-20": ModelPrice(0.0025, 0.0100),
    "gpt-4o-mini": ModelPrice(0.000150, 0.000600),
    "gpt-4o-mini-2024-07-18": ModelPrice(0.000150, 0.000600),
    "gpt-4-turbo": ModelPrice(0.0100, 0.0300),
    "gpt-4": ModelPrice(0.0300, 0.0600),
    "gpt-3.5-turbo": ModelPrice(0.0005, 0.0015),
    "gpt-3.5-turbo-0125": ModelPrice(0.0005, 0.0015),
    "o1": ModelPrice(0.0150, 0.0600),
    "o1-mini": ModelPrice(0.0030, 0.0120),
    "o3-mini": ModelPrice(0.0011, 0.0044),
    # Anthropic
    "claude-3.5-sonnet": ModelPrice(0.0030, 0.0150),
    "claude-3-5-sonnet-20241022": ModelPrice(0.0030, 0.0150),
    "claude-3-opus": ModelPrice(0.0150, 0.0750),
    "claude-3-haiku": ModelPrice(0.00025, 0.00125),
    "claude-3.5-haiku": ModelPrice(0.0008, 0.0040),
    # Embeddings
    "text-embedding-3-small": ModelPrice(0.00002, 0.0),
    "text-embedding-3-large": ModelPrice(0.00013, 0.0),
    "text-embedding-ada-002": ModelPrice(0.00010, 0.0),
}

# Conservative fallback — use gpt-4o pricing so unknown models never
# appear cheaper than they really are.
_FALLBACK_PRICE = MODEL_PRICES["gpt-4o"]


# ---------------------------------------------------------------------------
# Cost result
# ---------------------------------------------------------------------------

@dataclass
class CostResult:
    """Result of a cost computation."""

    model: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    cost_usd: float
    estimated: bool  # True when tokens were counted locally (tiktoken)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def estimate_cost(
    model: str,
    prompt_tokens: int,
    completion_tokens: int = 0,
) -> CostResult:
    """Compute cost from known token counts (returned by the LLM API).

    Returns a :class:`CostResult` with ``estimated=False``.
    """
    price = MODEL_PRICES.get(model)
    if price is None:
        logger.warning(
            "Unknown model '%s' — using gpt-4o fallback pricing", model,
        )
        price = _FALLBACK_PRICE

    cost = (
        (prompt_tokens / 1000) * price.input_per_1k
        + (completion_tokens / 1000) * price.output_per_1k
    )
    return CostResult(
        model=model,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        total_tokens=prompt_tokens + completion_tokens,
        cost_usd=round(cost, 8),
        estimated=False,
    )


def estimate_cost_by_text(
    model: str,
    text: str,
    *,
    direction: str = "input",
) -> CostResult:
    """Estimate cost by counting tokens locally with *tiktoken*.

    Falls back to a rough ``len(text) / 4`` heuristic when tiktoken is
    not available or the model encoding is unknown.

    Returns a :class:`CostResult` with ``estimated=True``.
    """
    token_count = _count_tokens(text, model)
    prompt_tokens = token_count if direction == "input" else 0
    completion_tokens = token_count if direction == "output" else 0

    price = MODEL_PRICES.get(model, _FALLBACK_PRICE)

    if direction == "input":
        cost = (token_count / 1000) * price.input_per_1k
    else:
        cost = (token_count / 1000) * price.output_per_1k

    return CostResult(
        model=model,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        total_tokens=token_count,
        cost_usd=round(cost, 8),
        estimated=True,
    )


# ---------------------------------------------------------------------------
# Token counting (tiktoken with graceful fallback)
# ---------------------------------------------------------------------------

_encoder_cache: dict[str, object] = {}


def _count_tokens(text: str, model: str) -> int:
    """Return an approximate token count for *text*."""
    try:
        import tiktoken  # type: ignore[import-untyped]

        if model not in _encoder_cache:
            try:
                _encoder_cache[model] = tiktoken.encoding_for_model(model)
            except KeyError:
                # Unknown model — use cl100k_base (GPT-4 family)
                _encoder_cache[model] = tiktoken.get_encoding("cl100k_base")
        enc = _encoder_cache[model]
        return len(enc.encode(text))  # type: ignore[union-attr]
    except ImportError:
        # tiktoken not installed — crude heuristic
        return max(1, len(text) // 4)


def get_model_names() -> list[str]:
    """Return all model names present in the pricing table."""
    return sorted(MODEL_PRICES.keys())
