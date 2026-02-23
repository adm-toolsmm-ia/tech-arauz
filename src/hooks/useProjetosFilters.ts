/**
 * useProjetosFilters Hook
 * Module-specific filter management for Projetos
 *
 * Modernizado para usar:
 * - filterDefinitionsProjetos (Fase 2)
 * - useFilterState (state management com persistência)
 * - applyFilters (lógica de filtro centralizada)
 */

'use client';

import { useCallback, useMemo } from 'react';
import {
  filterDefinitionsProjetos,
  filterRegistryProjetos,
  searchFieldsProjetos,
} from '@/lib/filters/filters-projetos';
import { applyFilters, buildFilterOptions } from '@/lib/filters/filter-utils';
import { useFilterState } from '@/hooks/useFilterState';
import { FilterState } from '@/lib/filters/filter-types';

/**
 * Project data interface
 */
export interface ProjetosData {
  id: string;
  espaider_code: string;
  project_name: string;
  status?: string | null;
  original_status?: string | null;
  fase_atual?: string | null;
  prazo_fase?: string | null;
  area?: string | null;
  current_situation?: string | null;
  last_update?: string | null;
  cronograma_atual?: string | null;
  prazo_cronograma?: string | null;
  pasta_consultivo?: string | null;
  aprovador_atual?: string | null;
  prazo_aprovador?: string | null;
  solucao_aplicada?: string | null;
  data_encerramento?: string | null;
  data_inicio_aprovacao?: string | null;
  trm_espaider?: string | null;
  tipo_chamado?: string | null;
  tipo_assunto?: string | null;
  solicitante?: string | null;
  objetivo?: string | null;
  motivo_importancia_especial?: string | null;
  mensagem_movimentacao?: string | null;
  justificativa?: string | null;
  importancia_especial?: boolean | null;
  impacto_operacional?: string | null;
  impacto_estrategico?: string | null;
  escopo?: string | null;
  complexidade_tecnica?: string | null;
  notes_html?: string | null;
  total_value?: number | null;
  responsible?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  priority?: string | null;
  category?: string | null;
  updated_at?: string | null;
  data_movimentacao?: string | null;
  schedules?: any[];
  deliveries?: any[];
  histories?: any[];
  approvers?: any[];
  budgets?: any[];
}

/**
 * Hook for managing Projetos filters with data
 *
 * @param projects Array of project data to filter
 */
export function useProjetosFilters(projects: ProjetosData[]) {
  // Update filter definitions with dynamic options from actual data
  const definitions = useMemo(() => {
    return filterDefinitionsProjetos.map((def) => {
      // Update responsavel options from data
      if (def.id === 'responsavel') {
        return {
          ...def,
          options: buildFilterOptions(
            projects,
            'responsible',
            (v) => v || 'Sem Responsável'
          ),
        };
      }

      // Update categoria options from data
      if (def.id === 'categoria') {
        return {
          ...def,
          options: buildFilterOptions(
            projects,
            'category',
            (v) => v || 'Sem Categoria'
          ),
        };
      }

      return def;
    });
  }, [projects]);

  // Use centralized filter state management
  const filterState = useFilterState({
    moduleId: 'projetos',
    definitions,
    persistence: {
      enabled: true,
      storageKey: 'filters-projetos',
    },
  });

  // Apply filters to projects
  const filteredData = useMemo(() => {
    return applyFilters(projects, filterState.filters, {
      search: filterState.search,
      searchFields: searchFieldsProjetos,
      matchMode: 'partial',
      caseSensitive: false,
    });
  }, [projects, filterState.filters, filterState.search]);

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
    registry: filterRegistryProjetos,
  };
}

/**
 * Hook to get just the filtered projects without full state (para uso avançado)
 */
export function useProjetosFilteredList(
  projects: ProjetosData[],
  filters: FilterState,
  search: string
) {
  return useMemo(() => {
    return applyFilters(projects, filters, {
      search,
      searchFields: searchFieldsProjetos,
      matchMode: 'partial',
      caseSensitive: false,
    });
  }, [projects, filters, search]);
}
