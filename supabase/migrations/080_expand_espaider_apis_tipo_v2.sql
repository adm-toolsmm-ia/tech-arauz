-- =============================================================================
-- Migration 080: Expand espaider_apis.tipo for Espaider v2 watermark row
-- Created: 2026-05-12
-- Description:
--   Adds 'Projetos-v2' to espaider_apis.tipo CHECK constraint so the v2 sync
--   can upsert its watermark row without violating the constraint.
--
--   The v2 sync (Story 19.3) uses a dedicated row with tipo='Projetos-v2' to
--   store last_sync_at independently from the v1 projetos row, preserving
--   independent rollback of each version's watermark state.
--
-- Story: 19.7
-- =============================================================================

ALTER TABLE public.espaider_apis
  DROP CONSTRAINT IF EXISTS espaider_apis_tipo_check;

ALTER TABLE public.espaider_apis
  ADD CONSTRAINT espaider_apis_tipo_check
  CHECK (tipo IN (
    -- v1 tipos (preserved)
    'projetos', 'entregas', 'cronogramas', 'requisitos', 'completo', 'horas_lancadas',
    -- v2 tipo
    'Projetos-v2'
  ));
