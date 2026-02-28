import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    createAgentTypeAction,
    updateAgentTypeAction,
    deleteAgentTypeAction,
} from '../agent-types';

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

beforeEach(() => {
    vi.clearAllMocks();
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockSupabase);
});

// ─── createAgentTypeAction ────────────────────────────────────────────────────

describe('createAgentTypeAction', () => {
    const payload = { name: 'Analisador', slug: 'analisador', is_system: false, is_active: true };

    it('returns error when user is not authenticated', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

        const result = await createAgentTypeAction(payload);

        expect(result.success).toBe(false);
        expect(result.message).toMatch(/não autenticado/i);
    });

    it('returns error when profile is not found', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
        mockFrom.mockReturnValue(profileChain(null, { message: 'not found' }));

        const result = await createAgentTypeAction(payload);

        expect(result.success).toBe(false);
        expect(result.message).toMatch(/perfil não encontrado/i);
    });

    it('creates agent type and revalidates path on success', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });

        const profileData = { tenant_id: 'tenant-1' };
        const createdData = { ...payload, id: 'at-1', tenant_id: 'tenant-1' };

        mockFrom
            .mockReturnValueOnce(profileChain(profileData))
            .mockReturnValueOnce({
                insert: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: createdData, error: null }),
            });

        const result = await createAgentTypeAction(payload);

        expect(result.success).toBe(true);
        expect(result.message).toMatch(/analisador/i);
        expect(revalidatePath).toHaveBeenCalledWith('/auxiliares/agent-types');
    });
});

// ─── updateAgentTypeAction ────────────────────────────────────────────────────

describe('updateAgentTypeAction', () => {
    it('returns error when user is not authenticated', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

        const result = await updateAgentTypeAction('at-1', { name: 'Novo Nome' });

        expect(result.success).toBe(false);
        expect(result.message).toMatch(/não autenticado/i);
    });

    it('blocks update on system agent type', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
        mockFrom.mockReturnValue(profileChain({ is_system: true }));

        const result = await updateAgentTypeAction('at-system', { name: 'Hack' });

        expect(result.success).toBe(false);
        expect(result.message).toMatch(/sistema não podem ser editados/i);
    });

    it('updates agent type and revalidates on success', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
        const updatedData = { id: 'at-1', name: 'Atualizado', is_system: false };

        mockFrom
            .mockReturnValueOnce(profileChain({ is_system: false })) // fetch existing
            .mockReturnValueOnce({
                update: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: updatedData, error: null }),
            });

        const result = await updateAgentTypeAction('at-1', { name: 'Atualizado' });

        expect(result.success).toBe(true);
        expect(revalidatePath).toHaveBeenCalledWith('/auxiliares/agent-types');
    });
});

// ─── deleteAgentTypeAction ────────────────────────────────────────────────────

describe('deleteAgentTypeAction', () => {
    it('returns error when user is not authenticated', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

        const result = await deleteAgentTypeAction('at-1');

        expect(result.success).toBe(false);
        expect(result.message).toMatch(/não autenticado/i);
    });

    it('blocks deletion of system agent type', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
        mockFrom.mockReturnValue(profileChain({ name: 'Sistema', is_system: true }));

        const result = await deleteAgentTypeAction('at-system');

        expect(result.success).toBe(false);
        expect(result.message).toMatch(/sistema não podem ser deletados/i);
    });

    it('deletes agent type and revalidates on success', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });

        mockFrom
            .mockReturnValueOnce(profileChain({ name: 'Analisador', is_system: false }))
            .mockReturnValueOnce({
                delete: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({ error: null }),
            });

        const result = await deleteAgentTypeAction('at-1');

        expect(result.success).toBe(true);
        expect(result.message).toMatch(/analisador/i);
        expect(revalidatePath).toHaveBeenCalledWith('/auxiliares/agent-types');
    });
});
