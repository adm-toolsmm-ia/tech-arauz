/**
 * SearchAndFilterBar Component
 * Combined search and filter bar for project discovery
 */

'use client';

import * as React from 'react';
import { GlobalSearch } from './GlobalSearch';
import { AdvancedFilters, type FilterState } from './AdvancedFilters';
import { cn } from '@/lib/utils';

interface SearchAndFilterBarProps {
  onSearch: (query: string) => void;
  onFiltersChange: (filters: FilterState) => void;
  className?: string;
}

export function SearchAndFilterBar({
  onSearch,
  onFiltersChange,
  className,
}: SearchAndFilterBarProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-4',
        'rounded-lg border border-border bg-background/50 p-4',
        className,
      )}
      role="region"
      aria-label="Barra de busca e filtros"
    >
      {/* Global Search */}
      <div className="min-w-[250px] flex-1">
        <GlobalSearch onSearch={onSearch} />
      </div>

      {/* Advanced Filters */}
      <div>
        <AdvancedFilters onFiltersChange={onFiltersChange} />
      </div>
    </div>
  );
}
