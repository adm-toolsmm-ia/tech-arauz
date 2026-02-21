'use client';

import * as React from 'react';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { useTheme } from 'next-themes';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

export function CronogramaGantt({ schedules, projectIds, onActivityClick }: CronogramaGanttProps) {
    const { theme } = useTheme();
    const [viewMode, setViewMode] = React.useState<ViewMode>(ViewMode.Day);

    const tasks: Task[] = React.useMemo(() => {
        return schedules
            .map((s) => {
                const end = new Date(s.data_fim || s.data_prazo || new Date());
                let start = new Date(s.data_inicio || end);

                if (start.getTime() === end.getTime()) {
                    // Default to 1 day span if start and end are the same
                    start.setDate(start.getDate() - 1);
                }

                const projectColor = getProjectColorHex(s.project_id, projectIds);

                return {
                    id: s.id,
                    type: 'task',
                    name: s.atividade || 'Sem nome',
                    start,
                    end,
                    progress: s.status === 'Concluído' ? 100 : 0,
                    styles: {
                        backgroundColor: s.atrasado ? '#ef4444' : projectColor,
                        backgroundSelectedColor: s.atrasado ? '#dc2626' : projectColor,
                        progressColor: s.atrasado ? '#b91c1c' : '#ffffff44',
                    },
                    project: s.project?.titulo || 'Projeto',
                    isDisabled: false, // For Read-only logic, we handle via callbacks
                } as Task;
            })
            .sort((a, b) => a.start.getTime() - b.start.getTime());
    }, [schedules, projectIds]);

    if (tasks.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                    Nenhuma atividade para exibir no formato Gantt.
                </CardContent>
            </Card>
        );
    }

    // Find dynamic column width based on ViewMode to look better
    let columnWidth = 60;
    if (viewMode === ViewMode.Month) {
        columnWidth = 250;
    } else if (viewMode === ViewMode.Week) {
        columnWidth = 150;
    }

    const handleTaskClick = (task: Task) => {
        if (onActivityClick) {
            const schedule = schedules.find((s) => s.id === task.id);
            if (schedule) onActivityClick(schedule);
        }
    };

    const isDarkMode = theme === 'dark';

    return (
        <div className="space-y-4">
            <div className="flex gap-2 mb-4 p-1 rounded-md bg-muted/30 w-fit border">
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

            <div className="w-full overflow-hidden rounded-md border bg-card">
                <Gantt
                    tasks={tasks}
                    viewMode={viewMode}
                    onClick={handleTaskClick}
                    onDateChange={() => { }}
                    onProgressChange={() => { }}
                    // styling for read-only interactivity essentially
                    listCellWidth={isDarkMode ? "" : "155px"} // Adjust width for labels
                    columnWidth={columnWidth}
                    rowHeight={45}
                    barCornerRadius={4}
                    handleWidth={8}
                    fontFamily="inherit"
                    fontSize="12px"
                    arrowColor="#9ca3af" // muted-foreground equivalent
                    todayColor={isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'}
                    barProgressColor="#ffffff55"
                />
            </div>
        </div>
    );
}
