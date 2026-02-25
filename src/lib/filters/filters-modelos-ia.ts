/**
 * Filter Definitions - Modelos IA Module (Auxiliares)
 * Configuração centralizada de filtros para o módulo Modelos IA
 *
 * Campos de busca: name, model_id
 */

import { LayoutGrid, List } from 'lucide-react';
import { FilterDefinition, FilterRegistry } from './filter-types';

/**
 * Filter Definitions para Modelos IA
 * Módulo auxiliar: apenas busca global (sem quick filters na v1)
 */
export const filterDefinitionsModelosIa: FilterDefinition[] = [];

/**
 * Filter Registry para o módulo Modelos IA
 */
export const filterRegistryModelosIa: FilterRegistry = {
  moduleId: 'modelos-ia',
  filters: filterDefinitionsModelosIa,
  searchable: true,
  viewModes: [
    { id: 'list', label: 'Lista', icon: List },
    { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
  ],
};
