"""
LLM Factory — Multi-provider instantiation pattern.

Supports OpenAI, Anthropic, Google Gemini, and Azure OpenAI.
Each provider is instantiated lazily with API keys from environment variables.
"""

import os
from typing import Any, Optional

from langchain_core.language_models import BaseChatModel


class LLMProviderError(Exception):
    """Raised when LLM provider configuration or instantiation fails."""

    def __init__(
        self,
        provider: str,
        model_id: str,
        error_detail: str,
    ) -> None:
        """Initialize LLMProviderError.

        Args:
            provider: Provider name (e.g., 'openai', 'anthropic')
            model_id: Model identifier (e.g., 'gpt-4o')
            error_detail: Human-readable error message
        """
        self.provider = provider
        self.model_id = model_id
        self.error_detail = error_detail
        super().__init__(f"LLM provider error ({provider}/{model_id}): {error_detail}")


def get_llm(provider: str, model_id: str, **kwargs: Any) -> BaseChatModel:
    """Instantiate LLM for given provider and model.

    Supported providers:
    - openai: GPT-4, GPT-4o, etc.
    - anthropic: Claude 3 variants
    - google_gemini: Google Generative AI
    - azure_openai: Azure OpenAI deployment

    Args:
        provider: Provider name (openai, anthropic, google_gemini, azure_openai)
        model_id: Model identifier (e.g., 'gpt-4o', 'claude-3-opus-20240229')
        **kwargs: Additional arguments (temperature, max_tokens, top_p, etc.)

    Returns:
        BaseChatModel instance configured with provider credentials

    Raises:
        LLMProviderError: If provider unknown, API key missing, or instantiation fails
    """
    if provider == "openai":
        return _get_openai_llm(model_id, **kwargs)
    elif provider == "anthropic":
        return _get_anthropic_llm(model_id, **kwargs)
    elif provider == "google_gemini":
        return _get_google_llm(model_id, **kwargs)
    elif provider == "azure_openai":
        return _get_azure_llm(model_id, **kwargs)
    else:
        raise LLMProviderError(
            provider=provider,
            model_id=model_id,
            error_detail=f"Unknown provider: {provider}. Supported: openai, anthropic, google_gemini, azure_openai",
        )


def _get_openai_llm(model_id: str, **kwargs: Any) -> BaseChatModel:
    """Instantiate OpenAI ChatGPT model."""
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise LLMProviderError(
            provider="openai",
            model_id=model_id,
            error_detail="OPENAI_API_KEY environment variable not set",
        )

    try:
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model=model_id,
            api_key=api_key,
            **kwargs,
        )
    except ImportError:
        raise LLMProviderError(
            provider="openai",
            model_id=model_id,
            error_detail="langchain-openai package not installed",
        )
    except Exception as exc:
        raise LLMProviderError(
            provider="openai",
            model_id=model_id,
            error_detail=f"Failed to instantiate ChatOpenAI: {str(exc)}",
        )


def _get_anthropic_llm(model_id: str, **kwargs: Any) -> BaseChatModel:
    """Instantiate Anthropic Claude model."""
    api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    if not api_key:
        raise LLMProviderError(
            provider="anthropic",
            model_id=model_id,
            error_detail="ANTHROPIC_API_KEY environment variable not set",
        )

    try:
        from langchain_anthropic import ChatAnthropic

        return ChatAnthropic(
            model=model_id,
            api_key=api_key,
            **kwargs,
        )
    except ImportError:
        raise LLMProviderError(
            provider="anthropic",
            model_id=model_id,
            error_detail="langchain-anthropic package not installed",
        )
    except Exception as exc:
        raise LLMProviderError(
            provider="anthropic",
            model_id=model_id,
            error_detail=f"Failed to instantiate ChatAnthropic: {str(exc)}",
        )


def _get_google_llm(model_id: str, **kwargs: Any) -> BaseChatModel:
    """Instantiate Google Generative AI (Gemini) model."""
    api_key = os.getenv("GOOGLE_API_KEY", "").strip()
    if not api_key:
        raise LLMProviderError(
            provider="google_gemini",
            model_id=model_id,
            error_detail="GOOGLE_API_KEY environment variable not set",
        )

    try:
        from langchain_google_genai import ChatGoogleGenerativeAI

        return ChatGoogleGenerativeAI(
            model=model_id,
            google_api_key=api_key,
            **kwargs,
        )
    except ImportError:
        raise LLMProviderError(
            provider="google_gemini",
            model_id=model_id,
            error_detail="langchain-google-genai package not installed",
        )
    except Exception as exc:
        raise LLMProviderError(
            provider="google_gemini",
            model_id=model_id,
            error_detail=f"Failed to instantiate ChatGoogleGenerativeAI: {str(exc)}",
        )


def _get_azure_llm(model_id: str, **kwargs: Any) -> BaseChatModel:
    """Instantiate Azure OpenAI model."""
    api_key = os.getenv("AZURE_OPENAI_API_KEY", "").strip()
    endpoint = os.getenv("AZURE_OPENAI_ENDPOINT", "").strip()

    if not api_key:
        raise LLMProviderError(
            provider="azure_openai",
            model_id=model_id,
            error_detail="AZURE_OPENAI_API_KEY environment variable not set",
        )

    if not endpoint:
        raise LLMProviderError(
            provider="azure_openai",
            model_id=model_id,
            error_detail="AZURE_OPENAI_ENDPOINT environment variable not set",
        )

    try:
        from langchain_openai import AzureChatOpenAI

        return AzureChatOpenAI(
            azure_deployment=model_id,
            api_key=api_key,
            azure_endpoint=endpoint,
            api_version="2024-02-15-preview",
            **kwargs,
        )
    except ImportError:
        raise LLMProviderError(
            provider="azure_openai",
            model_id=model_id,
            error_detail="langchain-openai package (with Azure support) not installed",
        )
    except Exception as exc:
        raise LLMProviderError(
            provider="azure_openai",
            model_id=model_id,
            error_detail=f"Failed to instantiate AzureChatOpenAI: {str(exc)}",
        )


# Story 7.7: Multi-provider fallback wrapper
async def create_with_fallback(
    primary_provider: str,
    primary_model_id: str,
    supabase_client,
    tenant_id: str,
    **llm_kwargs: Any,
) -> tuple[BaseChatModel, str, str]:
    """
    Create LLM with automatic fallback to secondary provider on error.

    Queries model_fallback_policies to find fallback chain.
    If primary provider fails (rate limit, timeout, 500), tries fallback in priority order.
    Registers incidents for failed attempts.

    Args:
        primary_provider: Primary provider name (openai, anthropic, etc.)
        primary_model_id: Primary model ID
        supabase_client: Async Supabase client for policy queries
        tenant_id: Tenant ID for policy lookup
        **llm_kwargs: Additional LLM arguments (temperature, max_tokens, etc.)

    Returns:
        Tuple of (llm_instance, selected_provider, selected_model_id)

    Raises:
        LLMProviderError: If all providers in fallback chain fail
    """
    from datetime import datetime

    # Get fallback policies from Supabase
    try:
        policies_response = (
            await supabase_client.table("model_fallback_policies")
            .select("*")
            .eq("tenant_id", tenant_id)
            .eq("is_active", True)
            .order("priority", desc=False)
            .execute()
        )
        fallback_policies = policies_response.data or []
    except Exception as e:
        # If policy query fails, just use primary provider
        fallback_policies = []

    # Build fallback chain: [primary] + [fallbacks in priority order]
    fallback_chain = [
        {
            "provider": primary_provider,
            "model_id": primary_model_id,
            "is_primary": True,
        }
    ]

    # Find fallbacks for this primary model
    for policy in fallback_policies:
        if policy.get("primary_model_id") == primary_model_id:
            fallback_chain.append(
                {
                    "provider": policy.get("fallback_provider", "anthropic"),
                    "model_id": policy.get("fallback_model_id", "claude-3-sonnet"),
                    "is_primary": False,
                    "priority": policy.get("priority", 999),
                }
            )

    # Try each provider in chain
    last_error = None
    for i, attempt in enumerate(fallback_chain):
        provider = attempt["provider"]
        model_id = attempt["model_id"]
        is_primary = attempt.get("is_primary", False)

        try:
            llm = get_llm(provider, model_id, **llm_kwargs)
            if not is_primary:
                # Log fallback selection
                await supabase_client.table("model_incidents").insert([
                    {
                        "tenant_id": tenant_id,
                        "model_id": primary_model_id,
                        "severity": "low",
                        "title": f"Fallback activated: {primary_provider}/{primary_model_id}",
                        "description": f"Primary provider failed, using fallback: {provider}/{model_id}",
                        "started_at": datetime.utcnow().isoformat(),
                    }
                ]).execute()
            return llm, provider, model_id

        except LLMProviderError as e:
            last_error = e
            if is_primary:
                # Log primary failure
                await supabase_client.table("model_incidents").insert([
                    {
                        "tenant_id": tenant_id,
                        "model_id": primary_model_id,
                        "severity": "medium",
                        "title": f"Primary provider failed: {provider}/{model_id}",
                        "description": str(e),
                        "started_at": datetime.utcnow().isoformat(),
                    }
                ]).execute()
            continue
        except Exception as e:
            last_error = e
            continue

    # If all fail, raise error
    raise LLMProviderError(
        provider=primary_provider,
        model_id=primary_model_id,
        error_detail=f"All providers in fallback chain failed. Last error: {str(last_error)}",
    )
