-- =============================================================================
-- REAPPLY M026 (FIXED) — Drop old functions and recreate with tenant_id exemption
-- =============================================================================
-- Execute this in Supabase Dashboard → SQL Editor

-- STEP 1: Drop dependent view and functions (clean slate)
DROP VIEW IF EXISTS public.rls_audit_summary;
DROP FUNCTION IF EXISTS public.audit_all_rls_policies();
DROP FUNCTION IF EXISTS public.audit_rls_policy(TEXT);

-- Verify they're gone:
SELECT * FROM pg_proc WHERE proname LIKE 'audit%';
-- Expected: 0 rows


-- STEP 2: Create audit_rls_policy() function
CREATE OR REPLACE FUNCTION public.audit_rls_policy(p_table_name TEXT)
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
    v_rls_enabled BOOLEAN;
    v_total_policies INT;
    v_service_role_count INT;
    v_authenticated_count INT;
    v_tenant_isolation BOOLEAN;
    v_has_tenant_id BOOLEAN;
    v_policies JSONB;
BEGIN
    -- Check if RLS is enabled
    SELECT (schemaname = 'public' AND tablename = p_table_name AND rowsecurity = true)
    INTO v_rls_enabled
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename = p_table_name;

    v_rls_enabled := COALESCE(v_rls_enabled, FALSE);

    -- Count policies
    SELECT COUNT(*)
    INTO v_total_policies
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = p_table_name;

    -- Count service_role policies
    SELECT COUNT(*)
    INTO v_service_role_count
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = p_table_name
      AND (qual LIKE '%service_role%' OR policyname LIKE '%service%');

    v_service_role_count := COALESCE(v_service_role_count, 0);

    -- Count authenticated policies
    SELECT COUNT(*)
    INTO v_authenticated_count
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = p_table_name
      AND (qual LIKE '%authenticated%' OR qual LIKE '%true%' OR qual LIKE '%get_user%');

    v_authenticated_count := COALESCE(v_authenticated_count, 0);

    -- Check for tenant_id column using pg_attribute (more reliable than information_schema)
    SELECT EXISTS (
        SELECT 1
        FROM pg_attribute pa
        JOIN pg_class pc ON pa.attrelid = pc.oid
        JOIN pg_namespace pn ON pc.relnamespace = pn.oid
        WHERE pn.nspname = 'public'
          AND pc.relname = p_table_name
          AND pa.attname = 'tenant_id'
          AND NOT pa.attisdropped
    ) INTO v_has_tenant_id;

    -- Check for tenant isolation in policies
    SELECT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = p_table_name
          AND qual LIKE '%tenant_id%get_user_tenant_id%'
    ) INTO v_tenant_isolation;

    -- Get detailed policy info
    SELECT jsonb_agg(jsonb_build_object(
        'policy_name', policyname,
        'command', cmd,
        'qual', qual,
        'with_check', with_check
    ))
    INTO v_policies
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = p_table_name;

    v_policies := COALESCE(v_policies, '[]'::JSONB);

    -- Return audit results
    RETURN QUERY SELECT
        p_table_name,
        v_rls_enabled,
        v_total_policies,
        v_service_role_count,
        v_authenticated_count,
        v_tenant_isolation,
        v_has_tenant_id,
        v_policies;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- STEP 3: Create helper function to audit all tables at once
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
    -- Iterate through all tables that should have RLS
    FOR v_table IN (
        SELECT unnest(ARRAY[
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
            'project_budgets'
        ]) AS name
    ) LOOP
        RETURN QUERY SELECT * FROM public.audit_rls_policy(v_table.name);
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- STEP 4: Create summary view (FIXED - exempts tenants/profiles from tenant_id requirement)
CREATE OR REPLACE VIEW public.rls_audit_summary AS
WITH source_data AS (
    SELECT
        table_name,
        CASE WHEN rls_enabled THEN '✅' ELSE '❌' END as rls_status,
        total_policies,
        service_role_policies,
        CASE
            -- System tables (tenants, profiles) - only need RLS + policies, no tenant_id required
            WHEN table_name IN ('tenants', 'profiles') AND rls_enabled AND total_policies > 0 THEN '✅ PASS'
            WHEN table_name IN ('tenants', 'profiles') AND NOT rls_enabled THEN '🔴 CRITICAL (RLS disabled)'
            WHEN table_name IN ('tenants', 'profiles') AND total_policies = 0 THEN '🔴 CRITICAL (no policies)'

            -- Data tables (all others) - need RLS + policies + tenant_isolation
            WHEN rls_enabled AND total_policies > 0 AND tenant_isolation_found THEN '✅ PASS'
            WHEN rls_enabled AND total_policies > 0 AND NOT tenant_isolation_found AND has_tenant_id_column THEN '⚠️  WARN (no isolation)'
            WHEN rls_enabled AND total_policies > 0 AND NOT tenant_isolation_found AND NOT has_tenant_id_column THEN '🔴 CRITICAL (missing tenant_id)'
            WHEN NOT rls_enabled THEN '🔴 CRITICAL (RLS disabled)'
            WHEN total_policies = 0 THEN '🔴 CRITICAL (no policies)'
            ELSE '❓ UNKNOWN'
        END as audit_status,
        CASE WHEN has_tenant_id_column THEN '✅' ELSE '❌' END as has_tenant_id,
        CASE WHEN tenant_isolation_found THEN '✅' ELSE '❌' END as tenant_isolation
    FROM public.audit_all_rls_policies()
)
SELECT * FROM source_data
ORDER BY
    CASE audit_status
        WHEN '🔴 CRITICAL (RLS disabled)' THEN 1
        WHEN '🔴 CRITICAL (no policies)' THEN 2
        WHEN '🔴 CRITICAL (missing tenant_id)' THEN 3
        WHEN '⚠️  WARN (no isolation)' THEN 4
        WHEN '✅ PASS' THEN 5
        ELSE 6
    END;


-- STEP 5: Verify M026 is complete
SELECT proname, pronargs FROM pg_proc
WHERE proname LIKE 'audit%'
ORDER BY proname;
-- Expected: 2 rows (audit_all_rls_policies, audit_rls_policy)


-- STEP 6: TEST 2.2 — Run the audit summary
SELECT * FROM public.rls_audit_summary;
-- Expected: 12 rows with tenants/profiles showing '✅ PASS' (no longer CRITICAL)
