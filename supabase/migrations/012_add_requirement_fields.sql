-- =============================================================================
-- Migration 012: Add Requirement Fields
-- Purpose: Persist all Espaider requirement fields that were previously only in espaider_raw
-- Date: 2026-02-11
-- =============================================================================
-- Campos adicionados:
--   impacto              <- IMPACTO
--   detalhamento         <- DETALHAMENTOREQUISITO
--   entrega_id_espaider  <- IDENTIFICADOR_ENTREGA
--   entrega_nome         <- ENTREGA
--   data_conclusao       <- DATACONCLUSAO
-- =============================================================================

-- Add impact level
ALTER TABLE public.project_requirements
ADD COLUMN IF NOT EXISTS impacto TEXT;

COMMENT ON COLUMN public.project_requirements.impacto IS 'Nivel de impacto do requisito (IMPACTO do Espaider)';

-- Add detailed description
ALTER TABLE public.project_requirements
ADD COLUMN IF NOT EXISTS detalhamento TEXT;

COMMENT ON COLUMN public.project_requirements.detalhamento IS 'Detalhamento do requisito (DETALHAMENTOREQUISITO do Espaider)';

-- Add link to delivery (Espaider ID)
ALTER TABLE public.project_requirements
ADD COLUMN IF NOT EXISTS entrega_id_espaider INTEGER;

COMMENT ON COLUMN public.project_requirements.entrega_id_espaider IS 'ID Espaider da entrega vinculada (IDENTIFICADOR_ENTREGA do Espaider)';

-- Add delivery name (denormalized for convenience)
ALTER TABLE public.project_requirements
ADD COLUMN IF NOT EXISTS entrega_nome TEXT;

COMMENT ON COLUMN public.project_requirements.entrega_nome IS 'Nome da entrega vinculada (ENTREGA do Espaider)';

-- Add conclusion date
ALTER TABLE public.project_requirements
ADD COLUMN IF NOT EXISTS data_conclusao DATE;

COMMENT ON COLUMN public.project_requirements.data_conclusao IS 'Data de conclusao do requisito (DATACONCLUSAO do Espaider)';

-- =============================================================================
-- INDEXES for common query patterns
-- =============================================================================

-- Index for impact filtering
CREATE INDEX IF NOT EXISTS idx_requirements_impacto ON public.project_requirements(impacto);

-- Index for delivery link queries
CREATE INDEX IF NOT EXISTS idx_requirements_entrega_id ON public.project_requirements(entrega_id_espaider);
