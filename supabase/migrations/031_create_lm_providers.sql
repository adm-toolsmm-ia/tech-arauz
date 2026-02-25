-- Create LM Providers table for managing AI model providers
-- Tracks provider information, API endpoints, and authentication

CREATE TABLE IF NOT EXISTS lm_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Identity
  name TEXT NOT NULL, -- e.g., "OpenAI", "Anthropic", "Azure"
  slug TEXT NOT NULL UNIQUE, -- e.g., "openai", "anthropic"
  description TEXT,
  
  -- Provider Details
  api_endpoint TEXT,
  api_key_field_name TEXT DEFAULT 'api_key', -- Name of the API key field
  icon_emoji TEXT DEFAULT '🤖',
  color_hex TEXT DEFAULT '#64748B',
  
  -- Status & Control
  is_active BOOLEAN DEFAULT TRUE,
  is_system BOOLEAN DEFAULT FALSE, -- System providers cannot be deleted
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  CONSTRAINT valid_name CHECK (length(trim(name)) > 0),
  CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9_-]+$')
);

-- Create LM Models table for managing specific models within providers
CREATE TABLE IF NOT EXISTS lm_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES lm_providers(id) ON DELETE CASCADE,
  
  -- Identity
  name TEXT NOT NULL, -- e.g., "GPT-4", "Claude 3 Opus"
  model_id TEXT NOT NULL, -- e.g., "gpt-4", "claude-3-opus"
  description TEXT,
  
  -- Model Configuration
  max_tokens INTEGER,
  default_temperature NUMERIC(2,2) CHECK (default_temperature >= 0 AND default_temperature <= 2),
  
  -- Cost & Pricing
  input_cost_per_1k_tokens NUMERIC(10,8), -- Cost per 1000 tokens input
  output_cost_per_1k_tokens NUMERIC(10,8), -- Cost per 1000 tokens output
  
  -- Status & Control
  is_active BOOLEAN DEFAULT TRUE,
  is_system BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  CONSTRAINT valid_name CHECK (length(trim(name)) > 0),
  CONSTRAINT unique_model_per_provider UNIQUE(provider_id, model_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lm_providers_tenant ON lm_providers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lm_providers_active ON lm_providers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_lm_models_tenant ON lm_models(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lm_models_provider ON lm_models(provider_id);
CREATE INDEX IF NOT EXISTS idx_lm_models_active ON lm_models(is_active) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE lm_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lm_models ENABLE ROW LEVEL SECURITY;

-- RLS Policies for LM Providers
-- Select: Users can see providers in their tenant
CREATE POLICY "lm_providers_select" ON lm_providers
  FOR SELECT
  USING (tenant_id = get_user_tenant_id());

-- Insert: Users can create providers in their tenant
CREATE POLICY "lm_providers_insert" ON lm_providers
  FOR INSERT
  WITH CHECK (
    tenant_id = get_user_tenant_id() AND
    get_user_role() IN ('admin', 'user')
  );

-- Update: Admins can update, but system providers are protected
CREATE POLICY "lm_providers_update" ON lm_providers
  FOR UPDATE
  USING (
    tenant_id = get_user_tenant_id() AND
    get_user_role() = 'admin' AND
    is_system = false
  );

-- Delete: Admins can delete, but system providers are protected
CREATE POLICY "lm_providers_delete" ON lm_providers
  FOR DELETE
  USING (
    tenant_id = get_user_tenant_id() AND
    get_user_role() = 'admin' AND
    is_system = false
  );

-- RLS Policies for LM Models
-- Select: Users can see models in their tenant's providers
CREATE POLICY "lm_models_select" ON lm_models
  FOR SELECT
  USING (tenant_id = get_user_tenant_id());

-- Insert: Users can create models in their tenant
CREATE POLICY "lm_models_insert" ON lm_models
  FOR INSERT
  WITH CHECK (
    tenant_id = get_user_tenant_id() AND
    get_user_role() IN ('admin', 'user')
  );

-- Update: Admins can update, but system models are protected
CREATE POLICY "lm_models_update" ON lm_models
  FOR UPDATE
  USING (
    tenant_id = get_user_tenant_id() AND
    get_user_role() = 'admin' AND
    is_system = false
  );

-- Delete: Admins can delete, but system models are protected
CREATE POLICY "lm_models_delete" ON lm_models
  FOR DELETE
  USING (
    tenant_id = get_user_tenant_id() AND
    get_user_role() = 'admin' AND
    is_system = false
  );

-- Insert default providers and models for new tenants (seed data)
-- This will be done via application layer to handle tenant_id correctly
