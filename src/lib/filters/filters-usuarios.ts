/**
 * Filter definitions - Usuários module (Cadastros)
 */

import { LayoutGrid, List, Shield, UserCheck } from 'lucide-react';
import { FilterDefinition, FilterRegistry } from './filter-types';

export const filterDefinitionsUsuarios: FilterDefinition[] = [
  {
    id: 'role',
    label: 'Perfil',
    type: 'select',
    options: [
      { value: 'admin', label: 'Administrador' },
      { value: 'user', label: 'Usuário' },
      { value: 'viewer', label: 'Visualizador' },
    ],
    quickFilter: true,
    icon: Shield,
    description: 'Filtrar por perfil de acesso',
  },
  {
    id: 'isActive',
    label: 'Status',
    type: 'select',
    options: [
      { value: true, label: 'Ativo' },
      { value: false, label: 'Inativo' },
    ],
    quickFilter: true,
    icon: UserCheck,
    description: 'Filtrar por status de ativação',
  },
];

export const filterRegistryUsuarios: FilterRegistry = {
  moduleId: 'usuarios',
  filters: filterDefinitionsUsuarios,
  searchable: true,
  viewModes: [
    { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
    { id: 'list', label: 'Lista', icon: List },
  ],
};

export const searchFieldsUsuarios = ['full_name', 'email'];
