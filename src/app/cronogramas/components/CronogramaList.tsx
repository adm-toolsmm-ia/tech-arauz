'use client';

import * as React from 'react';
import {
  CalendarDays,
  AlertTriangle,
  Clock,
  User,
  FolderKanban,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Schedule } from '@/lib/domain/schedule-status';
import {
  isWithin7Days,
  formatDateBR,
  getWeekStart,
  PROJECT_COLORS,
  getProjectColorIndex,
} from '@/lib/domain/schedule-status';

interface CronogramaListProps {
  schedules: Schedule[];
  allFilteredSchedules: Schedule[];
  projectIds: string[];
  viewMode: string;
  calendarPeriod: 'day' | 'week' | 'month';
  currentDate: Date;
  getSchedulesForDate: (d: Date) => Schedule[];
  onActivityClick: (s: Schedule) => void;
}

export function CronogramaList({
  schedules,
  allFilteredSchedules,
  projectIds,
  viewMode,
  calendarPeriod,
  currentDate,
  getSchedulesForDate,
  onActivityClick,
}: CronogramaListProps) {
  const { displaySchedules, periodLabel } = React.useMemo(() => {
    let display: Schedule[] = allFilteredSchedules;
    let label = '';

    if (viewMode === 'agenda' || viewMode === 'lista') {
      if (calendarPeriod === 'day' || calendarPeriod === 'week' || calendarPeriod === 'month') {
        display = getSchedulesForDate(currentDate) as Schedule[];

        if (calendarPeriod === 'day') {
          label = ` — ${currentDate.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
          })}`;
        } else if (calendarPeriod === 'week') {
          const weekStart = getWeekStart(currentDate);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          label = ` — Semana de ${weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} a ${weekEnd.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`;
        } else if (calendarPeriod === 'month') {
          label = ` — ${currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`;
        }
      }
    }

    return { displaySchedules: display, periodLabel: label };
  }, [allFilteredSchedules, viewMode, calendarPeriod, currentDate, getSchedulesForDate]);

  return (
    <div className={cn('space-y-3', viewMode === 'lista' && 'mt-0')}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Todas as Atividades{periodLabel}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({displaySchedules.length})
          </span>
        </h2>
      </div>
      <div
        className={cn(
          'grid gap-3',
          viewMode === 'lista'
            ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'md:grid-cols-2 xl:grid-cols-3',
        )}
      >
        {displaySchedules.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">Nenhuma atividade encontrada</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Ajuste os filtros ou sincronize os dados do Espaider.
            </p>
          </div>
        ) : (
          displaySchedules.map((schedule) => (
            <ActivityCard
              key={schedule.id}
              schedule={schedule}
              projectIds={projectIds}
              onClick={() => onActivityClick(schedule)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ---------- Activity Card ----------

export function ActivityCard({
  schedule,
  projectIds,
  onClick,
}: {
  schedule: Schedule;
  projectIds: string[];
  onClick: () => void;
}) {
  const colorIdx = getProjectColorIndex(schedule.project_id, projectIds);
  const effectiveDeadline = schedule.data_novo_prazo || schedule.data_prazo || schedule.data_fim;
  const isOverdueFlag = schedule.atrasado === true;
  const isNearDeadline = !isOverdueFlag && isWithin7Days(effectiveDeadline);

  return (
    <Card
      className={cn(
        'cursor-pointer shadow-soft transition-all duration-300 hover:shadow-card-hover',
        'animate-scale-in hover:-translate-y-0.5',
        isOverdueFlag && 'border-red-300 dark:border-red-800',
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'h-full min-h-[40px] w-1 shrink-0 rounded-full',
              isOverdueFlag ? 'bg-red-500' : PROJECT_COLORS[colorIdx],
            )}
          />
          <div className="min-w-0 flex-1 space-y-2.5">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h4 className="line-clamp-2 text-sm font-semibold leading-tight">
                  {schedule.atividade || 'Sem nome'}
                </h4>
                <div className="flex shrink-0 items-center gap-1">
                  {isOverdueFlag && (
                    <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                      <AlertTriangle className="mr-0.5 h-3 w-3" />
                      Atrasado
                    </Badge>
                  )}
                  {isNearDeadline && (
                    <Badge className="h-5 border-0 bg-amber-100 px-1.5 text-[10px] text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                      <Clock className="mr-0.5 h-3 w-3" />
                      Prazo
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <FolderKanban className="h-3 w-3 shrink-0 text-muted-foreground" />
              <span className="truncate text-[11px] text-muted-foreground">
                {schedule.project?.titulo || 'Projeto'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {schedule.responsavel && (
                <div className="flex items-center gap-1.5">
                  <User className="h-3 w-3 shrink-0 text-muted-foreground" />
                  <span className="truncate text-[11px] text-muted-foreground">
                    {schedule.responsavel}
                  </span>
                </div>
              )}
              {schedule.setor_responsavel && (
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[11px] text-muted-foreground">
                    {schedule.setor_responsavel}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              {schedule.data_inicio && (
                <span>
                  Início:{' '}
                  <span className="font-medium text-foreground/80">
                    {formatDateBR(schedule.data_inicio)}
                  </span>
                </span>
              )}
              {schedule.data_fim && (
                <span>
                  Fim:{' '}
                  <span className="font-medium text-foreground/80">
                    {formatDateBR(schedule.data_fim)}
                  </span>
                </span>
              )}
              {schedule.data_prazo && (
                <span className={isOverdueFlag ? 'text-red-500 dark:text-red-400' : ''}>
                  Prazo: <span className="font-medium">{formatDateBR(schedule.data_prazo)}</span>
                </span>
              )}
              {schedule.data_novo_prazo && (
                <span className="text-amber-600 dark:text-amber-400">
                  Novo Prazo:{' '}
                  <span className="font-medium">{formatDateBR(schedule.data_novo_prazo)}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 pt-0.5">
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {schedule.status || 'Pendente'}
              </Badge>
              {schedule.fase_atividade && (
                <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                  {schedule.fase_atividade}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
