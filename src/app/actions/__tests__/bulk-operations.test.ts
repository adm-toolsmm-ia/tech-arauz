/**
 * Test suite for bulk operations actions
 * Story 11.13: Bulk Operations & Import/Export
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
};

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
    (createClient as any).mockResolvedValue(mockSupabase);
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockAuthUser },
      error: null,
    });
  });

  it('should update multiple entities', async () => {
    const mockUpdateQuery = {
      in: vi.fn(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue(Promise.resolve({ data: [mockProfile], error: null })),
    });
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue(Promise.resolve({ data: [mockProfile], error: null })),
    });

    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: mockAuthUser },
      error: null,
    });
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({ data: [mockProfile], error: null }),
    });

    mockSupabase.from.mockReturnValueOnce({
      update: vi.fn().mockReturnValue(mockUpdateQuery),
    });

    const result = await bulkUpdateEntitiesAction('area', ['id-1', 'id-2'], { name: 'Updated' });

    expect(result.success).toBe(true);
    expect(result.message).toContain('atualizada(s)');
  });

  it('should reject empty entity ids', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockAuthUser },
      error: null,
    });
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [mockProfile], error: null }),
    });

    const result = await bulkUpdateEntitiesAction('area', [], { name: 'Updated' });

    expect(result.success).toBe(false);
    expect(result.message).toContain('Nenhuma entidade');
  });

  it('should reject empty updates', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockAuthUser },
      error: null,
    });
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [mockProfile], error: null }),
    });

    const result = await bulkUpdateEntitiesAction('area', ['id-1'], {});

    expect(result.success).toBe(false);
    expect(result.message).toContain('Nenhuma atualização');
  });

  it('should reject invalid entity type', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockAuthUser },
      error: null,
    });
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [mockProfile], error: null }),
    });

    const result = await bulkUpdateEntitiesAction('invalid', ['id-1'], { name: 'Test' });

    expect(result.success).toBe(false);
    expect(result.message).toContain('Tipo de entidade inválido');
  });

  it('should reject unauthenticated requests', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
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
    (createClient as any).mockResolvedValue(mockSupabase);
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockAuthUser },
      error: null,
    });
  });

  it('should delete multiple entities', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [mockProfile], error: null }),
    });

    const mockDeleteQuery = {
      in: vi.fn(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({ data: [mockProfile], error: null }),
    });

    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue(mockDeleteQuery),
    });

    const result = await bulkDeleteEntitiesAction('area', ['id-1', 'id-2']);

    expect(result.success).toBe(true);
  });

  it('should reject empty entity ids', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [mockProfile], error: null }),
    });

    const result = await bulkDeleteEntitiesAction('area', []);

    expect(result.success).toBe(false);
    expect(result.message).toContain('Nenhuma entidade');
  });

  it('should enforce RLS with tenant_id filter', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [mockProfile], error: null }),
    });

    const mockDeleteQuery = {
      in: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    };

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({ data: [mockProfile], error: null }),
    });

    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue(mockDeleteQuery),
    });

    await bulkDeleteEntitiesAction('area', ['id-1']);

    expect(mockDeleteQuery.in).toHaveBeenCalledWith('id', ['id-1']);
    expect(mockDeleteQuery.in().eq).toHaveBeenCalledWith('tenant_id', mockProfile.tenant_id);
  });
});

describe('Export CSV Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockResolvedValue(mockSupabase);
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockAuthUser },
      error: null,
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

    mockSupabase.from.mockReturnValue({
      select: vi
        .fn()
        .mockReturnValue({
          eq: vi
            .fn()
            .mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockEntities, error: null }),
            }),
        }),
    });

    const result = await exportOrganizationAsCSVAction('area');

    expect(result.success).toBe(true);
    expect(result.data).toContain('name');
    expect(result.data).toContain('Area A');
  });

  it('should handle empty data', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi
        .fn()
        .mockReturnValue({
          eq: vi
            .fn()
            .mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
        }),
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

    mockSupabase.from.mockReturnValue({
      select: vi
        .fn()
        .mockReturnValue({
          eq: vi
            .fn()
            .mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockEntities, error: null }),
            }),
        }),
    });

    const result = await exportOrganizationAsCSVAction('area');

    expect(result.data).not.toContain('tenant_id');
    expect(result.data).not.toContain('created_at');
  });
});

describe('Import CSV Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockResolvedValue(mockSupabase);
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockAuthUser },
      error: null,
    });
  });

  it('should import valid CSV data', async () => {
    const csvContent = 'name,objective\nArea A,Test Objective\nArea B,Another Objective';

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [mockProfile], error: null }),
    });

    const mockInsertQuery = {
      insert: vi.fn(),
      select: vi.fn().mockResolvedValue({ data: [{ id: '1' }, { id: '2' }], error: null }),
    };

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({ data: [mockProfile], error: null }),
    });

    mockSupabase.from.mockReturnValueOnce(mockInsertQuery);

    const result = await importOrganizationFromCSVAction('area', csvContent, 'merge');

    expect(result.success).toBe(true);
    expect(result.data?.imported).toBe(2);
  });

  it('should reject empty CSV', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [mockProfile], error: null }),
    });

    const result = await importOrganizationFromCSVAction('area', '', 'merge');

    expect(result.success).toBe(false);
    expect(result.message).toContain('vazio');
  });

  it('should validate required fields', async () => {
    const csvContent = 'name\nArea A\nArea B';

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [mockProfile], error: null }),
    });

    const result = await importOrganizationFromCSVAction('area', csvContent, 'merge');

    expect(result.success).toBe(false);
    expect(result.message).toContain('Validação falhou');
  });

  it('should enforce RLS by adding tenant_id', async () => {
    const csvContent = 'name,objective\nArea A,Test';

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [mockProfile], error: null }),
    });

    const mockInsertQuery = {
      insert: vi
        .fn()
        .mockImplementation((data) => {
          expect(data[0].tenant_id).toBe(mockProfile.tenant_id);
          return {
            select: vi.fn().mockResolvedValue({ data: [{ id: '1' }], error: null }),
          };
        }),
    };

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({ data: [mockProfile], error: null }),
    });

    mockSupabase.from.mockReturnValueOnce(mockInsertQuery);

    await importOrganizationFromCSVAction('area', csvContent, 'merge');

    expect(mockInsertQuery.insert).toHaveBeenCalled();
  });
});

describe('Import JSON Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockResolvedValue(mockSupabase);
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockAuthUser },
      error: null,
    });
  });

  it('should import valid JSON data', async () => {
    const jsonContent = JSON.stringify([
      { name: 'Area A', objective: 'Test' },
      { name: 'Area B', objective: 'Test 2' },
    ]);

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [mockProfile], error: null }),
    });

    const mockInsertQuery = {
      insert: vi.fn(),
      select: vi.fn().mockResolvedValue({ data: [{ id: '1' }, { id: '2' }], error: null }),
    };

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({ data: [mockProfile], error: null }),
    });

    mockSupabase.from.mockReturnValueOnce(mockInsertQuery);

    const result = await importOrganizationFromJSONAction('area', jsonContent);

    expect(result.success).toBe(true);
    expect(result.data?.imported).toBe(2);
  });

  it('should reject invalid JSON', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [mockProfile], error: null }),
    });

    const result = await importOrganizationFromJSONAction('area', '{invalid json}');

    expect(result.success).toBe(false);
    expect(result.message).toContain('JSON inválido');
  });

  it('should reject non-array JSON', async () => {
    const jsonContent = JSON.stringify({ name: 'Area A', objective: 'Test' });

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [mockProfile], error: null }),
    });

    const result = await importOrganizationFromJSONAction('area', jsonContent);

    expect(result.success).toBe(false);
    expect(result.message).toContain('array');
  });
});

describe('RLS Compliance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockResolvedValue(mockSupabase);
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockAuthUser },
      error: null,
    });
  });

  it('should always filter by tenant_id on export', async () => {
    const selectQuery = {
      eq: vi
        .fn()
        .mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
    };

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue(selectQuery),
    });

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({ data: [mockProfile], error: null }),
    });

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue(selectQuery),
    });

    await exportOrganizationAsCSVAction('area');

    expect(selectQuery.eq).toHaveBeenCalledWith('tenant_id', mockProfile.tenant_id);
  });

  it('should always add tenant_id on import', async () => {
    const csvContent = 'name,objective\nArea A,Test';

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [mockProfile], error: null }),
    });

    let insertedData: any = null;
    const mockInsertQuery = {
      insert: vi
        .fn()
        .mockImplementation((data) => {
          insertedData = data;
          return {
            select: vi.fn().mockResolvedValue({ data: [{ id: '1' }], error: null }),
          };
        }),
    };

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({ data: [mockProfile], error: null }),
    });

    mockSupabase.from.mockReturnValueOnce(mockInsertQuery);

    await importOrganizationFromCSVAction('area', csvContent);

    expect(insertedData[0].tenant_id).toBe(mockProfile.tenant_id);
  });
});
