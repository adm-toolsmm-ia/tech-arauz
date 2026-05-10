-- =============================================================================
-- Migration 077: Harden organizational tenant isolation and relationship integrity
-- Date: 2026-05-08
-- Scope: Brownfield hardening for organizational tables only
-- =============================================================================
-- OBJETIVO:
-- 1. Add missing tenant_id columns to legacy org relation tables
-- 2. Enforce same-tenant relationships for org_* tables touched by EPIC 11
-- 3. Replace permissive relation policies with explicit tenant-isolation policies
-- 4. Extend RLS audit coverage to include the hardened org tables
-- =============================================================================

-- =============================================================================
-- PART 1: Validate existing data before tightening integrity
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.org_activity_systems oas
    JOIN public.org_activities a ON a.id = oas.activity_id
    JOIN public.org_systems s ON s.id = oas.system_id
    WHERE a.tenant_id <> s.tenant_id
       OR oas.tenant_id <> a.tenant_id
  ) THEN
    RAISE EXCEPTION 'Migration 077 blocked: cross-tenant rows found in org_activity_systems';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.org_process_slas ops
    JOIN public.org_processes p ON p.id = ops.process_id
    WHERE ops.tenant_id <> p.tenant_id
  ) THEN
    RAISE EXCEPTION 'Migration 077 blocked: tenant mismatch found in org_process_slas';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.org_process_metrics opm
    JOIN public.org_processes p ON p.id = opm.process_id
    WHERE opm.tenant_id <> p.tenant_id
  ) THEN
    RAISE EXCEPTION 'Migration 077 blocked: tenant mismatch found in org_process_metrics';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.org_role_permissions orp
    LEFT JOIN public.org_role_definitions ord
      ON ord.tenant_id = orp.tenant_id
     AND ord.role_id = orp.role_id
    WHERE ord.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Migration 077 blocked: orphan role permissions found in org_role_permissions';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.org_activity_templates oat
    JOIN public.org_nuclei n ON n.id = oat.nucleus_id
    WHERE oat.nucleus_id IS NOT NULL
      AND oat.tenant_id <> n.tenant_id
  ) THEN
    RAISE EXCEPTION 'Migration 077 blocked: tenant mismatch found in org_activity_templates';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.org_process_versions opv
    JOIN public.org_processes p ON p.id = opv.process_id
    WHERE opv.tenant_id <> p.tenant_id
  ) THEN
    RAISE EXCEPTION 'Migration 077 blocked: tenant mismatch found in org_process_versions';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.org_process_versions opv
    JOIN public.profiles pr ON pr.id = opv.changed_by
    JOIN public.org_processes p ON p.id = opv.process_id
    WHERE opv.changed_by IS NOT NULL
      AND pr.tenant_id <> p.tenant_id
  ) THEN
    RAISE EXCEPTION 'Migration 077 blocked: changed_by profile tenant mismatch found in org_process_versions';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.org_process_systems ops
    JOIN public.org_processes p ON p.id = ops.process_id
    JOIN public.org_systems s ON s.id = ops.system_id
    WHERE p.tenant_id <> s.tenant_id
  ) THEN
    RAISE EXCEPTION 'Migration 077 blocked: cross-tenant rows found in org_process_systems';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.org_activity_documents oad
    JOIN public.org_activities a ON a.id = oad.activity_id
    JOIN public.org_documents d ON d.id = oad.org_document_id
    WHERE a.tenant_id <> d.tenant_id
  ) THEN
    RAISE EXCEPTION 'Migration 077 blocked: cross-tenant rows found in org_activity_documents';
  END IF;
END;
$$;

-- =============================================================================
-- PART 2: Add missing tenant_id columns to legacy relation tables
-- =============================================================================

ALTER TABLE public.org_process_systems
  ADD COLUMN IF NOT EXISTS tenant_id UUID;

ALTER TABLE public.org_activity_documents
  ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Backfill from authoritative parent tenants
UPDATE public.org_process_systems ops
SET tenant_id = p.tenant_id
FROM public.org_processes p
WHERE ops.process_id = p.id
  AND ops.tenant_id IS NULL;

UPDATE public.org_activity_documents oad
SET tenant_id = a.tenant_id
FROM public.org_activities a
WHERE oad.activity_id = a.id
  AND oad.tenant_id IS NULL;

ALTER TABLE public.org_process_systems
  ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE public.org_activity_documents
  ALTER COLUMN tenant_id SET NOT NULL;

DO $$
BEGIN
  ALTER TABLE public.org_process_systems
    ADD CONSTRAINT org_process_systems_tenant_fk
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END;
$$;

DO $$
BEGIN
  ALTER TABLE public.org_activity_documents
    ADD CONSTRAINT org_activity_documents_tenant_fk
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_org_process_systems_tenant
  ON public.org_process_systems(tenant_id);

CREATE INDEX IF NOT EXISTS idx_org_activity_documents_tenant
  ON public.org_activity_documents(tenant_id);

-- =============================================================================
-- PART 3: Enforce tenant alignment in relation tables via trigger
-- =============================================================================

CREATE OR REPLACE FUNCTION public.enforce_org_tenant_integrity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_tenant_id UUID;
  v_other_tenant_id UUID;
BEGIN
  CASE TG_TABLE_NAME
    WHEN 'org_activity_systems' THEN
      SELECT tenant_id INTO v_tenant_id
      FROM public.org_activities
      WHERE id = NEW.activity_id;

      SELECT tenant_id INTO v_other_tenant_id
      FROM public.org_systems
      WHERE id = NEW.system_id;

      IF v_tenant_id IS NULL OR v_other_tenant_id IS NULL THEN
        RAISE EXCEPTION 'org_activity_systems requires valid activity_id and system_id';
      END IF;

      IF v_tenant_id <> v_other_tenant_id THEN
        RAISE EXCEPTION 'org_activity_systems rejected: activity_id % and system_id % belong to different tenants',
          NEW.activity_id, NEW.system_id;
      END IF;

      NEW.tenant_id := v_tenant_id;
      RETURN NEW;

    WHEN 'org_process_slas' THEN
      SELECT tenant_id INTO v_tenant_id
      FROM public.org_processes
      WHERE id = NEW.process_id;

      IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'org_process_slas requires a valid process_id';
      END IF;

      NEW.tenant_id := v_tenant_id;
      RETURN NEW;

    WHEN 'org_process_metrics' THEN
      SELECT tenant_id INTO v_tenant_id
      FROM public.org_processes
      WHERE id = NEW.process_id;

      IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'org_process_metrics requires a valid process_id';
      END IF;

      NEW.tenant_id := v_tenant_id;
      RETURN NEW;

    WHEN 'org_role_definitions' THEN
      IF NEW.tenant_id IS NULL THEN
        RAISE EXCEPTION 'org_role_definitions requires tenant_id';
      END IF;

      RETURN NEW;

    WHEN 'org_role_permissions' THEN
      IF NEW.tenant_id IS NULL THEN
        RAISE EXCEPTION 'org_role_permissions requires tenant_id';
      END IF;

      PERFORM 1
      FROM public.org_role_definitions
      WHERE tenant_id = NEW.tenant_id
        AND role_id = NEW.role_id;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'org_role_permissions rejected: role_id % does not exist for tenant %',
          NEW.role_id, NEW.tenant_id;
      END IF;

      RETURN NEW;

    WHEN 'org_activity_templates' THEN
      IF NEW.nucleus_id IS NOT NULL THEN
        SELECT tenant_id INTO v_tenant_id
        FROM public.org_nuclei
        WHERE id = NEW.nucleus_id;

        IF v_tenant_id IS NULL THEN
          RAISE EXCEPTION 'org_activity_templates requires a valid nucleus_id when provided';
        END IF;

        NEW.tenant_id := v_tenant_id;
        RETURN NEW;
      END IF;

      IF NEW.tenant_id IS NULL THEN
        RAISE EXCEPTION 'org_activity_templates requires tenant_id when nucleus_id is null';
      END IF;

      RETURN NEW;

    WHEN 'org_process_versions' THEN
      SELECT tenant_id INTO v_tenant_id
      FROM public.org_processes
      WHERE id = NEW.process_id;

      IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'org_process_versions requires a valid process_id';
      END IF;

      IF NEW.changed_by IS NOT NULL THEN
        SELECT tenant_id INTO v_other_tenant_id
        FROM public.profiles
        WHERE id = NEW.changed_by;

        IF v_other_tenant_id IS NULL OR v_other_tenant_id <> v_tenant_id THEN
          RAISE EXCEPTION 'org_process_versions rejected: changed_by profile tenant mismatch for process_id %',
            NEW.process_id;
        END IF;
      END IF;

      NEW.tenant_id := v_tenant_id;
      RETURN NEW;

    WHEN 'org_process_systems' THEN
      SELECT tenant_id INTO v_tenant_id
      FROM public.org_processes
      WHERE id = NEW.process_id;

      SELECT tenant_id INTO v_other_tenant_id
      FROM public.org_systems
      WHERE id = NEW.system_id;

      IF v_tenant_id IS NULL OR v_other_tenant_id IS NULL THEN
        RAISE EXCEPTION 'org_process_systems requires valid process_id and system_id';
      END IF;

      IF v_tenant_id <> v_other_tenant_id THEN
        RAISE EXCEPTION 'org_process_systems rejected: process_id % and system_id % belong to different tenants',
          NEW.process_id, NEW.system_id;
      END IF;

      NEW.tenant_id := v_tenant_id;
      RETURN NEW;

    WHEN 'org_activity_documents' THEN
      SELECT tenant_id INTO v_tenant_id
      FROM public.org_activities
      WHERE id = NEW.activity_id;

      SELECT tenant_id INTO v_other_tenant_id
      FROM public.org_documents
      WHERE id = NEW.org_document_id;

      IF v_tenant_id IS NULL OR v_other_tenant_id IS NULL THEN
        RAISE EXCEPTION 'org_activity_documents requires valid activity_id and org_document_id';
      END IF;

      IF v_tenant_id <> v_other_tenant_id THEN
        RAISE EXCEPTION 'org_activity_documents rejected: activity_id % and org_document_id % belong to different tenants',
          NEW.activity_id, NEW.org_document_id;
      END IF;

      NEW.tenant_id := v_tenant_id;
      RETURN NEW;

    ELSE
      RETURN NEW;
  END CASE;
END;
$$;

DROP TRIGGER IF EXISTS trg_org_activity_systems_tenant_integrity ON public.org_activity_systems;
CREATE TRIGGER trg_org_activity_systems_tenant_integrity
  BEFORE INSERT OR UPDATE ON public.org_activity_systems
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_tenant_integrity();

DROP TRIGGER IF EXISTS trg_org_process_slas_tenant_integrity ON public.org_process_slas;
CREATE TRIGGER trg_org_process_slas_tenant_integrity
  BEFORE INSERT OR UPDATE ON public.org_process_slas
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_tenant_integrity();

DROP TRIGGER IF EXISTS trg_org_process_metrics_tenant_integrity ON public.org_process_metrics;
CREATE TRIGGER trg_org_process_metrics_tenant_integrity
  BEFORE INSERT OR UPDATE ON public.org_process_metrics
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_tenant_integrity();

DROP TRIGGER IF EXISTS trg_org_role_definitions_tenant_integrity ON public.org_role_definitions;
CREATE TRIGGER trg_org_role_definitions_tenant_integrity
  BEFORE INSERT OR UPDATE ON public.org_role_definitions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_tenant_integrity();

DROP TRIGGER IF EXISTS trg_org_role_permissions_tenant_integrity ON public.org_role_permissions;
CREATE TRIGGER trg_org_role_permissions_tenant_integrity
  BEFORE INSERT OR UPDATE ON public.org_role_permissions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_tenant_integrity();

DROP TRIGGER IF EXISTS trg_org_activity_templates_tenant_integrity ON public.org_activity_templates;
CREATE TRIGGER trg_org_activity_templates_tenant_integrity
  BEFORE INSERT OR UPDATE ON public.org_activity_templates
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_tenant_integrity();

DROP TRIGGER IF EXISTS trg_org_process_versions_tenant_integrity ON public.org_process_versions;
CREATE TRIGGER trg_org_process_versions_tenant_integrity
  BEFORE INSERT OR UPDATE ON public.org_process_versions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_tenant_integrity();

DROP TRIGGER IF EXISTS trg_org_process_systems_tenant_integrity ON public.org_process_systems;
CREATE TRIGGER trg_org_process_systems_tenant_integrity
  BEFORE INSERT OR UPDATE ON public.org_process_systems
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_tenant_integrity();

DROP TRIGGER IF EXISTS trg_org_activity_documents_tenant_integrity ON public.org_activity_documents;
CREATE TRIGGER trg_org_activity_documents_tenant_integrity
  BEFORE INSERT OR UPDATE ON public.org_activity_documents
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_tenant_integrity();

-- =============================================================================
-- PART 4: Replace permissive / legacy relation policies with tenant-aware ones
-- =============================================================================

ALTER TABLE public.org_activity_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_process_slas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_process_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_role_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_activity_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_process_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_process_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_activity_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS org_activity_systems_tenant_isolation_select ON public.org_activity_systems;
DROP POLICY IF EXISTS org_activity_systems_tenant_isolation_insert ON public.org_activity_systems;
DROP POLICY IF EXISTS org_activity_systems_tenant_isolation_update ON public.org_activity_systems;
DROP POLICY IF EXISTS org_activity_systems_tenant_isolation_delete ON public.org_activity_systems;

CREATE POLICY org_activity_systems_tenant_isolation_select
  ON public.org_activity_systems
  FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY org_activity_systems_tenant_isolation_insert
  ON public.org_activity_systems
  FOR INSERT
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY org_activity_systems_tenant_isolation_update
  ON public.org_activity_systems
  FOR UPDATE
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY org_activity_systems_tenant_isolation_delete
  ON public.org_activity_systems
  FOR DELETE
  USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS org_process_slas_tenant_isolation_select ON public.org_process_slas;
DROP POLICY IF EXISTS org_process_slas_tenant_isolation_insert ON public.org_process_slas;
DROP POLICY IF EXISTS org_process_slas_tenant_isolation_update ON public.org_process_slas;
DROP POLICY IF EXISTS org_process_slas_tenant_isolation_delete ON public.org_process_slas;

CREATE POLICY org_process_slas_tenant_isolation_select
  ON public.org_process_slas
  FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY org_process_slas_tenant_isolation_insert
  ON public.org_process_slas
  FOR INSERT
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY org_process_slas_tenant_isolation_update
  ON public.org_process_slas
  FOR UPDATE
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY org_process_slas_tenant_isolation_delete
  ON public.org_process_slas
  FOR DELETE
  USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS org_process_metrics_tenant_isolation_select ON public.org_process_metrics;
DROP POLICY IF EXISTS org_process_metrics_tenant_isolation_insert ON public.org_process_metrics;
DROP POLICY IF EXISTS org_process_metrics_tenant_isolation_update ON public.org_process_metrics;
DROP POLICY IF EXISTS org_process_metrics_tenant_isolation_delete ON public.org_process_metrics;

CREATE POLICY org_process_metrics_tenant_isolation_select
  ON public.org_process_metrics
  FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY org_process_metrics_tenant_isolation_insert
  ON public.org_process_metrics
  FOR INSERT
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY org_process_metrics_tenant_isolation_update
  ON public.org_process_metrics
  FOR UPDATE
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY org_process_metrics_tenant_isolation_delete
  ON public.org_process_metrics
  FOR DELETE
  USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS org_role_definitions_tenant_isolation_select ON public.org_role_definitions;
DROP POLICY IF EXISTS org_role_definitions_tenant_isolation_insert ON public.org_role_definitions;
DROP POLICY IF EXISTS org_role_definitions_tenant_isolation_update ON public.org_role_definitions;
DROP POLICY IF EXISTS org_role_definitions_tenant_isolation_delete ON public.org_role_definitions;

CREATE POLICY org_role_definitions_tenant_isolation_select
  ON public.org_role_definitions
  FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY org_role_definitions_tenant_isolation_insert
  ON public.org_role_definitions
  FOR INSERT
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY org_role_definitions_tenant_isolation_update
  ON public.org_role_definitions
  FOR UPDATE
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY org_role_definitions_tenant_isolation_delete
  ON public.org_role_definitions
  FOR DELETE
  USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS org_role_permissions_tenant_isolation_select ON public.org_role_permissions;
DROP POLICY IF EXISTS org_role_permissions_tenant_isolation_insert ON public.org_role_permissions;
DROP POLICY IF EXISTS org_role_permissions_tenant_isolation_update ON public.org_role_permissions;
DROP POLICY IF EXISTS org_role_permissions_tenant_isolation_delete ON public.org_role_permissions;

CREATE POLICY org_role_permissions_tenant_isolation_select
  ON public.org_role_permissions
  FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY org_role_permissions_tenant_isolation_insert
  ON public.org_role_permissions
  FOR INSERT
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY org_role_permissions_tenant_isolation_update
  ON public.org_role_permissions
  FOR UPDATE
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY org_role_permissions_tenant_isolation_delete
  ON public.org_role_permissions
  FOR DELETE
  USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS org_activity_templates_tenant_isolation_select ON public.org_activity_templates;
DROP POLICY IF EXISTS org_activity_templates_tenant_isolation_insert ON public.org_activity_templates;
DROP POLICY IF EXISTS org_activity_templates_tenant_isolation_update ON public.org_activity_templates;
DROP POLICY IF EXISTS org_activity_templates_tenant_isolation_delete ON public.org_activity_templates;

CREATE POLICY org_activity_templates_tenant_isolation_select
  ON public.org_activity_templates
  FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY org_activity_templates_tenant_isolation_insert
  ON public.org_activity_templates
  FOR INSERT
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY org_activity_templates_tenant_isolation_update
  ON public.org_activity_templates
  FOR UPDATE
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY org_activity_templates_tenant_isolation_delete
  ON public.org_activity_templates
  FOR DELETE
  USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS org_process_versions_tenant_isolation_select ON public.org_process_versions;
DROP POLICY IF EXISTS org_process_versions_tenant_isolation_insert ON public.org_process_versions;
DROP POLICY IF EXISTS org_process_versions_tenant_isolation_update ON public.org_process_versions;
DROP POLICY IF EXISTS org_process_versions_tenant_isolation_delete ON public.org_process_versions;

CREATE POLICY org_process_versions_tenant_isolation_select
  ON public.org_process_versions
  FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY org_process_versions_tenant_isolation_insert
  ON public.org_process_versions
  FOR INSERT
  WITH CHECK (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS org_process_systems_tenant_isolation_select ON public.org_process_systems;
DROP POLICY IF EXISTS org_process_systems_tenant_isolation_insert ON public.org_process_systems;
DROP POLICY IF EXISTS org_process_systems_tenant_isolation_update ON public.org_process_systems;
DROP POLICY IF EXISTS org_process_systems_tenant_isolation_delete ON public.org_process_systems;

CREATE POLICY org_process_systems_tenant_isolation_select
  ON public.org_process_systems
  FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY org_process_systems_tenant_isolation_insert
  ON public.org_process_systems
  FOR INSERT
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY org_process_systems_tenant_isolation_update
  ON public.org_process_systems
  FOR UPDATE
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY org_process_systems_tenant_isolation_delete
  ON public.org_process_systems
  FOR DELETE
  USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS org_activity_documents_tenant_isolation_select ON public.org_activity_documents;
DROP POLICY IF EXISTS org_activity_documents_tenant_isolation_insert ON public.org_activity_documents;
DROP POLICY IF EXISTS org_activity_documents_tenant_isolation_update ON public.org_activity_documents;
DROP POLICY IF EXISTS org_activity_documents_tenant_isolation_delete ON public.org_activity_documents;

CREATE POLICY org_activity_documents_tenant_isolation_select
  ON public.org_activity_documents
  FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY org_activity_documents_tenant_isolation_insert
  ON public.org_activity_documents
  FOR INSERT
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY org_activity_documents_tenant_isolation_update
  ON public.org_activity_documents
  FOR UPDATE
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY org_activity_documents_tenant_isolation_delete
  ON public.org_activity_documents
  FOR DELETE
  USING (tenant_id = public.get_user_tenant_id());

-- =============================================================================
-- PART 5: Extend RLS audit coverage
-- =============================================================================

CREATE OR REPLACE FUNCTION public.audit_all_rls_policies()
RETURNS TABLE (
    table_name TEXT,
    rls_enabled BOOLEAN,
    total_policies INT,
    service_role_policies INT,
    authenticated_policies INT,
    tenant_isolation_found BOOLEAN,
    has_tenant_id_column BOOLEAN,
    policy_details JSONB
) AS $$
DECLARE
    v_table RECORD;
BEGIN
    FOR v_table IN (
        SELECT unnest(ARRAY[
            'tenants',
            'profiles',
            'projects',
            'project_schedules',
            'project_deliveries',
            'project_requirements',
            'espaider_apis',
            'sync_logs',
            'integration_log_entries',
            'project_histories',
            'project_approvers',
            'project_budgets',
            'org_activity_systems',
            'org_process_slas',
            'org_process_metrics',
            'org_role_definitions',
            'org_role_permissions',
            'org_activity_templates',
            'org_process_versions',
            'org_process_systems',
            'org_activity_documents'
        ]) AS name
    ) LOOP
        RETURN QUERY SELECT * FROM public.audit_rls_policy(v_table.name);
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE VIEW public.rls_audit_summary AS
WITH source_data AS (
    SELECT
        table_name,
        CASE WHEN rls_enabled THEN '✅' ELSE '❌' END as rls_status,
        total_policies,
        service_role_policies,
        CASE
            WHEN table_name IN ('tenants', 'profiles') AND rls_enabled AND total_policies > 0 THEN '✅ PASS'
            WHEN table_name IN ('tenants', 'profiles') AND NOT rls_enabled THEN '🔴 CRITICAL (RLS disabled)'
            WHEN table_name IN ('tenants', 'profiles') AND total_policies = 0 THEN '🔴 CRITICAL (no policies)'
            WHEN rls_enabled AND total_policies > 0 AND tenant_isolation_found THEN '✅ PASS'
            WHEN rls_enabled AND total_policies > 0 AND NOT tenant_isolation_found AND has_tenant_id_column THEN '⚠️  WARN (no isolation)'
            WHEN rls_enabled AND total_policies > 0 AND NOT tenant_isolation_found AND NOT has_tenant_id_column THEN '🔴 CRITICAL (missing tenant_id)'
            WHEN NOT rls_enabled THEN '🔴 CRITICAL (RLS disabled)'
            WHEN total_policies = 0 THEN '🔴 CRITICAL (no policies)'
            ELSE '❓ UNKNOWN'
        END as audit_status,
        CASE WHEN has_tenant_id_column THEN '✅' ELSE '❌' END as has_tenant_id,
        CASE WHEN tenant_isolation_found THEN '✅' ELSE '❌' END as tenant_isolation
    FROM public.audit_all_rls_policies()
)
SELECT * FROM source_data
ORDER BY
    CASE audit_status
        WHEN '🔴 CRITICAL (RLS disabled)' THEN 1
        WHEN '🔴 CRITICAL (no policies)' THEN 2
        WHEN '🔴 CRITICAL (missing tenant_id)' THEN 3
        WHEN '⚠️  WARN (no isolation)' THEN 4
        WHEN '✅ PASS' THEN 5
        ELSE 6
    END;

DO $$
BEGIN
  RAISE NOTICE 'Migration 077: org tenant integrity hardening applied ✅';
END;
$$;
