'use client';

import * as React from 'react';
import { Calendar as CalendarIcon, CalendarDays } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SplitView } from '@/components/views/SplitView';
import { ProjectCockpit } from '@/components/project';
import { ScheduleCockpit } from '@/components/cronogramas/ScheduleCockpit';
import { cn } from '@/lib/utils';
import type { Schedule } from '@/lib/domain/schedule-status';
import { PROJECT_COLORS, getProjectColorIndex } from '@/lib/domain/schedule-status';

// ---------- SplitView Wrapper ----------

interface CronogramaCockpitProps {
  selectedSchedule: Schedule | null;
  allSchedules: Schedule[];
  onClose: () => void;
}

export function CronogramaCockpit({ selectedSchedule, allSchedules, onClose }: CronogramaCockpitProps) {
  return (
    <SplitView
      isOpen={!!selectedSchedule}
      onClose={onClose}
      title={selectedSchedule?.atividade || 'Cronograma'}
      subtitle={selectedSchedule?.project?.titulo || undefined}
      width="wide"
    >
      <ScheduleCockpit
        schedule={selectedSchedule}
        onClose={onClose}
        project={selectedSchedule?.project || undefined}
        projectSchedules={allSchedules.filter(s => s.project_id === selectedSchedule?.project_id)}
        projectDeliveries={[]}
        projectHistories={[]}
        projectApprovers={[]}
        projectBudgets={[]}
      />
    </SplitView>
  );
}

// ---------- Selected Day Panel ----------

interface SelectedDayPanelProps {
  date: Date;
  schedules: Schedule[];
  projectIds: string[];
  onActivityClick: (s: Schedule) => void;
}

export function SelectedDayPanel({ date, schedules, projectIds, onActivityClick }: SelectedDayPanelProps) {
  if (schedules.length === 0) {
    return (
      <Card className="animate-in slide-in-from-top-2">
        <CardContent className="py-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
            <CalendarDays className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h3 className="mt-4 text-sm font-medium text-foreground">Nenhuma atividade</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Não há atividades programadas para{' '}
            {date.toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
            })}
          </p>
          <p className="mt-3 text-xs text-muted-foreground/70">
            Selecione outro dia no calendário ou ajuste os filtros.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-in slide-in-from-top-2">
      <CardContent className="p-4">
        <div className="mb-4 flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">
            {date.toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </h3>
          <Badge variant="secondary" className="ml-auto text-xs">
            {schedules.length} {schedules.length === 1 ? 'atividade' : 'atividades'}
          </Badge>
        </div>
        <div className="space-y-2">
          {schedules.map((s) => {
            const colorIdx = getProjectColorIndex(s.project_id, projectIds);
            return (
              <div
                key={s.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-2.5 transition-colors hover:bg-muted/50"
                onClick={() => onActivityClick(s)}
              >
                <div
                  className={cn(
                    'h-8 w-1 shrink-0 rounded-full',
                    s.atrasado ? 'bg-red-500' : PROJECT_COLORS[colorIdx],
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.atividade || 'Sem nome'}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="truncate text-[11px] text-muted-foreground">
                      {s.project?.titulo || 'Projeto'}
                    </span>
                    {s.responsavel && (
                      <>
                        <span className="text-muted-foreground/50">|</span>
                        <span className="truncate text-[11px] text-muted-foreground">
                          {s.responsavel}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {s.atrasado && (
                    <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                      Atrasado
                    </Badge>
                  )}
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    {s.status || 'Pendente'}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
