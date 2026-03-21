/**
 * @file Agent Transformers
 * @description Convert database agent records to UI format
 * Follows the pattern used in projects module
 */

export interface DBAgent {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description: string | null;
  status: 'draft' | 'published' | 'deprecated';
  owners: string[];
  tags: string[];
  persona: string | null;
  prompt_objective: string | null;
  prompt_instructions: string | null;
  prompt_template: string | null;
  output_schema: Record<string, unknown> | null;
  model_provider: string | null;
  model_id: string;
  model_temperature: number;
  model_max_tokens: number;
  model_top_p: number | null;
  model_presence_penalty: number | null;
  model_frequency_penalty: number | null;
  model_stop_sequences: string[] | null;
  model_response_format: string | null;
  model_endpoint_overrides: Record<string, unknown> | null;
  agent_type: string | null;
  agent_type_id: string | null;
  /** agent | squad (migration 073) */
  entity_kind?: string | null;
  // Story 7.8: Classification fields
  usage_type?: 'chatbot' | 'workflow';
  show_in_shortcut?: boolean;
  is_global_chatbot?: boolean;
  // Configuration
  requirements: string[] | null;
  configuration_meta: Record<string, unknown> | null;
  template_id: string | null;
  is_template: boolean;
  requires_validation: boolean;
  validation_rules: Record<string, unknown> | null;
  execution_count: number;
  last_execution_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface UIAgent {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: 'draft' | 'published' | 'deprecated';
  owners: string[];
  tags: string[];
  modelId: string;
  agentType: string;
  agentTypeId: string | null;
  entityKind: 'agent' | 'squad';
  // Story 7.8: Classification fields
  usageType?: 'chatbot' | 'workflow';
  showInShortcut?: boolean;
  isGlobalChatbot?: boolean;
  // Metadata
  updatedAt: string;
  createdAt: string;
  executionCount: number;
  lastExecutionAt: string | null;
  isTemplate: boolean;
  // Full config for edit page
  fullConfig: {
    persona: string | null;
    promptObjective: string | null;
    promptInstructions: string[] | null;
    promptTemplate: string | null;
    outputSchema: Record<string, unknown> | null;
    modelProvider: string;
    modelTemperature: number;
    modelMaxTokens: number;
    requirements: string[] | null;
    configurationMeta: Record<string, unknown> | null;
    requiresValidation: boolean;
    validationRules: Record<string, unknown> | null;
  };
}

function parsePromptInstructions(value: string | null | undefined): string[] {
  if (!value) return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return trimmed
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

export function dbAgentToUI(dbAgent: DBAgent): UIAgent {
  return {
    id: dbAgent.id,
    name: dbAgent.name,
    slug: dbAgent.slug,
    description: dbAgent.description || '',
    status: dbAgent.status,
    owners: dbAgent.owners,
    tags: dbAgent.tags,
    modelId: dbAgent.model_id,
    agentType: dbAgent.agent_type || 'custom',
    agentTypeId: dbAgent.agent_type_id,
    entityKind: dbAgent.entity_kind === 'squad' ? 'squad' : 'agent',
    // Story 7.8: Classification fields
    usageType: dbAgent.usage_type || 'chatbot',
    showInShortcut: dbAgent.show_in_shortcut || false,
    isGlobalChatbot: dbAgent.is_global_chatbot || false,
    // Metadata
    updatedAt: dbAgent.updated_at,
    createdAt: dbAgent.created_at,
    executionCount: dbAgent.execution_count,
    lastExecutionAt: dbAgent.last_execution_at,
    isTemplate: dbAgent.is_template,
    // Full config for edit page
    fullConfig: {
      persona: dbAgent.persona,
      promptObjective: dbAgent.prompt_objective,
      promptInstructions: parsePromptInstructions(dbAgent.prompt_instructions),
      promptTemplate: dbAgent.prompt_template,
      outputSchema: dbAgent.output_schema,
      modelProvider: dbAgent.model_provider || 'openai',
      modelTemperature: dbAgent.model_temperature,
      modelMaxTokens: dbAgent.model_max_tokens,
      requirements: dbAgent.requirements,
      configurationMeta: dbAgent.configuration_meta,
      requiresValidation: dbAgent.requires_validation,
      validationRules: dbAgent.validation_rules,
    },
  };
}

export function dbAgentsToUI(dbAgents: DBAgent[]): UIAgent[] {
  return dbAgents.map(dbAgentToUI);
}
