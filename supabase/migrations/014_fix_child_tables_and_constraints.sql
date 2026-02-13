-- Migration 014: Fix child tables and sync constraints
-- Created: 2026-02-13
-- Description: Adds tenant_id, espaider_id, espaider_raw to project_histories/approvers/budgets
--              Expands CHECK constraints in sync_logs and integration_log_entries to include Historicos, Aprovadores, Orcamentos

-- ============================================================================
-- PART 1: Expand sync_logs dataset constraint
-- ============================================================================
ALTER TABLE public.sync_logs
  DROP CONSTRAINT IF EXISTS sync_logs_dataset_check;

ALTER TABLE public.sync_logs
  ADD CONSTRAINT sync_logs_dataset_check
  CHECK (dataset IN ('Projetos', 'Entregas', 'Cronogramas', 'Requisitos', 'Historicos', 'Aprovadores', 'Orcamentos'));

-- ============================================================================
-- PART 2: Expand integration_log_entries dataset constraint
-- ============================================================================
ALTER TABLE public.integration_log_entries
  DROP CONSTRAINT IF EXISTS integration_log_entries_dataset_check;

ALTER TABLE public.integration_log_entries
  ADD CONSTRAINT integration_log_entries_dataset_check
  CHECK (dataset IN ('Projetos', 'Entregas', 'Cronogramas', 'Requisitos', 'Geral', 'Historicos', 'Aprovadores', 'Orcamentos'));

-- ============================================================================
-- PART 3: Fix project_histories table
-- ============================================================================
-- Add missing columns
ALTER TABLE public.project_histories
  ADD COLUMN IF NOT EXISTS tenant_id UUID,
  ADD COLUMN IF NOT EXISTS espaider_id BIGINT,
  ADD COLUMN IF NOT EXISTS espaider_raw JSONB;

-- Populate tenant_id from parent project (for existing records)
UPDATE public.project_histories ph
SET tenant_id = p.tenant_id
FROM public.projects p
WHERE ph.project_id = p.id AND ph.tenant_id IS NULL;

-- Populate espaider_id from old id column (for existing records)
UPDATE public.project_histories
SET espaider_id = id
WHERE espaider_id IS NULL;

-- Make tenant_id NOT NULL + add FK
ALTER TABLE public.project_histories
  ALTER COLUMN tenant_id SET NOT NULL,
  ALTER COLUMN espaider_id SET NOT NULL,
  ADD CONSTRAINT project_histories_tenant_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Add composite unique constraint (tenant_id, espaider_id)
ALTER TABLE public.project_histories
  ADD CONSTRAINT project_histories_tenant_espaider_unique UNIQUE (tenant_id, espaider_id);

-- ============================================================================
-- PART 4: Fix project_approvers table
-- ============================================================================
-- Add missing columns
ALTER TABLE public.project_approvers
  ADD COLUMN IF NOT EXISTS tenant_id UUID,
  ADD COLUMN IF NOT EXISTS espaider_id BIGINT,
  ADD COLUMN IF NOT EXISTS espaider_raw JSONB;

-- Populate tenant_id from parent project (for existing records)
UPDATE public.project_approvers pa
SET tenant_id = p.tenant_id
FROM public.projects p
WHERE pa.project_id = p.id AND pa.tenant_id IS NULL;

-- Populate espaider_id from old id column (for existing records)
UPDATE public.project_approvers
SET espaider_id = id
WHERE espaider_id IS NULL;

-- Make tenant_id NOT NULL + add FK
ALTER TABLE public.project_approvers
  ALTER COLUMN tenant_id SET NOT NULL,
  ALTER COLUMN espaider_id SET NOT NULL,
  ADD CONSTRAINT project_approvers_tenant_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Add composite unique constraint (tenant_id, espaider_id)
ALTER TABLE public.project_approvers
  ADD CONSTRAINT project_approvers_tenant_espaider_unique UNIQUE (tenant_id, espaider_id);

-- ============================================================================
-- PART 5: Fix project_budgets table
-- ============================================================================
-- Add missing columns
ALTER TABLE public.project_budgets
  ADD COLUMN IF NOT EXISTS tenant_id UUID,
  ADD COLUMN IF NOT EXISTS espaider_id BIGINT,
  ADD COLUMN IF NOT EXISTS espaider_raw JSONB,
  ADD COLUMN IF NOT EXISTS moeda TEXT DEFAULT 'BRL';

-- Populate tenant_id from parent project (for existing records)
UPDATE public.project_budgets pb
SET tenant_id = p.tenant_id
FROM public.projects p
WHERE pb.project_id = p.id AND pb.tenant_id IS NULL;

-- Populate espaider_id from old id column (for existing records)
UPDATE public.project_budgets
SET espaider_id = id
WHERE espaider_id IS NULL;

-- Make tenant_id NOT NULL + add FK
ALTER TABLE public.project_budgets
  ALTER COLUMN tenant_id SET NOT NULL,
  ALTER COLUMN espaider_id SET NOT NULL,
  ADD CONSTRAINT project_budgets_tenant_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Add composite unique constraint (tenant_id, espaider_id)
ALTER TABLE public.project_budgets
  ADD CONSTRAINT project_budgets_tenant_espaider_unique UNIQUE (tenant_id, espaider_id);
