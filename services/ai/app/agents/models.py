"""
Pydantic models for Agent Configuration
Shared between frontend (TypeScript) and backend (Python)
"""

from datetime import datetime
from typing import Any, Optional
from enum import Enum

from pydantic import BaseModel, Field


class AgentVariableModel(BaseModel):
    """Agent template variable definition"""
    key: str
    type: str  # 'string', 'number', 'boolean', 'enum', 'array', 'object'
    required: bool = False
    default: Optional[Any] = None
    enum: Optional[list[str]] = None
    regex: Optional[str] = None
    description: Optional[str] = None


class ModelConfigModel(BaseModel):
    """LLM/Model configuration"""
    provider: str  # 'openai', 'anthropic', 'azure_openai', 'other'
    model_id: str
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = None
    max_tokens: Optional[int] = None
    presence_penalty: Optional[float] = None
    frequency_penalty: Optional[float] = None
    stop_sequences: Optional[list[str]] = None
    response_format: Optional[str] = None  # 'text' | 'json'
    endpoint_overrides: Optional[dict[str, Any]] = None


class PromptConfigModel(BaseModel):
    """Prompt configuration"""
    objective: str
    instructions: list[str]
    user_template: str
    persona: Optional[str] = None
    examples: Optional[list[dict[str, str]]] = None
    variables: list[AgentVariableModel] = []


class RuntimePlaceholdersModel(BaseModel):
    """Runtime placeholders (Phase 2+)"""
    tool_ids: Optional[list[str]] = None
    context_provider_ids: Optional[list[str]] = None
    memory: Optional[str] = "stateless"


class AgentConfigModel(BaseModel):
    """Main agent configuration"""
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    owners: list[str]
    tags: Optional[list[str]] = None
    status: str  # 'draft', 'published', 'deprecated'
    
    # Agent Type & Classification (NEW)
    agent_type: Optional[str] = None  # e.g., 'projetos', 'requisitos'
    agent_type_id: Optional[str] = None
    is_template: bool = False
    usage_type: Optional[str] = "chatbot"  # chatbot | workflow
    
    # Prompt & Persona Configuration
    persona: Optional[str] = None
    prompt_objective: str
    prompt_instructions: list[str]
    prompt_template: str
    output_schema: Optional[dict[str, Any]] = None
    requirements: Optional[list[str]] = None  # Array of requirements (NEW)
    
    # Model Configuration
    model: ModelConfigModel
    runtime_placeholders: Optional[RuntimePlaceholdersModel] = None
    
    # Validation & Metadata (NEW)
    requires_validation: bool = True
    validation_rules: Optional[dict[str, Any]] = None
    configuration_meta: Optional[dict[str, Any]] = None


class AgentVersionModel(BaseModel):
    """Immutable agent version snapshot"""
    id: str
    agent_id: str
    version: str  # semver: "1.0.0"
    status: str = "published"
    agent_config: AgentConfigModel
    commit_message: Optional[str] = None
    change_reason: Optional[str] = None
    breaking_change: bool = False
    created_at: datetime
    created_by: str


class AgentHeadModel(BaseModel):
    """Current state pointer for agent"""
    id: str
    name: str
    slug: str
    status: str
    tags: Optional[list[str]] = None
    model_id: str
    owners: list[str]
    agent_type: Optional[str] = None  # NEW
    current_version: Optional[str] = None  # null if only draft
    draft: Optional[AgentConfigModel] = None
    created_at: datetime
    updated_at: datetime
    created_by: str
    updated_by: str
    execution_count: int = 0  # NEW
    last_execution_at: Optional[datetime] = None  # NEW


class CreateAgentRequest(BaseModel):
    """Create new agent request"""
    name: str
    slug: str
    description: Optional[str] = None
    agent_type: Optional[str] = None  # NEW: e.g., 'projetos'
    agent_type_id: Optional[str] = None  # NEW


class UpdateAgentDraftRequest(BaseModel):
    """Update agent draft request"""
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    owners: Optional[list[str]] = None
    tags: Optional[list[str]] = None
    agent_type: Optional[str] = None  # NEW
    persona: Optional[str] = None
    prompt_objective: Optional[str] = None
    prompt_instructions: Optional[list[str]] = None
    prompt_template: Optional[str] = None
    output_schema: Optional[dict[str, Any]] = None
    requirements: Optional[list[str]] = None  # NEW
    model: Optional[ModelConfigModel] = None
    runtime_placeholders: Optional[RuntimePlaceholdersModel] = None
    validation_rules: Optional[dict[str, Any]] = None  # NEW
    configuration_meta: Optional[dict[str, Any]] = None  # NEW


class PublishAgentRequest(BaseModel):
    """Publish agent draft request"""
    commit_message: Optional[str] = None
    change_reason: Optional[str] = None


class RollbackAgentRequest(BaseModel):
    """Rollback to previous version request"""
    target_version: str


# =============================================================================
# Agent Types & Templates
# =============================================================================

class AgentTypeModel(BaseModel):
    """Agent type definition"""
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    required_fields: Optional[list[str]] = None
    recommended_fields: Optional[list[str]] = None


class AgentTemplateModel(BaseModel):
    """Reusable template for agent configuration"""
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    agent_type_id: str
    persona_template: Optional[str] = None
    prompt_objective_template: Optional[str] = None
    prompt_instructions_template: Optional[list[str]] = None
    output_schema_template: Optional[dict[str, Any]] = None
    model_provider_default: str = "openai"
    model_id_default: str = "gpt-4"
    model_temperature_default: float = 0.7
    model_max_tokens_default: int = 2000
    usage_count: int = 0


class PaginatedResponse(BaseModel):
    """Generic paginated response"""
    items: list[Any]
    total: int
    page: int
    page_size: int
    has_next: bool
