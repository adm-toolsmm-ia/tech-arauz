/**
 * ViewModeBar Component
 * View modes and period selectors — separate from FilterBar, always at top right.
 * Standardized positioning across Projetos, Cronogramas, and other modules.
 */

'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { FilterRegistry } from '@/lib/filters/filter-types';

interface ViewModeBarProps {
  moduleId: string;
  registry: FilterRegistry;
  activeViewMode: string;
  activeAgendaPeriod?: string;
  onViewModeChange?: (mode: string) => void;
  onAgendaPeriodChange?: (period: string) => void;
  className?: string;
}

export function ViewModeBar({
  moduleId,
  registry,
  activeViewMode,
  activeAgendaPeriod = 'month',
  onViewModeChange,
  onAgendaPeriodChange,
  className,
}: ViewModeBarProps) {
  const viewModes = registry.viewModes ?? [];
  const agendaPeriods = registry.agendaPeriods ?? [];

  const showPeriods =
    (activeViewMode === 'agenda' ||
      activeViewMode === 'lista' ||
      (activeViewMode === 'kanban' && moduleId === 'cronogramas')) &&
    agendaPeriods.length > 0;

  if (viewModes.length <= 1 && !showPeriods) return null;

  return (
    <div className={cn('flex items-center justify-end gap-2', className)}>
      {viewModes.length > 1 && (
        <div className="flex gap-1">
          {viewModes.map((mode) => (
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
      )}
      {showPeriods && (
        <div className="flex gap-1 border-l border-border pl-2">
          {agendaPeriods.map((period) => (
            <Button
              key={period.id}
              variant={activeAgendaPeriod === period.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onAgendaPeriodChange?.(period.id)}
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
  );
}
