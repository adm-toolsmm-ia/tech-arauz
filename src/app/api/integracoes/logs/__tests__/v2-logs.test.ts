/**
 * Tests for v2 frontend-visible logging (Story 19.6).
 *
 * Covers:
 * - persistV2SyncLogs: sync_logs + integration_log_entries persistence
 * - Dataset label mapping (CHILD_IDENTIFIERS → frontend values)
 * - Error resilience: failures in log writes do not throw
 * - API backward compatibility: existing logs route shape preserved
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { persistV2SyncLogs } from '@/lib/sync/logger-v2';
import type { SyncV2ParentResult } from '@/lib/sync/espaider-v2-sync';
import type { SyncChildrenResult } from '@/lib/sync/espaider-v2-children-sync';
import { CHILD_IDENTIFIERS } from '@/integrations/espaider-v2/schemas';

// =============================================================================
// Helpers
// =============================================================================

const REQUEST_ID = 'req-v2-test-001';
const TENANT_ID = 'tenant-v2-test';
const STARTED_AT = new Date('2026-05-12T10:00:00.000Z');

function makeParentResult(overrides: Partial<SyncV2ParentResult> = {}): SyncV2ParentResult {
  return {
    success: true,
    newRecords: 5,
    updatedRecords: 2,
    invalidRecords: 1,
    pagesFetched: 1,
    durationMs: 250,
    logs: [
      { timestamp: STARTED_AT.toISOString(), level: 'info', dataset: 'Projetos-v2', message: 'Sync iniciado' },
      { timestamp: STARTED_AT.toISOString(), level: 'success', dataset: 'Projetos-v2', message: '5 novos, 2 atualizados' },
    ],
    ...overrides,
  };
}

function makeChildrenResult(overrides: Partial<SyncChildrenResult> = {}): SyncChildrenResult {
  return {
    success: true,
    datasets: [],
    totalQuarantined: 2,
    logs: [
      { timestamp: STARTED_AT.toISOString(), level: 'info', dataset: 'Children-v2', message: 'Processando 3 datasets' },
      { timestamp: STARTED_AT.toISOString(), level: 'warn', dataset: CHILD_IDENTIFIERS.APROVADORES, message: '2 registros quarentenados' },
    ],
    ...overrides,
  };
}

function makeSupabaseMock({
  syncLogId = 'sync-log-uuid-001',
  syncLogError = null as { message: string } | null,
  logInsertError = null as { message: string } | null,
  syncLogThrows = false,
  logInsertThrows = false,
} = {}) {
  const syncLogInsertFn = vi.fn(() => {
    if (syncLogThrows) throw new Error('sync_logs DB error');
    return {
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: syncLogError ? null : { id: syncLogId },
        error: syncLogError,
      }),
    };
  });

  const logInsertFn = vi.fn(() => {
    if (logInsertThrows) throw new Error('log_entries DB error');
    return Promise.resolve({ error: logInsertError });
  });

  return {
    from: vi.fn((table: string) => {
      if (table === 'sync_logs') return { insert: syncLogInsertFn };
      if (table === 'integration_log_entries') return { insert: logInsertFn };
      throw new Error(`Unexpected table: ${table}`);
    }),
    _syncLogInsertFn: syncLogInsertFn,
    _logInsertFn: logInsertFn,
  };
}

// =============================================================================
// Tests
// =============================================================================

beforeEach(() => {
  vi.clearAllMocks();
});

describe('persistV2SyncLogs — sync_logs write', () => {
  it('writes a sync_logs entry with correct dataset and status on success', async () => {
    const supabase = makeSupabaseMock();
    await persistV2SyncLogs({
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      tenantId: TENANT_ID,
      requestId: REQUEST_ID,
      startedAt: STARTED_AT,
      parentResult: makeParentResult({ invalidRecords: 0 }),
    });

    expect(supabase._syncLogInsertFn).toHaveBeenCalledTimes(1);
    const insertedRow = supabase._syncLogInsertFn.mock.calls[0][0] as Record<string, unknown>;
    expect(insertedRow).toMatchObject({
      tenant_id: TENANT_ID,
      request_id: REQUEST_ID,
      dataset: 'Projetos-v2',
      status: 'success',
      new_records: 5,
      updated_records: 2,
      errors: 0,
    });
  });

  it('sets status to partial when there are invalid/quarantined records', async () => {
    const supabase = makeSupabaseMock();
    await persistV2SyncLogs({
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      tenantId: TENANT_ID,
      requestId: REQUEST_ID,
      startedAt: STARTED_AT,
      parentResult: makeParentResult({ invalidRecords: 3 }),
    });

    const insertedRow = supabase._syncLogInsertFn.mock.calls[0][0] as Record<string, unknown>;
    expect(insertedRow['status']).toBe('partial');
    expect(insertedRow['errors']).toBe(3);
    expect(insertedRow['error_message']).toMatch(/3 registros/);
  });

  it('sets status to failed when parentResult.success is false', async () => {
    const supabase = makeSupabaseMock();
    await persistV2SyncLogs({
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      tenantId: TENANT_ID,
      requestId: REQUEST_ID,
      startedAt: STARTED_AT,
      parentResult: makeParentResult({ success: false }),
    });

    const insertedRow = supabase._syncLogInsertFn.mock.calls[0][0] as Record<string, unknown>;
    expect(insertedRow['status']).toBe('failed');
  });

  it('does not throw when sync_logs write fails', async () => {
    const supabase = makeSupabaseMock({ syncLogThrows: true });
    await expect(
      persistV2SyncLogs({
        supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
        tenantId: TENANT_ID,
        requestId: REQUEST_ID,
        startedAt: STARTED_AT,
        parentResult: makeParentResult(),
      }),
    ).resolves.not.toThrow();
  });
});

describe('persistV2SyncLogs — integration_log_entries write', () => {
  it('writes all parent + children logs to integration_log_entries', async () => {
    const supabase = makeSupabaseMock();
    const result = await persistV2SyncLogs({
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      tenantId: TENANT_ID,
      requestId: REQUEST_ID,
      startedAt: STARTED_AT,
      parentResult: makeParentResult(),
      childrenResult: makeChildrenResult(),
    });

    // Parent has 2 logs, children have 2 logs = 4 total
    expect(result.logsPersisted).toBe(4);
    expect(result.logsFailed).toBe(0);
  });

  it('maps Children-v2 dataset label to Geral-v2', async () => {
    const supabase = makeSupabaseMock();
    await persistV2SyncLogs({
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      tenantId: TENANT_ID,
      requestId: REQUEST_ID,
      startedAt: STARTED_AT,
      childrenResult: makeChildrenResult(),
    });

    const insertedRows = supabase._logInsertFn.mock.calls[0][0] as Array<Record<string, unknown>>;
    const datasets = insertedRows.map((r) => r['dataset']);
    expect(datasets).toContain('Geral-v2');
  });

  it('maps APROVADORES child identifier to Aprovadores-v2', async () => {
    const supabase = makeSupabaseMock();
    await persistV2SyncLogs({
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      tenantId: TENANT_ID,
      requestId: REQUEST_ID,
      startedAt: STARTED_AT,
      childrenResult: makeChildrenResult(),
    });

    const insertedRows = supabase._logInsertFn.mock.calls[0][0] as Array<Record<string, unknown>>;
    const datasets = insertedRows.map((r) => r['dataset']);
    expect(datasets).toContain('Aprovadores-v2');
  });

  it('maps TEMPOSPERMANCENCIA (vendor typo) to TempoPermanencia-v2', async () => {
    const supabase = makeSupabaseMock();
    await persistV2SyncLogs({
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      tenantId: TENANT_ID,
      requestId: REQUEST_ID,
      startedAt: STARTED_AT,
      childrenResult: {
        success: true,
        datasets: [],
        totalQuarantined: 0,
        logs: [
          {
            timestamp: STARTED_AT.toISOString(),
            level: 'info',
            dataset: CHILD_IDENTIFIERS.TEMPOSPERMANCENCIA,
            message: '1 registro persistido',
          },
        ],
      },
    });

    const insertedRows = supabase._logInsertFn.mock.calls[0][0] as Array<Record<string, unknown>>;
    expect(insertedRows[0]['dataset']).toBe('TempoPermanencia-v2');
  });

  it('includes sync_log_id in log entries when sync_logs write succeeds', async () => {
    const supabase = makeSupabaseMock({ syncLogId: 'sync-log-abc' });
    const result = await persistV2SyncLogs({
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      tenantId: TENANT_ID,
      requestId: REQUEST_ID,
      startedAt: STARTED_AT,
      parentResult: makeParentResult(),
    });

    expect(result.syncLogId).toBe('sync-log-abc');
    const insertedRows = supabase._logInsertFn.mock.calls[0][0] as Array<Record<string, unknown>>;
    expect(insertedRows[0]['sync_log_id']).toBe('sync-log-abc');
  });

  it('does not throw when log_entries insert fails', async () => {
    const supabase = makeSupabaseMock({ logInsertThrows: true });
    const result = await persistV2SyncLogs({
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      tenantId: TENANT_ID,
      requestId: REQUEST_ID,
      startedAt: STARTED_AT,
      parentResult: makeParentResult(),
    });

    expect(result.logsPersisted).toBe(0);
    expect(result.logsFailed).toBe(2);
  });

  it('returns logsPersisted=0 logsFailed=0 when no logs exist', async () => {
    const supabase = makeSupabaseMock();
    const result = await persistV2SyncLogs({
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      tenantId: TENANT_ID,
      requestId: REQUEST_ID,
      startedAt: STARTED_AT,
    });

    expect(result.logsPersisted).toBe(0);
    expect(result.logsFailed).toBe(0);
    expect(supabase._logInsertFn).not.toHaveBeenCalled();
  });
});

describe('persistV2SyncLogs — backward compatibility', () => {
  it('uses tenant_id and request_id consistent with v1 log reader expectations', async () => {
    const supabase = makeSupabaseMock();
    await persistV2SyncLogs({
      supabase: supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      tenantId: TENANT_ID,
      requestId: REQUEST_ID,
      startedAt: STARTED_AT,
      parentResult: makeParentResult(),
    });

    const logRows = supabase._logInsertFn.mock.calls[0][0] as Array<Record<string, unknown>>;
    logRows.forEach((row) => {
      expect(row['tenant_id']).toBe(TENANT_ID);
      expect(row['request_id']).toBe(REQUEST_ID);
      expect(row['level']).toMatch(/^(info|warn|error|success)$/);
      expect(typeof row['logged_at']).toBe('string');
    });
  });
});
