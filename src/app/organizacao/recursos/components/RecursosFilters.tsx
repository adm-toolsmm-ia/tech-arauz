'use client';

import { FilterBar } from '@/components/filters/FilterBar';
import { ViewModeBar } from '@/components/filters/ViewModeBar';
import type { FilterState, FilterRegistry } from '@/lib/filters/filter-types';

interface RecursosFiltersProps {
  registry: FilterRegistry;
  filters: FilterState;
  search: string;
  viewMode: string;
  onUpdateFilter: (key: string, value: unknown) => void;
  onResetFilters: () => void;
  onSearchChange: (value: string) => void;
  onViewModeChange: (mode: string) => void;
}

export function RecursosFilters({
  registry,
  filters,
  search,
  viewMode,
  onUpdateFilter,
  onResetFilters,
  onSearchChange,
  onViewModeChange,
}: RecursosFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <FilterBar
          moduleId="organizacao-recursos"
          filters={registry}
          onFiltersChange={(newFilters) => {
            Object.entries(newFilters).forEach(([key, value]) => {
              if (filters[key] !== value) {
                onUpdateFilter(key, value);
              }
            });
          }}
          onSearchChange={onSearchChange}
          onViewModeChange={onViewModeChange}
          initialFilters={filters}
          initialSearch={search}
          initialViewMode={viewMode}
          currentFilters={filters}
          currentSearch={search}
          currentViewMode={viewMode}
          onUpdateFilter={onUpdateFilter}
          onResetFilters={onResetFilters}
        />
      </div>
      <ViewModeBar
        moduleId="organizacao-recursos"
        registry={registry}
        activeViewMode={viewMode}
        onViewModeChange={onViewModeChange}
      />
    </div>
  );
}
