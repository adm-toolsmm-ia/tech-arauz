/**
 * FilterBar Component
 * Main filter container integrating search, quick filters, advanced filters, and view toggle
 * Standardized UI/UX for all modules
 *
 * CONTROLLED COMPONENT: All state is managed by parent component
 * This is a presentational component that only handles UI interactions
 */

'use client';

import * as React from 'react';
import { Search, Settings, X, RotateCcw } from 'lucide-react';
import { FilterBarProps, FilterDefinition, FilterState } from '@/lib/filters/filter-types';
import { getActiveFilterInfo, countActiveFilters } from '@/lib/filters/filter-utils';
import { FilterControl } from './FilterControl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface FilterBarExtendedProps extends FilterBarProps {
  // Extended props for controlled component behavior
  currentFilters?: FilterState;
  currentSearch?: string;
  currentViewMode?: string;
  currentAgendaPeriod?: string;
  onClearFilters?: () => void;
  onResetFilters?: () => void;
  onUpdateFilter?: (filterId: string, value: any) => void;
}

/**
 * QuickFilterButton: Standalone component for quick filter interaction
 * Handles popover for inactive filters and clear button for active ones
 */
function QuickFilterButton({
  filterDef,
  value,
  activeFilters,
  onUpdateFilter,
  onClearFilter,
}: {
  filterDef: FilterDefinition;
  value: any;
  activeFilters: FilterState;
  onUpdateFilter?: (filterId: string, value: any) => void;
  onClearFilter: (filterId: string) => void;
}) {
  const isActive = Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined;

  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  // Get options for this filter (handle dynamic functions)
  const options = React.useMemo(() => {
    if (!filterDef.options) return [];
    if (typeof filterDef.options === 'function') {
      return filterDef.options();
    }
    return filterDef.options;
  }, [filterDef]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {!isActive && options.length > 0 ? (
            // When inactive and has options: show popover
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  {filterDef.icon ? <filterDef.icon className="mr-1 h-4 w-4" /> : null}
                  {filterDef.label}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-2" align="start">
                <div className="space-y-2">
                  {options.map((opt) => (
                    <button
                      key={String(opt.value)}
                      onClick={() => {
                        if (filterDef.multi) {
                          onUpdateFilter?.(filterDef.id, [opt.value]);
                        } else {
                          onUpdateFilter?.(filterDef.id, opt.value);
                        }
                        setIsPopoverOpen(false);
                      }}
                      className="block w-full rounded px-2 py-1 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            // When active: show clear button
            <Button
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (isActive) {
                  onClearFilter(filterDef.id);
                }
              }}
            >
              {filterDef.icon ? <filterDef.icon className="mr-1 h-4 w-4" /> : null}
              {filterDef.label}
              {Array.isArray(value) && value.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {value.length}
                </Badge>
              )}
            </Button>
          )}
        </TooltipTrigger>
        <TooltipContent>
          {isActive ? 'Click to clear' : filterDef.description || filterDef.label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

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
  // New controlled props
  currentFilters,
  currentSearch,
  currentViewMode,
  onClearFilters,
  onResetFilters,
  onUpdateFilter,
}: FilterBarExtendedProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = React.useState(false);
  const [searchInput, setSearchInput] = React.useState(currentSearch ?? initialSearch ?? '');

  // Update search input when currentSearch prop changes
  React.useEffect(() => {
    if (currentSearch !== undefined) {
      setSearchInput(currentSearch);
    }
  }, [currentSearch]);

  // Handle search input with debounce
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange?.(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, onSearchChange]);

  // Use current values or fallback to defaults
  const activeFilters = React.useMemo(
    () => currentFilters ?? initialFilters ?? {},
    [currentFilters, initialFilters],
  );
  const activeSearch = currentSearch ?? searchInput;
  const activeViewMode = currentViewMode ?? initialViewMode ?? 'kanban';

  // Separate quick and advanced filters
  const quickFilters = filterRegistry.filters.filter((f) => f.quickFilter);
  const advancedFilters = filterRegistry.filters.filter((f) => !f.quickFilter);

  // Get active filter info for display
  const activeFilterInfo = React.useMemo(
    () => getActiveFilterInfo(activeFilters, filterRegistry.filters),
    [activeFilters, filterRegistry.filters],
  );

  // Calculate active filter count
  const activeFilterCount = countActiveFilters(activeFilters, filterRegistry.filters);
  const hasActiveFilters = activeFilterCount > 0 || activeSearch.trim().length > 0;

  // Handle Cmd+K for search focus
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInputElement = document.querySelector(
          '[data-filter-search]',
        ) as HTMLInputElement;
        searchInputElement?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClearFilter = (filterId: string) => {
    if (onUpdateFilter) {
      onUpdateFilter(filterId, null);
    }
  };

  const handleResetAll = () => {
    if (onResetFilters) {
      onResetFilters();
    }
    onSearchChange?.('');
    setSearchInput('');
  };

  return (
    <div className={cn('space-y-3 border-b border-border bg-background p-4', className)}>
      {/* Search Bar */}
      {filterRegistry.searchable !== false && (
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            data-filter-search
            placeholder="Buscar... (Ctrl+K)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 pr-8"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                onSearchChange?.('');
              }}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              title="Limpar busca"
              aria-label="Limpar busca"
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
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((filterDef) => (
              <QuickFilterButton
                key={filterDef.id}
                filterDef={filterDef}
                value={activeFilters[filterDef.id]}
                activeFilters={activeFilters}
                onUpdateFilter={onUpdateFilter}
                onClearFilter={handleClearFilter}
              />
            ))}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Active Filter Badge */}
        {activeFilterCount > 0 && (
          <Badge
            variant="secondary"
            className="cursor-pointer"
            onClick={() => setIsAdvancedOpen(true)}
          >
            {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}
          </Badge>
        )}

        {/* Advanced Filters Button */}
        {advancedFilters.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => setIsAdvancedOpen(true)}>
            <Settings className="mr-1 h-4 w-4" />
            Filters
          </Button>
        )}

        {/* Reset Filters */}
        {hasActiveFilters && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleResetAll}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset all filters</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* View Mode Selector */}
        {filterRegistry.viewModes && filterRegistry.viewModes.length > 1 && (
          <div className="flex items-center gap-2 border-l border-border pl-2">
            <div className="flex gap-1">
              {filterRegistry.viewModes.map((mode) => (
                <Button
                  key={mode.id}
                  variant={activeViewMode === mode.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange?.(mode.id)}
                  title={mode.label}
                >
                  {mode.icon ? (
                    <mode.icon className="h-4 w-4" />
                  ) : (
                    <span className="text-xs">{mode.label}</span>
                  )}
                </Button>
              ))}
            </div>
            {/* Agenda Period Selector (Dia/Semana/Mês) - visível quando viewMode é agenda */}
            {activeViewMode === 'agenda' &&
              filterRegistry.agendaPeriods &&
              filterRegistry.agendaPeriods.length > 0 && (
                <div className="flex gap-1 border-l border-border pl-2">
                  {filterRegistry.agendaPeriods.map((period) => (
                    <Button
                      key={period.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        /* TODO: handle period change */
                      }}
                      title={period.label}
                    >
                      {period.icon ? (
                        <period.icon className="mr-1 h-3.5 w-3.5" />
                      ) : null}
                      <span className="text-xs">{period.label}</span>
                    </Button>
                  ))}
                </div>
              )}
          </div>
        )}
      </div>

      {/* Advanced Filters Sheet */}
      <Sheet open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <SheetContent side="right" className="w-[400px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filtros Avançados</SheetTitle>
            {activeFilterInfo.count > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">{activeFilterInfo.summary}</p>
            )}
          </SheetHeader>

          {/* Group filters by category */}
          <div className="my-6 space-y-6">
            {Array.from(new Set(advancedFilters.map((f) => f.group || 'Outros'))).map((group) => {
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
                      value={activeFilters[filterDef.id]}
                      onChange={(newValue) => onUpdateFilter?.(filterDef.id, newValue)}
                    />
                  ))}
                </div>
              );
            })}
          </div>

          <SheetFooter className="flex justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onClearFilters?.();
                onSearchChange?.('');
                setSearchInput('');
              }}
              className="flex-1"
            >
              Limpar Tudo
            </Button>
            <Button onClick={() => setIsAdvancedOpen(false)} className="flex-1">
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
  const isActive = Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined;

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
            {definition.icon ? <definition.icon className="mr-1 h-4 w-4" /> : null}
            {definition.label}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{definition.description || definition.label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
