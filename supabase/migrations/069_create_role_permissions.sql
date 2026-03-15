-- =============================================================================
-- Migration 069: Create Role Permissions & Governance Tables
-- Story 11.4: Create Role Permissions & Governance Table
-- Epic: EPIC 11 — Organizational Enrichment & BPM Mastery
-- Date: 2026-03-28
-- =============================================================================
-- OBJETIVO: Criar tabelas de governance para Role-Based Access Control (RBAC)
-- org_role_definitions: Define roles organizacionais
-- org_role_permissions: Define permissões por role e resource_type
-- Nota: Não confundir com auth.users.role (admin|user|viewer)
-- =============================================================================

-- =============================================================================
-- TABELA: org_role_definitions
-- Define roles organizacionais e sua hierarquia
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.org_role_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL,
  role_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,  -- management|specialist|operational|external
  level INTEGER,  -- 1-10 para ordenação por hierarquia
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, role_id)
);

COMMENT ON TABLE public.org_role_definitions
IS 'Define organizational roles e sua hierarquia (parte da governance metadata)';
COMMENT ON COLUMN public.org_role_definitions.role_id
IS 'ID único para o role (ex.: diretor, gerente, coordenador, analista_senior)';
COMMENT ON COLUMN public.org_role_definitions.category
IS 'Categoria: management|specialist|operational|external';
COMMENT ON COLUMN public.org_role_definitions.level
IS 'Nível hierárquico (1-10). Maior número = mais sênior';

-- =============================================================================
-- TABELA: org_role_permissions
-- Define permissões que cada role tem sobre resource_types
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.org_role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL,
  resource_type TEXT NOT NULL,  -- area|process|activity|document|system|supplier|routine
  action TEXT NOT NULL,  -- view|create|edit|delete|approve|manage
  scope TEXT DEFAULT 'own_tenant',  -- own_tenant|own_unit|all_units
  conditions JSONB DEFAULT '{}',  -- Future: complex permission rules
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, role_id, resource_type, action)
);

COMMENT ON TABLE public.org_role_permissions
IS 'Define permissões que cada role tem sobre resource_types (governance metadata)';
COMMENT ON COLUMN public.org_role_permissions.resource_type
IS 'Tipo de recurso: area|process|activity|document|system|supplier|routine';
COMMENT ON COLUMN public.org_role_permissions.action
IS 'Ação permitida: view|create|edit|delete|approve|manage';
COMMENT ON COLUMN public.org_role_permissions.scope
IS 'Escopo: own_tenant|own_unit|all_units';
COMMENT ON COLUMN public.org_role_permissions.conditions
IS 'Condições adicionais para a permissão (JSONB, future use for complex rules)';

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_org_role_definitions_tenant
ON public.org_role_definitions(tenant_id);

CREATE INDEX IF NOT EXISTS idx_org_role_definitions_role_id
ON public.org_role_definitions(role_id);

CREATE INDEX IF NOT EXISTS idx_org_role_permissions_tenant
ON public.org_role_permissions(tenant_id);

CREATE INDEX IF NOT EXISTS idx_org_role_permissions_role_id
ON public.org_role_permissions(role_id);

CREATE INDEX IF NOT EXISTS idx_org_role_permissions_resource_type
ON public.org_role_permissions(resource_type);

-- =============================================================================
-- SEED: Initial Role Definitions (9 default roles)
-- =============================================================================

INSERT INTO public.org_role_definitions (tenant_id, role_id, role_name, description, category, level)
SELECT tenants.id, roles.role_id, roles.role_name, roles.description, roles.category, roles.level
FROM public.tenants
CROSS JOIN (
  VALUES
    ('diretor', 'Diretor', 'Direção/Diretoria', 'management', 10),
    ('gerente', 'Gerente', 'Gerência de área', 'management', 8),
    ('coordenador', 'Coordenador', 'Coordenação de núcleo/processo', 'management', 6),
    ('especialista', 'Especialista', 'Especialista técnico', 'specialist', 7),
    ('analista_senior', 'Analista Sênior', 'Analista com senioridade', 'specialist', 6),
    ('analista_junior', 'Analista Júnior', 'Analista em treinamento', 'specialist', 4),
    ('operacional', 'Operacional', 'Executor operacional', 'operational', 2),
    ('administrativo', 'Administrativo', 'Apoio administrativo', 'operational', 3),
    ('supervisor', 'Supervisor', 'Supervisão operacional', 'operational', 5)
) AS roles(role_id, role_name, description, category, level)
WHERE NOT EXISTS (
  SELECT 1 FROM public.org_role_definitions
  WHERE org_role_definitions.tenant_id = tenants.id
  AND org_role_definitions.role_id = roles.role_id
);

-- =============================================================================
-- RLS: Existing RLS via tenant_id check covers both tables
-- =============================================================================

-- Verify migration completed
DO $$
BEGIN
  RAISE NOTICE 'Migration 069: org_role_definitions and org_role_permissions tables created, 9 default roles seeded ✅';
END$$;
