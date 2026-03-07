-- Tests for Migration 057: Foreign Key Indexes
-- Story 5.1: Database Indexes & Performance Baseline
-- Date: 2026-03-07
-- Purpose: Validate index creation, reversibility, and zero breaking changes
-- Correções: tabelas corretas (integration_log_entries, project_schedules)

-- Test Suite 1: Index Existence Validation
-- ============================================

-- Test 1.1: Verify idx_integration_log_entries_tenant_created exists
SELECT
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE indexname = 'idx_integration_log_entries_tenant_created'
  AND schemaname = 'public';
-- Expected: 1 row (index exists)

-- Test 1.2: Verify idx_project_schedules_project_created exists
SELECT
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE indexname = 'idx_project_schedules_project_created'
  AND schemaname = 'public';
-- Expected: 1 row (index exists)

-- Test 1.3: Verify idx_agent_sessions_user_created exists
SELECT
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE indexname = 'idx_agent_sessions_user_created'
  AND schemaname = 'public';
-- Expected: 1 row (index exists)

-- Test Suite 2: Index Composition Validation
-- ===========================================

-- Test 2.1: Verify idx_integration_log_entries_tenant_created column composition
SELECT
  attname,
  attnum
FROM pg_index
JOIN pg_attribute ON pg_attribute.attrelid = pg_index.indrelid
WHERE pg_index.indexrelname = 'idx_integration_log_entries_tenant_created'
ORDER BY attnum;
-- Expected: 2 columns (tenant_id, created_at)

-- Test 2.2: Verify idx_project_schedules_project_created column composition
SELECT
  attname,
  attnum
FROM pg_index
JOIN pg_attribute ON pg_attribute.attrelid = pg_index.indrelid
WHERE pg_index.indexrelname = 'idx_project_schedules_project_created'
ORDER BY attnum;
-- Expected: 2 columns (project_id, created_at)

-- Test 2.3: Verify idx_agent_sessions_user_created column composition
SELECT
  attname,
  attnum
FROM pg_index
JOIN pg_attribute ON pg_attribute.attrelid = pg_index.indrelid
WHERE pg_index.indexrelname = 'idx_agent_sessions_user_created'
ORDER BY attnum;
-- Expected: 2 columns (user_id, created_at)

-- Test Suite 3: Data Integrity Validation
-- =======================================

-- Test 3.1: Verify no data loss or corruption on integration_log_entries
SELECT
  COUNT(*) as total_records,
  COUNT(DISTINCT tenant_id) as unique_tenants,
  COUNT(DISTINCT created_at) as unique_timestamps
FROM public.integration_log_entries;
-- Expected: Data counts remain same (non-destructive operation)

-- Test 3.2: Verify no data loss on project_schedules
SELECT
  COUNT(*) as total_records,
  COUNT(DISTINCT project_id) as unique_projects
FROM public.project_schedules;
-- Expected: Data counts remain same

-- Test 3.3: Verify no data loss on agent_sessions
SELECT
  COUNT(*) as total_records,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT agent_id) as unique_agents
FROM public.agent_sessions;
-- Expected: Data counts remain same

-- Test Suite 4: Zero Breaking Changes Validation
-- =============================================

-- Test 4.1: Verify application queries still work (integration_log_entries)
SELECT
  id,
  level,
  dataset,
  created_at
FROM public.integration_log_entries
WHERE tenant_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
-- Expected: Queries execute successfully, no errors

-- Test 4.2: Verify application queries still work (project_schedules)
SELECT
  id,
  project_id,
  created_at
FROM public.project_schedules
WHERE project_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
-- Expected: Queries execute successfully, no errors

-- Test 4.3: Verify application queries still work (agent_sessions)
SELECT
  id,
  user_id,
  agent_id,
  created_at
FROM public.agent_sessions
WHERE user_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
-- Expected: Queries execute successfully, no errors

-- Test Suite 5: Index Usage Validation
-- ====================================

-- Test 5.1: Verify idx_integration_log_entries_tenant_created is being used
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, level, created_at
FROM public.integration_log_entries
WHERE tenant_id = '123e4567-e89b-12d3-a456-426614174000'
ORDER BY created_at DESC
LIMIT 50;
-- Expected: Query plan shows index usage (IndexScan or similar)

-- Test 5.2: Verify idx_project_schedules_project_created is being used
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, project_id, created_at
FROM public.project_schedules
WHERE project_id = '123e4567-e89b-12d3-a456-426614174000'
ORDER BY created_at DESC
LIMIT 50;
-- Expected: Query plan shows index usage

-- Test 5.3: Verify idx_agent_sessions_user_created is being used
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, agent_id, created_at
FROM public.agent_sessions
WHERE user_id = '123e4567-e89b-12d3-a456-426614174000'
ORDER BY created_at DESC
LIMIT 50;
-- Expected: Query plan shows index usage

-- Test Suite 6: Reversibility Validation
-- ======================================

-- Test 6.1: Verify rollback SQL is available
-- Rollback commands (from migration file):
-- DROP INDEX IF EXISTS idx_integration_log_entries_tenant_created;
-- DROP INDEX IF EXISTS idx_project_schedules_project_created;
-- DROP INDEX IF EXISTS idx_agent_sessions_user_created;
-- Expected: These commands will successfully remove indexes without data loss

-- Test 6.2: Verify queries work without indexes (after rollback)
-- After executing rollback SQL above, re-run Test Suite 4 queries
-- Expected: All queries continue to work (slower, but functional)

-- Test Suite 7: Performance Baseline Validation
-- ============================================

-- Test 7.1: Measure query performance on integration_log_entries
\timing on
SELECT COUNT(*) as record_count
FROM public.integration_log_entries
WHERE tenant_id IS NOT NULL
GROUP BY tenant_id;
-- Expected: <100ms per query (post-index)

-- Test 7.2: Measure query performance on project_schedules
SELECT COUNT(*) as record_count
FROM public.project_schedules
WHERE project_id IS NOT NULL
GROUP BY project_id;
-- Expected: <100ms per query (post-index)

-- Test 7.3: Measure query performance on agent_sessions
SELECT COUNT(*) as record_count
FROM public.agent_sessions
WHERE user_id IS NOT NULL
GROUP BY user_id;
-- Expected: <100ms per query (post-index)

-- Summary: All tests should PASS
-- If any test fails, rollback the migration immediately
-- and investigate the root cause before redeploying.
