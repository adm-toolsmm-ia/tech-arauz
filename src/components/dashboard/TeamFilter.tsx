'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ReactNode } from 'react';

type TeamFilterType = 'minha-equipe' | 'todos-envolvidos';

interface TeamFilterProps {
  value: TeamFilterType;
  onChange: (filter: TeamFilterType) => void;
  disabled?: boolean;
}

const TEAM_OPTIONS: Array<{ value: TeamFilterType; label: string }> = [
  { value: 'minha-equipe', label: 'Minha Equipe' },
  { value: 'todos-envolvidos', label: 'Todos os Envolvidos' },
];

/**
 * TeamFilter: Atom component for selecting team scope
 *
 * Displays team filter options as dropdown. Defaults to "Minha Equipe".
 * Used in: PerformanceFilters molecule → PerformanceTab organism
 */
export function TeamFilter({
  value,
  onChange,
  disabled = false,
}: TeamFilterProps): ReactNode {
  return (
    <Select value={value} onValueChange={(val) => onChange(val as TeamFilterType)} disabled={disabled}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Selecione equipe" />
      </SelectTrigger>
      <SelectContent>
        {TEAM_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
