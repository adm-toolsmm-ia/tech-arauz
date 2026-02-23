/**
 * Tests for useFilterState hook
 * Coverage: filter initialization, state updates, persistence, callbacks
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFilterState } from '../useFilterState';
import { FilterDefinition, FilterPersistenceConfig } from '@/lib/filters/filter-types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('useFilterState', () => {
  const mockDefinitions: FilterDefinition[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      quickFilter: true,
      multi: false,
    },
    {
      id: 'priority',
      label: 'Priority',
      type: 'select',
      options: [
        { label: 'High', value: 'high' },
        { label: 'Low', value: 'low' },
      ],
      multi: false,
    },
  ];

  beforeEach(() => {
    localStorage.clear();
  });

  describe('initialization', () => {
    it('should initialize with all filters as null', () => {
      const { result } = renderHook(() =>
        useFilterState({
          moduleId: 'test',
          definitions: mockDefinitions,
        }),
      );

      expect(result.current.filters.status).toBeNull();
      expect(result.current.filters.priority).toBeNull();
      expect(result.current.activeFilterCount).toBe(0);
    });

    it('should restore filters from localStorage when persistence enabled', () => {
      const storedFilters = { status: 'active', priority: 'high' };
      localStorage.setItem('filters-test', JSON.stringify(storedFilters));

      const { result } = renderHook(() =>
        useFilterState({
          moduleId: 'test',
          definitions: mockDefinitions,
          persistence: { enabled: true },
        }),
      );

      expect(result.current.filters.status).toBe('active');
      expect(result.current.filters.priority).toBe('high');
    });

    it('should initialize search as empty string', () => {
      const { result } = renderHook(() =>
        useFilterState({
          moduleId: 'test',
          definitions: mockDefinitions,
        }),
      );

      expect(result.current.search).toBe('');
    });

    it('should initialize viewMode as kanban by default', () => {
      const { result } = renderHook(() =>
        useFilterState({
          moduleId: 'test',
          definitions: mockDefinitions,
        }),
      );

      expect(result.current.viewMode).toBe('kanban');
    });
  });

  describe('filter updates', () => {
    it('should update filter with updateFilter', () => {
      const { result } = renderHook(() =>
        useFilterState({
          moduleId: 'test',
          definitions: mockDefinitions,
        }),
      );

      act(() => {
        result.current.updateFilter('status', 'active');
      });

      expect(result.current.filters.status).toBe('active');
    });

    it('should set multiple filters with setFilters', () => {
      const { result } = renderHook(() =>
        useFilterState({
          moduleId: 'test',
          definitions: mockDefinitions,
        }),
      );

      const newFilters = { status: 'active', priority: 'high' };

      act(() => {
        result.current.setFilters(newFilters);
      });

      expect(result.current.filters.status).toBe('active');
      expect(result.current.filters.priority).toBe('high');
    });

    it('should update search with setSearch', () => {
      const { result } = renderHook(() =>
        useFilterState({
          moduleId: 'test',
          definitions: mockDefinitions,
        }),
      );

      act(() => {
        result.current.setSearch('test query');
      });

      expect(result.current.search).toBe('test query');
    });

    it('should update viewMode with setViewMode', () => {
      const { result } = renderHook(() =>
        useFilterState({
          moduleId: 'test',
          definitions: mockDefinitions,
        }),
      );

      act(() => {
        result.current.setViewMode('list');
      });

      expect(result.current.viewMode).toBe('list');
    });
  });

  describe('filter operations', () => {
    it('should reset all filters', () => {
      const { result } = renderHook(() =>
        useFilterState({
          moduleId: 'test',
          definitions: mockDefinitions,
        }),
      );

      act(() => {
        result.current.updateFilter('status', 'active');
      });

      expect(result.current.activeFilterCount).toBe(1);

      act(() => {
        result.current.resetAllFilters();
      });

      expect(result.current.filters.status).toBeNull();
      expect(result.current.filters.priority).toBeNull();
      expect(result.current.activeFilterCount).toBe(0);
    });

    it('should clear specific filters', () => {
      const { result } = renderHook(() =>
        useFilterState({
          moduleId: 'test',
          definitions: mockDefinitions,
        }),
      );

      act(() => {
        result.current.updateFilter('status', 'active');
        result.current.updateFilter('priority', 'high');
      });

      act(() => {
        result.current.clearFilters(['status']);
      });

      expect(result.current.filters.status).toBeNull();
      expect(result.current.filters.priority).toBe('high');
    });
  });

  describe('computed properties', () => {
    it('should compute activeFilterCount correctly', () => {
      const { result } = renderHook(() =>
        useFilterState({
          moduleId: 'test',
          definitions: mockDefinitions,
        }),
      );

      expect(result.current.activeFilterCount).toBe(0);

      act(() => {
        result.current.updateFilter('status', 'active');
      });

      expect(result.current.activeFilterCount).toBe(1);

      act(() => {
        result.current.updateFilter('priority', 'high');
      });

      expect(result.current.activeFilterCount).toBe(2);
    });

    it('should compute hasActiveFilters correctly', () => {
      const { result } = renderHook(() =>
        useFilterState({
          moduleId: 'test',
          definitions: mockDefinitions,
        }),
      );

      expect(result.current.hasActiveFilters).toBe(false);

      act(() => {
        result.current.updateFilter('status', 'active');
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should compute isFiltersEmpty correctly', () => {
      const { result } = renderHook(() =>
        useFilterState({
          moduleId: 'test',
          definitions: mockDefinitions,
        }),
      );

      expect(result.current.isFiltersEmpty).toBe(true);

      act(() => {
        result.current.updateFilter('status', 'active');
      });

      expect(result.current.isFiltersEmpty).toBe(false);
    });
  });

  describe('callbacks', () => {
    it('should call onFiltersChange callback', () => {
      const onFiltersChange = vi.fn();

      const { result } = renderHook(() =>
        useFilterState({
          moduleId: 'test',
          definitions: mockDefinitions,
          onFiltersChange,
        }),
      );

      act(() => {
        result.current.updateFilter('status', 'active');
      });

      expect(onFiltersChange).toHaveBeenCalled();
    });

    it('should call onSearchChange callback', () => {
      const onSearchChange = vi.fn();

      const { result } = renderHook(() =>
        useFilterState({
          moduleId: 'test',
          definitions: mockDefinitions,
          onSearchChange,
        }),
      );

      act(() => {
        result.current.setSearch('test');
      });

      expect(onSearchChange).toHaveBeenCalledWith('test');
    });

    it('should call onViewModeChange callback', () => {
      const onViewModeChange = vi.fn();

      const { result } = renderHook(() =>
        useFilterState({
          moduleId: 'test',
          definitions: mockDefinitions,
          onViewModeChange,
        }),
      );

      act(() => {
        result.current.setViewMode('list');
      });

      expect(onViewModeChange).toHaveBeenCalledWith('list');
    });
  });

  describe('persistence', () => {
    it('should persist filters to localStorage when persistence enabled', () => {
      const { result } = renderHook(() =>
        useFilterState({
          moduleId: 'test',
          definitions: mockDefinitions,
          persistence: { enabled: true },
        }),
      );

      act(() => {
        result.current.updateFilter('status', 'active');
      });

      const stored = localStorage.getItem('filters-test');
      expect(stored).toBeTruthy();
    });

    it('should use custom storageKey when provided', () => {
      const { result } = renderHook(() =>
        useFilterState({
          moduleId: 'test',
          definitions: mockDefinitions,
          persistence: { enabled: true, storageKey: 'custom-key' },
        }),
      );

      act(() => {
        result.current.updateFilter('status', 'active');
      });

      const stored = localStorage.getItem('custom-key');
      expect(stored).toBeTruthy();
    });
  });
});
