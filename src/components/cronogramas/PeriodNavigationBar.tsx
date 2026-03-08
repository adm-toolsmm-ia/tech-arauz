'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addDays, getWeekStart } from '@/lib/domain/schedule-status';
import { MONTH_NAMES } from '@/lib/domain/schedule-status';

interface PeriodNavigationBarProps {
  currentDate: Date;
  period: 'day' | 'week' | 'month';
  onNavigate: (direction: number) => void;
}

function getPeriodLabel(currentDate: Date, period: 'day' | 'week' | 'month'): string {
  if (period === 'month') {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    return `${MONTH_NAMES[month]} ${year}`;
  }
  if (period === 'week') {
    const weekStart = getWeekStart(currentDate);
    const weekEnd = addDays(weekStart, 6);
    return `${weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - ${weekEnd.toLocaleDateString(
      'pt-BR',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    )}`;
  }
  // day
  return currentDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function getWeekdayLabel(currentDate: Date): string {
  return currentDate.toLocaleDateString('pt-BR', { weekday: 'long' });
}

export function PeriodNavigationBar({ currentDate, period, onNavigate }: PeriodNavigationBarProps) {
  const isDay = period === 'day';

  return (
    <div className="mb-4 flex items-center justify-between">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onNavigate(-1)}
        className="h-8 w-8"
        aria-label="Período anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex flex-col items-center">
        <h3 className={isDay ? 'text-xl font-bold tracking-tight' : 'text-base font-semibold'}>
          {getPeriodLabel(currentDate, period)}
        </h3>
        {isDay && (
          <span className="text-sm font-medium capitalize text-muted-foreground">
            {getWeekdayLabel(currentDate)}
          </span>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onNavigate(1)}
        className="h-8 w-8"
        aria-label="Próximo período"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
