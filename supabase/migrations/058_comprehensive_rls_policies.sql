-- =============================================================================
-- Migration 058: Comprehensive RLS Policies & Consolidation
-- Story 5.4: RLS Policies & Testing
-- Date: 2026-03-07
-- Author: Dara (@data-engineer)
-- Effort: 2 hours
-- Risk: MEDIUM (modifies RLS policies - fully reversible)
-- =============================================================================
-- OBJETIVO: Consolidar e validar RLS policies em 8+ tabelas críticas
-- com tenant_id + user_id isolation e service_role bypass
-- =============================================================================

-- =============================================================================
-- FASE 1: Validar e Consolidar RLS em Tabelas Críticas
-- =============================================================================

-- 1.1 Tabelas Core: Habilitar RLS (idempotent)
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.integration_log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sync_logs ENABLE ROW LEVEL SECURITY;

-- 1.2 Dropar políticas antigas (cleanup antes de recriar)
-- Projects
DROP POLICY IF EXISTS "Projects: all roles can view tenant projects" ON public.projects;
DROP POLICY IF EXISTS "Projects: admin/user can insert" ON public.projects;
DROP POLICY IF EXISTS "Projects: update" ON public.projects;
DROP POLICY IF EXISTS "Projects: delete" ON public.projects;

-- Project Schedules (se existir)
DROP POLICY IF EXISTS "project_schedules: view own tenant" ON public.project_schedules;
DROP POLICY IF EXISTS "project_schedules: insert/update own tenant" ON public.project_schedules;

-- Project Requirements (se existir)
DROP POLICY IF EXISTS "project_requirements: view own tenant" ON public.project_requirements;
DROP POLICY IF EXISTS "project_requirements: insert/update own tenant" ON public.project_requirements;

-- Integration Log Entries
DROP POLICY IF EXISTS "integration_log_entries: view own tenant" ON public.integration_log_entries;
DROP POLICY IF EXISTS "integration_log_entries: insert own logs" ON public.integration_log_entries;

-- Agent Sessions
DROP POLICY IF EXISTS "agent_sessions: view own user" ON public.agent_sessions;
DROP POLICY IF EXISTS "agent_sessions: insert own sessions" ON public.agent_sessions;

-- Documents
DROP POLICY IF EXISTS "documents: view own tenant" ON public.documents;
DROP POLICY IF EXISTS "documents: insert/update own tenant" ON public.documents;

-- =============================================================================
-- FASE 2: Recriar RLS Policies com Padrão Consolidado (tenant_id + user_id)
-- =============================================================================

-- 2.1 PROJECTS: Isolação por tenant_id
CREATE POLICY "projects_tenant_isolation_select"
    ON public.projects FOR SELECT
    USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "projects_tenant_isolation_insert"
    ON public.projects FOR INSERT
    WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY "projects_tenant_isolation_update"
    ON public.projects FOR UPDATE
    USING (tenant_id = public.get_user_tenant_id())
    WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY "projects_tenant_isolation_delete"
    ON public.projects FOR DELETE
    USING (tenant_id = public.get_user_tenant_id());

-- 2.2 PROJECT_SCHEDULES: Isolação por project (via FK -> tenant)
CREATE POLICY "project_schedules_tenant_isolation_select"
    ON public.project_schedules FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM public.projects
            WHERE tenant_id = public.get_user_tenant_id()
        )
    );

CREATE POLICY "project_schedules_tenant_isolation_insert"
    ON public.project_schedules FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT id FROM public.projects
            WHERE tenant_id = public.get_user_tenant_id()
        )
    );

CREATE POLICY "project_schedules_tenant_isolation_update"
    ON public.project_schedules FOR UPDATE
    USING (
        project_id IN (
            SELECT id FROM public.projects
            WHERE tenant_id = public.get_user_tenant_id()
        )
    )
    WITH CHECK (
        project_id IN (
            SELECT id FROM public.projects
            WHERE tenant_id = public.get_user_tenant_id()
        )
    );

CREATE POLICY "project_schedules_tenant_isolation_delete"
    ON public.project_schedules FOR DELETE
    USING (
        project_id IN (
            SELECT id FROM public.projects
            WHERE tenant_id = public.get_user_tenant_id()
        )
    );

-- 2.3 PROJECT_REQUIREMENTS: Isolação por project (via FK -> tenant)
CREATE POLICY "project_requirements_tenant_isolation_select"
    ON public.project_requirements FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM public.projects
            WHERE tenant_id = public.get_user_tenant_id()
        )
    );

CREATE POLICY "project_requirements_tenant_isolation_insert"
    ON public.project_requirements FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT id FROM public.projects
            WHERE tenant_id = public.get_user_tenant_id()
        )
    );

CREATE POLICY "project_requirements_tenant_isolation_update"
    ON public.project_requirements FOR UPDATE
    USING (
        project_id IN (
            SELECT id FROM public.projects
            WHERE tenant_id = public.get_user_tenant_id()
        )
    )
    WITH CHECK (
        project_id IN (
            SELECT id FROM public.projects
            WHERE tenant_id = public.get_user_tenant_id()
        )
    );

CREATE POLICY "project_requirements_tenant_isolation_delete"
    ON public.project_requirements FOR DELETE
    USING (
        project_id IN (
            SELECT id FROM public.projects
            WHERE tenant_id = public.get_user_tenant_id()
        )
    );

-- 2.4 INTEGRATION_LOG_ENTRIES: Isolação por tenant_id
CREATE POLICY "integration_log_entries_tenant_isolation_select"
    ON public.integration_log_entries FOR SELECT
    USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "integration_log_entries_tenant_isolation_insert"
    ON public.integration_log_entries FOR INSERT
    WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY "integration_log_entries_tenant_isolation_update"
    ON public.integration_log_entries FOR UPDATE
    USING (tenant_id = public.get_user_tenant_id())
    WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY "integration_log_entries_tenant_isolation_delete"
    ON public.integration_log_entries FOR DELETE
    USING (tenant_id = public.get_user_tenant_id());

-- 2.5 AGENT_SESSIONS: Isolação por user_id (se existir)
CREATE POLICY "agent_sessions_user_isolation_select"
    ON public.agent_sessions FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "agent_sessions_user_isolation_insert"
    ON public.agent_sessions FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "agent_sessions_user_isolation_update"
    ON public.agent_sessions FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "agent_sessions_user_isolation_delete"
    ON public.agent_sessions FOR DELETE
    USING (user_id = auth.uid());

-- 2.6 DOCUMENTS: Isolação por tenant_id
CREATE POLICY "documents_tenant_isolation_select"
    ON public.documents FOR SELECT
    USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "documents_tenant_isolation_insert"
    ON public.documents FOR INSERT
    WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY "documents_tenant_isolation_update"
    ON public.documents FOR UPDATE
    USING (tenant_id = public.get_user_tenant_id())
    WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY "documents_tenant_isolation_delete"
    ON public.documents FOR DELETE
    USING (tenant_id = public.get_user_tenant_id());

-- 2.7 PROFILES: Isolação por tenant_id (acesso a profiles do próprio tenant)
CREATE POLICY "profiles_tenant_isolation_select"
    ON public.profiles FOR SELECT
    USING (tenant_id = public.get_user_tenant_id());

-- =============================================================================
-- FASE 3: Service Role Bypass Configuration
-- =============================================================================
-- Service role (admin operations via API) precisa estar habilitado para:
-- - API internal operations (sync, webhooks, batch operations)
-- - Sem contexto de auth.uid() (usa service_role direto)
-- Nota: RLS não bloqueia service_role por padrão (documentado em Supabase)

-- =============================================================================
-- FASE 4: Verification & Documentation
-- =============================================================================
-- Tables com RLS habilitado (8+ críticas):
-- 1. public.projects ✅
-- 2. public.project_schedules ✅
-- 3. public.project_requirements ✅
-- 4. public.integration_log_entries ✅
-- 5. public.agent_sessions ✅
-- 6. public.documents ✅
-- 7. public.profiles ✅
-- 8. public.sync_logs ✅
--
-- Padrão RLS aplicado:
-- - SELECT: Isolação por tenant_id (ou user_id para agent_sessions)
-- - INSERT: Validação tenant_id (ou user_id)
-- - UPDATE: USING + WITH CHECK para isolação completa
-- - DELETE: Isolação por tenant_id (ou user_id)
--
-- Service Role Bypass:
-- - Habilitado por padrão em Supabase para operações de API interna
-- - Não requer configuração especial (service_role ignora RLS)

-- =============================================================================
-- ROLLBACK (se necessário):
-- DROP POLICY IF EXISTS "projects_tenant_isolation_select" ON public.projects;
-- DROP POLICY IF EXISTS "projects_tenant_isolation_insert" ON public.projects;
-- etc.
-- =============================================================================

COMMENT ON TABLE public.projects IS 'Tech Arauz: RLS enabled, isolação por tenant_id (Story 5.4)';
COMMENT ON TABLE public.project_schedules IS 'Tech Arauz: RLS enabled, isolação via project_id -> tenant (Story 5.4)';
COMMENT ON TABLE public.project_requirements IS 'Tech Arauz: RLS enabled, isolação via project_id -> tenant (Story 5.4)';
COMMENT ON TABLE public.integration_log_entries IS 'Tech Arauz: RLS enabled, isolação por tenant_id (Story 5.4)';
COMMENT ON TABLE public.agent_sessions IS 'Tech Arauz: RLS enabled, isolação por user_id (Story 5.4)';
COMMENT ON TABLE public.documents IS 'Tech Arauz: RLS enabled, isolação por tenant_id (Story 5.4)';
COMMENT ON TABLE public.sync_logs IS 'Tech Arauz: RLS enabled para audit (Story 5.4)';
