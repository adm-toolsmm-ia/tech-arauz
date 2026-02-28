import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { createClient } from '@/lib/supabase/server';
import { GET, POST } from '../route';

function createSupabaseMock({
  role = 'admin',
  hasUser = true,
  hasSession = true,
}: {
  role?: 'admin' | 'user' | 'viewer';
  hasUser?: boolean;
  hasSession?: boolean;
}) {
  const profileQuery = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { role }, error: null }),
  };

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: hasUser ? { id: 'user-1' } : null },
      }),
      getSession: vi.fn().mockResolvedValue({
        data: { session: hasSession ? { access_token: 'jwt-token' } : null },
      }),
    },
    from: vi.fn().mockReturnValue(profileQuery),
  };
}

describe('/api/agents proxy route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    vi.mocked(createClient).mockResolvedValue(createSupabaseMock({ hasUser: false }) as any);

    const res = await GET(new Request('http://localhost/api/agents'));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 403 when role is viewer', async () => {
    vi.mocked(createClient).mockResolvedValue(createSupabaseMock({ role: 'viewer' }) as any);

    const res = await GET(new Request('http://localhost/api/agents'));
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toBe('Forbidden');
  });

  it('proxies GET with bearer token for authorized users', async () => {
    vi.mocked(createClient).mockResolvedValue(createSupabaseMock({ role: 'admin' }) as any);

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ agents: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await GET(new Request('http://localhost/api/agents?page=1'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ agents: [] });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/api/agents/v2');
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer jwt-token');
  });

  it('proxies POST with bearer token and payload for authorized users', async () => {
    vi.mocked(createClient).mockResolvedValue(createSupabaseMock({ role: 'admin' }) as any);

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'agent-1' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const payload = { name: 'Agent 1' };
    const res = await POST(
      new Request('http://localhost/api/agents', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ id: 'agent-1' });
    expect(fetchMock.mock.calls[0][1].method).toBe('POST');
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer jwt-token');
    expect(fetchMock.mock.calls[0][1].body).toBe(JSON.stringify(payload));
  });
});
