-- =============================================================================
-- Migration 061: AI Organizational Bootstrap — Seed Company Types
-- Story 6.1.9: AI Bootstrap Engine
-- =============================================================================
-- Seed org_company_types para o tenant Araúz (usa tenant_id do seed 003)
-- =============================================================================

INSERT INTO public.org_company_types (tenant_id, slug, name, description)
SELECT id, 'escritorio_juridico', 'Escritório Jurídico', 'Estrutura padrão para escritórios de advocacia'
FROM public.tenants
WHERE slug = 'arauz'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO NOTHING;
