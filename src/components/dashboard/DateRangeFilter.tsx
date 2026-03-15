'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type DateRangeType = 'week' | 'month' | '3months' | 'year' | 'custom';

export interface DateRange {
  type: DateRangeType;
  startDate?: Date;
  endDate?: Date;
}

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  disabledDates?: { before?: Date; after?: Date };
  showCustomOption?: boolean;
}

/**
 * DateRangeFilter: Molecule component
 *
 * Features:
 * - Predefined ranges: Week, Month, 3 Months, Year
 * - Custom date range picker with validation
 * - Date boundary checks (no start > end)
 * - Disabled date ranges (business logic)
 * - Responsive layout (mobile-friendly)
 * - Accessibility: ARIA labels, keyboard navigation
 */
export function DateRangeFilter({
  value,
  onChange,
  disabledDates,
  showCustomOption = true,
}: DateRangeFilterProps) {
  const [showCustom, setShowCustom] = useState(value.type === 'custom');
  const [customStart, setCustomStart] = useState<string>(
    value.startDate ? formatDateForInput(value.startDate) : '',
  );
  const [customEnd, setCustomEnd] = useState<string>(
    value.endDate ? formatDateForInput(value.endDate) : '',
  );
  const [error, setError] = useState<string>('');

  // Calcula datas para ranges predefinidos
  const getPredefinedRange = useCallback((type: Exclude<DateRangeType, 'custom'>) => {
    const now = new Date();
    const endDate = new Date(now);

    let startDate = new Date(now);
    switch (type) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    return { startDate, endDate };
  }, []);

  // Valida se uma data está dentro dos limites permitidos
  const isDateValid = useCallback(
    (date: Date): boolean => {
      if (disabledDates?.before && date < disabledDates.before) {
        return false;
      }
      if (disabledDates?.after && date > disabledDates.after) {
        return false;
      }
      return true;
    },
    [disabledDates],
  );

  // Valida o custom range
  const validateCustomRange = useCallback((): boolean => {
    setError('');

    if (!customStart || !customEnd) {
      setError('Ambas as datas são obrigatórias');
      return false;
    }

    const startDate = new Date(customStart);
    const endDate = new Date(customEnd);

    if (startDate > endDate) {
      setError('Data inicial deve ser anterior à data final');
      return false;
    }

    if (!isDateValid(startDate)) {
      setError(`Data inicial está fora do intervalo permitido`);
      return false;
    }

    if (!isDateValid(endDate)) {
      setError(`Data final está fora do intervalo permitido`);
      return false;
    }

    return true;
  }, [customStart, customEnd, isDateValid]);

  // Handler para ranges predefinidos
  const handlePredefinedRange = useCallback(
    (type: Exclude<DateRangeType, 'custom'>) => {
      const { startDate, endDate } = getPredefinedRange(type);
      onChange({ type, startDate, endDate });
      setShowCustom(false);
      setError('');
    },
    [onChange, getPredefinedRange],
  );

  // Handler para aplicar custom range
  const handleApplyCustom = useCallback(() => {
    if (validateCustomRange()) {
      const startDate = new Date(customStart);
      const endDate = new Date(customEnd);
      onChange({ type: 'custom', startDate, endDate });
    }
  }, [customStart, customEnd, onChange, validateCustomRange]);

  // Handler para cancelar custom
  const handleCancelCustom = useCallback(() => {
    setShowCustom(false);
    setError('');
    setCustomStart('');
    setCustomEnd('');
  }, []);

  // Calcula rótulo para range atual
  const getRangeLabel = useMemo(() => {
    if (value.type === 'custom' && value.startDate && value.endDate) {
      return `${formatDateForDisplay(value.startDate)} → ${formatDateForDisplay(value.endDate)}`;
    }

    const labels: Record<Exclude<DateRangeType, 'custom'>, string> = {
      week: 'Última Semana',
      month: 'Último Mês',
      '3months': 'Últimos 3 Meses',
      year: 'Último Ano',
    };

    return labels[value.type as Exclude<DateRangeType, 'custom'>] || 'Intervalo Customizado';
  }, [value]);

  // Formata data para input
  function formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Formata data para exibição
  function formatDateForDisplay(date: Date): string {
    return date.toLocaleDateString('pt-BR', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    });
  }

  return (
    <Card className="bg-muted/30 border-muted">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            Período: {getRangeLabel}
          </CardTitle>
          {value.type === 'custom' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCustom(true)}
              className="h-6 w-6 p-0"
              title="Editar período customizado"
            >
              <Calendar className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Predefined ranges */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <Button
            variant={value.type === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePredefinedRange('week')}
            className="text-xs"
          >
            1 Semana
          </Button>
          <Button
            variant={value.type === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePredefinedRange('month')}
            className="text-xs"
          >
            1 Mês
          </Button>
          <Button
            variant={value.type === '3months' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePredefinedRange('3months')}
            className="text-xs"
          >
            3 Meses
          </Button>
          <Button
            variant={value.type === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePredefinedRange('year')}
            className="text-xs"
          >
            1 Ano
          </Button>
        </div>

        {/* Custom range toggle */}
        {showCustomOption && !showCustom && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustom(true)}
            className="w-full text-xs"
          >
            <Calendar className="mr-1 h-3 w-3" />
            Período Customizado
          </Button>
        )}

        {/* Custom date picker */}
        {showCustom && (
          <div className="space-y-3 border-t pt-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="start-date" className="text-xs">
                  Data Inicial
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={customStart}
                  onChange={(e) => {
                    setCustomStart(e.target.value);
                    setError('');
                  }}
                  className="text-sm"
                  aria-label="Data inicial do período"
                  min={disabledDates?.before ? formatDateForInput(disabledDates.before) : undefined}
                  max={disabledDates?.after ? formatDateForInput(disabledDates.after) : undefined}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="end-date" className="text-xs">
                  Data Final
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={customEnd}
                  onChange={(e) => {
                    setCustomEnd(e.target.value);
                    setError('');
                  }}
                  className="text-sm"
                  aria-label="Data final do período"
                  min={disabledDates?.before ? formatDateForInput(disabledDates.before) : undefined}
                  max={disabledDates?.after ? formatDateForInput(disabledDates.after) : undefined}
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded bg-red-50 p-2 text-xs text-red-600 dark:bg-red-950/20 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button size="sm" onClick={handleApplyCustom} className="flex-1 text-xs">
                Aplicar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelCustom}
                className="flex-1 text-xs"
              >
                <X className="mr-1 h-3 w-3" />
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
