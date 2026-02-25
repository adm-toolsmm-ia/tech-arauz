/**
 * @file Agent Configuration and Version Types
 * @description TypeScript definitions for AI Agents used in workflows.
 *
 * These types are shared between:
 * - Frontend (UI editor, validation)
 * - Backend API (request/response)
 * - Workflow runtime (LangChain/LangGraph, Phase 2)
 */

/**
 * LM Provider Definition (Tabela Auxiliar)
 * Describes AI model providers like OpenAI, Anthropic, etc.
 */
export interface LmProvider {
  id: string; // UUID
  tenant_id: string; // UUID
  name: string; // e.g., "OpenAI"
  slug: string; // e.g., "openai"
  description?: string;
  api_endpoint?: string; // e.g., "https://api.openai.com/v1"
  api_key_field_name?: string; // Name of the API key field
  icon_emoji?: string; // e.g., "🤖"
  color_hex?: string; // e.g., "#64748B"
  is_active: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

/**
 * LM Model Definition (Tabela Auxiliar)
 * Describes specific models within providers (e.g., GPT-4 under OpenAI)
 */
export interface LmModel {
  id: string; // UUID
  tenant_id: string; // UUID
  provider_id: string; // UUID reference to LmProvider
  name: string; // e.g., "GPT-4"
  model_id: string; // e.g., "gpt-4"
  description?: string;
  max_tokens?: number;
  default_temperature?: number; // 0-2
  input_cost_per_1k_tokens?: number;
  output_cost_per_1k_tokens?: number;
  is_active: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

/**
 * Agent Type Definition (Tabela Auxiliar)
 * Describes available agent types (e.g., "Status Report", "Requirements")
 * Tabelado no Supabase, gerenciável via UI
 */
export interface AgentType {
  id: string; // UUID
  tenant_id: string; // UUID
  name: string; // e.g., "Status Report"
  slug: string; // e.g., "status-report"
  description?: string; // e.g., "Agent for analyzing project status"
  icon_emoji?: string; // e.g., "📊"
  color_hex?: string; // e.g., "#3B82F6"
  is_active: boolean;
  is_system: boolean; // Cannot be deleted if TRUE
  default_model_provider?: string; // e.g., "openai"
  default_model_id?: string; // e.g., "gpt-4"
  default_temperature?: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

/**
 * Agent Template (Phase 4)
 * Reusable template for quick agent configuration
 */
export interface AgentTemplate {
  id: string; // UUID
  agent_type_id: string;
  name: string;
  slug: string;
  description?: string;
  persona_template?: string;
  prompt_objective_template?: string;
  prompt_instructions_template?: string[];
  prompt_examples?: Array<{ user: string; assistant: string }>;
  output_schema_template?: Record<string, unknown>;
  model_provider_default?: string;
  model_id_default?: string;
  model_temperature_default?: number;
  model_max_tokens_default?: number;
}

/**
 * Agent Variable Definition
 * Describes a template variable in the prompt_template
 */
export interface AgentVariable {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'enum' | 'array' | 'object';
  required: boolean;
  default?: unknown;
  enum?: string[];
  regex?: string;
  description?: string;
}

/**
 * Model/LLM Configuration
 */
export interface ModelConfig {
  provider: 'openai' | 'anthropic' | 'azure_openai' | 'other';
  model_id: string;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  stop_sequences?: string[];
  response_format?: 'text' | 'json';
  endpoint_overrides?: {
    base_url?: string;
    deployment_id?: string;
  };
}

/**
 * Prompt Configuration
 */
export interface PromptConfig {
  objective: string; // 1-2 sentences
  instructions: string[]; // bullets/array of instructions
  user_template: string; // template with {{variables}}
  persona?: string; // optional short persona
  examples?: Array<{ user: string; assistant: string }>;
  variables: AgentVariable[]; // derived from template
}

/**
 * Runtime Placeholders (Phase 2)
 * References to tools, context providers, memory options
 */
export interface RuntimePlaceholders {
  tool_ids?: string[];
  context_provider_ids?: string[];
  memory?: 'stateless' | 'stateful';
}

/**
 * Main Agent Configuration
 * Represents the current/draft state of an agent
 */
export interface AgentConfig {
  id: string; // UUID
  name: string;
  slug: string;
  description?: string;
  owners: string[]; // user IDs/emails
  tags?: string[];
  status: 'draft' | 'published' | 'deprecated';

  // Phase 4: Advanced Configuration
  agent_type?: string; // e.g., "projetos", "requisitos"
  agent_type_id?: string; // UUID reference to agent_types
  requirements?: string[]; // array of requirement descriptions
  configuration_meta?: Record<string, unknown>; // flexible config storage

  // Persona & Prompt
  persona?: string;
  prompt_objective: string;
  prompt_instructions: string[];
  prompt_template: string;

  // Output Validation
  output_schema?: Record<string, unknown>; // JSON Schema

  // Model/LLM
  model: ModelConfig;

  // Runtime (Phase 2)
  runtime_placeholders?: RuntimePlaceholders;

  // Validation
  requires_validation?: boolean;
  validation_rules?: Record<string, unknown>;
}

/**
 * Agent Version
 * Immutable snapshot of agent config at publication time
 */
export interface AgentVersion {
  id: string; // UUID
  agent_id: string;
  version: string; // semver: "1.0.0"
  status: 'published';

  // Full snapshot of config
  agent_config: AgentConfig;

  // Publication metadata
  commit_message?: string;
  change_reason?: string;
  breaking_change?: boolean;

  created_at: string; // ISO 8601
  created_by: string; // user ID
}

/**
 * Agent Head
 * Current state pointer (draft + published version)
 */
export interface AgentHead {
  id: string; // Same as agents.id
  name: string;
  slug: string;
  status: 'draft' | 'published' | 'deprecated';
  tags?: string[];
  model_id: string; // Quick access
  owners: string[];

  // Phase 4: Advanced Configuration
  agent_type?: string;
  execution_count?: number;
  last_execution_at?: string | null;

  // Version info
  current_version?: string; // null if only draft exists
  draft?: AgentConfig; // current draft state

  // Metadata
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

/**
 * Agent List Item
 * Lightweight type for list views
 */
export interface AgentListItem {
  id: string;
  name: string;
  slug: string;
  status: 'draft' | 'published' | 'deprecated';
  tags?: string[];
  model_id: string;
  current_version?: string;
  updated_at: string;
  owners: string[];
}

/**
 * Agent Run (Execution History)
 * Optional for MVP, useful for Phase 2
 */
export interface AgentRun {
  id: string;
  agent_id: string;
  agent_version?: string;
  tenant_id: string;

  input_data?: Record<string, unknown>;
  output_data?: Record<string, unknown>;
  status: 'running' | 'completed' | 'failed';
  error_message?: string;

  tokens_used?: number;
  cost_usd?: number;
  duration_ms?: number;

  created_at: string;
  completed_at?: string;
  created_by: string;
}

/**
 * Diff Result for Version Comparison
 */
export interface AgentDiff {
  modelChanged: boolean;
  promptChanged: boolean;
  ioChanged: boolean;
  breakingChange: boolean;
  details: Array<{
    field: string;
    oldValue?: unknown;
    newValue?: unknown;
  }>;
}

/**
 * API Request/Response Types
 */

export interface CreateAgentRequest {
  name: string;
  slug: string;
  description?: string;
  agent_type?: string;
  agent_type_id?: string;
  model_provider?: string;
  model_id?: string;
  model_temperature?: number;
  model_max_tokens?: number;
  persona?: string;
  prompt_objective?: string;
}

export interface UpdateAgentDraftRequest {
  name?: string;
  slug?: string;
  description?: string;
  owners?: string[];
  tags?: string[];
  agent_type?: string;
  agent_type_id?: string;
  requirements?: string[];
  configuration_meta?: Record<string, unknown>;
  persona?: string;
  prompt_objective?: string;
  prompt_instructions?: string[];
  prompt_template?: string;
  output_schema?: Record<string, unknown>;
  model?: ModelConfig;
  runtime_placeholders?: RuntimePlaceholders;
  validation_rules?: Record<string, unknown>;
}

export interface PublishAgentRequest {
  commit_message?: string;
  change_reason?: string;
}

export interface RollbackAgentRequest {
  target_version: string;
}

export interface ImportAgentRequest {
  agent_config: AgentConfig;
}

/**
 * Export Format
 * Canonical JSON format for consumption by workflows (Phase 2)
 */
export interface ExportedAgentSpec {
  agent_id: string;
  version: string;
  model: ModelConfig;
  prompt: Omit<PromptConfig, 'variables'> & {
    variables: AgentVariable[];
  };
  output_schema?: Record<string, unknown>;
  runtime_placeholders?: RuntimePlaceholders;
}
