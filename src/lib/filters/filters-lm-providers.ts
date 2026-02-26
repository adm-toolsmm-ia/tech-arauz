/**
 * Filter definitions - LM Providers module.
 */

import { LayoutGrid, List, Power, Lock } from 'lucide-react';
import { FilterDefinition, FilterRegistry } from './filter-types';

export const filterDefinitionsLmProviders: FilterDefinition[] = [
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
    description: 'Filtrar por status de ativacao',
  },
  {
    id: 'is_system',
    label: 'Origem',
    type: 'select',
    options: [
      { value: true, label: 'Sistema' },
      { value: false, label: 'Customizado' },
    ],
    quickFilter: true,
    icon: Lock,
    description: 'Filtrar provedores de sistema ou customizados',
  },
];

export const filterRegistryLmProviders: FilterRegistry = {
  moduleId: 'lm-providers',
  filters: filterDefinitionsLmProviders,
  searchable: true,
  viewModes: [
    { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
    { id: 'list', label: 'Lista', icon: List },
  ],
};

export const searchFieldsLmProviders = ['name', 'slug', 'description'];
