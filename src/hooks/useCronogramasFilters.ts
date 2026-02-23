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
  // Computed fields
  proximo_vencer?: boolean;  // Computed: prazo vencendo em ≤ 7 dias
  sem_prazo?: boolean;       // Computed: sem data_prazo e sem data_fim
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

      // Update fase_atividade options from data
      if (def.id === 'fase_atividade') {
        return {
          ...def,
          options: buildFilterOptions(
            schedules,
            'fase_atividade',
            (v) => v || 'Sem Fase'
          ),
        };
      }

      return def;
    });
  }, [schedules]);

  // Pre-compute computed fields (proximo_vencer, sem_prazo)
  const schedulesWithComputed = useMemo(() => {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);

    return schedules.map((s) => {
      // Próximo vencer: prazo vencendo em ≤ 7 dias (não atrasado e não concluído)
      let proximo_vencer = false;
      const status = (s.status || '').trim().toLowerCase();
      if (status !== 'concluído' && status !== 'cancelado') {
        const deadlineStr = s.data_prazo || s.data_novo_prazo || s.data_fim;
        if (deadlineStr) {
          const deadline = new Date(deadlineStr);
          proximo_vencer = deadline >= today && deadline <= in7Days;
        }
      }

      // Sem prazo: sem data_prazo e sem data_fim
      const sem_prazo = !s.data_prazo && !s.data_fim;

      return { ...s, proximo_vencer, sem_prazo };
    });
  }, [schedules]);

  // Use centralized filter state management
  // NOTE: viewMode será 'kanban' por padrão do hook, mas cronogramas-content
  // deve inicializar com 'gantt'. Vêr cronogramas-content.tsx para override.
  const filterState = useFilterState({
    moduleId: 'cronogramas',
    definitions,
    persistence: {
      enabled: true,
      storageKey: 'filters-cronogramas',
    },
  });

  // Custom filter logic para campos boolean (atrasado, proximo_vencer, sem_prazo) + fase_atividade
  const filteredData = useMemo(() => {
    let data = schedulesWithComputed;

    // 1. Aplicar filtro de atrasado
    const atrasadoFilter = filterState.filters.atrasado;
    if (atrasadoFilter === 'true') {
      data = data.filter((s) => s.atrasado === true);
    } else if (atrasadoFilter === 'false') {
      data = data.filter((s) => !s.atrasado);
    }

    // 2. Aplicar filtro de próximo vencer
    const proximoVencerFilter = filterState.filters.proximo_vencer;
    if (proximoVencerFilter === 'true') {
      data = data.filter((s) => s.proximo_vencer === true);
    } else if (proximoVencerFilter === 'false') {
      data = data.filter((s) => !s.proximo_vencer);
    }

    // 3. Aplicar filtro de sem prazo
    const semPrazoFilter = filterState.filters.sem_prazo;
    if (semPrazoFilter === 'true') {
      data = data.filter((s) => s.sem_prazo === true);
    } else if (semPrazoFilter === 'false') {
      data = data.filter((s) => !s.sem_prazo);
    }

    // 4. Aplicar demais filtros (excluindo os já aplicados)
    const otherFilters = { ...filterState.filters };
    delete otherFilters.atrasado;
    delete otherFilters.proximo_vencer;
    delete otherFilters.sem_prazo;

    return applyFilters(data, otherFilters, {
      search: filterState.search,
      searchFields: searchFieldsCronogramas,
      matchMode: 'partial',
      caseSensitive: false,
    });
  }, [schedulesWithComputed, filterState.filters, filterState.search]);

  return {
    // State
    filters: filterState.filters,
    search: filterState.search,
    viewMode: filterState.viewMode,        // ✅ ViewMode do hook (persistido)
    definitions: filterState.definitions,
    filteredData,

    // Actions
    updateFilter: filterState.updateFilter,
    setSearch: filterState.setSearch,
    setViewMode: filterState.setViewMode,  // ✅ SetViewMode do hook
    setFilters: filterState.setFilters,
    resetAllFilters: filterState.resetAllFilters,
    clearFilters: filterState.clearFilters,

    // Metadata
    activeFilterCount: filterState.activeFilterCount,
    hasActiveFilters: filterState.hasActiveFilters,
    isFiltersEmpty: filterState.isFiltersEmpty,

    // Registry (para usar em FilterBar) - com definitions dinâmicas
    registry: {
      ...filterRegistryCronogramas,
      filters: definitions,  // ✅ Definitions com options dinâmicas
    },
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
