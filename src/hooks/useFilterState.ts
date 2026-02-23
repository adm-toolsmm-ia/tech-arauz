/**
 * useFilterState Hook
 * Centralized state management for module filters
 * Handles filter state, search, view mode, and persistence
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FilterState, FilterDefinition, FilterPersistenceConfig } from '@/lib/filters/filter-types';
import {
  resetFilters,
  clearFilters as clearFiltersUtil,
  mergeFilters,
  persistFilters,
  restoreFilters,
  countActiveFilters,
  areFiltersEqual,
} from '@/lib/filters/filter-utils';

interface UseFilterStateOptions {
  moduleId: string;
  definitions: FilterDefinition[];
  persistence?: FilterPersistenceConfig;
  onFiltersChange?: (filters: FilterState) => void;
  onSearchChange?: (search: string) => void;
  onViewModeChange?: (mode: string) => void;
}

interface UseFilterStateReturn {
  filters: FilterState;
  search: string;
  viewMode: string;
  definitions: FilterDefinition[];
  setFilters: (filters: FilterState) => void;
  updateFilter: (filterId: string, value: any) => void;
  setSearch: (search: string) => void;
  setViewMode: (mode: string) => void;
  resetAllFilters: () => void;
  clearFilters: (filterIds?: string[]) => void;
  activeFilterCount: number;
  hasActiveFilters: boolean;
  isFiltersEmpty: boolean;
}

/**
 * Hook for managing filter state with optional persistence
 */
export function useFilterState(options: UseFilterStateOptions): UseFilterStateReturn {
  const {
    moduleId,
    definitions,
    persistence = { enabled: false },
    onFiltersChange,
    onSearchChange,
    onViewModeChange,
  } = options;

  // Initialize filters (from localStorage or defaults)
  const initialFilters = useMemo(() => {
    if (persistence?.enabled) {
      const storageKey = persistence.storageKey || `filters-${moduleId}`;
      return restoreFilters(storageKey, definitions);
    }
    return resetFilters(definitions);
  }, [moduleId, definitions, persistence]);

  // State
  const [filters, setFiltersState] = useState<FilterState>(initialFilters);
  const [search, setSearchState] = useState('');
  const [viewMode, setViewModeState] = useState(
    definitions[0]?.group === 'viewMode' ? definitions[0].id : 'kanban',
  );

  // Callbacks
  const setFilters = useCallback(
    (newFilters: FilterState) => {
      if (areFiltersEqual(newFilters, filters)) return;

      setFiltersState(newFilters);

      // Persist if enabled
      if (persistence?.enabled) {
        const storageKey = persistence.storageKey || `filters-${moduleId}`;
        persistFilters(storageKey, newFilters);
      }

      // Notify parent
      onFiltersChange?.(newFilters);
    },
    [filters, moduleId, persistence, onFiltersChange],
  );

  const updateFilter = useCallback(
    (filterId: string, value: any) => {
      const newFilters = mergeFilters(filters, { [filterId]: value });
      setFilters(newFilters);
    },
    [filters, setFilters],
  );

  const setSearch = useCallback(
    (newSearch: string) => {
      setSearchState(newSearch);
      onSearchChange?.(newSearch);
    },
    [onSearchChange],
  );

  const setViewMode = useCallback(
    (mode: string) => {
      setViewModeState(mode);
      onViewModeChange?.(mode);
    },
    [onViewModeChange],
  );

  const resetAllFilters = useCallback(() => {
    const defaultFilters = resetFilters(definitions);
    setFilters(defaultFilters);
    setSearchState('');
  }, [definitions, setFilters]);

  const clearFilters = useCallback(
    (filterIds?: string[]) => {
      const clearedFilters = clearFiltersUtil(filters, definitions, filterIds);
      setFilters(clearedFilters);
    },
    [filters, definitions, setFilters],
  );

  // Computed values
  const activeFilterCount = useMemo(
    () => countActiveFilters(filters, definitions),
    [filters, definitions],
  );

  const hasActiveFilters = activeFilterCount > 0 || search.trim().length > 0;

  const isFiltersEmpty = useMemo(
    () =>
      Object.values(filters).every(
        (value) => !value || (Array.isArray(value) && value.length === 0),
      ) && !search.trim(),
    [filters, search],
  );

  // Persist on mount if not already done
  useEffect(() => {
    if (persistence?.enabled && !areFiltersEqual(filters, initialFilters)) {
      const storageKey = persistence.storageKey || `filters-${moduleId}`;
      persistFilters(storageKey, filters);
    }
  }, [filters, moduleId, persistence, initialFilters]);

  return {
    filters,
    search,
    viewMode,
    definitions,
    setFilters,
    updateFilter,
    setSearch,
    setViewMode,
    resetAllFilters,
    clearFilters,
    activeFilterCount,
    hasActiveFilters,
    isFiltersEmpty,
  };
}

/**
 * Hook for module-specific filter management
 * Combines filter state with data filtering
 */
export function useModuleFilters<T extends Record<string, any>>(
  moduleId: string,
  definitions: FilterDefinition[],
  data: T[],
  filterFn: (data: T[], filters: FilterState, search: string) => T[],
  options?: {
    persistence?: FilterPersistenceConfig;
    onDataChange?: (filtered: T[]) => void;
  },
) {
  const filterState = useFilterState({
    moduleId,
    definitions,
    persistence: options?.persistence,
  });

  const filteredData = useMemo(() => {
    const result = filterFn(data, filterState.filters, filterState.search);
    options?.onDataChange?.(result);
    return result;
  }, [data, filterState.filters, filterState.search, filterFn, options]);

  return {
    ...filterState,
    filteredData,
  };
}
