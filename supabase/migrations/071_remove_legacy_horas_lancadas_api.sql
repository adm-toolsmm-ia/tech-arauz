-- =============================================================================
-- Migration 071: Remove Legacy BI_SOLICITACOES_PROJETOSESPAIDER_HORASLANCADAS API
-- Created: 2026-03-19
-- Description:
--   Remove legacy standalone API registration from espaider_apis table.
--   This API will be consolidated as a child interface of the standard
--   BI_SOLICITACOES_PROJETOSESPAIDER pattern for unified data synchronization.
-- =============================================================================

-- ============================================================================
-- PARTE 1: Remove legacy API registration
-- ============================================================================

DELETE FROM public.espaider_apis
WHERE identificador = 'BI_SOLICITACOES_PROJETOSESPAIDER_HORASLANCADAS'
  AND tenant_id = '00000000-0000-0000-0000-000000000001';

-- ============================================================================
-- PARTE 2: Verification query (run after migration completes)
-- ============================================================================
-- SELECT identificador, tipo, is_active FROM public.espaider_apis
-- WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
-- ORDER BY tipo;
-- Expected: 4 rows (projetos, entregas, cronogramas, requisitos)
-- ============================================================================
