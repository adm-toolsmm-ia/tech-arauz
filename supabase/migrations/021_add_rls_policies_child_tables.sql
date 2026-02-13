-- Migration 021: Add RLS Policies for Child Tables
-- Created: 2026-02-13
-- Objetivo: Adicionar policies corretas para permitir INSERTs via service_role
-- Fix: Migration 019 dropou policies mas não recriou

-- ============================================================================
-- PART 1: project_histories RLS Policies
-- ============================================================================

-- Policy para authenticated users (SELECT)
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.project_histories;
CREATE POLICY "Enable read access for authenticated users" ON public.project_histories
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy para service_role (ALL operations including INSERT)
DROP POLICY IF EXISTS "Enable all access for service role" ON public.project_histories;
CREATE POLICY "Enable all access for service role" ON public.project_histories
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);  -- CRÍTICO para permitir INSERTs!

-- ============================================================================
-- PART 2: project_approvers RLS Policies
-- ============================================================================

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.project_approvers;
CREATE POLICY "Enable read access for authenticated users" ON public.project_approvers
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Enable all access for service role" ON public.project_approvers;
CREATE POLICY "Enable all access for service role" ON public.project_approvers
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- PART 3: project_budgets RLS Policies
-- ============================================================================

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.project_budgets;
CREATE POLICY "Enable read access for authenticated users" ON public.project_budgets
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Enable all access for service role" ON public.project_budgets;
CREATE POLICY "Enable all access for service role" ON public.project_budgets
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
