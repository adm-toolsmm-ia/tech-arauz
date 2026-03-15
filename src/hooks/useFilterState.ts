/**
 * useFilterState Hook
 * Centralized state management for module filters
 * Handles filter state, search, view mode, and persistence
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FilterState,
  FilterDefinition,
  FilterPersistenceConfig,
  SortConfig,
} from '@/lib/filters/filter-types';
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
  initialViewMode?: string; // Override default (e.g. from registry viewModes[].default)
  initialSort?: SortConfig | null;
  onFiltersChange?: (filters: FilterState) => void;
  onSearchChange?: (search: string) => void;
  onViewModeChange?: (mode: string) => void;
  onSortChange?: (sort: SortConfig | null) => void;
}

interface UseFilterStateReturn {
  filters: FilterState;
  search: string;
  viewMode: string;
  sortConfig: SortConfig | null;
  definitions: FilterDefinition[];
  setFilters: (filters: FilterState) => void;
  updateFilter: (filterId: string, value: unknown) => void;
  setSearch: (search: string) => void;
  setViewMode: (mode: string) => void;
  setSortConfig: (config: SortConfig | null) => void;
  resetAllFilters: () => void;
  clearFilters: (filterIds?: string[]) => void;
  activeFilterCount: number;
  hasActiveFilters: boolean;
  isFiltersEmpty: boolean;
}

interface UseModuleFiltersReturn<T extends Record<string, any>> extends UseFilterStateReturn {
  filteredData: T[];
}

/**
 * Hook for managing filter state with optional persistence
 */
export function useFilterState(options: UseFilterStateOptions): UseFilterStateReturn {
  const {
    moduleId,
    definitions,
    persistence = { enabled: false },
    initialViewMode,
    initialSort = null,
    onFiltersChange,
    onSearchChange,
    onViewModeChange,
    onSortChange,
  } = options;

  // Initialize filters (from localStorage or defaults)
  const [initialFilters, initialSortConfig] = useMemo(() => {
    let savedFilters = resetFilters(definitions);
    let savedSort = initialSort;

    if (persistence?.enabled) {
      const storageKey = persistence.storageKey || `filters-${moduleId}`;
      savedFilters = restoreFilters(storageKey, definitions);

      const sortStorageKey = `${storageKey}-sort`;
      try {
        const storedSort = localStorage.getItem(sortStorageKey);
        if (storedSort) {
          savedSort = JSON.parse(storedSort) as SortConfig;
        }
      } catch {
        console.warn(`Failed to restore sort from key: ${sortStorageKey}`);
      }
    }
    return [savedFilters, savedSort] as const;
  }, [moduleId, definitions, persistence, initialSort]);

  // State
  const [filters, setFiltersState] = useState<FilterState>(initialFilters);
  const [search, setSearchState] = useState('');
  const [viewMode, setViewModeState] = useState(
    initialViewMode ?? (definitions[0]?.group === 'viewMode' ? definitions[0].id : 'kanban'),
  );
  const [sortConfig, setSortState] = useState<SortConfig | null>(initialSortConfig);

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
    (filterId: string, value: unknown) => {
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

  const setSortConfig = useCallback(
    (newSort: SortConfig | null) => {
      setSortState(newSort);
      onSortChange?.(newSort);

      if (persistence?.enabled) {
        const storageKey = persistence.storageKey || `filters-${moduleId}`;
        const sortStorageKey = `${storageKey}-sort`;
        try {
          if (newSort) {
            localStorage.setItem(sortStorageKey, JSON.stringify(newSort));
          } else {
            localStorage.removeItem(sortStorageKey);
          }
        } catch {
          console.warn(`Failed to persist sort with key: ${sortStorageKey}`);
        }
      }
    },
    [onSortChange, persistence, moduleId],
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
    sortConfig,
    definitions,
    setFilters,
    updateFilter,
    setSearch,
    setViewMode,
    setSortConfig,
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
  filterFn: (
    data: T[],
    filters: FilterState,
    search: string,
    sortConfig?: SortConfig | null,
  ) => T[],
  options?: {
    persistence?: FilterPersistenceConfig;
    initialSort?: SortConfig | null;
    onDataChange?: (filtered: T[]) => void;
  },
): UseModuleFiltersReturn<T> {
  const filterState = useFilterState({
    moduleId,
    definitions,
    persistence: options?.persistence,
    initialSort: options?.initialSort,
  });

  const filteredData = useMemo(() => {
    const result = filterFn(data, filterState.filters, filterState.search, filterState.sortConfig);
    options?.onDataChange?.(result);
    return result;
  }, [data, filterState.filters, filterState.search, filterState.sortConfig, filterFn, options]);

  return {
    ...filterState,
    filteredData,
  };
}
