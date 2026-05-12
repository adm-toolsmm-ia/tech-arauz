/**
 * Tests for the quarantine service (Story 19.5).
 * Covers: writeQuarantine, quarantineRecord, formatValidationReason.
 * Key invariant: quarantine failures must NEVER throw or halt the sync run.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { writeQuarantine, quarantineRecord, formatValidationReason } from '../quarantine';
import type { QuarantineEntry } from '../quarantine';

// =============================================================================
// Helpers
// =============================================================================

function makeEntry(overrides: Partial<QuarantineEntry> = {}): QuarantineEntry {
  return {
    tenantId: 'tenant-001',
    requestId: 'req-test-001',
    dataset: 'APROVADORES',
    stage: 'validation',
    rawPayload: { IDEspaider: 1, IDREGISTROPAI: 100 },
    reason: 'IDEspaider must be a number',
    ...overrides,
  };
}

function makeSupabaseMock({
  insertError = null as { message: string } | null,
  shouldThrow = false,
} = {}) {
  const insertFn = vi.fn(() => {
    if (shouldThrow) throw new Error('Network failure');
    return { error: insertError };
  });

  return {
    from: vi.fn((table: string) => {
      if (table === 'integration_sync_quarantine') {
        return { insert: insertFn };
      }
      throw new Error(`Unexpected table: ${table}`);
    }),
    _insertFn: insertFn,
  };
}

// =============================================================================
// Tests
// =============================================================================

beforeEach(() => {
  vi.clearAllMocks();
});

describe('writeQuarantine — persistence', () => {
  it('returns no-op result when entries array is empty', async () => {
    const supabase = makeSupabaseMock();
    const result = await writeQuarantine(
      supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      [],
    );
    expect(result.quarantined).toBe(0);
    expect(result.failed).toBe(0);
    expect(supabase._insertFn).not.toHaveBeenCalled();
  });

  it('inserts entries with correct column mapping', async () => {
    const supabase = makeSupabaseMock();
    const entry = makeEntry({
      tenantId: 'tenant-abc',
      requestId: 'req-xyz',
      dataset: 'HISTORICOS',
      stage: 'parent-link',
      rawPayload: { raw: 'data' },
      reason: 'Parent not found',
    });

    await writeQuarantine(
      supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      [entry],
    );

    expect(supabase._insertFn).toHaveBeenCalledTimes(1);
    const rows = supabase._insertFn.mock.calls[0][0] as Array<Record<string, unknown>>;
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      tenant_id: 'tenant-abc',
      request_id: 'req-xyz',
      dataset: 'HISTORICOS',
      stage: 'parent-link',
      raw_payload: { raw: 'data' },
      reason: 'Parent not found',
    });
  });

  it('inserts multiple entries in a single batch call', async () => {
    const supabase = makeSupabaseMock();
    const entries = [makeEntry(), makeEntry({ dataset: 'CRONOGRAMAS', stage: 'mapping' })];

    const result = await writeQuarantine(
      supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      entries,
    );

    expect(supabase._insertFn).toHaveBeenCalledTimes(1);
    const rows = supabase._insertFn.mock.calls[0][0] as Array<Record<string, unknown>>;
    expect(rows).toHaveLength(2);
    expect(result.quarantined).toBe(2);
    expect(result.failed).toBe(0);
  });

  it('returns quarantined count on success', async () => {
    const supabase = makeSupabaseMock();
    const result = await writeQuarantine(
      supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      [makeEntry(), makeEntry()],
    );
    expect(result.quarantined).toBe(2);
    expect(result.failed).toBe(0);
  });
});

describe('writeQuarantine — error resilience', () => {
  it('returns failed count when DB insert errors — does NOT throw', async () => {
    const supabase = makeSupabaseMock({ insertError: { message: 'DB constraint violation' } });
    const entries = [makeEntry(), makeEntry()];

    const result = await writeQuarantine(
      supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      entries,
    );

    expect(result.quarantined).toBe(0);
    expect(result.failed).toBe(2);
  });

  it('returns failed count when supabase throws — does NOT throw', async () => {
    const supabase = makeSupabaseMock({ shouldThrow: true });
    const entries = [makeEntry()];

    const result = await writeQuarantine(
      supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      entries,
    );

    expect(result.quarantined).toBe(0);
    expect(result.failed).toBe(1);
  });

  it('never propagates errors from supabase client', async () => {
    const supabase = makeSupabaseMock({ shouldThrow: true });

    await expect(
      writeQuarantine(
        supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
        [makeEntry()],
      ),
    ).resolves.not.toThrow();
  });
});

describe('quarantineRecord — single entry convenience', () => {
  it('inserts a single entry correctly', async () => {
    const supabase = makeSupabaseMock();
    const entry = makeEntry({ stage: 'persistence' });

    await quarantineRecord(
      supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      entry,
    );

    expect(supabase._insertFn).toHaveBeenCalledTimes(1);
    const rows = supabase._insertFn.mock.calls[0][0] as Array<Record<string, unknown>>;
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ stage: 'persistence' });
  });

  it('does not throw on DB error', async () => {
    const supabase = makeSupabaseMock({ shouldThrow: true });

    await expect(
      quarantineRecord(
        supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
        makeEntry(),
      ),
    ).resolves.toBeUndefined();
  });
});

describe('formatValidationReason', () => {
  it('formats single error', () => {
    const result = formatValidationReason([{ path: 'IDEspaider', message: 'Expected number' }]);
    expect(result).toBe('IDEspaider: Expected number');
  });

  it('formats multiple errors separated by semicolon', () => {
    const result = formatValidationReason([
      { path: 'IDEspaider', message: 'Expected number' },
      { path: 'TIPO', message: 'Required' },
    ]);
    expect(result).toBe('IDEspaider: Expected number; TIPO: Required');
  });

  it('uses root as path when path is empty', () => {
    const result = formatValidationReason([{ path: '', message: 'Invalid record' }]);
    expect(result).toBe('root: Invalid record');
  });

  it('returns empty string for empty errors array', () => {
    const result = formatValidationReason([]);
    expect(result).toBe('');
  });
});
