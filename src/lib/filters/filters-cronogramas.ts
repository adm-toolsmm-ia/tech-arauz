/**
 * Cronogramas Module Filter Definitions
 * Defines all available filters for the Cronogramas (Schedules) module
 */

import { FilterRegistry, ViewMode } from '@/lib/filters/filter-types';
import { Calendar, CheckCircle2, AlertTriangle, User, FolderKanban, Clock } from 'lucide-react';

/**
 * View modes for Cronogramas
 */
export const CRONOGRAMAS_VIEW_MODES: ViewMode[] = [
  {
    id: 'day',
    label: 'Dia',
    icon: Calendar,
    default: true,
  },
  {
    id: 'week',
    label: 'Semana',
    icon: Clock,
  },
  {
    id: 'month',
    label: 'Mês',
    icon: Calendar,
  },
  {
    id: 'gantt',
    label: 'Gantt',
    icon: CheckCircle2,
  },
];

/**
 * Cronogramas filter registry with all available filters
 */
export const CRONOGRAMAS_FILTER_REGISTRY: FilterRegistry = {
  moduleId: 'cronogramas',
  searchable: true,
  viewModes: CRONOGRAMAS_VIEW_MODES,
  filters: [
    // ===== QUICK FILTERS (Top Bar) =====
    {
      id: 'status',
      label: 'Status',
      type: 'multi-select',
      group: 'Status',
      quickFilter: true,
      quickFilterLimit: 4,
      icon: CheckCircle2,
      description: 'Filter by activity status',
      options: [
        { value: 'Planejado', label: 'Planejado', badge: 'Plan' },
        { value: 'Em progresso', label: 'Em progresso', badge: 'Active' },
        { value: 'Concluído', label: 'Concluído', badge: 'Done' },
        { value: 'Atrasado', label: 'Atrasado', badge: 'Late' },
      ],
      defaultValue: [],
      searchable: true,
      clearable: true,
      sortOptions: true,
    },

    {
      id: 'period',
      label: 'Período',
      type: 'multi-select',
      group: 'Datas',
      quickFilter: true,
      quickFilterLimit: 3,
      icon: Calendar,
      description: 'Quick date period selection',
      options: [
        { value: 'this_week', label: 'Esta Semana' },
        { value: 'this_month', label: 'Este Mês' },
        { value: 'next_30_days', label: 'Próximos 30 Dias' },
        { value: 'overdue', label: 'Atrasado' },
      ],
      defaultValue: [],
      searchable: false,
      clearable: true,
    },

    {
      id: 'responsavel',
      label: 'Responsável',
      type: 'multi-select',
      group: 'Pessoas',
      quickFilter: true,
      quickFilterLimit: 5,
      icon: User,
      description: 'Filter by responsible person',
      options: () => [], // Will be populated dynamically from data
      defaultValue: [],
      searchable: true,
      clearable: true,
    },

    // ===== ADVANCED FILTERS (Sheet) =====
    {
      id: 'date_range',
      label: 'Intervalo de Datas',
      type: 'date-range',
      group: 'Datas',
      quickFilter: false,
      placeholder: 'Select date range',
      defaultValue: { start: '', end: '' },
      clearable: true,
    },

    {
      id: 'atividade',
      label: 'Atividade',
      type: 'multi-select',
      group: 'Execução',
      quickFilter: false,
      options: () => [], // Dynamic from data
      defaultValue: [],
      searchable: true,
      clearable: true,
      sortOptions: true,
    },

    {
      id: 'setor_responsavel',
      label: 'Setor Responsável',
      type: 'multi-select',
      group: 'Organização',
      quickFilter: false,
      options: () => [], // Dynamic from data
      defaultValue: [],
      searchable: true,
      clearable: true,
      sortOptions: true,
    },

    {
      id: 'project_id',
      label: 'Projeto',
      type: 'multi-select',
      group: 'Relacionamento',
      quickFilter: false,
      options: () => [], // Dynamic from data
      defaultValue: [],
      searchable: true,
      clearable: true,
      sortOptions: true,
    },

    {
      id: 'fase_atividade',
      label: 'Fase da Atividade',
      type: 'multi-select',
      group: 'Execução',
      quickFilter: false,
      options: () => [], // Dynamic from data
      defaultValue: [],
      searchable: true,
      clearable: true,
      sortOptions: true,
    },

    {
      id: 'atrasado',
      label: 'Apenas Atrasados',
      type: 'checkbox',
      group: 'Status',
      quickFilter: false,
      defaultValue: false,
    },
  ],
};

/**
 * Helper function to update dynamic filter options
 */
export function updateCronogramasFilterOptions(
  registry: FilterRegistry,
  fieldName: string,
  options: Array<{ value: any; label: string }>,
) {
  const filterIndex = registry.filters.findIndex((f) => f.id === fieldName);
  if (filterIndex !== -1 && registry.filters[filterIndex].options) {
    registry.filters[filterIndex].options = options;
  }
}
