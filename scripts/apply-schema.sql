-- =============================================================================
-- Tech Arauz - Schema Consolidado & Idempotente
-- Script: apply-schema.sql
-- =============================================================================
-- Este script consolida 001 + 002 + 003 em um único script idempotente
-- que pode ser executado múltiplas vezes com segurança (IF NOT EXISTS / OR REPLACE).
--
-- COMO USAR:
-- 1. Via Supabase Dashboard → SQL Editor → colar e executar
-- 2. Via MCP: apply_migration("apply_full_schema", <conteúdo deste arquivo>)
-- 3. Via CLI: supabase db push (se usando Supabase CLI local)
--
-- ORDEM DE EXECUÇÃO:
-- Fase 1: Tabelas (CREATE TABLE IF NOT EXISTS)
-- Fase 2: Índices (CREATE INDEX IF NOT EXISTS)
-- Fase 3: Funções (CREATE OR REPLACE FUNCTION)
-- Fase 4: Triggers (DROP IF EXISTS + CREATE)
-- Fase 5: RLS Policies (DROP IF EXISTS + CREATE)
-- Fase 6: GRANTs
-- Fase 7: Seed Data (ON CONFLICT DO NOTHING)
-- =============================================================================

-- ===================== FASE 1: TABELAS =====================

-- 1.1 tenants
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.tenants IS 'Tenants do sistema (single-tenant inicial, multi-tenant ready)';

-- 1.2 profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'user', 'viewer')),
    avatar_url TEXT,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.profiles IS 'Perfis de usuário vinculados a auth.users';
COMMENT ON COLUMN public.profiles.role IS 'admin: full access, user: read/write, viewer: read-only';

-- 1.3 projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    espaider_id INTEGER NOT NULL,
    codigo TEXT NOT NULL,
    titulo TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Novo',
    responsavel TEXT,
    prioridade TEXT DEFAULT 'Normal',
    categoria TEXT,
    prazo_final DATE,
    espaider_raw JSONB,
    sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'error')),
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, espaider_id)
);
COMMENT ON TABLE public.projects IS 'Projetos sincronizados do ERP Espaider';

-- 1.4 project_schedules
CREATE TABLE IF NOT EXISTS public.project_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    espaider_id INTEGER NOT NULL,
    atividade TEXT NOT NULL,
    responsavel TEXT,
    data_inicio DATE,
    data_fim DATE,
    status TEXT DEFAULT 'Pendente',
    espaider_raw JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, espaider_id)
);
COMMENT ON TABLE public.project_schedules IS 'Cronogramas de projetos (filhos de projects)';

-- 1.5 project_deliveries
CREATE TABLE IF NOT EXISTS public.project_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    espaider_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    status TEXT DEFAULT 'Pendente',
    data_prevista DATE,
    data_realizada DATE,
    espaider_raw JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, espaider_id)
);
COMMENT ON TABLE public.project_deliveries IS 'Entregas de projetos (filhos de projects)';

-- 1.6 project_requirements
CREATE TABLE IF NOT EXISTS public.project_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    espaider_id INTEGER NOT NULL,
    codigo TEXT NOT NULL,
    descricao TEXT,
    tipo TEXT,
    prioridade TEXT DEFAULT 'Normal',
    status TEXT DEFAULT 'Aberto',
    espaider_raw JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, espaider_id)
);
COMMENT ON TABLE public.project_requirements IS 'Requisitos de projetos (filhos de projects)';

-- 1.7 sync_logs
CREATE TABLE IF NOT EXISTS public.sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    request_id TEXT NOT NULL,
    dataset TEXT NOT NULL CHECK (dataset IN ('Projetos', 'Entregas', 'Cronogramas', 'Requisitos')),
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    total_records INTEGER DEFAULT 0,
    new_records INTEGER DEFAULT 0,
    updated_records INTEGER DEFAULT 0,
    errors INTEGER DEFAULT 0,
    retries INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'partial', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.sync_logs IS 'Log de sincronizações com Espaider para auditoria';

-- ===================== FASE 2: ÍNDICES =====================

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_projects_tenant_id ON public.projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_prioridade ON public.projects(prioridade);
CREATE INDEX IF NOT EXISTS idx_projects_responsavel ON public.projects(responsavel);
CREATE INDEX IF NOT EXISTS idx_projects_prazo_final ON public.projects(prazo_final);
CREATE INDEX IF NOT EXISTS idx_projects_espaider_id ON public.projects(espaider_id);
CREATE INDEX IF NOT EXISTS idx_project_schedules_project_id ON public.project_schedules(project_id);
CREATE INDEX IF NOT EXISTS idx_project_schedules_tenant_id ON public.project_schedules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_project_deliveries_project_id ON public.project_deliveries(project_id);
CREATE INDEX IF NOT EXISTS idx_project_deliveries_tenant_id ON public.project_deliveries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_project_requirements_project_id ON public.project_requirements(project_id);
CREATE INDEX IF NOT EXISTS idx_project_requirements_tenant_id ON public.project_requirements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_tenant_id ON public.sync_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_dataset ON public.sync_logs(dataset);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON public.sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON public.sync_logs(created_at DESC);

-- ===================== FASE 3: FUNÇÕES =====================

-- 3.1 handle_updated_at (trigger function)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- 3.2 get_user_tenant_id (RLS helper)
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT tenant_id 
        FROM public.profiles 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 3.3 get_user_role (RLS helper)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM public.profiles 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ===================== FASE 4: TRIGGERS (idempotente via DROP + CREATE) =====================

DROP TRIGGER IF EXISTS set_updated_at_tenants ON public.tenants;
CREATE TRIGGER set_updated_at_tenants
    BEFORE UPDATE ON public.tenants
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_projects ON public.projects;
CREATE TRIGGER set_updated_at_projects
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_project_schedules ON public.project_schedules;
CREATE TRIGGER set_updated_at_project_schedules
    BEFORE UPDATE ON public.project_schedules
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_project_deliveries ON public.project_deliveries;
CREATE TRIGGER set_updated_at_project_deliveries
    BEFORE UPDATE ON public.project_deliveries
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_project_requirements ON public.project_requirements;
CREATE TRIGGER set_updated_at_project_requirements
    BEFORE UPDATE ON public.project_requirements
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ===================== FASE 5: RLS =====================

-- 5.1 Habilitar RLS em todas as tabelas
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- 5.2 Policies (idempotente via DROP IF EXISTS + CREATE)

-- tenants
DROP POLICY IF EXISTS "Tenants: users can view their own tenant" ON public.tenants;
CREATE POLICY "Tenants: users can view their own tenant"
    ON public.tenants FOR SELECT
    USING (id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Tenants: only admins can update" ON public.tenants;
CREATE POLICY "Tenants: only admins can update"
    ON public.tenants FOR UPDATE
    USING (id = public.get_user_tenant_id() AND public.get_user_role() = 'admin');

-- profiles
DROP POLICY IF EXISTS "Profiles: users can view profiles in their tenant" ON public.profiles;
CREATE POLICY "Profiles: users can view profiles in their tenant"
    ON public.profiles FOR SELECT
    USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Profiles: users can update their own profile" ON public.profiles;
CREATE POLICY "Profiles: users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid());

DROP POLICY IF EXISTS "Profiles: admins can insert new profiles" ON public.profiles;
CREATE POLICY "Profiles: admins can insert new profiles"
    ON public.profiles FOR INSERT
    WITH CHECK (
        tenant_id = public.get_user_tenant_id() 
        AND public.get_user_role() = 'admin'
    );

DROP POLICY IF EXISTS "Profiles: admins can update any profile in tenant" ON public.profiles;
CREATE POLICY "Profiles: admins can update any profile in tenant"
    ON public.profiles FOR UPDATE
    USING (
        tenant_id = public.get_user_tenant_id() 
        AND public.get_user_role() = 'admin'
    );

-- projects
DROP POLICY IF EXISTS "Projects: all roles can view tenant projects" ON public.projects;
CREATE POLICY "Projects: all roles can view tenant projects"
    ON public.projects FOR SELECT
    USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Projects: admin/user can insert" ON public.projects;
CREATE POLICY "Projects: admin/user can insert"
    ON public.projects FOR INSERT
    WITH CHECK (
        tenant_id = public.get_user_tenant_id() 
        AND public.get_user_role() IN ('admin', 'user')
    );

DROP POLICY IF EXISTS "Projects: admin/user can update" ON public.projects;
CREATE POLICY "Projects: admin/user can update"
    ON public.projects FOR UPDATE
    USING (
        tenant_id = public.get_user_tenant_id() 
        AND public.get_user_role() IN ('admin', 'user')
    );

DROP POLICY IF EXISTS "Projects: only admin can delete" ON public.projects;
CREATE POLICY "Projects: only admin can delete"
    ON public.projects FOR DELETE
    USING (
        tenant_id = public.get_user_tenant_id() 
        AND public.get_user_role() = 'admin'
    );

-- project_schedules
DROP POLICY IF EXISTS "Schedules: all roles can view" ON public.project_schedules;
CREATE POLICY "Schedules: all roles can view"
    ON public.project_schedules FOR SELECT
    USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Schedules: admin/user can insert" ON public.project_schedules;
CREATE POLICY "Schedules: admin/user can insert"
    ON public.project_schedules FOR INSERT
    WITH CHECK (
        tenant_id = public.get_user_tenant_id() 
        AND public.get_user_role() IN ('admin', 'user')
    );

DROP POLICY IF EXISTS "Schedules: admin/user can update" ON public.project_schedules;
CREATE POLICY "Schedules: admin/user can update"
    ON public.project_schedules FOR UPDATE
    USING (
        tenant_id = public.get_user_tenant_id() 
        AND public.get_user_role() IN ('admin', 'user')
    );

-- project_deliveries
DROP POLICY IF EXISTS "Deliveries: all roles can view" ON public.project_deliveries;
CREATE POLICY "Deliveries: all roles can view"
    ON public.project_deliveries FOR SELECT
    USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Deliveries: admin/user can insert" ON public.project_deliveries;
CREATE POLICY "Deliveries: admin/user can insert"
    ON public.project_deliveries FOR INSERT
    WITH CHECK (
        tenant_id = public.get_user_tenant_id() 
        AND public.get_user_role() IN ('admin', 'user')
    );

DROP POLICY IF EXISTS "Deliveries: admin/user can update" ON public.project_deliveries;
CREATE POLICY "Deliveries: admin/user can update"
    ON public.project_deliveries FOR UPDATE
    USING (
        tenant_id = public.get_user_tenant_id() 
        AND public.get_user_role() IN ('admin', 'user')
    );

-- project_requirements
DROP POLICY IF EXISTS "Requirements: all roles can view" ON public.project_requirements;
CREATE POLICY "Requirements: all roles can view"
    ON public.project_requirements FOR SELECT
    USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Requirements: admin/user can insert" ON public.project_requirements;
CREATE POLICY "Requirements: admin/user can insert"
    ON public.project_requirements FOR INSERT
    WITH CHECK (
        tenant_id = public.get_user_tenant_id() 
        AND public.get_user_role() IN ('admin', 'user')
    );

DROP POLICY IF EXISTS "Requirements: admin/user can update" ON public.project_requirements;
CREATE POLICY "Requirements: admin/user can update"
    ON public.project_requirements FOR UPDATE
    USING (
        tenant_id = public.get_user_tenant_id() 
        AND public.get_user_role() IN ('admin', 'user')
    );

-- sync_logs
DROP POLICY IF EXISTS "Sync logs: only admins can view" ON public.sync_logs;
CREATE POLICY "Sync logs: only admins can view"
    ON public.sync_logs FOR SELECT
    USING (
        tenant_id = public.get_user_tenant_id() 
        AND public.get_user_role() = 'admin'
    );

DROP POLICY IF EXISTS "Sync logs: system can insert (via service role)" ON public.sync_logs;
CREATE POLICY "Sync logs: system can insert (via service role)"
    ON public.sync_logs FOR INSERT
    WITH CHECK (tenant_id = public.get_user_tenant_id());

-- ===================== FASE 6: GRANTS =====================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ===================== FASE 7: SEED DATA =====================

INSERT INTO public.tenants (id, slug, name, settings)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'arauz',
    'Araúz & Advogados',
    '{"theme": "default", "language": "pt-BR"}'
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    updated_at = NOW();

-- ===================== VERIFICAÇÃO =====================
-- Execute após aplicar para confirmar:
--
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- Esperado: 7 tabelas (profiles, project_deliveries, project_requirements,
--           project_schedules, projects, sync_logs, tenants)
--
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- Esperado: todas com rowsecurity = true
--
-- SELECT * FROM public.tenants;
-- Esperado: 1 row com slug='arauz', name='Araúz & Advogados'
-- =============================================================================
