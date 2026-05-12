/**
 * Tests for Espaider v2 child datasets orchestration.
 * Covers: routing, parent link resolution, orphan handling, vendor typo.
 * @see Story 19.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncV2ChildDatasets } from '../espaider-v2-children-sync';
import type { FilhoDataset } from '@/integrations/espaider-v2/types';
import { CHILD_IDENTIFIERS } from '@/integrations/espaider-v2/schemas';

vi.mock('@/lib/security/integration-token', () => ({
  decryptIntegrationToken: vi.fn((t: string) => t),
  isEncryptedIntegrationToken: vi.fn(() => false),
}));

// =============================================================================
// Helpers
// =============================================================================

function makeAprovadorRecord(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    IDEspaider: 100,
    IDREGISTROPAI: 1001,
    TIPO: 'Aprovador',
    RESPONSAVEL: 'João Silva',
    PONTOSATENCAO: null,
    ...overrides,
  };
}

function makeHistoricoRecord(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    IDEspaider: 200,
    IDREGISTROPAI: 1001,
    TIPOHISTORICO: 'Requisição criada',
    RESPONSAVEL_PARA: 'Maria',
    RESPONSAVEL_DE: 'João',
    PASSO_PARA: null,
    PASSO_DE: null,
    NUMEROTRAMITE: 1,
    MENSAGEM: null,
    IDENTIFICADOR: 'ID',
    DATA_DE: '10/08/2020 17:12:33',
    ...overrides,
  };
}

function makeChildDataset(
  identificador: string,
  records: Record<string, unknown>[],
  urlPaginacao: string | null = null,
): FilhoDataset {
  return {
    Identificador: identificador,
    ListaRegistros: records,
    URLPaginacao: urlPaginacao,
  };
}

function makeSupabaseMock({
  projectRows = [] as Array<{ id: string; espaider_id: number }>,
  upsertError = null as { message: string; code: string } | null,
  insertError = null as { message: string; code: string } | null,
} = {}) {
  const upsertFn = vi.fn(() => ({ error: upsertError }));
  const insertFn = vi.fn(() => ({ error: insertError }));

  return {
    from: vi.fn((table: string) => {
      if (table === 'integration_sync_quarantine') {
        return { insert: insertFn };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: projectRows }),
        upsert: upsertFn,
      };
    }),
    _upsertFn: upsertFn,
    _insertFn: insertFn,
  };
}

const BASE_PARAMS = {
  tenantId: 'tenant-001',
  requestId: 'req-test-001',
};

// =============================================================================
// Tests
// =============================================================================

beforeEach(() => {
  vi.clearAllMocks();
});

describe('syncV2ChildDatasets — routing', () => {
  it('returns empty result when no child datasets', async () => {
    const supabase = makeSupabaseMock();
    const result = await syncV2ChildDatasets({
      ...BASE_PARAMS,
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      childDatasets: [],
    });
    expect(result.success).toBe(true);
    expect(result.datasets).toHaveLength(0);
  });

  it('routes APROVADORES to project_approvers', async () => {
    const records = [makeAprovadorRecord()];
    const child = makeChildDataset(CHILD_IDENTIFIERS.APROVADORES, records);
    const supabase = makeSupabaseMock({
      projectRows: [{ id: 'proj-uuid-001', espaider_id: 1001 }],
    });

    await syncV2ChildDatasets({
      ...BASE_PARAMS,
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      childDatasets: [child],
    });

    // upsert should be called for project_approvers
    expect(supabase._upsertFn).toHaveBeenCalledTimes(1);
    const rows = supabase._upsertFn.mock.calls[0][0] as Array<Record<string, unknown>>;
    expect(rows[0]).toMatchObject({
      tenant_id: 'tenant-001',
      project_id: 'proj-uuid-001',
      espaider_id: 100,
      type: 'Aprovador',
      responsible: 'João Silva',
    });
  });

  it('routes HISTORICOS to project_histories', async () => {
    const records = [makeHistoricoRecord()];
    const child = makeChildDataset(CHILD_IDENTIFIERS.HISTORICOS, records);
    const supabase = makeSupabaseMock({
      projectRows: [{ id: 'proj-uuid-001', espaider_id: 1001 }],
    });

    const result = await syncV2ChildDatasets({
      ...BASE_PARAMS,
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      childDatasets: [child],
    });

    expect(result.datasets[0].persisted).toBe(1);
    const rows = supabase._upsertFn.mock.calls[0][0] as Array<Record<string, unknown>>;
    expect(rows[0]).toMatchObject({
      type: 'Requisição criada',
      responsible_to: 'Maria',
    });
  });

  it('handles vendor typo TEMPOSPERMANCENCIA (not TEMPOSPERMANENCIA)', async () => {
    const record = {
      IDEspaider: 300,
      IDREGISTROPAI: 1001,
      TOTALMINUTOSDEC: 0,
      TOTALHORASDEC: 0,
      TOTALDIASDEC: 0,
      TIPO: 'Transferência',
      SOLICITACAO_CODIGO: null,
      SITUACAO: null,
      SETOR: null,
      RESPONSAVEL: null,
      IDENTIFICADOR: 'ID',
      DATAINICIO: null,
      DATAFIM: null,
      APROVADOR: null,
    };
    const child = makeChildDataset(CHILD_IDENTIFIERS.TEMPOSPERMANCENCIA, [record]);
    const supabase = makeSupabaseMock({
      projectRows: [{ id: 'proj-uuid-001', espaider_id: 1001 }],
    });

    const result = await syncV2ChildDatasets({
      ...BASE_PARAMS,
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      childDatasets: [child],
    });

    expect(result.datasets[0].dataset).toBe(CHILD_IDENTIFIERS.TEMPOSPERMANCENCIA);
    expect(result.datasets[0].persisted).toBe(1);
  });

  it('logs unknown dataset identifier without crashing', async () => {
    const child = makeChildDataset('UNKNOWN_DATASET', [{ IDEspaider: 1 }]);
    const supabase = makeSupabaseMock();

    const result = await syncV2ChildDatasets({
      ...BASE_PARAMS,
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      childDatasets: [child],
    });

    expect(result.success).toBe(true);
    expect(result.datasets[0].persisted).toBe(0);
    expect(result.logs.some((l) => l.level === 'warn' && l.message.includes('desconhecido'))).toBe(
      true,
    );
  });
});

describe('syncV2ChildDatasets — parent link resolution', () => {
  it('resolves project_id from IDREGISTROPAI via projectIdMap', async () => {
    const child = makeChildDataset(CHILD_IDENTIFIERS.APROVADORES, [
      makeAprovadorRecord({ IDEspaider: 1, IDREGISTROPAI: 2001 }),
      makeAprovadorRecord({ IDEspaider: 2, IDREGISTROPAI: 2002 }),
    ]);
    const supabase = makeSupabaseMock({
      projectRows: [
        { id: 'proj-a', espaider_id: 2001 },
        { id: 'proj-b', espaider_id: 2002 },
      ],
    });

    await syncV2ChildDatasets({
      ...BASE_PARAMS,
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      childDatasets: [child],
    });

    const rows = supabase._upsertFn.mock.calls[0][0] as Array<Record<string, unknown>>;
    const projectIds = rows.map((r) => r['project_id']);
    expect(projectIds).toContain('proj-a');
    expect(projectIds).toContain('proj-b');
  });

  it('counts orphan records when parent project not found', async () => {
    const child = makeChildDataset(CHILD_IDENTIFIERS.APROVADORES, [
      makeAprovadorRecord({ IDEspaider: 1, IDREGISTROPAI: 9999 }),
    ]);
    const supabase = makeSupabaseMock({ projectRows: [] });

    const result = await syncV2ChildDatasets({
      ...BASE_PARAMS,
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      childDatasets: [child],
    });

    expect(result.datasets[0].orphans).toBe(1);
    expect(result.datasets[0].persisted).toBe(0);
    expect(supabase._upsertFn).not.toHaveBeenCalled();
  });

  it('quarantines orphan records', async () => {
    const child = makeChildDataset(CHILD_IDENTIFIERS.APROVADORES, [
      makeAprovadorRecord({ IDEspaider: 1, IDREGISTROPAI: 8888 }),
    ]);
    const supabase = makeSupabaseMock({ projectRows: [] });

    const result = await syncV2ChildDatasets({
      ...BASE_PARAMS,
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      childDatasets: [child],
    });

    expect(result.totalQuarantined).toBe(1);
    expect(supabase._insertFn).toHaveBeenCalledTimes(1);
    const insertedRows = supabase._insertFn.mock.calls[0][0] as Array<Record<string, unknown>>;
    expect(insertedRows[0]).toMatchObject({
      dataset: CHILD_IDENTIFIERS.APROVADORES,
      stage: 'parent-link',
    });
  });
});

describe('syncV2ChildDatasets — validation and quarantine', () => {
  it('quarantines records that fail schema validation', async () => {
    const invalidRecord = { IDEspaider: 'not-a-number', IDREGISTROPAI: 1001 };
    const child = makeChildDataset(CHILD_IDENTIFIERS.APROVADORES, [invalidRecord]);
    const supabase = makeSupabaseMock({
      projectRows: [{ id: 'proj-001', espaider_id: 1001 }],
    });

    const result = await syncV2ChildDatasets({
      ...BASE_PARAMS,
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      childDatasets: [child],
    });

    expect(result.datasets[0].invalid).toBe(1);
    expect(result.datasets[0].persisted).toBe(0);
    expect(result.totalQuarantined).toBe(1);
  });

  it('processes mixed valid/invalid records independently', async () => {
    const valid = makeAprovadorRecord({ IDEspaider: 1 });
    const invalid = { IDEspaider: 'bad', IDREGISTROPAI: 1001 };
    const child = makeChildDataset(CHILD_IDENTIFIERS.APROVADORES, [valid, invalid]);
    const supabase = makeSupabaseMock({
      projectRows: [{ id: 'proj-001', espaider_id: 1001 }],
    });

    const result = await syncV2ChildDatasets({
      ...BASE_PARAMS,
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      childDatasets: [child],
    });

    expect(result.datasets[0].persisted).toBe(1);
    expect(result.datasets[0].invalid).toBe(1);
  });
});

describe('syncV2ChildDatasets — reprocessing idempotency', () => {
  it('uses onConflict tenant_id,espaider_id for upsert', async () => {
    const child = makeChildDataset(CHILD_IDENTIFIERS.APROVADORES, [makeAprovadorRecord()]);
    const supabase = makeSupabaseMock({
      projectRows: [{ id: 'proj-uuid-001', espaider_id: 1001 }],
    });

    await syncV2ChildDatasets({
      ...BASE_PARAMS,
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      childDatasets: [child],
    });

    expect(supabase._upsertFn).toHaveBeenCalledWith(expect.any(Array), {
      onConflict: 'tenant_id,espaider_id',
    });
  });
});
