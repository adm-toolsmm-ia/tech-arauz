'use client';

import { FilterBar } from '@/components/filters/FilterBar';
import type { FilterState, FilterRegistry } from '@/lib/filters/filter-types';

interface CronogramaFiltersProps {
  registry: FilterRegistry;
  filters: FilterState;
  search: string;
  viewMode: string;
  calendarPeriod: string;
  onUpdateFilter: (key: string, value: string) => void;
  onResetFilters: () => void;
  onSearchChange: (value: string) => void;
  onViewModeChange: (mode: string) => void;
  onCalendarPeriodChange: (period: string) => void;
}

export function CronogramaFilters({
  registry,
  filters,
  search,
  viewMode,
  calendarPeriod,
  onUpdateFilter,
  onResetFilters,
  onSearchChange,
  onViewModeChange,
  onCalendarPeriodChange,
}: CronogramaFiltersProps) {
  return (
    <div className="border-b bg-background px-6 py-4 shrink-0">
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
  );
}
