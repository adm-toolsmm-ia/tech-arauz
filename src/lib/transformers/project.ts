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
  situacao_original: string; // Renamed from status (Migration 015)
  status_original?: string | null;
  responsavel: string | null;
  prioridade: string | null;
  categoria: string | null;
  prazo_final: string | null;
  espaider_raw: Record<string, unknown> | null;
  sync_status: string | null;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
  // === Novos campos (Migration 009) ===
  fase_atual?: string | null;
  prazo_fase?: string | null;
  cronograma_atual?: string | null;
  prazo_cronograma?: string | null;
  area?: string | null;
  pasta_consultivo?: string | null;
  solucao_aplicada?: string | null;
  data_movimentacao?: string | null;
  data_encerramento?: string | null;
  data_inicio_aprovacao?: string | null;
  // === Visão 360 (Migration 014) ===
  trm_espaider?: string | null;
  tipo_chamado?: string | null;
  tipo_assunto?: string | null;
  solicitante?: string | null;
  objetivo?: string | null;
  motivo_importancia_especial?: string | null;
  mensagem_movimentacao?: string | null;
  justificativa?: string | null;
  importancia_especial?: boolean | null;
  impacto_operacional?: string | null;
  impacto_estrategico?: string | null;
  escopo?: string | null;
  complexidade_tecnica?: string | null;
  // === Anotações (Migration 022) ===
  notes_html?: string | null;
  // Joined relations (optional)
  schedules?: DBSchedule[];
  deliveries?: DBDelivery[];
  histories?: DBHistory[];
  approvers?: DBApprover[];
  budgets?: DBBudget[];
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
  // === Novos campos (Migration 010) ===
  fase_atividade?: string | null;
  atrasado?: boolean | null;
  setor_responsavel?: string | null;
  item?: string | null;
  detalhamento?: string | null;
  data_prazo?: string | null;
  data_novo_prazo?: string | null;
  data_alerta_prazo?: string | null;
  prazo_confirmado?: boolean | null;
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
  // === Novos campos (Migration 011) ===
  ordem?: string | null;
  detalhamento?: string | null;
  prioridade?: string | null;
}

export interface DBHistory {
  id: string;
  tenant_id: string;
  project_id: string;
  espaider_id: number;
  type: string | null;
  responsible_to: string | null;
  responsible_from: string | null;
  step_to: string | null;
  step_from: string | null;
  procedure_number: number | null;
  message: string | null;
  date: string | null;
  espaider_raw: Record<string, unknown> | null;
  created_at: string;
}

export interface DBApprover {
  id: string;
  tenant_id: string;
  project_id: string;
  espaider_id: number;
  type: string | null;
  responsible: string | null;
  attention_points: string | null;
  espaider_raw: Record<string, unknown> | null;
  created_at: string;
}

export interface DBBudget {
  id: string;
  tenant_id: string;
  project_id: string;
  espaider_id: number;
  value: number | null;
  provider: string | null;
  quotation_date: string | null;
  moeda: string | null;
  espaider_raw: Record<string, unknown> | null;
  created_at: string;
}

// =============================================================================
// UI types (match what components expect)
// =============================================================================

export interface UIProject {
  id: string;
  espaider_code: string;
  project_name: string;
  status: string; // Now maps to situacao_original (RAW)
  original_status?: string | null; // Now maps to status_original (METRIC)
  // === Novos campos (Migration 009) - Agora diretos do BD ===
  /** Fase atual do projeto - usado para agrupar Kanban */
  fase_atual?: string | null;
  prazo_fase?: string | null;
  area?: string | null;
  current_situation?: string | null;
  last_update?: string | null;
  cronograma_atual?: string | null;
  prazo_cronograma?: string | null;
  pasta_consultivo?: string | null;
  solucao_aplicada?: string | null;
  data_encerramento?: string | null;
  data_inicio_aprovacao?: string | null;
  // === Visão 360 (Migration 014) ===
  trm_espaider?: string | null;
  tipo_chamado?: string | null;
  tipo_assunto?: string | null;
  solicitante?: string | null;
  objetivo?: string | null;
  motivo_importancia_especial?: string | null;
  mensagem_movimentacao?: string | null;
  justificativa?: string | null;
  importancia_especial?: boolean | null;
  impacto_operacional?: string | null;
  impacto_estrategico?: string | null;
  escopo?: string | null;
  complexidade_tecnica?: string | null;
  // === Anotações (Migration 022) ===
  notes_html?: string | null;
  // Legacy fields (mantidos para compatibilidade)
  aprovador_atual?: string | null;
  prazo_aprovador?: string | null;
  total_value: number | null;
  responsible: string | null;
  start_date: string | null;
  end_date: string | null;
  priority: string | null;
  category?: string | null;
  schedules?: UISchedule[];
  deliveries?: UIDelivery[];
  histories?: UIHistory[];
  approvers?: UIApprover[];
  budgets?: UIBudget[];
}

export interface UIHistory {
  id: string;
  type: string;
  from: string;
  to: string;
  step_from: string;
  step_to: string;
  message: string;
  date: string;
}

export interface UIApprover {
  id: string;
  type: string;
  responsible: string;
}

export interface UIBudget {
  id: string;
  value: number;
  supplier: string;
  date: string;
  currency: string;
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
  const completedStatuses = [
    'concluida',
    'concluído',
    'concluido',
    'entregue',
    'finalizada',
    'done',
  ];
  return {
    id: row.id,
    description: row.titulo,
    deadline: row.data_prevista || '',
    completed: completedStatuses.includes((row.status || '').toLowerCase()),
  };
}

/**
 * Convert a full DB project row (with joins) to the UI project format.
 * Atualizado em 2026-02-11: Usa colunas diretas do BD ao invés de espaider_raw
 * Atualizado em 2026-02-13: Renomeação situacao_original (Migration 015)
 */
export function dbProjectToUI(row: DBProject): UIProject {
  // Fallback to espaider_raw for legacy data (before migration 009)
  const raw = row.espaider_raw as Record<string, any> | null;

  return {
    id: row.id,
    espaider_code: row.codigo,
    project_name: row.titulo,
    status: row.status_original || row.situacao_original, // Prioritize status_original (verified to work in Dashboard)
    original_status: row.status_original, // Mapeia METRIC value
    // === Novos campos diretos do BD (Migration 009) ===
    fase_atual: row.fase_atual || raw?.APROVADORATUAL || null,
    prazo_fase: row.prazo_fase || raw?.PRAZOAPROVADOR || null,
    area: row.area || raw?.ASSUNTOAREA || null,
    current_situation: row.situacao_original || raw?.SITUACAOATUAL || null,
    last_update: row.data_movimentacao || raw?.DATAMOVIMENTACAO || null,
    cronograma_atual: row.cronograma_atual || raw?.CRONOGRAMAATUAL || null,
    prazo_cronograma: row.prazo_cronograma || raw?.PRAZOCRONOGRAMAATUAL || null,
    pasta_consultivo: row.pasta_consultivo || raw?.PASTACONSULTIVO || null,
    solucao_aplicada: row.solucao_aplicada || raw?.SOLUCAOAPLICADAEM || null,
    data_encerramento: row.data_encerramento || raw?.ENCERRADOEM || null,
    data_inicio_aprovacao: row.data_inicio_aprovacao || raw?.DATAINICIOAPROVACAO || null,

    // === Visão 360 (Migration 014) ===
    trm_espaider: row.trm_espaider || raw?.TRMESPAIDER || null,
    tipo_chamado: row.tipo_chamado || raw?.TIPOCHAMADO || null,
    tipo_assunto: row.tipo_assunto || raw?.TIPOASSUNTO || null,
    solicitante: row.solicitante || raw?.SOLICITANTE || null,
    objetivo: row.objetivo || raw?.OBJETIVO || null,
    motivo_importancia_especial:
      row.motivo_importancia_especial || raw?.MOTIVO_IMPORTANCIAESPECIAL || null,
    mensagem_movimentacao: row.mensagem_movimentacao || raw?.MENSAGEM_MOVIMENTACAO || null,
    justificativa: row.justificativa || raw?.JUSTIFICATIVA || null,
    importancia_especial: row.importancia_especial || raw?.IMPORTANCIAESPECIAL === 'Sim' || false,
    impacto_operacional: row.impacto_operacional || raw?.IMPACTOOPERACIONAL || null,
    impacto_estrategico: row.impacto_estrategico || raw?.IMPACTOESTRATEGICO || null,
    escopo: row.escopo || raw?.ESCOPO || null,
    complexidade_tecnica: row.complexidade_tecnica || raw?.COMPLEXIDADETECNICA || null,
    notes_html: row.notes_html ?? null,

    // Legacy: mantidos para compatibilidade com componentes existentes
    aprovador_atual: row.fase_atual || raw?.APROVADORATUAL || null,
    prazo_aprovador: row.prazo_fase || raw?.PRAZOAPROVADOR || null,
    total_value: null,
    responsible: row.responsavel,
    start_date: row.created_at || null,
    end_date: row.prazo_final,
    priority: row.prioridade,
    category: row.categoria,
    schedules: row.schedules?.map(dbScheduleToUI),
    deliveries: row.deliveries?.map(dbDeliveryToUI),
    histories: row.histories?.map(dbHistoryToUI),
    approvers: row.approvers?.map(dbApproverToUI),
    budgets: row.budgets?.map(dbBudgetToUI),
  };
}

export function dbHistoryToUI(row: DBHistory): UIHistory {
  return {
    id: row.id,
    type: row.type || '-',
    from: row.responsible_from || '-',
    to: row.responsible_to || '-',
    step_from: row.step_from || '-',
    step_to: row.step_to || '-',
    message: row.message || '-',
    date: row.date || '',
  };
}

export function dbApproverToUI(row: DBApprover): UIApprover {
  return {
    id: row.id,
    type: row.type || '-',
    responsible: row.responsible || '-',
  };
}

export function dbBudgetToUI(row: DBBudget): UIBudget {
  return {
    id: row.id,
    value: row.value || 0,
    supplier: row.provider || '-',
    date: row.quotation_date || '',
    currency: row.moeda || 'BRL',
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
    status: row.situacao_original,
    total_value: null,
  };
}
