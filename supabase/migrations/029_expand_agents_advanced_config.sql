-- Migration: Expand Agents Schema for Advanced Configuration
-- Description: Add agent_type, agent_template, and configuration fields
-- Created: 2026-02-25
-- Author: Claude (Aria + Uma)

-- =============================================================================
-- 1. Add Agent Types Support Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS agent_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Identity
  name TEXT NOT NULL,  -- e.g., "Projetos", "Requisitos", "Análise"
  slug TEXT NOT NULL,
  description TEXT,
  
  -- Default template
  default_template JSONB,  -- Default persona, prompt, objective, etc.
  required_fields TEXT[],  -- Fields that must be configured
  recommended_fields TEXT[],  -- Suggested fields
  
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(tenant_id, slug)
);

CREATE INDEX idx_agent_types_tenant_id ON agent_types(tenant_id);

-- =============================================================================
-- 2. Add New Columns to Agents Table (Schema Evolution)
-- =============================================================================

-- Agent Type
ALTER TABLE agents ADD COLUMN IF NOT EXISTS agent_type TEXT DEFAULT 'projetos';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS agent_type_id UUID REFERENCES agent_types(id);

-- Advanced Configuration (if not already exists, skip)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS requirements TEXT[];  -- array of requirement descriptions
ALTER TABLE agents ADD COLUMN IF NOT EXISTS configuration_meta JSONB DEFAULT '{}';  -- flexible config storage

-- Template metadata
ALTER TABLE agents ADD COLUMN IF NOT EXISTS template_id UUID;  -- reference to template used
ALTER TABLE agents ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT FALSE;  -- mark as reusable template

-- Publication requirements
ALTER TABLE agents ADD COLUMN IF NOT EXISTS requires_validation BOOLEAN DEFAULT TRUE;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS validation_rules JSONB DEFAULT '{}';  -- JSON Schema for config validation

-- Performance / Observability
ALTER TABLE agents ADD COLUMN IF NOT EXISTS execution_count INTEGER DEFAULT 0;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS last_execution_at TIMESTAMP;

-- =============================================================================
-- 3. Create Agent Templates Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS agent_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  agent_type_id UUID NOT NULL REFERENCES agent_types(id) ON DELETE CASCADE,
  
  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  
  -- Template Content
  persona_template TEXT,
  prompt_objective_template TEXT,
  prompt_instructions_template TEXT[],
  prompt_examples JSONB,  -- { user: "...", assistant: "..." }
  
  output_schema_template JSONB,  -- JSON Schema template
  
  -- Model Defaults
  model_provider_default TEXT DEFAULT 'openai',
  model_id_default TEXT DEFAULT 'gpt-4',
  model_temperature_default NUMERIC DEFAULT 0.7,
  model_max_tokens_default INTEGER DEFAULT 2000,
  
  -- Usage Metadata
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  UNIQUE(tenant_id, agent_type_id, slug)
);

CREATE INDEX idx_agent_templates_tenant_id ON agent_templates(tenant_id);
CREATE INDEX idx_agent_templates_type_id ON agent_templates(agent_type_id);

-- =============================================================================
-- 4. RLS for New Tables
-- =============================================================================

ALTER TABLE agent_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_templates ENABLE ROW LEVEL SECURITY;

-- Agent Types Policies
CREATE POLICY agent_types_tenant_isolation ON agent_types
  USING (tenant_id = get_user_tenant_id())
  WITH CHECK (tenant_id = get_user_tenant_id());

-- Agent Templates Policies
CREATE POLICY agent_templates_tenant_isolation ON agent_templates
  USING (tenant_id = get_user_tenant_id())
  WITH CHECK (tenant_id = get_user_tenant_id());

-- =============================================================================
-- 5. Seed Default Agent Types for Araúz
-- =============================================================================

INSERT INTO agent_types (tenant_id, name, slug, description, required_fields, recommended_fields)
SELECT 
  t.id,
  'Projetos',
  'projetos',
  'Agente responsável por análise, status e gestão de projetos',
  '{"persona", "prompt_objective", "prompt_instructions"}',
  '{"model_temperature", "model_max_tokens", "requirements"}'
FROM tenants t
WHERE t.slug = 'arauz-advogados'
ON CONFLICT DO NOTHING;

INSERT INTO agent_types (tenant_id, name, slug, description, required_fields, recommended_fields)
SELECT 
  t.id,
  'Requisitos',
  'requisitos',
  'Agente responsável por levantamento e análise de requisitos de projetos',
  '{"persona", "prompt_objective", "prompt_instructions"}',
  '{"model_temperature", "model_max_tokens", "requirements"}'
FROM tenants t
WHERE t.slug = 'arauz-advogados'
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 6. Add Comments
-- =============================================================================

COMMENT ON TABLE agent_types IS 'Definition of agent types available in the system (e.g., Projetos, Requisitos)';
COMMENT ON TABLE agent_templates IS 'Reusable templates for quick agent configuration per type';
COMMENT ON COLUMN agents.agent_type IS 'Type of agent (projetos, requisitos, etc)';
COMMENT ON COLUMN agents.requirements IS 'Array of requirement descriptions for agent configuration';
COMMENT ON COLUMN agents.validation_rules IS 'JSON Schema rules for validating agent configuration before publication';
COMMENT ON COLUMN agents.is_template IS 'If true, this agent can be used as a template for creating new agents';
