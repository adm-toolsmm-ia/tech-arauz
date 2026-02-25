-- Migration: Seed Google Gemini provider and models for single tenant
-- Description: Provedor Gemini + modelos principais (Gemini 1.5, 2.0, etc.)
-- Created: 2026-02-25

-- =============================================================================
-- 1. Seed LM Provider: Google Gemini
-- =============================================================================

INSERT INTO lm_providers (tenant_id, name, slug, description, api_endpoint, icon_emoji, color_hex, is_active, is_system, docs_url)
SELECT t.id, 'Google Gemini', 'google', 'Google AI - Gemini 2.0, Gemini 1.5 Pro, Flash e outros modelos', 'https://generativelanguage.googleapis.com', '✨', '#4285F4', TRUE, TRUE, 'https://ai.google.dev/docs'
FROM (SELECT id FROM tenants LIMIT 1) t
WHERE NOT EXISTS (SELECT 1 FROM lm_providers WHERE tenant_id = t.id AND slug = 'google');

-- =============================================================================
-- 2. Seed LM Models for Google Gemini
-- =============================================================================

INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system, docs_url)
SELECT p.tenant_id, p.id, 'Gemini 2.0 Flash', 'gemini-2.0-flash', TRUE, TRUE, 'https://ai.google.dev/gemini-api/docs/models/gemini'
FROM lm_providers p
JOIN (SELECT id FROM tenants LIMIT 1) t ON t.id = p.tenant_id
WHERE p.slug = 'google'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system, docs_url)
SELECT p.tenant_id, p.id, 'Gemini 1.5 Pro', 'gemini-1.5-pro', TRUE, TRUE, 'https://ai.google.dev/gemini-api/docs/models/gemini'
FROM lm_providers p
JOIN (SELECT id FROM tenants LIMIT 1) t ON t.id = p.tenant_id
WHERE p.slug = 'google'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system, docs_url)
SELECT p.tenant_id, p.id, 'Gemini 1.5 Flash', 'gemini-1.5-flash', TRUE, TRUE, 'https://ai.google.dev/gemini-api/docs/models/gemini'
FROM lm_providers p
JOIN (SELECT id FROM tenants LIMIT 1) t ON t.id = p.tenant_id
WHERE p.slug = 'google'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system, docs_url)
SELECT p.tenant_id, p.id, 'Gemini 1.5 Pro (Jan 2025)', 'gemini-1.5-pro-002', TRUE, TRUE, 'https://ai.google.dev/gemini-api/docs/models/gemini'
FROM lm_providers p
JOIN (SELECT id FROM tenants LIMIT 1) t ON t.id = p.tenant_id
WHERE p.slug = 'google'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system, docs_url)
SELECT p.tenant_id, p.id, 'Gemini Pro', 'gemini-pro', TRUE, TRUE, 'https://ai.google.dev/gemini-api/docs/models/gemini'
FROM lm_providers p
JOIN (SELECT id FROM tenants LIMIT 1) t ON t.id = p.tenant_id
WHERE p.slug = 'google'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;
