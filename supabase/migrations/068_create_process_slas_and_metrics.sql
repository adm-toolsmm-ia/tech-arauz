-- =============================================================================
-- Migration 068: Create Process SLAs & Metrics Tables
-- Story 11.3: Create Process SLAs & Metrics Table
-- Epic: EPIC 11 — Organizational Enrichment & BPM Mastery
-- Date: 2026-03-28
-- =============================================================================
-- OBJETIVO: Criar tabelas para SLA definitions e métricas de performance
-- SLAs: configuração (o que esperamos)
-- Metrics: observação (o que aconteceu)
-- =============================================================================

-- =============================================================================
-- TABELA: org_process_slas
-- Define os SLAs (Service Level Agreements) para processos
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.org_process_slas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  process_id UUID NOT NULL REFERENCES public.org_processes(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  target_duration_days INTEGER NOT NULL,
  warning_threshold_pct DECIMAL(5,2) DEFAULT 80.00,
  critical_threshold_pct DECIMAL(5,2) DEFAULT 95.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, process_id, metric_name)
);

COMMENT ON TABLE public.org_process_slas
IS 'Service Level Agreements (SLAs) para processos organizacionais';
COMMENT ON COLUMN public.org_process_slas.metric_name
IS 'Nome da métrica (ex.: completion_time, quality_score)';
COMMENT ON COLUMN public.org_process_slas.target_duration_days
IS 'Tempo alvo em dias para completar o processo';
COMMENT ON COLUMN public.org_process_slas.warning_threshold_pct
IS 'Percentual de SLA que trigga aviso (ex.: 80% = aviso com 20% restante)';
COMMENT ON COLUMN public.org_process_slas.critical_threshold_pct
IS 'Percentual de SLA que trigga crítico (ex.: 95% = crítico com 5% restante)';

-- =============================================================================
-- TABELA: org_process_metrics
-- Métricas agregadas (observadas) de performance
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.org_process_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  process_id UUID NOT NULL REFERENCES public.org_processes(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  metric_name TEXT NOT NULL,
  avg_duration_days DECIMAL(10,2),
  compliance_pct DECIMAL(5,2),
  instances_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, process_id, metric_name, period_start, period_end)
);

COMMENT ON TABLE public.org_process_metrics
IS 'Métricas de performance agregadas por período para processos';
COMMENT ON COLUMN public.org_process_metrics.avg_duration_days
IS 'Duração média em dias para instâncias completadas no período';
COMMENT ON COLUMN public.org_process_metrics.compliance_pct
IS 'Percentual de instâncias que atenderam ao SLA (0-100%)';
COMMENT ON COLUMN public.org_process_metrics.instances_count
IS 'Total de instâncias do processo no período';

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_org_process_slas_tenant
ON public.org_process_slas(tenant_id);

CREATE INDEX IF NOT EXISTS idx_org_process_slas_process
ON public.org_process_slas(process_id);

CREATE INDEX IF NOT EXISTS idx_org_process_metrics_tenant
ON public.org_process_metrics(tenant_id);

CREATE INDEX IF NOT EXISTS idx_org_process_metrics_process
ON public.org_process_metrics(process_id);

CREATE INDEX IF NOT EXISTS idx_org_process_metrics_period
ON public.org_process_metrics(period_start, period_end);

-- =============================================================================
-- RLS: Existing RLS via tenant_id check covers both tables
-- =============================================================================

-- Verify migration completed
DO $$
BEGIN
  RAISE NOTICE 'Migration 068: org_process_slas and org_process_metrics tables created ✅';
END$$;
