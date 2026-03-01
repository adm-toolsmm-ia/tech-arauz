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
