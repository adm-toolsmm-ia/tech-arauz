-- Migration: Enhance Agent Types Table with UI Fields
-- Description: Add UI-specific columns (icon_emoji, color_hex, is_system, is_active) to agent_types
-- Created: 2026-02-24
-- Author: Dara (Data Engineer)

-- =============================================================================
-- 1. Add missing columns to agent_types table
-- =============================================================================

ALTER TABLE agent_types
  ADD COLUMN IF NOT EXISTS icon_emoji TEXT DEFAULT '⚙️',
  ADD COLUMN IF NOT EXISTS color_hex TEXT DEFAULT '#64748B',
  ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- =============================================================================
-- 2. Create index for is_active column (for efficient filtering)
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_agent_types_is_active ON agent_types(is_active);

-- =============================================================================
-- 3. Update existing Projetos type with UI fields
-- =============================================================================

UPDATE agent_types
SET 
  icon_emoji = '📊',
  color_hex = '#3B82F6',
  is_system = TRUE,
  is_active = TRUE,
  description = 'Agent for analyzing and reporting project status with detailed metrics'
WHERE slug = 'projetos';

-- =============================================================================
-- 4. Update existing Requisitos type with UI fields
-- =============================================================================

UPDATE agent_types
SET 
  icon_emoji = '📋',
  color_hex = '#8B5CF6',
  is_system = TRUE,
  is_active = TRUE,
  description = 'Agent for analyzing and structuring project requirements'
WHERE slug = 'requisitos';

-- =============================================================================
-- 5. Insert new system type: Technical Analysis (if not exists)
-- =============================================================================

WITH tenant_id_cte AS (
  SELECT id FROM tenants WHERE slug = 'arauz-advogados' LIMIT 1
)
INSERT INTO agent_types (
  tenant_id,
  name,
  slug,
  description,
  icon_emoji,
  color_hex,
  is_system,
  is_active,
  required_fields,
  recommended_fields
)
SELECT
  t.id,
  'Technical Analysis',
  'technical-analysis',
  'Agent for technical analysis, recommendations, and optimization',
  '🔍',
  '#EC4899',
  TRUE,
  TRUE,
  ARRAY['persona', 'prompt_objective'],
  ARRAY['prompt_instructions', 'requirements']
FROM tenant_id_cte t
WHERE NOT EXISTS (
  SELECT 1 FROM agent_types
  WHERE tenant_id = t.id AND slug = 'technical-analysis'
);
