import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    fetchProjectsWithFiltersAction,
    updateProjectStatusAction,
    updateProjectNotesAction,
} from '../projects';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockIn = vi.fn();
const mockOr = vi.fn();
const mockOrder = vi.fn();
const mockUpdate = vi.fn();

function buildChain(overrides: Record<string, unknown> = {}) {
    const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: mockSingle,
        in: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        ...overrides,
    };
    return chain;
}

const mockSupabase = {
    auth: { getUser: vi.fn() },
    from: mockFrom,
};

beforeEach(() => {
    vi.clearAllMocks();
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockSupabase);
});

// ─── fetchProjectsWithFiltersAction ──────────────────────────────────────────

describe('fetchProjectsWithFiltersAction', () => {
    it('returns error when user is not authenticated', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

        const result = await fetchProjectsWithFiltersAction();

        expect(result.success).toBe(false);
        expect(result.message).toMatch(/não autenticado/i);
    });

    it('returns error when profile is not found', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
        const chain = buildChain({ single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }) });
        mockFrom.mockReturnValue(chain);

        const result = await fetchProjectsWithFiltersAction();

        expect(result.success).toBe(false);
        expect(result.message).toMatch(/perfil não encontrado/i);
    });

    it('returns projects without filters', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });

        const profileChain = buildChain({
            single: vi.fn().mockResolvedValue({ data: { tenant_id: 'tenant-1' }, error: null }),
        });
        const projectsChain = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: [{ id: 'p1' }, { id: 'p2' }], error: null }),
        };

        mockFrom
            .mockReturnValueOnce(profileChain)
            .mockReturnValueOnce(projectsChain);

        const result = await fetchProjectsWithFiltersAction();

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);
    });

    it('returns database error when query fails', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });

        const profileChain = buildChain({
            single: vi.fn().mockResolvedValue({ data: { tenant_id: 'tenant-1' }, error: null }),
        });
        const projectsChain = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: null, error: { message: 'db error' } }),
        };

        mockFrom
            .mockReturnValueOnce(profileChain)
            .mockReturnValueOnce(projectsChain);

        const result = await fetchProjectsWithFiltersAction();

        expect(result.success).toBe(false);
        expect(result.message).toMatch(/db error/);
    });
});

// ─── updateProjectStatusAction ────────────────────────────────────────────────

describe('updateProjectStatusAction', () => {
    const VALID_PROJECT_ID = 'proj-123';
    const VALID_STATUS = 'em_desenvolvimento';

    it('returns error when user is not authenticated', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

        const result = await updateProjectStatusAction(VALID_PROJECT_ID, VALID_STATUS);

        expect(result.success).toBe(false);
        expect(result.message).toMatch(/não autenticado/i);
    });

    it('blocks viewer role from updating status', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
        const chain = buildChain({
            single: vi.fn().mockResolvedValue({ data: { tenant_id: 'tenant-1', role: 'viewer' }, error: null }),
        });
        mockFrom.mockReturnValue(chain);

        const result = await updateProjectStatusAction(VALID_PROJECT_ID, VALID_STATUS);

        expect(result.success).toBe(false);
        expect(result.message).toMatch(/viewer/i);
    });

    it('returns error for invalid status value', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
        const chain = buildChain({
            single: vi.fn().mockResolvedValue({ data: { tenant_id: 'tenant-1', role: 'admin' }, error: null }),
        });
        mockFrom.mockReturnValue(chain);

        const result = await updateProjectStatusAction(VALID_PROJECT_ID, 'status_invalido');

        expect(result.success).toBe(false);
        expect(result.message).toMatch(/status inválido/i);
    });

    it('updates status successfully and revalidates paths', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
        const profileChain = buildChain({
            single: vi.fn().mockResolvedValue({ data: { tenant_id: 'tenant-1', role: 'admin' }, error: null }),
        });
        const updateChain = {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
        };
        // Last eq returns the resolved value
        updateChain.eq
            .mockReturnValueOnce(updateChain)
            .mockResolvedValueOnce({ error: null });

        mockFrom
            .mockReturnValueOnce(profileChain)
            .mockReturnValueOnce(updateChain);

        const result = await updateProjectStatusAction(VALID_PROJECT_ID, VALID_STATUS);

        expect(result.success).toBe(true);
        expect(revalidatePath).toHaveBeenCalledWith('/projetos');
        expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });
});

// ─── updateProjectNotesAction ─────────────────────────────────────────────────

describe('updateProjectNotesAction', () => {
    const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

    it('returns error when user is not authenticated', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

        const result = await updateProjectNotesAction(VALID_UUID, '<p>notes</p>');

        expect(result.success).toBe(false);
        expect(result.message).toMatch(/não autenticado/i);
    });

    it('blocks viewer role from updating notes', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
        const chain = buildChain({
            single: vi.fn().mockResolvedValue({ data: { tenant_id: 'tenant-1', role: 'viewer' }, error: null }),
        });
        mockFrom.mockReturnValue(chain);

        const result = await updateProjectNotesAction(VALID_UUID, '<p>notes</p>');

        expect(result.success).toBe(false);
        expect(result.message).toMatch(/viewer/i);
    });

    it('returns error for invalid UUID format', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
        const chain = buildChain({
            single: vi.fn().mockResolvedValue({ data: { tenant_id: 'tenant-1', role: 'admin' }, error: null }),
        });
        mockFrom.mockReturnValue(chain);

        const result = await updateProjectNotesAction('not-a-uuid', '<p>notes</p>');

        expect(result.success).toBe(false);
        expect(result.message).toMatch(/ID do projeto inválido/i);
    });

    it('returns error when HTML content exceeds 100k characters', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
        const chain = buildChain({
            single: vi.fn().mockResolvedValue({ data: { tenant_id: 'tenant-1', role: 'admin' }, error: null }),
        });
        mockFrom.mockReturnValue(chain);

        const hugeHtml = 'a'.repeat(100_001);
        const result = await updateProjectNotesAction(VALID_UUID, hugeHtml);

        expect(result.success).toBe(false);
        expect(result.message).toMatch(/limite/i);
    });
});
