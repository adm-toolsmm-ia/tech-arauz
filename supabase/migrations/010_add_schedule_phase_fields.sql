-- =============================================================================
-- Migration 010: Add Schedule Phase and Tracking Fields
-- Purpose: Persist all Espaider schedule fields that were previously only in espaider_raw
-- Date: 2026-02-11
-- =============================================================================
-- Campos adicionados:
--   fase_atividade    <- FASEATIVIDADE
--   atrasado          <- ATRASADO (Sim/Nao -> boolean)
--   setor_responsavel <- SETORRESPONSAVEL
--   item              <- ITEM
--   detalhamento      <- DETALHAMENTO
--   data_prazo        <- DATAPRAZO
--   data_novo_prazo   <- DATANOVOPRAZO
--   data_alerta_prazo <- DATAALERTAPRAZO
--   prazo_confirmado  <- PRAZOCONFIRMADO
-- =============================================================================

-- Add phase of activity (important for activity tracking)
ALTER TABLE public.project_schedules
ADD COLUMN IF NOT EXISTS fase_atividade TEXT;

COMMENT ON COLUMN public.project_schedules.fase_atividade IS 'Fase da atividade (FASEATIVIDADE do Espaider)';

-- Add delayed flag
ALTER TABLE public.project_schedules
ADD COLUMN IF NOT EXISTS atrasado BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.project_schedules.atrasado IS 'Indica se atividade esta atrasada (ATRASADO do Espaider: Sim/Nao)';

-- Add responsible sector
ALTER TABLE public.project_schedules
ADD COLUMN IF NOT EXISTS setor_responsavel TEXT;

COMMENT ON COLUMN public.project_schedules.setor_responsavel IS 'Setor responsavel pela atividade (SETORRESPONSAVEL do Espaider)';

-- Add item number
ALTER TABLE public.project_schedules
ADD COLUMN IF NOT EXISTS item TEXT;

COMMENT ON COLUMN public.project_schedules.item IS 'Numero do item (ITEM do Espaider)';

-- Add details
ALTER TABLE public.project_schedules
ADD COLUMN IF NOT EXISTS detalhamento TEXT;

COMMENT ON COLUMN public.project_schedules.detalhamento IS 'Detalhamento da atividade (DETALHAMENTO do Espaider)';

-- Add original deadline (separate from data_fim which may be DATACONCLUSAO)
ALTER TABLE public.project_schedules
ADD COLUMN IF NOT EXISTS data_prazo DATE;

COMMENT ON COLUMN public.project_schedules.data_prazo IS 'Data prazo original (DATAPRAZO do Espaider)';

-- Add new deadline (renegotiated)
ALTER TABLE public.project_schedules
ADD COLUMN IF NOT EXISTS data_novo_prazo DATE;

COMMENT ON COLUMN public.project_schedules.data_novo_prazo IS 'Novo prazo renegociado (DATANOVOPRAZO do Espaider)';

-- Add alert date
ALTER TABLE public.project_schedules
ADD COLUMN IF NOT EXISTS data_alerta_prazo DATE;

COMMENT ON COLUMN public.project_schedules.data_alerta_prazo IS 'Data de alerta do prazo (DATAALERTAPRAZO do Espaider)';

-- Add deadline confirmed flag
ALTER TABLE public.project_schedules
ADD COLUMN IF NOT EXISTS prazo_confirmado BOOLEAN;

COMMENT ON COLUMN public.project_schedules.prazo_confirmado IS 'Prazo confirmado (PRAZOCONFIRMADO do Espaider)';

-- =============================================================================
-- INDEXES for common query patterns
-- =============================================================================

-- Index for phase filtering
CREATE INDEX IF NOT EXISTS idx_schedules_fase_atividade ON public.project_schedules(fase_atividade);

-- Index for delayed activities (critical for alerts)
CREATE INDEX IF NOT EXISTS idx_schedules_atrasado ON public.project_schedules(atrasado) WHERE atrasado = TRUE;

-- Index for sector queries
CREATE INDEX IF NOT EXISTS idx_schedules_setor ON public.project_schedules(setor_responsavel);
