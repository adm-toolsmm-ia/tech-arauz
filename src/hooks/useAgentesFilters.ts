/**
 * useAgentesFilters Hook
 * Module-specific filter management for Agentes
 */

'use client';

import { useMemo } from 'react';
import {
  filterDefinitionsAgentes,
  filterRegistryAgentes,
  searchFieldsAgentes,
} from '@/lib/filters/filters-agentes';
import { applyFilters } from '@/lib/filters/filter-utils';
import { useFilterState } from '@/hooks/useFilterState';
import { getUniqueAgentTypes } from '@/lib/domain/agent-rules';
import type { UIAgent } from '@/lib/transformers/agent';

/**
 * Hook for managing Agentes filters with data
 */
export function useAgentesFilters(agents: UIAgent[]) {
  const definitions = useMemo(() => {
    const uniqueTypes = getUniqueAgentTypes(agents);
    const usageTypesSet = new Set<'chatbot' | 'workflow'>(
      agents.map((a) => a.usageType || 'chatbot') as ('chatbot' | 'workflow')[]
    );
    const uniqueUsageTypes = Array.from(usageTypesSet);

    return filterDefinitionsAgentes.map((def) => {
      if (def.id === 'agentType') {
        return {
          ...def,
          options: uniqueTypes.map((type) => ({ value: type, label: type })),
        };
      }
      if (def.id === 'usageType') {
        return {
          ...def,
          options: [
            { value: 'chatbot', label: '🗨️ Chatbot' },
            { value: 'workflow', label: '⚙️ Workflow' },
          ].filter((opt) => (uniqueUsageTypes as string[]).includes(opt.value)),
        };
      }
      return def;
    });
  }, [agents]);

  const filterState = useFilterState({
    moduleId: 'agentes',
    definitions,
    initialViewMode: filterRegistryAgentes.viewModes?.[0]?.id ?? 'kanban',
    persistence: {
      enabled: true,
      storageKey: 'filters-agentes',
    },
  });

  const filteredData = applyFilters(agents, filterState.filters, {
    search: filterState.search,
    searchFields: searchFieldsAgentes,
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
      ...filterRegistryAgentes,
      filters: definitions,
    },
  };
}
