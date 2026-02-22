/**
 * FilterBar Component
 * Main filter container integrating search, quick filters, advanced filters, and view toggle
 * Standardized UI/UX for all modules
 */

'use client';

import * as React from 'react';
import { Search, Settings, X, RotateCcw } from 'lucide-react';
import { FilterBarProps, FilterDefinition, FilterState } from '@/lib/filters/filter-types';
import { getActiveFilterInfo, countActiveFilters } from '@/lib/filters/filter-utils';
import { useFilterState } from '@/hooks/useFilterState';
import { FilterControl } from './FilterControl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export function FilterBar({
  moduleId,
  filters: filterRegistry,
  onFiltersChange,
  onSearchChange,
  onViewModeChange,
  initialFilters,
  initialSearch = '',
  initialViewMode,
  className,
}: FilterBarProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = React.useState(false);
  const [searchInput, setSearchInput] = React.useState(initialSearch);

  // Use state management hook
  const filterState = useFilterState({
    moduleId,
    definitions: filterRegistry.filters,
    onFiltersChange,
    onSearchChange: (search) => {
      onSearchChange?.(search);
    },
    onViewModeChange,
  });

  // Set initial values
  React.useEffect(() => {
    if (initialFilters) {
      filterState.setFilters(initialFilters);
    }
  }, [initialFilters, filterState]);

  React.useEffect(() => {
    if (initialViewMode) {
      filterState.setViewMode(initialViewMode);
    }
  }, [initialViewMode, filterState]);

  // Handle search input with debounce
  React.useEffect(() => {
    const timer = setTimeout(() => {
      filterState.setSearch(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, filterState]);

  // Separate quick and advanced filters
  const quickFilters = filterRegistry.filters.filter((f) => f.quickFilter);
  const advancedFilters = filterRegistry.filters.filter((f) => !f.quickFilter);

  // Get active filter info for display
  const activeFilterInfo = React.useMemo(
    () => getActiveFilterInfo(filterState.filters, filterRegistry.filters),
    [filterState.filters, filterRegistry.filters],
  );

  // Handle Cmd+K for search focus
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('[data-filter-search]') as HTMLInputElement;
        searchInput?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={cn('space-y-3 p-4 border-b border-border bg-background', className)}>
      {/* Search Bar */}
      {filterRegistry.searchable !== false && (
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            data-filter-search
            placeholder="Search... (Cmd+K)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 pr-8"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Quick Filters + Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Quick Filter Buttons */}
        {quickFilters.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {quickFilters.map((filterDef) => {
              const value = filterState.filters[filterDef.id];
              const isActive = Array.isArray(value)
                ? value.length > 0
                : value !== null && value !== undefined;

              return (
                <TooltipProvider key={filterDef.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          if (isActive) {
                            filterState.clearFilters([filterDef.id]);
                          } else {
                            // Show popover for this filter
                            const control = document.querySelector(
                              `[data-filter-control="${filterDef.id}"]`,
                            ) as HTMLElement;
                            control?.click();
                          }
                        }}
                      >
                        {filterDef.icon ? <filterDef.icon className="h-4 w-4 mr-1" /> : null}
                        {filterDef.label}
                        {Array.isArray(value) && value.length > 0 && (
                          <Badge variant="secondary" className="ml-1">
                            {value.length}
                          </Badge>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{filterDef.description || filterDef.label}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Active Filter Badge */}
        {filterState.activeFilterCount > 0 && (
          <Badge variant="secondary" className="cursor-pointer" onClick={() => setIsAdvancedOpen(true)}>
            {filterState.activeFilterCount} filter{filterState.activeFilterCount !== 1 ? 's' : ''}
          </Badge>
        )}

        {/* Advanced Filters Button */}
        {advancedFilters.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdvancedOpen(true)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Filters
          </Button>
        )}

        {/* Reset Filters */}
        {filterState.hasActiveFilters && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={filterState.resetAllFilters}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset all filters</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* View Mode Selector */}
        {filterRegistry.viewModes && filterRegistry.viewModes.length > 1 && (
          <div className="flex gap-1 border-l border-border pl-2">
            {filterRegistry.viewModes.map((mode) => (
              <Button
                key={mode.id}
                variant={filterState.viewMode === mode.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => filterState.setViewMode(mode.id)}
                title={mode.label}
              >
                {mode.icon ? <mode.icon className="h-4 w-4" /> : <span className="text-xs">{mode.label}</span>}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Filters Sheet */}
      <Sheet open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <SheetContent side="right" className="w-[400px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filtros Avançados</SheetTitle>
            {activeFilterInfo.count > 0 && (
              <p className="text-xs text-muted-foreground mt-2">{activeFilterInfo.summary}</p>
            )}
          </SheetHeader>

          {/* Group filters by category */}
          <div className="space-y-6 my-6">
            {Array.from(
              new Set(advancedFilters.map((f) => f.group || 'Outros')),
            ).map((group) => {
              const groupFilters = advancedFilters.filter((f) => (f.group || 'Outros') === group);

              return (
                <div key={group} className="space-y-3">
                  {group !== 'Outros' && (
                    <h3 className="text-sm font-semibold text-muted-foreground">{group}</h3>
                  )}
                  {groupFilters.map((filterDef) => (
                    <FilterControl
                      key={filterDef.id}
                      definition={filterDef}
                      value={filterState.filters[filterDef.id]}
                      onChange={(newValue) => filterState.updateFilter(filterDef.id, newValue)}
                    />
                  ))}
                </div>
              );
            })}
          </div>

          <SheetFooter className="flex gap-2 justify-between">
            <Button
              variant="outline"
              onClick={() => filterState.clearFilters()}
              className="flex-1"
            >
              Limpar Tudo
            </Button>
            <Button
              onClick={() => setIsAdvancedOpen(false)}
              className="flex-1"
            >
              Aplicar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/**
 * Quick filter utility component for single filter display
 */
export function QuickFilter({
  definition,
  value,
  onChange,
  className,
}: {
  definition: FilterDefinition;
  value: any;
  onChange: (value: any) => void;
  className?: string;
}) {
  const isActive = Array.isArray(value)
    ? value.length > 0
    : value !== null && value !== undefined;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(isActive ? null : true)}
            className={className}
          >
            {definition.icon ? <definition.icon className="h-4 w-4 mr-1" /> : null}
            {definition.label}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{definition.description || definition.label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
