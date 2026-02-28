/**
 * useUsuariosFilters Hook
 * Module-specific filter management for Usuários (Cadastros)
 */

'use client';

import {
  filterDefinitionsUsuarios,
  filterRegistryUsuarios,
  searchFieldsUsuarios,
} from '@/lib/filters/filters-usuarios';
import { applyFilters } from '@/lib/filters/filter-utils';
import { useFilterState } from '@/hooks/useFilterState';
import type { TenantUser } from '@/app/cadastros/usuarios/actions';

/**
 * Hook for managing Usuários filters with data
 */
export function useUsuariosFilters(users: TenantUser[]) {
  const filterState = useFilterState({
    moduleId: 'usuarios',
    definitions: filterDefinitionsUsuarios,
    initialViewMode: filterRegistryUsuarios.viewModes?.[0]?.id ?? 'kanban',
    persistence: {
      enabled: true,
      storageKey: 'filters-usuarios',
    },
  });

  const filteredData = applyFilters(users, filterState.filters, {
    search: filterState.search,
    searchFields: searchFieldsUsuarios,
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
    registry: {
      ...filterRegistryUsuarios,
      filters: filterDefinitionsUsuarios,
    },
  };
}
