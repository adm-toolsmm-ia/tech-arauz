/**
 * Filter Definitions - Organização Module (AI Organizational Bootstrap)
 * Configuração centralizada de filtros para Áreas, Processos, etc.
 */

import { List, LayoutGrid, Layers, Columns3, Building2 } from 'lucide-react';
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
    { id: 'kanban', label: 'Kanban', icon: Columns3, default: true },
    { id: 'list', label: 'Lista', icon: List },
    { id: 'cards', label: 'Cards', icon: LayoutGrid },
  ],
};

/**
 * Campos de busca para Áreas
 */
export const searchFieldsAreas = ['name', 'description', 'objective'];

/**
 * Filter Definitions para Núcleos
 */
export const filterDefinitionsNucleos: FilterDefinition[] = [
  {
    id: 'area_id',
    label: 'Área',
    type: 'select',
    options: [], // Dinâmico - populado via useNucleosFilters
    quickFilter: true,
    icon: Building2,
    description: 'Filtrar por área',
  },
  {
    id: 'com_processos',
    label: 'Com Processos',
    type: 'select',
    options: [
      { value: 'true', label: 'Sim' },
      { value: 'false', label: 'Não' },
    ],
    quickFilter: true,
    icon: Layers,
    description: 'Núcleos com processos vinculados',
  },
];

/**
 * Filter Registry para Núcleos
 */
export const filterRegistryNucleos: FilterRegistry = {
  moduleId: 'organizacao-nucleos',
  filters: filterDefinitionsNucleos,
  searchable: true,
  viewModes: [
    { id: 'kanban', label: 'Kanban', icon: Columns3, default: true },
    { id: 'list', label: 'Lista', icon: List },
    { id: 'cards', label: 'Cards', icon: LayoutGrid },
  ],
};

export const searchFieldsNucleos = ['name', 'description', 'objective', 'area_name'];
