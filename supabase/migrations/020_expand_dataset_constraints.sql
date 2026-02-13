-- Migration 020: Expand Dataset CHECK Constraints
-- Created: 2026-02-13
-- Objetivo: Permitir que logs de Historicos, Aprovadores, Orcamentos sejam persistidos
-- Fix: CHECK constraint em sync_logs e integration_log_entries bloqueava novos datasets

-- ============================================================================
-- PART 1: Expand sync_logs dataset constraint
-- ============================================================================
ALTER TABLE public.sync_logs
  DROP CONSTRAINT IF EXISTS sync_logs_dataset_check;

ALTER TABLE public.sync_logs
  ADD CONSTRAINT sync_logs_dataset_check
  CHECK (dataset IN (
    'Projetos', 'Entregas', 'Cronogramas', 'Requisitos',
    'Historicos', 'Aprovadores', 'Orcamentos'
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
    'Historicos', 'Aprovadores', 'Orcamentos'
  ));
