-- =============================================================================
-- Migration 059: pgaudit Extension & Audit Logging Configuration
-- Story 5.4: Audit Trail & Compliance (AC-004)
-- Date: 2026-03-07
-- Author: Dara (@data-engineer)
-- Effort: 0.75 hours
-- Risk: LOW (logging only, non-destructive)
-- =============================================================================
-- OBJETIVO: Habilitar pgaudit extension e configurar audit logging para
-- RLS-protected tables, permitindo rastreamento de violações de policy e ops
-- =============================================================================

-- =============================================================================
-- FASE 1: Instalar pgaudit Extension
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS pgaudit;

-- =============================================================================
-- FASE 2: Configurar pgaudit para RLS Tables
-- =============================================================================
-- Configurar pgaudit_log_statement para capturar operações relevantes
-- Nota: Supabase pode ter restrições em algunas configurações
SET pgaudit.log = 'READ, WRITE, FUNCTION, ROLE';
SET pgaudit.log_relation = ON;
SET pgaudit.log_statement = ON;

-- =============================================================================
-- FASE 3: Criar Audit Triggers para RLS-Protected Tables
-- =============================================================================

-- Tabela de audit log (se não existir)
CREATE TABLE IF NOT EXISTS public.rls_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,  -- INSERT, UPDATE, DELETE, SELECT_DENIED
    user_id UUID,
    row_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_before JSONB,
    data_after JSONB,
    violation_detected BOOLEAN DEFAULT FALSE,
    policy_violated TEXT,
    status TEXT DEFAULT 'logged'
);

-- Index for audit log queries
CREATE INDEX IF NOT EXISTS idx_rls_audit_log_tenant ON public.rls_audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rls_audit_log_timestamp ON public.rls_audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_rls_audit_log_user ON public.rls_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_rls_audit_log_violation ON public.rls_audit_log(violation_detected)
    WHERE violation_detected = TRUE;

-- Habilitar RLS na própria audit table (para evitar exposição de dados)
ALTER TABLE public.rls_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own audit logs
CREATE POLICY "rls_audit_log_tenant_isolation"
    ON public.rls_audit_log FOR SELECT
    USING (tenant_id = public.get_user_tenant_id());

-- Policy: Service role (admin) can insert/view all audit logs
CREATE POLICY "rls_audit_log_service_role"
    ON public.rls_audit_log FOR ALL
    USING (TRUE)
    WITH CHECK (TRUE);

-- =============================================================================
-- FASE 4: Audit Trigger Function (generic for all RLS tables)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.audit_rls_operation()
RETURNS TRIGGER AS $$
DECLARE
    v_tenant_id UUID;
    v_violation BOOLEAN := FALSE;
    v_policy_text TEXT := NULL;
BEGIN
    -- Determine tenant_id based on table
    v_tenant_id := CASE
        WHEN TG_TABLE_NAME = 'projects' THEN NEW.tenant_id
        WHEN TG_TABLE_NAME = 'integration_log_entries' THEN NEW.tenant_id
        WHEN TG_TABLE_NAME = 'documents' THEN NEW.tenant_id
        WHEN TG_TABLE_NAME = 'agent_sessions' THEN (
            SELECT tenant_id FROM public.profiles WHERE id = NEW.user_id LIMIT 1
        )
        WHEN TG_TABLE_NAME IN ('project_schedules', 'project_requirements') THEN (
            SELECT tenant_id FROM public.projects WHERE id = NEW.project_id LIMIT 1
        )
        ELSE NULL
    END;

    -- Check for RLS violation (user not in same tenant)
    IF v_tenant_id IS NOT NULL AND v_tenant_id != public.get_user_tenant_id() THEN
        v_violation := TRUE;
        v_policy_text := 'TENANT_ISOLATION_VIOLATION';
    END IF;

    -- Log operation
    INSERT INTO public.rls_audit_log (
        tenant_id,
        table_name,
        operation,
        user_id,
        row_id,
        data_before,
        data_after,
        violation_detected,
        policy_violated
    ) VALUES (
        COALESCE(v_tenant_id, public.get_user_tenant_id()),
        TG_TABLE_NAME,
        TG_OP,
        auth.uid(),
        COALESCE(NEW.id, OLD.id),
        to_jsonb(OLD),
        to_jsonb(NEW),
        v_violation,
        v_policy_text
    );

    -- If violation, raise error
    IF v_violation THEN
        RAISE EXCEPTION 'RLS Policy Violation: Tenant isolation breach on %.%', TG_TABLE_NAME, TG_OP;
    END IF;

    RETURN CASE
        WHEN TG_OP = 'DELETE' THEN OLD
        ELSE NEW
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- FASE 5: Attach Triggers to RLS-Protected Tables
-- =============================================================================

DROP TRIGGER IF EXISTS audit_projects_ops ON public.projects;
CREATE TRIGGER audit_projects_ops
    AFTER INSERT OR UPDATE OR DELETE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.audit_rls_operation();

DROP TRIGGER IF EXISTS audit_project_schedules_ops ON public.project_schedules;
CREATE TRIGGER audit_project_schedules_ops
    AFTER INSERT OR UPDATE OR DELETE ON public.project_schedules
    FOR EACH ROW EXECUTE FUNCTION public.audit_rls_operation();

DROP TRIGGER IF EXISTS audit_project_requirements_ops ON public.project_requirements;
CREATE TRIGGER audit_project_requirements_ops
    AFTER INSERT OR UPDATE OR DELETE ON public.project_requirements
    FOR EACH ROW EXECUTE FUNCTION public.audit_rls_operation();

DROP TRIGGER IF EXISTS audit_integration_log_entries_ops ON public.integration_log_entries;
CREATE TRIGGER audit_integration_log_entries_ops
    AFTER INSERT OR UPDATE OR DELETE ON public.integration_log_entries
    FOR EACH ROW EXECUTE FUNCTION public.audit_rls_operation();

DROP TRIGGER IF EXISTS audit_agent_sessions_ops ON public.agent_sessions;
CREATE TRIGGER audit_agent_sessions_ops
    AFTER INSERT OR UPDATE OR DELETE ON public.agent_sessions
    FOR EACH ROW EXECUTE FUNCTION public.audit_rls_operation();

DROP TRIGGER IF EXISTS audit_documents_ops ON public.documents;
CREATE TRIGGER audit_documents_ops
    AFTER INSERT OR UPDATE OR DELETE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION public.audit_rls_operation();

-- =============================================================================
-- FASE 6: Audit Log Cleanup Function (retention policy)
-- =============================================================================
-- Keep audit logs for 90 days, delete older entries
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM public.rls_audit_log
    WHERE timestamp < NOW() - INTERVAL '90 days';

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (can be called periodically via cron extension if available)
-- SELECT cron.schedule('cleanup-rls-audit-logs', '0 2 * * *', 'SELECT public.cleanup_old_audit_logs()');

-- =============================================================================
-- FASE 7: Verification View
-- =============================================================================
CREATE OR REPLACE VIEW public.rls_audit_summary AS
SELECT
    table_name,
    COUNT(*) as total_operations,
    SUM(CASE WHEN operation = 'INSERT' THEN 1 ELSE 0 END) as insert_count,
    SUM(CASE WHEN operation = 'UPDATE' THEN 1 ELSE 0 END) as update_count,
    SUM(CASE WHEN operation = 'DELETE' THEN 1 ELSE 0 END) as delete_count,
    SUM(CASE WHEN violation_detected THEN 1 ELSE 0 END) as violation_count,
    MAX(timestamp) as last_operation
FROM public.rls_audit_log
GROUP BY table_name
ORDER BY table_name;

-- =============================================================================
-- ROLLBACK (se necessário):
-- DROP TRIGGER IF EXISTS audit_projects_ops ON public.projects;
-- DROP TRIGGER IF EXISTS audit_project_schedules_ops ON public.project_schedules;
-- ... (drop all other triggers)
-- DROP FUNCTION IF EXISTS public.audit_rls_operation();
-- DROP TABLE IF EXISTS public.rls_audit_log;
-- DROP EXTENSION IF EXISTS pgaudit;
-- =============================================================================

COMMENT ON TABLE public.rls_audit_log IS 'Tech Arauz: Audit log for RLS policy enforcement and violations (Story 5.4)';
COMMENT ON FUNCTION public.audit_rls_operation() IS 'Trigger function to log all RLS-protected table operations and detect policy violations';
COMMENT ON FUNCTION public.cleanup_old_audit_logs() IS 'Cleanup function to maintain 90-day retention policy for audit logs';
