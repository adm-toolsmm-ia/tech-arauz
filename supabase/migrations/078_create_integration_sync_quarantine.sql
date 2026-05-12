-- =============================================================================
-- Migration 078: Integration Sync Quarantine Table
-- Created: 2026-05-12
-- Description:
--   Creates integration_sync_quarantine table for isolating invalid records
--   during Espaider v2 sync (and any future integration sync flows).
--   Invalid records are stored with raw payload and traceable reason instead
--   of being silently dropped.
-- Story: 19.5
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.integration_sync_quarantine (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  request_id    TEXT        NOT NULL,
  dataset       TEXT        NOT NULL,
  stage         TEXT        NOT NULL,
  raw_payload   JSONB       NOT NULL,
  reason        TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.integration_sync_quarantine IS
  'Invalid records isolated during integration sync runs. Includes raw payload and reason for traceability. Reprocess or discard manually after investigation.';

COMMENT ON COLUMN public.integration_sync_quarantine.request_id IS
  'Correlation ID from the sync run that isolated this record';
COMMENT ON COLUMN public.integration_sync_quarantine.dataset IS
  'Source dataset identifier (e.g. BI_SOLICITACOES_PROJETOSESPAIDER_v2, HISTORICOS)';
COMMENT ON COLUMN public.integration_sync_quarantine.stage IS
  'Stage where the record was rejected: validation | mapping | persistence';
COMMENT ON COLUMN public.integration_sync_quarantine.raw_payload IS
  'Original record as received from the API, before any transformation';
COMMENT ON COLUMN public.integration_sync_quarantine.reason IS
  'Human-readable explanation of why the record was quarantined';

-- Performance index for operations dashboard queries
CREATE INDEX IF NOT EXISTS idx_quarantine_tenant_id
  ON public.integration_sync_quarantine(tenant_id);

CREATE INDEX IF NOT EXISTS idx_quarantine_request_id
  ON public.integration_sync_quarantine(request_id);

CREATE INDEX IF NOT EXISTS idx_quarantine_dataset
  ON public.integration_sync_quarantine(dataset);

CREATE INDEX IF NOT EXISTS idx_quarantine_created_at
  ON public.integration_sync_quarantine(created_at DESC);

-- Row Level Security
ALTER TABLE public.integration_sync_quarantine ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quarantine: tenant isolation select"
  ON public.integration_sync_quarantine FOR SELECT
  TO authenticated
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "quarantine: service role full access"
  ON public.integration_sync_quarantine FOR ALL
  TO service_role
  USING (true);
