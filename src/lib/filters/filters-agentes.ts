/**
 * Filter Registry - Módulo Agentes
 * viewModes padronizados: Kanban antes de Lista (como Projetos/Cronogramas)
 * Ver: docs/architecture/PADRAO-KANBAN-VIEW-TOGGLE.md
 */

import { LayoutGrid, List, FileEdit, Tags } from 'lucide-react';
import { FilterDefinition, FilterRegistry } from './filter-types';

export const filterDefinitionsAgentes: FilterDefinition[] = [
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'draft', label: 'Rascunho' },
      { value: 'published', label: 'Publicado' },
      { value: 'deprecated', label: 'Deprecado' },
    ],
    quickFilter: true,
    icon: FileEdit,
    description: 'Filtrar por status do agente',
  },
  {
    id: 'agentType',
    label: 'Tipo',
    type: 'select',
    options: [], // Dinâmico via useAgentesFilters
    quickFilter: true,
    icon: Tags,
    description: 'Filtrar por tipo de agente',
  },
  {
    id: 'usageType',
    label: 'Classificação',
    type: 'select',
    options: [
      { value: 'chatbot', label: '🗨️ Chatbot' },
      { value: 'workflow', label: '⚙️ Workflow' },
    ],
    quickFilter: true,
    description: 'Filtrar por tipo de uso (Chatbot ou Workflow)',
  },
];

export const filterRegistryAgentes: FilterRegistry = {
  moduleId: 'agentes',
  filters: filterDefinitionsAgentes,
  searchable: true,
  viewModes: [
    { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
    { id: 'list', label: 'Lista', icon: List },
  ],
};

export const searchFieldsAgentes = ['name', 'slug', 'description'];
