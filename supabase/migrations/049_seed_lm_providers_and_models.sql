-- =============================================================================
-- Migration 049: Seed LM Providers and Models
-- =============================================================================
-- Description:
--   Seeds official AI providers and strategic models for all tenants.
--   Idempotent execution via ON CONFLICT.
--   Compatible with existing schema (lm_providers, lm_models).
--
-- Providers: OpenAI, Anthropic, Google AI, Azure OpenAI
-- Models: GPT-4.1, GPT-4.1 Mini, GPT-4o, Claude 3.5 Sonnet, Claude 3 Haiku,
--         Gemini 1.5 Pro, Gemini 1.5 Flash
--
-- Created: 2026-03-01
-- =============================================================================

-- =============================================================================
-- 1. PROVIDERS
-- =============================================================================

INSERT INTO lm_providers
(
  tenant_id,
  name,
  slug,
  description,
  api_endpoint,
  api_key_field_name,
  icon_emoji,
  color_hex,
  docs_url,
  is_active,
  is_system,
  created_at,
  updated_at
)
SELECT
  t.id,
  p.name,
  p.slug,
  p.description,
  p.api_endpoint,
  p.api_key_field_name,
  p.icon_emoji,
  p.color_hex,
  p.docs_url,
  true,
  true,
  now(),
  now()
FROM tenants t
CROSS JOIN (
  VALUES
    ('OpenAI','openai','Official OpenAI API provider','https://api.openai.com/v1','OPENAI_API_KEY','🤖','#10A37F','https://platform.openai.com/docs'),
    ('Anthropic','anthropic','Anthropic Claude models provider','https://api.anthropic.com','ANTHROPIC_API_KEY','🧠','#D4A574','https://docs.anthropic.com'),
    ('Google AI','google','Google Gemini models provider','https://generativelanguage.googleapis.com','GOOGLE_API_KEY','✨','#4285F4','https://ai.google.dev/docs'),
    ('Azure OpenAI','azure_openai','Azure hosted OpenAI models','https://{resource}.openai.azure.com','AZURE_OPENAI_KEY','☁️','#0078D4','https://learn.microsoft.com/azure/ai-services/openai')
) AS p(name,slug,description,api_endpoint,api_key_field_name,icon_emoji,color_hex,docs_url)
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- =============================================================================
-- 2. MODELS (OpenAI, Anthropic, Google)
-- =============================================================================

INSERT INTO lm_models
(
  tenant_id,
  provider_id,
  name,
  model_id,
  description,
  max_tokens,
  default_temperature,
  input_cost_per_1k_tokens,
  output_cost_per_1k_tokens,
  input_token_cost_usd,
  output_token_cost_usd,
  docs_url,
  context_window,
  display_order,
  tier,
  is_active,
  is_system,
  stability_level,
  release_channel,
  supports_tool_calling,
  supports_json_mode,
  supports_streaming,
  supports_vision,
  supports_audio,
  created_at,
  updated_at
)
SELECT
  p.tenant_id,
  p.id,
  m.name,
  m.model_id,
  m.description,
  m.max_tokens,
  0.7,
  m.input_cost,
  m.output_cost,
  m.input_cost / 1000,
  m.output_cost / 1000,
  m.docs_url,
  m.context_window,
  m.display_order,
  m.tier,
  true,
  true,
  'ga',
  'stable',
  true,
  true,
  true,
  m.supports_vision,
  m.supports_audio,
  now(),
  now()
FROM lm_providers p
JOIN (
  VALUES
    -- OpenAI
    ('openai','GPT-4.1','gpt-4.1','High intelligence flagship OpenAI model',4096,0.01,0.03,'https://platform.openai.com/docs/models',128000,1,'flagship',true,false),
    ('openai','GPT-4.1 Mini','gpt-4.1-mini','Balanced cost-performance model',4096,0.003,0.006,'https://platform.openai.com/docs/models',128000,2,'balanced',true,false),
    ('openai','GPT-4o','gpt-4o','Multimodal OpenAI model',4096,0.005,0.015,'https://platform.openai.com/docs/models',128000,3,'pro',true,true),
    -- Anthropic
    ('anthropic','Claude 3.5 Sonnet','claude-3-5-sonnet','Advanced reasoning long context model',4096,0.003,0.015,'https://docs.anthropic.com/claude/docs/models-overview',200000,1,'flagship',true,false),
    ('anthropic','Claude 3 Haiku','claude-3-haiku','Fast cost-efficient Claude model',4096,0.0008,0.004,'https://docs.anthropic.com/claude/docs/models-overview',200000,2,'entry',true,false),
    -- Google
    ('google','Gemini 1.5 Pro','gemini-1.5-pro','Large context multimodal Gemini model',8192,0.007,0.021,'https://ai.google.dev/docs/models/gemini',1000000,1,'flagship',true,false),
    ('google','Gemini 1.5 Flash','gemini-1.5-flash','Low latency Gemini model',8192,0.001,0.003,'https://ai.google.dev/docs/models/gemini',1000000,2,'balanced',true,false)
) AS m(
  provider_slug,
  name,
  model_id,
  description,
  max_tokens,
  input_cost,
  output_cost,
  docs_url,
  context_window,
  display_order,
  tier,
  supports_vision,
  supports_audio
)
ON p.slug = m.provider_slug
ON CONFLICT ON CONSTRAINT unique_model_per_provider DO NOTHING;

-- =============================================================================
-- END MIGRATION
-- =============================================================================
