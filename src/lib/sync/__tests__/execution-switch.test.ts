/**
 * Tests for the sync version orchestrator (Story 19.7).
 *
 * Covers:
 * - getApiVersion: reads settings.api_version, defaults to v1
 * - setApiVersion: merges into existing settings
 * - runEspaiderSync: routes to v1 or v2 based on version setting
 * - Rollback: switching back to v1 requires no code changes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getApiVersion, setApiVersion, runEspaiderSync } from '../sync-orchestrator';
import type { ApiVersion } from '../sync-orchestrator';

vi.mock('@/integrations/espaider-v2/config', () => ({
  generateRequestId: vi.fn(() => 'req-orch-test'),
  loadV2Config: vi.fn(),
  maskToken: vi.fn((t: string) => t),
}));

vi.mock('@/lib/security/integration-token', () => ({
  decryptIntegrationToken: vi.fn((t: string) => t),
  isEncryptedIntegrationToken: vi.fn(() => false),
}));

// =============================================================================
// Mock v1 executeSyncAll
// =============================================================================

vi.mock('../espaider-sync', () => ({
  executeSyncAll: vi.fn().mockResolvedValue({
    success: true,
    message: 'v1 sync done',
    totalCreated: 3,
    totalUpdated: 1,
    totalErrors: 0,
    durationMs: 100,
    datasets: [],
  }),
}));

// =============================================================================
// Mock v2 functions
// =============================================================================

vi.mock('../espaider-v2-sync', () => ({
  syncV2ParentDataset: vi.fn().mockResolvedValue({
    success: true,
    newRecords: 5,
    updatedRecords: 2,
    invalidRecords: 0,
    pagesFetched: 1,
    durationMs: 200,
    logs: [],
  }),
  resolveV2Token: vi.fn((t: string) => t),
}));

vi.mock('../espaider-v2-children-sync', () => ({
  syncV2ChildDatasets: vi.fn().mockResolvedValue({
    success: true,
    datasets: [],
    totalQuarantined: 0,
    logs: [],
  }),
}));

vi.mock('../logger-v2', () => ({
  persistV2SyncLogs: vi.fn().mockResolvedValue({
    syncLogId: 'sync-log-001',
    logsPersisted: 0,
    logsFailed: 0,
  }),
}));

// =============================================================================
// Helpers
// =============================================================================

const TENANT_ID = 'tenant-test-001';

function makeSupabaseMock({
  apiVersion = undefined as string | undefined,
  settingsUpdateError = null as { message: string } | null,
  settingsId = 'api-row-uuid-001',
} = {}) {
  const settings = apiVersion !== undefined ? { api_version: apiVersion } : {};

  const updateFn = vi.fn().mockResolvedValue({ error: settingsUpdateError });
  const maybeSingleFn = vi.fn().mockResolvedValue({
    data: { id: settingsId, settings },
    error: null,
  });

  const selectFn = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnThis(),
    maybeSingle: maybeSingleFn,
  });

  return {
    from: vi.fn((table: string) => {
      if (table === 'espaider_apis') {
        return {
          select: selectFn,
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            ...{ mockResolvedValue: updateFn },
          }),
          upsert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      return { select: selectFn };
    }),
    _updateFn: updateFn,
    _selectFn: selectFn,
  };
}

// A minimal supabase mock for setApiVersion that supports the chained update call
function makeUpdateMock({
  currentSettings = {} as Record<string, unknown>,
  settingsId = 'api-row-uuid',
  updateError = null as { message: string } | null,
  notFound = false,
} = {}) {
  const eqChain = vi.fn().mockReturnThis();

  const updateResult = vi.fn().mockResolvedValue({ error: updateError });
  const updateBuilder = { eq: vi.fn(() => updateResult()) };

  return {
    from: vi.fn((table: string) => {
      if (table === 'espaider_apis') {
        return {
          select: vi.fn().mockReturnValue({
            eq: eqChain,
            maybeSingle: vi.fn().mockResolvedValue({
              data: notFound ? null : { id: settingsId, settings: currentSettings },
              error: null,
            }),
          }),
          update: vi.fn().mockReturnValue(updateBuilder),
          upsert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      return {};
    }),
  };
}

// =============================================================================
// Tests: getApiVersion
// =============================================================================

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getApiVersion', () => {
  it('returns v1 when settings has no api_version (safe default)', async () => {
    const supabase = makeSupabaseMock({ apiVersion: undefined });
    const version = await getApiVersion(
      supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      TENANT_ID,
    );
    expect(version).toBe('v1');
  });

  it('returns v2 when settings.api_version is "v2"', async () => {
    const supabase = makeSupabaseMock({ apiVersion: 'v2' });
    const version = await getApiVersion(
      supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      TENANT_ID,
    );
    expect(version).toBe('v2');
  });

  it('returns v1 when settings.api_version is "v1"', async () => {
    const supabase = makeSupabaseMock({ apiVersion: 'v1' });
    const version = await getApiVersion(
      supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      TENANT_ID,
    );
    expect(version).toBe('v1');
  });

  it('returns v1 when no espaider_apis row is found', async () => {
    const supabase = {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
    };
    const version = await getApiVersion(
      supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      TENANT_ID,
    );
    expect(version).toBe('v1');
  });
});

// =============================================================================
// Tests: setApiVersion
// =============================================================================

describe('setApiVersion', () => {
  it('returns error when no projetos row found', async () => {
    const supabase = makeUpdateMock({ notFound: true });
    const result = await setApiVersion(
      supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      TENANT_ID,
      'v2',
    );
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/encontrada/i);
  });

  it('returns success when update succeeds', async () => {
    const supabase = makeUpdateMock({ currentSettings: {} });
    const result = await setApiVersion(
      supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      TENANT_ID,
      'v2',
    );
    expect(result.success).toBe(true);
  });
});

// =============================================================================
// Tests: runEspaiderSync routing
// =============================================================================

describe('runEspaiderSync — routing', () => {
  it('routes to v1 when api_version is v1', async () => {
    const supabase = makeSupabaseMock({ apiVersion: 'v1' });
    const result = await runEspaiderSync(
      supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      TENANT_ID,
    );
    expect(result.version).toBe('v1');
    expect(result.success).toBe(true);
  });

  it('routes to v2 when api_version is v2', async () => {
    const supabase = makeSupabaseMock({ apiVersion: 'v2' });
    const result = await runEspaiderSync(
      supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      TENANT_ID,
    );
    expect(result.version).toBe('v2');
    expect(result.success).toBe(true);
  });

  it('defaults to v1 when no setting is configured', async () => {
    const supabase = makeSupabaseMock({ apiVersion: undefined });
    const result = await runEspaiderSync(
      supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      TENANT_ID,
    );
    expect(result.version).toBe('v1');
  });

  it('includes requestId in the result', async () => {
    const supabase = makeSupabaseMock({ apiVersion: 'v2' });
    const result = await runEspaiderSync(
      supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      TENANT_ID,
    );
    expect(typeof result.requestId).toBe('string');
    expect(result.requestId.length).toBeGreaterThan(0);
  });

  it('v2 result includes sync metrics in details', async () => {
    const supabase = makeSupabaseMock({ apiVersion: 'v2' });
    const result = await runEspaiderSync(
      supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      TENANT_ID,
    );
    expect(result.details).toMatchObject({
      newRecords: 5,
      updatedRecords: 2,
      totalQuarantined: 0,
    });
  });

  it('v1 result includes v1 sync metrics in details', async () => {
    const supabase = makeSupabaseMock({ apiVersion: 'v1' });
    const result = await runEspaiderSync(
      supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
      TENANT_ID,
    );
    expect(result.details).toMatchObject({
      totalCreated: 3,
      totalUpdated: 1,
    });
  });
});

describe('runEspaiderSync — rollback', () => {
  it('switching back to v1 uses v1 path (rollback without code change)', async () => {
    // Simulate: was on v2, now set back to v1
    const versions: ApiVersion[] = ['v2', 'v1'];
    for (const ver of versions) {
      const supabase = makeSupabaseMock({ apiVersion: ver });
      const result = await runEspaiderSync(
        supabase as unknown as import('@supabase/supabase-js').SupabaseClient,
        TENANT_ID,
      );
      expect(result.version).toBe(ver);
    }
  });
});
