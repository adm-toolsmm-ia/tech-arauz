/**
 * Filter Definitions - Recursos Module
 * Sistemas, Fornecedores, Serviços, Documentos
 */

import { List, LayoutGrid } from 'lucide-react';
import type { FilterRegistry } from './filter-types';

export const filterRegistryRecursos: FilterRegistry = {
  moduleId: 'organizacao-recursos',
  filters: [],
  searchable: true,
  viewModes: [
    { id: 'list', label: 'Lista', icon: List, default: true },
    { id: 'cards', label: 'Cards', icon: LayoutGrid },
  ],
};

export const searchFieldsRecursos = ['name', 'description', 'purpose', 'type'];
