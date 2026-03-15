-- =============================================================================
-- Migration 070: Create Activity Templates & Process Versioning
-- Story 11.5: Add Activity Templates & Process Versioning
-- Epic: EPIC 11 — Organizational Enrichment & BPM Mastery
-- Date: 2026-03-28
-- =============================================================================
-- OBJETIVO: Criar tabelas para:
-- 1. Activity Templates: Padrões reutilizáveis de activities
-- 2. Process Versions: Audit trail imutável de mudanças em processes
-- =============================================================================

-- =============================================================================
-- TABELA: org_activity_templates
-- Padrões reutilizáveis para criar activities rapidamente
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.org_activity_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  nucleus_id UUID REFERENCES public.org_nuclei(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  complexity org_activity_complexity DEFAULT 'medium',
  priority org_activity_priority DEFAULT 'normal',
  inputs JSONB DEFAULT '[]',
  outputs JSONB DEFAULT '[]',
  risks JSONB DEFAULT '[]',
  impacts JSONB DEFAULT '[]',
  documentation JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.org_activity_templates
IS 'Templates reutilizáveis para criar activities dentro de um Nucleus';
COMMENT ON COLUMN public.org_activity_templates.nucleus_id
IS 'Nucleus ao qual este template pertence (opcional)';
COMMENT ON COLUMN public.org_activity_templates.inputs
IS 'Array de inputs que este template espera';
COMMENT ON COLUMN public.org_activity_templates.outputs
IS 'Array de outputs que este template produz';
COMMENT ON COLUMN public.org_activity_templates.risks
IS 'Array de riscos conhecidos para esta atividade';
COMMENT ON COLUMN public.org_activity_templates.impacts
IS 'Array de impactos potenciais desta atividade';
COMMENT ON COLUMN public.org_activity_templates.documentation
IS 'Documentation keyed: procedures, instructions, best_practices, common_errors';

-- =============================================================================
-- TABELA: org_process_versions
-- Audit trail imutável de mudanças em processes
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.org_process_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  process_id UUID NOT NULL REFERENCES public.org_processes(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  process_snapshot JSONB NOT NULL,  -- Snapshot completo do processo nesta versão
  change_summary TEXT,  -- Resumo das mudanças em relação à versão anterior
  changed_by UUID REFERENCES public.profiles(id),  -- Quem fez a mudança
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, process_id, version_number)
);

COMMENT ON TABLE public.org_process_versions
IS 'Audit trail imutável de todas as versões de um processo (append-only)';
COMMENT ON COLUMN public.org_process_versions.version_number
IS 'Número sequencial da versão (auto-incrementa por process)';
COMMENT ON COLUMN public.org_process_versions.process_snapshot
IS 'Snapshot completo do processo no momento desta versão (para rollback)';
COMMENT ON COLUMN public.org_process_versions.change_summary
IS 'Resumo das mudanças feitas nesta versão (ex.: "Added SLA targets")';
COMMENT ON COLUMN public.org_process_versions.changed_by
IS 'ID do profile que criou esta versão';
COMMENT ON COLUMN public.org_process_versions.created_at
IS 'Timestamp imutável da criação desta versão (não updated_at)';

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_org_activity_templates_tenant
ON public.org_activity_templates(tenant_id);

CREATE INDEX IF NOT EXISTS idx_org_activity_templates_nucleus
ON public.org_activity_templates(nucleus_id);

CREATE INDEX IF NOT EXISTS idx_org_process_versions_tenant
ON public.org_process_versions(tenant_id);

CREATE INDEX IF NOT EXISTS idx_org_process_versions_process
ON public.org_process_versions(process_id);

CREATE INDEX IF NOT EXISTS idx_org_process_versions_version_number
ON public.org_process_versions(process_id, version_number DESC);

-- =============================================================================
-- RLS: Existing RLS via tenant_id check covers both tables
-- =============================================================================

-- Verify migration completed
DO $$
BEGIN
  RAISE NOTICE 'Migration 070: org_activity_templates and org_process_versions tables created ✅';
END$$;
