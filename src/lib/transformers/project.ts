/**
 * Transformers: DB row -> UI interface
 *
 * Resolve the field name mismatch between the Supabase schema
 * (codigo, titulo, prazo_final, etc.) and the UI components
 * (espaider_code, project_name, end_date, etc.) without changing
 * either the database or the frontend components.
 *
 * @see 001_initial_schema.sql for DB column names
 * @see projects-content.tsx for UI interface
 */

// =============================================================================
// DB row types (match Supabase schema exactly)
// =============================================================================

export interface DBProject {
  id: string;
  tenant_id: string;
  espaider_id: number;
  codigo: string;
  titulo: string;
  status: string;
  responsavel: string | null;
  prioridade: string | null;
  categoria: string | null;
  prazo_final: string | null;
  espaider_raw: Record<string, unknown> | null;
  sync_status: string | null;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations (optional)
  schedules?: DBSchedule[];
  deliveries?: DBDelivery[];
}

export interface DBSchedule {
  id: string;
  tenant_id: string;
  project_id: string;
  espaider_id: number;
  atividade: string;
  responsavel: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  status: string | null;
  espaider_raw: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface DBDelivery {
  id: string;
  tenant_id: string;
  project_id: string;
  espaider_id: number;
  titulo: string;
  status: string | null;
  data_prevista: string | null;
  data_realizada: string | null;
  espaider_raw: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// UI types (match what components expect)
// =============================================================================

export interface UIProject {
  id: string;
  espaider_code: string;
  project_name: string;
  status: string;
  total_value: number | null;
  responsible: string | null;
  start_date: string | null;
  end_date: string | null;
  priority: string | null;
  category?: string | null;
  schedules?: UISchedule[];
  deliveries?: UIDelivery[];
}

export interface UISchedule {
  id: string;
  schedule_code: string;
  description: string;
  scheduled_date: string;
  status: string;
}

export interface UIDelivery {
  id: string;
  description: string;
  deadline: string;
  completed: boolean;
}

// Dashboard uses a simpler project type
export interface UIDashboardProject {
  id: string;
  espaider_code: string;
  project_name: string;
  status: string;
  total_value: number | null;
}

// =============================================================================
// Transformers
// =============================================================================

/**
 * Convert a DB schedule row to the UI schedule format.
 */
export function dbScheduleToUI(row: DBSchedule): UISchedule {
  return {
    id: row.id,
    schedule_code: row.atividade,
    description: row.responsavel ? `${row.atividade} — ${row.responsavel}` : row.atividade,
    scheduled_date: row.data_fim || row.data_inicio || '',
    status: row.status || 'pendente',
  };
}

/**
 * Convert a DB delivery row to the UI delivery format.
 */
export function dbDeliveryToUI(row: DBDelivery): UIDelivery {
  const completedStatuses = ['concluida', 'concluído', 'concluido', 'entregue', 'finalizada', 'done'];
  return {
    id: row.id,
    description: row.titulo,
    deadline: row.data_prevista || '',
    completed: completedStatuses.includes((row.status || '').toLowerCase()),
  };
}

/**
 * Convert a full DB project row (with joins) to the UI project format.
 */
export function dbProjectToUI(row: DBProject): UIProject {
  return {
    id: row.id,
    espaider_code: row.codigo,
    project_name: row.titulo,
    status: row.status,
    total_value: null,                       // DB doesn't track value
    responsible: row.responsavel,
    start_date: row.created_at || null,      // Approximate with created_at
    end_date: row.prazo_final,
    priority: row.prioridade,
    category: row.categoria,
    schedules: row.schedules?.map(dbScheduleToUI),
    deliveries: row.deliveries?.map(dbDeliveryToUI),
  };
}

/**
 * Convert a DB project row to the simplified dashboard format.
 */
export function dbProjectToDashboard(row: DBProject): UIDashboardProject {
  return {
    id: row.id,
    espaider_code: row.codigo,
    project_name: row.titulo,
    status: row.status,
    total_value: null,
  };
}
