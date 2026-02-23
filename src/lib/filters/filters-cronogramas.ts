/**
 * Filter Definitions - Cronogramas Module
 * Configuração centralizada de filtros para o módulo de Cronogramas
 *
 * Fase 2: Refatoração - Seguindo contexto consolidado em 07-filter-data-context.md
 */

import { Building2, CheckCircle2, Users, Calendar, List } from 'lucide-react';
import { FilterDefinition, FilterRegistry } from './filter-types';

/**
 * Filter Definitions para Cronogramas
 * Quick Filters (4): project_id, status, responsavel, data_fim
 * Advanced Filters (6): + data_inicio, created_at
 * Search Fields: atividade, responsavel
 */
export const filterDefinitionsCronogramas: FilterDefinition[] = [
  // QUICK FILTERS
  {
    id: 'project_id',
    label: 'Projeto',
    type: 'select',
    options: [], // Dinâmico - populado via useCronogramasFilters
    quickFilter: true,
    icon: Building2,
    description: 'Filtrar cronogramas por projeto',
    searchable: true,
  },

  {
    id: 'status',
    label: 'Status',
    type: 'multi-select',
    options: [
      { label: 'Pendente', value: 'Pendente' },
      { label: 'Em Progresso', value: 'Em Progresso' },
      { label: 'Concluída', value: 'Concluída' },
      { label: 'Atrasada', value: 'Atrasada' },
      { label: 'Cancelada', value: 'Cancelada' },
    ],
    quickFilter: true,
    icon: CheckCircle2,
    description: 'Filtrar cronogramas por status',
    multi: true,
    sortOptions: true,
  },

  {
    id: 'responsavel',
    label: 'Responsável',
    type: 'multi-select',
    options: [], // Dinâmico
    quickFilter: true,
    icon: Users,
    description: 'Filtrar cronogramas por responsável',
    multi: true,
    searchable: true,
  },

  {
    id: 'data_fim',
    label: 'Prazo',
    type: 'date-range',
    quickFilter: true,
    icon: Calendar,
    description: 'Filtrar por intervalo de prazo',
    group: 'dates',
  },

  // ADVANCED FILTERS
  {
    id: 'data_inicio',
    label: 'Data de Início',
    type: 'date-range',
    description: 'Filtrar por data de início',
    group: 'dates',
  },

  {
    id: 'created_at',
    label: 'Data de Criação',
    type: 'date-range',
    description: 'Filtrar por período de criação',
    group: 'dates',
  },
];

/**
 * Filter Registry para o módulo Cronogramas
 */
export const filterRegistryCronogramas: FilterRegistry = {
  moduleId: 'cronogramas',
  filters: filterDefinitionsCronogramas,
  viewModes: [
    {
      id: 'list',
      label: 'Lista',
      icon: List,
    },
  ],
};

/**
 * Campos de busca (search)
 */
export const searchFieldsCronogramas = ['atividade', 'responsavel'];

/**
 * Valores estáticos de Status
 */
export const scheduleStatusValues = [
  'Pendente',
  'Em Progresso',
  'Concluída',
  'Atrasada',
  'Cancelada',
] as const;

export type ScheduleStatus = (typeof scheduleStatusValues)[number];
