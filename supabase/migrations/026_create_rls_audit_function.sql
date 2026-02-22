-- =============================================================================
-- Migration 026: Create RLS Policy Audit Function
-- =============================================================================
-- OBJETIVO: Criar função SQL que audita RLS policies em qualquer tabela
-- FASE 2 da Story S1-2: RLS Policy Framework

-- Create audit function
CREATE OR REPLACE FUNCTION public.audit_rls_policy(table_name TEXT)
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
    SELECT (schemaname = 'public' AND tablename = table_name AND rowsecurity = true)
    INTO v_rls_enabled
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename = table_name;

    v_rls_enabled := COALESCE(v_rls_enabled, FALSE);

    -- Count policies
    SELECT COUNT(*)
    INTO v_total_policies
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = table_name;

    -- Count service_role policies
    SELECT COUNT(*)
    INTO v_service_role_count
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = table_name
      AND qual LIKE '%service_role%' OR policyname LIKE '%service%';

    v_service_role_count := COALESCE(v_service_role_count, 0);

    -- Check for tenant_id column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = table_name
          AND column_name = 'tenant_id'
    ) INTO v_has_tenant_id;

    -- Check for tenant isolation in policies
    SELECT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = table_name
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
    WHERE schemaname = 'public' AND tablename = table_name;

    v_policies := COALESCE(v_policies, '[]'::JSONB);

    -- Return audit results
    RETURN QUERY SELECT
        table_name,
        v_rls_enabled,
        v_total_policies,
        v_service_role_count,
        v_authenticated_count,
        v_tenant_isolation,
        v_has_tenant_id,
        v_policies;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit view
CREATE OR REPLACE VIEW public.rls_audit_summary AS
SELECT
    'audit_function_created'::text as status;

-- =============================================================================
-- PART 5: Test queries
-- =============================================================================
-- TEST 1: Audit specific table
-- SELECT * FROM public.audit_rls_policy('projects');
-- Expected: RLS enabled, 4 policies, tenant isolation found
