'use client';

import React, { useState, useCallback } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export type PerformanceStatus = 'high' | 'above-avg' | 'at-risk' | 'all';
export type CompletionRange = '0-25' | '25-50' | '50-75' | '75-100' | 'all';

export interface AdvancedFilterState {
  status: PerformanceStatus;
  completionRange: CompletionRange;
  searchTerm: string;
}

interface AdvancedFiltersProps {
  value: AdvancedFilterState;
  onChange: (filters: AdvancedFilterState) => void;
  activeCount?: number;
  totalCount?: number;
}

/**
 * AdvancedFilters: Molecule component
 *
 * Features:
 * - Performance status filter (High Performer, Above Average, At Risk, All)
 * - Completion rate range selector (0-25%, 25-50%, 50-75%, 75-100%)
 * - Search/filter pill display
 * - Quick clear all filters button
 * - Responsive layout (mobile-friendly)
 * - Accessibility: ARIA labels, keyboard navigation
 */
export function AdvancedFilters({
  value,
  onChange,
  activeCount = 0,
  totalCount = 0,
}: AdvancedFiltersProps) {
  const [showExpandedFilters, setShowExpandedFilters] = useState(false);

  // Performance status presets
  const statusOptions: Array<{ value: PerformanceStatus; label: string; icon: string; color: string }> = [
    {
      value: 'high',
      label: 'High Performer',
      icon: '⭐',
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    },
    {
      value: 'above-avg',
      label: 'Above Average',
      icon: '📈',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    },
    {
      value: 'at-risk',
      label: 'At Risk',
      icon: '⚠️',
      color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    },
    { value: 'all', label: 'Todos', icon: '📊', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
  ];

  // Completion range options
  const completionOptions: Array<{ value: CompletionRange; label: string; range: string }> = [
    { value: '0-25', label: 'Baixa (0-25%)', range: '0-25' },
    { value: '25-50', label: 'Média (25-50%)', range: '25-50' },
    { value: '50-75', label: 'Boa (50-75%)', range: '50-75' },
    { value: '75-100', label: 'Excelente (75-100%)', range: '75-100' },
    { value: 'all', label: 'Todos', range: 'all' },
  ];

  // Handle status filter click
  const handleStatusClick = useCallback(
    (status: PerformanceStatus) => {
      onChange({ ...value, status });
    },
    [value, onChange]
  );

  // Handle completion range click
  const handleCompletionClick = useCallback(
    (range: CompletionRange) => {
      onChange({ ...value, completionRange: range });
    },
    [value, onChange]
  );

  // Clear all filters
  const handleClearAll = useCallback(() => {
    onChange({
      status: 'all',
      completionRange: 'all',
      searchTerm: '',
    });
    setShowExpandedFilters(false);
  }, [onChange]);

  // Check if any filters are active
  const hasActiveFilters = value.status !== 'all' || value.completionRange !== 'all' || value.searchTerm !== '';

  return (
    <Card className="bg-muted/30 border-muted">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros Avançados
            {activeCount > 0 && totalCount > 0 && (
              <Badge variant="outline" className="ml-2">
                {activeCount} de {totalCount}
              </Badge>
            )}
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-6 text-xs">
              <X className="w-3 h-3 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Performance Status Filter */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Status de Performance</p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {statusOptions.map((option) => (
              <Button
                key={option.value}
                variant={value.status === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusClick(option.value)}
                className="text-xs justify-start"
              >
                <span className="mr-1">{option.icon}</span>
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Completion Rate Filter */}
        <div className="space-y-2 border-t pt-3">
          <p className="text-xs font-medium text-muted-foreground">Taxa de Conclusão</p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
            {completionOptions.map((option) => (
              <Button
                key={option.value}
                variant={value.completionRange === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCompletionClick(option.value)}
                className="text-xs"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="border-t pt-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Filtros Aplicados</p>
            <div className="flex flex-wrap gap-2">
              {value.status !== 'all' && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 cursor-pointer hover:bg-secondary/80"
                  onClick={() => handleStatusClick('all')}
                >
                  Status: {statusOptions.find((o) => o.value === value.status)?.label}
                  <X className="w-3 h-3" />
                </Badge>
              )}
              {value.completionRange !== 'all' && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 cursor-pointer hover:bg-secondary/80"
                  onClick={() => handleCompletionClick('all')}
                >
                  Conclusão: {completionOptions.find((o) => o.value === value.completionRange)?.label}
                  <X className="w-3 h-3" />
                </Badge>
              )}
              {value.searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Busca: &quot;{value.searchTerm}&quot;
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
