/**
 * Filter Definitions - Projetos Module
 * Configuração centralizada de filtros para o módulo de Projetos
 *
 * IMPORTANTE: Os IDs dos filtros DEVEM corresponder aos nomes dos campos UI
 * (após transformação em project.ts), NÃO aos nomes do banco de dados.
 * Ex: 'responsible' (UI) e não 'responsavel' (DB)
 */

import {
  CheckCircle2,
  Users,
  Calendar,
  LayoutGrid,
  List,
  Layers,
  Building2,
  Star,
  TrendingUp,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { FilterDefinition, FilterRegistry } from './filter-types';

/**
 * Filter Definitions para Projetos
 * Quick Filters (4): fase_atual, status, responsible, area
 * Advanced Filters: priority, category, end_date
 * Search Fields: project_name, espaider_code, area, responsible
 */
export const filterDefinitionsProjetos: FilterDefinition[] = [
  // QUICK FILTERS
  {
    id: 'fase_atual',
    label: 'Fase',
    type: 'multi-select',
    options: [], // Dinâmico - populado via useProjetosFilters com phaseLabels
    quickFilter: true,
    icon: Layers,
    description: 'Filtrar por fase do projeto (Kanban)',
    multi: true,
    searchable: true,
  },

  {
    id: 'status',
    label: 'Status',
    type: 'multi-select',
    options: [], // Dinâmico - populado via useProjetosFilters com dados reais
    quickFilter: true,
    icon: CheckCircle2,
    description: 'Filtrar projetos por status',
    multi: true,
    sortOptions: true,
  },

  {
    id: 'responsible',
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
    id: 'area',
    label: 'Área',
    type: 'multi-select',
    options: [], // Dinâmico - populado via useProjetosFilters
    quickFilter: true,
    icon: Building2,
    description: 'Filtrar por área de atuação',
    multi: true,
    searchable: true,
  },

  // NOVOS QUICK FILTERS (Essenciais para Gestão)

  {
    id: 'importancia_especial',
    label: 'Importância Especial',
    type: 'select',
    options: [
      { value: 'true', label: 'Sim' },
      { value: 'false', label: 'Não' },
    ],
    quickFilter: true,
    icon: Star,
    description: 'Projetos marcados como importância especial',
  },

  {
    id: 'impacto_estrategico',
    label: 'Impacto Estratégico',
    type: 'multi-select',
    options: [], // Dinâmico - populado via useProjetosFilters
    quickFilter: true,
    icon: TrendingUp,
    description: 'Nível de impacto estratégico (Alto/Médio/Baixo)',
    multi: true,
    sortOptions: true,
  },

  {
    id: 'sem_movimentacao',
    label: 'Sem Movimentação',
    type: 'select',
    options: [
      { value: 'true', label: 'Estagnados (> 7 dias)' },
      { value: 'false', label: 'Ativos (≤ 7 dias)' },
    ],
    quickFilter: true,
    icon: Clock,
    description: 'Projetos em execução sem movimentação > 7 dias',
  },

  {
    id: 'atrasado',
    label: 'Atrasados',
    type: 'select',
    options: [
      { value: 'true', label: 'Atrasados' },
      { value: 'false', label: 'No Prazo' },
    ],
    quickFilter: true,
    icon: AlertCircle,
    description: 'Projetos com prazo vencido',
  },

  // ADVANCED FILTERS
  {
    id: 'priority',
    label: 'Prioridade',
    type: 'multi-select',
    options: [], // Dinâmico - populado via useProjetosFilters
    description: 'Filtrar por nível de prioridade',
    multi: true,
    group: 'classification',
  },

  {
    id: 'category',
    label: 'Categoria',
    type: 'multi-select',
    options: [], // Dinâmico
    description: 'Filtrar por categoria do projeto',
    multi: true,
    searchable: true,
    group: 'classification',
  },

  {
    id: 'end_date',
    label: 'Prazo Final',
    type: 'date-range',
    icon: Calendar,
    description: 'Filtrar por intervalo de prazo',
    group: 'dates',
  },
];

/**
 * Filter Registry para o módulo Projetos
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
 * IMPORTANTE: Usar nomes UI (após transformação), NÃO nomes DB
 */
export const searchFieldsProjetos = ['project_name', 'espaider_code', 'area', 'responsible'];
