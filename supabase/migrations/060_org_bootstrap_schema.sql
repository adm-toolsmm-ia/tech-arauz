-- =============================================================================
-- Migration 060: AI Organizational Bootstrap Schema
-- Story 6.1.1: Schema org_* + RLS + índices
-- Epic: AI Organizational Bootstrap
-- Date: 2026-03-07
-- =============================================================================
-- OBJETIVO: Criar modelo de dados para Organizational Knowledge Graph
-- Entidades: Area, Nucleus, Process, Routine, Activity, System, Supplier, Service, Document
-- =============================================================================

-- =============================================================================
-- ENUMS
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'org_activity_complexity') THEN
    CREATE TYPE org_activity_complexity AS ENUM ('low', 'medium', 'high');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'org_activity_priority') THEN
    CREATE TYPE org_activity_priority AS ENUM ('low', 'normal', 'high');
  END IF;
END$$;

-- =============================================================================
-- TABELA: org_areas
-- Grandes domínios da organização (ex.: Recuperação de Crédito, Legal Operations)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.org_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  objective TEXT,
  responsible_roles JSONB DEFAULT '[]',
  documentation JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_areas_tenant_id ON public.org_areas(tenant_id);

COMMENT ON TABLE public.org_areas IS 'AI Organizational Bootstrap: Grandes domínios da organização';
COMMENT ON COLUMN public.org_areas.responsible_roles IS 'Array de roles responsáveis (ex.: ["advogado_senior", "coordenador"])';
COMMENT ON COLUMN public.org_areas.documentation IS 'Procedures, instructions, best_practices, internal_guidelines, common_errors';

-- =============================================================================
-- TABELA: org_nuclei
-- Especializações dentro das áreas (ex.: Núcleo de Ajuizamento, Núcleo de Protocolos)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.org_nuclei (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  area_id UUID NOT NULL REFERENCES public.org_areas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  objective TEXT,
  responsible_roles JSONB DEFAULT '[]',
  documentation JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_nuclei_tenant_id ON public.org_nuclei(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_nuclei_area_id ON public.org_nuclei(area_id);

COMMENT ON TABLE public.org_nuclei IS 'AI Organizational Bootstrap: Especializações dentro das áreas';

-- =============================================================================
-- TABELA: org_processes
-- Fluxos operacionais completos (ex.: Gestão de Processos Contenciosos)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.org_processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  area_id UUID REFERENCES public.org_areas(id) ON DELETE SET NULL,
  nucleus_id UUID REFERENCES public.org_nuclei(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  objective TEXT,
  inputs JSONB DEFAULT '[]',
  outputs JSONB DEFAULT '[]',
  responsible_roles JSONB DEFAULT '[]',
  risks JSONB DEFAULT '[]',
  impacts JSONB DEFAULT '[]',
  documentation JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_processes_tenant_id ON public.org_processes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_processes_area_id ON public.org_processes(area_id);
CREATE INDEX IF NOT EXISTS idx_org_processes_nucleus_id ON public.org_processes(nucleus_id);

COMMENT ON TABLE public.org_processes IS 'AI Organizational Bootstrap: Fluxos operacionais completos';

-- =============================================================================
-- TABELA: org_routines
-- Conjunto recorrente de atividades dentro de um processo
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.org_routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  process_id UUID NOT NULL REFERENCES public.org_processes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  objective TEXT,
  responsible_roles JSONB DEFAULT '[]',
  documentation JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_routines_tenant_id ON public.org_routines(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_routines_process_id ON public.org_routines(process_id);

COMMENT ON TABLE public.org_routines IS 'AI Organizational Bootstrap: Rotinas recorrentes dentro de processos';

-- =============================================================================
-- TABELA: org_activities
-- Unidade operacional executada por colaboradores
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.org_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  routine_id UUID NOT NULL REFERENCES public.org_routines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  objective TEXT,
  complexity org_activity_complexity DEFAULT 'medium',
  priority org_activity_priority DEFAULT 'normal',
  required_role TEXT,
  average_execution_time INTEGER,
  inputs JSONB DEFAULT '[]',
  outputs JSONB DEFAULT '[]',
  risks JSONB DEFAULT '[]',
  impacts JSONB DEFAULT '[]',
  documentation JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_activities_tenant_id ON public.org_activities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_activities_routine_id ON public.org_activities(routine_id);

COMMENT ON TABLE public.org_activities IS 'AI Organizational Bootstrap: Atividades executadas por colaboradores';
COMMENT ON COLUMN public.org_activities.average_execution_time IS 'Tempo médio de execução em minutos';
COMMENT ON COLUMN public.org_activities.documentation IS 'procedures, step_by_step, best_practices, common_errors, guidelines';

-- =============================================================================
-- TABELA: org_systems
-- Softwares utilizados (ex.: sistema jurídico, CRM)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.org_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  purpose TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_systems_tenant_id ON public.org_systems(tenant_id);

COMMENT ON TABLE public.org_systems IS 'AI Organizational Bootstrap: Softwares utilizados na operação';

-- =============================================================================
-- TABELA: org_system_resources
-- Funcionalidades específicas dentro de um sistema
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.org_system_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  system_id UUID NOT NULL REFERENCES public.org_systems(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_system_resources_tenant_id ON public.org_system_resources(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_system_resources_system_id ON public.org_system_resources(system_id);

COMMENT ON TABLE public.org_system_resources IS 'AI Organizational Bootstrap: Funcionalidades dentro de sistemas';

-- =============================================================================
-- TABELA: org_suppliers
-- Empresas externas (ex.: correspondentes jurídicos, contabilidade)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.org_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_suppliers_tenant_id ON public.org_suppliers(tenant_id);

COMMENT ON TABLE public.org_suppliers IS 'AI Organizational Bootstrap: Fornecedores externos';

-- =============================================================================
-- TABELA: org_services
-- Serviços utilizados nas operações (ex.: diligência externa, protocolo físico)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.org_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_services_tenant_id ON public.org_services(tenant_id);

COMMENT ON TABLE public.org_services IS 'AI Organizational Bootstrap: Serviços operacionais';

-- =============================================================================
-- TABELA: org_documents
-- Modelos ou documentos utilizados (ex.: modelo de petição, checklist)
-- Diferente de documents (Markdown docs) - esta é para templates organizacionais
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.org_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  description TEXT,
  associated_process_id UUID REFERENCES public.org_processes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_documents_tenant_id ON public.org_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_documents_process_id ON public.org_documents(associated_process_id);

COMMENT ON TABLE public.org_documents IS 'AI Organizational Bootstrap: Modelos e documentos organizacionais (distinto de documents)';

-- =============================================================================
-- TABELAS N:N
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.org_process_systems (
  process_id UUID NOT NULL REFERENCES public.org_processes(id) ON DELETE CASCADE,
  system_id UUID NOT NULL REFERENCES public.org_systems(id) ON DELETE CASCADE,
  PRIMARY KEY (process_id, system_id)
);

CREATE INDEX IF NOT EXISTS idx_org_process_systems_process ON public.org_process_systems(process_id);
CREATE INDEX IF NOT EXISTS idx_org_process_systems_system ON public.org_process_systems(system_id);

CREATE TABLE IF NOT EXISTS public.org_activity_documents (
  activity_id UUID NOT NULL REFERENCES public.org_activities(id) ON DELETE CASCADE,
  org_document_id UUID NOT NULL REFERENCES public.org_documents(id) ON DELETE CASCADE,
  PRIMARY KEY (activity_id, org_document_id)
);

CREATE INDEX IF NOT EXISTS idx_org_activity_documents_activity ON public.org_activity_documents(activity_id);
CREATE INDEX IF NOT EXISTS idx_org_activity_documents_doc ON public.org_activity_documents(org_document_id);

-- =============================================================================
-- AI Bootstrap Engine: org_company_types
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.org_company_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_org_company_types_tenant_id ON public.org_company_types(tenant_id);

-- =============================================================================
-- AI Bootstrap Engine: org_bootstrap_templates
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.org_bootstrap_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_type_id UUID NOT NULL REFERENCES public.org_company_types(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_bootstrap_templates_company ON public.org_bootstrap_templates(company_type_id);

-- =============================================================================
-- TRIGGERS updated_at
-- =============================================================================

CREATE TRIGGER org_areas_updated_at
  BEFORE UPDATE ON public.org_areas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER org_nuclei_updated_at
  BEFORE UPDATE ON public.org_nuclei
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER org_processes_updated_at
  BEFORE UPDATE ON public.org_processes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER org_routines_updated_at
  BEFORE UPDATE ON public.org_routines
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER org_activities_updated_at
  BEFORE UPDATE ON public.org_activities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER org_systems_updated_at
  BEFORE UPDATE ON public.org_systems
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER org_system_resources_updated_at
  BEFORE UPDATE ON public.org_system_resources
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER org_suppliers_updated_at
  BEFORE UPDATE ON public.org_suppliers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER org_services_updated_at
  BEFORE UPDATE ON public.org_services
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER org_documents_updated_at
  BEFORE UPDATE ON public.org_documents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER org_company_types_updated_at
  BEFORE UPDATE ON public.org_company_types
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER org_bootstrap_templates_updated_at
  BEFORE UPDATE ON public.org_bootstrap_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

ALTER TABLE public.org_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_nuclei ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_system_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_company_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_bootstrap_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_process_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_activity_documents ENABLE ROW LEVEL SECURITY;

-- org_areas
CREATE POLICY "org_areas_tenant_isolation_select" ON public.org_areas FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_areas_tenant_isolation_insert" ON public.org_areas FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_areas_tenant_isolation_update" ON public.org_areas FOR UPDATE USING (tenant_id = public.get_user_tenant_id()) WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_areas_tenant_isolation_delete" ON public.org_areas FOR DELETE USING (tenant_id = public.get_user_tenant_id());

-- org_nuclei
CREATE POLICY "org_nuclei_tenant_isolation_select" ON public.org_nuclei FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_nuclei_tenant_isolation_insert" ON public.org_nuclei FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_nuclei_tenant_isolation_update" ON public.org_nuclei FOR UPDATE USING (tenant_id = public.get_user_tenant_id()) WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_nuclei_tenant_isolation_delete" ON public.org_nuclei FOR DELETE USING (tenant_id = public.get_user_tenant_id());

-- org_processes
CREATE POLICY "org_processes_tenant_isolation_select" ON public.org_processes FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_processes_tenant_isolation_insert" ON public.org_processes FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_processes_tenant_isolation_update" ON public.org_processes FOR UPDATE USING (tenant_id = public.get_user_tenant_id()) WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_processes_tenant_isolation_delete" ON public.org_processes FOR DELETE USING (tenant_id = public.get_user_tenant_id());

-- org_routines
CREATE POLICY "org_routines_tenant_isolation_select" ON public.org_routines FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_routines_tenant_isolation_insert" ON public.org_routines FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_routines_tenant_isolation_update" ON public.org_routines FOR UPDATE USING (tenant_id = public.get_user_tenant_id()) WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_routines_tenant_isolation_delete" ON public.org_routines FOR DELETE USING (tenant_id = public.get_user_tenant_id());

-- org_activities
CREATE POLICY "org_activities_tenant_isolation_select" ON public.org_activities FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_activities_tenant_isolation_insert" ON public.org_activities FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_activities_tenant_isolation_update" ON public.org_activities FOR UPDATE USING (tenant_id = public.get_user_tenant_id()) WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_activities_tenant_isolation_delete" ON public.org_activities FOR DELETE USING (tenant_id = public.get_user_tenant_id());

-- org_systems
CREATE POLICY "org_systems_tenant_isolation_select" ON public.org_systems FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_systems_tenant_isolation_insert" ON public.org_systems FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_systems_tenant_isolation_update" ON public.org_systems FOR UPDATE USING (tenant_id = public.get_user_tenant_id()) WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_systems_tenant_isolation_delete" ON public.org_systems FOR DELETE USING (tenant_id = public.get_user_tenant_id());

-- org_system_resources (via system -> tenant)
CREATE POLICY "org_system_resources_tenant_isolation_select" ON public.org_system_resources FOR SELECT
  USING (system_id IN (SELECT id FROM public.org_systems WHERE tenant_id = public.get_user_tenant_id()));
CREATE POLICY "org_system_resources_tenant_isolation_insert" ON public.org_system_resources FOR INSERT
  WITH CHECK (system_id IN (SELECT id FROM public.org_systems WHERE tenant_id = public.get_user_tenant_id()));
CREATE POLICY "org_system_resources_tenant_isolation_update" ON public.org_system_resources FOR UPDATE
  USING (system_id IN (SELECT id FROM public.org_systems WHERE tenant_id = public.get_user_tenant_id()))
  WITH CHECK (system_id IN (SELECT id FROM public.org_systems WHERE tenant_id = public.get_user_tenant_id()));
CREATE POLICY "org_system_resources_tenant_isolation_delete" ON public.org_system_resources FOR DELETE
  USING (system_id IN (SELECT id FROM public.org_systems WHERE tenant_id = public.get_user_tenant_id()));

-- org_suppliers
CREATE POLICY "org_suppliers_tenant_isolation_select" ON public.org_suppliers FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_suppliers_tenant_isolation_insert" ON public.org_suppliers FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_suppliers_tenant_isolation_update" ON public.org_suppliers FOR UPDATE USING (tenant_id = public.get_user_tenant_id()) WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_suppliers_tenant_isolation_delete" ON public.org_suppliers FOR DELETE USING (tenant_id = public.get_user_tenant_id());

-- org_services
CREATE POLICY "org_services_tenant_isolation_select" ON public.org_services FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_services_tenant_isolation_insert" ON public.org_services FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_services_tenant_isolation_update" ON public.org_services FOR UPDATE USING (tenant_id = public.get_user_tenant_id()) WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_services_tenant_isolation_delete" ON public.org_services FOR DELETE USING (tenant_id = public.get_user_tenant_id());

-- org_documents
CREATE POLICY "org_documents_tenant_isolation_select" ON public.org_documents FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_documents_tenant_isolation_insert" ON public.org_documents FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_documents_tenant_isolation_update" ON public.org_documents FOR UPDATE USING (tenant_id = public.get_user_tenant_id()) WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_documents_tenant_isolation_delete" ON public.org_documents FOR DELETE USING (tenant_id = public.get_user_tenant_id());

-- org_company_types
CREATE POLICY "org_company_types_tenant_isolation_select" ON public.org_company_types FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_company_types_tenant_isolation_insert" ON public.org_company_types FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_company_types_tenant_isolation_update" ON public.org_company_types FOR UPDATE USING (tenant_id = public.get_user_tenant_id()) WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "org_company_types_tenant_isolation_delete" ON public.org_company_types FOR DELETE USING (tenant_id = public.get_user_tenant_id());

-- org_bootstrap_templates (via company_type -> tenant)
CREATE POLICY "org_bootstrap_templates_tenant_isolation_select" ON public.org_bootstrap_templates FOR SELECT
  USING (company_type_id IN (SELECT id FROM public.org_company_types WHERE tenant_id = public.get_user_tenant_id()));
CREATE POLICY "org_bootstrap_templates_tenant_isolation_insert" ON public.org_bootstrap_templates FOR INSERT
  WITH CHECK (company_type_id IN (SELECT id FROM public.org_company_types WHERE tenant_id = public.get_user_tenant_id()));
CREATE POLICY "org_bootstrap_templates_tenant_isolation_update" ON public.org_bootstrap_templates FOR UPDATE
  USING (company_type_id IN (SELECT id FROM public.org_company_types WHERE tenant_id = public.get_user_tenant_id()))
  WITH CHECK (company_type_id IN (SELECT id FROM public.org_company_types WHERE tenant_id = public.get_user_tenant_id()));
CREATE POLICY "org_bootstrap_templates_tenant_isolation_delete" ON public.org_bootstrap_templates FOR DELETE
  USING (company_type_id IN (SELECT id FROM public.org_company_types WHERE tenant_id = public.get_user_tenant_id()));

-- org_process_systems (via process -> tenant)
CREATE POLICY "org_process_systems_tenant_isolation_select" ON public.org_process_systems FOR SELECT
  USING (process_id IN (SELECT id FROM public.org_processes WHERE tenant_id = public.get_user_tenant_id()));
CREATE POLICY "org_process_systems_tenant_isolation_insert" ON public.org_process_systems FOR INSERT
  WITH CHECK (process_id IN (SELECT id FROM public.org_processes WHERE tenant_id = public.get_user_tenant_id()));
CREATE POLICY "org_process_systems_tenant_isolation_delete" ON public.org_process_systems FOR DELETE
  USING (process_id IN (SELECT id FROM public.org_processes WHERE tenant_id = public.get_user_tenant_id()));

-- org_activity_documents (via activity -> tenant)
CREATE POLICY "org_activity_documents_tenant_isolation_select" ON public.org_activity_documents FOR SELECT
  USING (activity_id IN (SELECT id FROM public.org_activities WHERE tenant_id = public.get_user_tenant_id()));
CREATE POLICY "org_activity_documents_tenant_isolation_insert" ON public.org_activity_documents FOR INSERT
  WITH CHECK (activity_id IN (SELECT id FROM public.org_activities WHERE tenant_id = public.get_user_tenant_id()));
CREATE POLICY "org_activity_documents_tenant_isolation_delete" ON public.org_activity_documents FOR DELETE
  USING (activity_id IN (SELECT id FROM public.org_activities WHERE tenant_id = public.get_user_tenant_id()));
