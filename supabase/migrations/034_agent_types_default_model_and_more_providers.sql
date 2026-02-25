-- Migration: Add default model columns to agent_types + more LM providers/models
-- Description: default_model_provider, default_model_id, default_temperature; Mistral, Cohere, etc.
-- Created: 2026-02-25

-- =============================================================================
-- 1. Add default model columns to agent_types
-- =============================================================================

ALTER TABLE agent_types
  ADD COLUMN IF NOT EXISTS default_model_provider TEXT,
  ADD COLUMN IF NOT EXISTS default_model_id TEXT,
  ADD COLUMN IF NOT EXISTS default_temperature NUMERIC(2,2) CHECK (default_temperature IS NULL OR (default_temperature >= 0 AND default_temperature <= 2));

-- =============================================================================
-- 2. Additional LM Providers (Mistral, Cohere, etc.)
-- =============================================================================

INSERT INTO lm_providers (tenant_id, name, slug, description, api_endpoint, icon_emoji, color_hex, is_active, is_system)
SELECT t.id, 'Mistral AI', 'mistral', 'Mistral AI - Mistral Large, Medium, Small', 'https://api.mistral.ai/v1', '🌊', '#6366F1', TRUE, TRUE
FROM tenants t WHERE t.slug = 'arauz-advogados'
AND NOT EXISTS (SELECT 1 FROM lm_providers WHERE tenant_id = t.id AND slug = 'mistral');

INSERT INTO lm_providers (tenant_id, name, slug, description, api_endpoint, icon_emoji, color_hex, is_active, is_system)
SELECT t.id, 'Cohere', 'cohere', 'Cohere - Command, Embed models', 'https://api.cohere.ai', '🔮', '#FF6B35', TRUE, TRUE
FROM tenants t WHERE t.slug = 'arauz-advogados'
AND NOT EXISTS (SELECT 1 FROM lm_providers WHERE tenant_id = t.id AND slug = 'cohere');

INSERT INTO lm_providers (tenant_id, name, slug, description, api_endpoint, icon_emoji, color_hex, is_active, is_system)
SELECT t.id, 'Groq', 'groq', 'Groq - Llama, Mixtral via Groq', 'https://api.groq.com/openai/v1', '⚡', '#00B894', TRUE, TRUE
FROM tenants t WHERE t.slug = 'arauz-advogados'
AND NOT EXISTS (SELECT 1 FROM lm_providers WHERE tenant_id = t.id AND slug = 'groq');

-- =============================================================================
-- 3. Models for new providers
-- =============================================================================

-- Mistral
INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system)
SELECT p.tenant_id, p.id, 'Mistral Large', 'mistral-large-latest', TRUE, TRUE
FROM lm_providers p JOIN tenants t ON t.id = p.tenant_id AND t.slug = 'arauz-advogados'
WHERE p.slug = 'mistral'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system)
SELECT p.tenant_id, p.id, 'Mistral Medium', 'mistral-medium-latest', TRUE, TRUE
FROM lm_providers p JOIN tenants t ON t.id = p.tenant_id AND t.slug = 'arauz-advogados'
WHERE p.slug = 'mistral'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system)
SELECT p.tenant_id, p.id, 'Mistral Small', 'mistral-small-latest', TRUE, TRUE
FROM lm_providers p JOIN tenants t ON t.id = p.tenant_id AND t.slug = 'arauz-advogados'
WHERE p.slug = 'mistral'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

-- Cohere
INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system)
SELECT p.tenant_id, p.id, 'Command R+', 'command-r-plus', TRUE, TRUE
FROM lm_providers p JOIN tenants t ON t.id = p.tenant_id AND t.slug = 'arauz-advogados'
WHERE p.slug = 'cohere'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system)
SELECT p.tenant_id, p.id, 'Command R', 'command-r', TRUE, TRUE
FROM lm_providers p JOIN tenants t ON t.id = p.tenant_id AND t.slug = 'arauz-advogados'
WHERE p.slug = 'cohere'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

-- Groq
INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system)
SELECT p.tenant_id, p.id, 'Llama 3 70B', 'llama-3-70b-8192', TRUE, TRUE
FROM lm_providers p JOIN tenants t ON t.id = p.tenant_id AND t.slug = 'arauz-advogados'
WHERE p.slug = 'groq'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

INSERT INTO lm_models (tenant_id, provider_id, name, model_id, is_active, is_system)
SELECT p.tenant_id, p.id, 'Mixtral 8x7B', 'mixtral-8x7b-32768', TRUE, TRUE
FROM lm_providers p JOIN tenants t ON t.id = p.tenant_id AND t.slug = 'arauz-advogados'
WHERE p.slug = 'groq'
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;
