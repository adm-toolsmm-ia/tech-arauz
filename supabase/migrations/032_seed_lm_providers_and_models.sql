-- Migration: Seed default LM providers and models for Arauz tenant
-- Description: OpenAI, Anthropic, Google Gemini, Azure OpenAI with default models
-- Created: 2026-02-25

-- =============================================================================
-- 1. Change slug constraint for multi-tenant (each tenant can have own providers)
-- =============================================================================

ALTER TABLE lm_providers DROP CONSTRAINT IF EXISTS lm_providers_slug_key;
ALTER TABLE lm_providers ADD CONSTRAINT lm_providers_tenant_slug_unique UNIQUE (tenant_id, slug);

-- =============================================================================
-- 2. Seed LM Providers for Arauz tenant
-- =============================================================================

INSERT INTO lm_providers (tenant_id, name, slug, description, api_endpoint, icon_emoji, color_hex, is_active, is_system)
SELECT t.id, 'OpenAI', 'openai', 'OpenAI API - GPT-4, GPT-3.5 e outros modelos', 'https://api.openai.com/v1', '🤖', '#10A37F', TRUE, TRUE
FROM tenants t WHERE t.slug = 'arauz-advogados'
AND NOT EXISTS (SELECT 1 FROM lm_providers WHERE tenant_id = t.id AND slug = 'openai');

INSERT INTO lm_providers (tenant_id, name, slug, description, api_endpoint, icon_emoji, color_hex, is_active, is_system)
SELECT t.id, 'Anthropic', 'anthropic', 'Anthropic Claude - Claude 3 Opus, Sonnet, Haiku', 'https://api.anthropic.com', '🧠', '#D4A574', TRUE, TRUE
FROM tenants t WHERE t.slug = 'arauz-advogados'
AND NOT EXISTS (SELECT 1 FROM lm_providers WHERE tenant_id = t.id AND slug = 'anthropic');

INSERT INTO lm_providers (tenant_id, name, slug, description, api_endpoint, icon_emoji, color_hex, is_active, is_system)
SELECT t.id, 'Google Gemini', 'google', 'Google AI - Gemini Pro e Gemini 1.5', 'https://generativelanguage.googleapis.com', '✨', '#4285F4', TRUE, TRUE
FROM tenants t WHERE t.slug = 'arauz-advogados'
AND NOT EXISTS (SELECT 1 FROM lm_providers WHERE tenant_id = t.id AND slug = 'google');

INSERT INTO lm_providers (tenant_id, name, slug, description, api_endpoint, icon_emoji, color_hex, is_active, is_system)
SELECT t.id, 'Azure OpenAI', 'azure_openai', 'Azure OpenAI Service - GPT-4, GPT-3.5 via Azure', NULL, '☁️', '#0078D4', TRUE, TRUE
FROM tenants t WHERE t.slug = 'arauz-advogados'
AND NOT EXISTS (SELECT 1 FROM lm_providers WHERE tenant_id = t.id AND slug = 'azure_openai');

-- =============================================================================
-- 3. Seed LM Models for each provider
-- =============================================================================

-- OpenAI models
INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system)
SELECT p.tenant_id, p.id, 'GPT-4', 'gpt-4', TRUE, TRUE
FROM lm_providers p
JOIN tenants t ON t.id = p.tenant_id AND t.slug = 'arauz-advogados'
WHERE p.slug = 'openai'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system)
SELECT p.tenant_id, p.id, 'GPT-4 Turbo', 'gpt-4-turbo', TRUE, TRUE
FROM lm_providers p
JOIN tenants t ON t.id = p.tenant_id AND t.slug = 'arauz-advogados'
WHERE p.slug = 'openai'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system)
SELECT p.tenant_id, p.id, 'GPT-3.5 Turbo', 'gpt-3.5-turbo', TRUE, TRUE
FROM lm_providers p
JOIN tenants t ON t.id = p.tenant_id AND t.slug = 'arauz-advogados'
WHERE p.slug = 'openai'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

-- Anthropic models
INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system)
SELECT p.tenant_id, p.id, 'Claude 3 Opus', 'claude-3-opus-20240229', TRUE, TRUE
FROM lm_providers p
JOIN tenants t ON t.id = p.tenant_id AND t.slug = 'arauz-advogados'
WHERE p.slug = 'anthropic'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system)
SELECT p.tenant_id, p.id, 'Claude 3 Sonnet', 'claude-3-sonnet-20240229', TRUE, TRUE
FROM lm_providers p
JOIN tenants t ON t.id = p.tenant_id AND t.slug = 'arauz-advogados'
WHERE p.slug = 'anthropic'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system)
SELECT p.tenant_id, p.id, 'Claude 3 Haiku', 'claude-3-haiku-20240307', TRUE, TRUE
FROM lm_providers p
JOIN tenants t ON t.id = p.tenant_id AND t.slug = 'arauz-advogados'
WHERE p.slug = 'anthropic'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

-- Google Gemini models
INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system)
SELECT p.tenant_id, p.id, 'Gemini Pro', 'gemini-pro', TRUE, TRUE
FROM lm_providers p
JOIN tenants t ON t.id = p.tenant_id AND t.slug = 'arauz-advogados'
WHERE p.slug = 'google'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system)
SELECT p.tenant_id, p.id, 'Gemini 1.5 Pro', 'gemini-1.5-pro', TRUE, TRUE
FROM lm_providers p
JOIN tenants t ON t.id = p.tenant_id AND t.slug = 'arauz-advogados'
WHERE p.slug = 'google'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

-- Azure OpenAI models
INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system)
SELECT p.tenant_id, p.id, 'GPT-4', 'gpt-4', TRUE, TRUE
FROM lm_providers p
JOIN tenants t ON t.id = p.tenant_id AND t.slug = 'arauz-advogados'
WHERE p.slug = 'azure_openai'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system)
SELECT p.tenant_id, p.id, 'GPT-3.5 Turbo', 'gpt-35-turbo', TRUE, TRUE
FROM lm_providers p
JOIN tenants t ON t.id = p.tenant_id AND t.slug = 'arauz-advogados'
WHERE p.slug = 'azure_openai'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;
