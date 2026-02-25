/**
 * Filter Definitions - LM Providers Module (Auxiliares)
 * Configuração centralizada de filtros para o módulo de Provedores de LM
 *
 * Campos de busca: name, slug, description
 */

import { FilterDefinition, FilterRegistry } from './filter-types';

/**
 * Filter Definitions para Provedores de LM
 * Módulo auxiliar: apenas busca global (sem quick filters na v1)
 */
export const filterDefinitionsLmProviders: FilterDefinition[] = [];

/**
 * Filter Registry para o módulo LM Providers
 */
export const filterRegistryLmProviders: FilterRegistry = {
  moduleId: 'lm-providers',
  filters: filterDefinitionsLmProviders,
  searchable: true,
};

/**
 * Campos de busca (search)
 */
export const searchFieldsLmProviders = ['name', 'slug', 'description'];
