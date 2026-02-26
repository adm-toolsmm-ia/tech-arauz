import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: vi.fn(),
}));

vi.mock('@/lib/sync/espaider-sync', () => ({
  executeSyncAll: vi.fn(),
}));

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { executeSyncAll } from '@/lib/sync/espaider-sync';
import { POST } from '../route';

function createSupabaseMock(role: 'admin' | 'user') {
  const profileQuery = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: { tenant_id: 'tenant-1', role },
      error: null,
    }),
  };

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-12345678' } },
        error: null,
      }),
    },
    from: vi.fn().mockReturnValue(profileQuery),
  };
}

describe('POST /api/integracoes/sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('executes sync for admin and returns success payload', async () => {
    const supabase = createSupabaseMock('admin');
    const serviceClient = { svc: true };

    vi.mocked(createClient).mockResolvedValue(supabase as any);
    vi.mocked(createServiceClient).mockReturnValue(serviceClient as any);
    vi.mocked(executeSyncAll).mockResolvedValue({
      success: true,
      message: 'ok',
      datasets: [],
      totalCreated: 0,
      totalUpdated: 0,
      totalErrors: 0,
      durationMs: 10,
      logs: [],
    });

    const req = new Request('http://localhost/api/integracoes/sync', { method: 'POST' }) as any;
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(createServiceClient).toHaveBeenCalledTimes(1);
    expect(executeSyncAll).toHaveBeenCalledWith(serviceClient, 'tenant-1');
  });

  it('blocks sync for non-admin user', async () => {
    const supabase = createSupabaseMock('user');

    vi.mocked(createClient).mockResolvedValue(supabase as any);

    const req = new Request('http://localhost/api/integracoes/sync', { method: 'POST' }) as any;
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
    expect(executeSyncAll).not.toHaveBeenCalled();
  });
});

