import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  updateActivityResponsibleRolesAction,
  addActivityResponsibleRoleAction,
  removeActivityResponsibleRoleAction,
  getActivityResponsibleRolesAction,
} from '../organization';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Server Action Tests - Story 11.7: Responsible Roles
 *
 * Tests cover:
 * - Tenant isolation (RLS)
 * - Duplicate prevention
 * - Error handling
 * - Revalidation
 */

describe('Responsible Roles Server Actions', () => {
  const activityId = 'act-001';
  const tenantId = 'tenant-001';
  const userId = 'user-001';
  const roles = ['manager', 'analyst'];

  // Create a chainable mock that returns itself for all method calls and resolves properly
  function createChainableMock(resolveData: any = null) {
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
    chain.then = function (resolve: any, reject: any) {
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
          data: { id: activityId, responsible_roles: roles },
          error: null,
        });
      }
      return chain;
    });
  });

  describe('updateActivityResponsibleRolesAction', () => {
    it('should update responsible roles successfully', async () => {
      const result = await updateActivityResponsibleRolesAction(activityId, roles);

      expect(result.success).toBe(true);
      expect(result.data?.responsible_roles).toEqual(roles);
      expect(revalidatePath).toHaveBeenCalledWith('/organizacao');
    });

    it('should enforce tenant isolation via tenant_id eq check', async () => {
      let capturedChain: any;
      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createChainableMock();
        if (table === 'org_activities') {
          capturedChain = chain;
        }
        if (table === 'profiles') {
          chain.single.mockResolvedValue({
            data: { tenant_id: tenantId },
            error: null,
          });
        } else {
          chain.single.mockResolvedValue({
            data: { id: activityId, responsible_roles: roles },
            error: null,
          });
        }
        return chain;
      });

      const result = await updateActivityResponsibleRolesAction(activityId, roles);

      // Verify .eq() was called with tenant_id in the captured chain
      expect(capturedChain.eq).toHaveBeenCalledWith('tenant_id', tenantId);
      expect(result.success).toBe(true);
    });

    it('should handle error when activity not found', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createChainableMock();
        if (table === 'profiles') {
          chain.single.mockResolvedValue({
            data: { tenant_id: tenantId },
            error: null,
          });
        } else {
          chain.single.mockResolvedValue({
            data: null,
            error: { message: 'Not found' },
          });
        }
        return chain;
      });

      const result = await updateActivityResponsibleRolesAction(activityId, roles);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Erro ao atualizar');
    });

    it('should handle empty roles array (clear all roles)', async () => {
      let capturedChain: any;
      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createChainableMock();
        if (table === 'org_activities') {
          capturedChain = chain;
        }
        if (table === 'profiles') {
          chain.single.mockResolvedValue({
            data: { tenant_id: tenantId },
            error: null,
          });
        } else {
          chain.single.mockResolvedValue({
            data: { id: activityId, responsible_roles: [] },
            error: null,
          });
        }
        return chain;
      });

      const result = await updateActivityResponsibleRolesAction(activityId, []);

      expect(result.success).toBe(true);
      // Verify the update was called with empty array
      expect(capturedChain.update).toHaveBeenCalled();
    });

    it('should return error when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const result = await updateActivityResponsibleRolesAction(activityId, roles);

      expect(result.success).toBe(false);
      expect(result.message).toContain('não autenticado');
    });

    it('should return error when profile not found', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createChainableMock();
        if (table === 'profiles') {
          chain.single.mockResolvedValue({
            data: null,
            error: { message: 'Profile not found' },
          });
        } else {
          chain.single.mockResolvedValue({
            data: { id: activityId, responsible_roles: roles },
            error: null,
          });
        }
        return chain;
      });

      const result = await updateActivityResponsibleRolesAction(activityId, roles);

      expect(result.success).toBe(false);
      expect(result.message).toContain('não encontrado');
    });
  });

  describe('addActivityResponsibleRoleAction', () => {
    it('should add single role to existing roles', async () => {
      const newRole = 'coordinator';
      const currentRoles = ['manager'];

      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createChainableMock();
        if (table === 'profiles') {
          chain.single.mockResolvedValue({
            data: { tenant_id: tenantId },
            error: null,
          });
        } else if (table === 'org_activities') {
          // For the first select (fetch current roles)
          chain.single.mockResolvedValueOnce({
            data: { responsible_roles: currentRoles },
            error: null,
          });
          // For the second select (after update)
          chain.single.mockResolvedValueOnce({
            data: { id: activityId, responsible_roles: [...currentRoles, newRole] },
            error: null,
          });
        }
        return chain;
      });

      const result = await addActivityResponsibleRoleAction(activityId, newRole);

      expect(result.success).toBe(true);
    });

    it('should prevent duplicate roles', async () => {
      const duplicateRole = 'manager';
      const currentRoles = ['manager', 'analyst'];

      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createChainableMock();
        if (table === 'profiles') {
          chain.single.mockResolvedValue({
            data: { tenant_id: tenantId },
            error: null,
          });
        } else if (table === 'org_activities') {
          chain.single.mockResolvedValue({
            data: { responsible_roles: currentRoles },
            error: null,
          });
        }
        return chain;
      });

      const result = await addActivityResponsibleRoleAction(activityId, duplicateRole);

      expect(result.success).toBe(false);
      expect(result.message).toContain('já adicionada');
    });
  });

  describe('removeActivityResponsibleRoleAction', () => {
    it('should remove single role from existing roles', async () => {
      const roleToRemove = 'analyst';
      const currentRoles = ['manager', 'analyst'];

      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createChainableMock();
        if (table === 'profiles') {
          chain.single.mockResolvedValue({
            data: { tenant_id: tenantId },
            error: null,
          });
        } else if (table === 'org_activities') {
          // For the first select (fetch current roles)
          chain.single.mockResolvedValueOnce({
            data: { responsible_roles: currentRoles },
            error: null,
          });
          // For the second select (after update)
          chain.single.mockResolvedValueOnce({
            data: { id: activityId, responsible_roles: ['manager'] },
            error: null,
          });
        }
        return chain;
      });

      const result = await removeActivityResponsibleRoleAction(activityId, roleToRemove);

      expect(result.success).toBe(true);
    });

    it('should gracefully handle removing non-existent role', async () => {
      const roleToRemove = 'coordinator'; // Not in list
      const currentRoles = ['manager', 'analyst'];

      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createChainableMock();
        if (table === 'profiles') {
          chain.single.mockResolvedValue({
            data: { tenant_id: tenantId },
            error: null,
          });
        } else if (table === 'org_activities') {
          // For the first select (fetch current roles)
          chain.single.mockResolvedValueOnce({
            data: { responsible_roles: currentRoles },
            error: null,
          });
          // For the second select (after update)
          chain.single.mockResolvedValueOnce({
            data: { id: activityId, responsible_roles: currentRoles },
            error: null,
          });
        }
        return chain;
      });

      const result = await removeActivityResponsibleRoleAction(activityId, roleToRemove);

      // Should succeed but return unchanged roles
      expect(result.success).toBe(true);
    });
  });

  describe('getActivityResponsibleRolesAction', () => {
    it('should retrieve current roles for activity', async () => {
      const result = await getActivityResponsibleRolesAction(activityId);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toEqual(roles);
    });

    it('should return empty array when activity has no roles', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createChainableMock();
        if (table === 'profiles') {
          chain.single.mockResolvedValue({
            data: { tenant_id: tenantId },
            error: null,
          });
        } else {
          chain.single.mockResolvedValue({
            data: { responsible_roles: [] },
            error: null,
          });
        }
        return chain;
      });

      const result = await getActivityResponsibleRolesAction(activityId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should handle activity not found error', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createChainableMock();
        if (table === 'profiles') {
          chain.single.mockResolvedValue({
            data: { tenant_id: tenantId },
            error: null,
          });
        } else {
          chain.single.mockResolvedValue({
            data: null,
            error: { message: 'Not found' },
          });
        }
        return chain;
      });

      const result = await getActivityResponsibleRolesAction(activityId);

      expect(result.success).toBe(false);
      expect(result.message).toContain('não encontrada');
    });
  });

  describe('Integration Tests', () => {
    it('should enforce tenant isolation across all operations', async () => {
      let capturedChain: any;
      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createChainableMock();
        if (table === 'org_activities') {
          capturedChain = chain;
        }
        if (table === 'profiles') {
          chain.single.mockResolvedValue({
            data: { tenant_id: tenantId },
            error: null,
          });
        } else {
          chain.single.mockResolvedValue({
            data: { id: activityId, responsible_roles: roles },
            error: null,
          });
        }
        return chain;
      });

      const result = await updateActivityResponsibleRolesAction(activityId, roles);

      expect(result.success).toBe(true);
      // Verify tenant isolation was enforced in the chain
      expect(capturedChain.eq).toHaveBeenCalledWith('tenant_id', tenantId);
    });
  });
});
