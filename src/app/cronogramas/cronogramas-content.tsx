'use client';

import * as React from 'react';
import {
  Search,
  Filter,
  Calendar as CalendarIcon,
  CalendarDays,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  FolderKanban,
} from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { KPICard } from '@/components/dashboard/KPICard';
import { SplitView } from '@/components/views/SplitView';
import { ProjectCockpit } from '@/components/project';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// ---------- Types ----------

interface ScheduleProject {
  id: string;
  titulo: string | null;
  codigo: string | null;
  status: string | null;
  fase_atual: string | null;
}

interface Schedule {
  id: string;
  project_id: string;
  atividade: string | null;
  responsavel: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  status: string | null;
  fase_atividade: string | null;
  atrasado: boolean | null;
  setor_responsavel: string | null;
  item: string | null;
  detalhamento: string | null;
  data_prazo: string | null;
  data_novo_prazo: string | null;
  data_alerta_prazo: string | null;
  prazo_confirmado: boolean | null;
  project: ScheduleProject | null;
}

interface CronogramasContentProps {
  schedules: Schedule[];
}

// ---------- Helpers ----------

const PROJECT_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-pink-500',
];

const PROJECT_COLORS_LIGHT = [
  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
];

function getProjectColorIndex(projectId: string, projectIds: string[]): number {
  const idx = projectIds.indexOf(projectId);
  return idx >= 0 ? idx % PROJECT_COLORS.length : 0;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isWithinRange(date: Date, start: Date, end: Date): boolean {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return d >= s && d <= e;
}

function formatDateBR(dateStr: string | null): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  } catch {
    return '-';
  }
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isDateInPast(dateStr: string | null): boolean {
  if (!dateStr) return false;
  try {
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  } catch {
    return false;
  }
}

function isWithin7Days(dateStr: string | null): boolean {
  if (!dateStr) return false;
  try {
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in7 = addDays(today, 7);
    return d >= today && d <= in7;
  } catch {
    return false;
  }
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// ---------- Main Component ----------

export function CronogramasContent({ schedules }: CronogramasContentProps) {
  const [viewMode, setViewMode] = React.useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDay, setSelectedDay] = React.useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [projectFilter, setProjectFilter] = React.useState<string>('all');
  const [setorFilter, setSetorFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedSchedule, setSelectedSchedule] = React.useState<Schedule | null>(null);

  // Unique project IDs for consistent coloring
  const projectIds = React.useMemo(() => {
    const ids = Array.from(new Set(schedules.map((s) => s.project_id)));
    return ids.sort();
  }, [schedules]);

  // Extract unique values for filters
  const uniqueProjects = React.useMemo(() => {
    const map = new Map<string, string>();
    schedules.forEach((s) => {
      if (s.project?.id && s.project?.titulo) {
        map.set(s.project.id, s.project.titulo);
      }
    });
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [schedules]);

  const uniqueSetores = React.useMemo(() => {
    const set = new Set<string>();
    schedules.forEach((s) => {
      if (s.setor_responsavel) set.add(s.setor_responsavel);
    });
    return Array.from(set).sort();
  }, [schedules]);

  const uniqueStatuses = React.useMemo(() => {
    const set = new Set<string>();
    schedules.forEach((s) => {
      if (s.status) set.add(s.status);
    });
    return Array.from(set).sort();
  }, [schedules]);

  // Filtered schedules
  const filteredSchedules = React.useMemo(() => {
    let filtered = schedules;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.atividade?.toLowerCase().includes(term) ||
          s.responsavel?.toLowerCase().includes(term) ||
          s.project?.titulo?.toLowerCase().includes(term)
      );
    }

    if (projectFilter !== 'all') {
      filtered = filtered.filter((s) => s.project_id === projectFilter);
    }

    if (setorFilter !== 'all') {
      filtered = filtered.filter((s) => s.setor_responsavel === setorFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    return filtered;
  }, [schedules, searchTerm, projectFilter, setorFilter, statusFilter]);

  // KPI calculations
  const totalActivities = schedules.length;
  const delayedCount = schedules.filter((s) => s.atrasado === true).length;
  const completedCount = schedules.filter((s) =>
    s.status?.toLowerCase().includes('conclu')
  ).length;
  const nearDeadlineCount = schedules.filter((s) =>
    isWithin7Days(s.data_prazo || s.data_fim)
  ).length;

  // Navigation
  const navigateMonth = (direction: number) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + direction);
    setCurrentDate(d);
    setSelectedDay(null);
  };

  const navigateWeek = (direction: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + direction * 7);
    setCurrentDate(d);
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(new Date());
  };

  // Get schedules for a specific date
  const getSchedulesForDate = React.useCallback(
    (date: Date) => {
      return filteredSchedules.filter((s) => {
        const start = s.data_inicio ? new Date(s.data_inicio) : null;
        const end = s.data_fim ? new Date(s.data_fim) : null;

        if (start && end) {
          return isWithinRange(date, start, end);
        }
        if (start) return isSameDay(date, start);
        if (end) return isSameDay(date, end);
        return false;
      });
    },
    [filteredSchedules]
  );

  // Active filter count
  const activeFilterCount = [
    projectFilter !== 'all',
    setorFilter !== 'all',
    statusFilter !== 'all',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setProjectFilter('all');
    setSetorFilter('all');
    setStatusFilter('all');
    setSearchTerm('');
  };

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Cronogramas"
        subtitle="Visualize todos os cronogramas de projetos"
      />

      <div className="flex-1 space-y-6 p-6">
        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Atividades"
            value={totalActivities}
            icon={CalendarDays}
            subtitle="Em todos os projetos"
          />
          <KPICard
            title="Atrasadas"
            value={delayedCount}
            icon={AlertTriangle}
            className={delayedCount > 0 ? '[&_[class*=bg-primary]]:bg-red-500/10 [&_svg]:text-red-500' : ''}
            subtitle={delayedCount > 0 ? 'Requerem atenção imediata' : 'Nenhuma atividade atrasada'}
          />
          <KPICard
            title="Concluídas"
            value={completedCount}
            icon={CheckCircle2}
            trend={totalActivities > 0 ? {
              value: `${Math.round((completedCount / totalActivities) * 100)}%`,
              positive: true,
            } : undefined}
          />
          <KPICard
            title="Próximas do Prazo"
            value={nearDeadlineCount}
            icon={Clock}
            subtitle="Nos próximos 7 dias"
          />
        </div>

        {/* View Toggle + Filters Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-lg border shadow-sm">
          <div className="flex flex-1 gap-2 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar atividades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="h-8 w-px bg-border mx-2" />
            <Button
              variant={showFilters ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'text-primary' : 'text-muted-foreground'}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtros
              {activeFilterCount > 0 && (
                <Badge variant="destructive" className="ml-1.5 h-5 w-5 p-0 text-[10px] flex items-center justify-center rounded-full">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-destructive h-8 px-2"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="text-muted-foreground hover:text-foreground"
            >
              Hoje
            </Button>
            <div className="h-8 w-px bg-border mx-1" />
            <div className="flex items-center rounded-lg border bg-muted/30 p-0.5">
              <Button
                variant={viewMode === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('month')}
                className="h-7 text-xs rounded-md"
              >
                <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                Mês
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('week')}
                className="h-7 text-xs rounded-md"
              >
                <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                Semana
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Panel (Collapsible) */}
        {showFilters && (
          <div className="p-4 bg-muted/30 rounded-lg border border-dashed animate-in slide-in-from-top-2">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Projeto</label>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Todos os projetos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os projetos</SelectItem>
                    {uniqueProjects.map(([id, name]) => (
                      <SelectItem key={id} value={id}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Setor Responsável</label>
                <Select value={setorFilter} onValueChange={setSetorFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Todos os setores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os setores</SelectItem>
                    {uniqueSetores.map((setor) => (
                      <SelectItem key={setor} value={setor}>
                        {setor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    {uniqueStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Section */}
        {viewMode === 'month' ? (
          <MonthView
            currentDate={currentDate}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            onNavigate={navigateMonth}
            getSchedulesForDate={getSchedulesForDate}
            projectIds={projectIds}
          />
        ) : (
          <WeekView
            currentDate={currentDate}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            onNavigate={navigateWeek}
            getSchedulesForDate={getSchedulesForDate}
            projectIds={projectIds}
          />
        )}

        {/* Selected Day Activities */}
        {selectedDay && (
          <SelectedDayPanel
            date={selectedDay}
            schedules={getSchedulesForDate(selectedDay)}
            projectIds={projectIds}
            onActivityClick={setSelectedSchedule}
          />
        )}

        {/* Activity List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Todas as Atividades
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({filteredSchedules.length})
              </span>
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredSchedules.length === 0 ? (
              <div className="col-span-full py-12 text-center">
                <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">Nenhuma atividade encontrada</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ajuste os filtros ou sincronize os dados do Espaider.
                </p>
              </div>
            ) : (
              filteredSchedules.map((schedule) => (
                <ActivityCard
                  key={schedule.id}
                  schedule={schedule}
                  projectIds={projectIds}
                  onClick={() => setSelectedSchedule(schedule)}
                />
              ))
            )}
          </div>
        </div>

        {/* SplitView for Project Cockpit */}
        <SplitView
          isOpen={!!selectedSchedule}
          onClose={() => setSelectedSchedule(null)}
          title={selectedSchedule?.project?.titulo || 'Detalhes do Projeto'}
          subtitle={selectedSchedule?.project?.codigo || undefined}
          width="2xl"
        >
          {selectedSchedule?.project && (
            <ProjectCockpit
              project={{
                id: selectedSchedule.project.id,
                espaider_code: selectedSchedule.project.codigo || '',
                project_name: selectedSchedule.project.titulo || '',
                status: selectedSchedule.project.status || '',
                fase_atual: selectedSchedule.project.fase_atual,
                end_date: null,
                responsible: null,
                priority: null,
                category: null,
              }}
              schedules={[]}
              deliveries={[]}
              histories={[]}
              approvers={[]}
              budgets={[]}
            />
          )}
        </SplitView>
      </div>
    </div>
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

  // Build calendar grid
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }
  // Pad to complete last week
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return (
    <Card className="shadow-soft">
      <CardContent className="p-4 sm:p-6">
        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-6">
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

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAY_NAMES.map((name) => (
            <div
              key={name}
              className="text-center text-xs font-medium text-muted-foreground py-1"
            >
              {name}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
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
                      'aspect-square rounded-lg p-1 flex flex-col items-center justify-start gap-0.5 transition-all text-sm relative',
                      'hover:bg-accent/60 focus:outline-none focus:ring-2 focus:ring-ring/50',
                      isToday && 'bg-accent font-bold',
                      isSelected && 'ring-2 ring-primary bg-primary/5',
                      hasDelayed && daySchedules.length > 0 && 'ring-1 ring-red-300 dark:ring-red-700'
                    )}
                  >
                    <span
                      className={cn(
                        'text-xs leading-none mt-0.5',
                        isToday && 'text-primary font-bold',
                        date.getMonth() !== month && 'text-muted-foreground/50'
                      )}
                    >
                      {date.getDate()}
                    </span>
                    {daySchedules.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 justify-center mt-auto mb-0.5">
                        {daySchedules.slice(0, maxDots).map((s) => {
                          const colorIdx = getProjectColorIndex(s.project_id, projectIds);
                          return (
                            <div
                              key={s.id}
                              className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                s.atrasado ? 'bg-red-500' : PROJECT_COLORS[colorIdx]
                              )}
                            />
                          );
                        })}
                        {daySchedules.length > maxDots && (
                          <span className="text-[8px] text-muted-foreground leading-none">
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
                      <div className="space-y-1.5 max-h-60 overflow-y-auto">
                        {daySchedules.map((s) => {
                          const colorIdx = getProjectColorIndex(s.project_id, projectIds);
                          return (
                            <div
                              key={s.id}
                              className="flex items-start gap-2 p-1.5 rounded hover:bg-muted/50 cursor-pointer transition-colors"
                              onClick={() => onSelectDay(date)}
                            >
                              <div
                                className={cn(
                                  'w-2 h-2 rounded-full mt-1.5 shrink-0',
                                  s.atrasado ? 'bg-red-500' : PROJECT_COLORS[colorIdx]
                                )}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium truncate">
                                  {s.atividade || 'Sem nome'}
                                </p>
                                <p className="text-[10px] text-muted-foreground truncate">
                                  {s.project?.titulo || 'Projeto'}
                                </p>
                              </div>
                              {s.atrasado && (
                                <Badge variant="destructive" className="text-[9px] h-4 px-1 shrink-0">
                                  Atrasado
                                </Badge>
                              )}
                            </div>
                          );
                        })}
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
        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-6">
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

        {/* Week grid */}
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
                  'rounded-lg border p-2 min-h-[120px] flex flex-col transition-all',
                  'hover:border-primary/50 hover:bg-accent/30 focus:outline-none focus:ring-2 focus:ring-ring/50',
                  isToday && 'border-primary bg-primary/5',
                  isSelected && 'ring-2 ring-primary',
                  hasDelayed && 'border-red-300 dark:border-red-700'
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={cn(
                      'text-xs font-medium',
                      isToday && 'text-primary font-bold'
                    )}
                  >
                    {DAY_NAMES[date.getDay()]}
                  </span>
                  <span
                    className={cn(
                      'text-xs',
                      isToday
                        ? 'bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold'
                        : 'text-muted-foreground'
                    )}
                  >
                    {date.getDate()}
                  </span>
                </div>
                <div className="flex-1 space-y-0.5 overflow-hidden">
                  {daySchedules.slice(0, 3).map((s) => {
                    const colorIdx = getProjectColorIndex(s.project_id, projectIds);
                    return (
                      <div
                        key={s.id}
                        className={cn(
                          'text-[10px] px-1 py-0.5 rounded truncate font-medium',
                          s.atrasado
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            : PROJECT_COLORS_LIGHT[colorIdx]
                        )}
                      >
                        {s.atividade || 'Sem nome'}
                      </div>
                    );
                  })}
                  {daySchedules.length > 3 && (
                    <p className="text-[9px] text-muted-foreground text-center">
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

// ---------- Selected Day Panel ----------

function SelectedDayPanel({
  date,
  schedules,
  projectIds,
  onActivityClick,
}: {
  date: Date;
  schedules: Schedule[];
  projectIds: string[];
  onActivityClick: (s: Schedule) => void;
}) {
  if (schedules.length === 0) {
    return (
      <Card className="animate-in slide-in-from-top-2">
        <CardContent className="py-8 text-center">
          <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            Nenhuma atividade em{' '}
            {date.toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
            })}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-in slide-in-from-top-2">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
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
                className="flex items-center gap-3 p-2.5 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onActivityClick(s)}
              >
                <div
                  className={cn(
                    'w-1 h-8 rounded-full shrink-0',
                    s.atrasado ? 'bg-red-500' : PROJECT_COLORS[colorIdx]
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {s.atividade || 'Sem nome'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-muted-foreground truncate">
                      {s.project?.titulo || 'Projeto'}
                    </span>
                    {s.responsavel && (
                      <>
                        <span className="text-muted-foreground/50">|</span>
                        <span className="text-[11px] text-muted-foreground truncate">
                          {s.responsavel}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {s.atrasado && (
                    <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
                      Atrasado
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
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

// ---------- Activity Card ----------

function ActivityCard({
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
  const isOverdue = schedule.atrasado === true;
  const isNearDeadline = !isOverdue && isWithin7Days(effectiveDeadline);

  return (
    <Card
      className={cn(
        'shadow-soft hover:shadow-card-hover transition-all duration-300 cursor-pointer',
        'hover:-translate-y-0.5 animate-scale-in',
        isOverdue && 'border-red-300 dark:border-red-800'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Top bar with color indicator */}
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'w-1 h-full min-h-[40px] rounded-full shrink-0',
              isOverdue ? 'bg-red-500' : PROJECT_COLORS[colorIdx]
            )}
          />
          <div className="min-w-0 flex-1 space-y-2.5">
            {/* Activity name */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-semibold leading-tight line-clamp-2">
                  {schedule.atividade || 'Sem nome'}
                </h4>
                <div className="flex items-center gap-1 shrink-0">
                  {isOverdue && (
                    <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
                      <AlertTriangle className="h-3 w-3 mr-0.5" />
                      Atrasado
                    </Badge>
                  )}
                  {isNearDeadline && (
                    <Badge className="text-[10px] h-5 px-1.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-0">
                      <Clock className="h-3 w-3 mr-0.5" />
                      Prazo
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Project tag */}
            <div className="flex items-center gap-1.5">
              <FolderKanban className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-[11px] text-muted-foreground truncate">
                {schedule.project?.titulo || 'Projeto'}
              </span>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {schedule.responsavel && (
                <div className="flex items-center gap-1.5">
                  <User className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="text-[11px] text-muted-foreground truncate">
                    {schedule.responsavel}
                  </span>
                </div>
              )}
              {schedule.setor_responsavel && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground truncate">
                    {schedule.setor_responsavel}
                  </span>
                </div>
              )}
            </div>

            {/* Dates row */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              {schedule.data_inicio && (
                <span>
                  Início: <span className="font-medium text-foreground/80">{formatDateBR(schedule.data_inicio)}</span>
                </span>
              )}
              {schedule.data_fim && (
                <span>
                  Fim: <span className="font-medium text-foreground/80">{formatDateBR(schedule.data_fim)}</span>
                </span>
              )}
              {schedule.data_prazo && (
                <span className={isOverdue ? 'text-red-500 dark:text-red-400' : ''}>
                  Prazo: <span className="font-medium">{formatDateBR(schedule.data_prazo)}</span>
                </span>
              )}
              {schedule.data_novo_prazo && (
                <span className="text-amber-600 dark:text-amber-400">
                  Novo Prazo: <span className="font-medium">{formatDateBR(schedule.data_novo_prazo)}</span>
                </span>
              )}
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                {schedule.status || 'Pendente'}
              </Badge>
              {schedule.fase_atividade && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5">
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
