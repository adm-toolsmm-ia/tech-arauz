-- Migration 039: Add schedule indexes and status comments
-- Story 2.15: Period indexes for server-side pagination + status documentation
-- PRD: Padronização UX/UI + Cronogramas Read-Only

-- Period intersection indexes (critical for Agenda/Kanban/Lista queries)
CREATE INDEX IF NOT EXISTS idx_schedules_data_inicio
  ON project_schedules (data_inicio);

CREATE INDEX IF NOT EXISTS idx_schedules_data_fim
  ON project_schedules (data_fim);

CREATE INDEX IF NOT EXISTS idx_schedules_status
  ON project_schedules (status);

-- Composite index for tenant-scoped period queries with pagination
CREATE INDEX IF NOT EXISTS idx_schedules_tenant_dates
  ON project_schedules (tenant_id, data_inicio, data_fim);

-- Document known status values (from Espaider API mapping)
COMMENT ON COLUMN project_schedules.status IS
  'Status da atividade do cronograma. Valores conhecidos do ERP: texto livre. '
  'Tratamento no app: "cancelado" e "concluído" são considerados inativos (isConsideredActive=false). '
  'Todos os demais valores são tratados como ativos. '
  'Para Kanban: usar getKanbanColumn(status, atrasado) em schedule-status.ts. '
  'NÃO adicionar CHECK constraint — valores vêm do ERP e podem variar.';

-- Verify RLS is still intact after index creation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'project_schedules'
  ) THEN
    RAISE EXCEPTION 'RLS policy for project_schedules not found after migration!';
  END IF;
END $$;
