/**
 * useProjetosFilters Hook
 * Module-specific filter management for Projetos
 */

'use client';

import { useMemo } from 'react';
import {
  PROJETOS_FILTER_REGISTRY,
  updateProjetosFilterOptions,
} from '@/lib/filters/filters-projetos';
import { applyFilters, buildFilterOptions } from '@/lib/filters/filter-utils';
import { useModuleFilters } from '@/hooks/useFilterState';
import { FilterState } from '@/lib/filters/filter-types';

/**
 * Project data interface (from projects-content.tsx)
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
 * Apply Projetos-specific filters to data
 */
function filterProjetosData(
  projects: ProjetosData[],
  filters: FilterState,
  search: string,
): ProjetosData[] {
  return applyFilters(projects, filters, {
    search,
    searchFields: ['project_name', 'espaider_code', 'objetivo', 'solicitante'],
    matchMode: 'partial',
    caseSensitive: false,
  });
}

/**
 * Hook for managing Projetos filters with data
 */
export function useProjetosFilters(projects: ProjetosData[]) {
  // Create registry copy (to avoid mutation)
  const filterRegistry = useMemo(() => {
    const registry = JSON.parse(JSON.stringify(PROJETOS_FILTER_REGISTRY));

    // Build dynamic filter options from actual data
    updateProjetosFilterOptions(
      registry,
      'responsible',
      buildFilterOptions(projects, 'responsible', (v) => v || 'Sem Responsável'),
    );

    updateProjetosFilterOptions(
      registry,
      'fase_atual',
      buildFilterOptions(projects, 'fase_atual', (v) => v || 'Sem Fase'),
    );

    updateProjetosFilterOptions(
      registry,
      'area',
      buildFilterOptions(projects, 'area', (v) => v || 'Sem Área'),
    );

    updateProjetosFilterOptions(
      registry,
      'tipo_chamado',
      buildFilterOptions(projects, 'tipo_chamado', (v) => v || 'Não Especificado'),
    );

    updateProjetosFilterOptions(
      registry,
      'tipo_assunto',
      buildFilterOptions(projects, 'tipo_assunto', (v) => v || 'Não Especificado'),
    );

    updateProjetosFilterOptions(
      registry,
      'solicitante',
      buildFilterOptions(projects, 'solicitante', (v) => v || 'Não Especificado'),
    );

    return registry;
  }, [projects]);

  // Use module-specific filter hook
  const filterState = useModuleFilters(
    'projetos',
    filterRegistry.filters,
    projects,
    filterProjetosData,
    {
      persistence: {
        enabled: true,
        storageKey: 'projetos-filters',
      },
    },
  );

  return {
    ...filterState,
    registry: filterRegistry,
  };
}

/**
 * Hook to get just the filtered projects without full state
 */
export function useProjetosFilteredList(
  projects: ProjetosData[],
  filters: FilterState,
  search: string,
) {
  return useMemo(() => {
    return filterProjetosData(projects, filters, search);
  }, [projects, filters, search]);
}
