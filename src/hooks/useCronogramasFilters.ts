/**
 * useCronogramasFilters Hook
 * Module-specific filter management for Cronogramas
 */

'use client';

import { useMemo } from 'react';
import {
  CRONOGRAMAS_FILTER_REGISTRY,
  updateCronogramasFilterOptions,
} from '@/lib/filters/filters-cronogramas';
import { applyFilters, buildFilterOptions } from '@/lib/filters/filter-utils';
import { useModuleFilters } from '@/hooks/useFilterState';
import { FilterState } from '@/lib/filters/filter-types';

/**
 * Schedule data interface (from cronogramas-content.tsx)
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
  project?: {
    id: string;
    titulo: string | null;
    codigo: string | null;
    status: string | null;
    fase_atual: string | null;
  } | null;
}

/**
 * Apply Cronogramas-specific filters to data
 */
function filterCronogramasData(
  schedules: CronogramaData[],
  filters: FilterState,
  search: string,
): CronogramaData[] {
  // Handle period quick filters (convert to date range)
  let dateFilters = filters;
  if (filters.period && Array.isArray(filters.period)) {
    const today = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    filters.period.forEach((period: string) => {
      const periodStart = new Date(today);
      const periodEnd = new Date(today);

      switch (period) {
        case 'this_week':
          periodStart.setDate(today.getDate() - today.getDay());
          periodEnd.setDate(today.getDate() - today.getDay() + 6);
          break;
        case 'this_month':
          periodStart.setDate(1);
          periodEnd.setMonth(periodEnd.getMonth() + 1);
          periodEnd.setDate(0);
          break;
        case 'next_30_days':
          periodEnd.setDate(today.getDate() + 30);
          break;
        case 'overdue':
          periodEnd.setTime(today.getTime());
          periodStart.setFullYear(2000); // Far past
          break;
      }

      if (!startDate || periodStart < startDate) startDate = periodStart;
      if (!endDate || periodEnd > endDate) endDate = periodEnd;
    });

    if (startDate && endDate) {
      dateFilters = {
        ...filters,
        date_range: {
          start: (startDate as Date).toISOString().split('T')[0],
          end: (endDate as Date).toISOString().split('T')[0],
        },
      };
    }
  }

  return applyFilters(schedules, dateFilters, {
    search,
    searchFields: ['atividade', 'item', 'detalhamento', 'responsavel', 'project.titulo'],
    matchMode: 'partial',
    caseSensitive: false,
  });
}

/**
 * Hook for managing Cronogramas filters with data
 */
export function useCronogramasFilters(schedules: CronogramaData[]) {
  // Create registry copy (to avoid mutation)
  const filterRegistry = useMemo(() => {
    const registry = JSON.parse(JSON.stringify(CRONOGRAMAS_FILTER_REGISTRY));

    // Build dynamic filter options from actual data
    updateCronogramasFilterOptions(
      registry,
      'responsavel',
      buildFilterOptions(schedules, 'responsavel', (v) => v || 'Sem Responsável'),
    );

    updateCronogramasFilterOptions(
      registry,
      'atividade',
      buildFilterOptions(schedules, 'atividade', (v) => v || 'Sem Atividade'),
    );

    updateCronogramasFilterOptions(
      registry,
      'setor_responsavel',
      buildFilterOptions(schedules, 'setor_responsavel', (v) => v || 'Sem Setor'),
    );

    updateCronogramasFilterOptions(
      registry,
      'project_id',
      buildFilterOptions(schedules, 'project_id', (v) => {
        const schedule = schedules.find((s) => s.project_id === v);
        return schedule?.project?.titulo || String(v);
      }),
    );

    updateCronogramasFilterOptions(
      registry,
      'fase_atividade',
      buildFilterOptions(schedules, 'fase_atividade', (v) => v || 'Sem Fase'),
    );

    return registry;
  }, [schedules]);

  // Use module-specific filter hook
  const filterState = useModuleFilters(
    'cronogramas',
    filterRegistry.filters,
    schedules,
    filterCronogramasData,
    {
      persistence: {
        enabled: true,
        storageKey: 'cronogramas-filters',
      },
    },
  );

  return {
    ...filterState,
    registry: filterRegistry,
  };
}

/**
 * Hook to get just the filtered schedules without full state
 */
export function useCronogramasFilteredList(
  schedules: CronogramaData[],
  filters: FilterState,
  search: string,
) {
  return useMemo(() => {
    return filterCronogramasData(schedules, filters, search);
  }, [schedules, filters, search]);
}
