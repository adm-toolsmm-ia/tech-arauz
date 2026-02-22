/**
 * Projetos Module Filter Definitions
 * Defines all available filters for the Projetos module
 */

import { FilterRegistry, ViewMode } from '@/lib/filters/filter-types';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  User,
  Zap,
  FolderOpen,
} from 'lucide-react';

/**
 * View modes for Projetos
 */
export const PROJETOS_VIEW_MODES: ViewMode[] = [
  {
    id: 'kanban',
    label: 'Kanban',
    icon: FolderOpen,
    default: true,
  },
  {
    id: 'list',
    label: 'Lista',
    icon: CheckCircle2,
  },
];

/**
 * Projetos filter registry with all available filters
 */
export const PROJETOS_FILTER_REGISTRY: FilterRegistry = {
  moduleId: 'projetos',
  searchable: true,
  viewModes: PROJETOS_VIEW_MODES,
  filters: [
    // ===== QUICK FILTERS (Top Bar) =====
    {
      id: 'status',
      label: 'Status',
      type: 'multi-select',
      group: 'Status',
      quickFilter: true,
      quickFilterLimit: 4,
      icon: AlertTriangle,
      description: 'Filter by project status',
      options: [
        { value: 'Iniciado', label: 'Iniciado', badge: 'Start' },
        { value: 'Em execução', label: 'Em execução', badge: 'Active' },
        { value: 'Concluído', label: 'Concluído', badge: 'Done' },
        { value: 'Cancelado', label: 'Cancelado', badge: 'Cancel' },
      ],
      defaultValue: [],
      searchable: true,
      clearable: true,
      sortOptions: true,
    },

    {
      id: 'priority',
      label: 'Prioridade',
      type: 'multi-select',
      group: 'Prioridade',
      quickFilter: true,
      quickFilterLimit: 3,
      icon: Zap,
      description: 'Filter by priority level',
      options: [
        { value: 'Crítica', label: 'Crítica' },
        { value: 'Alta', label: 'Alta' },
        { value: 'Média', label: 'Média' },
        { value: 'Baixa', label: 'Baixa' },
      ],
      defaultValue: [],
      searchable: false,
      clearable: true,
    },

    {
      id: 'responsible',
      label: 'Responsável',
      type: 'multi-select',
      group: 'Pessoas',
      quickFilter: true,
      quickFilterLimit: 5,
      icon: User,
      description: 'Filter by project owner',
      options: () => [], // Will be populated dynamically from data
      defaultValue: [],
      searchable: true,
      clearable: true,
    },

    // ===== ADVANCED FILTERS (Sheet) =====
    {
      id: 'fase_atual',
      label: 'Fase Atual',
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
      id: 'area',
      label: 'Área',
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
      id: 'tipo_chamado',
      label: 'Tipo de Chamado',
      type: 'multi-select',
      group: 'Classificação',
      quickFilter: false,
      options: () => [], // Dynamic from data
      defaultValue: [],
      searchable: true,
      clearable: true,
      sortOptions: true,
    },

    {
      id: 'tipo_assunto',
      label: 'Tipo de Assunto',
      type: 'multi-select',
      group: 'Classificação',
      quickFilter: false,
      options: () => [], // Dynamic from data
      defaultValue: [],
      searchable: true,
      clearable: true,
      sortOptions: true,
    },

    {
      id: 'solicitante',
      label: 'Solicitante',
      type: 'multi-select',
      group: 'Pessoas',
      quickFilter: false,
      options: () => [], // Dynamic from data
      defaultValue: [],
      searchable: true,
      clearable: true,
      sortOptions: true,
    },

    {
      id: 'complexidade_tecnica',
      label: 'Complexidade Técnica',
      type: 'multi-select',
      group: 'Avaliação',
      quickFilter: false,
      options: [
        { value: 'Baixa', label: 'Baixa' },
        { value: 'Média', label: 'Média' },
        { value: 'Alta', label: 'Alta' },
        { value: 'Crítica', label: 'Crítica' },
      ],
      defaultValue: [],
      searchable: false,
      clearable: true,
    },

    {
      id: 'impacto_operacional',
      label: 'Impacto Operacional',
      type: 'multi-select',
      group: 'Avaliação',
      quickFilter: false,
      options: [
        { value: 'Nenhum', label: 'Nenhum' },
        { value: 'Baixo', label: 'Baixo' },
        { value: 'Médio', label: 'Médio' },
        { value: 'Alto', label: 'Alto' },
      ],
      defaultValue: [],
      searchable: false,
      clearable: true,
    },

    {
      id: 'date_range',
      label: 'Período',
      type: 'date-range',
      group: 'Datas',
      quickFilter: false,
      placeholder: 'Select date range',
      defaultValue: { start: '', end: '' },
      clearable: true,
    },

    {
      id: 'importancia_especial',
      label: 'Importância Especial',
      type: 'checkbox',
      group: 'Classificação',
      quickFilter: false,
      defaultValue: false,
    },
  ],
};

/**
 * Helper function to update dynamic filter options
 */
export function updateProjetosFilterOptions(
  registry: FilterRegistry,
  fieldName: string,
  options: Array<{ value: any; label: string }>,
) {
  const filterIndex = registry.filters.findIndex((f) => f.id === fieldName);
  if (filterIndex !== -1 && registry.filters[filterIndex].options) {
    registry.filters[filterIndex].options = options;
  }
}
