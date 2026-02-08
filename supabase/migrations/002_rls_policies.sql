-- =============================================================================
-- Tech Arauz - Row Level Security (RLS)
-- Migration 002: Políticas de Segurança
-- =============================================================================
-- @security-auditor: RLS garante tenant isolation
-- Cada usuário só vê dados do seu tenant
-- =============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- FUNÇÃO: get_user_tenant_id()
-- Retorna o tenant_id do usuário autenticado
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT tenant_id 
        FROM public.profiles 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- FUNÇÃO: get_user_role()
-- Retorna a role do usuário autenticado
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM public.profiles 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- POLÍTICAS: tenants
-- Apenas admins podem ver/modificar tenant info
-- =============================================================================
CREATE POLICY "Tenants: users can view their own tenant"
    ON public.tenants FOR SELECT
    USING (id = public.get_user_tenant_id());

CREATE POLICY "Tenants: only admins can update"
    ON public.tenants FOR UPDATE
    USING (id = public.get_user_tenant_id() AND public.get_user_role() = 'admin');

-- =============================================================================
-- POLÍTICAS: profiles
-- Admins podem tudo, users podem ver todos do tenant
-- =============================================================================
CREATE POLICY "Profiles: users can view profiles in their tenant"
    ON public.profiles FOR SELECT
    USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Profiles: users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid());

CREATE POLICY "Profiles: admins can insert new profiles"
    ON public.profiles FOR INSERT
    WITH CHECK (
        tenant_id = public.get_user_tenant_id() 
        AND public.get_user_role() = 'admin'
    );

CREATE POLICY "Profiles: admins can update any profile in tenant"
    ON public.profiles FOR UPDATE
    USING (
        tenant_id = public.get_user_tenant_id() 
        AND public.get_user_role() = 'admin'
    );

-- =============================================================================
-- POLÍTICAS: projects
-- Todos podem ver, apenas admin/user podem modificar
-- =============================================================================
CREATE POLICY "Projects: all roles can view tenant projects"
    ON public.projects FOR SELECT
    USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Projects: admin/user can insert"
    ON public.projects FOR INSERT
    WITH CHECK (
        tenant_id = public.get_user_tenant_id() 
        AND public.get_user_role() IN ('admin', 'user')
    );

CREATE POLICY "Projects: admin/user can update"
    ON public.projects FOR UPDATE
    USING (
        tenant_id = public.get_user_tenant_id() 
        AND public.get_user_role() IN ('admin', 'user')
    );

CREATE POLICY "Projects: only admin can delete"
    ON public.projects FOR DELETE
    USING (
        tenant_id = public.get_user_tenant_id() 
        AND public.get_user_role() = 'admin'
    );

-- =============================================================================
-- POLÍTICAS: project_schedules, project_deliveries, project_requirements
-- Seguem mesma lógica de projects
-- =============================================================================

-- Schedules
CREATE POLICY "Schedules: all roles can view"
    ON public.project_schedules FOR SELECT
    USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Schedules: admin/user can insert"
    ON public.project_schedules FOR INSERT
    WITH CHECK (
        tenant_id = public.get_user_tenant_id() 
        AND public.get_user_role() IN ('admin', 'user')
    );

CREATE POLICY "Schedules: admin/user can update"
    ON public.project_schedules FOR UPDATE
    USING (
        tenant_id = public.get_user_tenant_id() 
        AND public.get_user_role() IN ('admin', 'user')
    );

-- Deliveries
CREATE POLICY "Deliveries: all roles can view"
    ON public.project_deliveries FOR SELECT
    USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Deliveries: admin/user can insert"
    ON public.project_deliveries FOR INSERT
    WITH CHECK (
        tenant_id = public.get_user_tenant_id() 
        AND public.get_user_role() IN ('admin', 'user')
    );

CREATE POLICY "Deliveries: admin/user can update"
    ON public.project_deliveries FOR UPDATE
    USING (
        tenant_id = public.get_user_tenant_id() 
        AND public.get_user_role() IN ('admin', 'user')
    );

-- Requirements
CREATE POLICY "Requirements: all roles can view"
    ON public.project_requirements FOR SELECT
    USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Requirements: admin/user can insert"
    ON public.project_requirements FOR INSERT
    WITH CHECK (
        tenant_id = public.get_user_tenant_id() 
        AND public.get_user_role() IN ('admin', 'user')
    );

CREATE POLICY "Requirements: admin/user can update"
    ON public.project_requirements FOR UPDATE
    USING (
        tenant_id = public.get_user_tenant_id() 
        AND public.get_user_role() IN ('admin', 'user')
    );

-- =============================================================================
-- POLÍTICAS: sync_logs
-- Apenas admins podem ver logs de sincronização
-- =============================================================================
CREATE POLICY "Sync logs: only admins can view"
    ON public.sync_logs FOR SELECT
    USING (
        tenant_id = public.get_user_tenant_id() 
        AND public.get_user_role() = 'admin'
    );

CREATE POLICY "Sync logs: system can insert (via service role)"
    ON public.sync_logs FOR INSERT
    WITH CHECK (tenant_id = public.get_user_tenant_id());

-- =============================================================================
-- GRANT: Permissões para roles Supabase
-- =============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
