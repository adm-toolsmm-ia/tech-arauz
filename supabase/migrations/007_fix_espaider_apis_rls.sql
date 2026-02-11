-- =============================================================================
-- Tech Arauz - Migration 007: Fix RLS Policies for espaider_apis
-- =============================================================================
-- A tabela espaider_apis foi criada sem as RLS policies necessárias.
-- Esta migration corrige isso aplicando as policies de forma idempotente.
-- =============================================================================

-- Garantir RLS habilitado
ALTER TABLE public.espaider_apis ENABLE ROW LEVEL SECURITY;

-- Remover policies existentes (se houver) para recriar de forma limpa
DROP POLICY IF EXISTS "APIs: all roles can view" ON public.espaider_apis;
DROP POLICY IF EXISTS "APIs: only admins can insert" ON public.espaider_apis;
DROP POLICY IF EXISTS "APIs: only admins can update" ON public.espaider_apis;
DROP POLICY IF EXISTS "APIs: only admins can delete" ON public.espaider_apis;

-- Criar policies
CREATE POLICY "APIs: all roles can view"
    ON public.espaider_apis FOR SELECT
    USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "APIs: only admins can insert"
    ON public.espaider_apis FOR INSERT
    WITH CHECK (
        tenant_id = public.get_user_tenant_id()
        AND public.get_user_role() = 'admin'
    );

CREATE POLICY "APIs: only admins can update"
    ON public.espaider_apis FOR UPDATE
    USING (
        tenant_id = public.get_user_tenant_id()
        AND public.get_user_role() = 'admin'
    );

CREATE POLICY "APIs: only admins can delete"
    ON public.espaider_apis FOR DELETE
    USING (
        tenant_id = public.get_user_tenant_id()
        AND public.get_user_role() = 'admin'
    );

-- Verificação: deve retornar 4 policies para espaider_apis
-- SELECT policyname FROM pg_policies WHERE tablename = 'espaider_apis';
