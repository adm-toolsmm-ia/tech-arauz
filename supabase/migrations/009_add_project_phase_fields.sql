-- =============================================================================
-- Migration 009: Add Project Phase and Tracking Fields
-- Purpose: Persist all Espaider project fields that were previously only in espaider_raw
-- Date: 2026-02-11
-- =============================================================================
-- Campos adicionados:
--   fase_atual       <- APROVADORATUAL (usado para agrupar Kanban)
--   prazo_fase       <- PRAZOAPROVADOR
--   cronograma_atual <- CRONOGRAMAATUAL
--   prazo_cronograma <- PRAZOCRONOGRAMAATUAL
--   area             <- ASSUNTOAREA
--   pasta_consultivo <- PASTACONSULTIVO
--   solucao_aplicada <- SOLUCAOAPLICADAEM
--   data_movimentacao <- DATAMOVIMENTACAO
--   data_encerramento <- ENCERRADOEM
--   data_inicio_aprovacao <- DATAINICIOAPROVACAO
-- =============================================================================

-- Add phase field (critical for Kanban grouping)
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS fase_atual TEXT;

COMMENT ON COLUMN public.projects.fase_atual IS 'Fase atual do projeto (APROVADORATUAL do Espaider) - usado para agrupar Kanban';

-- Add phase deadline
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS prazo_fase DATE;

COMMENT ON COLUMN public.projects.prazo_fase IS 'Prazo da fase atual (PRAZOAPROVADOR do Espaider)';

-- Add current schedule activity
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS cronograma_atual TEXT;

COMMENT ON COLUMN public.projects.cronograma_atual IS 'Atividade atual do cronograma (CRONOGRAMAATUAL do Espaider)';

-- Add schedule deadline
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS prazo_cronograma DATE;

COMMENT ON COLUMN public.projects.prazo_cronograma IS 'Prazo do cronograma atual (PRAZOCRONOGRAMAATUAL do Espaider)';

-- Add area/department
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS area TEXT;

COMMENT ON COLUMN public.projects.area IS 'Area do projeto (ASSUNTOAREA do Espaider)';

-- Add consultivo folder reference
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS pasta_consultivo TEXT;

COMMENT ON COLUMN public.projects.pasta_consultivo IS 'Pasta consultivo (PASTACONSULTIVO do Espaider)';

-- Add solution environment
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS solucao_aplicada TEXT;

COMMENT ON COLUMN public.projects.solucao_aplicada IS 'Ambiente onde a solucao foi aplicada (SOLUCAOAPLICADAEM do Espaider)';

-- Add last movement date
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS data_movimentacao TIMESTAMPTZ;

COMMENT ON COLUMN public.projects.data_movimentacao IS 'Data da ultima movimentacao (DATAMOVIMENTACAO do Espaider)';

-- Add closure date
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS data_encerramento TIMESTAMPTZ;

COMMENT ON COLUMN public.projects.data_encerramento IS 'Data de encerramento do projeto (ENCERRADOEM do Espaider)';

-- Add approval start date
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS data_inicio_aprovacao TIMESTAMPTZ;

COMMENT ON COLUMN public.projects.data_inicio_aprovacao IS 'Data de inicio da aprovacao (DATAINICIOAPROVACAO do Espaider)';

-- =============================================================================
-- INDEXES for common query patterns
-- =============================================================================

-- Index for Kanban grouping (critical)
CREATE INDEX IF NOT EXISTS idx_projects_fase_atual ON public.projects(fase_atual);

-- Index for movement date queries
CREATE INDEX IF NOT EXISTS idx_projects_data_movimentacao ON public.projects(data_movimentacao DESC);

-- Index for area filtering
CREATE INDEX IF NOT EXISTS idx_projects_area ON public.projects(area);
