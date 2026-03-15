import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  addActivitySystemAction,
  removeActivitySystemAction,
  getActivitySystemsAction,
  getProcessSLAsAction,
  getProcessMetricsAction,
} from '../organization';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Server Action Tests - Stories 11.8 & 11.9
 *
 * Story 11.8: Activity-System Actions
 * - addActivitySystemAction: Insert into org_activity_systems junction
 * - removeActivitySystemAction: Delete from junction
 * - getActivitySystemsAction: Query relationships
 *
 * Story 11.9: Process Metrics Actions
 * - getProcessSLAsAction: Query SLA definitions
 * - getProcessMetricsAction: Query metrics with date range
 *
 * All tests cover:
 * - RLS tenant isolation
 * - Error handling
 * - Proper data transformation
 */

describe('Activity-System & Metrics Server Actions', () => {
  const activityId = 'act-001';
  const systemId = 'sys-001';
  const processId = 'proc-001';
  const tenantId = 'tenant-001';
  const userId = 'user-001';
  const usageContext = 'Sincronização de dados';

  // Create a chainable mock that returns itself for all method calls and resolves properly
  function createChainableMock(resolveData: any = []) {
    const chain: any = {
      eq: vi.fn(),
      select: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      insert: vi.fn(),
      single: vi.fn(),
      order: vi.fn(),
      gte: vi.fn(),
      lte: vi.fn(),
    };

    // Make all methods return the chain itself for chaining
    chain.eq.mockImplementation(() => chain);
    chain.select.mockImplementation(() => chain);
    chain.update.mockImplementation(() => chain);
    chain.delete.mockImplementation(() => chain);
    chain.insert.mockImplementation(() => chain);
    chain.gte.mockImplementation(() => chain);
    chain.lte.mockImplementation(() => chain);
    chain.single.mockImplementation(() => Promise.resolve({ data: resolveData, error: null }));
    chain.order.mockImplementation(() => Promise.resolve({ data: resolveData, error: null }));

    // Make the chain itself awaitable (for direct await chains at the end of query)
    chain.then = function(resolve: any, reject: any) {
      return Promise.resolve({ data: resolveData, error: null }).then(resolve, reject);
    };

    return chain;
  }

  const mockSupabase = {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockSupabase);

    // Default: successful auth
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: userId } },
      error: null,
    });

    // Default: successful chain behavior
    mockSupabase.from.mockImplementation((table: string) => {
      const chain = createChainableMock();
      if (table === 'profiles') {
        chain.single.mockResolvedValue({
          data: { tenant_id: tenantId },
          error: null,
        });
      } else {
        chain.single.mockResolvedValue({
          data: [],
          error: null,
        });
      }
      return chain;
    });
  });

  describe('addActivitySystemAction', () => {
    it('should add system to activity with usage context', async () => {
      let capturedChain: any;
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createChainableMock({ tenant_id: tenantId });
        } else {
          capturedChain = createChainableMock(null);
          capturedChain.insert.mockResolvedValue({ data: null, error: null });
          return capturedChain;
        }
      });

      const result = await addActivitySystemAction(activityId, systemId, usageContext);

      expect(result.success).toBe(true);
      // Verify insert was called with the correct payload
      expect(capturedChain.insert).toHaveBeenCalledWith({
        activity_id: activityId,
        system_id: systemId,
        tenant_id: tenantId,
        usage_context: usageContext,
      });
      expect(revalidatePath).toHaveBeenCalledWith('/organizacao');
    });

    it('should handle missing usage context (optional field)', async () => {
      let capturedChain: any;
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createChainableMock({ tenant_id: tenantId });
        } else {
          capturedChain = createChainableMock(null);
          capturedChain.insert.mockResolvedValue({ data: null, error: null });
          return capturedChain;
        }
      });

      const result = await addActivitySystemAction(activityId, systemId);

      expect(result.success).toBe(true);
      expect(capturedChain.insert).toHaveBeenCalledWith({
        activity_id: activityId,
        system_id: systemId,
        tenant_id: tenantId,
        usage_context: null,
      });
    });

    it('should enforce tenant isolation on insert', async () => {
      let capturedChain: any;
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createChainableMock({ tenant_id: tenantId });
        } else {
          capturedChain = createChainableMock(null);
          capturedChain.insert.mockResolvedValue({ data: null, error: null });
          return capturedChain;
        }
      });

      await addActivitySystemAction(activityId, systemId, usageContext);

      // Verify tenant_id is included in insert payload
      expect(capturedChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          tenant_id: tenantId,
        })
      );
    });

    it('should return error when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const result = await addActivitySystemAction(activityId, systemId, usageContext);

      expect(result.success).toBe(false);
      expect(result.message).toContain('não autenticado');
    });

    it('should handle database error on insert', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createChainableMock();
        if (table === 'profiles') {
          chain.single.mockResolvedValue({
            data: { tenant_id: tenantId },
            error: null,
          });
        } else {
          chain.insert.mockResolvedValue({
            data: null,
            error: { message: 'Unique constraint violated' },
          });
        }
        return chain;
      });

      const result = await addActivitySystemAction(activityId, systemId, usageContext);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Erro ao adicionar');
    });
  });

  describe('removeActivitySystemAction', () => {
    it('should remove system from activity', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createChainableMock({ tenant_id: tenantId });
        } else {
          return createChainableMock(null);
        }
      });

      const result = await removeActivitySystemAction(activityId, systemId);

      expect(result.success).toBe(true);
      expect(revalidatePath).toHaveBeenCalledWith('/organizacao');
    });

    it('should enforce tenant isolation on delete', async () => {
      let capturedChain: any;
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createChainableMock({ tenant_id: tenantId });
        } else {
          capturedChain = createChainableMock(null);
          return capturedChain;
        }
      });

      await removeActivitySystemAction(activityId, systemId);

      // Verify tenant_id filter is included in the captured chain
      expect(capturedChain.eq).toHaveBeenCalledWith('tenant_id', tenantId);
    });

    it('should handle database error on delete', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createChainableMock({ tenant_id: tenantId });
        } else {
          // Create chain that resolves with an error
          const errorData = { data: null, error: { message: 'Delete error' } };
          const chain: any = {
            eq: vi.fn(),
            select: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            insert: vi.fn(),
            single: vi.fn(),
            order: vi.fn(),
            gte: vi.fn(),
            lte: vi.fn(),
          };

          // Make all methods return the chain itself for chaining
          chain.eq.mockImplementation(() => chain);
          chain.select.mockImplementation(() => chain);
          chain.update.mockImplementation(() => chain);
          chain.delete.mockImplementation(() => chain);
          chain.insert.mockImplementation(() => chain);
          chain.gte.mockImplementation(() => chain);
          chain.lte.mockImplementation(() => chain);
          chain.single.mockImplementation(() => Promise.resolve(errorData));
          chain.order.mockImplementation(() => Promise.resolve(errorData));

          // Make the chain itself awaitable with error
          chain.then = function(resolve: any, reject: any) {
            return Promise.resolve(errorData).then(resolve, reject);
          };

          return chain;
        }
      });

      const result = await removeActivitySystemAction(activityId, systemId);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Erro ao remover');
    });
  });

  describe('getActivitySystemsAction', () => {
    it('should retrieve all systems for activity', async () => {
      const mockData = [
        { system_id: systemId, usage_context: usageContext, org_systems: { id: systemId, name: 'System 1' } },
      ];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createChainableMock({ tenant_id: tenantId });
        } else {
          return createChainableMock(mockData);
        }
      });

      const result = await getActivitySystemsAction(activityId);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toEqual(mockData);
    });

    it('should respect tenant isolation on read', async () => {
      let capturedChain: any;
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createChainableMock({ tenant_id: tenantId });
        } else {
          capturedChain = createChainableMock([]);
          return capturedChain;
        }
      });

      await getActivitySystemsAction(activityId);

      // Verify tenant_id filter is applied in the captured chain
      expect(capturedChain.eq).toHaveBeenCalledWith('tenant_id', tenantId);
    });

    it('should handle empty result', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createChainableMock({ tenant_id: tenantId });
        } else {
          return createChainableMock([]);
        }
      });

      const result = await getActivitySystemsAction(activityId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

  });
});

describe('Process Metrics Server Actions', () => {
  const processId = 'proc-001';
  const tenantId = 'tenant-001';
  const userId = 'user-001';
  const periodStart = '2026-03-01T00:00:00Z';
  const periodEnd = '2026-03-31T23:59:59Z';

  // Create a chainable mock that returns itself for all method calls and resolves properly
  function createChainableMock(resolveData: any = []) {
    const chain: any = {
      eq: vi.fn(),
      select: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      insert: vi.fn(),
      single: vi.fn(),
      order: vi.fn(),
      gte: vi.fn(),
      lte: vi.fn(),
    };

    // Make all methods return the chain itself for chaining
    chain.eq.mockImplementation(() => chain);
    chain.select.mockImplementation(() => chain);
    chain.update.mockImplementation(() => chain);
    chain.delete.mockImplementation(() => chain);
    chain.insert.mockImplementation(() => chain);
    chain.gte.mockImplementation(() => chain);
    chain.lte.mockImplementation(() => chain);
    chain.single.mockImplementation(() => Promise.resolve({ data: resolveData, error: null }));
    chain.order.mockImplementation(() => Promise.resolve({ data: resolveData, error: null }));

    // Make the chain itself awaitable (for direct await chains at the end of query)
    chain.then = function(resolve: any, reject: any) {
      return Promise.resolve({ data: resolveData, error: null }).then(resolve, reject);
    };

    return chain;
  }

  const mockSupabase = {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockSupabase);

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: userId } },
      error: null,
    });

    mockSupabase.from.mockImplementation((table: string) => {
      const chain = createChainableMock();
      if (table === 'profiles') {
        chain.single.mockResolvedValue({
          data: { tenant_id: tenantId },
          error: null,
        });
      } else {
        chain.single.mockResolvedValue({
          data: [],
          error: null,
        });
      }
      return chain;
    });
  });

  describe('getProcessSLAsAction', () => {
    it('should retrieve SLA definitions', async () => {
      const mockSLAs = [
        { id: 'sla-1', process_id: processId, metric_name: 'completion_time', target_duration_days: 5 },
      ];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          const chain = createChainableMock({ tenant_id: tenantId });
          return chain;
        } else {
          return createChainableMock(mockSLAs);
        }
      });

      const result = await getProcessSLAsAction(processId);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toEqual(mockSLAs);
    });

    it('should include SLA fields in results', async () => {
      const mockSLA = {
        id: 'sla-1',
        process_id: processId,
        metric_name: 'completion_time',
        target_duration_days: 5,
        warning_threshold_pct: 80,
        critical_threshold_pct: 95,
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createChainableMock({ tenant_id: tenantId });
        } else {
          return createChainableMock([mockSLA]);
        }
      });

      const result = await getProcessSLAsAction(processId);

      expect(result.data?.[0]).toHaveProperty('target_duration_days');
      expect(result.data?.[0]).toHaveProperty('warning_threshold_pct');
      expect(result.data?.[0]).toHaveProperty('critical_threshold_pct');
    });

    it('should respect tenant isolation', async () => {
      let capturedChain: any;
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createChainableMock({ tenant_id: tenantId });
        } else {
          capturedChain = createChainableMock([]);
          return capturedChain;
        }
      });

      await getProcessSLAsAction(processId);

      // Verify tenant_id filter is applied in the captured chain
      expect(capturedChain.eq).toHaveBeenCalledWith('tenant_id', tenantId);
    });

    it('should return error when user not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const result = await getProcessSLAsAction(processId);

      expect(result.success).toBe(false);
      expect(result.message).toContain('não autenticado');
    });
  });

  describe('getProcessMetricsAction', () => {
    it('should retrieve metrics for period', async () => {
      const mockMetrics = [
        { id: 'm-1', process_id: processId, metric_name: 'completion_time', avg_duration_days: 3 },
      ];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createChainableMock({ tenant_id: tenantId });
        } else {
          return createChainableMock(mockMetrics);
        }
      });

      const result = await getProcessMetricsAction(processId, periodStart, periodEnd);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should filter by date range correctly', async () => {
      let capturedChain: any;
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createChainableMock({ tenant_id: tenantId });
        } else {
          capturedChain = createChainableMock([]);
          return capturedChain;
        }
      });

      await getProcessMetricsAction(processId, periodStart, periodEnd);

      // Verify date range filters are applied in the captured chain
      expect(capturedChain.gte).toHaveBeenCalledWith('period_start', periodStart);
      expect(capturedChain.lte).toHaveBeenCalledWith('period_end', periodEnd);
    });

    it('should include required fields in metrics', async () => {
      const mockMetric = {
        id: 'm-1',
        process_id: processId,
        metric_name: 'completion_time',
        period_start: periodStart,
        period_end: periodEnd,
        avg_duration_days: 3,
        compliance_pct: 95,
        instances_count: 10,
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createChainableMock({ tenant_id: tenantId });
        } else {
          return createChainableMock([mockMetric]);
        }
      });

      const result = await getProcessMetricsAction(processId, periodStart, periodEnd);

      expect(result.data?.[0]).toHaveProperty('avg_duration_days');
      expect(result.data?.[0]).toHaveProperty('compliance_pct');
      expect(result.data?.[0]).toHaveProperty('instances_count');
    });

    it('should return empty array for period with no data', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createChainableMock({ tenant_id: tenantId });
        } else {
          return createChainableMock([]);
        }
      });

      const result = await getProcessMetricsAction(processId, periodStart, periodEnd);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should handle database error', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return createChainableMock({ tenant_id: tenantId });
        } else {
          const chain = createChainableMock(null);
          chain.order = vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Query error' },
          });
          return chain;
        }
      });

      const result = await getProcessMetricsAction(processId, periodStart, periodEnd);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Erro ao buscar');
    });
  });
});
