/**
 * Schema validation unit tests for Espaider v2.
 * Tests individual schema shapes, edge cases, and validation helpers.
 * @see Story 19.2
 */

import { describe, it, expect } from 'vitest';
import {
  MensagemRetornoSchema,
  PastaConsultivoSchema,
  ProjetoV2RecordSchema,
  FilhoDatasetSchema,
  ConsultarRegistrosResponseSchema,
  CHILD_IDENTIFIERS,
  getChildSchema,
  validateTopLevelResponse,
  validateProjetoRecord,
  validateChildRecords,
  TemposPermanenciaRecordSchema,
  AprovadoresRecordSchema,
} from '../schemas';

// =============================================================================
// MensagemRetorno
// =============================================================================

describe('MensagemRetornoSchema', () => {
  it('accepts object with Mensagem string', () => {
    expect(
      MensagemRetornoSchema.safeParse({ Mensagem: 'Consulta realizada com sucesso!' }).success,
    ).toBe(true);
  });

  it('rejects plain string (v1 style)', () => {
    expect(MensagemRetornoSchema.safeParse('OK').success).toBe(false);
  });

  it('rejects missing Mensagem field', () => {
    expect(MensagemRetornoSchema.safeParse({}).success).toBe(false);
  });
});

// =============================================================================
// PastaConsultivo
// =============================================================================

describe('PastaConsultivoSchema', () => {
  it('accepts object shape with ID and NumeroCaso', () => {
    const result = PastaConsultivoSchema.safeParse({ ID: 20232, NumeroCaso: 'CS.36482' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data?.ID).toBe(20232);
      expect(result.data?.NumeroCaso).toBe('CS.36482');
    }
  });

  it('accepts null (some projects have no pasta)', () => {
    expect(PastaConsultivoSchema.safeParse(null).success).toBe(true);
  });

  it('rejects plain string (v1 behavior — would be breaking change)', () => {
    expect(PastaConsultivoSchema.safeParse('CS.36482').success).toBe(false);
  });
});

// =============================================================================
// ProjetoV2Record
// =============================================================================

describe('ProjetoV2RecordSchema', () => {
  const validRecord = {
    IDEspaider: 116727,
    TIPOCHAMADO: 'Controle de projetos',
    TIPOASSUNTO: 'RH',
    STATUSPROJETO: 'Projeto futuro',
    SOLUCAOAPLICADAEM: null,
    SOLICITANTE: 'Gabriel Andreas Cristofolini',
    SITUACAOATUAL: 'Em aprovação',
    RESPONSAVELPROJETO: null,
    PRIORIDADE: 'Normal',
    PRAZOFINAL: null,
    PRAZOCRONOGRAMAATUAL: null,
    PRAZOAPROVADOR: '01/03/2026',
    PASTACONSULTIVO: { ID: 20232, NumeroCaso: 'CS.36482' },
    OBJETIVO: 'Integração com sistema da Sênior',
    NOME: 'Integração Sênior - Folha de pagamento',
    MOTIVO_IMPORTANCIAESPECIAL: 'Complexidade',
    MENSAGEM_MOVIMENTACAO: 'Aguardando definição',
    JUSTIFICATIVA: null,
    IMPORTANCIAESPECIAL: 'Sim',
    IMPACTOOPERACIONAL: null,
    IMPACTOESTRATEGICO: null,
    ESCOPO: null,
    ENCERRADOEM: null,
    DATAMOVIMENTACAO: '12/06/2025 14:21:16',
    DATAINICIOAPROVACAO: '19/05/2025 18:53',
    CRONOGRAMAATUAL: null,
    COMPLEXIDADETECNICA: null,
    CODIGO: 'ESPDR.00204/20',
    CHAMADO_EXTERNO: '498440 / 272444',
    ASSUNTOAREA: 'RH',
    APROVADORATUAL: 'Fila de projetos',
  };

  it('validates a complete parent record from sample', () => {
    const result = ProjetoV2RecordSchema.safeParse(validRecord);
    expect(result.success).toBe(true);
  });

  it('requires IDEspaider as positive integer', () => {
    expect(ProjetoV2RecordSchema.safeParse({ ...validRecord, IDEspaider: -1 }).success).toBe(false);
    expect(ProjetoV2RecordSchema.safeParse({ ...validRecord, IDEspaider: 0 }).success).toBe(false);
    expect(ProjetoV2RecordSchema.safeParse({ ...validRecord, IDEspaider: 'abc' }).success).toBe(
      false,
    );
  });

  it('accepts null for nullable fields', () => {
    const withNulls = { ...validRecord, RESPONSAVELPROJETO: null, PRAZOFINAL: null };
    expect(ProjetoV2RecordSchema.safeParse(withNulls).success).toBe(true);
  });

  it('accepts null PASTACONSULTIVO', () => {
    expect(ProjetoV2RecordSchema.safeParse({ ...validRecord, PASTACONSULTIVO: null }).success).toBe(
      true,
    );
  });
});

// =============================================================================
// FilhoDataset
// =============================================================================

describe('FilhoDatasetSchema', () => {
  it('accepts child dataset with Identificador and ListaRegistros', () => {
    const child = {
      Identificador: CHILD_IDENTIFIERS.REQUISITOS,
      ListaRegistros: [{ IDEspaider: 1, IDREGISTROPAI: 100 }],
      URLPaginacao: null,
    };
    expect(FilhoDatasetSchema.safeParse(child).success).toBe(true);
  });

  it('accepts child dataset without URLPaginacao field', () => {
    const child = {
      Identificador: CHILD_IDENTIFIERS.ORCAMENTOS,
      ListaRegistros: [],
    };
    expect(FilhoDatasetSchema.safeParse(child).success).toBe(true);
  });

  it('rejects empty Identificador', () => {
    const child = { Identificador: '', ListaRegistros: [] };
    expect(FilhoDatasetSchema.safeParse(child).success).toBe(false);
  });
});

// =============================================================================
// Child identifiers — vendor strings preserved exactly
// =============================================================================

describe('CHILD_IDENTIFIERS', () => {
  it('preserves vendor typo TEMPOSPERMANCENCIA (not TEMPOSPERMANENCIA)', () => {
    expect(CHILD_IDENTIFIERS.TEMPOSPERMANCENCIA).toBe(
      'BI_SOLICITACOES_PROJETOSESPAIDER_TEMPOSPERMANCENCIA',
    );
    expect(CHILD_IDENTIFIERS.TEMPOSPERMANCENCIA).not.toContain('PERMANENCIA');
  });

  it('contains all 8 expected child identifiers', () => {
    const ids = Object.values(CHILD_IDENTIFIERS);
    expect(ids).toHaveLength(8);
    expect(ids).toContain('BI_SOLICITACOES_PROJETOSESPAIDER_HISTORICOS');
    expect(ids).toContain('BI_SOLICITACOES_PROJETOSESPAIDER_APROVADORES');
  });
});

// =============================================================================
// Child schema registry
// =============================================================================

describe('getChildSchema', () => {
  it('returns schema for known identifiers', () => {
    expect(getChildSchema(CHILD_IDENTIFIERS.TEMPOSPERMANCENCIA)).toBe(
      TemposPermanenciaRecordSchema,
    );
    expect(getChildSchema(CHILD_IDENTIFIERS.APROVADORES)).toBe(AprovadoresRecordSchema);
  });

  it('returns null for unknown identifier', () => {
    expect(getChildSchema('UNKNOWN_DATASET')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(getChildSchema('')).toBeNull();
  });
});

// =============================================================================
// Top-level response validation
// =============================================================================

describe('validateTopLevelResponse', () => {
  const validEnvelope = {
    Situacao: 'S',
    MensagemRetorno: { Mensagem: 'Consulta realizada com sucesso!' },
    URLPaginacao: 'https://espaider.com.br/page2',
    ListaRegistros: [{ IDEspaider: 1 }],
    ListaFilhos: [{ Identificador: CHILD_IDENTIFIERS.REQUISITOS, ListaRegistros: [] }],
  };

  it('accepts valid envelope', () => {
    const result = validateTopLevelResponse(validEnvelope);
    expect(result.success).toBe(true);
  });

  it('accepts null URLPaginacao', () => {
    const result = validateTopLevelResponse({ ...validEnvelope, URLPaginacao: null });
    expect(result.success).toBe(true);
  });

  it('rejects plain string MensagemRetorno', () => {
    const result = validateTopLevelResponse({ ...validEnvelope, MensagemRetorno: 'OK' });
    expect(result.success).toBe(false);
    expect(result.errors?.some((e) => e.path.includes('MensagemRetorno'))).toBe(true);
  });

  it('rejects invalid Situacao value', () => {
    const result = validateTopLevelResponse({ ...validEnvelope, Situacao: 'X' });
    expect(result.success).toBe(false);
  });

  it('returns actionable error paths', () => {
    const result = validateTopLevelResponse({ ...validEnvelope, MensagemRetorno: 'bad' });
    expect(result.errors).toBeDefined();
    expect(Array.isArray(result.errors)).toBe(true);
    expect(result.errors!.length).toBeGreaterThan(0);
    expect(result.errors![0]).toHaveProperty('path');
    expect(result.errors![0]).toHaveProperty('message');
  });
});

// =============================================================================
// validateProjetoRecord
// =============================================================================

describe('validateProjetoRecord', () => {
  it('returns success for valid record', () => {
    const record = {
      IDEspaider: 100,
      TIPOCHAMADO: null,
      TIPOASSUNTO: null,
      STATUSPROJETO: null,
      SOLUCAOAPLICADAEM: null,
      SOLICITANTE: null,
      SITUACAOATUAL: null,
      RESPONSAVELPROJETO: null,
      PRIORIDADE: null,
      PRAZOFINAL: null,
      PRAZOCRONOGRAMAATUAL: null,
      PRAZOAPROVADOR: null,
      PASTACONSULTIVO: null,
      OBJETIVO: null,
      NOME: 'Test',
      MOTIVO_IMPORTANCIAESPECIAL: null,
      MENSAGEM_MOVIMENTACAO: null,
      JUSTIFICATIVA: null,
      IMPORTANCIAESPECIAL: null,
      IMPACTOOPERACIONAL: null,
      IMPACTOESTRATEGICO: null,
      ESCOPO: null,
      ENCERRADOEM: null,
      DATAMOVIMENTACAO: null,
      DATAINICIOAPROVACAO: null,
      CRONOGRAMAATUAL: null,
      COMPLEXIDADETECNICA: null,
      CODIGO: null,
      CHAMADO_EXTERNO: null,
      ASSUNTOAREA: null,
      APROVADORATUAL: null,
    };
    expect(validateProjetoRecord(record).success).toBe(true);
  });

  it('returns error with path context for invalid record', () => {
    const result = validateProjetoRecord({ IDEspaider: 'not-a-number' });
    expect(result.success).toBe(false);
    expect(result.errors?.some((e) => e.path.includes('IDEspaider'))).toBe(true);
  });
});

// =============================================================================
// validateChildRecords
// =============================================================================

describe('validateChildRecords', () => {
  it('validates known child records successfully', () => {
    const records = [
      { IDEspaider: 1, IDREGISTROPAI: 100, TIPO: null, RESPONSAVEL: null, PONTOSATENCAO: null },
      {
        IDEspaider: 2,
        IDREGISTROPAI: 100,
        TIPO: 'Aprovador',
        RESPONSAVEL: 'João',
        PONTOSATENCAO: null,
      },
    ];
    const results = validateChildRecords(CHILD_IDENTIFIERS.APROVADORES, records);
    expect(results).toHaveLength(2);
    expect(results.every((r) => r.success)).toBe(true);
  });

  it('returns error for unknown dataset identifier', () => {
    const results = validateChildRecords('UNKNOWN_DATASET', [{ IDEspaider: 1 }]);
    expect(results[0].success).toBe(false);
    expect(results[0].errors?.[0].message).toContain('Unknown child dataset');
  });

  it('returns per-record results — valid and invalid independently', () => {
    const records = [
      { IDEspaider: 1, IDREGISTROPAI: 100, TIPO: null, RESPONSAVEL: null, PONTOSATENCAO: null },
      { IDEspaider: 'bad', IDREGISTROPAI: 100 },
    ];
    const results = validateChildRecords(CHILD_IDENTIFIERS.APROVADORES, records);
    expect(results[0].success).toBe(true);
    expect(results[1].success).toBe(false);
  });
});

// =============================================================================
// ConsultarRegistrosResponseSchema (direct Zod usage)
// =============================================================================

describe('ConsultarRegistrosResponseSchema', () => {
  it('accepts Situacao E (error response from API)', () => {
    const errorEnvelope = {
      Situacao: 'E',
      MensagemRetorno: { Mensagem: 'Token inválido' },
      URLPaginacao: null,
      ListaRegistros: [],
      ListaFilhos: [],
    };
    expect(ConsultarRegistrosResponseSchema.safeParse(errorEnvelope).success).toBe(true);
  });
});
