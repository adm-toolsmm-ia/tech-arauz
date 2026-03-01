-- Migration: Expand lm_models with Governance Fields (stability_level, release_channel, capabilities)
-- Description: Add model governance, stability tracking, and capability flags
-- Epic: Épico 1 — Governança de Dados e Classificação de Agentes
-- Story: 1.2 — Migration 046: Expansão lm_models (Governança Básica)
-- Created: 2026-03-01
-- Author: Claude (Dara)

-- =============================================================================
-- 1. Add Governance & Stability Columns to lm_models Table
-- =============================================================================

-- stability_level: Define model stability (ga, preview, experimental, deprecated)
ALTER TABLE lm_models
ADD COLUMN IF NOT EXISTS stability_level TEXT DEFAULT 'ga'
  CHECK (stability_level IN ('ga', 'preview', 'experimental', 'deprecated'));

-- release_channel: Define release channel (stable, beta, alpha)
ALTER TABLE lm_models
ADD COLUMN IF NOT EXISTS release_channel TEXT DEFAULT 'stable'
  CHECK (release_channel IN ('stable', 'beta', 'alpha'));

-- =============================================================================
-- 2. Add Capability Flags (What this model can do)
-- =============================================================================

-- supports_tool_calling: Model supports tool/function calling
ALTER TABLE lm_models
ADD COLUMN IF NOT EXISTS supports_tool_calling BOOLEAN DEFAULT FALSE;

-- supports_json_mode: Model supports JSON-formatted responses
ALTER TABLE lm_models
ADD COLUMN IF NOT EXISTS supports_json_mode BOOLEAN DEFAULT FALSE;

-- supports_streaming: Model supports streaming responses (default TRUE for most modern models)
ALTER TABLE lm_models
ADD COLUMN IF NOT EXISTS supports_streaming BOOLEAN DEFAULT TRUE;

-- supports_vision: Model can process images and vision inputs
ALTER TABLE lm_models
ADD COLUMN IF NOT EXISTS supports_vision BOOLEAN DEFAULT FALSE;

-- supports_audio: Model can process and generate audio
ALTER TABLE lm_models
ADD COLUMN IF NOT EXISTS supports_audio BOOLEAN DEFAULT FALSE;

-- =============================================================================
-- 3. Add Deprecation & Sunset Dates
-- =============================================================================

-- deprecated_at: When this model was deprecated (NULL if not deprecated)
ALTER TABLE lm_models
ADD COLUMN IF NOT EXISTS deprecated_at TIMESTAMP WITH TIME ZONE;

-- sunset_at: When this model will be fully removed (must be >= deprecated_at)
ALTER TABLE lm_models
ADD COLUMN IF NOT EXISTS sunset_at TIMESTAMP WITH TIME ZONE;

-- =============================================================================
-- 4. Add Business Rule Constraints
-- =============================================================================

-- Rule 1: Only stability_level='ga' models can be set as agent defaults (enforced in app logic)
-- Rule 2: stability_level='experimental' models cannot be published (enforced in app logic)
-- Rule 3: release_channel='alpha' requires manual validation (enforced in app logic)
-- Rule 4: sunset_at must be after deprecated_at (if both set)
ALTER TABLE lm_models
ADD CONSTRAINT lm_models_sunset_after_deprecated
  CHECK (sunset_at IS NULL OR deprecated_at IS NULL OR sunset_at >= deprecated_at);

-- Rule 5: If deprecated_at is set, sunset_at should also be set (enforced in app logic for now)
-- Future: Can become a CHECK constraint after backfilling existing records

-- =============================================================================
-- 5. Add Indexes for Query Performance
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_lm_models_stability_level ON lm_models(stability_level);
CREATE INDEX IF NOT EXISTS idx_lm_models_release_channel ON lm_models(release_channel);
CREATE INDEX IF NOT EXISTS idx_lm_models_deprecated_at ON lm_models(deprecated_at) WHERE deprecated_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lm_models_sunset_at ON lm_models(sunset_at) WHERE sunset_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lm_models_active_ga ON lm_models(tenant_id, is_active) WHERE is_active = TRUE AND stability_level = 'ga';
CREATE INDEX IF NOT EXISTS idx_lm_models_capabilities ON lm_models(supports_tool_calling, supports_json_mode, supports_streaming);

-- =============================================================================
-- 6. Add Documentation Comments
-- =============================================================================

COMMENT ON COLUMN lm_models.stability_level IS 'Model stability: ga (production), preview (pre-release), experimental (testing), deprecated (end-of-life)';
COMMENT ON COLUMN lm_models.release_channel IS 'Release channel: stable (production-ready), beta (pre-release), alpha (early testing)';
COMMENT ON COLUMN lm_models.supports_tool_calling IS 'If true, model supports function/tool calling for structured tasks';
COMMENT ON COLUMN lm_models.supports_json_mode IS 'If true, model can return strictly formatted JSON responses';
COMMENT ON COLUMN lm_models.supports_streaming IS 'If true, model supports server-sent events streaming (most modern models)';
COMMENT ON COLUMN lm_models.supports_vision IS 'If true, model can process images and visual content';
COMMENT ON COLUMN lm_models.supports_audio IS 'If true, model can process or generate audio content';
COMMENT ON COLUMN lm_models.deprecated_at IS 'Timestamp when this model was deprecated. NULL = not deprecated. After this date, new instances should not use this model.';
COMMENT ON COLUMN lm_models.sunset_at IS 'Timestamp when this model will be fully removed. NULL = no removal date. After this date, model may not function.';

-- =============================================================================
-- 7. Data Validation Queries (Documentation & Manual Testing)
-- =============================================================================

-- After migration, verify:
-- SELECT COUNT(*) FROM lm_models WHERE deprecated_at IS NOT NULL AND sunset_at IS NULL;
-- Result: Should be manageable (ideally 0 long-term, but OK for data freshness)
--
-- SELECT COUNT(*) FROM lm_models WHERE sunset_at < deprecated_at;
-- Result: Should be 0 (enforced by constraint)
--
-- SELECT COUNT(*) FROM lm_models WHERE stability_level = 'ga' AND is_active = TRUE;
-- Result: Expected count of production models available
--
-- SELECT model_id, stability_level, release_channel, supports_tool_calling
-- FROM lm_models
-- WHERE is_active = TRUE
-- ORDER BY stability_level, release_channel;
-- Result: Displays all active models with their capabilities
