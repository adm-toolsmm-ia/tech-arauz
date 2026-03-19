/**
 * useOrganizacaoFilters Hook
 * Module-specific filter management for AI Organizational Bootstrap (Áreas, Núcleos, Processos)
 */

'use client';

import {
  filterDefinitionsAreas,
  filterRegistryAreas,
  searchFieldsAreas,
  filterDefinitionsProcessos,
  filterRegistryProcessos,
  searchFieldsProcessos,
} from '@/lib/filters/filters-organizacao';
import { applyFilters } from '@/lib/filters/filter-utils';
import { useFilterState } from '@/hooks/useFilterState';
import type { OrgArea, OrgProcess } from '@/types/organization';

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

  const areasWithComputed = areas.map((a) => ({
    ...a,
    com_nucleos: (a.nuclei_count ?? 0) > 0 ? 'true' : 'false',
  }));

  const filteredData = applyFilters(areasWithComputed, filterState.filters, {
    search: filterState.search,
    searchFields: searchFieldsAreas,
    matchMode: 'partial',
    caseSensitive: false,
  }) as OrgArea[];

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

/**
 * Hook for managing Processos filters
 */
export function useProcessosFilters(
  processes: OrgProcess[],
  areaMap: Record<string, string>,
  nucleusMap: Record<string, string>,
  routinesByProcessId: Record<string, unknown[]>,
) {
  // Build dynamic area options from the available processes
  const areaOptions = Object.entries(areaMap).map(([id, name]) => ({
    value: id,
    label: name,
  }));

  const definitions = filterDefinitionsProcessos.map((def) => {
    if (def.id === 'area_id') return { ...def, options: areaOptions };
    return def;
  });

  const filterState = useFilterState({
    moduleId: 'organizacao-processos',
    definitions,
    initialViewMode: filterRegistryProcessos.viewModes?.[0]?.id ?? 'list',
    persistence: {
      enabled: true,
      storageKey: 'filters-organizacao-processos',
    },
  });

  const processesWithComputed = processes.map((p) => ({
    ...p,
    area_name: p.area_id ? areaMap[p.area_id] ?? '' : '',
    nucleus_name: p.nucleus_id ? nucleusMap[p.nucleus_id] ?? '' : '',
    com_rotinas: (routinesByProcessId[p.id] ?? []).length > 0 ? 'true' : 'false',
  }));

  const filteredData = applyFilters(processesWithComputed, filterState.filters, {
    search: filterState.search,
    searchFields: searchFieldsProcessos,
    matchMode: 'partial',
    caseSensitive: false,
  }) as OrgProcess[];

  const registry = {
    ...filterRegistryProcessos,
    filters: definitions,
  };

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
    registry,
  };
}
