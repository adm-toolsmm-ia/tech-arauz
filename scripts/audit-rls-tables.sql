-- =============================================================================
-- RLS Policy Audit Script — Execute this in Supabase SQL Editor
-- =============================================================================
-- This script runs the comprehensive RLS audit on all 11 core tables
-- Generated for Story S1-2 Phase 3
--
-- HOW TO RUN:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Copy-paste this entire script
-- 3. Click "Run" button
-- 4. Save results and compare with expected findings
-- =============================================================================

-- ============================================================================
-- STEP 1: Quick Status Check (RLS Enabled)
-- ============================================================================
-- Shows which tables have RLS enabled
-- Expected: All 11 tables should show "true"

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
-- Shows how many policies each table has
-- Expected:
-- - Core tables (tenants, profiles, projects, etc.): 3-4 policies each
-- - Child tables (histories, approvers, budgets): 2 policies each
-- - Logs tables: 2 policies each

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
-- STEP 3: Detailed Policy List with USING/WITH CHECK Clauses
-- ============================================================================
-- Shows the exact USING and WITH CHECK conditions
-- Look for tenant_id checks in the USING column

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
-- STEP 4: Tenant Isolation Check
-- ============================================================================
-- Shows which tables have proper tenant isolation policies
-- Expected for core tables:
--   USING clause should contain: tenant_id = public.get_user_tenant_id()

SELECT
    p.tablename,
    COUNT(*) as "Tenant Isolation Policies",
    CASE
        WHEN COUNT(*) > 0 THEN '✅ Has tenant isolation'
        ELSE '❌ Missing tenant isolation'
    END as "Status"
FROM pg_policies p
WHERE p.schemaname = 'public'
  AND p.qual LIKE '%tenant_id%get_user_tenant_id%'
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
-- STEP 5: Service Role Access Check
-- ============================================================================
-- Shows which tables have explicit service_role policies
-- Expected:
--   - Core tables: Implicit bypass (no explicit policies needed)
--   - Sync tables (logs, histories, etc.): Explicit "ALL" policies for service_role

SELECT
    p.tablename,
    COUNT(*) as "Service Role Policies",
    string_agg(DISTINCT p.policyname, ', ') as "Policy Names",
    CASE
        WHEN COUNT(*) > 0 THEN '✅ Service role has explicit access'
        ELSE '⚠️  Service role has implicit bypass'
    END as "Access Type"
FROM pg_policies p
WHERE p.schemaname = 'public'
  AND (p.qual LIKE '%service_role%' OR p.policyname LIKE '%service%')
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
-- STEP 6: Check for tenant_id Column in Child Tables
-- ============================================================================
-- Child tables MUST have tenant_id for proper isolation
-- Expected: All tables should have tenant_id column

SELECT
    c.table_name,
    CASE
        WHEN column_name = 'tenant_id' THEN '✅ Has tenant_id'
        ELSE '❌ Missing tenant_id'
    END as "tenant_id Status"
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND c.table_name IN (
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
  AND c.column_name = 'tenant_id'
ORDER BY c.table_name;

-- ============================================================================
-- STEP 7: Summary — Critical Issues
-- ============================================================================
-- Shows tables with CRITICAL issues
-- Expected: project_histories, project_approvers, project_budgets should show
--   either missing tenant_id or missing tenant isolation policies

SELECT
    t.tablename,
    t.rowsecurity as "RLS Enabled",
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) as "Policy Count",
    (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = t.tablename AND column_name = 'tenant_id') as "Has tenant_id",
    (SELECT COUNT(*) FROM pg_policies
     WHERE tablename = t.tablename AND qual LIKE '%tenant_id%get_user_tenant_id%') as "Has Tenant Isolation",
    CASE
        WHEN NOT t.rowsecurity THEN '🔴 CRITICAL: RLS disabled'
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) = 0 THEN '🔴 CRITICAL: No policies'
        WHEN (SELECT COUNT(*) FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = t.tablename AND column_name = 'tenant_id') = 0
             THEN '🔴 CRITICAL: Missing tenant_id column'
        WHEN (SELECT COUNT(*) FROM pg_policies
              WHERE tablename = t.tablename AND qual LIKE '%tenant_id%get_user_tenant_id%') = 0
             THEN '⚠️  WARN: Missing tenant isolation policy'
        ELSE '✅ PASS'
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

-- ============================================================================
-- END OF AUDIT SCRIPT
-- ============================================================================
-- Save your results! Compare with:
-- docs/audit/AUDIT-FINDINGS.md
--
-- Expected Critical Issues:
-- - project_histories: Missing tenant isolation
-- - project_approvers: Missing tenant isolation
-- - project_budgets: Missing tenant isolation
--
-- All others should be PASS
-- ============================================================================
