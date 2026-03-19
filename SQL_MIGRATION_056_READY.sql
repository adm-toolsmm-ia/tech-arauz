-- =============================================================================
-- MIGRATION 056: Expand dataset CHECK Constraints
-- =============================================================================
--
-- INSTRUÇÕES:
-- 1. Copie este SQL completo
-- 2. Abra: https://app.supabase.com/project/pybmawlwpmxshtccpqui/sql
-- 3. Cole o SQL na caixa de editor
-- 4. Clique em "RUN" (botão azul com triângulo)
-- 5. Aguarde a mensagem de sucesso
--
-- =============================================================================

-- PARTE 1: Expand sync_logs dataset constraint
ALTER TABLE public.sync_logs
  DROP CONSTRAINT IF EXISTS sync_logs_dataset_check;

ALTER TABLE public.sync_logs
  ADD CONSTRAINT sync_logs_dataset_check
  CHECK (dataset IN (
    'Projetos', 'Entregas', 'Cronogramas', 'Requisitos',
    'Historicos', 'Aprovadores', 'Orcamentos',
    'TempoPermanencia', 'HorasLancadas'
  ));

-- PARTE 2: Expand integration_log_entries dataset constraint
ALTER TABLE public.integration_log_entries
  DROP CONSTRAINT IF EXISTS integration_log_entries_dataset_check;

ALTER TABLE public.integration_log_entries
  ADD CONSTRAINT integration_log_entries_dataset_check
  CHECK (dataset IN (
    'Projetos', 'Entregas', 'Cronogramas', 'Requisitos', 'Geral',
    'Historicos', 'Aprovadores', 'Orcamentos',
    'TempoPermanencia', 'HorasLancadas'
  ));

-- =============================================================================
-- Validação: Este SELECT mostrará a constraint depois de executado
-- =============================================================================
SELECT
  constraint_name,
  constraint_definition
FROM information_schema.check_constraints
WHERE table_name IN ('sync_logs', 'integration_log_entries')
ORDER BY constraint_name;
