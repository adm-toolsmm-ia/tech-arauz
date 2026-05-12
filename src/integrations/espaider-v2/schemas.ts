/**
 * Zod validation schemas for Espaider API v2.
 *
 * Derived from the real sample response (response.bin, 207 parent records, 8 child datasets).
 * Key v2 contract differences from v1:
 * - Records are flattened objects (not wrapped in ListaCampos)
 * - MensagemRetorno is an object { Mensagem: string }, not a string
 * - Children are embedded inline in ListaFilhos
 * - PASTACONSULTIVO is an object { ID, NumeroCaso }, not a scalar
 *
 * @see ESPAIDER-V2-API-CONTEXT.md
 * @see Story 19.2
 */

import { z } from 'zod';

// =============================================================================
// Shared primitives
// =============================================================================

const NullableString = z.string().nullable();
// Some v2 fields carry mixed types — API returns string or number for the same field
const StringOrNumber = z.union([z.string(), z.number()]).nullable();
const OptionalStringOrNumber = z.union([z.string(), z.number()]).nullable().optional();

// =============================================================================
// MensagemRetorno
// =============================================================================

export const MensagemRetornoSchema = z.object({
  Mensagem: z.string(),
});

export type MensagemRetorno = z.infer<typeof MensagemRetornoSchema>;

// =============================================================================
// Parent dataset — ProjetoV2Record
// =============================================================================

/**
 * PASTACONSULTIVO is an object in v2, not a plain text value.
 * Confirmed from sample: { ID: number, NumeroCaso: string }
 */
export const PastaConsultivoSchema = z
  .object({
    ID: z.number(),
    NumeroCaso: z.string(),
  })
  .nullable();

export type PastaConsultivo = z.infer<typeof PastaConsultivoSchema>;

/**
 * Flattened parent project record from ListaRegistros.
 * All 31 confirmed fields from sample response.
 * Nullable where sample proves nullability.
 */
export const ProjetoV2RecordSchema = z.object({
  IDEspaider: z.number().int().positive(),
  TIPOCHAMADO: NullableString,
  TIPOASSUNTO: NullableString,
  STATUSPROJETO: NullableString,
  SOLUCAOAPLICADAEM: NullableString,
  SOLICITANTE: NullableString,
  SITUACAOATUAL: NullableString,
  RESPONSAVELPROJETO: NullableString,
  PRIORIDADE: NullableString,
  PRAZOFINAL: NullableString,
  PRAZOCRONOGRAMAATUAL: NullableString,
  PRAZOAPROVADOR: NullableString,
  PASTACONSULTIVO: PastaConsultivoSchema,
  OBJETIVO: NullableString,
  NOME: NullableString,
  MOTIVO_IMPORTANCIAESPECIAL: NullableString,
  MENSAGEM_MOVIMENTACAO: NullableString,
  JUSTIFICATIVA: NullableString,
  IMPORTANCIAESPECIAL: NullableString,
  IMPACTOOPERACIONAL: NullableString,
  IMPACTOESTRATEGICO: NullableString,
  ESCOPO: NullableString,
  ENCERRADOEM: NullableString,
  DATAMOVIMENTACAO: NullableString,
  DATAINICIOAPROVACAO: NullableString,
  CRONOGRAMAATUAL: NullableString,
  COMPLEXIDADETECNICA: NullableString,
  CODIGO: NullableString,
  CHAMADO_EXTERNO: NullableString,
  ASSUNTOAREA: NullableString,
  APROVADORATUAL: NullableString,
});

export type ProjetoV2Record = z.infer<typeof ProjetoV2RecordSchema>;

// =============================================================================
// Child dataset schemas
// =============================================================================

/**
 * TEMPOSPERMANCENCIA — note: vendor typo preserved (not TEMPOSPERMANENCIA).
 * Confirmed from sample with URLPaginacao.
 */
export const TemposPermanenciaRecordSchema = z.object({
  IDEspaider: z.number().int(),
  IDREGISTROPAI: z.number().int(),
  TOTALMINUTOSDEC: z.number().nullable(),
  TOTALHORASDEC: z.number().nullable(),
  TOTALDIASDEC: z.number().nullable(),
  TIPO: NullableString,
  SOLICITACAO_CODIGO: NullableString,
  SITUACAO: NullableString,
  SETOR: NullableString,
  RESPONSAVEL: NullableString,
  IDENTIFICADOR: OptionalStringOrNumber, // API returns string or number
  DATAINICIO: NullableString,
  DATAFIM: NullableString,
  APROVADOR: NullableString,
});

export type TemposPermanenciaRecord = z.infer<typeof TemposPermanenciaRecordSchema>;

export const RequisitosRecordSchema = z.object({
  IDEspaider: z.number().int(),
  IDREGISTROPAI: z.number().int(),
  STATUSREQUISITO: NullableString,
  REQUISITO: NullableString,
  PRIORIDADE: NullableString,
  ORIGEMREQUISITO: NullableString,
  IMPACTO: NullableString,
  IDENTIFICADOR_ENTREGA: z.number().nullable(),
  IDENTIFICADOR: OptionalStringOrNumber, // API returns number for this child
  ENTREGA: NullableString,
  DETALHAMENTOREQUISITO: NullableString,
  DATACONCLUSAO: NullableString,
});

export type RequisitosRecord = z.infer<typeof RequisitosRecordSchema>;

export const OrcamentosRecordSchema = z.object({
  IDEspaider: z.number().int(),
  IDREGISTROPAI: z.number().int(),
  VALOR: z.number().nullable(),
  FORNECEDOR: NullableString,
  DATACOTACAO: NullableString,
});

export type OrcamentosRecord = z.infer<typeof OrcamentosRecordSchema>;

export const HorasLancadasRecordSchema = z.object({
  IDEspaider: z.number().int(),
  IDREGISTROPAI: z.number().int(),
  UPDATEDONINTERFACE: NullableString,
  UPDATEDON: NullableString,
  SOLICITACAO_IDENTIFICADOR: z.number().nullable(),
  SETOR: NullableString,
  PASTACONSULTIVO_ID: StringOrNumber, // API returns string "CasoID" or number
  PASTACONSULTIVO: NullableString,
  OBSERVACOES: NullableString,
  NUMERO: z.number().nullable(),
  LOCALIZACAOCOLABORADOR: NullableString,
  HORASORIGINAISHOR: StringOrNumber, // API returns "HH:mm" string or decimal number
  DATA: NullableString,
  CREATEDON: NullableString,
  COMPLEXIDADE: NullableString,
  COLABORADOR: NullableString,
  ATIVIDADE: NullableString,
});

export type HorasLancadasRecord = z.infer<typeof HorasLancadasRecordSchema>;

export const HistoricosRecordSchema = z.object({
  IDEspaider: z.number().int(),
  IDREGISTROPAI: z.number().int(),
  TIPOHISTORICO: NullableString,
  RESPONSAVEL_PARA: NullableString,
  RESPONSAVEL_DE: NullableString,
  PASSO_PARA: NullableString,
  PASSO_DE: NullableString,
  NUMEROTRAMITE: z.number().nullable(),
  MENSAGEM: NullableString,
  IDENTIFICADOR: OptionalStringOrNumber, // API returns string "ID" or number
  DATA_DE: NullableString,
});

export type HistoricosRecord = z.infer<typeof HistoricosRecordSchema>;

export const EntregasRecordSchema = z.object({
  IDEspaider: z.number().int(),
  IDREGISTROPAI: z.number().int(),
  PRIORIDADE: NullableString,
  ORDEM: z.number().nullable(),
  IDENTIFICADOR: OptionalStringOrNumber, // API returns number for this child
  ENTREGA: NullableString,
  DETALHAMENTO: NullableString,
  DATAINICIO: NullableString,
  DATACONCLUSAO: NullableString,
});

export type EntregasRecord = z.infer<typeof EntregasRecordSchema>;

export const CronogramasRecordSchema = z.object({
  IDEspaider: z.number().int(),
  IDREGISTROPAI: z.number().int(),
  STATUS: NullableString,
  SETORRESPONSAVEL: NullableString,
  RESPONSAVEL: NullableString,
  PRAZOCONFIRMADO: NullableString,
  ITEM: StringOrNumber, // API returns string "1" or number
  IDENTIFICADOR: OptionalStringOrNumber, // API returns number
  FASEATIVIDADE: NullableString,
  DETALHAMENTO: NullableString,
  DATAPRAZO: NullableString,
  DATANOVOPRAZO: NullableString,
  DATAINICIO: NullableString,
  DATACONCLUSAO: NullableString,
  DATAALERTAPRAZO: NullableString,
  CRIARAGENDACONSULTIVO: NullableString,
  ATRASADO: NullableString,
  ATIVIDADE: NullableString,
});

export type CronogramasRecord = z.infer<typeof CronogramasRecordSchema>;

export const AprovadoresRecordSchema = z.object({
  IDEspaider: z.number().int(),
  IDREGISTROPAI: z.number().int(),
  TIPO: NullableString,
  RESPONSAVEL: NullableString,
  PONTOSATENCAO: NullableString,
});

export type AprovadoresRecord = z.infer<typeof AprovadoresRecordSchema>;

// =============================================================================
// Child dataset identifiers — vendor strings, preserved exactly
// =============================================================================

export const CHILD_IDENTIFIERS = {
  TEMPOSPERMANCENCIA: 'BI_SOLICITACOES_PROJETOSESPAIDER_TEMPOSPERMANCENCIA',
  REQUISITOS: 'BI_SOLICITACOES_PROJETOSESPAIDER_REQUISITOS',
  ORCAMENTOS: 'BI_SOLICITACOES_PROJETOSESPAIDER_ORCAMENTOS',
  HORASLANCADAS: 'BI_SOLICITACOES_PROJETOSESPAIDER_HORASLANCADAS',
  HISTORICOS: 'BI_SOLICITACOES_PROJETOSESPAIDER_HISTORICOS',
  ENTREGAS: 'BI_SOLICITACOES_PROJETOSESPAIDER_ENTREGAS',
  CRONOGRAMAS: 'BI_SOLICITACOES_PROJETOSESPAIDER_CRONOGRAMAS',
  APROVADORES: 'BI_SOLICITACOES_PROJETOSESPAIDER_APROVADORES',
} as const;

export type ChildIdentifier = (typeof CHILD_IDENTIFIERS)[keyof typeof CHILD_IDENTIFIERS];

// Child schema registry — maps Identificador → Zod schema
const childSchemaRegistry = new Map<string, z.ZodTypeAny>([
  [CHILD_IDENTIFIERS.TEMPOSPERMANCENCIA, TemposPermanenciaRecordSchema],
  [CHILD_IDENTIFIERS.REQUISITOS, RequisitosRecordSchema],
  [CHILD_IDENTIFIERS.ORCAMENTOS, OrcamentosRecordSchema],
  [CHILD_IDENTIFIERS.HORASLANCADAS, HorasLancadasRecordSchema],
  [CHILD_IDENTIFIERS.HISTORICOS, HistoricosRecordSchema],
  [CHILD_IDENTIFIERS.ENTREGAS, EntregasRecordSchema],
  [CHILD_IDENTIFIERS.CRONOGRAMAS, CronogramasRecordSchema],
  [CHILD_IDENTIFIERS.APROVADORES, AprovadoresRecordSchema],
]);

/**
 * Returns the Zod schema for a given child dataset identifier, or null if unknown.
 */
export function getChildSchema(identificador: string): z.ZodTypeAny | null {
  return childSchemaRegistry.get(identificador) ?? null;
}

// =============================================================================
// FilhoDatasetSchema
// =============================================================================

export const FilhoDatasetSchema = z.object({
  Identificador: z.string().min(1),
  ListaRegistros: z.array(z.record(z.unknown())),
  URLPaginacao: z.string().nullable().optional(),
});

export type FilhoDatasetValidated = z.infer<typeof FilhoDatasetSchema>;

// =============================================================================
// Top-level response schema
// =============================================================================

export const ConsultarRegistrosResponseSchema = z.object({
  Situacao: z.enum(['S', 'E']),
  MensagemRetorno: MensagemRetornoSchema,
  URLPaginacao: z.string().nullable(),
  ListaRegistros: z.array(z.record(z.unknown())),
  ListaFilhos: z.array(FilhoDatasetSchema),
});

export type ConsultarRegistrosResponseValidated = z.infer<typeof ConsultarRegistrosResponseSchema>;

// =============================================================================
// Validation helpers
// =============================================================================

export interface ValidationError {
  path: string;
  message: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

/**
 * Validates the top-level response envelope. Does not deeply validate ListaRegistros records.
 */
export function validateTopLevelResponse(
  raw: unknown,
): ValidationResult<ConsultarRegistrosResponseValidated> {
  const result = ConsultarRegistrosResponseSchema.safeParse(raw);
  if (result.success) return { success: true, data: result.data };

  return {
    success: false,
    errors: result.error.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    })),
  };
}

/**
 * Validates a single parent record using the ProjetoV2RecordSchema.
 * Returns errors with dataset context for quarantine (Story 19.5).
 */
export function validateProjetoRecord(raw: unknown): ValidationResult<ProjetoV2Record> {
  const result = ProjetoV2RecordSchema.safeParse(raw);
  if (result.success) return { success: true, data: result.data };

  return {
    success: false,
    errors: result.error.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    })),
  };
}

/**
 * Validates records for a known child dataset.
 * Uses the registry to find the correct schema by Identificador.
 * Returns errors per record with dataset and index context.
 */
export function validateChildRecords(
  identificador: string,
  records: unknown[],
): Array<ValidationResult<unknown>> {
  const schema = getChildSchema(identificador);
  if (!schema) {
    return records.map(() => ({
      success: false,
      errors: [{ path: 'Identificador', message: `Unknown child dataset: ${identificador}` }],
    }));
  }

  return records.map((record) => {
    const result = schema.safeParse(record);
    if (result.success) return { success: true, data: result.data };
    return {
      success: false,
      errors: result.error.errors.map((e: z.ZodIssue) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    };
  });
}
