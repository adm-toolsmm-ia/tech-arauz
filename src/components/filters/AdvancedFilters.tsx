/**
 * AdvancedFilters Component
 * Advanced filtering with multi-select options
 */

'use client';

import * as React from 'react';
import { Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export interface FilterState {
  status?: string[];
  priority?: string[];
  owner?: string[];
}

interface AdvancedFiltersProps {
  statusOptions?: string[];
  priorityOptions?: string[];
  ownerOptions?: string[];
  onFiltersChange: (filters: FilterState) => void;
  defaultFilters?: FilterState;
}

const STATUS_OPTIONS = [
  'Projeto Futuro',
  'Em Aprovação',
  'Em Desenvolvimento',
  'Em Homologação',
  'Concluído',
  'Cancelado',
  'Suspenso',
];

const PRIORITY_OPTIONS = ['Urgente', 'Alta', 'Média', 'Baixa'];

const OWNER_OPTIONS = [
  'Gerente Sistemas',
  'Gerente Inovação',
  'Gerente Operações',
  'Todos os Gerentes',
];

export function AdvancedFilters({
  statusOptions = STATUS_OPTIONS,
  priorityOptions = PRIORITY_OPTIONS,
  ownerOptions = OWNER_OPTIONS,
  onFiltersChange,
  defaultFilters = {},
}: AdvancedFiltersProps) {
  const [filters, setFilters] = React.useState<FilterState>(defaultFilters);
  const [isOpen, setIsOpen] = React.useState(false);

  const handleStatusChange = (status: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      status: checked
        ? [...(prev.status || []), status]
        : (prev.status || []).filter((s) => s !== status),
    }));
  };

  const handlePriorityChange = (priority: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      priority: checked
        ? [...(prev.priority || []), priority]
        : (prev.priority || []).filter((p) => p !== priority),
    }));
  };

  const handleOwnerChange = (owner: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      owner: checked
        ? [...(prev.owner || []), owner]
        : (prev.owner || []).filter((o) => o !== owner),
    }));
  };

  const handleApply = () => {
    onFiltersChange(filters);
    setIsOpen(false);
  };

  const handleReset = () => {
    setFilters({});
    onFiltersChange({});
  };

  const activeCount = Object.values(filters).reduce((sum, arr) => sum + (arr?.length || 0), 0);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('gap-2', activeCount > 0 && 'border-primary bg-primary/5 text-primary')}
          aria-label={`Filtros avançados${activeCount > 0 ? ` (${activeCount} ativos)` : ''}`}
        >
          <Sliders className="h-4 w-4" />
          <span>Filtros</span>
          {activeCount > 0 && (
            <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-96 max-w-[90vw]">
        <SheetHeader>
          <SheetTitle>Filtros Avançados</SheetTitle>
          <SheetDescription>Refine sua busca com múltiplos critérios</SheetDescription>
        </SheetHeader>

        {/* Filter Groups */}
        <div className="space-y-6 py-6">
          {/* Status Filter */}
          <div className="space-y-3">
            <label className="text-base font-semibold">Status</label>
            <div className="space-y-2" role="group" aria-labelledby="status-group">
              {statusOptions.map((status) => (
                <div key={status} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`status-${status}`}
                    checked={filters.status?.includes(status) || false}
                    onChange={(e) => handleStatusChange(status, e.target.checked)}
                    aria-label={`Filtrar por status: ${status}`}
                    className="h-4 w-4 rounded border-input"
                  />
                  <label
                    htmlFor={`status-${status}`}
                    className="cursor-pointer text-sm font-normal"
                  >
                    {status}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div className="space-y-3">
            <label className="text-base font-semibold">Prioridade</label>
            <div className="space-y-2" role="group" aria-labelledby="priority-group">
              {priorityOptions.map((priority) => (
                <div key={priority} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`priority-${priority}`}
                    checked={filters.priority?.includes(priority) || false}
                    onChange={(e) => handlePriorityChange(priority, e.target.checked)}
                    aria-label={`Filtrar por prioridade: ${priority}`}
                    className="h-4 w-4 rounded border-input"
                  />
                  <label
                    htmlFor={`priority-${priority}`}
                    className="cursor-pointer text-sm font-normal"
                  >
                    {priority}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Owner Filter */}
          <div className="space-y-3">
            <label className="text-base font-semibold">Responsável</label>
            <div className="space-y-2" role="group" aria-labelledby="owner-group">
              {ownerOptions.map((owner) => (
                <div key={owner} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`owner-${owner}`}
                    checked={filters.owner?.includes(owner) || false}
                    onChange={(e) => handleOwnerChange(owner, e.target.checked)}
                    aria-label={`Filtrar por responsável: ${owner}`}
                    className="h-4 w-4 rounded border-input"
                  />
                  <label htmlFor={`owner-${owner}`} className="cursor-pointer text-sm font-normal">
                    {owner}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={activeCount === 0}
            aria-label="Limpar todos os filtros"
          >
            Limpar
          </Button>
          <Button onClick={handleApply} aria-label="Aplicar filtros">
            Aplicar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
