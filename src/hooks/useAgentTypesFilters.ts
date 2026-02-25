/**
 * useAgentTypesFilters Hook
 * Module-specific filter management for Tipos de Agentes (Auxiliares)
 */

'use client';

import {
  filterDefinitionsAgentTypes,
  filterRegistryAgentTypes,
  searchFieldsAgentTypes,
} from '@/lib/filters/filters-agent-types';
import { applyFilters } from '@/lib/filters/filter-utils';
import { useFilterState } from '@/hooks/useFilterState';
import type { AgentType } from '@/types/agents';

/**
 * Hook for managing Agent Types filters with data
 */
export function useAgentTypesFilters(agentTypes: AgentType[]) {
  const filterState = useFilterState({
    moduleId: 'agent-types',
    definitions: filterDefinitionsAgentTypes,
    persistence: {
      enabled: true,
      storageKey: 'filters-agent-types',
    },
  });

  const filteredData = applyFilters(agentTypes, filterState.filters, {
    search: filterState.search,
    searchFields: searchFieldsAgentTypes,
    matchMode: 'partial',
    caseSensitive: false,
  });

  return {
    filters: filterState.filters,
    search: filterState.search,
    filteredData,
    updateFilter: filterState.updateFilter,
    setSearch: filterState.setSearch,
    resetAllFilters: filterState.resetAllFilters,
    activeFilterCount: filterState.activeFilterCount,
    hasActiveFilters: filterState.hasActiveFilters,
    registry: filterRegistryAgentTypes,
  };
}
