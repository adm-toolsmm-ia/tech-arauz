'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';

type PeriodType = 'semanal' | 'mensal' | 'trimestral' | 'semestral' | 'anual';

interface PeriodSelectorProps {
  value: PeriodType;
  onChange: (period: PeriodType) => void;
  disabled?: boolean;
}

const PERIOD_OPTIONS: Array<{ value: PeriodType; label: string }> = [
  { value: 'semanal', label: 'Semanal' },
  { value: 'mensal', label: 'Mensal' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'semestral', label: 'Semestral' },
  { value: 'anual', label: 'Anual' },
];

/**
 * PeriodSelector: Atom component for selecting time period
 *
 * Displays period options as button group. Defaults to "Mensal".
 * Used in: PerformanceFilters molecule → PerformanceTab organism
 */
export function PeriodSelector({
  value,
  onChange,
  disabled = false,
}: PeriodSelectorProps): ReactNode {
  return (
    <div className="flex flex-wrap gap-2">
      {PERIOD_OPTIONS.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(option.value)}
          disabled={disabled}
          className="rounded-md"
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
