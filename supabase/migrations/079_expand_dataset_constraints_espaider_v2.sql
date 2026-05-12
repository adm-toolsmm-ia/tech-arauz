-- =============================================================================
-- Migration 079: Expand dataset CHECK Constraints for Espaider v2 Sync
-- Created: 2026-05-12
-- Description:
--   Adds v2-specific dataset values to sync_logs and integration_log_entries
--   CHECK constraints so the frontend log viewer surfaces v2 sync events.
--
--   Dataset naming convention for v2:
--   - Parent sync: 'Projetos-v2'
--   - Children orchestration: 'Geral-v2'
--   - Per-child datasets: '{DatasetName}-v2' (e.g. 'Aprovadores-v2')
--
-- Story: 19.6
-- =============================================================================

-- ============================================================================
-- PART 1: Expand sync_logs dataset constraint
-- ============================================================================
ALTER TABLE public.sync_logs
  DROP CONSTRAINT IF EXISTS sync_logs_dataset_check;

ALTER TABLE public.sync_logs
  ADD CONSTRAINT sync_logs_dataset_check
  CHECK (dataset IN (
    -- v1 datasets (preserved)
    'Projetos', 'Entregas', 'Cronogramas', 'Requisitos',
    'Historicos', 'Aprovadores', 'Orcamentos',
    'TempoPermanencia', 'HorasLancadas',
    -- v2 datasets
    'Projetos-v2',
    'Geral-v2',
    'Cronogramas-v2',
    'Entregas-v2',
    'Requisitos-v2',
    'Historicos-v2',
    'Orcamentos-v2',
    'Aprovadores-v2',
    'TempoPermanencia-v2',
    'HorasLancadas-v2'
  ));

-- ============================================================================
-- PART 2: Expand integration_log_entries dataset constraint
-- ============================================================================
ALTER TABLE public.integration_log_entries
  DROP CONSTRAINT IF EXISTS integration_log_entries_dataset_check;

ALTER TABLE public.integration_log_entries
  ADD CONSTRAINT integration_log_entries_dataset_check
  CHECK (dataset IN (
    -- v1 datasets (preserved)
    'Projetos', 'Entregas', 'Cronogramas', 'Requisitos', 'Geral',
    'Historicos', 'Aprovadores', 'Orcamentos',
    'TempoPermanencia', 'HorasLancadas',
    -- v2 datasets
    'Projetos-v2',
    'Geral-v2',
    'Cronogramas-v2',
    'Entregas-v2',
    'Requisitos-v2',
    'Historicos-v2',
    'Orcamentos-v2',
    'Aprovadores-v2',
    'TempoPermanencia-v2',
    'HorasLancadas-v2'
  ));
