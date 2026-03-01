/**
 * Filter Definitions - Agent Types Module (Auxiliares)
 * Configuração centralizada de filtros para o módulo de Tipos de Agentes
 *
 * Campos de busca: name, slug, description
 */

import { LayoutGrid, List, Power, Lock } from 'lucide-react';
import { FilterDefinition, FilterRegistry } from './filter-types';

/**
 * Filter Definitions para Tipos de Agentes
 * Quick filters: is_active, is_system (baseline Agentes AI)
 */
export const filterDefinitionsAgentTypes: FilterDefinition[] = [
  {
    id: 'is_active',
    label: 'Status',
    type: 'select',
    options: [
      { value: true, label: 'Ativo' },
      { value: false, label: 'Inativo' },
    ],
    quickFilter: true,
    icon: Power,
    description: 'Filtrar por status do tipo',
  },
  {
    id: 'is_system',
    label: 'Sistema',
    type: 'select',
    options: [
      { value: true, label: 'Sistema' },
      { value: false, label: 'Não-sistema' },
    ],
    quickFilter: true,
    icon: Lock,
    description: 'Filtrar por tipo de sistema',
  },
];

/**
 * Filter Registry para o módulo Agent Types
 */
export const filterRegistryAgentTypes: FilterRegistry = {
  moduleId: 'agent-types',
  filters: filterDefinitionsAgentTypes,
  searchable: true,
  viewModes: [
    { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
    { id: 'list', label: 'Lista', icon: List },
  ],
};

/**
 * Campos de busca (search)
 */
export const searchFieldsAgentTypes = ['name', 'slug', 'description'];
