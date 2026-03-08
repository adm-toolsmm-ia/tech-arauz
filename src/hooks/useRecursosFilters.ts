/**
 * useRecursosFilters Hook
 * Filtros para a página Recursos (Sistemas, Fornecedores, Serviços, Documentos)
 */

'use client';

import {
  filterRegistryRecursos,
  searchFieldsRecursos,
} from '@/lib/filters/filters-recursos';
import { applyFilters } from '@/lib/filters/filter-utils';
import { useFilterState } from '@/hooks/useFilterState';

interface SearchableItem {
  name: string;
  description?: string | null;
  purpose?: string | null;
  type?: string | null;
}

export function useRecursosFilters<T extends SearchableItem>(items: T[]) {
  const filterState = useFilterState({
    moduleId: 'organizacao-recursos',
    definitions: [],
    initialViewMode: filterRegistryRecursos.viewModes?.[0]?.id ?? 'list',
    persistence: {
      enabled: true,
      storageKey: 'filters-organizacao-recursos',
    },
  });

  const filteredData = applyFilters(items, filterState.filters, {
    search: filterState.search,
    searchFields: searchFieldsRecursos,
    matchMode: 'partial',
    caseSensitive: false,
  }) as T[];

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
    registry: filterRegistryRecursos,
  };
}
