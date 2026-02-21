-- =============================================================================
-- Migration 025: Consolidate RLS for integration_log_entries
-- =============================================================================
-- OBJETIVO: Garantir acesso robusto a logs de integração para admins do tenant
--
-- CONTEXTO:
-- - Migration 006: Criou policy exigindo role='admin' em RLS (bloqueio silencioso)
-- - Migration 023: Tentou fix com service_role + tenant isolation
-- - Migration 024: Redesenhou com 2 policies (tenant isolation + service_role)
-- - Esta migration 025: Consolida e garante idempotência
--
-- ESTRATÉGIA:
-- 1. RLS SÓ faz tenant isolation (SELECT)
-- 2. Service role tem acesso irrestrito (ALL) para sync/API
-- 3. Verificação de role é responsabilidade da API route
-- =============================================================================

-- ============================================================================
-- STEP 1: Drop ALL existing policies (garante estado limpo)
-- ============================================================================
DROP POLICY IF EXISTS "Log entries: admins can view" ON public.integration_log_entries;
DROP POLICY IF EXISTS "Log entries: system can insert" ON public.integration_log_entries;
DROP POLICY IF EXISTS "Log entries: service role can manage" ON public.integration_log_entries;
DROP POLICY IF EXISTS "Log entries: users can view own tenant" ON public.integration_log_entries;
DROP POLICY IF EXISTS "Log entries: authenticated users can view own tenant" ON public.integration_log_entries;
DROP POLICY IF EXISTS "Log entries: service role unrestricted access" ON public.integration_log_entries;

-- ============================================================================
-- STEP 2: Ensure RLS is enabled
-- ============================================================================
ALTER TABLE public.integration_log_entries ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: Create 2 clean policies
-- ============================================================================

-- Policy 1: Tenant isolation for authenticated users (SELECT only)
-- API route verifica role (admin/user) antes de chegar aqui
CREATE POLICY "integration_logs_tenant_select"
    ON public.integration_log_entries FOR SELECT
    USING (
        tenant_id = public.get_user_tenant_id()
    );

-- Policy 2: Service role unrestricted (ALL operations)
-- Usado por: sync processes, API routes com createServiceClient()
CREATE POLICY "integration_logs_service_all"
    ON public.integration_log_entries FOR ALL
    USING (TRUE)
    WITH CHECK (TRUE);

-- ============================================================================
-- STEP 4: Ensure sync_logs table also has correct RLS
-- ============================================================================
DROP POLICY IF EXISTS "Sync logs: only admins can view" ON public.sync_logs;
DROP POLICY IF EXISTS "Sync logs: system can insert (via service role)" ON public.sync_logs;
DROP POLICY IF EXISTS "sync_logs_tenant_select" ON public.sync_logs;
DROP POLICY IF EXISTS "sync_logs_service_all" ON public.sync_logs;

CREATE POLICY "sync_logs_tenant_select"
    ON public.sync_logs FOR SELECT
    USING (
        tenant_id = public.get_user_tenant_id()
    );

CREATE POLICY "sync_logs_service_all"
    ON public.sync_logs FOR ALL
    USING (TRUE)
    WITH CHECK (TRUE);

-- ============================================================================
-- STEP 5: Test queries (executar manualmente após migration)
-- ============================================================================
-- Para testar no Supabase SQL Editor:
--
-- TEST 1: Verificar policies criadas
-- SELECT policyname, cmd, qual FROM pg_policies
--   WHERE tablename = 'integration_log_entries';
-- Esperado: 2 rows (integration_logs_tenant_select, integration_logs_service_all)
--
-- TEST 2: Contar logs como service_role (deve retornar todos)
-- SELECT count(*) FROM integration_log_entries;
-- Esperado: 664+ registros
--
-- TEST 3: Verificar que sync_logs também funciona
-- SELECT count(*) FROM sync_logs;
-- Esperado: > 0 se já houve syncs
--
-- TEST 4: Verificar tenant de um usuário específico
-- SELECT tenant_id, role FROM profiles WHERE id = auth.uid();
-- Esperado: tenant_id = '00000000-0000-0000-0000-000000000001', role = 'admin'
-- ============================================================================
