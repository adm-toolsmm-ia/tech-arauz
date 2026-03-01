/**
 * useLmProvidersFilters Hook
 * Module-specific filter management for Provedores IA (Auxiliares)
 */

'use client';

import {
  filterDefinitionsLmProviders,
  filterRegistryLmProviders,
  searchFieldsLmProviders,
} from '@/lib/filters/filters-lm-providers';
import { applyFilters } from '@/lib/filters/filter-utils';
import { useFilterState } from '@/hooks/useFilterState';
import type { LmProvider } from '@/types/agents';

/**
 * Hook for managing LM Providers filters with data
 */
export function useLmProvidersFilters(providers: LmProvider[]) {
  const filterState = useFilterState({
    moduleId: 'lm-providers',
    definitions: filterDefinitionsLmProviders,
    initialViewMode: filterRegistryLmProviders.viewModes?.[0]?.id ?? 'kanban',
    persistence: {
      enabled: true,
      storageKey: 'filters-lm-providers',
    },
  });

  const filteredData = applyFilters(providers, filterState.filters, {
    search: filterState.search,
    searchFields: searchFieldsLmProviders,
    matchMode: 'partial',
    caseSensitive: false,
  });

  return {
    filters: filterState.filters,
    search: filterState.search,
    viewMode: filterState.viewMode,
    setViewMode: filterState.setViewMode,
    filteredData,
    updateFilter: filterState.updateFilter,
    setSearch: filterState.setSearch,
    resetAllFilters: filterState.resetAllFilters,
    activeFilterCount: filterState.activeFilterCount,
    hasActiveFilters: filterState.hasActiveFilters,
    registry: filterRegistryLmProviders,
  };
}
