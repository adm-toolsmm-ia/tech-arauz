-- Migration 019: Rollback 016-018 + Apply Correct Pattern
-- Created: 2026-02-13
-- Objetivo: Seguir EXATAMENTE o padrão de project_deliveries (que FUNCIONA)
-- Reverte: Migrations 016, 017, 018 que criaram schema inconsistente

-- ============================================================================
-- PART 1: Rollback Migration 018 (PK BIGSERIAL)
-- ============================================================================
-- project_histories
ALTER TABLE public.project_histories
  DROP CONSTRAINT IF EXISTS project_histories_pkey CASCADE,
  DROP COLUMN IF EXISTS id CASCADE;

-- Recreate id como UUID (padrão correto)
ALTER TABLE public.project_histories
  ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();

-- project_approvers
ALTER TABLE public.project_approvers
  DROP CONSTRAINT IF EXISTS project_approvers_pkey CASCADE,
  DROP COLUMN IF EXISTS id CASCADE,
  ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();

-- project_budgets
ALTER TABLE public.project_budgets
  DROP CONSTRAINT IF EXISTS project_budgets_pkey CASCADE,
  DROP COLUMN IF EXISTS id CASCADE,
  ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();

-- ============================================================================
-- PART 2: Rollback Migration 016 (Composite Constraints Incompletos)
-- ============================================================================
ALTER TABLE public.project_histories
  DROP CONSTRAINT IF EXISTS project_histories_tenant_espaider_unique,
  DROP CONSTRAINT IF EXISTS project_histories_tenant_fk;

ALTER TABLE public.project_approvers
  DROP CONSTRAINT IF EXISTS project_approvers_tenant_espaider_unique,
  DROP CONSTRAINT IF EXISTS project_approvers_tenant_fk;

ALTER TABLE public.project_budgets
  DROP CONSTRAINT IF EXISTS project_budgets_tenant_espaider_unique,
  DROP CONSTRAINT IF EXISTS project_budgets_tenant_fk;

-- ============================================================================
-- PART 3: Garantir Colunas Necessárias (Migration 016 pode ter criado)
-- ============================================================================
-- Se colunas não existem, criar; se existem, apenas garantir tipo correto
ALTER TABLE public.project_histories
  ADD COLUMN IF NOT EXISTS tenant_id UUID,
  ADD COLUMN IF NOT EXISTS espaider_id INTEGER,  -- INTEGER, não BIGINT (padrão)
  ADD COLUMN IF NOT EXISTS espaider_raw JSONB;

ALTER TABLE public.project_approvers
  ADD COLUMN IF NOT EXISTS tenant_id UUID,
  ADD COLUMN IF NOT EXISTS espaider_id INTEGER,
  ADD COLUMN IF NOT EXISTS espaider_raw JSONB;

ALTER TABLE public.project_budgets
  ADD COLUMN IF NOT EXISTS tenant_id UUID,
  ADD COLUMN IF NOT EXISTS espaider_id INTEGER,
  ADD COLUMN IF NOT EXISTS espaider_raw JSONB,
  ADD COLUMN IF NOT EXISTS moeda TEXT DEFAULT 'BRL';

-- ============================================================================
-- PART 4: Populate tenant_id e espaider_id (se vazios)
-- ============================================================================
-- Histories
UPDATE public.project_histories ph
SET tenant_id = p.tenant_id
FROM public.projects p
WHERE ph.project_id = p.id AND ph.tenant_id IS NULL;

-- Approvers
UPDATE public.project_approvers pa
SET tenant_id = p.tenant_id
FROM public.projects p
WHERE pa.project_id = p.id AND pa.tenant_id IS NULL;

-- Budgets
UPDATE public.project_budgets pb
SET tenant_id = p.tenant_id
FROM public.projects p
WHERE pb.project_id = p.id AND pb.tenant_id IS NULL;

-- ============================================================================
-- PART 5: Aplicar Constraints Corretos (Padrão de deliveries/schedules)
-- ============================================================================
-- project_histories
ALTER TABLE public.project_histories
  ALTER COLUMN tenant_id SET NOT NULL,
  ALTER COLUMN espaider_id SET NOT NULL,
  ADD CONSTRAINT project_histories_tenant_fk
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
  ADD CONSTRAINT project_histories_tenant_espaider_unique
    UNIQUE (tenant_id, espaider_id);

-- project_approvers
ALTER TABLE public.project_approvers
  ALTER COLUMN tenant_id SET NOT NULL,
  ALTER COLUMN espaider_id SET NOT NULL,
  ADD CONSTRAINT project_approvers_tenant_fk
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
  ADD CONSTRAINT project_approvers_tenant_espaider_unique
    UNIQUE (tenant_id, espaider_id);

-- project_budgets
ALTER TABLE public.project_budgets
  ALTER COLUMN tenant_id SET NOT NULL,
  ALTER COLUMN espaider_id SET NOT NULL,
  ADD CONSTRAINT project_budgets_tenant_fk
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
  ADD CONSTRAINT project_budgets_tenant_espaider_unique
    UNIQUE (tenant_id, espaider_id);

-- ============================================================================
-- PART 6: Índices para Performance (Padrão de deliveries)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_project_histories_tenant_espaider
  ON public.project_histories(tenant_id, espaider_id);

CREATE INDEX IF NOT EXISTS idx_project_approvers_tenant_espaider
  ON public.project_approvers(tenant_id, espaider_id);

CREATE INDEX IF NOT EXISTS idx_project_budgets_tenant_espaider
  ON public.project_budgets(tenant_id, espaider_id);
