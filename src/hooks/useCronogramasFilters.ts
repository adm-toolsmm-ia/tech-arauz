/**
 * useCronogramasFilters Hook
 * Module-specific filter management for Cronogramas
 *
 * Modernizado para usar:
 * - filterDefinitionsCronogramas (Fase 2)
 * - useFilterState (state management com persistência)
 * - applyFilters (lógica de filtro centralizada)
 */

'use client';

import { useMemo } from 'react';
import {
  filterDefinitionsCronogramas,
  filterRegistryCronogramas,
  searchFieldsCronogramas,
} from '@/lib/filters/filters-cronogramas';
import { applyFilters, buildFilterOptions } from '@/lib/filters/filter-utils';
import { useFilterState } from '@/hooks/useFilterState';
import { FilterState } from '@/lib/filters/filter-types';

/**
 * Schedule data interface
 */
export interface CronogramaData {
  id: string;
  project_id: string;
  atividade: string | null;
  responsavel: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  status: string | null;
  fase_atividade: string | null;
  atrasado: boolean | null;
  setor_responsavel: string | null;
  item: string | null;
  detalhamento: string | null;
  data_prazo: string | null;
  data_novo_prazo: string | null;
  data_alerta_prazo: string | null;
  prazo_confirmado: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  project?: {
    id: string;
    titulo: string | null;
    codigo: string | null;
    status: string | null;
    fase_atual: string | null;
  } | null;
}

/**
 * Hook for managing Cronogramas filters with data
 */
export function useCronogramasFilters(schedules: CronogramaData[]) {
  // Update filter definitions with dynamic options from actual data
  const definitions = useMemo(() => {
    return filterDefinitionsCronogramas.map((def) => {
      // Update project_id options from data
      if (def.id === 'project_id') {
        const projectOptions = Array.from(
          new Map(
            schedules.map((s) => [
              s.project_id,
              {
                value: s.project_id,
                label: s.project?.titulo || s.project_id,
              },
            ])
          ).values()
        );
        return {
          ...def,
          options: projectOptions,
        };
      }

      // Update status options from data
      if (def.id === 'status') {
        return {
          ...def,
          options: buildFilterOptions(
            schedules,
            'status',
            (v) => v || 'Sem Status'
          ),
        };
      }

      // Update responsavel options from data
      if (def.id === 'responsavel') {
        return {
          ...def,
          options: buildFilterOptions(
            schedules,
            'responsavel',
            (v) => v || 'Sem Responsável'
          ),
        };
      }

      // Update setor_responsavel options from data
      if (def.id === 'setor_responsavel') {
        return {
          ...def,
          options: buildFilterOptions(
            schedules,
            'setor_responsavel',
            (v) => v || 'Sem Setor'
          ),
        };
      }

      return def;
    });
  }, [schedules]);

  // Use centralized filter state management
  const filterState = useFilterState({
    moduleId: 'cronogramas',
    definitions,
    persistence: {
      enabled: true,
      storageKey: 'filters-cronogramas',
    },
  });

  // Apply filters to schedules
  const filteredData = useMemo(() => {
    return applyFilters(schedules, filterState.filters, {
      search: filterState.search,
      searchFields: searchFieldsCronogramas,
      matchMode: 'partial',
      caseSensitive: false,
    });
  }, [schedules, filterState.filters, filterState.search]);

  return {
    // State
    filters: filterState.filters,
    search: filterState.search,
    viewMode: filterState.viewMode,
    definitions: filterState.definitions,
    filteredData,

    // Actions
    updateFilter: filterState.updateFilter,
    setSearch: filterState.setSearch,
    setViewMode: filterState.setViewMode,
    setFilters: filterState.setFilters,
    resetAllFilters: filterState.resetAllFilters,
    clearFilters: filterState.clearFilters,

    // Metadata
    activeFilterCount: filterState.activeFilterCount,
    hasActiveFilters: filterState.hasActiveFilters,
    isFiltersEmpty: filterState.isFiltersEmpty,

    // Registry (para usar em FilterBar)
    registry: filterRegistryCronogramas,
  };
}

/**
 * Hook to get just the filtered schedules without full state (para uso avançado)
 */
export function useCronogramasFilteredList(
  schedules: CronogramaData[],
  filters: FilterState,
  search: string
) {
  return useMemo(() => {
    return applyFilters(schedules, filters, {
      search,
      searchFields: searchFieldsCronogramas,
      matchMode: 'partial',
      caseSensitive: false,
    });
  }, [schedules, filters, search]);
}
