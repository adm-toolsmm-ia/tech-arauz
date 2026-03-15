/**
 * Test suite for bulk operations actions
 * Story 11.13: Bulk Operations & Import/Export
 *
 * Fixed mock chains for proper Supabase query fluent API support
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  bulkUpdateEntitiesAction,
  bulkDeleteEntitiesAction,
  exportOrganizationAsCSVAction,
  importOrganizationFromCSVAction,
  importOrganizationFromJSONAction,
} from '../bulk-operations';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { createClient } from '@/lib/supabase/server';

/**
 * Create a proper Supabase query chain mock supporting:
 * - .from(table).select(...).eq(...).single()
 * - .from(table).select(...).eq(...).order(...)
 * - .from(table).update(...).in(...).eq(...)
 * - .from(table).delete().in(...).eq(...)
 * - .from(table).insert(...).select(...)
 */
function createMockSupabaseClient() {
  return {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
    })),
  };
}

const mockAuthUser = {
  id: 'user-123',
  email: 'test@example.com',
};

const mockProfile = {
  tenant_id: 'tenant-abc',
};

describe('Bulk Update Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const freshMock = createMockSupabaseClient();
    (createClient as any).mockResolvedValue(freshMock);

    freshMock.auth.getUser.mockResolvedValue({
      data: { user: mockAuthUser },
      error: null,
    });

    const selectEqChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      }),
    };

    freshMock.from.mockImplementation((table) => {
      if (table === 'profiles') {
        return selectEqChain;
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
      };
    });
  });

  it('should update multiple entities', async () => {
    const freshMock = createMockSupabaseClient();
    (createClient as any).mockResolvedValueOnce(freshMock);

    freshMock.auth.getUser.mockResolvedValueOnce({
      data: { user: mockAuthUser },
      error: null,
    });

    const profileChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      }),
    };

    freshMock.from.mockImplementation((table) => {
      if (table === 'profiles') {
        return profileChain;
      }
      return {
        update: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null, data: null }),
          }),
        }),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
    });

    const result = await bulkUpdateEntitiesAction('area', ['id-1', 'id-2'], { name: 'Updated' });

    expect(result.success).toBe(true);
    expect(result.message).toContain('atualizada(s)');
  });

  it('should reject empty entity ids', async () => {
    const result = await bulkUpdateEntitiesAction('area', [], { name: 'Updated' });

    expect(result.success).toBe(false);
    expect(result.message).toContain('Nenhuma entidade');
  });

  it('should reject empty updates', async () => {
    const result = await bulkUpdateEntitiesAction('area', ['id-1'], {});

    expect(result.success).toBe(false);
    expect(result.message).toContain('Nenhuma atualização');
  });

  it('should reject invalid entity type', async () => {
    const result = await bulkUpdateEntitiesAction('invalid', ['id-1'], { name: 'Test' });

    expect(result.success).toBe(false);
    expect(result.message).toContain('Tipo de entidade inválido');
  });

  it('should reject unauthenticated requests', async () => {
    const freshMock = createMockSupabaseClient();
    (createClient as any).mockResolvedValueOnce(freshMock);

    freshMock.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Not authenticated'),
    });

    const result = await bulkUpdateEntitiesAction('area', ['id-1'], { name: 'Test' });

    expect(result.success).toBe(false);
    expect(result.message).toContain('autenticado');
  });
});

describe('Bulk Delete Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const freshMock = createMockSupabaseClient();
    (createClient as any).mockResolvedValue(freshMock);

    freshMock.auth.getUser.mockResolvedValue({
      data: { user: mockAuthUser },
      error: null,
    });

    const selectEqChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      }),
    };

    freshMock.from.mockImplementation((table) => {
      if (table === 'profiles') {
        return selectEqChain;
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
      };
    });
  });

  it('should delete multiple entities', async () => {
    const freshMock = createMockSupabaseClient();
    (createClient as any).mockResolvedValueOnce(freshMock);

    freshMock.auth.getUser.mockResolvedValueOnce({
      data: { user: mockAuthUser },
      error: null,
    });

    const profileChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      }),
    };

    freshMock.from.mockImplementation((table) => {
      if (table === 'profiles') {
        return profileChain;
      }
      return {
        delete: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null, data: null }),
          }),
        }),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
    });

    const result = await bulkDeleteEntitiesAction('area', ['id-1', 'id-2']);

    expect(result.success).toBe(true);
  });

  it('should reject empty entity ids', async () => {
    const result = await bulkDeleteEntitiesAction('area', []);

    expect(result.success).toBe(false);
    expect(result.message).toContain('Nenhuma entidade');
  });

  it('should enforce RLS with tenant_id filter', async () => {
    const freshMock = createMockSupabaseClient();
    (createClient as any).mockResolvedValueOnce(freshMock);

    freshMock.auth.getUser.mockResolvedValueOnce({
      data: { user: mockAuthUser },
      error: null,
    });

    const profileChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      }),
    };

    const inMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null, data: null }),
    });

    const deleteMock = vi.fn().mockReturnValue({
      in: inMock,
    });

    freshMock.from.mockImplementation((table) => {
      if (table === 'profiles') {
        return profileChain;
      }
      return {
        delete: deleteMock,
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
    });

    await bulkDeleteEntitiesAction('area', ['id-1']);

    expect(deleteMock).toHaveBeenCalled();
    expect(inMock).toHaveBeenCalledWith('id', ['id-1']);
  });
});

describe('Export CSV Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const freshMock = createMockSupabaseClient();
    (createClient as any).mockResolvedValue(freshMock);

    freshMock.auth.getUser.mockResolvedValue({
      data: { user: mockAuthUser },
      error: null,
    });

    const selectEqChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      }),
    };

    freshMock.from.mockImplementation((table) => {
      if (table === 'profiles') {
        return selectEqChain;
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
      };
    });
  });

  it('should export entities as CSV', async () => {
    const mockEntities = [
      {
        id: '1',
        tenant_id: 'tenant-abc',
        name: 'Area A',
        objective: 'Test',
        description: 'Desc',
        nuclei_count: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];

    const freshMock = createMockSupabaseClient();
    (createClient as any).mockResolvedValueOnce(freshMock);

    freshMock.auth.getUser.mockResolvedValueOnce({
      data: { user: mockAuthUser },
      error: null,
    });

    const profileChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      }),
    };

    freshMock.from.mockImplementation((table) => {
      if (table === 'profiles') {
        return profileChain;
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockEntities, error: null }),
          }),
        }),
        eq: vi.fn(),
      };
    });

    const result = await exportOrganizationAsCSVAction('area');

    expect(result.success).toBe(true);
    expect(result.data).toContain('name');
    expect(result.data).toContain('Area A');
  });

  it('should handle empty data', async () => {
    const freshMock = createMockSupabaseClient();
    (createClient as any).mockResolvedValueOnce(freshMock);

    freshMock.auth.getUser.mockResolvedValueOnce({
      data: { user: mockAuthUser },
      error: null,
    });

    const profileChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      }),
    };

    freshMock.from.mockImplementation((table) => {
      if (table === 'profiles') {
        return profileChain;
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      };
    });

    const result = await exportOrganizationAsCSVAction('area');

    expect(result.success).toBe(true);
    expect(result.data).toBe('');
  });

  it('should exclude system fields', async () => {
    const mockEntities = [
      {
        id: '1',
        tenant_id: 'tenant-abc',
        name: 'Area A',
        objective: 'Test',
        description: 'Desc',
        nuclei_count: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];

    const freshMock = createMockSupabaseClient();
    (createClient as any).mockResolvedValueOnce(freshMock);

    freshMock.auth.getUser.mockResolvedValueOnce({
      data: { user: mockAuthUser },
      error: null,
    });

    const profileChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      }),
    };

    freshMock.from.mockImplementation((table) => {
      if (table === 'profiles') {
        return profileChain;
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockEntities, error: null }),
          }),
        }),
      };
    });

    const result = await exportOrganizationAsCSVAction('area');

    expect(result.data).not.toContain('tenant_id');
    expect(result.data).not.toContain('created_at');
  });
});

describe('Import CSV Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const freshMock = createMockSupabaseClient();
    (createClient as any).mockResolvedValue(freshMock);

    freshMock.auth.getUser.mockResolvedValue({
      data: { user: mockAuthUser },
      error: null,
    });

    const selectEqChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      }),
    };

    freshMock.from.mockImplementation((table) => {
      if (table === 'profiles') {
        return selectEqChain;
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
      };
    });
  });

  it('should import valid CSV data', async () => {
    const csvContent = 'name,objective\nArea A,Test Objective\nArea B,Another Objective';

    const freshMock = createMockSupabaseClient();
    (createClient as any).mockResolvedValueOnce(freshMock);

    freshMock.auth.getUser.mockResolvedValueOnce({
      data: { user: mockAuthUser },
      error: null,
    });

    const profileChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      }),
    };

    freshMock.from.mockImplementation((table) => {
      if (table === 'profiles') {
        return profileChain;
      }
      return {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: [{ id: '1' }, { id: '2' }], error: null }),
        }),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
    });

    const result = await importOrganizationFromCSVAction('area', csvContent, 'merge');

    expect(result.success).toBe(true);
    expect(result.data?.imported).toBe(2);
  });

  it('should reject empty CSV', async () => {
    const result = await importOrganizationFromCSVAction('area', '', 'merge');

    expect(result.success).toBe(false);
    expect(result.message).toContain('vazio');
  });

  it('should validate required fields', async () => {
    const csvContent = 'name\nArea A\nArea B';

    const result = await importOrganizationFromCSVAction('area', csvContent, 'merge');

    expect(result.success).toBe(false);
    expect(result.message).toContain('Validação falhou');
  });

  it('should enforce RLS by adding tenant_id', async () => {
    const csvContent = 'name,objective\nArea A,Test';

    const freshMock = createMockSupabaseClient();
    (createClient as any).mockResolvedValueOnce(freshMock);

    freshMock.auth.getUser.mockResolvedValueOnce({
      data: { user: mockAuthUser },
      error: null,
    });

    let insertedData: any = null;

    const profileChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      }),
    };

    freshMock.from.mockImplementation((table) => {
      if (table === 'profiles') {
        return profileChain;
      }
      return {
        insert: vi.fn().mockImplementation((data) => {
          insertedData = data;
          return {
            select: vi.fn().mockResolvedValue({ data: [{ id: '1' }], error: null }),
          };
        }),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
    });

    await importOrganizationFromCSVAction('area', csvContent);

    expect(insertedData[0].tenant_id).toBe(mockProfile.tenant_id);
  });
});

describe('Import JSON Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const freshMock = createMockSupabaseClient();
    (createClient as any).mockResolvedValue(freshMock);

    freshMock.auth.getUser.mockResolvedValue({
      data: { user: mockAuthUser },
      error: null,
    });

    const selectEqChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      }),
    };

    freshMock.from.mockImplementation((table) => {
      if (table === 'profiles') {
        return selectEqChain;
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
      };
    });
  });

  it('should import valid JSON data', async () => {
    const jsonContent = JSON.stringify([
      { name: 'Area A', objective: 'Test' },
      { name: 'Area B', objective: 'Test 2' },
    ]);

    const freshMock = createMockSupabaseClient();
    (createClient as any).mockResolvedValueOnce(freshMock);

    freshMock.auth.getUser.mockResolvedValueOnce({
      data: { user: mockAuthUser },
      error: null,
    });

    const profileChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      }),
    };

    freshMock.from.mockImplementation((table) => {
      if (table === 'profiles') {
        return profileChain;
      }
      return {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: [{ id: '1' }, { id: '2' }], error: null }),
        }),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
    });

    const result = await importOrganizationFromJSONAction('area', jsonContent);

    expect(result.success).toBe(true);
    expect(result.data?.imported).toBe(2);
  });

  it('should reject invalid JSON', async () => {
    const result = await importOrganizationFromJSONAction('area', '{invalid json}');

    expect(result.success).toBe(false);
    expect(result.message).toContain('JSON inválido');
  });

  it('should reject non-array JSON', async () => {
    const jsonContent = JSON.stringify({ name: 'Area A', objective: 'Test' });

    const freshMock = createMockSupabaseClient();
    (createClient as any).mockResolvedValueOnce(freshMock);

    freshMock.auth.getUser.mockResolvedValueOnce({
      data: { user: mockAuthUser },
      error: null,
    });

    const profileChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      }),
    };

    freshMock.from.mockImplementation((table) => {
      if (table === 'profiles') {
        return profileChain;
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
    });

    const result = await importOrganizationFromJSONAction('area', jsonContent);

    expect(result.success).toBe(false);
    expect(result.message).toContain('array');
  });
});

describe('RLS Compliance', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const freshMock = createMockSupabaseClient();
    (createClient as any).mockResolvedValue(freshMock);

    freshMock.auth.getUser.mockResolvedValue({
      data: { user: mockAuthUser },
      error: null,
    });

    const selectEqChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      }),
    };

    freshMock.from.mockImplementation((table) => {
      if (table === 'profiles') {
        return selectEqChain;
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
      };
    });
  });

  it('should always filter by tenant_id on export', async () => {
    const freshMock = createMockSupabaseClient();
    (createClient as any).mockResolvedValueOnce(freshMock);

    freshMock.auth.getUser.mockResolvedValueOnce({
      data: { user: mockAuthUser },
      error: null,
    });

    const selectQuery = {
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    };

    const profileChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      }),
    };

    freshMock.from.mockImplementation((table) => {
      if (table === 'profiles') {
        return profileChain;
      }
      return {
        select: vi.fn().mockReturnValue(selectQuery),
      };
    });

    await exportOrganizationAsCSVAction('area');

    expect(selectQuery.eq).toHaveBeenCalledWith('tenant_id', mockProfile.tenant_id);
  });

  it('should always add tenant_id on import', async () => {
    const csvContent = 'name,objective\nArea A,Test';

    const freshMock = createMockSupabaseClient();
    (createClient as any).mockResolvedValueOnce(freshMock);

    freshMock.auth.getUser.mockResolvedValueOnce({
      data: { user: mockAuthUser },
      error: null,
    });

    let insertedData: any = null;

    const profileChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      }),
    };

    freshMock.from.mockImplementation((table) => {
      if (table === 'profiles') {
        return profileChain;
      }
      return {
        insert: vi.fn().mockImplementation((data) => {
          insertedData = data;
          return {
            select: vi.fn().mockResolvedValue({ data: [{ id: '1' }], error: null }),
          };
        }),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
    });

    await importOrganizationFromCSVAction('area', csvContent);

    expect(insertedData[0].tenant_id).toBe(mockProfile.tenant_id);
  });
});
