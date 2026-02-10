"""
Configurações do serviço AI
Carrega variáveis de ambiente com validação
"""

from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configurações do serviço AI."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # LangSmith
    langsmith_api_key: str = Field(default="", alias="LANGSMITH_API_KEY")
    langchain_tracing_v2: bool = Field(default=True, alias="LANGCHAIN_TRACING_V2")
    langchain_project: str = Field(default="tech-arauz", alias="LANGCHAIN_PROJECT")

    # LLM
    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")

    # Supabase
    supabase_url: str = Field(default="", alias="SUPABASE_URL")
    supabase_service_key: str = Field(default="", alias="SUPABASE_SERVICE_KEY")

    # Next.js
    nextjs_api_url: str = Field(
        default="http://localhost:3000/api", alias="NEXTJS_API_URL"
    )

    # App
    ai_service_port: int = Field(default=8000, alias="AI_SERVICE_PORT")
    ai_service_host: str = Field(default="0.0.0.0", alias="AI_SERVICE_HOST")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")

    # Observability
    obs_enabled: bool = Field(default=True, alias="OBS_ENABLED")
    obs_backend: str = Field(default="langsmith", alias="OBS_BACKEND")
    obs_pii_redact: bool = Field(default=True, alias="OBS_PII_REDACT")
    obs_log_level: str = Field(default="INFO", alias="OBS_LOG_LEVEL")
    obs_budget_session_usd: float = Field(default=0.50, alias="OBS_BUDGET_SESSION_USD")
    obs_budget_user_usd: float = Field(default=5.00, alias="OBS_BUDGET_USER_USD")
    obs_budget_agent_usd: float = Field(default=2.00, alias="OBS_BUDGET_AGENT_USD")

    @property
    def is_langsmith_enabled(self) -> bool:
        """Verifica se LangSmith está configurado."""
        return bool(self.langsmith_api_key) and self.langchain_tracing_v2


@lru_cache
def get_settings() -> Settings:
    """Retorna configurações (cached)."""
    return Settings()
