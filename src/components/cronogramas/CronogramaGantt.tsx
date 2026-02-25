'use client';

import * as React from 'react';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { useTheme } from 'next-themes';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import { CronogramaData } from '@/hooks/useCronogramasFilters';

/** Use CronogramaData as the single source of truth */
export type Schedule = CronogramaData;

/** Projetos iniciado ou em execução (Gantt exibe apenas esses) */
function isProjectActiveForGantt(s: Schedule): boolean {
  const status = (s.project?.status || '').trim().toLowerCase();
  return status === 'iniciado' || status === 'em execução';
}

interface CronogramaGanttProps {
  schedules: Schedule[];
  projectIds: string[];
  agendaPeriod?: 'day' | 'week' | 'month'; // Período sincronizado com FilterBar
  onActivityClick?: (schedule: Schedule) => void;
}

const HEX_COLORS = [
  '#3b82f6', // blue
  '#a855f7', // purple
  '#10b981', // emerald
  '#f59e0b', // amber
  '#f43f5e', // rose
  '#06b6d4', // cyan
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#f97316', // orange
  '#ec4899', // pink
];

function getProjectColorHex(projectId: string, projectIds: string[]): string {
  const idx = projectIds.indexOf(projectId);
  return HEX_COLORS[idx >= 0 ? idx % HEX_COLORS.length : 0];
}

// Custom PT-BR Task List Header
const TaskListHeaderDefault = ({ headerHeight, fontFamily, fontSize }: any) => {
  return (
    <div
      className="flex items-center border-b border-border bg-muted/40 font-semibold text-muted-foreground"
      style={{ height: headerHeight, fontFamily, fontSize: '0.75rem' }}
    >
      <div className="min-w-[120px] flex-1 truncate px-4">Atividade / Projeto</div>
      <div className="hidden w-20 truncate px-2 text-xs lg:block">Resp.</div>
      <div className="hidden w-20 truncate px-2 text-xs lg:block">Status</div>
      <div className="hidden w-16 truncate border-l px-1 text-center text-xs xl:block">Início</div>
      <div className="hidden w-16 truncate px-1 text-center text-xs xl:block">Fim</div>
    </div>
  );
};

// Custom PT-BR Task List Table
const TaskListTableDefault = ({
  rowHeight,
  rowWidth,
  tasks,
  fontFamily,
  fontSize,
  onExpanderClick,
}: any) => {
  return (
    <div style={{ fontFamily, fontSize: '0.75rem' }} className="flex flex-col">
      {tasks.map((t: any) => {
        const isProject = t.type === 'project';
        return (
          <div
            key={t.id}
            className={`flex items-center border-b border-border/50 transition-colors ${
              isProject
                ? 'bg-muted/10 font-semibold text-foreground'
                : 'text-muted-foreground hover:bg-muted/30'
            }`}
            style={{ height: rowHeight }}
          >
            <div
              className="flex min-w-[120px] flex-1 items-center truncate px-2"
              style={{ paddingLeft: isProject ? '0.5rem' : '1.5rem' }}
            >
              {isProject && (
                <button
                  onClick={() => onExpanderClick(t)}
                  className="mr-1.5 rounded-sm p-0.5 text-muted-foreground transition-all hover:bg-muted"
                >
                  {t.hideChildren ? (
                    <ChevronRight className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
              {!isProject && (
                <div className="mr-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/30" />
              )}
              <span className="truncate" title={t.name}>
                {t.name}
              </span>
            </div>
            <div className="hidden w-20 truncate px-2 text-[10px] text-muted-foreground lg:block">
              <span className="block truncate" title={t.responsavel || '-'}>
                {t.responsavel || '-'}
              </span>
            </div>
            <div className="hidden w-20 truncate px-2 text-[10px] text-muted-foreground lg:block">
              {t.status && !isProject ? (
                <Badge
                  variant="secondary"
                  className="h-4 truncate px-1 py-0 text-[9px] font-normal uppercase"
                >
                  {t.status}
                </Badge>
              ) : (
                '-'
              )}
            </div>
            <div className="hidden w-16 truncate border-l border-border/30 px-1 text-center text-[10px] text-muted-foreground xl:block">
              {t.originalStart
                ? t.originalStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                : t.start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
            </div>
            <div className="hidden w-16 truncate px-1 text-center text-[10px] text-muted-foreground xl:block">
              {t.originalEnd
                ? t.originalEnd.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                : t.end.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export function CronogramaGantt({ schedules, projectIds, agendaPeriod = 'day', onActivityClick }: CronogramaGanttProps) {
  const { theme } = useTheme();
  // Sincronizar viewMode interno com agendaPeriod recebido
  const initialViewMode = agendaPeriod === 'month' ? ViewMode.Month : agendaPeriod === 'week' ? ViewMode.Week : ViewMode.Day;
  const [viewMode, setViewMode] = React.useState<ViewMode>(initialViewMode);
  const [collapsedIds, setCollapsedIds] = React.useState<string[]>([]);
  const [listWidth, setListWidth] = React.useState<string>('480px');

  // Debug: log status values para diagnóstico
  React.useEffect(() => {
    const uniqueStatuses = Array.from(new Set(schedules.map((s) => s.project?.status).filter(Boolean)));
    if (process.env.NODE_ENV === 'development') {
      console.log('[CronogramaGantt] Project statuses found:', uniqueStatuses);
      console.log('[CronogramaGantt] Total schedules:', schedules.length);
    }
  }, [schedules]);

  // Gantt exibe apenas projetos iniciado ou em execução
  const ganttSchedules = React.useMemo(
    () => schedules.filter((s) => !s.project || isProjectActiveForGantt(s)),
    [schedules],
  );

  // projectIds atualizados para os schedules filtrados
  const ganttProjectIds = React.useMemo(() => {
    const ids = Array.from(new Set(ganttSchedules.map((s) => s.project_id)));
    return ids.sort();
  }, [ganttSchedules]);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setListWidth('200px'); // Only name
      } else if (window.innerWidth < 1280) {
        setListWidth('360px'); // Name + Resp + Status
      } else {
        setListWidth('480px'); // Full width (Name + Resp + Status + Dates)
      }
    };

    handleResize(); // Init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tasks: any[] = React.useMemo(() => {
    const uniqueProjectIds = Array.from(new Set(ganttSchedules.map((s) => s.project_id)));
    if (uniqueProjectIds.length === 0) return [];

    // Janela de datas baseada nos dados: min/max de todas as tarefas + margem
    // Não exibir datas futuras vazias (sem cronogramas)
    let dataMin = new Date(8640000000000000);
    let dataMax = new Date(-8640000000000000);
    ganttSchedules.forEach((s) => {
      const end = new Date(s.data_fim || s.data_prazo || new Date());
      const start = new Date(s.data_inicio || end);
      if (start < dataMin) dataMin = start;
      if (end > dataMax) dataMax = end;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dataMin.getTime() > dataMax.getTime()) {
      dataMin = new Date(today);
      dataMax = new Date(today);
    }
    const marginDays = viewMode === ViewMode.Month ? 14 : viewMode === ViewMode.Week ? 7 : 3;
    const clipWindowStart = new Date(dataMin);
    clipWindowStart.setDate(clipWindowStart.getDate() - marginDays);
    const clipWindowEnd = new Date(dataMax);
    clipWindowEnd.setDate(clipWindowEnd.getDate() + marginDays);
    if (today < clipWindowStart) clipWindowStart.setTime(today.getTime());
    if (today > clipWindowEnd) clipWindowEnd.setTime(today.getTime());

    const clampDate = (d: Date) => {
      if (d < clipWindowStart) return new Date(clipWindowStart);
      if (d > clipWindowEnd) return new Date(clipWindowEnd);
      return new Date(d);
    };

    const projectTasks: any[] = uniqueProjectIds.map((projectId) => {
      const projectSchedules = ganttSchedules.filter((s) => s.project_id === projectId);
      const projectColor = getProjectColorHex(projectId, ganttProjectIds);
      const projectName = projectSchedules[0]?.project?.titulo || 'Projeto Sem Nome';

      let minStart = new Date(8640000000000000);
      let maxEnd = new Date(-8640000000000000);
      let completedCount = 0;

      projectSchedules.forEach((s) => {
        const end = new Date(s.data_fim || s.data_prazo || new Date());
        const start = new Date(s.data_inicio || end);
        if (start < minStart) minStart = start;
        if (end > maxEnd) maxEnd = end;
        if ((s.status || '').trim().toLowerCase() === 'concluído') completedCount++;
      });

      if (minStart.getTime() > maxEnd.getTime()) {
        minStart = new Date();
        maxEnd = new Date();
      }

      const originalMinStart = new Date(minStart);
      const originalMaxEnd = new Date(maxEnd);

      // Constrain task bars visually
      minStart = clampDate(minStart);
      maxEnd = clampDate(maxEnd);

      // Fix case where maxEnd < minStart after clamping due to fully out of bounds times
      if (minStart.getTime() > maxEnd.getTime()) {
        maxEnd = new Date(minStart);
      }

      const isCollapsed = collapsedIds.includes(`project-${projectId}`);
      const progress =
        projectSchedules.length > 0 ? (completedCount / projectSchedules.length) * 100 : 0;

      return {
        id: `project-${projectId}`,
        type: 'project',
        name: projectName,
        start: minStart,
        end: maxEnd,
        originalStart: originalMinStart,
        originalEnd: originalMaxEnd,
        progress: progress,
        hideChildren: isCollapsed,
        styles: {
          backgroundColor: projectColor,
          backgroundSelectedColor: projectColor,
          progressColor: projectColor,
        },
        isDisabled: false,
        responsavel: '',
        status: '',
      };
    });

    const activityTasks: any[] = ganttSchedules.map((s) => {
      let end = new Date(s.data_fim || s.data_prazo || new Date());
      let start = new Date(s.data_inicio || end);

      if (start.getTime() === end.getTime()) {
        start.setDate(start.getDate() - 1);
      }

      const originalStart = new Date(start);
      const originalEnd = new Date(end);

      start = clampDate(start);
      end = clampDate(end);

      if (start.getTime() > end.getTime()) {
        end = new Date(start);
      }

      const projectColor = getProjectColorHex(s.project_id, ganttProjectIds);
      let progress = 0;
      if ((s.status || '').trim().toLowerCase() === 'concluído') progress = 100;
      else if (s.status?.toLowerCase().includes('andamento') || s.fase_atividade) progress = 50;

      return {
        id: s.id,
        type: 'task',
        name: s.atividade || 'Sem nome',
        start,
        end,
        originalStart,
        originalEnd,
        progress: progress,
        project: `project-${s.project_id}`,
        styles: {
          backgroundColor: s.atrasado ? '#ef4444' : projectColor,
          backgroundSelectedColor: s.atrasado ? '#dc2626' : projectColor,
          progressColor: s.atrasado ? '#b91c1c' : '#ffffff44',
        },
        isDisabled: false,
        responsavel: s.responsavel,
        status: s.status,
      };
    });

    const allTasks = [...projectTasks, ...activityTasks].sort((a, b) => {
      // Ensure projects come first
      if (a.type === 'project' && b.type === 'project')
        return a.start.getTime() - b.start.getTime();
      if (a.type === 'project' && b.project === a.id) return -1;
      if (b.type === 'project' && a.project === b.id) return 1;

      // Sort by start date
      return a.start.getTime() - b.start.getTime();
    });

    return allTasks;
  }, [ganttSchedules, ganttProjectIds, collapsedIds, viewMode]);

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <div className="space-y-2">
            <p>Nenhuma atividade para exibir no formato Gantt.</p>
            <p className="text-xs">
              Verifique se há projetos com status <strong>iniciado</strong> ou <strong>em execução</strong>.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const columnWidth = viewMode === ViewMode.Month ? 250 : viewMode === ViewMode.Week ? 150 : 60;

  const handleTaskClick = (task: Task) => {
    if (task.type === 'project') {
      handleExpanderClick(task);
      return;
    }

    if (onActivityClick) {
      const schedule = ganttSchedules.find((s) => s.id === task.id);
      if (schedule) onActivityClick(schedule);
    }
  };

  const handleExpanderClick = (task: Task) => {
    setCollapsedIds((prev) =>
      prev.includes(task.id) ? prev.filter((id) => id !== task.id) : [...prev, task.id],
    );
  };

  const isDarkMode = theme === 'dark';

  return (
    <div className="space-y-4">
      {/* Controles de período (Dia/Semana/Mês) - sempre visíveis */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex w-fit items-center rounded-md border border-border bg-muted/30 p-1">
          <Button
            variant={viewMode === ViewMode.Day ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode(ViewMode.Day)}
            className="h-7 text-xs"
          >
            Dia
          </Button>
          <Button
            variant={viewMode === ViewMode.Week ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode(ViewMode.Week)}
            className="h-7 text-xs"
          >
            Semana
          </Button>
          <Button
            variant={viewMode === ViewMode.Month ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode(ViewMode.Month)}
            className="h-7 text-xs"
          >
            Mês
          </Button>
        </div>
      </div>

      {/* Gráfico Gantt - altura controlada para melhor UX */}
      <div className="scrollbar-thin max-h-[600px] w-full overflow-auto rounded-md border border-border bg-card/50 shadow-sm">
        <div className="min-w-[700px] lg:min-w-0">
          <Gantt
            tasks={tasks}
            viewMode={viewMode}
            onClick={handleTaskClick}
            onExpanderClick={handleExpanderClick}
            onDateChange={() => {}}
            onProgressChange={() => {}}
            listCellWidth={listWidth}
            TaskListHeader={TaskListHeaderDefault}
            TaskListTable={TaskListTableDefault}
            columnWidth={columnWidth}
            rowHeight={45}
            barCornerRadius={4}
            handleWidth={8}
            fontFamily="inherit"
            fontSize="12px"
            arrowColor="#9ca3af" // muted-foreground equivalent
            todayColor={isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'}
            barProgressColor={isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}
            barBackgroundColor={isDarkMode ? '#333' : '#e5e7eb'}
          />
        </div>
      </div>
    </div>
  );
}
