/**
 * useProjetosFilters Hook
 * Module-specific filter state and filtering rules for projetos.
 */

'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  filterDefinitionsProjetos,
  filterRegistryProjetos,
  searchFieldsProjetos,
} from '@/lib/filters/filters-projetos';
import { applyFilters, buildFilterOptions } from '@/lib/filters/filter-utils';
import { useFilterState } from '@/hooks/useFilterState';
import { phaseLabels } from '@/lib/constants/phase-labels';
import { normalizePhaseSlug } from '@/lib/domain/project-phase';
import { getOverdueData } from '@/lib/domain/project-health';
import {
  filterProjectsByAgendaPeriod,
  navigateAgendaRefDate,
  type ProjectAgendaPeriod,
} from '@/lib/domain/project-agenda';

/**
 * Project data interface (UI fields after transform).
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
  sem_movimentacao?: boolean;
  atrasado?: boolean;
}

/**
 * Hook for managing Projetos filters with data.
 */
export function useProjetosFilters(projects: ProjetosData[]) {
  const definitions = useMemo(() => {
    return filterDefinitionsProjetos.map((def) => {
      if (def.id === 'fase_atual') {
        const phaseMap = new Map<string, string>();

        projects.forEach((project) => {
          if (!project.fase_atual) return;

          const slug = normalizePhaseSlug(project.fase_atual);
          const label = phaseLabels[slug] || project.fase_atual;
          phaseMap.set(slug, label);
        });

        return {
          ...def,
          options: Array.from(phaseMap.entries())
            .map(([value, label]) => ({ value, label }))
            .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR')),
        };
      }

      if (def.id === 'status') {
        return {
          ...def,
          options: buildFilterOptions(projects, 'status', (value) => value || 'Sem status'),
        };
      }

      if (def.id === 'responsible') {
        return {
          ...def,
          options: buildFilterOptions(
            projects,
            'responsible',
            (value) => value || 'Sem responsavel',
          ),
        };
      }

      if (def.id === 'area') {
        return {
          ...def,
          options: buildFilterOptions(projects, 'area', (value) => value || 'Sem area'),
        };
      }

      if (def.id === 'priority') {
        return {
          ...def,
          options: buildFilterOptions(projects, 'priority', (value) => value || 'Sem prioridade'),
        };
      }

      if (def.id === 'category') {
        return {
          ...def,
          options: buildFilterOptions(projects, 'category', (value) => value || 'Sem categoria'),
        };
      }

      if (def.id === 'impacto_estrategico') {
        return {
          ...def,
          options: buildFilterOptions(
            projects,
            'impacto_estrategico',
            (value) => value || 'Sem impacto definido',
          ),
        };
      }

      return def;
    });
  }, [projects]);

  const projectsWithComputed = useMemo(() => {
    const now = new Date();

    return projects.map((project) => {
      let semMovimentacao = false;
      const normalizedStatus = (project.status || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      if (normalizedStatus === 'em execucao') {
        const lastMove = project.data_movimentacao || project.last_update || project.updated_at;

        if (!lastMove) {
          semMovimentacao = true;
        } else {
          const diffTime = now.getTime() - new Date(lastMove).getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          semMovimentacao = diffDays > 7;
        }
      }

      const atrasado = getOverdueData(project, now).isOverdue;

      return {
        ...project,
        sem_movimentacao: semMovimentacao,
        atrasado,
      };
    });
  }, [projects]);

  const [agendaPeriod, setAgendaPeriodState] = useState<ProjectAgendaPeriod>('month');
  const [agendaRefDate, setAgendaRefDate] = useState(() => new Date());

  const filterState = useFilterState({
    moduleId: 'projetos',
    definitions,
    persistence: {
      enabled: true,
      storageKey: 'filters-projetos',
    },
  });

  const setAgendaPeriod = useCallback((period: string) => {
    setAgendaPeriodState(period as ProjectAgendaPeriod);
  }, []);

  const navigateAgenda = useCallback(
    (direction: 1 | -1) => {
      setAgendaRefDate((prev) => navigateAgendaRefDate(prev, agendaPeriod, direction));
    },
    [agendaPeriod],
  );

  const filteredData = useMemo(() => {
    const faseFilter = filterState.filters.fase_atual;
    const hasFaseFilter = Array.isArray(faseFilter) && faseFilter.length > 0;

    let data = projectsWithComputed;

    if (hasFaseFilter) {
      data = data.filter((project) => {
        const slug = normalizePhaseSlug(project.fase_atual);
        return faseFilter.includes(slug);
      });
    }

    const importanceFilter = filterState.filters.importancia_especial;
    if (importanceFilter === 'true') {
      data = data.filter((project) => project.importancia_especial === true);
    } else if (importanceFilter === 'false') {
      data = data.filter((project) => !project.importancia_especial);
    }

    const withoutMovementFilter = filterState.filters.sem_movimentacao;
    if (withoutMovementFilter === 'true') {
      data = data.filter((project) => project.sem_movimentacao === true);
    } else if (withoutMovementFilter === 'false') {
      data = data.filter((project) => !project.sem_movimentacao);
    }

    const overdueFilter = filterState.filters.atrasado;
    if (overdueFilter === 'true') {
      data = data.filter((project) => project.atrasado === true);
    } else if (overdueFilter === 'false') {
      data = data.filter((project) => !project.atrasado);
    }

    const otherFilters = { ...filterState.filters };
    delete otherFilters.fase_atual;
    delete otherFilters.importancia_especial;
    delete otherFilters.sem_movimentacao;
    delete otherFilters.atrasado;

    return applyFilters(data, otherFilters, {
      search: filterState.search,
      searchFields: searchFieldsProjetos,
      matchMode: 'partial',
      caseSensitive: false,
    });
  }, [projectsWithComputed, filterState.filters, filterState.search]);

  return {
    filters: filterState.filters,
    search: filterState.search,
    viewMode: filterState.viewMode,
    definitions: filterState.definitions,
    filteredData,
    agendaPeriod,
    agendaRefDate,
    setAgendaPeriod,
    setAgendaRefDate,
    navigateAgenda,

    updateFilter: filterState.updateFilter,
    setSearch: filterState.setSearch,
    setViewMode: filterState.setViewMode,
    setFilters: filterState.setFilters,
    resetAllFilters: filterState.resetAllFilters,
    clearFilters: filterState.clearFilters,

    activeFilterCount: filterState.activeFilterCount,
    hasActiveFilters: filterState.hasActiveFilters,
    isFiltersEmpty: filterState.isFiltersEmpty,

    registry: {
      ...filterRegistryProjetos,
      filters: definitions,
    },
  };
}
