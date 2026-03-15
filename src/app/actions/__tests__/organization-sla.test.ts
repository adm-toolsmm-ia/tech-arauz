import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createProcessSlaAction,
  updateProcessSlaAction,
  deleteProcessSlaAction,
} from '../organization';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

describe('Process SLA Management - Story 13.1', () => {
  const processId = 'proc-001';
  const tenantId = 'tenant-001';
  const userId = 'user-001';

  function createChainableMock(data: any = null) {
    const chain: any = {
      eq: vi.fn(),
      select: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      insert: vi.fn(),
      single: vi.fn(),
    };

    chain.eq.mockImplementation(() => chain);
    chain.select.mockImplementation(() => chain);
    chain.update.mockImplementation(() => chain);
    chain.delete.mockImplementation(() => chain);
    chain.insert.mockImplementation(() => chain);
    chain.single.mockResolvedValue({ data, error: null });

    return chain;
  }

  const mockSupabase = {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockSupabase);
    (revalidatePath as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: userId } },
      error: null,
    });

    mockSupabase.from.mockImplementation((table: string) => {
      const chain = createChainableMock();
      if (table === 'profiles') {
        chain.single.mockResolvedValue({ data: { tenant_id: tenantId }, error: null });
      }
      return chain;
    });
  });

  it('should create SLA with valid inputs', async () => {
    const mockSla = {
      id: 'sla-001',
      process_id: processId,
      metric_name: 'tempo_conclusão',
      target_duration_days: 5,
      warning_threshold_pct: 75,
      critical_threshold_pct: 95,
      tenant_id: tenantId,
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createChainableMock({ tenant_id: tenantId });
      }
      const chain = createChainableMock(mockSla);
      return chain;
    });

    const result = await createProcessSlaAction(
      processId,
      'tempo_conclusão',
      5,
      75,
      95
    );

    expect(result.success).toBe(true);
    expect(result.message).toContain('sucesso');
    expect(revalidatePath).toHaveBeenCalled();
  });

  it('should reject SLA with invalid target duration', async () => {
    const result = await createProcessSlaAction(processId, 'metric', 0, 75, 95);
    expect(result.success).toBe(false);
    expect(result.message).toContain('maior que 0');
  });

  it('should reject SLA with warning >= critical', async () => {
    const result = await createProcessSlaAction(processId, 'metric', 5, 95, 95);
    expect(result.success).toBe(false);
    expect(result.message).toContain('menor que');
  });

  it('should update SLA with valid changes', async () => {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createChainableMock({ tenant_id: tenantId });
      }
      return createChainableMock({ id: 'sla-001', metric_name: 'updated' });
    });

    const result = await updateProcessSlaAction('sla-001', {
      metricName: 'new_metric',
    });

    expect(result.success).toBe(true);
    expect(revalidatePath).toHaveBeenCalled();
  });

  it('should delete SLA successfully', async () => {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createChainableMock({ tenant_id: tenantId });
      }
      return createChainableMock({ metric_name: 'deleted_sla' });
    });

    const result = await deleteProcessSlaAction('sla-001');

    expect(result.success).toBe(true);
    expect(result.message).toContain('excluído');
    expect(revalidatePath).toHaveBeenCalled();
  });
});
