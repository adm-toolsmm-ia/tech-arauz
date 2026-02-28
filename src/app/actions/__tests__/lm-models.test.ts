import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    createLmModelAction,
    deleteLmModelAction,
    updateLmModelDisplayOrderAction,
    bulkUpdateLmModelsActiveAction,
} from '../lm-models';

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

// ─── createLmModelAction ───────────────────────────────────────────────────────

describe('createLmModelAction', () => {
    const basePayload = {
        name: 'GPT-4o',
        model_id: 'gpt-4o',
        provider_id: 'prov-1',
        is_active: true,
        is_system: false,
        tier: 'flagship' as const,
        context_window: 128000,
        max_tokens: 4096,
        display_order: 0,
    };

    it('returns error immediately for invalid tier (no Supabase call)', async () => {
        const result = await createLmModelAction({ ...basePayload, tier: 'ultra' as never });

        expect(result.success).toBe(false);
        expect(result.message).toMatch(/tier inválido/i);
        expect(mockFrom).not.toHaveBeenCalled();
    });

    it('returns error immediately for negative display_order (no Supabase call)', async () => {
        const result = await createLmModelAction({ ...basePayload, display_order: -1 });

        expect(result.success).toBe(false);
        expect(result.message).toMatch(/display order/i);
        expect(mockFrom).not.toHaveBeenCalled();
    });

    it('returns error immediately for invalid context_window (no Supabase call)', async () => {
        const result = await createLmModelAction({ ...basePayload, context_window: 0 });

        expect(result.success).toBe(false);
        expect(result.message).toMatch(/context window/i);
        expect(mockFrom).not.toHaveBeenCalled();
    });

    it('returns error when user is not authenticated', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

        const result = await createLmModelAction(basePayload);

        expect(result.success).toBe(false);
        expect(result.message).toMatch(/não autenticado/i);
    });

    it('returns error when provider does not belong to tenant', async () => {
        authedUser();
        const otherTenant = 'tenant-other';

        mockFrom
            .mockReturnValueOnce(profileChain({ tenant_id: 'tenant-1' }))           // profiles
            .mockReturnValueOnce(profileChain({ tenant_id: otherTenant }));          // lm_providers

        const result = await createLmModelAction(basePayload);

        expect(result.success).toBe(false);
        expect(result.message).toMatch(/não pertence ao seu tenant/i);
    });

    it('creates model successfully and revalidates paths', async () => {
        authedUser();
        const createdData = { ...basePayload, id: 'm-1', tenant_id: 'tenant-1' };

        mockFrom
            .mockReturnValueOnce(profileChain({ tenant_id: 'tenant-1' }))           // profiles
            .mockReturnValueOnce(profileChain({ tenant_id: 'tenant-1' }))           // lm_providers
            .mockReturnValueOnce({
                insert: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: createdData, error: null }),
            });

        const result = await createLmModelAction(basePayload);

        expect(result.success).toBe(true);
        expect(revalidatePath).toHaveBeenCalledWith('/auxiliares/modelos-ia');
    });
});

// ─── deleteLmModelAction ───────────────────────────────────────────────────────

describe('deleteLmModelAction', () => {
    it('returns error when user is not authenticated', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

        const result = await deleteLmModelAction('m-1');

        expect(result.success).toBe(false);
        expect(result.message).toMatch(/não autenticado/i);
    });

    it('blocks deletion of system model', async () => {
        authedUser();
        mockFrom
            .mockReturnValueOnce(profileChain({ tenant_id: 'tenant-1' }))           // profiles
            .mockReturnValueOnce(profileChain({ id: 'm-1', tenant_id: 'tenant-1', name: 'GPT-4o', is_system: true }));

        const result = await deleteLmModelAction('m-1');

        expect(result.success).toBe(false);
        expect(result.message).toMatch(/sistema não podem ser excluídos/i);
    });

    it('blocks deletion when model belongs to different tenant', async () => {
        authedUser();
        mockFrom
            .mockReturnValueOnce(profileChain({ tenant_id: 'tenant-1' }))
            .mockReturnValueOnce(profileChain({ id: 'm-1', tenant_id: 'tenant-EVIL', name: 'GPT-4o', is_system: false }));

        const result = await deleteLmModelAction('m-1');

        expect(result.success).toBe(false);
        expect(result.message).toMatch(/não pertence ao seu tenant/i);
    });

    it('deletes model successfully and revalidates paths', async () => {
        authedUser();
        mockFrom
            .mockReturnValueOnce(profileChain({ tenant_id: 'tenant-1' }))
            .mockReturnValueOnce(profileChain({ id: 'm-1', tenant_id: 'tenant-1', name: 'GPT-4o', is_system: false }))
            .mockReturnValueOnce({
                delete: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({ error: null }),
            });

        const result = await deleteLmModelAction('m-1');

        expect(result.success).toBe(true);
        expect(revalidatePath).toHaveBeenCalledWith('/auxiliares/modelos-ia');
    });
});

// ─── updateLmModelDisplayOrderAction ──────────────────────────────────────────

describe('updateLmModelDisplayOrderAction', () => {
    it('returns error immediately for negative display_order (no Supabase call)', async () => {
        const result = await updateLmModelDisplayOrderAction('m-1', -5);

        expect(result.success).toBe(false);
        expect(result.message).toMatch(/não-negativo/i);
        expect(mockFrom).not.toHaveBeenCalled();
    });

    it('updates display_order successfully', async () => {
        authedUser();
        const updatedData = { id: 'm-1', display_order: 3 };

        mockFrom
            .mockReturnValueOnce(profileChain({ tenant_id: 'tenant-1' }))
            .mockReturnValueOnce(profileChain({ tenant_id: 'tenant-1' }))
            .mockReturnValueOnce({
                update: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: updatedData, error: null }),
            });

        const result = await updateLmModelDisplayOrderAction('m-1', 3);

        expect(result.success).toBe(true);
        expect(revalidatePath).toHaveBeenCalledWith('/auxiliares/modelos-ia');
    });
});

// ─── bulkUpdateLmModelsActiveAction ───────────────────────────────────────────

describe('bulkUpdateLmModelsActiveAction', () => {
    it('returns error when user is not authenticated', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

        const result = await bulkUpdateLmModelsActiveAction(['m-1', 'm-2'], true);

        expect(result.success).toBe(false);
        expect(result.message).toMatch(/não autenticado/i);
    });

    it('returns error when no models belong to tenant', async () => {
        authedUser();
        mockFrom
            .mockReturnValueOnce(profileChain({ tenant_id: 'tenant-1' }))
            .mockReturnValueOnce({
                select: vi.fn().mockReturnThis(),
                in: vi.fn().mockResolvedValue({
                    data: [{ id: 'm-1', tenant_id: 'tenant-EVIL' }],
                    error: null,
                }),
            });

        const result = await bulkUpdateLmModelsActiveAction(['m-1'], true);

        expect(result.success).toBe(false);
        expect(result.message).toMatch(/nenhum modelo válido/i);
    });

    it('filters out models from other tenants and updates only valid ones', async () => {
        authedUser();
        mockFrom
            .mockReturnValueOnce(profileChain({ tenant_id: 'tenant-1' }))
            .mockReturnValueOnce({
                select: vi.fn().mockReturnThis(),
                in: vi.fn().mockResolvedValue({
                    data: [
                        { id: 'm-1', tenant_id: 'tenant-1' },
                        { id: 'm-evil', tenant_id: 'tenant-EVIL' },
                    ],
                    error: null,
                }),
            })
            .mockReturnValueOnce({
                update: vi.fn().mockReturnThis(),
                in: vi.fn().mockResolvedValue({ error: null }),
            });

        const result = await bulkUpdateLmModelsActiveAction(['m-1', 'm-evil'], true);

        expect(result.success).toBe(true);
        expect(result.ids).toEqual(['m-1']);
        expect(result.message).toMatch(/1 modelo/i);
    });
});
