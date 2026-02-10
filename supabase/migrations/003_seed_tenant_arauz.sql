-- =============================================================================
-- Tech Arauz - Seed Data
-- Migration 003: Tenant Arauz inicial
-- =============================================================================

-- Criar tenant Arauz
INSERT INTO public.tenants (id, slug, name, settings)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'arauz',
    'Araúz & Advogados',
    '{"theme": "default", "language": "pt-BR"}'
) ON CONFLICT (slug) DO NOTHING;
