-- Migration: Add docs_url to providers/models + Seed OpenAI & Anthropic for single tenant
-- Description: docs_url para futuras rotinas de atualização; seed usando tenant único
-- Created: 2026-02-25

-- =============================================================================
-- 1. Add docs_url column to lm_providers and lm_models
-- =============================================================================

ALTER TABLE lm_providers
  ADD COLUMN IF NOT EXISTS docs_url TEXT;

ALTER TABLE lm_models
  ADD COLUMN IF NOT EXISTS docs_url TEXT;

COMMENT ON COLUMN lm_providers.docs_url IS 'URL base da documentação do fornecedor para rotinas futuras de atualização';
COMMENT ON COLUMN lm_models.docs_url IS 'URL base da documentação do modelo para rotinas futuras de atualização';

-- =============================================================================
-- 2. Ensure multi-tenant slug constraint (idempotent)
-- =============================================================================

ALTER TABLE lm_providers DROP CONSTRAINT IF EXISTS lm_providers_slug_key;
ALTER TABLE lm_providers DROP CONSTRAINT IF EXISTS lm_providers_tenant_slug_unique;
ALTER TABLE lm_providers ADD CONSTRAINT lm_providers_tenant_slug_unique UNIQUE (tenant_id, slug);

-- =============================================================================
-- 3. Seed LM Providers for single tenant (OpenAI, Anthropic)
-- =============================================================================

-- OpenAI
INSERT INTO lm_providers (tenant_id, name, slug, description, api_endpoint, icon_emoji, color_hex, is_active, is_system, docs_url)
SELECT t.id, 'OpenAI', 'openai', 'OpenAI API - GPT-4o, GPT-4, o1 e outros modelos', 'https://api.openai.com/v1', '🤖', '#10A37F', TRUE, TRUE, 'https://platform.openai.com/docs'
FROM (SELECT id FROM tenants LIMIT 1) t
WHERE NOT EXISTS (SELECT 1 FROM lm_providers WHERE tenant_id = t.id AND slug = 'openai');

-- Anthropic (Claude)
INSERT INTO lm_providers (tenant_id, name, slug, description, api_endpoint, icon_emoji, color_hex, is_active, is_system, docs_url)
SELECT t.id, 'Anthropic', 'anthropic', 'Anthropic Claude - Claude 3.5, Claude 3 Opus, Sonnet, Haiku', 'https://api.anthropic.com', '🧠', '#D4A574', TRUE, TRUE, 'https://docs.anthropic.com'
FROM (SELECT id FROM tenants LIMIT 1) t
WHERE NOT EXISTS (SELECT 1 FROM lm_providers WHERE tenant_id = t.id AND slug = 'anthropic');

-- =============================================================================
-- 4. Seed LM Models for OpenAI
-- =============================================================================

INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system, docs_url)
SELECT p.tenant_id, p.id, 'GPT-4o', 'gpt-4o', TRUE, TRUE, 'https://platform.openai.com/docs/models/gpt-4o'
FROM lm_providers p
JOIN (SELECT id FROM tenants LIMIT 1) t ON t.id = p.tenant_id
WHERE p.slug = 'openai'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system, docs_url)
SELECT p.tenant_id, p.id, 'GPT-4o mini', 'gpt-4o-mini', TRUE, TRUE, 'https://platform.openai.com/docs/models/gpt-4o-mini'
FROM lm_providers p
JOIN (SELECT id FROM tenants LIMIT 1) t ON t.id = p.tenant_id
WHERE p.slug = 'openai'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system, docs_url)
SELECT p.tenant_id, p.id, 'GPT-4 Turbo', 'gpt-4-turbo', TRUE, TRUE, 'https://platform.openai.com/docs/models/gpt-4-turbo'
FROM lm_providers p
JOIN (SELECT id FROM tenants LIMIT 1) t ON t.id = p.tenant_id
WHERE p.slug = 'openai'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system, docs_url)
SELECT p.tenant_id, p.id, 'o1', 'o1', TRUE, TRUE, 'https://platform.openai.com/docs/models/o1'
FROM lm_providers p
JOIN (SELECT id FROM tenants LIMIT 1) t ON t.id = p.tenant_id
WHERE p.slug = 'openai'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system, docs_url)
SELECT p.tenant_id, p.id, 'o1 mini', 'o1-mini', TRUE, TRUE, 'https://platform.openai.com/docs/models/o1-mini'
FROM lm_providers p
JOIN (SELECT id FROM tenants LIMIT 1) t ON t.id = p.tenant_id
WHERE p.slug = 'openai'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system, docs_url)
SELECT p.tenant_id, p.id, 'GPT-3.5 Turbo', 'gpt-3.5-turbo', TRUE, TRUE, 'https://platform.openai.com/docs/models/gpt-3-5-turbo'
FROM lm_providers p
JOIN (SELECT id FROM tenants LIMIT 1) t ON t.id = p.tenant_id
WHERE p.slug = 'openai'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

-- =============================================================================
-- 5. Seed LM Models for Anthropic (Claude)
-- =============================================================================

INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system, docs_url)
SELECT p.tenant_id, p.id, 'Claude 3.5 Sonnet', 'claude-3-5-sonnet-20241022', TRUE, TRUE, 'https://docs.anthropic.com/en/docs/models-overview/claude-3-5-sonnet'
FROM lm_providers p
JOIN (SELECT id FROM tenants LIMIT 1) t ON t.id = p.tenant_id
WHERE p.slug = 'anthropic'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system, docs_url)
SELECT p.tenant_id, p.id, 'Claude 3.5 Haiku', 'claude-3-5-haiku-20241022', TRUE, TRUE, 'https://docs.anthropic.com/en/docs/models-overview/claude-3-5-haiku'
FROM lm_providers p
JOIN (SELECT id FROM tenants LIMIT 1) t ON t.id = p.tenant_id
WHERE p.slug = 'anthropic'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system, docs_url)
SELECT p.tenant_id, p.id, 'Claude 3 Opus', 'claude-3-opus-20240229', TRUE, TRUE, 'https://docs.anthropic.com/en/docs/models-overview/claude-3-opus'
FROM lm_providers p
JOIN (SELECT id FROM tenants LIMIT 1) t ON t.id = p.tenant_id
WHERE p.slug = 'anthropic'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system, docs_url)
SELECT p.tenant_id, p.id, 'Claude 3 Sonnet', 'claude-3-sonnet-20240229', TRUE, TRUE, 'https://docs.anthropic.com/en/docs/models-overview/claude-3-sonnet'
FROM lm_providers p
JOIN (SELECT id FROM tenants LIMIT 1) t ON t.id = p.tenant_id
WHERE p.slug = 'anthropic'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system, docs_url)
SELECT p.tenant_id, p.id, 'Claude 3 Haiku', 'claude-3-haiku-20240307', TRUE, TRUE, 'https://docs.anthropic.com/en/docs/models-overview/claude-3-haiku'
FROM lm_providers p
JOIN (SELECT id FROM tenants LIMIT 1) t ON t.id = p.tenant_id
WHERE p.slug = 'anthropic'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;
