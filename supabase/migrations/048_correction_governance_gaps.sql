-- =============================================================================
-- Migration 048: Correção de Gaps Críticos — Governança e Segurança
-- =============================================================================
-- GAP 1: Reprodutibilidade em agent_runs (snapshot de execução)
-- GAP 2: usage_type — JÁ RESOLVIDO em migration 045 (CHECK existe)
-- GAP 3: RLS agent_messages — isolamento por usuário (session.user_id = auth.uid())
-- FIX: message_count em agent_sessions (API /api/sessions depende; coluna inexistente)
--
-- Epic: Governança Corporativa 10/10
-- Story: Correção de Gaps Críticos
-- Created: 2026-03-01
-- =============================================================================

-- =============================================================================
-- FIX: message_count em agent_sessions (pré-requisito para /api/sessions)
-- =============================================================================

ALTER TABLE agent_sessions
  ADD COLUMN IF NOT EXISTS message_count INTEGER NOT NULL DEFAULT 0;

-- Trigger: incrementar message_count ao inserir em agent_messages
CREATE OR REPLACE FUNCTION agent_sessions_increment_message_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE agent_sessions SET message_count = message_count + 1 WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_agent_messages_increment_count ON agent_messages;
CREATE TRIGGER trg_agent_messages_increment_count
  AFTER INSERT ON agent_messages
  FOR EACH ROW EXECUTE FUNCTION agent_sessions_increment_message_count();

-- Trigger: decrementar message_count ao deletar de agent_messages
CREATE OR REPLACE FUNCTION agent_sessions_decrement_message_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE agent_sessions SET message_count = GREATEST(0, message_count - 1) WHERE id = OLD.session_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_agent_messages_decrement_count ON agent_messages;
CREATE TRIGGER trg_agent_messages_decrement_count
  AFTER DELETE ON agent_messages
  FOR EACH ROW EXECUTE FUNCTION agent_sessions_decrement_message_count();

-- Backfill: atualizar message_count para sessões existentes
UPDATE agent_sessions s
SET message_count = COALESCE(
  (SELECT COUNT(*) FROM agent_messages m WHERE m.session_id = s.id),
  0
);

COMMENT ON COLUMN agent_sessions.message_count IS 'Contagem de mensagens na sessão; mantida via trigger em agent_messages.';

-- =============================================================================
-- GAP 1: Adicionar campos de snapshot em agent_runs
-- =============================================================================

ALTER TABLE agent_runs
  ADD COLUMN IF NOT EXISTS model_id UUID REFERENCES lm_models(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES lm_providers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS agent_version_id UUID REFERENCES agent_versions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS temperature NUMERIC,
  ADD COLUMN IF NOT EXISTS top_p NUMERIC,
  ADD COLUMN IF NOT EXISTS max_tokens INTEGER,
  ADD COLUMN IF NOT EXISTS prompt_final TEXT;

CREATE INDEX IF NOT EXISTS idx_agent_runs_model_id ON agent_runs(model_id) WHERE model_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agent_runs_provider_id ON agent_runs(provider_id) WHERE provider_id IS NOT NULL;

COMMENT ON COLUMN agent_runs.model_id IS 'Snapshot: modelo LLM executado (FK lm_models). Preservado mesmo se modelo deprecated.';
COMMENT ON COLUMN agent_runs.provider_id IS 'Snapshot: provedor LLM executado (FK lm_providers).';
COMMENT ON COLUMN agent_runs.agent_version_id IS 'Snapshot: versão do agente utilizada (FK agent_versions).';
COMMENT ON COLUMN agent_runs.temperature IS 'Snapshot: parâmetro temperature da execução.';
COMMENT ON COLUMN agent_runs.top_p IS 'Snapshot: parâmetro top_p da execução.';
COMMENT ON COLUMN agent_runs.max_tokens IS 'Snapshot: parâmetro max_tokens da execução.';
COMMENT ON COLUMN agent_runs.prompt_final IS 'Snapshot: prompt final efetivamente enviado ao modelo (reprodutibilidade).';

-- =============================================================================
-- GAP 3: RLS agent_messages — isolamento por usuário
-- =============================================================================

DROP POLICY IF EXISTS agent_messages_tenant_isolation ON agent_messages;

CREATE POLICY agent_messages_user_session_isolation ON agent_messages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM agent_sessions s
      WHERE s.id = agent_messages.session_id AND s.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agent_sessions s
      WHERE s.id = agent_messages.session_id AND s.user_id = auth.uid()
    )
  );

COMMENT ON POLICY agent_messages_user_session_isolation ON agent_messages
  IS 'Usuário só acessa mensagens de sessões que pertencem a ele (agent_sessions.user_id = auth.uid()). service_role bypassa RLS.';
