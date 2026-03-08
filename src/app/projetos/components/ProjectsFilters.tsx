'use client';

import { RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterBar } from '@/components/filters/FilterBar';
import { ViewModeBar } from '@/components/filters/ViewModeBar';
import type { FilterState, FilterRegistry, SortConfig } from '@/lib/filters/filter-types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProjectsFiltersProps {
  registry: FilterRegistry;
  filters: FilterState;
  search: string;
  viewMode: string;
  agendaPeriod?: string;
  sortConfig?: SortConfig | null;
  isSyncing: boolean;
  onUpdateFilter: (key: string, value: string) => void;
  onResetFilters: () => void;
  onSearchChange: (value: string) => void;
  onViewModeChange: (mode: string) => void;
  onAgendaPeriodChange?: (period: string) => void;
  onSortChange?: (sort: SortConfig | null) => void;
  onSync: () => void;
}

const SORT_OPTIONS = [
  { value: 'project_name-asc', label: 'Ordem Alfabética (A-Z)' },
  { value: 'data_movimentacao-desc', label: 'Última Movimentação (Mais recente)' },
  { value: 'data_movimentacao-asc', label: 'Última Movimentação (Mais antiga)' },
  { value: 'prazo_fase-asc', label: 'Prazo da Fase (Mais próximo)' },
  { value: 'prazo_fase-desc', label: 'Prazo da Fase (Mais distante)' },
  { value: 'end_date-asc', label: 'Prazo do Projeto (Mais próximo)' },
  { value: 'end_date-desc', label: 'Prazo do Projeto (Mais distante)' },
  { value: 'importancia_especial-desc', label: 'Importância Especial' },
];

export function ProjectsFilters({
  registry,
  filters,
  search,
  viewMode,
  agendaPeriod = 'month',
  sortConfig,
  isSyncing,
  onUpdateFilter,
  onResetFilters,
  onSearchChange,
  onViewModeChange,
  onAgendaPeriodChange,
  onSortChange,
  onSync,
}: ProjectsFiltersProps) {
  const currentSortValue = sortConfig
    ? `${sortConfig.key}-${sortConfig.direction}`
    : 'project_name-asc';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        {viewMode !== 'agenda' && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Ordenar por:</span>
            <Select
              value={currentSortValue}
              onValueChange={(val) => {
                if (onSortChange) {
                  const lastDash = val.lastIndexOf('-');
                  const key = val.slice(0, lastDash);
                  const direction = val.slice(lastDash + 1) as 'asc' | 'desc';
                  onSortChange({ key, direction });
                }
              }}
            >
              <SelectTrigger className="h-8 w-[280px] text-xs">
                <SelectValue placeholder="Ordenar por..." />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="ml-auto">
          <ViewModeBar
            moduleId="projetos"
            registry={registry}
            activeViewMode={viewMode}
            activeAgendaPeriod={agendaPeriod}
            onViewModeChange={onViewModeChange}
            onAgendaPeriodChange={onAgendaPeriodChange}
          />
        </div>
      </div>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <FilterBar
            moduleId="projetos"
            filters={registry}
            onFiltersChange={(newFilters) => {
              Object.entries(newFilters).forEach(([key, value]) => {
                if (filters[key] !== value) {
                  onUpdateFilter(key, value as string);
                }
              });
            }}
            onSearchChange={onSearchChange}
            onViewModeChange={onViewModeChange}
            onAgendaPeriodChange={onAgendaPeriodChange}
            initialFilters={filters}
            initialSearch={search}
            initialViewMode={viewMode}
            initialAgendaPeriod={agendaPeriod}
            currentFilters={filters}
            currentSearch={search}
            currentViewMode={viewMode}
            currentAgendaPeriod={agendaPeriod}
            onUpdateFilter={onUpdateFilter}
            onResetFilters={onResetFilters}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onSync}
          disabled={isSyncing}
          className="mt-4 shrink-0 text-muted-foreground hover:text-foreground"
        >
          {isSyncing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          <span className="sr-only sm:not-sr-only">
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </span>
        </Button>
      </div>
    </div>
  );
}
