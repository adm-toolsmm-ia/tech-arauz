-- =============================================================================
-- Migration 042: AI Features Chat & 360° Dashboard
-- =============================================================================
-- OBJETIVO: Criar 11 tabelas de suporte para chat conversacional com agentes LLM,
-- observabilidade operacional, controle de budget, e rastreamento de deployments
--
-- Tabelas:
-- 1. agent_sessions (chat sessions)
-- 2. agent_messages (conversation turns)
-- 3. agent_run_steps (detailed execution steps)
-- 4. agent_budgets (monthly spend limits)
-- 5. agent_usage_daily (aggregated metrics)
-- 6. agent_deployments (version history)
-- 7. tools (tool definitions)
-- 8. agent_tool_bindings (agent-tool relationships)
-- 9. context_providers (context sources)
-- 10. agent_context_bindings (agent-context relationships)
-- 11. agent_feedback (user feedback on chat quality)
-- 12. lm_provider_accounts (LLM provider credentials)
--
-- ALTERs:
-- - agent_runs: ADD budget_limit_usd, session_id
-- - lm_models: ADD input_token_cost_usd, output_token_cost_usd, provider_account_id
--
-- Story: 4.1 — Database Foundation: Migration 042
-- Date: 2026-03-01
-- Author: Dara (Data Engineer)
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. CHAT TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS agent_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  user_id UUID,
  agent_id UUID,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  token_usage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_agent_sessions_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT fk_agent_sessions_agent FOREIGN KEY (agent_id) REFERENCES agent_runs(id) ON DELETE SET NULL,
  CONSTRAINT fk_agent_sessions_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_agent_sessions_tenant_agent_created
  ON agent_sessions(tenant_id, agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_tenant_status
  ON agent_sessions(tenant_id, status);

-- RLS Policy
ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agent_sessions_tenant_isolation ON agent_sessions;
CREATE POLICY agent_sessions_tenant_isolation ON agent_sessions
  USING (TRUE) WITH CHECK (TRUE);
COMMENT ON POLICY agent_sessions_tenant_isolation ON agent_sessions
  IS 'ADR-001: All tenant isolation enforced at application layer; RLS allows all for flexibility';

CREATE TABLE IF NOT EXISTS agent_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::JSONB,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_agent_messages_session FOREIGN KEY (session_id) REFERENCES agent_sessions(id) ON DELETE CASCADE,
  CONSTRAINT fk_agent_messages_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_agent_messages_session_created
  ON agent_messages(session_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_agent_messages_tenant_created
  ON agent_messages(tenant_id, created_at DESC);

ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agent_messages_tenant_isolation ON agent_messages;
CREATE POLICY agent_messages_tenant_isolation ON agent_messages
  USING (TRUE) WITH CHECK (TRUE);

CREATE TABLE IF NOT EXISTS agent_run_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  run_id UUID NOT NULL,
  step_type TEXT NOT NULL CHECK (step_type IN ('input', 'tool_call', 'observation', 'output')),
  input JSONB DEFAULT '{}'::JSONB,
  output JSONB DEFAULT '{}'::JSONB,
  metadata JSONB DEFAULT '{}'::JSONB,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_agent_run_steps_run FOREIGN KEY (run_id) REFERENCES agent_runs(id) ON DELETE CASCADE,
  CONSTRAINT fk_agent_run_steps_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_agent_run_steps_agent_run
  ON agent_run_steps(agent_id, run_id);
CREATE INDEX IF NOT EXISTS idx_agent_run_steps_tenant_created
  ON agent_run_steps(tenant_id, created_at DESC);

ALTER TABLE agent_run_steps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agent_run_steps_tenant_isolation ON agent_run_steps;
CREATE POLICY agent_run_steps_tenant_isolation ON agent_run_steps
  USING (TRUE) WITH CHECK (TRUE);

-- =============================================================================
-- 2. OBSERVABILITY TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS agent_budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  agent_id UUID NOT NULL,
  monthly_limit_usd NUMERIC(10, 2),
  current_month_spent_usd NUMERIC(10, 2) DEFAULT 0,
  reset_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_agent_budgets_agent FOREIGN KEY (agent_id) REFERENCES agent_runs(id) ON DELETE CASCADE,
  CONSTRAINT fk_agent_budgets_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_agent_budgets_tenant_agent
  ON agent_budgets(tenant_id, agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_budgets_reset_date
  ON agent_budgets(reset_date);

ALTER TABLE agent_budgets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agent_budgets_tenant_isolation ON agent_budgets;
CREATE POLICY agent_budgets_tenant_isolation ON agent_budgets
  USING (TRUE) WITH CHECK (TRUE);

CREATE TABLE IF NOT EXISTS agent_usage_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  agent_id UUID NOT NULL,
  date DATE NOT NULL,
  sessions_count INTEGER DEFAULT 0,
  messages_count INTEGER DEFAULT 0,
  cost_total_usd NUMERIC(10, 2) DEFAULT 0,
  avg_latency_ms NUMERIC(10, 2) DEFAULT 0,
  success_rate_pct NUMERIC(5, 2) DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_agent_usage_daily_agent FOREIGN KEY (agent_id) REFERENCES agent_runs(id) ON DELETE CASCADE,
  CONSTRAINT fk_agent_usage_daily_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE(tenant_id, agent_id, date)
);

CREATE INDEX IF NOT EXISTS idx_agent_usage_daily_tenant_agent_date
  ON agent_usage_daily(tenant_id, agent_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_agent_usage_daily_date
  ON agent_usage_daily(date DESC);

ALTER TABLE agent_usage_daily ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agent_usage_daily_tenant_isolation ON agent_usage_daily;
CREATE POLICY agent_usage_daily_tenant_isolation ON agent_usage_daily
  USING (TRUE) WITH CHECK (TRUE);

CREATE TABLE IF NOT EXISTS agent_deployments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  version TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('dev', 'staging', 'prod')),
  deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deployed_by UUID,
  config_hash TEXT,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed', 'rolled_back')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_agent_deployments_agent FOREIGN KEY (agent_id) REFERENCES agent_runs(id) ON DELETE CASCADE,
  CONSTRAINT fk_agent_deployments_deployed_by FOREIGN KEY (deployed_by) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT fk_agent_deployments_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_agent_deployments_agent_deployed_at
  ON agent_deployments(agent_id, deployed_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_deployments_tenant_env_status
  ON agent_deployments(tenant_id, environment, status);

ALTER TABLE agent_deployments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agent_deployments_tenant_isolation ON agent_deployments;
CREATE POLICY agent_deployments_tenant_isolation ON agent_deployments
  USING (TRUE) WITH CHECK (TRUE);

-- =============================================================================
-- 3. TOOLS & CONTEXT TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  tool_name TEXT NOT NULL,
  description TEXT,
  config_schema JSONB DEFAULT '{}'::JSONB,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_tools_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tools_tenant_name
  ON tools(tenant_id, tool_name);
CREATE INDEX IF NOT EXISTS idx_tools_enabled
  ON tools(enabled);

ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tools_tenant_isolation ON tools;
CREATE POLICY tools_tenant_isolation ON tools
  USING (TRUE) WITH CHECK (TRUE);

CREATE TABLE IF NOT EXISTS agent_tool_bindings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL,
  tool_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  config_overrides JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_agent_tool_bindings_agent FOREIGN KEY (agent_id) REFERENCES agent_runs(id) ON DELETE CASCADE,
  CONSTRAINT fk_agent_tool_bindings_tool FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE,
  CONSTRAINT fk_agent_tool_bindings_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_agent_tool_bindings_agent_enabled
  ON agent_tool_bindings(agent_id, enabled);
CREATE INDEX IF NOT EXISTS idx_agent_tool_bindings_tenant_agent
  ON agent_tool_bindings(tenant_id, agent_id);

ALTER TABLE agent_tool_bindings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agent_tool_bindings_tenant_isolation ON agent_tool_bindings;
CREATE POLICY agent_tool_bindings_tenant_isolation ON agent_tool_bindings
  USING (TRUE) WITH CHECK (TRUE);

CREATE TABLE IF NOT EXISTS context_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('sql', 'api', 'knowledge_base')),
  description TEXT,
  config JSONB DEFAULT '{}'::JSONB,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_context_providers_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_context_providers_tenant_type
  ON context_providers(tenant_id, provider_type);
CREATE INDEX IF NOT EXISTS idx_context_providers_enabled
  ON context_providers(enabled);

ALTER TABLE context_providers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS context_providers_tenant_isolation ON context_providers;
CREATE POLICY context_providers_tenant_isolation ON context_providers
  USING (TRUE) WITH CHECK (TRUE);

CREATE TABLE IF NOT EXISTS agent_context_bindings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL,
  context_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_agent_context_bindings_agent FOREIGN KEY (agent_id) REFERENCES agent_runs(id) ON DELETE CASCADE,
  CONSTRAINT fk_agent_context_bindings_context FOREIGN KEY (context_id) REFERENCES context_providers(id) ON DELETE CASCADE,
  CONSTRAINT fk_agent_context_bindings_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_agent_context_bindings_agent_priority
  ON agent_context_bindings(agent_id, priority);
CREATE INDEX IF NOT EXISTS idx_agent_context_bindings_tenant_agent
  ON agent_context_bindings(tenant_id, agent_id);

ALTER TABLE agent_context_bindings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agent_context_bindings_tenant_isolation ON agent_context_bindings;
CREATE POLICY agent_context_bindings_tenant_isolation ON agent_context_bindings
  USING (TRUE) WITH CHECK (TRUE);

-- =============================================================================
-- 4. FEEDBACK & LM ACCOUNTS TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS agent_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  feedback_type TEXT CHECK (feedback_type IN ('quality', 'accuracy', 'relevance', 'performance')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_agent_feedback_session FOREIGN KEY (session_id) REFERENCES agent_sessions(id) ON DELETE CASCADE,
  CONSTRAINT fk_agent_feedback_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_agent_feedback_session
  ON agent_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_feedback_tenant_created
  ON agent_feedback(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_feedback_type
  ON agent_feedback(feedback_type);

ALTER TABLE agent_feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agent_feedback_tenant_isolation ON agent_feedback;
CREATE POLICY agent_feedback_tenant_isolation ON agent_feedback
  USING (TRUE) WITH CHECK (TRUE);

CREATE TABLE IF NOT EXISTS lm_provider_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google', 'azure')),
  api_key_encrypted TEXT NOT NULL,
  account_identifier TEXT,
  monthly_spend_usd NUMERIC(10, 2) DEFAULT 0,
  quota_limit_usd NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_lm_provider_accounts_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_lm_provider_accounts_tenant_provider
  ON lm_provider_accounts(tenant_id, provider);

ALTER TABLE lm_provider_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS lm_provider_accounts_tenant_isolation ON lm_provider_accounts;
CREATE POLICY lm_provider_accounts_tenant_isolation ON lm_provider_accounts
  USING (TRUE) WITH CHECK (TRUE);

-- =============================================================================
-- 5. ALTER EXISTING TABLES
-- =============================================================================

ALTER TABLE agent_runs
  ADD COLUMN IF NOT EXISTS budget_limit_usd NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES agent_sessions(id) ON DELETE SET NULL;

ALTER TABLE lm_models
  ADD COLUMN IF NOT EXISTS input_token_cost_usd NUMERIC(12, 6),
  ADD COLUMN IF NOT EXISTS output_token_cost_usd NUMERIC(12, 6),
  ADD COLUMN IF NOT EXISTS provider_account_id UUID REFERENCES lm_provider_accounts(id) ON DELETE SET NULL;

-- =============================================================================
-- 6. AUDIT & COMMENTS
-- =============================================================================

COMMENT ON TABLE agent_sessions IS 'Chat session contexts per tenant, user, and agent';
COMMENT ON TABLE agent_messages IS 'Conversation turns (user messages and assistant responses)';
COMMENT ON TABLE agent_run_steps IS 'Detailed execution steps within agent runs (LCEL chain)';
COMMENT ON TABLE agent_budgets IS 'Monthly spend limits and current usage per agent/tenant';
COMMENT ON TABLE agent_usage_daily IS 'Daily aggregated metrics (sessions, messages, cost, latency, success rate)';
COMMENT ON TABLE agent_deployments IS 'Deployment history and versioning per agent';
COMMENT ON TABLE tools IS 'Tool definitions available to agents';
COMMENT ON TABLE agent_tool_bindings IS 'Which tools are enabled per agent with config overrides';
COMMENT ON TABLE context_providers IS 'Context sources (SQL, API, knowledge base) per tenant';
COMMENT ON TABLE agent_context_bindings IS 'Which context sources are used per agent, with priority';
COMMENT ON TABLE agent_feedback IS 'User feedback on chat quality (1-5 rating), type, and comments';
COMMENT ON TABLE lm_provider_accounts IS 'LLM provider credentials (OpenAI, Anthropic, Google, Azure) encrypted';

-- =============================================================================
-- 7. CALL AUDIT FUNCTION (Migration 040)
-- =============================================================================

SELECT audit_all_rls_policies();
