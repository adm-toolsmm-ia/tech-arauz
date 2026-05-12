/**
 * Contract tests for Espaider API v2.
 * Validates the real sample response (response.bin) against all v2 schemas.
 * Ensures vendor typos are preserved and all child datasets parse correctly.
 * @see Story 19.2
 */

import { describe, it, expect } from 'vitest';
import sampleResponse from './__fixtures__/consultar-registros-v2-response.json';
import {
  validateTopLevelResponse,
  validateProjetoRecord,
  validateChildRecords,
  CHILD_IDENTIFIERS,
  ConsultarRegistrosResponseSchema,
  MensagemRetornoSchema,
  PastaConsultivoSchema,
} from '../schemas';
import type { FilhoDatasetValidated } from '../schemas';

// =============================================================================
// Top-level envelope
// =============================================================================

describe('sample response — top-level envelope', () => {
  it('validates successfully against ConsultarRegistrosResponseSchema', () => {
    const result = validateTopLevelResponse(sampleResponse);
    expect(result.success).toBe(true);
  });

  it('has Situacao S', () => {
    expect((sampleResponse as { Situacao: string }).Situacao).toBe('S');
  });

  it('has MensagemRetorno as object with Mensagem', () => {
    const result = MensagemRetornoSchema.safeParse(
      (sampleResponse as { MensagemRetorno: unknown }).MensagemRetorno,
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.Mensagem).toBe('string');
      expect(result.data.Mensagem.length).toBeGreaterThan(0);
    }
  });

  it('has URLPaginacao as string (sample has pagination)', () => {
    expect(typeof (sampleResponse as { URLPaginacao: unknown }).URLPaginacao).toBe('string');
    expect((sampleResponse as { URLPaginacao: string }).URLPaginacao).toContain(
      'ConsultarRegistrosComChave',
    );
    expect((sampleResponse as { URLPaginacao: string }).URLPaginacao).toContain('ChavePaginacao');
  });

  it('has 2 parent records in fixture (sliced from 207)', () => {
    expect((sampleResponse as { ListaRegistros: unknown[] }).ListaRegistros).toHaveLength(2);
  });

  it('has 8 child datasets in ListaFilhos', () => {
    expect((sampleResponse as { ListaFilhos: unknown[] }).ListaFilhos).toHaveLength(8);
  });
});

// =============================================================================
// Parent records
// =============================================================================

describe('sample response — parent records', () => {
  const records = (sampleResponse as { ListaRegistros: unknown[] }).ListaRegistros;

  it('all parent records validate against ProjetoV2RecordSchema', () => {
    const results = records.map(validateProjetoRecord);
    const failures = results.filter((r) => !r.success);
    if (failures.length > 0) {
      console.error('Validation failures:', JSON.stringify(failures, null, 2));
    }
    expect(failures).toHaveLength(0);
  });

  it('first record has PASTACONSULTIVO as object', () => {
    const firstRecord = records[0] as { PASTACONSULTIVO: unknown };
    const result = PastaConsultivoSchema.safeParse(firstRecord.PASTACONSULTIVO);
    expect(result.success).toBe(true);
    if (result.success && result.data) {
      expect(typeof result.data.ID).toBe('number');
      expect(typeof result.data.NumeroCaso).toBe('string');
    }
  });

  it('parent records have IDEspaider as positive integer', () => {
    for (const record of records) {
      const r = record as { IDEspaider: unknown };
      expect(typeof r.IDEspaider).toBe('number');
      expect(r.IDEspaider as number).toBeGreaterThan(0);
      expect(Number.isInteger(r.IDEspaider)).toBe(true);
    }
  });
});

// =============================================================================
// Child datasets
// =============================================================================

describe('sample response — child datasets', () => {
  const children = (
    sampleResponse as {
      ListaFilhos: Array<{
        Identificador: string;
        ListaRegistros: unknown[];
        URLPaginacao: unknown;
      }>;
    }
  ).ListaFilhos;

  it('all child datasets validate against FilhoDatasetSchema', () => {
    const parsed = ConsultarRegistrosResponseSchema.safeParse(sampleResponse);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      const children: FilhoDatasetValidated[] = parsed.data.ListaFilhos;
      expect(children.length).toBe(8);
    }
  });

  it('contains TEMPOSPERMANCENCIA with vendor typo (not TEMPOSPERMANENCIA)', () => {
    const ids = children.map((c) => c.Identificador);
    expect(ids).toContain(CHILD_IDENTIFIERS.TEMPOSPERMANCENCIA);
    expect(ids).not.toContain('BI_SOLICITACOES_PROJETOSESPAIDER_TEMPOSPERMANENCIA');
  });

  it('TEMPOSPERMANCENCIA has URLPaginacao (requires pagination)', () => {
    const tempos = children.find((c) => c.Identificador === CHILD_IDENTIFIERS.TEMPOSPERMANCENCIA);
    expect(tempos).toBeDefined();
    expect(tempos?.URLPaginacao).toBeTruthy();
  });

  it('HISTORICOS has URLPaginacao (requires pagination)', () => {
    const historicos = children.find((c) => c.Identificador === CHILD_IDENTIFIERS.HISTORICOS);
    expect(historicos).toBeDefined();
    expect(historicos?.URLPaginacao).toBeTruthy();
  });

  it('APROVADORES has URLPaginacao (requires pagination)', () => {
    const aprovadores = children.find((c) => c.Identificador === CHILD_IDENTIFIERS.APROVADORES);
    expect(aprovadores).toBeDefined();
    expect(aprovadores?.URLPaginacao).toBeTruthy();
  });

  it('REQUISITOS has no URLPaginacao', () => {
    const requisitos = children.find((c) => c.Identificador === CHILD_IDENTIFIERS.REQUISITOS);
    expect(requisitos).toBeDefined();
    expect(requisitos?.URLPaginacao ?? null).toBeNull();
  });

  it('all child records validate against their respective schemas', () => {
    const allErrors: Array<{ dataset: string; index: number; errors: unknown }> = [];

    for (const child of children) {
      const results = validateChildRecords(child.Identificador, child.ListaRegistros);
      results.forEach((r, idx) => {
        if (!r.success) {
          allErrors.push({ dataset: child.Identificador, index: idx, errors: r.errors });
        }
      });
    }

    if (allErrors.length > 0) {
      console.error('Child validation errors:', JSON.stringify(allErrors, null, 2));
    }
    expect(allErrors).toHaveLength(0);
  });
});

// =============================================================================
// V2 vs V1 contract verification
// =============================================================================

describe('v2 contract — breaking changes verified', () => {
  it('does not use ListaCampos (v1 pattern)', () => {
    const records = (sampleResponse as { ListaRegistros: Array<Record<string, unknown>> })
      .ListaRegistros;
    for (const record of records) {
      expect(record).not.toHaveProperty('ListaCampos');
    }
  });

  it('does not use ListaURLFilhos (v1 pattern)', () => {
    expect(sampleResponse).not.toHaveProperty('ListaURLFilhos');
  });

  it('uses ListaFilhos (v2 inline children)', () => {
    expect(sampleResponse).toHaveProperty('ListaFilhos');
    expect(Array.isArray((sampleResponse as { ListaFilhos: unknown[] }).ListaFilhos)).toBe(true);
  });

  it('MensagemRetorno is an object not a string', () => {
    const msg = (sampleResponse as { MensagemRetorno: unknown }).MensagemRetorno;
    expect(typeof msg).toBe('object');
    expect(typeof msg).not.toBe('string');
  });
});
