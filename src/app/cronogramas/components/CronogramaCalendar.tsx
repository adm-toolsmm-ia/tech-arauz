'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Schedule } from '@/lib/domain/schedule-status';
import {
  isSameDay,
  getDaysInMonth,
  getFirstDayOfMonth,
  addDays,
  getWeekStart,
  MONTH_NAMES,
  DAY_NAMES,
  PROJECT_COLORS,
  PROJECT_COLORS_LIGHT,
  getProjectColorIndex,
} from '@/lib/domain/schedule-status';

interface CalendarProps {
  currentDate: Date;
  selectedDay: Date | null;
  calendarPeriod: 'day' | 'week' | 'month';
  projectIds: string[];
  getSchedulesForDate: (d: Date) => Schedule[];
  onSelectDay: (d: Date) => void;
  onNavigateMonth: (dir: number) => void;
  onNavigateWeek: (dir: number) => void;
  onNavigateDay: (dir: number) => void;
  onActivityClick: (s: Schedule) => void;
}

export function CronogramaCalendar({
  currentDate,
  selectedDay,
  calendarPeriod,
  projectIds,
  getSchedulesForDate,
  onSelectDay,
  onNavigateMonth,
  onNavigateWeek,
  onNavigateDay,
  onActivityClick,
}: CalendarProps) {
  if (calendarPeriod === 'month') {
    return (
      <MonthView
        currentDate={currentDate}
        selectedDay={selectedDay}
        onSelectDay={onSelectDay}
        onNavigate={onNavigateMonth}
        getSchedulesForDate={getSchedulesForDate}
        projectIds={projectIds}
      />
    );
  }

  if (calendarPeriod === 'week') {
    return (
      <WeekView
        currentDate={currentDate}
        selectedDay={selectedDay}
        onSelectDay={onSelectDay}
        onNavigate={onNavigateWeek}
        getSchedulesForDate={getSchedulesForDate}
        projectIds={projectIds}
      />
    );
  }

  return (
    <DayView
      currentDate={currentDate}
      onNavigate={onNavigateDay}
      getSchedulesForDate={getSchedulesForDate}
      projectIds={projectIds}
      onActivityClick={onActivityClick}
    />
  );
}

// ---------- Month View ----------

function MonthView({
  currentDate,
  selectedDay,
  onSelectDay,
  onNavigate,
  getSchedulesForDate,
  projectIds,
}: {
  currentDate: Date;
  selectedDay: Date | null;
  onSelectDay: (d: Date) => void;
  onNavigate: (dir: number) => void;
  getSchedulesForDate: (d: Date) => Schedule[];
  projectIds: string[];
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return (
    <Card className="shadow-soft">
      <CardContent className="p-4 sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => onNavigate(-1)} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-base font-semibold">
            {MONTH_NAMES[month]} {year}
          </h3>
          <Button variant="ghost" size="icon" onClick={() => onNavigate(1)} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1">
          {DAY_NAMES.map((name) => (
            <div key={name} className="py-1 text-center text-xs font-medium text-muted-foreground">
              {name}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((date, idx) => {
            if (!date) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }

            const daySchedules = getSchedulesForDate(date);
            const isToday = isSameDay(date, today);
            const isSelected = selectedDay ? isSameDay(date, selectedDay) : false;
            const hasDelayed = daySchedules.some((s) => s.atrasado === true);
            const maxDots = 4;

            return (
              <Popover key={date.toISOString()}>
                <PopoverTrigger asChild>
                  <button
                    onClick={() => onSelectDay(date)}
                    className={cn(
                      'relative flex aspect-square flex-col items-center justify-start gap-0.5 rounded-lg p-1 text-sm transition-all',
                      'hover:bg-accent/60 focus:outline-none focus:ring-2 focus:ring-ring/50',
                      isToday && 'bg-accent font-bold',
                      isSelected && 'bg-primary/5 ring-primary ring-2',
                      hasDelayed &&
                        daySchedules.length > 0 &&
                        'ring-1 ring-red-300 dark:ring-red-700',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 text-xs leading-none',
                        isToday &&
                          'bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full font-bold',
                        !isToday && date.getMonth() !== month && 'text-muted-foreground/50',
                      )}
                    >
                      {date.getDate()}
                    </span>
                    {daySchedules.length > 0 && (
                      <div className="mb-0.5 mt-auto flex flex-wrap justify-center gap-0.5">
                        {daySchedules.slice(0, maxDots).map((s) => {
                          const colorIdx = getProjectColorIndex(s.project_id, projectIds);
                          return (
                            <Tooltip key={s.id}>
                              <TooltipTrigger asChild>
                                <div
                                  className={cn(
                                    'h-1.5 w-1.5 rounded-full',
                                    s.atrasado ? 'bg-red-500' : PROJECT_COLORS[colorIdx],
                                  )}
                                />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[200px]">
                                <p className="text-xs font-medium">{s.atividade || 'Sem nome'}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  {s.project?.titulo || 'Projeto'}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                        {daySchedules.length > maxDots && (
                          <span className="text-[8px] leading-none text-muted-foreground">
                            +{daySchedules.length - maxDots}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                </PopoverTrigger>
                {daySchedules.length > 0 && (
                  <PopoverContent className="w-80 p-3" side="right" align="start">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">
                        {date.toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          day: '2-digit',
                          month: 'long',
                        })}
                      </p>
                      <div className="max-h-60 space-y-4 overflow-y-auto">
                        {Array.from(
                          daySchedules.reduce((acc, s) => {
                            const projectName = s.project?.titulo || 'Sem Projeto';
                            if (!acc.has(projectName)) acc.set(projectName, []);
                            acc.get(projectName)!.push(s);
                            return acc;
                          }, new Map<string, Schedule[]>()),
                        ).map(([projectName, projSchedules]) => (
                          <div key={projectName} className="space-y-1.5">
                            <h4 className="text-foreground/80 line-clamp-1 border-b pb-1 text-[11px] font-bold uppercase">
                              {projectName}
                            </h4>
                            {projSchedules.map((s) => {
                              const colorIdx = getProjectColorIndex(s.project_id, projectIds);
                              return (
                                <div
                                  key={s.id}
                                  role="button"
                                  tabIndex={0}
                                  className="hover:bg-muted/50 flex cursor-pointer items-start gap-2 rounded p-1.5 transition-colors"
                                  onClick={() => onSelectDay(date)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      onSelectDay(date);
                                    }
                                  }}
                                >
                                  <div
                                    className={cn(
                                      'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                                      s.atrasado ? 'bg-red-500' : PROJECT_COLORS[colorIdx],
                                    )}
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-medium">
                                      {s.atividade || 'Sem nome'}
                                    </p>
                                  </div>
                                  {s.atrasado && (
                                    <Badge
                                      variant="destructive"
                                      className="h-4 shrink-0 px-1 text-[9px]"
                                    >
                                      Atrasado
                                    </Badge>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                )}
              </Popover>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Week View ----------

function WeekView({
  currentDate,
  selectedDay,
  onSelectDay,
  onNavigate,
  getSchedulesForDate,
  projectIds,
}: {
  currentDate: Date;
  selectedDay: Date | null;
  onSelectDay: (d: Date) => void;
  onNavigate: (dir: number) => void;
  getSchedulesForDate: (d: Date) => Schedule[];
  projectIds: string[];
}) {
  const weekStart = getWeekStart(currentDate);
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <Card className="shadow-soft">
      <CardContent className="p-4 sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => onNavigate(-1)} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-base font-semibold">
            {weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            {' - '}
            {addDays(weekStart, 6).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </h3>
          <Button variant="ghost" size="icon" onClick={() => onNavigate(1)} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((date) => {
            const daySchedules = getSchedulesForDate(date);
            const isToday = isSameDay(date, today);
            const isSelected = selectedDay ? isSameDay(date, selectedDay) : false;
            const hasDelayed = daySchedules.some((s) => s.atrasado === true);

            return (
              <button
                key={date.toISOString()}
                onClick={() => onSelectDay(date)}
                className={cn(
                  'flex min-h-[120px] flex-col rounded-lg border p-2 transition-all',
                  'hover:border-primary/50 hover:bg-accent/30 focus:outline-none focus:ring-2 focus:ring-ring/50',
                  isToday && 'border-primary bg-primary/5 shadow-sm',
                  isSelected && 'ring-primary ring-2',
                  hasDelayed && 'border-red-300 dark:border-red-700',
                )}
              >
                {isToday && <div className="bg-primary mb-1 h-0.5 w-full rounded-full" />}
                <div className="mb-1.5 flex items-center justify-between">
                  <span className={cn('text-xs font-medium', isToday && 'text-primary font-bold')}>
                    {DAY_NAMES[date.getDay()]}
                  </span>
                  <span
                    className={cn(
                      'text-xs',
                      isToday
                        ? 'bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold'
                        : 'text-muted-foreground',
                    )}
                  >
                    {date.getDate()}
                  </span>
                </div>
                <div className="flex-1 space-y-0.5 overflow-hidden">
                  {daySchedules.slice(0, 3).map((s) => {
                    const colorIdx = getProjectColorIndex(s.project_id, projectIds);
                    return (
                      <Tooltip key={s.id}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              'truncate rounded px-1 py-0.5 text-[10px] font-medium',
                              s.atrasado
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                : PROJECT_COLORS_LIGHT[colorIdx],
                            )}
                          >
                            {s.atividade || 'Sem nome'}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[240px]">
                          <p className="text-xs font-medium">{s.atividade || 'Sem nome'}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {s.project?.titulo || 'Projeto'}
                          </p>
                          {s.responsavel && (
                            <p className="text-[10px] text-muted-foreground">
                              Resp: {s.responsavel}
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                  {daySchedules.length > 3 && (
                    <p className="text-center text-[9px] text-muted-foreground">
                      +{daySchedules.length - 3} mais
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Day View ----------

function DayView({
  currentDate,
  onNavigate,
  getSchedulesForDate,
  projectIds,
  onActivityClick,
}: {
  currentDate: Date;
  onNavigate: (dir: number) => void;
  getSchedulesForDate: (d: Date) => Schedule[];
  projectIds: string[];
  onActivityClick: (s: Schedule) => void;
}) {
  const schedules = getSchedulesForDate(currentDate);

  return (
    <Card className="min-h-[400px] w-full shadow-soft">
      <CardContent className="flex h-full flex-col p-4 sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onNavigate(-1)}
            className="hover:bg-accent/60 h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-bold tracking-tight">
              {currentDate.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </h3>
            <span className="text-sm font-medium capitalize text-muted-foreground">
              {currentDate.toLocaleDateString('pt-BR', { weekday: 'long' })}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onNavigate(1)}
            className="hover:bg-accent/60 h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto pr-2">
          {schedules.length === 0 ? (
            <div className="flex h-[200px] flex-col items-center justify-center text-center">
              <CalendarDays className="text-muted-foreground/30 mb-2 h-10 w-10" />
              <p className="font-medium text-muted-foreground">
                Nenhuma pauta ou atividade para este dia.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {schedules.map((schedule) => {
                const colorIdx = getProjectColorIndex(schedule.project_id, projectIds);
                return (
                  <Card
                    key={schedule.id}
                    role="button"
                    tabIndex={0}
                    className="hover:bg-muted/50 cursor-pointer border-l-4 transition-colors"
                    style={{ borderLeftColor: PROJECT_COLORS[colorIdx] }}
                    onClick={() => onActivityClick(schedule)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onActivityClick(schedule);
                      }
                    }}
                  >
                    <CardContent className="p-3">
                      <p className="truncate text-sm font-medium">
                        {schedule.atividade || 'Sem nome'}
                      </p>
                      {schedule.responsavel && (
                        <p className="truncate text-[11px] text-muted-foreground">
                          {schedule.responsavel}
                        </p>
                      )}
                      {schedule.data_prazo && (
                        <div className="mt-2 flex items-center gap-1">
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                            {new Date(schedule.data_prazo).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                            })}
                          </Badge>
                          {schedule.atrasado && (
                            <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                              Atrasado
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
