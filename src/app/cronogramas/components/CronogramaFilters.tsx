'use client';

import { RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterBar } from '@/components/filters/FilterBar';
import type { FilterState, FilterRegistry } from '@/lib/filters/filter-types';

interface CronogramaFiltersProps {
  registry: FilterRegistry;
  filters: FilterState;
  search: string;
  viewMode: string;
  calendarPeriod: string;
  isSyncing: boolean;
  onUpdateFilter: (key: string, value: string) => void;
  onResetFilters: () => void;
  onSearchChange: (value: string) => void;
  onViewModeChange: (mode: string) => void;
  onCalendarPeriodChange: (period: string) => void;
  onSync: () => void;
}

export function CronogramaFilters({
  registry,
  filters,
  search,
  viewMode,
  calendarPeriod,
  isSyncing,
  onUpdateFilter,
  onResetFilters,
  onSearchChange,
  onViewModeChange,
  onCalendarPeriodChange,
  onSync,
}: CronogramaFiltersProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="min-w-0 flex-1">
        <FilterBar
          moduleId="cronogramas"
          filters={registry}
          onFiltersChange={(newFilters) => {
            Object.entries(newFilters).forEach(([key, value]) => {
              if (filters[key] !== value) {
                onUpdateFilter(key, value as string);
              }
            });
          }}
          onUpdateFilter={onUpdateFilter}
          onResetFilters={onResetFilters}
          onSearchChange={onSearchChange}
          onViewModeChange={onViewModeChange}
          onAgendaPeriodChange={onCalendarPeriodChange}
          initialFilters={filters}
          initialSearch={search}
          initialViewMode={viewMode}
          initialAgendaPeriod={calendarPeriod}
          currentFilters={filters}
          currentSearch={search}
          currentViewMode={viewMode}
          currentAgendaPeriod={calendarPeriod}
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
  );
}
