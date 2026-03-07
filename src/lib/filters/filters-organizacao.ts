/**
 * Filter Definitions - Organização Module (AI Organizational Bootstrap)
 * Configuração centralizada de filtros para Áreas, Processos, etc.
 */

import { List, LayoutGrid } from 'lucide-react';
import type { FilterDefinition, FilterRegistry } from './filter-types';

/**
 * Filter Definitions para Áreas
 * Search fields: name, description, objective
 */
export const filterDefinitionsAreas: FilterDefinition[] = [];

/**
 * Filter Registry para o módulo Organização (Áreas)
 */
export const filterRegistryAreas: FilterRegistry = {
  moduleId: 'organizacao-areas',
  filters: filterDefinitionsAreas,
  searchable: true,
  viewModes: [
    { id: 'list', label: 'Lista', icon: List, default: true },
    { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
  ],
};

/**
 * Campos de busca para Áreas
 */
export const searchFieldsAreas = ['name', 'description', 'objective'];
