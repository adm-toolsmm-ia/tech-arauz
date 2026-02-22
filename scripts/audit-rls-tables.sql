-- =============================================================================
-- RLS Policy Audit Script — Execute this in Supabase SQL Editor
-- =============================================================================
-- FASE 3: Auditar Todas as Tabelas
-- Story: S1-2 RLS Policy Framework

-- ============================================================================
-- STEP 1: Quick Status Check (RLS Enabled)
-- ============================================================================
SELECT
    t.tablename,
    t.rowsecurity as "RLS Enabled"
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND t.tablename IN (
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
  )
ORDER BY t.tablename;

-- ============================================================================
-- STEP 2: Policy Count by Table
-- ============================================================================
SELECT
    p.tablename,
    COUNT(*) as "Policy Count",
    string_agg(DISTINCT p.cmd, ', ') as "Commands"
FROM pg_policies p
WHERE p.schemaname = 'public'
  AND p.tablename IN (
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
  )
GROUP BY p.tablename
ORDER BY p.tablename;

-- ============================================================================
-- STEP 3: Detailed Policy List
-- ============================================================================
SELECT
    tablename,
    policyname,
    cmd,
    qual as "USING Clause",
    with_check as "WITH CHECK Clause"
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
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
  )
ORDER BY tablename, policyname;

-- ============================================================================
-- STEP 7: Summary — Critical Issues
-- ============================================================================
SELECT
    t.tablename,
    t.rowsecurity as "RLS Enabled",
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) as "Policy Count",
    (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = t.tablename AND column_name = 'tenant_id') as "Has tenant_id",
    (SELECT COUNT(*) FROM pg_policies
     WHERE tablename = t.tablename AND qual LIKE '%tenant_id%get_user_tenant_id%') as "Has Tenant Isolation",
    CASE
        WHEN NOT t.rowsecurity THEN 'CRITICAL: RLS disabled'
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) = 0 THEN 'CRITICAL: No policies'
        WHEN (SELECT COUNT(*) FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = t.tablename AND column_name = 'tenant_id') = 0
             THEN 'CRITICAL: Missing tenant_id column'
        WHEN (SELECT COUNT(*) FROM pg_policies
              WHERE tablename = t.tablename AND qual LIKE '%tenant_id%get_user_tenant_id%') = 0
             THEN 'WARN: Missing tenant isolation policy'
        ELSE 'PASS'
    END as "Audit Status"
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND t.tablename IN (
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
  )
ORDER BY t.tablename;
