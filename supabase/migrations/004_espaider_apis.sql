-- =============================================================================
-- Tech Arauz - Tabela de APIs Espaider
-- Migration 004: Cadastro de integrações Espaider
-- =============================================================================
-- @database-architect: Tabela para gestão de APIs Espaider no portal
-- Permite cadastrar múltiplas APIs com diferentes identificadores
-- =============================================================================

-- Tabela: espaider_apis
CREATE TABLE IF NOT EXISTS public.espaider_apis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    base_url TEXT NOT NULL,
    token TEXT NOT NULL,
    identificador TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'projetos'
        CHECK (tipo IN ('projetos', 'entregas', 'cronogramas', 'requisitos')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_sync_at TIMESTAMPTZ,
    last_sync_status TEXT CHECK (last_sync_status IN ('success', 'partial', 'failed')),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, identificador)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_espaider_apis_tenant_id ON public.espaider_apis(tenant_id);
CREATE INDEX IF NOT EXISTS idx_espaider_apis_tipo ON public.espaider_apis(tipo);
CREATE INDEX IF NOT EXISTS idx_espaider_apis_active ON public.espaider_apis(is_active);

COMMENT ON TABLE public.espaider_apis IS 'Cadastro de APIs Espaider para integração';

-- Trigger updated_at
DROP TRIGGER IF EXISTS set_updated_at_espaider_apis ON public.espaider_apis;
CREATE TRIGGER set_updated_at_espaider_apis
    BEFORE UPDATE ON public.espaider_apis
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.espaider_apis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "APIs: all roles can view" ON public.espaider_apis;
CREATE POLICY "APIs: all roles can view"
    ON public.espaider_apis FOR SELECT
    USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "APIs: only admins can insert" ON public.espaider_apis;
CREATE POLICY "APIs: only admins can insert"
    ON public.espaider_apis FOR INSERT
    WITH CHECK (
        tenant_id = public.get_user_tenant_id()
        AND public.get_user_role() = 'admin'
    );

DROP POLICY IF EXISTS "APIs: only admins can update" ON public.espaider_apis;
CREATE POLICY "APIs: only admins can update"
    ON public.espaider_apis FOR UPDATE
    USING (
        tenant_id = public.get_user_tenant_id()
        AND public.get_user_role() = 'admin'
    );

DROP POLICY IF EXISTS "APIs: only admins can delete" ON public.espaider_apis;
CREATE POLICY "APIs: only admins can delete"
    ON public.espaider_apis FOR DELETE
    USING (
        tenant_id = public.get_user_tenant_id()
        AND public.get_user_role() = 'admin'
    );

-- Seed: APIs padrão do tenant Araúz
INSERT INTO public.espaider_apis (tenant_id, nome, base_url, token, identificador, tipo)
VALUES
    ('00000000-0000-0000-0000-000000000001',
     'Projetos',
     'https://espaider.com.br/Arauz/WCF/WCFExportaDados/WCFExportaDados.svc',
     'PREENCHER_TOKEN',
     'BI_SOLICITACOES_SUPORTEESPAIDER',
     'projetos'),
    ('00000000-0000-0000-0000-000000000001',
     'Entregas',
     'https://espaider.com.br/Arauz/WCF/WCFExportaDados/WCFExportaDados.svc',
     'PREENCHER_TOKEN',
     'BI_SOLICITACOES_SUPORTEESPAIDER_ENTREGAS',
     'entregas'),
    ('00000000-0000-0000-0000-000000000001',
     'Cronogramas',
     'https://espaider.com.br/Arauz/WCF/WCFExportaDados/WCFExportaDados.svc',
     'PREENCHER_TOKEN',
     'BI_SOLICITACOES_SUPORTEESPAIDER_CRONOGRAMAS',
     'cronogramas'),
    ('00000000-0000-0000-0000-000000000001',
     'Requisitos',
     'https://espaider.com.br/Arauz/WCF/WCFExportaDados/WCFExportaDados.svc',
     'PREENCHER_TOKEN',
     'BI_SOLICITACOES_SUPORTEESPAIDER_REQUISITOS',
     'requisitos')
ON CONFLICT (tenant_id, identificador) DO NOTHING;
