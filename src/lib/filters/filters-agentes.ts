/**
 * Filter Registry - Módulo Agentes
 * viewModes padronizados: mesmo ícone Kanban (LayoutGrid) que Projetos
 * Ver: docs/architecture/PADRAO-KANBAN-VIEW-TOGGLE.md
 */

import { Grid3X3, LayoutGrid, List } from 'lucide-react';
import { FilterDefinition, FilterRegistry } from './filter-types';

export const filterDefinitionsAgentes: FilterDefinition[] = [];

export const filterRegistryAgentes: FilterRegistry = {
  moduleId: 'agentes',
  filters: filterDefinitionsAgentes,
  searchable: true,
  viewModes: [
    { id: 'grid', label: 'Grade', icon: Grid3X3 },
    { id: 'list', label: 'Lista', icon: List },
    { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
  ],
};
