"""Tests for LLM factory module."""

import os
import pytest

from app.llm.factory import (
    LLMProviderError,
    get_llm,
    _get_openai_llm,
    _get_anthropic_llm,
)
from langchain_core.language_models import BaseChatModel


class TestGetLLMOpenAI:
    """Tests for OpenAI provider."""

    def test_get_llm_openai_success(self, monkeypatch):
        """Test successful OpenAI LLM instantiation."""
        monkeypatch.setenv("OPENAI_API_KEY", "sk-test-key")
        llm = get_llm("openai", "gpt-4o")
        assert isinstance(llm, BaseChatModel)

    def test_get_llm_openai_missing_key(self, monkeypatch):
        """Test OpenAI fails when API key is missing."""
        monkeypatch.delenv("OPENAI_API_KEY", raising=False)
        with pytest.raises(LLMProviderError) as exc:
            get_llm("openai", "gpt-4o")
        assert exc.value.provider == "openai"
        assert "OPENAI_API_KEY" in exc.value.error_detail

    def test_get_llm_openai_with_kwargs(self, monkeypatch):
        """Test OpenAI with additional kwargs."""
        monkeypatch.setenv("OPENAI_API_KEY", "sk-test-key")
        llm = get_llm("openai", "gpt-4o", temperature=0.5, max_tokens=1000)
        assert isinstance(llm, BaseChatModel)


class TestGetLLMAnthropicfunc:
    """Tests for Anthropic provider."""

    def test_get_llm_anthropic_missing_key(self, monkeypatch):
        """Test Anthropic fails when API key is missing."""
        monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
        with pytest.raises(LLMProviderError) as exc:
            get_llm("anthropic", "claude-3-opus-20240229")
        assert exc.value.provider == "anthropic"
        assert "ANTHROPIC_API_KEY" in exc.value.error_detail

    def test_get_llm_anthropic_success(self, monkeypatch):
        """Test successful Anthropic LLM instantiation."""
        monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-ant-test-key")
        llm = get_llm("anthropic", "claude-3-opus-20240229")
        assert isinstance(llm, BaseChatModel)


class TestGetLLMGoogle:
    """Tests for Google Gemini provider."""

    def test_get_llm_google_missing_key(self, monkeypatch):
        """Test Google fails when API key is missing."""
        monkeypatch.delenv("GOOGLE_API_KEY", raising=False)
        with pytest.raises(LLMProviderError) as exc:
            get_llm("google_gemini", "gemini-pro")
        assert exc.value.provider == "google_gemini"
        assert "GOOGLE_API_KEY" in exc.value.error_detail


class TestGetLLMAzure:
    """Tests for Azure OpenAI provider."""

    def test_get_llm_azure_missing_api_key(self, monkeypatch):
        """Test Azure fails when API key is missing."""
        monkeypatch.delenv("AZURE_OPENAI_API_KEY", raising=False)
        monkeypatch.setenv("AZURE_OPENAI_ENDPOINT", "https://example.openai.azure.com/")
        with pytest.raises(LLMProviderError) as exc:
            get_llm("azure_openai", "gpt-4")
        assert exc.value.provider == "azure_openai"
        assert "AZURE_OPENAI_API_KEY" in exc.value.error_detail

    def test_get_llm_azure_missing_endpoint(self, monkeypatch):
        """Test Azure fails when endpoint is missing."""
        monkeypatch.setenv("AZURE_OPENAI_API_KEY", "test-key")
        monkeypatch.delenv("AZURE_OPENAI_ENDPOINT", raising=False)
        with pytest.raises(LLMProviderError) as exc:
            get_llm("azure_openai", "gpt-4")
        assert exc.value.provider == "azure_openai"
        assert "AZURE_OPENAI_ENDPOINT" in exc.value.error_detail


class TestGetLLMErrors:
    """Tests for error handling."""

    def test_get_llm_unknown_provider(self):
        """Test that unknown provider raises error."""
        with pytest.raises(LLMProviderError) as exc:
            get_llm("unknown_provider", "some-model")
        assert exc.value.provider == "unknown_provider"
        assert "Unknown provider" in exc.value.error_detail

    def test_llm_provider_error_attributes(self):
        """Test LLMProviderError attributes."""
        error = LLMProviderError(
            provider="test",
            model_id="model",
            error_detail="test error",
        )
        assert error.provider == "test"
        assert error.model_id == "model"
        assert error.error_detail == "test error"
        assert "test" in str(error)
        assert "model" in str(error)
