/**
 * useNucleosFilters Hook
 * Filtros para a página global de Núcleos
 */

'use client';

import * as React from 'react';
import {
  filterDefinitionsNucleos,
  filterRegistryNucleos,
  searchFieldsNucleos,
} from '@/lib/filters/filters-organizacao';
import { applyFilters } from '@/lib/filters/filter-utils';
import { useFilterState } from '@/hooks/useFilterState';
import type { OrgNucleus } from '@/types/organization';

export interface NucleusWithMeta extends OrgNucleus {
  processes_count?: number;
  area_name?: string;
}

export function useNucleosFilters(
  nuclei: NucleusWithMeta[],
  areas: { id: string; name: string }[],
) {
  const definitionsWithOptions = React.useMemo(() => {
    const areaOptions = areas.map((a) => ({ value: a.id, label: a.name }));
    return filterDefinitionsNucleos.map((f) =>
      f.id === 'area_id' ? { ...f, options: areaOptions } : f,
    );
  }, [areas]);

  const filterState = useFilterState({
    moduleId: 'organizacao-nucleos',
    definitions: definitionsWithOptions,
    initialViewMode: filterRegistryNucleos.viewModes?.[0]?.id ?? 'list',
    persistence: {
      enabled: true,
      storageKey: 'filters-organizacao-nucleos',
    },
  });

  const nucleiWithComputed = nuclei.map((n) => ({
    ...n,
    com_processos: (n.processes_count ?? 0) > 0 ? 'true' : 'false',
  }));

  const filteredData = applyFilters(nucleiWithComputed, filterState.filters, {
    search: filterState.search,
    searchFields: searchFieldsNucleos,
    matchMode: 'partial',
    caseSensitive: false,
  }) as NucleusWithMeta[];

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
    registry: { ...filterRegistryNucleos, filters: definitionsWithOptions },
  };
}
