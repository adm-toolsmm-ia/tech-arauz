-- Migration: Create Advanced Model Governance Tables
-- Description: Add tables for governance reviews, cost monitoring, incidents, fallback policies, and change logs
-- Epic: Épico 1 — Governança de Dados e Classificação de Agentes
-- Story: 1.3 — Migration 047: Tabelas de Governança Avançada
-- Created: 2026-03-01
-- Author: Claude (Dara)

-- =============================================================================
-- 1. Model Governance Reviews Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS model_governance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES lm_models(id) ON DELETE CASCADE,

  -- Review Details
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'needs_revision'))
    DEFAULT 'pending',
  notes TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  UNIQUE(tenant_id, model_id)
);

CREATE INDEX IF NOT EXISTS idx_model_governance_reviews_tenant ON model_governance_reviews(tenant_id);
CREATE INDEX IF NOT EXISTS idx_model_governance_reviews_model ON model_governance_reviews(model_id);
CREATE INDEX IF NOT EXISTS idx_model_governance_reviews_status ON model_governance_reviews(status);
CREATE INDEX IF NOT EXISTS idx_model_governance_reviews_reviewed_at ON model_governance_reviews(reviewed_at DESC) WHERE reviewed_at IS NOT NULL;

-- =============================================================================
-- 2. Model Cost Monitoring Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS model_cost_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES lm_models(id) ON DELETE CASCADE,

  -- Billing Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Usage Metrics
  total_requests INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_input_tokens INTEGER DEFAULT 0,
  total_output_tokens INTEGER DEFAULT 0,

  -- Cost Tracking
  total_cost_usd NUMERIC(10, 4) DEFAULT 0,
  input_cost_usd NUMERIC(10, 4) DEFAULT 0,
  output_cost_usd NUMERIC(10, 4) DEFAULT 0,

  -- Performance Metrics
  p50_latency_ms INTEGER,
  p95_latency_ms INTEGER,
  p99_latency_ms INTEGER,
  min_latency_ms INTEGER,
  max_latency_ms INTEGER,

  -- Reliability
  error_count INTEGER DEFAULT 0,
  error_rate NUMERIC(5, 2) DEFAULT 0, -- percentage: 0-100

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Constraints
  CHECK (period_end >= period_start),
  CHECK (total_cost_usd >= 0),
  CHECK (error_rate >= 0 AND error_rate <= 100),
  UNIQUE(tenant_id, model_id, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_model_cost_monitoring_tenant ON model_cost_monitoring(tenant_id);
CREATE INDEX IF NOT EXISTS idx_model_cost_monitoring_model ON model_cost_monitoring(model_id);
CREATE INDEX IF NOT EXISTS idx_model_cost_monitoring_period ON model_cost_monitoring(period_start DESC, period_end DESC);
CREATE INDEX IF NOT EXISTS idx_model_cost_monitoring_cost ON model_cost_monitoring(total_cost_usd DESC);

-- =============================================================================
-- 3. Model Incidents Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS model_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES lm_models(id) ON DELETE CASCADE,

  -- Incident Details
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical'))
    DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,

  -- Timeline
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,

  -- Impact & Resolution
  impact_summary TEXT,
  mitigation_steps TEXT,
  root_cause TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_model_incidents_tenant ON model_incidents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_model_incidents_model ON model_incidents(model_id);
CREATE INDEX IF NOT EXISTS idx_model_incidents_severity ON model_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_model_incidents_started_at ON model_incidents(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_model_incidents_active ON model_incidents(model_id, resolved_at) WHERE resolved_at IS NULL;

-- =============================================================================
-- 4. Model Fallback Policies Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS model_fallback_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  primary_model_id UUID NOT NULL REFERENCES lm_models(id) ON DELETE CASCADE,
  fallback_model_id UUID NOT NULL REFERENCES lm_models(id) ON DELETE CASCADE,

  -- Fallback Configuration
  trigger_on TEXT[] NOT NULL DEFAULT ARRAY['timeout', 'rate_limit', 'error_500']::TEXT[],
    -- Trigger conditions: 'timeout', 'rate_limit', 'error_500', 'error_429', 'error_503'
  priority INTEGER NOT NULL DEFAULT 1, -- Lower number = higher priority
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Constraints
  CHECK (primary_model_id != fallback_model_id),
  CHECK (priority >= 1),
  UNIQUE(tenant_id, primary_model_id, fallback_model_id)
);

CREATE INDEX IF NOT EXISTS idx_model_fallback_policies_tenant ON model_fallback_policies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_model_fallback_policies_primary ON model_fallback_policies(primary_model_id);
CREATE INDEX IF NOT EXISTS idx_model_fallback_policies_fallback ON model_fallback_policies(fallback_model_id);
CREATE INDEX IF NOT EXISTS idx_model_fallback_policies_active ON model_fallback_policies(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_model_fallback_policies_priority ON model_fallback_policies(priority);

-- =============================================================================
-- 5. Model Change Log Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS model_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES lm_models(id) ON DELETE CASCADE,

  -- Change Details
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'deprecated', 'sunset', 'other'))
    DEFAULT 'updated',

  -- What Changed
  field_name TEXT, -- Which field was changed (e.g., 'stability_level', 'is_active')
  old_value JSONB, -- Previous value (JSON-serialized)
  new_value JSONB, -- New value (JSON-serialized)

  -- Change Metadata
  change_reason TEXT,

  -- Timestamp
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_model_change_log_tenant ON model_change_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_model_change_log_model ON model_change_log(model_id);
CREATE INDEX IF NOT EXISTS idx_model_change_log_changed_at ON model_change_log(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_model_change_log_type ON model_change_log(change_type);

-- =============================================================================
-- 6. Enable RLS (Row-Level Security) for All New Tables
-- =============================================================================

ALTER TABLE model_governance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_cost_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_fallback_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_change_log ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 7. RLS Policies - All Tables (Tenant Isolation Pattern)
-- =============================================================================

-- Model Governance Reviews
CREATE POLICY model_governance_reviews_tenant_isolation ON model_governance_reviews
  USING (tenant_id = get_user_tenant_id())
  WITH CHECK (tenant_id = get_user_tenant_id());

-- Model Cost Monitoring
CREATE POLICY model_cost_monitoring_tenant_isolation ON model_cost_monitoring
  USING (tenant_id = get_user_tenant_id())
  WITH CHECK (tenant_id = get_user_tenant_id());

-- Model Incidents
CREATE POLICY model_incidents_tenant_isolation ON model_incidents
  USING (tenant_id = get_user_tenant_id())
  WITH CHECK (tenant_id = get_user_tenant_id());

-- Model Fallback Policies
CREATE POLICY model_fallback_policies_tenant_isolation ON model_fallback_policies
  USING (tenant_id = get_user_tenant_id())
  WITH CHECK (tenant_id = get_user_tenant_id());

-- Model Change Log
CREATE POLICY model_change_log_tenant_isolation ON model_change_log
  USING (tenant_id = get_user_tenant_id())
  WITH CHECK (tenant_id = get_user_tenant_id());

-- =============================================================================
-- 8. Add Documentation Comments
-- =============================================================================

COMMENT ON TABLE model_governance_reviews IS 'Track governance review status for each model (approval workflow)';
COMMENT ON TABLE model_cost_monitoring IS 'Monitor cost, usage, and performance metrics by billing period per model';
COMMENT ON TABLE model_incidents IS 'Record incidents, outages, and issues affecting models';
COMMENT ON TABLE model_fallback_policies IS 'Define fallback chains: if primary model fails, try fallback model';
COMMENT ON TABLE model_change_log IS 'Audit trail of all changes to model configurations (immutable)';

COMMENT ON COLUMN model_fallback_policies.trigger_on IS 'Array of failure conditions that trigger fallback: timeout, rate_limit, error_500, error_429, error_503';
COMMENT ON COLUMN model_change_log.old_value IS 'Previous value of the field (JSON for flexibility)';
COMMENT ON COLUMN model_change_log.new_value IS 'New value of the field (JSON for flexibility)';
