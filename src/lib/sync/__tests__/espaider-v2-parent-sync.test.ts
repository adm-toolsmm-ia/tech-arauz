/**
 * Tests for Espaider v2 parent dataset sync.
 * Covers: bootstrap, incremental replay, duplicate prevention, mapping.
 * Uses in-memory Supabase mock — no real DB calls.
 * @see Story 19.3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncV2ParentDataset } from '../espaider-v2-sync';

// =============================================================================
// Mock client
// =============================================================================

vi.mock('@/integrations/espaider-v2/client', () => ({
  consultarRegistros: vi.fn(),
}));

vi.mock('@/lib/security/integration-token', () => ({
  decryptIntegrationToken: vi.fn((t: string) => t),
  isEncryptedIntegrationToken: vi.fn(() => false),
}));

import { consultarRegistros } from '@/integrations/espaider-v2/client';

// =============================================================================
// Fixtures
// =============================================================================

function makeParentRecord(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    IDEspaider: 1001,
    TIPOCHAMADO: 'Controle de projetos',
    TIPOASSUNTO: 'TI',
    STATUSPROJETO: 'Em execução',
    SOLUCAOAPLICADAEM: null,
    SOLICITANTE: 'João Silva',
    SITUACAOATUAL: 'Em desenvolvimento',
    RESPONSAVELPROJETO: 'Maria Santos',
    PRIORIDADE: 'Alta',
    PRAZOFINAL: '31/12/2026',
    PRAZOCRONOGRAMAATUAL: null,
    PRAZOAPROVADOR: '30/11/2026',
    PASTACONSULTIVO: { ID: 20000, NumeroCaso: 'CS.12345' },
    OBJETIVO: 'Objetivo teste',
    NOME: 'Projeto Teste',
    MOTIVO_IMPORTANCIAESPECIAL: null,
    MENSAGEM_MOVIMENTACAO: 'Movimentação teste',
    JUSTIFICATIVA: null,
    IMPORTANCIAESPECIAL: 'Não',
    IMPACTOOPERACIONAL: null,
    IMPACTOESTRATEGICO: null,
    ESCOPO: null,
    ENCERRADOEM: null,
    DATAMOVIMENTACAO: '01/05/2026 10:00:00',
    DATAINICIOAPROVACAO: null,
    CRONOGRAMAATUAL: null,
    COMPLEXIDADETECNICA: null,
    CODIGO: 'ESPDR.00001/26',
    CHAMADO_EXTERNO: null,
    ASSUNTOAREA: 'TI',
    APROVADORATUAL: 'Fila TI',
    ...overrides,
  };
}

function makeClientResult(records: Record<string, unknown>[], pagesFetched = 1) {
  return {
    requestId: 'test-req-001',
    parentRecords: records,
    childDatasets: [],
    pagesFetched,
    durationMs: 100,
  };
}

// =============================================================================
// Supabase mock factory
// =============================================================================

function makeSupabaseMock({
  watermark = null,
  existingEspaiderIds = [] as number[],
  upsertError = null as { message: string; code: string } | null,
} = {}) {
  const upsertFn = vi.fn(() => ({ error: upsertError }));
  const selectFn = vi.fn();

  selectFn.mockImplementation(() => {
    const chain = {
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: watermark ? { last_sync_at: watermark } : null,
      }),
      then: undefined as unknown,
    };
    // For the existing IDs query, return the set
    chain.in = vi.fn().mockResolvedValue({
      data: existingEspaiderIds.map((id) => ({ espaider_id: id })),
    });
    return chain;
  });

  const watermarkUpsertFn = vi.fn().mockResolvedValue({ error: null });

  return {
    from: vi.fn((table: string) => {
      if (table === 'espaider_apis') {
        return {
          select: selectFn,
          update: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnThis() }),
          upsert: watermarkUpsertFn,
        };
      }
      // projects table
      return {
        select: selectFn,
        upsert: upsertFn,
      };
    }),
    _upsertFn: upsertFn,
    _selectFn: selectFn,
  };
}

const BASE_CONFIG = {
  baseUrl: 'https://espaider.example.com/WCF/WCFConsultaDados',
  token: 'test-token',
  identificador: 'BI_SOLICITACOES_PROJETOSESPAIDER_v2',
  timeout: 5000,
  retry: { maxAttempts: 1, baseDelay: 0, maxDelay: 0 },
  circuitBreaker: { failureThreshold: 10, windowMs: 60000, resetTimeoutMs: 30000 },
};

// =============================================================================
// Tests
// =============================================================================

beforeEach(() => {
  vi.clearAllMocks();
});

describe('syncV2ParentDataset — bootstrap', () => {
  it('executes full sync when no watermark', async () => {
    const record = makeParentRecord();
    vi.mocked(consultarRegistros).mockResolvedValueOnce(makeClientResult([record]));

    const supabase = makeSupabaseMock({ watermark: null });

    const result = await syncV2ParentDataset({
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      tenantId: 'tenant-001',
      configOverride: BASE_CONFIG,
    });

    expect(result.success).toBe(true);
    expect(result.newRecords).toBe(1);
    expect(result.updatedRecords).toBe(0);

    // consultarRegistros called without dateFilter (bootstrap)
    expect(vi.mocked(consultarRegistros)).toHaveBeenCalledWith(
      expect.objectContaining({ dateFilter: undefined }),
    );
  });

  it('marks fullSync=true skips watermark', async () => {
    const record = makeParentRecord();
    vi.mocked(consultarRegistros).mockResolvedValueOnce(makeClientResult([record]));

    const supabase = makeSupabaseMock({ watermark: '2026-04-01T00:00:00Z' });

    await syncV2ParentDataset({
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      tenantId: 'tenant-001',
      configOverride: BASE_CONFIG,
      fullSync: true,
    });

    expect(vi.mocked(consultarRegistros)).toHaveBeenCalledWith(
      expect.objectContaining({ dateFilter: undefined }),
    );
  });
});

describe('syncV2ParentDataset — incremental', () => {
  it('uses syncWindow when provided', async () => {
    const record = makeParentRecord();
    vi.mocked(consultarRegistros).mockResolvedValueOnce(makeClientResult([record]));

    const supabase = makeSupabaseMock();
    const window = { de: '01/05/2026 00:00:00', ate: '12/05/2026 23:59:59' };

    await syncV2ParentDataset({
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      tenantId: 'tenant-001',
      configOverride: BASE_CONFIG,
      syncWindow: window,
    });

    expect(vi.mocked(consultarRegistros)).toHaveBeenCalledWith(
      expect.objectContaining({ dateFilter: window }),
    );
  });

  it('uses watermark when available for dateFilter', async () => {
    const record = makeParentRecord();
    vi.mocked(consultarRegistros).mockResolvedValueOnce(makeClientResult([record]));

    const supabase = makeSupabaseMock({ watermark: '2026-05-01T10:00:00Z' });

    await syncV2ParentDataset({
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      tenantId: 'tenant-001',
      configOverride: BASE_CONFIG,
    });

    const call = vi.mocked(consultarRegistros).mock.calls[0][0];
    expect(call.dateFilter).toBeDefined();
    expect(call.dateFilter?.de).toBeDefined();
    expect(call.dateFilter?.ate).toBeDefined();
  });
});

describe('syncV2ParentDataset — duplicate prevention', () => {
  it('counts existing records as updated, not new', async () => {
    const record = makeParentRecord({ IDEspaider: 1001 });
    vi.mocked(consultarRegistros).mockResolvedValueOnce(makeClientResult([record]));

    const supabase = makeSupabaseMock({ existingEspaiderIds: [1001] });

    const result = await syncV2ParentDataset({
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      tenantId: 'tenant-001',
      configOverride: BASE_CONFIG,
    });

    expect(result.success).toBe(true);
    expect(result.newRecords).toBe(0);
    expect(result.updatedRecords).toBe(1);
  });

  it('upsert is called with onConflict tenant_id,espaider_id', async () => {
    const record = makeParentRecord();
    vi.mocked(consultarRegistros).mockResolvedValueOnce(makeClientResult([record]));

    const supabase = makeSupabaseMock();

    await syncV2ParentDataset({
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      tenantId: 'tenant-001',
      configOverride: BASE_CONFIG,
    });

    expect(supabase._upsertFn).toHaveBeenCalledWith(expect.any(Array), {
      onConflict: 'tenant_id,espaider_id',
    });
  });
});

describe('syncV2ParentDataset — mapping', () => {
  it('maps PASTACONSULTIVO object to pasta_consultivo + pasta_consultivo_id', async () => {
    const record = makeParentRecord({
      IDEspaider: 1001,
      PASTACONSULTIVO: { ID: 20232, NumeroCaso: 'CS.36482' },
    });
    vi.mocked(consultarRegistros).mockResolvedValueOnce(makeClientResult([record]));

    const supabase = makeSupabaseMock();
    let upsertedRows: unknown[] = [];
    supabase._upsertFn.mockImplementation((rows: unknown[]) => {
      upsertedRows = rows;
      return { error: null };
    });

    await syncV2ParentDataset({
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      tenantId: 'tenant-001',
      configOverride: BASE_CONFIG,
    });

    const row = upsertedRows[0] as Record<string, unknown>;
    expect(row['pasta_consultivo']).toBe('CS.36482');
    expect(row['pasta_consultivo_id']).toBe(20232);
  });

  it('maps null PASTACONSULTIVO gracefully', async () => {
    const record = makeParentRecord({ IDEspaider: 2001, PASTACONSULTIVO: null });
    vi.mocked(consultarRegistros).mockResolvedValueOnce(makeClientResult([record]));

    const supabase = makeSupabaseMock();
    let upsertedRows: unknown[] = [];
    supabase._upsertFn.mockImplementation((rows: unknown[]) => {
      upsertedRows = rows;
      return { error: null };
    });

    await syncV2ParentDataset({
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      tenantId: 'tenant-001',
      configOverride: BASE_CONFIG,
    });

    const row = upsertedRows[0] as Record<string, unknown>;
    expect(row['pasta_consultivo']).toBeNull();
    expect(row['pasta_consultivo_id']).toBeNull();
  });

  it('maps IMPORTANCIAESPECIAL Sim to true', async () => {
    const record = makeParentRecord({ IDEspaider: 3001, IMPORTANCIAESPECIAL: 'Sim' });
    vi.mocked(consultarRegistros).mockResolvedValueOnce(makeClientResult([record]));

    const supabase = makeSupabaseMock();
    let upsertedRows: unknown[] = [];
    supabase._upsertFn.mockImplementation((rows: unknown[]) => {
      upsertedRows = rows;
      return { error: null };
    });

    await syncV2ParentDataset({
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      tenantId: 'tenant-001',
      configOverride: BASE_CONFIG,
    });

    const row = upsertedRows[0] as Record<string, unknown>;
    expect(row['importancia_especial']).toBe(true);
  });
});

describe('syncV2ParentDataset — error handling', () => {
  it('returns success=false when API fetch fails', async () => {
    vi.mocked(consultarRegistros).mockRejectedValueOnce(new Error('Network failure'));

    const supabase = makeSupabaseMock();
    const result = await syncV2ParentDataset({
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      tenantId: 'tenant-001',
      configOverride: BASE_CONFIG,
    });

    expect(result.success).toBe(false);
    expect(result.logs.some((l) => l.level === 'error')).toBe(true);
  });

  it('returns success=false when upsert fails', async () => {
    const record = makeParentRecord();
    vi.mocked(consultarRegistros).mockResolvedValueOnce(makeClientResult([record]));

    const supabase = makeSupabaseMock({
      upsertError: { message: 'DB error', code: '23505' },
    });

    const result = await syncV2ParentDataset({
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      tenantId: 'tenant-001',
      configOverride: BASE_CONFIG,
    });

    expect(result.success).toBe(false);
    expect(result.logs.some((l) => l.level === 'error' && l.message.includes('Upsert'))).toBe(true);
  });

  it('counts invalid records without crashing', async () => {
    const invalidRecord = { IDEspaider: 'not-a-number', NOME: 'Bad' };
    const validRecord = makeParentRecord({ IDEspaider: 9999 });

    vi.mocked(consultarRegistros).mockResolvedValueOnce(
      makeClientResult([invalidRecord, validRecord]),
    );

    const supabase = makeSupabaseMock();
    const result = await syncV2ParentDataset({
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      tenantId: 'tenant-001',
      configOverride: BASE_CONFIG,
    });

    expect(result.success).toBe(true);
    expect(result.invalidRecords).toBe(1);
    expect(result.newRecords).toBe(1);
  });

  it('returns success=true when no records are returned', async () => {
    vi.mocked(consultarRegistros).mockResolvedValueOnce(makeClientResult([]));

    const supabase = makeSupabaseMock();
    const result = await syncV2ParentDataset({
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      tenantId: 'tenant-001',
      configOverride: BASE_CONFIG,
    });

    expect(result.success).toBe(true);
    expect(result.newRecords).toBe(0);
    expect(supabase._upsertFn).not.toHaveBeenCalled();
  });
});
