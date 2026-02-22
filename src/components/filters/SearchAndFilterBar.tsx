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
        'flex items-center gap-4 flex-wrap',
        'p-4 bg-background/50 rounded-lg border border-border',
        className,
      )}
      role="region"
      aria-label="Barra de busca e filtros"
    >
      {/* Global Search */}
      <div className="flex-1 min-w-[250px]">
        <GlobalSearch onSearch={onSearch} />
      </div>

      {/* Advanced Filters */}
      <div>
        <AdvancedFilters onFiltersChange={onFiltersChange} />
      </div>
    </div>
  );
}
