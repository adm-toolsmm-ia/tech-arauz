-- =============================================================================
-- Tech Arauz - Seed Data
-- Dados iniciais para desenvolvimento e teste
-- =============================================================================

-- Criar tenant Arauz
INSERT INTO public.tenants (id, slug, name, settings)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'arauz',
    'Araúz & Advogados',
    '{"theme": "default", "language": "pt-BR"}'
) ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- NOTA: O usuário será criado via Supabase Auth
-- Após criar o usuário, insira manualmente o profile:
-- =============================================================================
-- INSERT INTO public.profiles (id, tenant_id, email, full_name, role)
-- VALUES (
--     '<user_id_from_auth>',
--     '00000000-0000-0000-0000-000000000001',
--     'gabriel@arauz.com.br',
--     'Gabriel Cristofolini',
--     'admin'
-- );
