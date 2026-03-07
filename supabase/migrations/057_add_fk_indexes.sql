-- Migration 024: Add Foreign Key Indexes for Performance Optimization
-- Story 5.1: Database Indexes & Performance Baseline
-- Date: 2026-03-07
-- Author: Dara (@data-engineer)
-- Effort: 1-2 hours
-- Risk: VERY LOW (non-destructive, read-only operation)

-- Description:
-- Adds 3 composite indexes on critical foreign key columns to improve
-- paginated query performance. Expected improvement: 20-50% faster queries.
-- All indexes are non-destructive and can be safely rolled back.

-- Index 1: integration_logs - Optimize tenant_id + created_at queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_integration_logs_tenant_created
ON integration_logs(tenant_id, created_at DESC);

-- Index 2: schedules - Optimize project_id + deliverable_id lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_schedules_project_deliverable
ON schedules(project_id, deliverable_id);

-- Index 3: agent_sessions - Optimize user_id + created_at queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_sessions_user_created
ON agent_sessions(user_id, created_at DESC);

-- Verification queries (run after migration to confirm)
-- SELECT schemaname, tablename, indexname FROM pg_indexes
-- WHERE indexname LIKE 'idx_%'
-- ORDER BY tablename;

-- Rollback: DROP INDEX CONCURRENTLY IF EXISTS idx_integration_logs_tenant_created;
--          DROP INDEX CONCURRENTLY IF EXISTS idx_schedules_project_deliverable;
--          DROP INDEX CONCURRENTLY IF EXISTS idx_agent_sessions_user_created;
