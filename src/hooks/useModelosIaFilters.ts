'use client';

import { useMemo } from 'react';
import {
  filterDefinitionsModelosIa,
  filterRegistryModelosIa,
  searchFieldsModelosIa,
} from '@/lib/filters/filters-modelos-ia';
import { applyFilters } from '@/lib/filters/filter-utils';
import { useFilterState } from '@/hooks/useFilterState';
import type { LmModel, LmProvider } from '@/types/agents';

export type ModelWithProvider = LmModel & { lm_providers?: LmProvider };

export function useModelosIaFilters(models: ModelWithProvider[], providers: LmProvider[]) {
  const definitions = useMemo(() => {
    return filterDefinitionsModelosIa.map((definition) => {
      if (definition.id === 'provider_id') {
        return {
          ...definition,
          options: providers.map((provider) => ({
            value: provider.id,
            label: `${provider.icon_emoji || 'AI'} ${provider.name}`,
          })),
        };
      }

      if (definition.id === 'tier') {
        const tiers = Array.from(
          new Set(
            models
              .map((model) => model.tier)
              .filter((tier): tier is NonNullable<ModelWithProvider['tier']> => tier != null),
          ),
        );

        return {
          ...definition,
          options: tiers.map((tier) => ({
            value: tier,
            label: tier.charAt(0).toUpperCase() + tier.slice(1),
          })),
        };
      }

      return definition;
    });
  }, [models, providers]);

  const filterState = useFilterState({
    moduleId: 'modelos-ia',
    definitions,
    initialViewMode: filterRegistryModelosIa.viewModes?.[0]?.id ?? 'grid',
    persistence: {
      enabled: true,
      storageKey: 'filters-modelos-ia',
    },
  });

  const filteredData = applyFilters(models, filterState.filters, {
    search: filterState.search,
    searchFields: searchFieldsModelosIa,
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
      ...filterRegistryModelosIa,
      filters: definitions,
    },
  };
}
