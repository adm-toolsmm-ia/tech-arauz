'use client';

import { RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterBar } from '@/components/filters/FilterBar';
import type { FilterState, FilterRegistry } from '@/lib/filters/filter-types';

interface ProjectsFiltersProps {
  registry: FilterRegistry;
  filters: FilterState;
  search: string;
  viewMode: string;
  isSyncing: boolean;
  onUpdateFilter: (key: string, value: string) => void;
  onResetFilters: () => void;
  onSearchChange: (value: string) => void;
  onViewModeChange: (mode: string) => void;
  onSync: () => void;
}

export function ProjectsFilters({
  registry,
  filters,
  search,
  viewMode,
  isSyncing,
  onUpdateFilter,
  onResetFilters,
  onSearchChange,
  onViewModeChange,
  onSync,
}: ProjectsFiltersProps) {
  return (
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
