-- Migration 057: Add Foreign Key Indexes for Performance Optimization
-- Story 5.1: Database Indexes & Performance Baseline
-- Date: 2026-03-07
-- Author: Dara (@data-engineer)
-- Effort: 1-2 hours
-- Risk: VERY LOW (non-destructive, read-only operation)

-- Description:
-- Adds 3 composite indexes on critical foreign key columns to improve
-- paginated query performance. Expected improvement: 20-50% faster queries.
-- All indexes are non-destructive and can be safely rolled back.
--
-- Correções: tabelas corretas do schema (integration_log_entries, project_schedules).
-- CREATE INDEX sem CONCURRENTLY para rodar dentro de transaction (Supabase migrations).

-- Index 1: integration_log_entries - Optimize tenant_id + created_at queries
-- (Tabela correta: integration_log_entries, não integration_logs)
CREATE INDEX IF NOT EXISTS idx_integration_log_entries_tenant_created
ON public.integration_log_entries(tenant_id, created_at DESC);

-- Index 2: project_schedules - Optimize project_id + created_at lookups
-- (Tabela correta: project_schedules, não schedules; sem deliverable_id)
CREATE INDEX IF NOT EXISTS idx_project_schedules_project_created
ON public.project_schedules(project_id, created_at DESC);

-- Index 3: agent_sessions - Optimize user_id + created_at queries
CREATE INDEX IF NOT EXISTS idx_agent_sessions_user_created
ON public.agent_sessions (user_id, created_at DESC);

-- Verification queries (run after migration to confirm)
-- SELECT schemaname, tablename, indexname FROM pg_indexes
-- WHERE indexname LIKE 'idx_%'
-- ORDER BY tablename;

-- Rollback: DROP INDEX IF EXISTS idx_integration_log_entries_tenant_created;
--          DROP INDEX IF EXISTS idx_project_schedules_project_created;
--          DROP INDEX IF EXISTS idx_agent_sessions_user_created;
