/**
 * Filter Definitions - Projetos Module
 * Configuração centralizada de filtros para o módulo de Projetos
 *
 * Fase 2: Refatoração - Seguindo contexto consolidado em 07-filter-data-context.md
 */

import { CheckCircle2, AlertCircle, Users, Calendar, LayoutGrid, List } from 'lucide-react';
import { FilterDefinition, FilterRegistry } from './filter-types';

/**
 * Filter Definitions para Projetos
 * Quick Filters (4): status, prioridade, responsavel, prazo_final
 * Advanced Filters (6): + categoria, created_at
 * Search Fields: titulo, codigo, categoria
 */
export const filterDefinitionsProjetos: FilterDefinition[] = [
  // QUICK FILTERS
  {
    id: 'status',
    label: 'Status',
    type: 'multi-select',
    options: [
      { label: 'Novo', value: 'Novo' },
      { label: 'Em Análise', value: 'Em Análise' },
      { label: 'Em Desenvolvimento', value: 'Em Desenvolvimento' },
      { label: 'Em Homologação', value: 'Em Homologação' },
      { label: 'Concluído', value: 'Concluído' },
      { label: 'Cancelado', value: 'Cancelado' },
      { label: 'Suspenso', value: 'Suspenso' },
    ],
    quickFilter: true,
    icon: CheckCircle2,
    description: 'Filtrar projetos por status',
    multi: true,
    sortOptions: true,
  },

  {
    id: 'prioridade',
    label: 'Prioridade',
    type: 'multi-select',
    options: [
      { label: 'Baixa', value: 'Baixa' },
      { label: 'Normal', value: 'Normal' },
      { label: 'Alta', value: 'Alta' },
    ],
    quickFilter: true,
    icon: AlertCircle,
    description: 'Filtrar por nível de prioridade',
    multi: true,
  },

  {
    id: 'responsavel',
    label: 'Responsável',
    type: 'multi-select',
    options: [], // Dinâmico - populado via useProjetosFilters
    quickFilter: true,
    icon: Users,
    description: 'Filtrar projetos por responsável',
    multi: true,
    searchable: true,
  },

  {
    id: 'prazo_final',
    label: 'Prazo Final',
    type: 'date-range',
    quickFilter: true,
    icon: Calendar,
    description: 'Filtrar por intervalo de prazo',
    group: 'dates',
  },

  // ADVANCED FILTERS
  {
    id: 'categoria',
    label: 'Categoria',
    type: 'multi-select',
    options: [], // Dinâmico
    icon: undefined,
    description: 'Filtrar por categoria do projeto',
    multi: true,
    searchable: true,
    group: 'classification',
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
 * Filter Registry para o módulo Projetos
 * Exportar como FilterRegistry para uso em FilterBar
 */
export const filterRegistryProjetos: FilterRegistry = {
  moduleId: 'projetos',
  filters: filterDefinitionsProjetos,
  viewModes: [
    {
      id: 'kanban',
      label: 'Kanban',
      icon: LayoutGrid,
    },
    {
      id: 'list',
      label: 'Lista',
      icon: List,
    },
  ],
};

/**
 * Campos de busca (search)
 * Usados por useModuleFilters para filtrar com searchFields
 */
export const searchFieldsProjetos = ['titulo', 'codigo', 'categoria'];

/**
 * Valores estáticos de Status (para referência)
 */
export const projectStatusValues = [
  'Novo',
  'Em Análise',
  'Em Desenvolvimento',
  'Em Homologação',
  'Concluído',
  'Cancelado',
  'Suspenso',
] as const;

export type ProjectStatus = (typeof projectStatusValues)[number];

/**
 * Valores estáticos de Prioridade
 */
export const projectPriorityValues = ['Baixa', 'Normal', 'Alta'] as const;

export type ProjectPriority = (typeof projectPriorityValues)[number];
