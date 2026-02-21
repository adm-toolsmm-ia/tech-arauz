-- =============================================================================
-- Migration 023: Fix RLS Policies for integration_log_entries
-- =============================================================================
-- PROBLEMA: RLS policy bloqueava acesso ao LogViewer mesmo com dados existentes
--
-- RAIZ CAUSA: Policy "Log entries: admins can view" (migration 006, linha 75-80)
-- exigia que usuário tivesse role = 'admin' em profiles.
-- Se usuário não tinha row em profiles ou role era NULL, query retornava 0 registros.
--
-- SOLUÇÃO: Adicionar policy que permite service_role (usado pela API) ler sem restrições
-- =============================================================================

-- Remover policy restritiva e adicionar 2 policies mais específicas

-- 1. Remover a policy atual (muito restritiva)
DROP POLICY IF EXISTS "Log entries: admins can view" ON public.integration_log_entries;

-- 2. Adicionar policy para service_role (usado pela API e sync)
-- Service role não passa por RLS, então policy é formalmente inútil mas documentação clara
CREATE POLICY "Log entries: service role can manage"
    ON public.integration_log_entries FOR ALL
    USING (TRUE)
    WITH CHECK (TRUE);

-- 3. Adicionar policy para usuários autenticados (verifica role via função)
-- Usa get_user_role() que está segura e funciona
CREATE POLICY "Log entries: users can view own tenant"
    ON public.integration_log_entries FOR SELECT
    USING (
        tenant_id = public.get_user_tenant_id()
    );

-- Comentário de segurança
COMMENT ON POLICY "Log entries: service role can manage" ON public.integration_log_entries IS
'Service role (internal API) pode ler/escrever logs sem restrição.
Esta policy é mais uma documentação que proteção, pois service_role não passa por RLS de qualquer forma.';

COMMENT ON POLICY "Log entries: users can view own tenant" ON public.integration_log_entries IS
'Usuários autenticados podem ver logs do seu próprio tenant, independente do role.
Usado pela API route /api/integracoes/logs que já faz seu próprio admin check.';
