-- =============================================================================
-- Migration 065: Add responsible_roles to Suppliers, Services, Documents
-- Story 10.1: Add responsible_roles JSONB column to resource tables
-- Epic: 10 — Organization Knowledge Graph Refinement & Synchronization
-- Date: 2026-03-14
-- =============================================================================
-- OBJETIVO: Estender schema para suportar responsible_roles em resources
-- Tabelas: org_suppliers, org_services, org_documents
-- =============================================================================

-- =============================================================================
-- TABELA: org_suppliers
-- =============================================================================

ALTER TABLE public.org_suppliers
ADD COLUMN responsible_roles JSONB DEFAULT '[]' NOT NULL;

CREATE INDEX IF NOT EXISTS idx_org_suppliers_responsible_roles_gin
ON public.org_suppliers USING GIN(responsible_roles);

COMMENT ON COLUMN public.org_suppliers.responsible_roles
IS 'Array of roles responsible for managing this supplier (e.g., ["vendor_manager", "procurement_lead"])';

-- =============================================================================
-- TABELA: org_services
-- =============================================================================

ALTER TABLE public.org_services
ADD COLUMN responsible_roles JSONB DEFAULT '[]' NOT NULL;

CREATE INDEX IF NOT EXISTS idx_org_services_responsible_roles_gin
ON public.org_services USING GIN(responsible_roles);

COMMENT ON COLUMN public.org_services.responsible_roles
IS 'Array of roles responsible for managing this service (e.g., ["service_lead", "operations_manager"])';

-- =============================================================================
-- TABELA: org_documents
-- =============================================================================

ALTER TABLE public.org_documents
ADD COLUMN responsible_roles JSONB DEFAULT '[]' NOT NULL;

CREATE INDEX IF NOT EXISTS idx_org_documents_responsible_roles_gin
ON public.org_documents USING GIN(responsible_roles);

COMMENT ON COLUMN public.org_documents.responsible_roles
IS 'Array of roles responsible for managing this document (e.g., ["compliance_officer", "legal_reviewer"])';

-- =============================================================================
-- RLS: No new policies needed — existing RLS via tenant_id check covers new column
-- =============================================================================

-- Verify migration completed
DO $$
BEGIN
  RAISE NOTICE 'Migration 065: responsible_roles columns added to suppliers, services, documents with GIN indexes ✅';
END$$;
