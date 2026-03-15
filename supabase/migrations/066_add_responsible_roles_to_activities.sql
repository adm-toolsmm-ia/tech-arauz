-- =============================================================================
-- Migration 066: Add responsible_roles to org_activities
-- Story 11.1: Add responsible_roles to Activities (DB)
-- Epic: EPIC 11 — Organizational Enrichment & BPM Mastery
-- Date: 2026-03-28
-- =============================================================================
-- OBJETIVO: Estender org_activities para suportar responsible_roles JSONB
-- Padrão: Alinha com Stories 10.1 (suppliers, services, documents)
-- =============================================================================

-- =============================================================================
-- TABELA: org_activities
-- =============================================================================

ALTER TABLE public.org_activities
ADD COLUMN responsible_roles JSONB DEFAULT '[]' NOT NULL;

COMMENT ON COLUMN public.org_activities.responsible_roles
IS 'Array of roles responsible for executing this activity (e.g., ["advogado", "analista_senior", "coordenador"])';

-- =============================================================================
-- CREATE INDEX
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_org_activities_responsible_roles_gin
ON public.org_activities USING GIN(responsible_roles);

-- =============================================================================
-- RLS: Existing RLS via tenant_id check covers new column
-- =============================================================================

-- Verify migration completed
DO $$
BEGIN
  RAISE NOTICE 'Migration 066: responsible_roles column added to org_activities with GIN index ✅';
END$$;
