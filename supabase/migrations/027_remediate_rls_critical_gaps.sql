-- =============================================================================
-- Migration 027: Remediate RLS Critical Gaps in Child Tables
-- =============================================================================
-- OBJETIVO: Fixar vulnerabilidades de isolamento multi-tenant em 3 tabelas
-- STORY: S1-2 RLS Policy Framework
-- SEVERITY: CRITICAL (Data leakage risk)

-- PARTE 1: Adicionar tenant_id às tabelas filhas
ALTER TABLE public.project_histories
ADD COLUMN IF NOT EXISTS tenant_id UUID;

ALTER TABLE public.project_approvers
ADD COLUMN IF NOT EXISTS tenant_id UUID;

ALTER TABLE public.project_budgets
ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- PARTE 2: Backfill com tenant Araúz
UPDATE public.project_histories
SET tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

UPDATE public.project_approvers
SET tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

UPDATE public.project_budgets
SET tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

-- PARTE 3: Set NOT NULL
ALTER TABLE public.project_histories
ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE public.project_approvers
ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE public.project_budgets
ALTER COLUMN tenant_id SET NOT NULL;

-- PARTE 4: Adicionar FK
ALTER TABLE public.project_histories
ADD CONSTRAINT fk_project_histories_tenant_id
FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.project_approvers
ADD CONSTRAINT fk_project_approvers_tenant_id
FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.project_budgets
ADD CONSTRAINT fk_project_budgets_tenant_id
FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- PARTE 5: Adicionar indexes
CREATE INDEX IF NOT EXISTS idx_project_histories_tenant_id
ON public.project_histories(tenant_id);

CREATE INDEX IF NOT EXISTS idx_project_approvers_tenant_id
ON public.project_approvers(tenant_id);

CREATE INDEX IF NOT EXISTS idx_project_budgets_tenant_id
ON public.project_budgets(tenant_id);

-- PARTE 6: Drop old policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.project_histories;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.project_approvers;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.project_budgets;
DROP POLICY IF EXISTS "Enable all access for service role" ON public.project_histories;
DROP POLICY IF EXISTS "Enable all access for service role" ON public.project_approvers;
DROP POLICY IF EXISTS "Enable all access for service role" ON public.project_budgets;

-- PARTE 7: Create fixed policies
CREATE POLICY "project_histories_select"
    ON public.project_histories FOR SELECT
    USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "project_histories_service_all"
    ON public.project_histories FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "project_approvers_select"
    ON public.project_approvers FOR SELECT
    USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "project_approvers_service_all"
    ON public.project_approvers FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "project_budgets_select"
    ON public.project_budgets FOR SELECT
    USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "project_budgets_service_all"
    ON public.project_budgets FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
