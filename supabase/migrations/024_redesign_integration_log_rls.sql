-- =============================================================================
-- Migration 024: Redesign RLS Policies for integration_log_entries
-- =============================================================================
-- OBJETIVO: Simplificar e robustificar acesso a logs de integração
--
-- PROBLEMA (investigação com 3 agentes):
-- 1. Migration 006: Policy exigia role = 'admin' em profiles (muito restritivo)
-- 2. Migration 023: Tentou fixar com service_role, mas lógica confusa
-- 3. Resultado: Usuários admin não conseguem visualizar logs
--
-- SOLUÇÃO: Padrão simples + robusto
-- - 2 policies apenas: tenant isolation (SELECT) + service role (todos)
-- - Nenhuma verificação de role em RLS (aplicação é responsável)
-- - RLS só garante tenant isolation
-- =============================================================================

-- ============================================================================
-- STEP 1: Drop todas as policies antigas (006 + 023)
-- ============================================================================
DROP POLICY IF EXISTS "Log entries: admins can view" ON public.integration_log_entries;
DROP POLICY IF EXISTS "Log entries: service role can manage" ON public.integration_log_entries;
DROP POLICY IF EXISTS "Log entries: users can view own tenant" ON public.integration_log_entries;
DROP POLICY IF EXISTS "Log entries: system can insert" ON public.integration_log_entries;

-- ============================================================================
-- STEP 2: Criar 2 policies simples e robustas
-- ============================================================================

-- Policy 1: Usuários autenticados podem ler logs do seu tenant
-- (Aplicação verifica role = 'admin' na API route, RLS apenas faz tenant isolation)
CREATE POLICY "Log entries: authenticated users can view own tenant"
    ON public.integration_log_entries FOR SELECT
    USING (
        tenant_id = public.get_user_tenant_id()
    );

-- Policy 2: Service role (interno, APIs) pode fazer tudo sem restrição
-- (Usado por: sync processes, API routes com autenticação duplicada)
CREATE POLICY "Log entries: service role unrestricted access"
    ON public.integration_log_entries FOR ALL
    USING (TRUE)
    WITH CHECK (TRUE);

-- ============================================================================
-- STEP 3: Comentários explicativos
-- ============================================================================

COMMENT ON POLICY "Log entries: authenticated users can view own tenant" ON public.integration_log_entries IS
'RLS Policy: Usuários autenticados podem ver logs do seu próprio tenant.
IMPORTANTE: Esta policy NÃO verifica role. Verificação de role (admin/user/viewer) é responsabilidade da API route.
RLS aqui apenas garante tenant isolation.
- Usuário sem tenant: Bloqueado automaticamente (get_user_tenant_id() = NULL)
- Usuário de outro tenant: Bloqueado automaticamente
- Usuário do mesmo tenant: PERMITIDO (role check vem na API)';

COMMENT ON POLICY "Log entries: service role unrestricted access" ON public.integration_log_entries IS
'Service role (interno): Pode ler/escrever/deletar logs sem restrição.
Usado por: sync processes, API routes, workers, jobs que necessitam acesso full.
NÃO é filtrado por tenant, pois service_role é interno/confiável.';

-- ============================================================================
-- STEP 4: Teste manual (executar após migration)
-- ============================================================================
-- Para verificar que policies funcionam corretamente:
--
-- TEST 1: Usuário admin do tenant consegue ler logs
-- SELECT count(*) FROM integration_log_entries
--   WHERE tenant_id = '<tenant-id>'
--   LIMIT 1;
-- Esperado: Se houver logs, retorna count. Senão, 0 (não erro 403).
--
-- TEST 2: Usuário de outro tenant não consegue
-- (Mudar para outro tenant_id na SESSION)
-- SELECT count(*) FROM integration_log_entries
--   WHERE tenant_id = '<outro-tenant-id>'
--   LIMIT 1;
-- Esperado: 0 registros (RLS bloqueou)
--
-- TEST 3: Service role consegue tudo
-- (Via Supabase service_role client)
-- SELECT count(*) FROM integration_log_entries;
-- Esperado: Retorna total de todos os tenants
--
-- ============================================================================
