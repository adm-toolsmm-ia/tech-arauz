-- =============================================================================
-- Migration 056: Expand dataset CHECK Constraints - TempoPermanencia + HorasLancadas
-- =============================================================================
-- PROBLEMA: Migration 020 adicionou Historicos, Aprovadores, Orcamentos mas
-- não incluiu TempoPermanencia e HorasLancadas (adicionados depois).
--
-- IMPACTO: persistLogEntries falhava silenciosamente (try/catch) ao tentar
-- inserir logs com dataset='TempoPermanencia' ou 'HorasLancadas',
-- impedindo que qualquer sincronização recente gerasse logs visíveis no frontend.
-- =============================================================================

-- ============================================================================
-- PART 1: Expand sync_logs dataset constraint
-- ============================================================================
ALTER TABLE public.sync_logs
  DROP CONSTRAINT IF EXISTS sync_logs_dataset_check;

ALTER TABLE public.sync_logs
  ADD CONSTRAINT sync_logs_dataset_check
  CHECK (dataset IN (
    'Projetos', 'Entregas', 'Cronogramas', 'Requisitos',
    'Historicos', 'Aprovadores', 'Orcamentos',
    'TempoPermanencia', 'HorasLancadas'
  ));

-- ============================================================================
-- PART 2: Expand integration_log_entries dataset constraint
-- ============================================================================
ALTER TABLE public.integration_log_entries
  DROP CONSTRAINT IF EXISTS integration_log_entries_dataset_check;

ALTER TABLE public.integration_log_entries
  ADD CONSTRAINT integration_log_entries_dataset_check
  CHECK (dataset IN (
    'Projetos', 'Entregas', 'Cronogramas', 'Requisitos', 'Geral',
    'Historicos', 'Aprovadores', 'Orcamentos',
    'TempoPermanencia', 'HorasLancadas'
  ));
