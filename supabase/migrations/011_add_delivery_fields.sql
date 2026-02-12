-- =============================================================================
-- Migration 011: Add Delivery Fields
-- Purpose: Persist all Espaider delivery fields that were previously only in espaider_raw
-- Date: 2026-02-11
-- =============================================================================
-- Campos adicionados:
--   ordem        <- ORDEM
--   detalhamento <- DETALHAMENTO
--   prioridade   <- PRIORIDADE (separado de status!)
--
-- NOTA: Anteriormente PRIORIDADE estava sendo mapeado como "status" o que era
-- confuso. Agora temos campos separados:
--   - prioridade: nivel de prioridade (Normal, Alta, etc.)
--   - status: estado da entrega (Pendente, Concluido, etc.)
-- =============================================================================

-- Add order/sequence
ALTER TABLE public.project_deliveries
ADD COLUMN IF NOT EXISTS ordem TEXT;

COMMENT ON COLUMN public.project_deliveries.ordem IS 'Ordem/sequencia da entrega (ORDEM do Espaider)';

-- Add details
ALTER TABLE public.project_deliveries
ADD COLUMN IF NOT EXISTS detalhamento TEXT;

COMMENT ON COLUMN public.project_deliveries.detalhamento IS 'Detalhamento da entrega (DETALHAMENTO do Espaider)';

-- Add priority (separate from status!)
ALTER TABLE public.project_deliveries
ADD COLUMN IF NOT EXISTS prioridade TEXT DEFAULT 'Normal';

COMMENT ON COLUMN public.project_deliveries.prioridade IS 'Prioridade da entrega (PRIORIDADE do Espaider) - NAO confundir com status';

-- Update comment on status to clarify
COMMENT ON COLUMN public.project_deliveries.status IS 'Status real da entrega (Pendente, Concluido, etc.) - derivado das datas, NAO da prioridade';

-- =============================================================================
-- INDEXES for common query patterns
-- =============================================================================

-- Index for ordering deliveries
CREATE INDEX IF NOT EXISTS idx_deliveries_ordem ON public.project_deliveries(ordem);

-- Index for priority filtering
CREATE INDEX IF NOT EXISTS idx_deliveries_prioridade ON public.project_deliveries(prioridade);
