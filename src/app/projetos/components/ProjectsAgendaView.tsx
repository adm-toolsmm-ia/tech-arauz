'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAgendaPeriodLabel, type ProjectAgendaPeriod } from '@/lib/domain/project-agenda';

interface ProjectForAgenda {
  id: string;
  project_name?: string | null;
  espaider_code?: string | null;
  status?: string | null;
  end_date?: string | null;
}

interface ProjectsAgendaViewProps<T extends ProjectForAgenda = ProjectForAgenda> {
  projects: T[];
  currentDate: Date;
  period: ProjectAgendaPeriod;
  onProjectClick?: (project: T) => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
}

function formatDateBR(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

/** Group projects by end_date */
function groupByEndDate<T extends ProjectForAgenda>(projects: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const p of projects) {
    const key = p.end_date || 'sem_data';
    if (!map.has(key)) map.set(key, [] as T[]);
    map.get(key)!.push(p);
  }
  return map;
}

export function ProjectsAgendaView<T extends ProjectForAgenda>({
  projects,
  currentDate,
  period,
  onProjectClick,
  onNavigatePrev,
  onNavigateNext,
}: ProjectsAgendaViewProps<T>) {
  const grouped = React.useMemo(() => groupByEndDate(projects), [projects]);

  const sortedDates = React.useMemo(() => {
    const dates = Array.from(grouped.keys()).filter((k) => k !== 'sem_data');
    dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    if (grouped.has('sem_data')) dates.push('sem_data');
    return dates;
  }, [grouped]);

  const periodLabel = getAgendaPeriodLabel(currentDate, period);
  const showNavigation = onNavigatePrev != null && onNavigateNext != null;

  return (
    <div className="space-y-6">
      {showNavigation && (
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNavigatePrev}
            className="h-8 w-8"
            aria-label="Período anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-base font-semibold">{periodLabel}</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNavigateNext}
            className="h-8 w-8"
            aria-label="Próximo período"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
              <CalendarDays className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="mt-4 text-sm font-medium text-foreground">Nenhum projeto no período</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Selecione outro período ou ajuste os filtros.
            </p>
          </CardContent>
        </Card>
      ) : (
        sortedDates.map((dateKey) => {
          const items = grouped.get(dateKey) ?? [];
          const label = dateKey === 'sem_data' ? 'Sem data definida' : formatDateBR(dateKey);

          return (
            <div key={dateKey} className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
              <div className="space-y-2">
                {items.map((p) => (
                  <Card
                    key={p.id}
                    className={cn(
                      'transition-colors hover:bg-muted/50',
                      onProjectClick && 'cursor-pointer',
                    )}
                    onClick={() => onProjectClick?.(p)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{p.project_name || 'Sem nome'}</p>
                        {p.espaider_code && (
                          <p className="text-xs text-muted-foreground">{p.espaider_code}</p>
                        )}
                      </div>
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {p.status || '—'}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
