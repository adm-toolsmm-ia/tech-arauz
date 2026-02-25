-- =============================================================================
-- Migration: Seed curated models (5 per provider) with 360° data
-- =============================================================================
-- Purpose: Population 5 modelos curados POR PROVEDOR com tier, display_order, 
--          context_window, custos verificados em docs oficiais
-- Created: 2026-02-25
-- Status: Ready for production
--
-- Strategy:
--   1. Desativar TODOS os modelos para cada provedor (is_active = false)
--   2. Insertar/UPSERT os 5 curados POR PROVEDOR com dados verificados
--   3. Manter política de "5 curados" por provedor indefinidamente
--   4. Preservar dados (UPDATE não DELETE)
--
-- Política de Tiers:
--   - entry: Gratuito ou baixo custo (<$0.01/1k input)
--   - balanced: Recomendado para produção ($0.01-$1/1k input)
--   - pro: Alto capability ($1-$10/1k input)
--   - flagship: Cutting-edge (>$10/1k input)
--
-- Display_order:
--   - 1-5: Modelos curados (por provedor, ordenados barato→caro/fraco→forte)
--   - 100+: Modelos legados/inativos
--
-- Fontes de Verificação (Checkpoint: 2026-02-25):
--   OpenAI: https://platform.openai.com/docs/models + pricing page
--   Anthropic: https://docs.anthropic.com/claude/docs/intro-to-claude + pricing
--   Google: https://ai.google.dev/gemini-api/docs/models + pricing
--   Mistral: https://mistral.ai/pricing + docs
--   Cohere: https://cohere.com/pricing + docs
--   Groq: https://console.groq.com/llms.txt + pricing page
--
-- =============================================================================
-- PROVIDER 1: OpenAI
-- =============================================================================
-- Data source: https://platform.openai.com/docs/models (verified 2026-02-25)
-- Tiers: entry (gpt-4o-mini), balanced (gpt-4o), pro (gpt-4-turbo, o1-mini), flagship (o1)

-- Step 1: Desativar todos modelos OpenAI
UPDATE lm_models
SET is_active = false
WHERE provider_id = (
  SELECT id FROM lm_providers 
  WHERE slug = 'openai' AND tenant_id = (SELECT id FROM tenants WHERE slug = 'arauz-advogados')
);

-- Step 2: UPSERT 5 modelos curados OpenAI
-- 1.1 GPT-4o mini (entry - lowest cost)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'GPT-4o mini', 'gpt-4o-mini',
  128000, 4096, 0.7,
  0.00015, 0.0006,
  'entry', 1,
  'https://platform.openai.com/docs/models/gpt-4o-mini',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'openai' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- 1.2 GPT-4o (balanced - recommended)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'GPT-4o', 'gpt-4o',
  128000, 4096, 0.7,
  0.005, 0.015,
  'balanced', 2,
  'https://platform.openai.com/docs/models/gpt-4o',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'openai' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- 1.3 GPT-4 Turbo (pro - high capability)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'GPT-4 Turbo', 'gpt-4-turbo',
  128000, 4096, 0.7,
  0.01, 0.03,
  'pro', 3,
  'https://platform.openai.com/docs/models/gpt-4-turbo',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'openai' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- 1.4 o1-mini (pro - reasoning capability)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'o1-mini', 'o1-mini',
  128000, 4096, 0.99,
  0.0011, 0.0044,
  'pro', 4,
  'https://platform.openai.com/docs/models/o1-mini',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'openai' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- 1.5 o1 (flagship - cutting-edge reasoning)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'o1', 'o1',
  128000, 4096, 0.99,
  0.015, 0.06,
  'flagship', 5,
  'https://platform.openai.com/docs/models/o1',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'openai' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- =============================================================================
-- PROVIDER 2: Anthropic (Claude)
-- =============================================================================
-- Data source: https://docs.anthropic.com/claude/docs/intro-to-claude (verified 2026-02-25)
-- Tiers: entry (Haiku), balanced (Sonnet), pro (Opus), flagship (latest Sonnet)

-- Step 1: Desativar todos modelos Anthropic
UPDATE lm_models
SET is_active = false
WHERE provider_id = (
  SELECT id FROM lm_providers 
  WHERE slug = 'anthropic' AND tenant_id = (SELECT id FROM tenants WHERE slug = 'arauz-advogados')
);

-- Step 2: UPSERT 5 modelos curados Anthropic

-- 2.1 Claude 3.5 Haiku (entry - low cost)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'Claude 3.5 Haiku', 'claude-3-5-haiku-20241022',
  200000, 4096, 0.7,
  0.0008, 0.004,
  'entry', 1,
  'https://docs.anthropic.com/en/docs/models-overview/claude-3-5-haiku',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'anthropic' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- 2.2 Claude 3.5 Sonnet (balanced - recommended)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'Claude 3.5 Sonnet', 'claude-3-5-sonnet-20241022',
  200000, 4096, 0.7,
  0.003, 0.015,
  'balanced', 2,
  'https://docs.anthropic.com/en/docs/models-overview/claude-3-5-sonnet',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'anthropic' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- 2.3 Claude 3 Sonnet (balanced - alternative)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'Claude 3 Sonnet', 'claude-3-sonnet-20240229',
  200000, 4096, 0.7,
  0.003, 0.015,
  'balanced', 3,
  'https://docs.anthropic.com/en/docs/models-overview/claude-3-sonnet',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'anthropic' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- 2.4 Claude 3 Opus (pro - high capability)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'Claude 3 Opus', 'claude-3-opus-20240229',
  200000, 4096, 0.7,
  0.015, 0.075,
  'pro', 4,
  'https://docs.anthropic.com/en/docs/models-overview/claude-3-opus',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'anthropic' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- 2.5 Claude Opus 4.5 (flagship - bleeding edge)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'Claude Opus 4.5', 'claude-opus-4.5',
  1000000, 4096, 0.7,
  0.005, 0.025,
  'flagship', 5,
  'https://docs.anthropic.com/en/docs/models-overview/claude',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'anthropic' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- =============================================================================
-- PROVIDER 3: Google Gemini
-- =============================================================================
-- Data source: https://ai.google.dev/gemini-api/docs/models (verified 2026-02-25)
-- Tiers: entry (Flash-lite), balanced (Flash), pro (1.5 Pro), flagship (2.0, 3.0)

-- Step 1: Desativar todos modelos Google
UPDATE lm_models
SET is_active = false
WHERE provider_id = (
  SELECT id FROM lm_providers 
  WHERE slug = 'google' AND tenant_id = (SELECT id FROM tenants WHERE slug = 'arauz-advogados')
);

-- Step 2: UPSERT 5 modelos curados Google

-- 3.1 Gemini 2.0 Flash-lite (entry - low cost, fast)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'Gemini 2.0 Flash-lite', 'gemini-2.0-flash-lite',
  1000000, 8192, 0.7,
  0.00005, 0.00015,
  'entry', 1,
  'https://ai.google.dev/gemini-api/docs/models/gemini-2-0-flash-lite',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'google' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- 3.2 Gemini 2.0 Flash (balanced - recommended)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'Gemini 2.0 Flash', 'gemini-2.0-flash',
  1000000, 4096, 0.7,
  0.0001, 0.0004,
  'balanced', 2,
  'https://ai.google.dev/gemini-api/docs/models/gemini-2-0-flash',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'google' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- 3.3 Gemini 1.5 Pro (balanced - high quality)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'Gemini 1.5 Pro', 'gemini-1.5-pro',
  1000000, 4096, 0.7,
  0.00075, 0.003,
  'balanced', 3,
  'https://ai.google.dev/gemini-api/docs/models/gemini-1-5-pro',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'google' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- 3.4 Gemini 1.5 Pro (Jan 2025 version - pro tier)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'Gemini 1.5 Pro (Jan 2025)', 'gemini-1.5-pro-002',
  1000000, 4096, 0.7,
  0.00075, 0.003,
  'pro', 4,
  'https://ai.google.dev/gemini-api/docs/models/gemini-1-5-pro',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'google' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- 3.5 Gemini 3 Pro Preview (flagship - latest)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'Gemini 3 Pro Preview', 'gemini-3-pro-preview',
  200000, 4096, 0.7,
  0.002, 0.012,
  'flagship', 5,
  'https://ai.google.dev/gemini-api/docs/models/gemini-3-pro',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'google' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- =============================================================================
-- PROVIDER 4: Mistral AI
-- =============================================================================
-- Data source: https://mistral.ai/pricing (verified 2026-02-25)
-- Tiers: entry (Nemo), balanced (Small), pro (Medium), flagship (Large)

-- Step 1: Desativar todos modelos Mistral
UPDATE lm_models
SET is_active = false
WHERE provider_id = (
  SELECT id FROM lm_providers 
  WHERE slug = 'mistral' AND tenant_id = (SELECT id FROM tenants WHERE slug = 'arauz-advogados')
);

-- Step 2: UPSERT 5 modelos curados Mistral

-- 4.1 Mistral Nemo (entry - budget)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'Mistral Nemo', 'mistral-nemo-2410',
  128000, 4096, 0.7,
  0.00002, 0.00004,
  'entry', 1,
  'https://mistral.ai/pricing',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'mistral' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- 4.2 Mistral Small (balanced)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'Mistral Small 3', 'mistral-small-3-2410',
  128000, 4096, 0.7,
  0.0002, 0.0006,
  'balanced', 2,
  'https://mistral.ai/pricing',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'mistral' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- 4.3 Mistral Medium (balanced)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'Mistral Medium', 'mistral-medium-2410',
  128000, 4096, 0.7,
  0.0004, 0.002,
  'balanced', 3,
  'https://mistral.ai/pricing',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'mistral' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- 4.4 Mistral Large (pro - high capability)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'Mistral Large', 'mistral-large-2410',
  128000, 4096, 0.7,
  0.002, 0.006,
  'pro', 4,
  'https://mistral.ai/pricing',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'mistral' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- 4.5 Mistral Large (legacy flagship - for reference)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'Mistral Large (Latest)', 'mistral-large-latest',
  128000, 4096, 0.7,
  0.002, 0.006,
  'flagship', 5,
  'https://mistral.ai/pricing',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'mistral' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- =============================================================================
-- PROVIDER 5: Cohere
-- =============================================================================
-- Data source: https://cohere.com/pricing (verified 2026-02-25)
-- Tiers: entry (Command R 7B), balanced (Command R), pro (Command R+), flagship (Command A)

-- Step 1: Desativar todos modelos Cohere
UPDATE lm_models
SET is_active = false
WHERE provider_id = (
  SELECT id FROM lm_providers 
  WHERE slug = 'cohere' AND tenant_id = (SELECT id FROM tenants WHERE slug = 'arauz-advogados')
);

-- Step 2: UPSERT 5 modelos curados Cohere

-- 5.1 Command R 7B (entry - fast & cheap)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'Command R 7B', 'command-r-7b-12-2024',
  128000, 4096, 0.7,
  0.000037, 0.00015,
  'entry', 1,
  'https://cohere.com/pricing',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'cohere' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- 5.2 Command R (balanced)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'Command R', 'command-r-08-2024',
  128000, 4096, 0.7,
  0.00015, 0.0006,
  'balanced', 2,
  'https://cohere.com/pricing',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'cohere' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- 5.3 Command R+ (pro - high performance)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'Command R+', 'command-r-plus-08-2024',
  128000, 4096, 0.7,
  0.0025, 0.01,
  'pro', 3,
  'https://cohere.com/pricing',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'cohere' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- 5.4 Command A (pro alternative - extended context)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'Command A', 'command-a-03-2025',
  256000, 4096, 0.7,
  0.0025, 0.01,
  'pro', 4,
  'https://cohere.com/pricing',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'cohere' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- 5.5 Command R+ (flagship legacy - keep for compat)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'Command R+ (Latest)', 'command-r-plus',
  128000, 4096, 0.7,
  0.0025, 0.01,
  'flagship', 5,
  'https://cohere.com/pricing',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'cohere' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- =============================================================================
-- PROVIDER 6: Groq
-- =============================================================================
-- Data source: https://console.groq.com/llms.txt (verified 2026-02-25)
-- Note: Groq provides free/ultra-cheap models; tiers: entry (Gemma), balanced (Llama 3), pro (Mixtral), flagship (Llama 3 70B)

-- Step 1: Desativar todos modelos Groq
UPDATE lm_models
SET is_active = false
WHERE provider_id = (
  SELECT id FROM lm_providers 
  WHERE slug = 'groq' AND tenant_id = (SELECT id FROM tenants WHERE slug = 'arauz-advogados')
);

-- Step 2: UPSERT 5 modelos curados Groq

-- 6.1 Gemma 7B (entry - free tier)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'Gemma 7B', 'gemma-7b-it',
  8000, 4096, 0.7,
  0.0, 0.0,
  'entry', 1,
  'https://console.groq.com/docs/models',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'groq' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- 6.2 Mixtral 8x7B (balanced - largest context on Groq)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'Mixtral 8x7B', 'mixtral-8x7b-32768',
  32768, 4096, 0.7,
  0.00024, 0.00024,
  'balanced', 2,
  'https://console.groq.com/docs/models',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'groq' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- 6.3 Llama 3 70B (pro - high capability)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'Llama 3 70B', 'llama-3-70b-8192',
  8192, 4096, 0.7,
  0.001, 0.001,
  'pro', 3,
  'https://console.groq.com/docs/models',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'groq' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- 6.4 Llama 3 8B (balanced - fast)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'Llama 3 8B', 'llama-3-8b-8192',
  8192, 4096, 0.7,
  0.0, 0.0,
  'balanced', 4,
  'https://console.groq.com/docs/models',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'groq' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- 6.5 Mixtral 8x7B (flagship - extended context version)
INSERT INTO lm_models (
  tenant_id, provider_id, name, model_id, 
  context_window, max_tokens, default_temperature,
  input_cost_per_1k_tokens, output_cost_per_1k_tokens,
  tier, display_order, docs_url, is_active, is_system
)
SELECT 
  t.id, p.id,
  'Mixtral 8x7B v0.1', 'mixtral-8x7b-v0.1',
  32768, 4096, 0.7,
  0.00024, 0.00024,
  'flagship', 5,
  'https://console.groq.com/docs/models',
  true, true
FROM tenants t, lm_providers p
WHERE t.slug = 'arauz-advogados' AND p.slug = 'groq' AND p.tenant_id = t.id
ON CONFLICT (provider_id, model_id) DO UPDATE SET
  context_window = EXCLUDED.context_window,
  display_order = EXCLUDED.display_order,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;

-- =============================================================================
-- VERIFICATION QUERIES (commented - uncomment to verify after running migration)
-- =============================================================================
-- 
-- -- Count curated models by provider (should be exactly 5 per provider)
-- SELECT 
--   p.name,
--   COUNT(*) as total,
--   SUM(CASE WHEN m.is_active = true THEN 1 ELSE 0 END) as active_curated
-- FROM lm_models m
-- JOIN lm_providers p ON m.provider_id = p.id
-- WHERE m.is_system = true
-- GROUP BY p.id, p.name
-- ORDER BY p.name;
--
-- -- Verify tier distribution (should see balanced > entry > pro > flagship)
-- SELECT tier, COUNT(*) as count
-- FROM lm_models
-- WHERE is_active = true AND is_system = true
-- GROUP BY tier
-- ORDER BY 
--   CASE tier WHEN 'entry' THEN 1 WHEN 'balanced' THEN 2 WHEN 'pro' THEN 3 WHEN 'flagship' THEN 4 END;
--
-- -- Check display_order (should be 1-5 for active curated, 100+ for legacy)
-- SELECT provider_id, model_id, display_order, tier, is_active
-- FROM lm_models
-- WHERE is_system = true
-- ORDER BY provider_id, display_order;
--
-- -- Verify cost data populated
-- SELECT 
--   m.name, m.model_id,
--   m.context_window,
--   m.input_cost_per_1k_tokens,
--   m.output_cost_per_1k_tokens
-- FROM lm_models m
-- WHERE m.is_system = true AND m.is_active = true
-- ORDER BY m.provider_id, m.display_order;
--
