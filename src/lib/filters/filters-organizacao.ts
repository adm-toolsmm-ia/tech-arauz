/**
 * Filter Definitions - Organização Module (AI Organizational Bootstrap)
 * Configuração centralizada de filtros para Áreas, Processos, etc.
 */

import { List, LayoutGrid, Layers, Columns3 } from 'lucide-react';
import type { FilterDefinition, FilterRegistry } from './filter-types';

/**
 * Filter Definitions para Áreas
 * Search fields: name, description, objective
 */
export const filterDefinitionsAreas: FilterDefinition[] = [
  {
    id: 'com_nucleos',
    label: 'Com Núcleos',
    type: 'select',
    options: [
      { value: 'true', label: 'Sim' },
      { value: 'false', label: 'Não' },
    ],
    quickFilter: true,
    icon: Layers,
    description: 'Filtrar áreas que possuem núcleos cadastrados',
  },
];

/**
 * Filter Registry para o módulo Organização (Áreas)
 */
export const filterRegistryAreas: FilterRegistry = {
  moduleId: 'organizacao-areas',
  filters: filterDefinitionsAreas,
  searchable: true,
  viewModes: [
    { id: 'list', label: 'Lista', icon: List, default: true },
    { id: 'cards', label: 'Cards', icon: LayoutGrid },
    { id: 'kanban', label: 'Kanban', icon: Columns3 },
  ],
};

/**
 * Campos de busca para Áreas
 */
export const searchFieldsAreas = ['name', 'description', 'objective'];
