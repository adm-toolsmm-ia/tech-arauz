-- Migration: Add project children tables (Histories, Budgets, Approvers)
-- Created at: 2026-02-12
-- Description: Adds tables to store related project data from Espaider API.

-- 1. Project Histories (Históricos)
CREATE TABLE IF NOT EXISTS public.project_histories (
    id bigint PRIMARY KEY, -- Espaider ID
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    type text, -- TIPOHISTORICO
    responsible_to text, -- RESPONSAVEL_PARA
    responsible_from text, -- RESPONSAVEL_DE
    step_to text, -- PASSO_PARA
    step_from text, -- PASSO_DE
    procedure_number integer, -- NUMEROTRAMITE
    message text, -- MENSAGEM
    date timestamp with time zone, -- DATA_DE
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. Project Budgets (Orçamentos)
CREATE TABLE IF NOT EXISTS public.project_budgets (
    id bigint PRIMARY KEY, -- Espaider ID (generated or from API if available)
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    value numeric(15, 2), -- VALOR
    provider text, -- FORNECEDOR
    quotation_date date, -- DATACOTACAO
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 3. Project Approvers (Aprovadores)
CREATE TABLE IF NOT EXISTS public.project_approvers (
    id bigint PRIMARY KEY, -- Espaider ID
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    type text, -- TIPO
    responsible text, -- RESPONSAVEL
    attention_points text, -- PONTOSATENCAO
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_histories_project_id ON public.project_histories(project_id);
CREATE INDEX IF NOT EXISTS idx_project_budgets_project_id ON public.project_budgets(project_id);
CREATE INDEX IF NOT EXISTS idx_project_approvers_project_id ON public.project_approvers(project_id);

-- Enable RLS
ALTER TABLE public.project_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_approvers ENABLE ROW LEVEL SECURITY;

-- Policies (consistent with other tables: viewable by authenticated users, manageable by service role)
-- Policies for project_histories
CREATE POLICY "Enable read access for authenticated users" ON public.project_histories
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable all access for service role" ON public.project_histories
    FOR ALL
    TO service_role
    USING (true);

-- Policies for project_budgets
CREATE POLICY "Enable read access for authenticated users" ON public.project_budgets
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable all access for service role" ON public.project_budgets
    FOR ALL
    TO service_role
    USING (true);

-- Policies for project_approvers
CREATE POLICY "Enable read access for authenticated users" ON public.project_approvers
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable all access for service role" ON public.project_approvers
    FOR ALL
    TO service_role
    USING (true);
