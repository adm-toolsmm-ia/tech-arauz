-- Migration 017: Fix RLS policies for child tables
-- Created: 2026-02-13
-- Description: Add WITH CHECK (true) to service_role policies for INSERT operations

-- ============================================================================
-- PART 1: Fix project_histories policies
-- ============================================================================
DROP POLICY IF EXISTS "Enable all access for service role" ON public.project_histories;

CREATE POLICY "Enable all access for service role" ON public.project_histories
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- PART 2: Fix project_budgets policies
-- ============================================================================
DROP POLICY IF EXISTS "Enable all access for service role" ON public.project_budgets;

CREATE POLICY "Enable all access for service role" ON public.project_budgets
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- PART 3: Fix project_approvers policies
-- ============================================================================
DROP POLICY IF EXISTS "Enable all access for service role" ON public.project_approvers;

CREATE POLICY "Enable all access for service role" ON public.project_approvers
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
