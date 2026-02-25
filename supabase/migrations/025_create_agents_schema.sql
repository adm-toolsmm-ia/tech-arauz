-- Migration: Create Agents Configuration Schema
-- Description: Tables and RLS policies for AI Agents configuration
-- Created: 2026-02-24
-- Author: Claude (Aria + Dara)

-- =============================================================================
-- 1. Main Agents Table (Draft + Published State)
-- =============================================================================

CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Identity & Governance
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  owners TEXT[] DEFAULT ARRAY[]::TEXT[],  -- array of user IDs/emails
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT DEFAULT 'draft',  -- 'draft', 'published', 'deprecated'
  
  -- Persona & Prompt Configuration
  persona TEXT,  -- short persona description (optional)
  prompt_objective TEXT,  -- 1-2 sentence objective
  prompt_instructions TEXT,  -- JSON array or newline-separated bullets
  prompt_template TEXT,  -- template with {{variable}} placeholders
  
  -- Output Validation
  output_schema JSONB,  -- JSON Schema for LLM output validation
  
  -- Model/LLM Configuration
  model_provider TEXT,  -- 'openai', 'anthropic', 'azure_openai', 'other'
  model_id TEXT,  -- e.g., 'gpt-4.1', 'claude-3-sonnet'
  model_temperature NUMERIC DEFAULT 0.7,
  model_top_p NUMERIC,
  model_max_tokens INTEGER,
  model_presence_penalty NUMERIC,
  model_frequency_penalty NUMERIC,
  model_stop_sequences TEXT[],
  model_response_format TEXT,  -- 'text' | 'json'
  model_endpoint_overrides JSONB,  -- { base_url, deployment_id } - NO SECRETS
  
  -- Runtime Placeholders (for future Phase 2)
  runtime_tool_ids TEXT[],  -- tool IDs only (references, no configs)
  runtime_context_provider_ids TEXT[],  -- context provider references
  runtime_memory TEXT DEFAULT 'stateless',  -- 'stateless' | 'stateful'
  
  -- Metadata
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  UNIQUE(tenant_id, slug)
);

CREATE INDEX idx_agents_tenant_id ON agents(tenant_id);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_created_at ON agents(created_at DESC);

-- =============================================================================
-- 2. Agent Versions Table (Immutable Snapshots)
-- =============================================================================

CREATE TABLE IF NOT EXISTS agent_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  version TEXT NOT NULL,  -- semver: "1.0.0"
  status TEXT DEFAULT 'published',
  
  -- Immutable snapshot of agent config at publication time
  agent_config JSONB NOT NULL,  -- Full AgentConfig snapshot
  
  -- Publication Metadata
  commit_message TEXT,
  change_reason TEXT,
  breaking_change BOOLEAN DEFAULT FALSE,  -- true if input/output_schema changed incompatibly
  
  created_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  UNIQUE(agent_id, version)
);

CREATE INDEX idx_agent_versions_agent_id ON agent_versions(agent_id);
CREATE INDEX idx_agent_versions_created_at ON agent_versions(created_at DESC);

-- =============================================================================
-- 3. Agent Variables Table (Prompt Template Variables)
-- =============================================================================

CREATE TABLE IF NOT EXISTS agent_variables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  type TEXT NOT NULL,  -- 'string', 'number', 'boolean', 'enum', 'array', 'object'
  required BOOLEAN DEFAULT FALSE,
  default_value JSONB,  -- any JSON-compatible value
  enum_values TEXT[],  -- only populated if type='enum'
  regex_pattern TEXT,  -- regex validation pattern
  description TEXT,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  -- Constraints
  UNIQUE(agent_id, key)
);

CREATE INDEX idx_agent_variables_agent_id ON agent_variables(agent_id);

-- =============================================================================
-- 4. Agent Runs Table (Execution History - Optional MVP, useful for Phase 2)
-- =============================================================================

CREATE TABLE IF NOT EXISTS agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id),
  agent_version TEXT,  -- reference to version used
  tenant_id UUID NOT NULL,
  
  input_data JSONB,
  output_data JSONB,
  status TEXT,  -- 'running', 'completed', 'failed'
  error_message TEXT,
  tokens_used INTEGER,
  cost_usd NUMERIC,
  duration_ms INTEGER,
  
  created_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP,
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_agent_runs_agent_id ON agent_runs(agent_id);
CREATE INDEX idx_agent_runs_tenant_id ON agent_runs(tenant_id);
CREATE INDEX idx_agent_runs_created_at ON agent_runs(created_at DESC);

-- =============================================================================
-- 5. Enable RLS (Row-Level Security)
-- =============================================================================

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 6. RLS Policies - Agents Table
-- =============================================================================

-- Policy: Users can view/edit agents in their tenant
CREATE POLICY agents_tenant_isolation ON agents
  USING (tenant_id = get_user_tenant_id())
  WITH CHECK (tenant_id = get_user_tenant_id());

-- Policy: Editors can update agents in their tenant
CREATE POLICY agents_editor_update ON agents
  FOR UPDATE
  USING (tenant_id = get_user_tenant_id())
  WITH CHECK (tenant_id = get_user_tenant_id());

-- Policy: Editors can insert agents in their tenant
CREATE POLICY agents_editor_insert ON agents
  FOR INSERT
  WITH CHECK (tenant_id = get_user_tenant_id());

-- =============================================================================
-- 7. RLS Policies - Agent Versions Table
-- =============================================================================

-- Policy: Users can view versions in their tenant (via agent)
CREATE POLICY agent_versions_tenant_isolation ON agent_versions
  USING (
    EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = agent_versions.agent_id
      AND agents.tenant_id = get_user_tenant_id()
    )
  );

-- Policy: Editors can insert versions in their tenant
CREATE POLICY agent_versions_editor_insert ON agent_versions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = agent_versions.agent_id
      AND agents.tenant_id = get_user_tenant_id()
    )
  );

-- =============================================================================
-- 8. RLS Policies - Agent Variables Table
-- =============================================================================

-- Policy: Users can view/edit variables in their tenant (via agent)
CREATE POLICY agent_variables_tenant_isolation ON agent_variables
  USING (
    EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = agent_variables.agent_id
      AND agents.tenant_id = get_user_tenant_id()
    )
  );

-- =============================================================================
-- 9. RLS Policies - Agent Runs Table
-- =============================================================================

-- Policy: Users can view runs in their tenant
CREATE POLICY agent_runs_tenant_isolation ON agent_runs
  USING (tenant_id = get_user_tenant_id());

-- Policy: Service role can insert runs (for Phase 2 integration)
CREATE POLICY agent_runs_service_insert ON agent_runs
  FOR INSERT
  WITH CHECK (true);  -- Controlled via service role checks in API

-- =============================================================================
-- 10. Comments (Documentation)
-- =============================================================================

COMMENT ON TABLE agents IS 'Configuration for AI agents used in workflows. Draft state is mutable, published versions are immutable.';
COMMENT ON COLUMN agents.slug IS 'Unique agent identifier within tenant, kebab-case (a-z, 0-9, -)';
COMMENT ON COLUMN agents.status IS 'Lifecycle: draft (editable), published (immutable), deprecated (hidden)';
COMMENT ON COLUMN agents.prompt_template IS 'Template with {{variable}} placeholders matching agent_variables.key';
COMMENT ON COLUMN agents.model_endpoint_overrides IS 'Metadata only (base_url, deployment_id for Azure, etc). No secrets.';
COMMENT ON COLUMN agent_versions.agent_config IS 'Full snapshot of agents row at publication time. Used by workflows in Phase 2.';
COMMENT ON COLUMN agent_versions.breaking_change IS 'Auto-set to true if input/output_schema changed incompatibly from previous version.';
