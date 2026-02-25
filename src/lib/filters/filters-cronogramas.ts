/**
 * Filter Definitions - Cronogramas Module
 * Configuração centralizada de filtros para o módulo de Cronogramas
 *
 * NOTA: Cronogramas usam dados diretos do banco (sem transformer),
 * então os IDs dos filtros correspondem aos nomes das colunas do banco.
 */

import {
  Building2,
  CheckCircle2,
  Users,
  Calendar,
  List,
  CalendarDays,
  LayoutTemplate,
  BarChartHorizontal,
  AlertCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
// NOTE: Calendar icon é usado 2x (filters + viewModes), ambos importantes para UX
import { FilterDefinition, FilterRegistry } from './filter-types';

/**
 * Filter Definitions para Cronogramas
 * Quick Filters (3): project_id, status, responsavel
 * Advanced Filters: setor_responsavel, data_fim, data_inicio
 * Search Fields: atividade, responsavel, project.titulo
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
    options: [], // Dinâmico - populado via useCronogramasFilters com dados reais
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

  // NOVOS QUICK FILTERS (Essenciais para Gestão de Cronogramas)

  {
    id: 'atrasado',
    label: 'Atrasadas',
    type: 'select',
    options: [
      { value: 'true', label: 'Atrasadas' },
      { value: 'false', label: 'No Prazo' },
    ],
    quickFilter: true,
    icon: AlertTriangle,
    description: 'Atividades com prazo vencido',
  },

  {
    id: 'proximo_vencer',
    label: 'Próximas do Prazo',
    type: 'select',
    options: [
      { value: 'true', label: 'Vencendo em ≤ 7 dias' },
      { value: 'false', label: 'Prazo > 7 dias' },
    ],
    quickFilter: true,
    icon: Clock,
    description: 'Atividades próximas de vencerem',
  },

  {
    id: 'sem_prazo',
    label: 'Data Ausente',
    type: 'select',
    options: [
      { value: 'true', label: 'Sem prazo/data' },
      { value: 'false', label: 'Com prazo/data' },
    ],
    quickFilter: true,
    icon: AlertCircle,
    description: 'Atividades sem prazo ou data de conclusão',
  },

  {
    id: 'fase_atividade',
    label: 'Fase',
    type: 'multi-select',
    options: [], // Dinâmico
    quickFilter: true,
    icon: LayoutTemplate,
    description: 'Filtrar por fase/estágio da atividade',
    multi: true,
    searchable: true,
  },

  // ADVANCED FILTERS
  {
    id: 'setor_responsavel',
    label: 'Setor',
    type: 'multi-select',
    options: [], // Dinâmico
    description: 'Filtrar por setor responsável',
    multi: true,
    searchable: true,
    group: 'classification',
  },

  {
    id: 'data_fim',
    label: 'Prazo',
    type: 'date-range',
    icon: Calendar,
    description: 'Filtrar por intervalo de prazo',
    group: 'dates',
  },

  {
    id: 'data_inicio',
    label: 'Data de Início',
    type: 'date-range',
    description: 'Filtrar por data de início',
    group: 'dates',
  },
];

/**
 * Filter Registry para o módulo Cronogramas
 *
 * Formas de visualização: Agenda (padrão), Gantt, Lista
 * Períodos da Agenda: Dia, Semana, Mês
 */
export const filterRegistryCronogramas: FilterRegistry = {
  moduleId: 'cronogramas',
  filters: filterDefinitionsCronogramas,
  viewModes: [
    {
      id: 'agenda',
      label: 'Agenda',
      icon: CalendarDays,
      default: true,
    },
    // ⚠️ GANTT REMOVIDO TEMPORARIAMENTE - Será re-habilitado no futuro após configuração
    {
      id: 'lista',
      label: 'Lista',
      icon: List,
    },
  ],
  agendaPeriods: [
    { id: 'day', label: 'Dia', icon: Calendar },
    { id: 'week', label: 'Semana', icon: Calendar },
    { id: 'month', label: 'Mês', icon: CalendarDays },
  ],
};

/**
 * Campos de busca (search)
 * Suporta dot notation para campos aninhados (ex: project.titulo)
 */
export const searchFieldsCronogramas = ['atividade', 'responsavel', 'project.titulo'];
