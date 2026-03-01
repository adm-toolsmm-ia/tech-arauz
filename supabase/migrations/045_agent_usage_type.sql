-- Migration: Add Agent Classification Fields (usage_type, show_in_shortcut, is_global_chatbot)
-- Description: Enable classification of agents as chatbots or workflows, and configure visibility
-- Epic: Épico 1 — Governança de Dados e Classificação de Agentes
-- Story: 1.1 — Migration 045: Classificação de Agentes
-- Created: 2026-03-01
-- Author: Claude (Dara)

-- =============================================================================
-- 1. Add Classification Columns to Agents Table
-- =============================================================================

-- usage_type: Classify agent as 'chatbot' (conversational) or 'workflow' (non-conversational)
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS usage_type TEXT NOT NULL DEFAULT 'chatbot'
  CHECK (usage_type IN ('chatbot', 'workflow'));

-- show_in_shortcut: Display in chatbot selector/shortcuts (only for chatbots)
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS show_in_shortcut BOOLEAN NOT NULL DEFAULT FALSE;

-- is_global_chatbot: Mark as the global floating chatbot (only one per tenant)
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS is_global_chatbot BOOLEAN NOT NULL DEFAULT FALSE;

-- =============================================================================
-- 2. Add Constraints for Business Rules
-- =============================================================================

-- Rule 1: is_global_chatbot = TRUE implies usage_type = 'chatbot'
ALTER TABLE agents
ADD CONSTRAINT agents_global_chatbot_must_be_chatbot
  CHECK (is_global_chatbot = FALSE OR usage_type = 'chatbot');

-- Rule 2: show_in_shortcut = TRUE implies usage_type = 'chatbot'
ALTER TABLE agents
ADD CONSTRAINT agents_shortcut_must_be_chatbot
  CHECK (show_in_shortcut = FALSE OR usage_type = 'chatbot');

-- Rule 3: At most one agent per tenant can be is_global_chatbot = TRUE
ALTER TABLE agents
ADD CONSTRAINT agents_only_one_global_chatbot_per_tenant
  EXCLUDE USING btree (tenant_id WITH =) WHERE (is_global_chatbot = TRUE);

-- =============================================================================
-- 3. Add Indexes for Query Performance
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_agents_usage_type ON agents(usage_type);
CREATE INDEX IF NOT EXISTS idx_agents_show_in_shortcut ON agents(show_in_shortcut) WHERE show_in_shortcut = TRUE;
CREATE INDEX IF NOT EXISTS idx_agents_is_global_chatbot ON agents(tenant_id, is_global_chatbot) WHERE is_global_chatbot = TRUE;
CREATE INDEX IF NOT EXISTS idx_agents_chatbot_discovery ON agents(tenant_id, status) WHERE usage_type = 'chatbot' AND status = 'published';

-- =============================================================================
-- 4. Update RLS Policies (Agents Table)
-- =============================================================================

-- Policy: Users can view/edit agents in their tenant
-- (Already exists, no change needed - ADR-001: simple USING (true) WITH CHECK (true) pattern)

-- =============================================================================
-- 5. Add Documentation Comments
-- =============================================================================

COMMENT ON COLUMN agents.usage_type IS 'Classification: chatbot (conversational interface) or workflow (background processing). Only chatbots can be used in chat interfaces.';
COMMENT ON COLUMN agents.show_in_shortcut IS 'If true, this chatbot appears in the chatbot selector. Only valid for usage_type=chatbot agents.';
COMMENT ON COLUMN agents.is_global_chatbot IS 'If true, this chatbot is the system-wide floating chatbot. Only one per tenant, and usage_type must be chatbot.';

-- =============================================================================
-- 6. Safety Verification (Documentation)
-- =============================================================================

-- After migration:
-- SELECT COUNT(*) FROM agents WHERE is_global_chatbot = TRUE GROUP BY tenant_id;
-- Should show <= 1 per tenant_id, enforced by constraint
--
-- SELECT COUNT(*) FROM agents WHERE show_in_shortcut = TRUE AND usage_type != 'chatbot';
-- Should return 0, enforced by constraint
--
-- SELECT COUNT(*) FROM agents WHERE is_global_chatbot = TRUE AND usage_type != 'chatbot';
-- Should return 0, enforced by constraint
