/**
 * useOrganizacaoFilters Hook
 * Module-specific filter management for AI Organizational Bootstrap (Áreas, etc.)
 */

'use client';

import {
  filterDefinitionsAreas,
  filterRegistryAreas,
  searchFieldsAreas,
} from '@/lib/filters/filters-organizacao';
import { applyFilters } from '@/lib/filters/filter-utils';
import { useFilterState } from '@/hooks/useFilterState';
import type { OrgArea } from '@/types/organization';

/**
 * Hook for managing Areas filters
 */
export function useAreasFilters(areas: OrgArea[]) {
  const filterState = useFilterState({
    moduleId: 'organizacao-areas',
    definitions: filterDefinitionsAreas,
    initialViewMode: filterRegistryAreas.viewModes?.[0]?.id ?? 'list',
    persistence: {
      enabled: true,
      storageKey: 'filters-organizacao-areas',
    },
  });

  const filteredData = applyFilters(areas, filterState.filters, {
    search: filterState.search,
    searchFields: searchFieldsAreas,
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
    registry: filterRegistryAreas,
  };
}
