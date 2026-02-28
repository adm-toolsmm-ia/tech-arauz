import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createLmProviderAction,
  updateLmProviderAction,
  deleteLmProviderAction,
} from '../lm-providers';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));

import { createClient } from '@/lib/supabase/server';
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

function authedUser() {
  mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
}

beforeEach(() => {
  vi.clearAllMocks();
  (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockSupabase);
});

// ─── createLmProviderAction ───────────────────────────────────────────────────

describe('createLmProviderAction', () => {
  const payload = {
    name: 'OpenAI',
    slug: 'openai',
    is_active: true,
    is_system: false,
    api_endpoint: 'https://api.openai.com',
    icon_emoji: '🤖',
    color_hex: '#10a37f',
    description: null,
    docs_url: null,
    api_key_env_var: null,
  };

  it('returns error when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

    const result = await createLmProviderAction(payload);

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/não autenticado/i);
  });

  it('returns error when profile is not found', async () => {
    authedUser();
    mockFrom.mockReturnValue(profileChain(null, { message: 'not found' }));

    const result = await createLmProviderAction(payload);

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/perfil não encontrado/i);
  });

  it('creates provider successfully and revalidates path', async () => {
    authedUser();
    const createdData = { ...payload, id: 'prov-1', tenant_id: 'tenant-1' };

    mockFrom.mockReturnValueOnce(profileChain({ tenant_id: 'tenant-1' })).mockReturnValueOnce({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: createdData, error: null }),
    });

    const result = await createLmProviderAction(payload);

    expect(result.success).toBe(true);
    expect(result.message).toMatch(/openai/i);
    expect(revalidatePath).toHaveBeenCalledWith('/auxiliares/lm-providers');
  });
});

// ─── updateLmProviderAction ───────────────────────────────────────────────────

describe('updateLmProviderAction', () => {
  it('returns error when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

    const result = await updateLmProviderAction('prov-1', { name: 'New Name' });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/não autenticado/i);
  });

  it('blocks update on system provider', async () => {
    authedUser();
    mockFrom.mockReturnValue(profileChain({ is_system: true }));

    const result = await updateLmProviderAction('prov-system', { name: 'Hack' });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/sistema não podem ser editados/i);
  });

  it('updates provider and revalidates path on success', async () => {
    authedUser();
    const updatedData = { id: 'prov-1', name: 'OpenAI v2', is_system: false };

    mockFrom.mockReturnValueOnce(profileChain({ is_system: false })).mockReturnValueOnce({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: updatedData, error: null }),
    });

    const result = await updateLmProviderAction('prov-1', { name: 'OpenAI v2' });

    expect(result.success).toBe(true);
    expect(revalidatePath).toHaveBeenCalledWith('/auxiliares/lm-providers');
  });
});

// ─── deleteLmProviderAction ───────────────────────────────────────────────────

describe('deleteLmProviderAction', () => {
  it('returns error when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

    const result = await deleteLmProviderAction('prov-1');

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/não autenticado/i);
  });

  it('blocks deletion of system provider', async () => {
    authedUser();
    mockFrom.mockReturnValue(profileChain({ name: 'Sistema', is_system: true }));

    const result = await deleteLmProviderAction('prov-system');

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/sistema não podem ser deletados/i);
  });

  it('deletes provider and revalidates path on success', async () => {
    authedUser();
    mockFrom
      .mockReturnValueOnce(profileChain({ name: 'OpenAI', is_system: false }))
      .mockReturnValueOnce({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

    const result = await deleteLmProviderAction('prov-1');

    expect(result.success).toBe(true);
    expect(result.message).toMatch(/openai/i);
    expect(revalidatePath).toHaveBeenCalledWith('/auxiliares/lm-providers');
  });
});
