/**
 * Filter Definitions - Modelos IA Module (Auxiliares)
 * Configuração centralizada de filtros para o módulo Modelos IA
 *
 * Campos de busca: name, model_id
 */

import { Grid3X3, LayoutGrid, List } from 'lucide-react';
import { FilterDefinition, FilterRegistry } from './filter-types';

/**
 * Filter Definitions para Modelos IA
 * Módulo auxiliar: apenas busca global (sem quick filters na v1)
 */
export const filterDefinitionsModelosIa: FilterDefinition[] = [];

/**
 * Filter Registry para o módulo Modelos IA
 * Padrão: mesmo ícone Kanban (LayoutGrid) que Projetos; 3 modos = Grid | Lista | Kanban
 * Ver: docs/architecture/PADRAO-KANBAN-VIEW-TOGGLE.md
 */
export const filterRegistryModelosIa: FilterRegistry = {
  moduleId: 'modelos-ia',
  filters: filterDefinitionsModelosIa,
  searchable: true,
  viewModes: [
    { id: 'grid', label: 'Grade', icon: Grid3X3 },
    { id: 'list', label: 'Lista', icon: List },
    { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
  ],
};
