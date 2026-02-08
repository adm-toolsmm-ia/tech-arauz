-- =============================================================================
-- Tech Arauz - Schema do Banco de Dados
-- Migration 001: Estrutura Base
-- =============================================================================
-- Aplicando princípios do @database-architect:
-- - Data integrity via constraints
-- - RLS para tenant isolation
-- - Índices baseados em query patterns
-- - Tipos apropriados (não TEXT para tudo)
-- =============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABELA: tenants
-- Single-tenant inicial, preparado para multi-tenant
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para lookup por slug (query pattern principal)
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);

COMMENT ON TABLE public.tenants IS 'Tenants do sistema (single-tenant inicial, multi-tenant ready)';

-- =============================================================================
-- TABELA: profiles (extensão de auth.users)
-- Supabase Auth gerencia users, profiles adiciona metadata
-- =============================================================================
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

-- Índices para query patterns comuns
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

COMMENT ON TABLE public.profiles IS 'Perfis de usuário vinculados a auth.users';
COMMENT ON COLUMN public.profiles.role IS 'admin: full access, user: read/write, viewer: read-only';

-- =============================================================================
-- TABELA: projects
-- Projetos sincronizados do Espaider
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    
    -- Identificadores Espaider
    espaider_id INTEGER NOT NULL,
    codigo TEXT NOT NULL,
    
    -- Dados do projeto
    titulo TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Novo',
    responsavel TEXT,
    prioridade TEXT DEFAULT 'Normal',
    categoria TEXT,
    prazo_final DATE,
    
    -- Metadados
    espaider_raw JSONB,  -- Dados brutos do Espaider (backup)
    sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'error')),
    last_sync_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(tenant_id, espaider_id)
);

-- Índices baseados em query patterns (listagem, filtros)
CREATE INDEX IF NOT EXISTS idx_projects_tenant_id ON public.projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_prioridade ON public.projects(prioridade);
CREATE INDEX IF NOT EXISTS idx_projects_responsavel ON public.projects(responsavel);
CREATE INDEX IF NOT EXISTS idx_projects_prazo_final ON public.projects(prazo_final);
CREATE INDEX IF NOT EXISTS idx_projects_espaider_id ON public.projects(espaider_id);

COMMENT ON TABLE public.projects IS 'Projetos sincronizados do ERP Espaider';

-- =============================================================================
-- TABELA: project_schedules (Cronogramas)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.project_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    
    -- Identificador Espaider
    espaider_id INTEGER NOT NULL,
    
    -- Dados do cronograma
    atividade TEXT NOT NULL,
    responsavel TEXT,
    data_inicio DATE,
    data_fim DATE,
    status TEXT DEFAULT 'Pendente',
    
    -- Metadados
    espaider_raw JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(tenant_id, espaider_id)
);

CREATE INDEX IF NOT EXISTS idx_project_schedules_project_id ON public.project_schedules(project_id);
CREATE INDEX IF NOT EXISTS idx_project_schedules_tenant_id ON public.project_schedules(tenant_id);

COMMENT ON TABLE public.project_schedules IS 'Cronogramas de projetos (filhos de projects)';

-- =============================================================================
-- TABELA: project_deliveries (Entregas)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.project_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    
    -- Identificador Espaider
    espaider_id INTEGER NOT NULL,
    
    -- Dados da entrega
    titulo TEXT NOT NULL,
    status TEXT DEFAULT 'Pendente',
    data_prevista DATE,
    data_realizada DATE,
    
    -- Metadados
    espaider_raw JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(tenant_id, espaider_id)
);

CREATE INDEX IF NOT EXISTS idx_project_deliveries_project_id ON public.project_deliveries(project_id);
CREATE INDEX IF NOT EXISTS idx_project_deliveries_tenant_id ON public.project_deliveries(tenant_id);

COMMENT ON TABLE public.project_deliveries IS 'Entregas de projetos (filhos de projects)';

-- =============================================================================
-- TABELA: project_requirements (Requisitos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.project_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    
    -- Identificador Espaider
    espaider_id INTEGER NOT NULL,
    
    -- Dados do requisito
    codigo TEXT NOT NULL,
    descricao TEXT,
    tipo TEXT,
    prioridade TEXT DEFAULT 'Normal',
    status TEXT DEFAULT 'Aberto',
    
    -- Metadados
    espaider_raw JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(tenant_id, espaider_id)
);

CREATE INDEX IF NOT EXISTS idx_project_requirements_project_id ON public.project_requirements(project_id);
CREATE INDEX IF NOT EXISTS idx_project_requirements_tenant_id ON public.project_requirements(tenant_id);

COMMENT ON TABLE public.project_requirements IS 'Requisitos de projetos (filhos de projects)';

-- =============================================================================
-- TABELA: sync_logs
-- Auditoria de sincronizações
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    
    -- Identificação
    request_id TEXT NOT NULL,
    dataset TEXT NOT NULL CHECK (dataset IN ('Projetos', 'Entregas', 'Cronogramas', 'Requisitos')),
    
    -- Métricas
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    total_records INTEGER DEFAULT 0,
    new_records INTEGER DEFAULT 0,
    updated_records INTEGER DEFAULT 0,
    errors INTEGER DEFAULT 0,
    retries INTEGER DEFAULT 0,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'partial', 'failed')),
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_tenant_id ON public.sync_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_dataset ON public.sync_logs(dataset);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON public.sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON public.sync_logs(created_at DESC);

COMMENT ON TABLE public.sync_logs IS 'Log de sincronizações com Espaider para auditoria';

-- =============================================================================
-- FUNÇÕES: updated_at automático
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER set_updated_at_tenants
    BEFORE UPDATE ON public.tenants
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_projects
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_project_schedules
    BEFORE UPDATE ON public.project_schedules
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_project_deliveries
    BEFORE UPDATE ON public.project_deliveries
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_project_requirements
    BEFORE UPDATE ON public.project_requirements
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
