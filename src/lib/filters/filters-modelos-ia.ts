/**
 * Filter definitions - Modelos IA module.
 */

import { Grid3X3, LayoutGrid, List, Building2, Layers, Power } from 'lucide-react';
import { FilterDefinition, FilterRegistry } from './filter-types';

export const filterDefinitionsModelosIa: FilterDefinition[] = [
  {
    id: 'provider_id',
    label: 'Fornecedor',
    type: 'multi-select',
    options: [],
    quickFilter: true,
    icon: Building2,
    description: 'Filtrar modelos por fornecedor',
    multi: true,
    searchable: true,
  },
  {
    id: 'tier',
    label: 'Tier',
    type: 'multi-select',
    options: [],
    quickFilter: true,
    icon: Layers,
    description: 'Filtrar por tier operacional',
    multi: true,
  },
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
    description: 'Filtrar por status do modelo',
  },
];

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

export const searchFieldsModelosIa = ['name', 'model_id', 'description'];
