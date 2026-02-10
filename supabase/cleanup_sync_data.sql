-- =============================================================================
-- Tech Arauz - Cleanup Script: Limpar dados de sync incorretos
-- Executar via Supabase Dashboard > SQL Editor
-- =============================================================================
-- ATENÇÃO: Este script remove TODOS os registros sincronizados do tenant Araúz.
-- Os dados serão re-importados corretamente após o fix do sync.
-- =============================================================================

-- Ordem de exclusão respeita foreign keys (filhos primeiro, pais depois)

-- 1. Requisitos (filhos de projetos)
DELETE FROM public.project_requirements
WHERE tenant_id = '00000000-0000-0000-0000-000000000001';

-- 2. Cronogramas (filhos de projetos)
DELETE FROM public.project_schedules
WHERE tenant_id = '00000000-0000-0000-0000-000000000001';

-- 3. Entregas (filhos de projetos)
DELETE FROM public.project_deliveries
WHERE tenant_id = '00000000-0000-0000-0000-000000000001';

-- 4. Projetos (pais)
DELETE FROM public.projects
WHERE tenant_id = '00000000-0000-0000-0000-000000000001';

-- 5. Logs de sync
DELETE FROM public.sync_logs
WHERE tenant_id = '00000000-0000-0000-0000-000000000001';

-- Verificação
SELECT 'projects' AS tabela, COUNT(*) AS total FROM public.projects WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 'project_deliveries', COUNT(*) FROM public.project_deliveries WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 'project_schedules', COUNT(*) FROM public.project_schedules WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 'project_requirements', COUNT(*) FROM public.project_requirements WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 'sync_logs', COUNT(*) FROM public.sync_logs WHERE tenant_id = '00000000-0000-0000-0000-000000000001';
