-- =============================================================================
-- Migration 067: Create Activity-System Relationship Table
-- Story 11.2: Create Activity-System Relationship Table
-- Epic: EPIC 11 — Organizational Enrichment & BPM Mastery
-- Date: 2026-03-28
-- =============================================================================
-- OBJETIVO: Criar junction table para relacionamento Activity ↔ System (many-to-many)
-- Padrão: Alinha com org_process_systems (Process ↔ System)
-- =============================================================================

-- =============================================================================
-- TABELA: org_activity_systems
-- Many-to-many relationship entre Activities e Systems
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.org_activity_systems (
  activity_id UUID NOT NULL REFERENCES public.org_activities(id) ON DELETE CASCADE,
  system_id UUID NOT NULL REFERENCES public.org_systems(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  usage_context TEXT,  -- e.g., "data entry", "query lookup", "report generation"
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (activity_id, system_id)
);

COMMENT ON TABLE public.org_activity_systems
IS 'Maps systems used in activities (many-to-many relationship)';
COMMENT ON COLUMN public.org_activity_systems.usage_context
IS 'How the system is used in this activity (e.g., data entry, lookup, reporting)';

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_org_activity_systems_activity
ON public.org_activity_systems(activity_id);

CREATE INDEX IF NOT EXISTS idx_org_activity_systems_system
ON public.org_activity_systems(system_id);

CREATE INDEX IF NOT EXISTS idx_org_activity_systems_tenant
ON public.org_activity_systems(tenant_id);

-- =============================================================================
-- RLS: Existing RLS via tenant_id check covers this table
-- =============================================================================

-- Verify migration completed
DO $$
BEGIN
  RAISE NOTICE 'Migration 067: org_activity_systems junction table created ✅';
END$$;
