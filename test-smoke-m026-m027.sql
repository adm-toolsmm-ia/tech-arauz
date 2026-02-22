-- ============================================================================
-- SMOKE TEST: M026 + M027 Validation
-- ============================================================================
-- Run these queries in Supabase SQL Editor to validate migrations

-- TEST 2.2: Audit Function Works
-- Expected: All 12 tables with ✅ PASS status (tenants/profiles exempt from tenant_id check)
SELECT * FROM public.rls_audit_summary;

-- TEST 2.3: Verify project_histories migration
-- Expected: rls_enabled=true, total_policies>=2, tenant_isolation_found=true, has_tenant_id_column=true
SELECT * FROM public.audit_rls_policy('project_histories');

-- TEST 2.3b: Verify project_approvers migration
-- Expected: Same as above
SELECT * FROM public.audit_rls_policy('project_approvers');

-- TEST 2.3c: Verify project_budgets migration
-- Expected: Same as above
SELECT * FROM public.audit_rls_policy('project_budgets');

-- Detailed check: Verify tenant_id columns exist
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_name IN ('project_histories', 'project_approvers', 'project_budgets')
  AND column_name = 'tenant_id'
ORDER BY table_name;

-- Detailed check: Verify RLS policies on child tables
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('project_histories', 'project_approvers', 'project_budgets')
ORDER BY tablename, policyname;

-- Detailed check: Verify UNIQUE constraints
SELECT constraint_name, table_name
FROM information_schema.table_constraints
WHERE table_name IN ('project_histories', 'project_approvers', 'project_budgets')
  AND constraint_type = 'UNIQUE'
ORDER BY table_name;
