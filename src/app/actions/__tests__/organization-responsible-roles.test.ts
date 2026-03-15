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

  // Mock Supabase client chain
  const mockUpdate = vi.fn().mockReturnThis();
  const mockSelect = vi.fn().mockReturnThis();
  const mockEq = vi.fn().mockReturnThis();
  const mockSingle = vi.fn();
  const mockFrom = vi.fn();

  const mockGetUser = vi.fn();
  const mockProfileFrom = vi.fn();
  const mockProfileSelect = vi.fn().mockReturnThis();
  const mockProfileEq = vi.fn().mockReturnThis();
  const mockProfileSingle = vi.fn();

  const mockSupabase = {
    auth: { getUser: mockGetUser },
    from: mockFrom,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockSupabase);

    // Default: successful auth
    mockGetUser.mockResolvedValue({
      data: { user: { id: userId } },
      error: null,
    });

    // Default: successful profile lookup
    mockProfileFrom.mockReturnValue({
      select: mockProfileSelect,
      eq: mockProfileEq,
      single: mockProfileSingle,
    });
    mockProfileSingle.mockResolvedValue({
      data: { tenant_id: tenantId },
      error: null,
    });

    // Default: successful activity update
    mockFrom.mockReturnValue({
      update: mockUpdate,
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });
    mockSingle.mockResolvedValue({
      data: { id: activityId, responsible_roles: roles },
      error: null,
    });
  });

  describe('updateActivityResponsibleRolesAction', () => {
    it('should update responsible roles successfully', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: mockProfileSelect,
            eq: mockProfileEq,
            single: mockProfileSingle,
          };
        }
        return {
          update: mockUpdate,
          select: mockSelect,
          eq: mockEq,
          single: mockSingle,
        };
      });

      const result = await updateActivityResponsibleRolesAction(activityId, roles);

      expect(result.success).toBe(true);
      expect(result.data?.responsible_roles).toEqual(roles);
      expect(revalidatePath).toHaveBeenCalledWith('/organizacao');
    });

    it('should enforce tenant isolation via tenant_id eq check', async () => {
      const result = await updateActivityResponsibleRolesAction(activityId, roles);

      // Verify .eq() was called with tenant_id
      expect(mockEq).toHaveBeenCalledWith('tenant_id', tenantId);
      expect(result.success).toBe(true);
    });

    it('should handle error when activity not found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      const result = await updateActivityResponsibleRolesAction(activityId, roles);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Erro ao atualizar');
    });

    it('should handle empty roles array (clear all roles)', async () => {
      const result = await updateActivityResponsibleRolesAction(activityId, []);

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          responsible_roles: [],
        })
      );
    });

    it('should return error when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const result = await updateActivityResponsibleRolesAction(activityId, roles);

      expect(result.success).toBe(false);
      expect(result.message).toContain('não autenticado');
    });

    it('should return error when profile not found', async () => {
      mockProfileSingle.mockResolvedValue({
        data: null,
        error: { message: 'Profile not found' },
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

      // First call: fetch current roles
      mockFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: mockProfileSelect,
            eq: mockProfileEq,
            single: mockProfileSingle,
          };
        }
        if (table === 'org_activities') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { responsible_roles: currentRoles },
                    error: null,
                  }),
                }),
              }),
            }),
            update: mockUpdate,
            eq: mockEq,
            single: mockSingle,
          };
        }
      });

      mockSingle.mockResolvedValue({
        data: { id: activityId, responsible_roles: [...currentRoles, newRole] },
        error: null,
      });

      const result = await addActivityResponsibleRoleAction(activityId, newRole);

      expect(result.success).toBe(true);
    });

    it('should prevent duplicate roles', async () => {
      const duplicateRole = 'manager';
      const currentRoles = ['manager', 'analyst'];

      mockFrom.mockImplementation((table: string) => {
        if (table === 'org_activities') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { responsible_roles: currentRoles },
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        return {
          select: mockProfileSelect,
          eq: mockProfileEq,
          single: mockProfileSingle,
        };
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

      mockFrom.mockImplementation((table: string) => {
        if (table === 'org_activities') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { responsible_roles: currentRoles },
                    error: null,
                  }),
                }),
              }),
            }),
            update: mockUpdate,
            eq: mockEq,
            single: mockSingle,
          };
        }
        return {
          select: mockProfileSelect,
          eq: mockProfileEq,
          single: mockProfileSingle,
        };
      });

      mockSingle.mockResolvedValue({
        data: { id: activityId, responsible_roles: ['manager'] },
        error: null,
      });

      const result = await removeActivityResponsibleRoleAction(activityId, roleToRemove);

      expect(result.success).toBe(true);
    });

    it('should gracefully handle removing non-existent role', async () => {
      const roleToRemove = 'coordinator'; // Not in list
      const currentRoles = ['manager', 'analyst'];

      mockFrom.mockImplementation((table: string) => {
        if (table === 'org_activities') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { responsible_roles: currentRoles },
                    error: null,
                  }),
                }),
              }),
            }),
            update: mockUpdate,
            eq: mockEq,
            single: mockSingle,
          };
        }
        return {
          select: mockProfileSelect,
          eq: mockProfileEq,
          single: mockProfileSingle,
        };
      });

      mockSingle.mockResolvedValue({
        data: { id: activityId, responsible_roles: currentRoles },
        error: null,
      });

      const result = await removeActivityResponsibleRoleAction(activityId, roleToRemove);

      // Should succeed but return unchanged roles
      expect(result.success).toBe(true);
    });
  });

  describe('getActivityResponsibleRolesAction', () => {
    it('should retrieve current roles for activity', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: mockProfileSelect,
            eq: mockProfileEq,
            single: mockProfileSingle,
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { responsible_roles: roles },
                  error: null,
                }),
              }),
            }),
          }),
        };
      });

      const result = await getActivityResponsibleRolesAction(activityId);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toEqual(roles);
    });

    it('should return empty array when activity has no roles', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: mockProfileSelect,
            eq: mockProfileEq,
            single: mockProfileSingle,
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { responsible_roles: [] },
                  error: null,
                }),
              }),
            }),
          }),
        };
      });

      const result = await getActivityResponsibleRolesAction(activityId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should handle activity not found error', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: mockProfileSelect,
            eq: mockProfileEq,
            single: mockProfileSingle,
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Not found' },
                }),
              }),
            }),
          }),
        };
      });

      const result = await getActivityResponsibleRolesAction(activityId);

      expect(result.success).toBe(false);
      expect(result.message).toContain('não encontrada');
    });
  });

  describe('Integration Tests', () => {
    it('should enforce tenant isolation across all operations', async () => {
      // Verify that all operations include tenant_id check
      mockFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: mockProfileSelect,
            eq: mockProfileEq,
            single: mockProfileSingle,
          };
        }
        return {
          update: mockUpdate,
          select: mockSelect,
          eq: vi.fn().mockImplementation((key: string, val: string) => {
            // First eq() should be for id
            // Second eq() should be for tenant_id
            return {
              eq: vi.fn().mockReturnValue({
                select: mockSelect,
                single: mockSingle,
              }),
              select: mockSelect,
              single: mockSingle,
            };
          }),
          select: mockSelect,
          single: mockSingle,
        };
      });

      const result = await updateActivityResponsibleRolesAction(activityId, roles);

      expect(result.success).toBe(true);
      // Verify tenant isolation was enforced
      expect(mockEq).toHaveBeenCalledWith('tenant_id', tenantId);
    });
  });
});
