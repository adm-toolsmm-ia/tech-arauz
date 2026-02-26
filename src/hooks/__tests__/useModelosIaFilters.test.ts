import { act, renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useModelosIaFilters } from '../useModelosIaFilters';

Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  },
});

const providers = [
  {
    id: 'provider-openai',
    tenant_id: 'tenant-1',
    name: 'OpenAI',
    slug: 'openai',
    is_active: true,
    is_system: true,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    icon_emoji: 'AI',
  },
];

const models = [
  {
    id: 'model-1',
    tenant_id: 'tenant-1',
    provider_id: 'provider-openai',
    name: 'GPT-4.1',
    model_id: 'gpt-4.1',
    tier: 'flagship',
    is_active: true,
    is_system: false,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  {
    id: 'model-2',
    tenant_id: 'tenant-1',
    provider_id: 'provider-openai',
    name: 'GPT-4.1-mini',
    model_id: 'gpt-4.1-mini',
    tier: 'balanced',
    is_active: false,
    is_system: false,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
];

describe('useModelosIaFilters', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('filters by active status and search term', () => {
    const { result } = renderHook(() => useModelosIaFilters(models as any, providers as any));

    act(() => {
      result.current.updateFilter('is_active', true);
      result.current.setSearch('gpt-4.1');
    });

    expect(result.current.filteredData).toHaveLength(1);
    expect(result.current.filteredData[0].id).toBe('model-1');
  });

  it('provides dynamic options for provider and tier filters', () => {
    const { result } = renderHook(() => useModelosIaFilters(models as any, providers as any));

    const providerFilter = result.current.registry.filters.find((f) => f.id === 'provider_id');
    const tierFilter = result.current.registry.filters.find((f) => f.id === 'tier');

    expect(providerFilter?.options).toBeDefined();
    expect(tierFilter?.options).toBeDefined();
    expect((providerFilter?.options as Array<{ value: string }>).some((o) => o.value === 'provider-openai')).toBe(true);
    expect((tierFilter?.options as Array<{ value: string }>).some((o) => o.value === 'flagship')).toBe(true);
  });
});
