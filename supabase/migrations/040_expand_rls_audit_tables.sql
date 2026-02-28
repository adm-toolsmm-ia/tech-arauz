-- =============================================================================
-- Migration 040: Expand RLS Audit to Cover All Tables
-- =============================================================================
-- OBJETIVO: Atualizar audit_all_rls_policies() para incluir tabelas de
-- Tecnologia & IA (agents, agent_types, lm_providers, lm_models) e tabelas
-- auxiliares de agents (agent_versions, agent_variables, agent_runs, agent_templates)
-- Story: 2.25 — RLS CI Automation
-- =============================================================================

CREATE OR REPLACE FUNCTION public.audit_all_rls_policies()
RETURNS TABLE (
    table_name TEXT,
    rls_enabled BOOLEAN,
    total_policies INT,
    service_role_policies INT,
    authenticated_policies INT,
    tenant_isolation_found BOOLEAN,
    has_tenant_id_column BOOLEAN,
    policy_details JSONB
) AS $$
DECLARE
    v_table RECORD;
BEGIN
    FOR v_table IN (
        SELECT unnest(ARRAY[
            -- Core (original 12 tables from migration 026)
            'tenants',
            'profiles',
            'projects',
            'project_schedules',
            'project_deliveries',
            'project_requirements',
            'espaider_apis',
            'sync_logs',
            'integration_log_entries',
            'project_histories',
            'project_approvers',
            'project_budgets',
            -- Tecnologia & IA (added in Story 2.25)
            'agents',
            'agent_types',
            'agent_versions',
            'agent_variables',
            'agent_runs',
            'agent_templates',
            'lm_providers',
            'lm_models'
        ]) AS name
    ) LOOP
        -- Only audit tables that actually exist
        IF EXISTS (
            SELECT 1 FROM pg_tables
            WHERE schemaname = 'public' AND tablename = v_table.name
        ) THEN
            RETURN QUERY SELECT * FROM public.audit_rls_policy(v_table.name);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the summary view to reflect updated function
CREATE OR REPLACE VIEW public.rls_audit_summary AS
WITH source_data AS (
    SELECT
        a.table_name,
        CASE WHEN a.rls_enabled THEN 'Y' ELSE 'N' END as rls_status,
        a.total_policies,
        a.service_role_policies,
        CASE
            -- System tables (tenants, profiles) - only need RLS + policies
            WHEN a.table_name IN ('tenants', 'profiles') AND a.rls_enabled AND a.total_policies > 0 THEN 'PASS'
            WHEN a.table_name IN ('tenants', 'profiles') AND NOT a.rls_enabled THEN 'CRITICAL (RLS disabled)'
            WHEN a.table_name IN ('tenants', 'profiles') AND a.total_policies = 0 THEN 'CRITICAL (no policies)'

            -- Join tables without tenant_id (use parent FK for isolation)
            WHEN a.table_name IN ('agent_versions', 'agent_variables', 'agent_templates')
                AND a.rls_enabled AND a.total_policies > 0 THEN 'PASS'
            WHEN a.table_name IN ('agent_versions', 'agent_variables', 'agent_templates')
                AND NOT a.rls_enabled THEN 'CRITICAL (RLS disabled)'

            -- Data tables (all others) - need RLS + policies + tenant_isolation
            WHEN a.rls_enabled AND a.total_policies > 0 AND a.tenant_isolation_found THEN 'PASS'
            WHEN a.rls_enabled AND a.total_policies > 0 AND NOT a.tenant_isolation_found AND a.has_tenant_id_column THEN 'WARN (no isolation)'
            WHEN a.rls_enabled AND a.total_policies > 0 AND NOT a.tenant_isolation_found AND NOT a.has_tenant_id_column THEN 'CRITICAL (missing tenant_id)'
            WHEN NOT a.rls_enabled THEN 'CRITICAL (RLS disabled)'
            WHEN a.total_policies = 0 THEN 'CRITICAL (no policies)'
            ELSE 'UNKNOWN'
        END as audit_status,
        CASE WHEN a.has_tenant_id_column THEN 'Y' ELSE 'N' END as has_tenant_id,
        CASE WHEN a.tenant_isolation_found THEN 'Y' ELSE 'N' END as tenant_isolation
    FROM public.audit_all_rls_policies() a
)
SELECT * FROM source_data
ORDER BY
    CASE audit_status
        WHEN 'CRITICAL (RLS disabled)' THEN 1
        WHEN 'CRITICAL (no policies)' THEN 2
        WHEN 'CRITICAL (missing tenant_id)' THEN 3
        WHEN 'WARN (no isolation)' THEN 4
        WHEN 'PASS' THEN 5
        ELSE 6
    END;

-- =============================================================================
-- Verification: Run after applying migration
-- =============================================================================
-- SELECT table_name, audit_status FROM public.rls_audit_summary;
-- Expected: 20 rows (or fewer if agent_templates not yet created), all PASS
-- =============================================================================
