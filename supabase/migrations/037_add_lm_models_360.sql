-- Migration: Add context_window, display_order, tier to lm_models (360° architecture)
-- Purpose: Enable model curation with tiers (entry/balanced/pro/flagship), ordering (UI display),
--          and context window tracking for prompt engineering and compliance
-- Created: 2026-02-25
-- Scope: Backward-compatible, no breaking changes; all new columns have defaults/constraints

-- =============================================================================
-- 1. Add context_window column to lm_models
-- =============================================================================
-- Tracks the maximum input tokens (context window) for each model
-- Used for prompt engineering, context trimming, and capacity planning

ALTER TABLE lm_models
  ADD COLUMN IF NOT EXISTS context_window INTEGER;

COMMENT ON COLUMN lm_models.context_window IS 'Maximum input tokens (context window) for this model. Used for prompt engineering, compliance, and capacity planning.';

-- =============================================================================
-- 2. Add display_order column to lm_models
-- =============================================================================
-- Defines display order in UI selectors, dropdowns, and catalog views
-- Default 100 ensures new models appear after curated models (1-99)

ALTER TABLE lm_models
  ADD COLUMN IF NOT EXISTS display_order SMALLINT DEFAULT 100;

COMMENT ON COLUMN lm_models.display_order IS 'Display order in UI selectors and catalogs. Lower values appear first. Default 100; curated models use 1-99.';

-- =============================================================================
-- 3. Add tier column to lm_models
-- =============================================================================
-- Curated tiers for operational classification:
-- - entry: Free/low-cost models (Claude Haiku, GPT-3.5)
-- - balanced: Mid-tier models (Sonnet, GPT-4o mini) - DEFAULT
-- - pro: High-capability models (GPT-4 Turbo, Claude Opus)
-- - flagship: Cutting-edge models (o1, GPT-4o, Claude 3.5 Sonnet)

ALTER TABLE lm_models
  ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'balanced'
  CHECK (tier IN ('entry', 'balanced', 'pro', 'flagship'));

COMMENT ON COLUMN lm_models.tier IS 'Operational tier for model curation (entry/balanced/pro/flagship). Used for UI grouping, cost management, and capability routing.';

-- =============================================================================
-- 4. Create indexes for query performance
-- =============================================================================
-- idx_lm_models_tier: Filter models by tier for UI rendering and capability checks
CREATE INDEX IF NOT EXISTS idx_lm_models_tier ON lm_models(tier);

-- idx_lm_models_display_order: Sort models in UI catalogs
CREATE INDEX IF NOT EXISTS idx_lm_models_display_order ON lm_models(display_order, is_active) WHERE is_active = true;

-- idx_lm_models_context_window: Find models by context window capacity
CREATE INDEX IF NOT EXISTS idx_lm_models_context_window ON lm_models(context_window) WHERE context_window IS NOT NULL;

-- =============================================================================
-- 5. Composite index for common queries (tier + display_order + active)
-- =============================================================================
-- Optimizes queries like: SELECT * FROM lm_models WHERE tier = X AND is_active ORDER BY display_order
CREATE INDEX IF NOT EXISTS idx_lm_models_tier_order_active ON lm_models(tier, display_order, is_active) WHERE is_active = true;

-- =============================================================================
-- 6. Migration test queries (commented)
-- =============================================================================
-- To verify the migration worked correctly, uncomment and run:
--
-- SELECT
--   id,
--   name,
--   model_id,
--   context_window,
--   display_order,
--   tier,
--   is_active
-- FROM lm_models
-- ORDER BY display_order, tier;
--
-- -- Count models by tier
-- SELECT tier, COUNT(*) as count FROM lm_models GROUP BY tier;
--
-- -- Find models with missing context_window (action items)
-- SELECT id, name, model_id FROM lm_models WHERE context_window IS NULL ORDER BY name;
