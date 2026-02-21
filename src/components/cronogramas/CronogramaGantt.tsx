'use client';

import * as React from 'react';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { useTheme } from 'next-themes';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface ScheduleProject {
    id: string;
    titulo: string | null;
    codigo: string | null;
    status: string | null;
    fase_atual: string | null;
}

export interface Schedule {
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

interface CronogramaGanttProps {
    schedules: Schedule[];
    projectIds: string[];
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
            className="flex items-center border-b border-border bg-muted/40 text-muted-foreground font-semibold"
            style={{ height: headerHeight, fontFamily, fontSize: '0.75rem' }}
        >
            <div className="flex-1 px-4 truncate min-w-[120px]">Atividade / Projeto</div>
            <div className="w-20 px-2 truncate hidden lg:block text-xs">Resp.</div>
            <div className="w-20 px-2 truncate hidden lg:block text-xs">Status</div>
            <div className="w-16 px-1 truncate hidden xl:block text-xs text-center border-l">Início</div>
            <div className="w-16 px-1 truncate hidden xl:block text-xs text-center">Fim</div>
        </div>
    );
};

// Custom PT-BR Task List Table
const TaskListTableDefault = ({ rowHeight, rowWidth, tasks, fontFamily, fontSize, onExpanderClick }: any) => {
    return (
        <div style={{ fontFamily, fontSize: '0.75rem' }} className="flex flex-col">
            {tasks.map((t: any) => {
                const isProject = t.type === 'project';
                return (
                    <div
                        key={t.id}
                        className={`flex items-center border-b border-border/50 transition-colors ${isProject ? 'bg-muted/10 font-semibold text-foreground' : 'hover:bg-muted/30 text-muted-foreground'
                            }`}
                        style={{ height: rowHeight }}
                    >
                        <div
                            className="flex-1 flex items-center px-2 truncate min-w-[120px]"
                            style={{ paddingLeft: isProject ? '0.5rem' : '1.5rem' }}
                        >
                            {isProject && (
                                <button
                                    onClick={() => onExpanderClick(t)}
                                    className="mr-1.5 p-0.5 rounded-sm hover:bg-muted text-muted-foreground transition-all"
                                >
                                    {t.hideChildren ? (
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    ) : (
                                        <ChevronDown className="h-3.5 w-3.5" />
                                    )}
                                </button>
                            )}
                            {!isProject && (
                                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 mr-2 shrink-0" />
                            )}
                            <span className="truncate" title={t.name}>{t.name}</span>
                        </div>
                        <div className="w-20 px-2 text-muted-foreground truncate hidden lg:block text-[10px]">
                            <span className="truncate block" title={t.responsavel || '-'}>{t.responsavel || '-'}</span>
                        </div>
                        <div className="w-20 px-2 text-muted-foreground truncate hidden lg:block text-[10px]">
                            {t.status && !isProject ? (
                                <Badge variant="secondary" className="px-1 py-0 h-4 text-[9px] font-normal truncate uppercase">{t.status}</Badge>
                            ) : '-'}
                        </div>
                        <div className="w-16 px-1 text-muted-foreground truncate hidden xl:block text-[10px] text-center border-l border-border/30">
                            {t.originalStart ? t.originalStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : t.start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </div>
                        <div className="w-16 px-1 text-muted-foreground truncate hidden xl:block text-[10px] text-center">
                            {t.originalEnd ? t.originalEnd.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : t.end.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export function CronogramaGantt({ schedules, projectIds, onActivityClick }: CronogramaGanttProps) {
    const { theme } = useTheme();
    const [viewMode, setViewMode] = React.useState<ViewMode>(ViewMode.Day);
    const [collapsedIds, setCollapsedIds] = React.useState<string[]>([]);
    const [listWidth, setListWidth] = React.useState<string>("480px");

    React.useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setListWidth("200px"); // Only name
            } else if (window.innerWidth < 1280) {
                setListWidth("360px"); // Name + Resp + Status
            } else {
                setListWidth("480px"); // Full width (Name + Resp + Status + Dates)
            }
        };

        handleResize(); // Init
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const tasks: any[] = React.useMemo(() => {
        const uniqueProjectIds = Array.from(new Set(schedules.map((s) => s.project_id)));

        // Define clipping window constraints (Today - 5 days => Today + 30 days)
        const today = new Date();
        const clipWindowStart = new Date(today);
        clipWindowStart.setDate(clipWindowStart.getDate() - 5);
        const clipWindowEnd = new Date(today);
        clipWindowEnd.setDate(clipWindowEnd.getDate() + 30);

        // Function to clamp date within our 30-day clipped window
        const clampDate = (d: Date) => {
            if (d < clipWindowStart) return new Date(clipWindowStart);
            if (d > clipWindowEnd) return new Date(clipWindowEnd);
            return new Date(d);
        };

        // Create virtual project parent tasks
        const projectTasks: any[] = uniqueProjectIds.map((projectId) => {
            const projectSchedules = schedules.filter((s) => s.project_id === projectId);
            const projectColor = getProjectColorHex(projectId, projectIds);
            const projectName = projectSchedules[0]?.project?.titulo || 'Projeto Sem Nome';

            let minStart = new Date(8640000000000000);
            let maxEnd = new Date(-8640000000000000);
            let completedCount = 0;

            projectSchedules.forEach((s) => {
                const end = new Date(s.data_fim || s.data_prazo || new Date());
                const start = new Date(s.data_inicio || end);
                if (start < minStart) minStart = start;
                if (end > maxEnd) maxEnd = end;
                if (s.status === 'Concluído') completedCount++;
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
            const progress = projectSchedules.length > 0 ? (completedCount / projectSchedules.length) * 100 : 0;

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
                status: ''
            };
        });

        // Create activity child tasks
        const activityTasks: any[] = schedules.map((s) => {
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

            const projectColor = getProjectColorHex(s.project_id, projectIds);
            let progress = 0;
            if (s.status === 'Concluído') progress = 100;
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
                status: s.status
            };
        });

        const allTasks = [...projectTasks, ...activityTasks].sort((a, b) => {
            // Ensure projects come first
            if (a.type === 'project' && b.type === 'project') return a.start.getTime() - b.start.getTime();
            if (a.type === 'project' && b.project === a.id) return -1;
            if (b.type === 'project' && a.project === b.id) return 1;

            // Sort by start date
            return a.start.getTime() - b.start.getTime();
        });

        return allTasks;
    }, [schedules, projectIds, collapsedIds]);

    if (tasks.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                    Nenhuma atividade para exibir no formato Gantt.
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
            const schedule = schedules.find((s) => s.id === task.id);
            if (schedule) onActivityClick(schedule);
        }
    };

    const handleExpanderClick = (task: Task) => {
        setCollapsedIds((prev) =>
            prev.includes(task.id) ? prev.filter((id) => id !== task.id) : [...prev, task.id]
        );
    };

    const isDarkMode = theme === 'dark';

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4 p-1 rounded-md bg-muted/30 w-fit border">
                <div className="flex gap-2">
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

            <div className="w-full overflow-x-auto rounded-md border bg-card/50 shadow-sm scrollbar-thin">
                <div className="min-w-[700px] lg:min-w-0">
                    <Gantt
                        tasks={tasks}
                        viewMode={viewMode}
                        onClick={handleTaskClick}
                        onExpanderClick={handleExpanderClick}
                        onDateChange={() => { }}
                        onProgressChange={() => { }}
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
