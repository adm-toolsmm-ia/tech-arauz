-- =============================================================================
-- Migration 072: Fix RLS policies for project_approvers and project_histories
-- Created: 2026-03-19
-- Description:
--   Add missing RLS INSERT policies for service_role on project_approvers
--   and project_histories tables to allow sync operations.
-- =============================================================================

-- ============================================================================
-- PARTE 1: Fix project_approvers RLS
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "approvers: service role full access" ON public.project_approvers;
DROP POLICY IF EXISTS "approvers: tenant isolation select" ON public.project_approvers;

-- Add comprehensive service_role policy
CREATE POLICY "approvers: service role full access"
  ON public.project_approvers FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add authenticated user read policy
CREATE POLICY "approvers: tenant isolation select"
  ON public.project_approvers FOR SELECT
  TO authenticated
  USING (tenant_id = public.get_user_tenant_id());

-- ============================================================================
-- PARTE 2: Fix project_histories RLS
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "histories: service role full access" ON public.project_histories;
DROP POLICY IF EXISTS "histories: tenant isolation select" ON public.project_histories;

-- Add comprehensive service_role policy
CREATE POLICY "histories: service role full access"
  ON public.project_histories FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add authenticated user read policy
CREATE POLICY "histories: tenant isolation select"
  ON public.project_histories FOR SELECT
  TO authenticated
  USING (tenant_id = public.get_user_tenant_id());

-- ============================================================================
-- Verification
-- ============================================================================
-- SELECT tablename FROM pg_tables
-- WHERE tablename IN ('project_approvers', 'project_histories');
-- Should return 2 rows if tables exist.
