/**
 * Maps a validated ProjetoV2Record to a Supabase projects row.
 *
 * Key v2 mapping differences:
 * - Fields are accessed directly (not via ListaCampos lookup)
 * - PASTACONSULTIVO is an object { ID, NumeroCaso } → pasta_consultivo_id + pasta_consultivo
 * - IMPORTANCIAESPECIAL is "Sim"/"Não" string → boolean
 *
 * @see Story 19.3
 * @see src/integrations/espaider/mapper.ts — v1 reference for field names
 */

import type { ProjetoV2Record } from '../schemas';

// =============================================================================
// Date parsing
// =============================================================================

/**
 * Parses Brazilian date strings returned by v2 API.
 * Supports: "DD/MM/YYYY", "DD/MM/YYYY HH:mm", "DD/MM/YYYY HH:mm:ss"
 */
function parseDate(valor: string | null | undefined): string | null {
  if (!valor || valor.trim() === '') return null;

  const brMatch = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (brMatch) {
    const [, day, month, year] = brMatch;
    return `${year}-${month}-${day}`;
  }

  const d = new Date(valor);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

// =============================================================================
// Project row type
// =============================================================================

export interface ProjectV2Row {
  tenant_id: string;
  espaider_id: number;
  codigo: string | null;
  titulo: string | null;
  status: string | null;
  situacao_atual: string | null;
  responsavel: string | null;
  prioridade: string | null;
  prazo_final: string | null;
  prazo_fase: string | null;
  prazo_cronograma: string | null;
  area: string | null;
  pasta_consultivo: string | null;
  pasta_consultivo_id: number | null;
  fase_atual: string | null;
  cronograma_atual: string | null;
  solucao_aplicada: string | null;
  data_movimentacao: string | null;
  data_encerramento: string | null;
  data_inicio_aprovacao: string | null;
  tipo_chamado: string | null;
  tipo_assunto: string | null;
  solicitante: string | null;
  objetivo: string | null;
  motivo_importancia_especial: string | null;
  mensagem_movimentacao: string | null;
  justificativa: string | null;
  importancia_especial: boolean;
  impacto_operacional: string | null;
  impacto_estrategico: string | null;
  escopo: string | null;
  complexidade_tecnica: string | null;
  chamado_externo: string | null;
  status_field: string | null;
  trm_espaider: string | null;
  updated_at: string;
}

// =============================================================================
// Mapper
// =============================================================================

/**
 * Maps a validated v2 parent record to the projects table row shape.
 * Idempotent: safe to call multiple times for the same record.
 */
export function mapProjetoV2ToRow(record: ProjetoV2Record, tenantId: string): ProjectV2Row {
  const pastaNumeroCaso =
    record.PASTACONSULTIVO != null ? record.PASTACONSULTIVO.NumeroCaso : null;
  const pastaId = record.PASTACONSULTIVO != null ? record.PASTACONSULTIVO.ID : null;

  return {
    tenant_id: tenantId,
    espaider_id: record.IDEspaider,
    codigo: record.CODIGO ?? null,
    titulo: record.NOME ?? null,
    status: record.STATUSPROJETO ?? null,
    status_field: record.STATUSPROJETO ?? null,
    situacao_atual: record.SITUACAOATUAL ?? null,
    responsavel: record.RESPONSAVELPROJETO ?? null,
    prioridade: record.PRIORIDADE ?? null,
    prazo_final: parseDate(record.PRAZOFINAL),
    prazo_fase: parseDate(record.PRAZOAPROVADOR),
    prazo_cronograma: parseDate(record.PRAZOCRONOGRAMAATUAL),
    area: record.ASSUNTOAREA ?? null,
    pasta_consultivo: pastaNumeroCaso,
    pasta_consultivo_id: pastaId,
    fase_atual: record.APROVADORATUAL ?? null,
    cronograma_atual: record.CRONOGRAMAATUAL ?? null,
    solucao_aplicada: record.SOLUCAOAPLICADAEM ?? null,
    data_movimentacao: parseDate(record.DATAMOVIMENTACAO),
    data_encerramento: parseDate(record.ENCERRADOEM),
    data_inicio_aprovacao: parseDate(record.DATAINICIOAPROVACAO),
    tipo_chamado: record.TIPOCHAMADO ?? null,
    tipo_assunto: record.TIPOASSUNTO ?? null,
    solicitante: record.SOLICITANTE ?? null,
    objetivo: record.OBJETIVO ?? null,
    motivo_importancia_especial: record.MOTIVO_IMPORTANCIAESPECIAL ?? null,
    mensagem_movimentacao: record.MENSAGEM_MOVIMENTACAO ?? null,
    justificativa: record.JUSTIFICATIVA ?? null,
    importancia_especial: record.IMPORTANCIAESPECIAL === 'Sim',
    impacto_operacional: record.IMPACTOOPERACIONAL ?? null,
    impacto_estrategico: record.IMPACTOESTRATEGICO ?? null,
    escopo: record.ESCOPO ?? null,
    complexidade_tecnica: record.COMPLEXIDADETECNICA ?? null,
    chamado_externo: record.CHAMADO_EXTERNO ?? null,
    trm_espaider: null, // field not present in v2 parent payload
    updated_at: new Date().toISOString(),
  };
}
