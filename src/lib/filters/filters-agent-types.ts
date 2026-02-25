/**
 * Filter Definitions - Agent Types Module (Auxiliares)
 * Configuração centralizada de filtros para o módulo de Tipos de Agentes
 *
 * Campos de busca: name, slug, description
 */

import { FilterDefinition, FilterRegistry } from './filter-types';

/**
 * Filter Definitions para Tipos de Agentes
 * Módulo auxiliar: apenas busca global (sem quick filters na v1)
 */
export const filterDefinitionsAgentTypes: FilterDefinition[] = [];

/**
 * Filter Registry para o módulo Agent Types
 */
export const filterRegistryAgentTypes: FilterRegistry = {
  moduleId: 'agent-types',
  filters: filterDefinitionsAgentTypes,
  searchable: true,
};

/**
 * Campos de busca (search)
 */
export const searchFieldsAgentTypes = ['name', 'slug', 'description'];
