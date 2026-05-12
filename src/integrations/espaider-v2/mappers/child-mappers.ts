/**
 * Child dataset mappers for Espaider API v2.
 *
 * Maps validated v2 child records to the correct DB row shapes.
 * All child records require:
 * - tenant_id: from the sync context
 * - project_id: UUID resolved from IDREGISTROPAI via projectIdMap
 *
 * Engineering note: all 8 mappers are consolidated in one file because they
 * follow identical structural patterns. Separate files would add nav overhead
 * with no isolation benefit (all are pure functions, no shared mutable state).
 *
 * @see Story 19.4
 * @see supabase/migrations/001_initial_schema.sql (project_schedules, project_deliveries, project_requirements)
 * @see supabase/migrations/013_add_project_children_tables.sql (project_histories, project_budgets, project_approvers)
 * @see supabase/migrations/054_add_tempo_permanencia_horas_lancadas.sql
 */

import type {
  CronogramasRecord,
  EntregasRecord,
  RequisitosRecord,
  HistoricosRecord,
  OrcamentosRecord,
  AprovadoresRecord,
  TemposPermanenciaRecord,
  HorasLancadasRecord,
} from '../schemas';

// =============================================================================
// Shared date parsing
// =============================================================================

function parseDate(valor: string | null | undefined): string | null {
  if (!valor || valor.trim() === '') return null;
  const brMatch = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (brMatch) {
    const [, d, m, y] = brMatch;
    return `${y}-${m}-${d}`;
  }
  const dt = new Date(valor);
  return isNaN(dt.getTime()) ? null : dt.toISOString().slice(0, 10);
}

/**
 * Converts HORASORIGINAISHOR from API (either "HH:mm" string or decimal number) to decimal hours.
 */
function parseHoras(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') return raw;
  const trimmed = raw.trim();
  const timeMatch = trimmed.match(/^(\d+):(\d{2})$/);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    return parseFloat((hours + minutes / 60).toFixed(4));
  }
  const parsed = parseFloat(trimmed);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Safely extracts a numeric ID — returns null if the value is not an integer-compatible number.
 * Handles the PASTACONSULTIVO_ID case where API may return "CasoID" string.
 */
function parseIntId(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') return Number.isInteger(raw) ? raw : null;
  const parsed = parseInt(String(raw), 10);
  return isNaN(parsed) ? null : parsed;
}

// =============================================================================
// Row types for DB upserts
// =============================================================================

interface BaseChildRow {
  tenant_id: string;
  project_id: string;
  espaider_id: number;
  updated_at: string;
}

export interface ScheduleRow extends BaseChildRow {
  atividade: string | null;
  responsavel: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  status: string | null;
  fase_atividade: string | null;
  atrasado: boolean;
  setor_responsavel: string | null;
  item: string | null;
  detalhamento: string | null;
  data_prazo: string | null;
  data_novo_prazo: string | null;
  data_alerta_prazo: string | null;
  prazo_confirmado: string | null;
  espaider_raw: Record<string, unknown>;
}

export interface DeliveryRow extends BaseChildRow {
  titulo: string | null;
  status: string | null;
  data_prevista: string | null;
  data_realizada: string | null;
  ordem: number | null;
  detalhamento: string | null;
  prioridade: string | null;
  espaider_raw: Record<string, unknown>;
}

export interface RequirementRow extends BaseChildRow {
  codigo: string | null;
  descricao: string | null;
  tipo: string | null;
  prioridade: string | null;
  status: string | null;
  impacto: string | null;
  detalhamento: string | null;
  entrega_id_espaider: number | null;
  entrega_nome: string | null;
  data_conclusao: string | null;
  espaider_raw: Record<string, unknown>;
}

export interface HistoryRow extends BaseChildRow {
  type: string | null;
  responsible_to: string | null;
  responsible_from: string | null;
  step_to: string | null;
  step_from: string | null;
  procedure_number: number | null;
  message: string | null;
  date: string | null;
  espaider_raw: Record<string, unknown>;
}

export interface BudgetRow extends BaseChildRow {
  value: number | null;
  provider: string | null;
  quotation_date: string | null;
}

export interface ApproverRow extends BaseChildRow {
  type: string | null;
  responsible: string | null;
  attention_points: string | null;
}

export interface TempoPermanenciaRow extends BaseChildRow {
  fase: string | null;
  responsavel: string | null;
  situacao: string | null;
  tempo_permanencia_dias: number | null;
  data_inicio: string | null;
  data_fim: string | null;
  espaider_raw: Record<string, unknown>;
}

export interface HorasLancadasRow extends BaseChildRow {
  solicitacao_id: number | null;
  pasta_consultivo_id: number | null;
  profissional: string | null;
  horas: number | null;
  data_lancamento: string | null;
  tipo_lancamento: string | null;
  espaider_raw: Record<string, unknown>;
}

// =============================================================================
// Mapper functions
// =============================================================================

export function mapCronogramaV2(
  record: CronogramasRecord,
  tenantId: string,
  projectId: string,
): ScheduleRow {
  const raw = record as unknown as Record<string, unknown>;
  return {
    tenant_id: tenantId,
    project_id: projectId,
    espaider_id: record.IDEspaider,
    atividade: record.ATIVIDADE ?? null,
    responsavel: record.RESPONSAVEL ?? null,
    data_inicio: parseDate(record.DATAINICIO),
    data_fim: parseDate(record.DATACONCLUSAO),
    status: record.STATUS ?? 'Pendente',
    fase_atividade: record.FASEATIVIDADE ?? null,
    atrasado: record.ATRASADO === 'Sim',
    setor_responsavel: record.SETORRESPONSAVEL ?? null,
    item: record.ITEM !== null && record.ITEM !== undefined ? String(record.ITEM) : null,
    detalhamento: record.DETALHAMENTO ?? null,
    data_prazo: parseDate(record.DATAPRAZO),
    data_novo_prazo: parseDate(record.DATANOVOPRAZO),
    data_alerta_prazo: parseDate(record.DATAALERTAPRAZO),
    prazo_confirmado: record.PRAZOCONFIRMADO ?? null,
    espaider_raw: raw,
    updated_at: new Date().toISOString(),
  };
}

export function mapEntregaV2(
  record: EntregasRecord,
  tenantId: string,
  projectId: string,
): DeliveryRow {
  const raw = record as unknown as Record<string, unknown>;
  return {
    tenant_id: tenantId,
    project_id: projectId,
    espaider_id: record.IDEspaider,
    titulo: record.ENTREGA ?? null,
    status: 'Pendente',
    data_prevista: parseDate(record.DATAINICIO),
    data_realizada: parseDate(record.DATACONCLUSAO),
    ordem: typeof record.ORDEM === 'number' ? record.ORDEM : null,
    detalhamento: record.DETALHAMENTO ?? null,
    prioridade: record.PRIORIDADE ?? 'Normal',
    espaider_raw: raw,
    updated_at: new Date().toISOString(),
  };
}

export function mapRequisitoV2(
  record: RequisitosRecord,
  tenantId: string,
  projectId: string,
): RequirementRow {
  const raw = record as unknown as Record<string, unknown>;
  return {
    tenant_id: tenantId,
    project_id: projectId,
    espaider_id: record.IDEspaider,
    codigo: record.REQUISITO ?? null,
    descricao: record.REQUISITO ?? null,
    tipo: record.ORIGEMREQUISITO ?? null,
    prioridade: record.PRIORIDADE ?? 'Normal',
    status: record.STATUSREQUISITO ?? 'Aberto',
    impacto: record.IMPACTO ?? null,
    detalhamento: record.DETALHAMENTOREQUISITO ?? null,
    entrega_id_espaider: typeof record.IDENTIFICADOR_ENTREGA === 'number' ? record.IDENTIFICADOR_ENTREGA : null,
    entrega_nome: record.ENTREGA ?? null,
    data_conclusao: parseDate(record.DATACONCLUSAO),
    espaider_raw: raw,
    updated_at: new Date().toISOString(),
  };
}

export function mapHistoricoV2(
  record: HistoricosRecord,
  tenantId: string,
  projectId: string,
): HistoryRow {
  const raw = record as unknown as Record<string, unknown>;
  return {
    tenant_id: tenantId,
    project_id: projectId,
    espaider_id: record.IDEspaider,
    type: record.TIPOHISTORICO ?? null,
    responsible_to: record.RESPONSAVEL_PARA ?? null,
    responsible_from: record.RESPONSAVEL_DE ?? null,
    step_to: record.PASSO_PARA ?? null,
    step_from: record.PASSO_DE ?? null,
    procedure_number: record.NUMEROTRAMITE ?? null,
    message: record.MENSAGEM ?? null,
    date: parseDate(record.DATA_DE),
    espaider_raw: raw,
    updated_at: new Date().toISOString(),
  };
}

export function mapOrcamentoV2(
  record: OrcamentosRecord,
  tenantId: string,
  projectId: string,
): BudgetRow {
  return {
    tenant_id: tenantId,
    project_id: projectId,
    espaider_id: record.IDEspaider,
    value: record.VALOR ?? null,
    provider: record.FORNECEDOR ?? null,
    quotation_date: parseDate(record.DATACOTACAO),
    updated_at: new Date().toISOString(),
  };
}

export function mapAprovadorV2(
  record: AprovadoresRecord,
  tenantId: string,
  projectId: string,
): ApproverRow {
  return {
    tenant_id: tenantId,
    project_id: projectId,
    espaider_id: record.IDEspaider,
    type: record.TIPO ?? null,
    responsible: record.RESPONSAVEL ?? null,
    attention_points: record.PONTOSATENCAO ?? null,
    updated_at: new Date().toISOString(),
  };
}

export function mapTempoPermanenciaV2(
  record: TemposPermanenciaRecord,
  tenantId: string,
  projectId: string,
): TempoPermanenciaRow {
  const raw = record as unknown as Record<string, unknown>;
  return {
    tenant_id: tenantId,
    project_id: projectId,
    espaider_id: record.IDEspaider,
    fase: record.TIPO ?? null,
    responsavel: record.RESPONSAVEL ?? null,
    situacao: record.SITUACAO ?? null,
    tempo_permanencia_dias: record.TOTALDIASDEC ?? null,
    data_inicio: parseDate(record.DATAINICIO),
    data_fim: parseDate(record.DATAFIM),
    espaider_raw: raw,
    updated_at: new Date().toISOString(),
  };
}

export function mapHorasLancadasV2(
  record: HorasLancadasRecord,
  tenantId: string,
  projectId: string,
): HorasLancadasRow {
  const raw = record as unknown as Record<string, unknown>;
  return {
    tenant_id: tenantId,
    project_id: projectId,
    espaider_id: record.IDEspaider,
    solicitacao_id: typeof record.SOLICITACAO_IDENTIFICADOR === 'number'
      ? record.SOLICITACAO_IDENTIFICADOR
      : null,
    pasta_consultivo_id: parseIntId(record.PASTACONSULTIVO_ID),
    profissional: record.COLABORADOR ?? null,
    horas: parseHoras(record.HORASORIGINAISHOR),
    data_lancamento: parseDate(record.DATA),
    tipo_lancamento: record.ATIVIDADE ?? null,
    espaider_raw: raw,
    updated_at: new Date().toISOString(),
  };
}
