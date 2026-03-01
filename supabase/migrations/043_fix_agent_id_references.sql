-- =============================================================================
-- Migration 043: Fix agent_id References — agent_runs(id) → agents(id)
-- =============================================================================
-- OBJETIVO: Corrigir semântica de agent_id em tabelas onde a referência deve ser
-- à definição do agente (agents.id), não à execução (agent_runs.id).
--
-- Tabelas afetadas:
-- - agent_sessions, agent_budgets, agent_usage_daily, agent_deployments,
--   agent_tool_bindings, agent_context_bindings
--
-- Story: 4.7 — Migration 043: Correção agent_id para agents(id)
-- Date: 2026-03-01
-- Author: Dara (Data Engineer)
-- =============================================================================

-- =============================================================================
-- 1. agent_sessions: agent_id → agents(id)
-- =============================================================================

-- Migrate existing data: map run_id to agents.id via agent_runs.agent_id
UPDATE agent_sessions s
SET agent_id = r.agent_id
FROM agent_runs r
WHERE s.agent_id = r.id
  AND s.agent_id IS NOT NULL;

-- Drop old FK, add new FK
ALTER TABLE agent_sessions DROP CONSTRAINT IF EXISTS fk_agent_sessions_agent;
ALTER TABLE agent_sessions
  ADD CONSTRAINT fk_agent_sessions_agent
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL;

COMMENT ON COLUMN agent_sessions.agent_id IS 'FK to agents(id) — session belongs to this agent definition';

-- =============================================================================
-- 2. agent_budgets: agent_id → agents(id)
-- =============================================================================

-- Migrate: map run_id to agents.id
UPDATE agent_budgets b
SET agent_id = r.agent_id
FROM agent_runs r
WHERE b.agent_id = r.id;

-- Remove duplicates: keep one row per (tenant_id, agent_id), prefer non-zero limits
DELETE FROM agent_budgets a
USING agent_budgets b
WHERE a.tenant_id = b.tenant_id
  AND a.agent_id = b.agent_id
  AND a.id > b.id;

ALTER TABLE agent_budgets DROP CONSTRAINT IF EXISTS fk_agent_budgets_agent;
ALTER TABLE agent_budgets
  ADD CONSTRAINT fk_agent_budgets_agent
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE;

COMMENT ON COLUMN agent_budgets.agent_id IS 'FK to agents(id) — budget per agent definition';

-- =============================================================================
-- 3. agent_usage_daily: agent_id → agents(id)
-- =============================================================================

-- Aggregate by (tenant_id, agents.id, date) — multiple runs per agent/day become one row
CREATE TEMP TABLE agent_usage_daily_migrated AS
SELECT
  d.tenant_id,
  r.agent_id AS agent_id,
  d.date,
  COALESCE(SUM(d.sessions_count), 0)::INTEGER AS sessions_count,
  COALESCE(SUM(d.messages_count), 0)::INTEGER AS messages_count,
  COALESCE(SUM(d.cost_total_usd), 0)::NUMERIC(10, 2) AS cost_total_usd,
  CASE WHEN COUNT(*) > 0 THEN AVG(d.avg_latency_ms) ELSE 0 END::NUMERIC(10, 2) AS avg_latency_ms,
  CASE WHEN COUNT(*) > 0 THEN AVG(d.success_rate_pct) ELSE 100 END::NUMERIC(5, 2) AS success_rate_pct,
  MIN(d.created_at) AS created_at
FROM agent_usage_daily d
JOIN agent_runs r ON d.agent_id = r.id
GROUP BY d.tenant_id, r.agent_id, d.date;

-- Replace data
DELETE FROM agent_usage_daily;
INSERT INTO agent_usage_daily (tenant_id, agent_id, date, sessions_count, messages_count, cost_total_usd, avg_latency_ms, success_rate_pct, created_at)
SELECT tenant_id, agent_id, date, sessions_count, messages_count, cost_total_usd, avg_latency_ms, success_rate_pct, created_at
FROM agent_usage_daily_migrated;

ALTER TABLE agent_usage_daily DROP CONSTRAINT IF EXISTS fk_agent_usage_daily_agent;
ALTER TABLE agent_usage_daily
  ADD CONSTRAINT fk_agent_usage_daily_agent
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE;

COMMENT ON COLUMN agent_usage_daily.agent_id IS 'FK to agents(id) — daily metrics per agent definition';

-- =============================================================================
-- 4. agent_deployments: agent_id → agents(id)
-- =============================================================================

UPDATE agent_deployments d
SET agent_id = r.agent_id
FROM agent_runs r
WHERE d.agent_id = r.id;

-- Remove duplicates: keep most recent per (tenant_id, agent_id, version, environment)
DELETE FROM agent_deployments a
USING agent_deployments b
WHERE a.tenant_id = b.tenant_id
  AND a.agent_id = b.agent_id
  AND a.version = b.version
  AND a.environment = b.environment
  AND a.deployed_at < b.deployed_at;

ALTER TABLE agent_deployments DROP CONSTRAINT IF EXISTS fk_agent_deployments_agent;
ALTER TABLE agent_deployments
  ADD CONSTRAINT fk_agent_deployments_agent
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE;

COMMENT ON COLUMN agent_deployments.agent_id IS 'FK to agents(id) — deployment history per agent definition';

-- =============================================================================
-- 5. agent_tool_bindings: agent_id → agents(id)
-- =============================================================================

UPDATE agent_tool_bindings b
SET agent_id = r.agent_id
FROM agent_runs r
WHERE b.agent_id = r.id;

-- Remove duplicates: keep one per (tenant_id, agent_id, tool_id)
DELETE FROM agent_tool_bindings a
USING agent_tool_bindings b
WHERE a.tenant_id = b.tenant_id
  AND a.agent_id = b.agent_id
  AND a.tool_id = b.tool_id
  AND a.id > b.id;

ALTER TABLE agent_tool_bindings DROP CONSTRAINT IF EXISTS fk_agent_tool_bindings_agent;
ALTER TABLE agent_tool_bindings
  ADD CONSTRAINT fk_agent_tool_bindings_agent
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE;

COMMENT ON COLUMN agent_tool_bindings.agent_id IS 'FK to agents(id) — tool bindings per agent definition';

-- =============================================================================
-- 6. agent_context_bindings: agent_id → agents(id)
-- =============================================================================

UPDATE agent_context_bindings b
SET agent_id = r.agent_id
FROM agent_runs r
WHERE b.agent_id = r.id;

-- Remove duplicates: keep one per (tenant_id, agent_id, context_id)
DELETE FROM agent_context_bindings a
USING agent_context_bindings b
WHERE a.tenant_id = b.tenant_id
  AND a.agent_id = b.agent_id
  AND a.context_id = b.context_id
  AND a.id > b.id;

ALTER TABLE agent_context_bindings DROP CONSTRAINT IF EXISTS fk_agent_context_bindings_agent;
ALTER TABLE agent_context_bindings
  ADD CONSTRAINT fk_agent_context_bindings_agent
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE;

COMMENT ON COLUMN agent_context_bindings.agent_id IS 'FK to agents(id) — context bindings per agent definition';

-- =============================================================================
-- 7. AUDIT
-- =============================================================================

SELECT audit_all_rls_policies();
