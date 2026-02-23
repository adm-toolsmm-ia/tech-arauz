/**
 * useProjetosFilters Hook
 * Module-specific filter management for Projetos
 *
 * IMPORTANTE: Os campos de filtro usam nomes UI (após transformação),
 * NÃO nomes do banco de dados.
 */

'use client';

import { useMemo } from 'react';
import {
  filterDefinitionsProjetos,
  filterRegistryProjetos,
  searchFieldsProjetos,
} from '@/lib/filters/filters-projetos';
import { applyFilters, buildFilterOptions } from '@/lib/filters/filter-utils';
import { useFilterState } from '@/hooks/useFilterState';
import { FilterState } from '@/lib/filters/filter-types';
import { phaseLabels } from '@/lib/constants/phase-labels';

/**
 * Project data interface (campos UI após transformação)
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
 * Normaliza fase para slug (mesmo padrão usado no Kanban)
 */
function normalizeFaseSlug(fase: string | null | undefined): string {
  if (!fase) return '';
  return fase
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Hook for managing Projetos filters with data
 */
export function useProjetosFilters(projects: ProjetosData[]) {
  // Update filter definitions with dynamic options from actual data
  const definitions = useMemo(() => {
    return filterDefinitionsProjetos.map((def) => {
      // fase_atual: opções dinâmicas baseadas nos dados reais + phaseLabels
      if (def.id === 'fase_atual') {
        const faseMap = new Map<string, string>();
        projects.forEach((p) => {
          if (p.fase_atual) {
            const slug = normalizeFaseSlug(p.fase_atual);
            const label = phaseLabels[slug] || p.fase_atual;
            faseMap.set(slug, label);
          }
        });
        return {
          ...def,
          options: Array.from(faseMap.entries())
            .map(([value, label]) => ({ value, label }))
            .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR')),
        };
      }

      // status: opções dinâmicas dos dados reais
      if (def.id === 'status') {
        return {
          ...def,
          options: buildFilterOptions(
            projects,
            'status',
            (v) => v || 'Sem Status'
          ),
        };
      }

      // responsible: opções dinâmicas dos dados reais
      if (def.id === 'responsible') {
        return {
          ...def,
          options: buildFilterOptions(
            projects,
            'responsible',
            (v) => v || 'Sem Responsável'
          ),
        };
      }

      // area: opções dinâmicas dos dados reais
      if (def.id === 'area') {
        return {
          ...def,
          options: buildFilterOptions(
            projects,
            'area',
            (v) => v || 'Sem Área'
          ),
        };
      }

      // priority: opções dinâmicas dos dados reais
      if (def.id === 'priority') {
        return {
          ...def,
          options: buildFilterOptions(
            projects,
            'priority',
            (v) => v || 'Sem Prioridade'
          ),
        };
      }

      // category: opções dinâmicas dos dados reais
      if (def.id === 'category') {
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

  // Custom filter logic para fase_atual (precisa normalizar o slug antes de comparar)
  const filteredData = useMemo(() => {
    const faseFilter = filterState.filters.fase_atual;
    const hasFaseFilter = Array.isArray(faseFilter) && faseFilter.length > 0;

    // Primeiro aplicar filtro de fase separadamente (porque usa slug normalizado)
    let data = projects;
    if (hasFaseFilter) {
      data = data.filter((p) => {
        const slug = normalizeFaseSlug(p.fase_atual);
        return faseFilter.includes(slug);
      });
    }

    // Depois aplicar demais filtros (excluindo fase_atual que já foi aplicado)
    const otherFilters = { ...filterState.filters };
    delete otherFilters.fase_atual;

    return applyFilters(data, otherFilters, {
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
