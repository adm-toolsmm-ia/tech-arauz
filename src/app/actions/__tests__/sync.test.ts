import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncEspaiderAction } from '../sync';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('@/lib/supabase/service', () => ({ createServiceClient: vi.fn() }));
vi.mock('@/lib/sync/espaider-sync', () => ({ executeSyncAll: vi.fn() }));

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { executeSyncAll } from '@/lib/sync/espaider-sync';
import { revalidatePath } from 'next/cache';

const mockFrom = vi.fn();
const mockSupabase = {
  auth: { getUser: vi.fn() },
  from: mockFrom,
};

function profileChain(data: Record<string, unknown> | null, error: unknown = null) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
  };
}

const mockSyncResult = {
  success: true,
  datasets: [],
  totalCreated: 3,
  totalUpdated: 5,
  totalErrors: 0,
  durationMs: 1234,
  message: 'Sync OK',
  logs: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockSupabase);
  (createServiceClient as ReturnType<typeof vi.fn>).mockReturnValue({});
});

// ─── syncEspaiderAction ───────────────────────────────────────────────────────

describe('syncEspaiderAction', () => {
  it('returns error when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

    const result = await syncEspaiderAction();

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/não autenticado/i);
    expect(result.totalErrors).toBe(1);
  });

  it('returns error when profile is not found', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
    mockFrom.mockReturnValue(profileChain(null, { message: 'not found' }));

    const result = await syncEspaiderAction();

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/perfil não encontrado/i);
  });

  it('blocks viewer role from syncing', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
    mockFrom.mockReturnValue(profileChain({ tenant_id: 'tenant-1', role: 'viewer' }));

    const result = await syncEspaiderAction();

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/viewer/i);
  });

  it('handles executeSyncAll exception and returns error', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
    mockFrom.mockReturnValue(profileChain({ tenant_id: 'tenant-1', role: 'admin' }));
    (executeSyncAll as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API timeout'));

    const result = await syncEspaiderAction();

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/timeout/i);
    expect(result.totalErrors).toBe(1);
  });

  it('syncs successfully and revalidates paths', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
    mockFrom.mockReturnValue(profileChain({ tenant_id: 'tenant-1', role: 'admin' }));
    (executeSyncAll as ReturnType<typeof vi.fn>).mockResolvedValue(mockSyncResult);

    const result = await syncEspaiderAction();

    expect(result.success).toBe(true);
    expect(result.totalCreated).toBe(3);
    expect(result.totalUpdated).toBe(5);
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    expect(revalidatePath).toHaveBeenCalledWith('/projetos');
  });
});
