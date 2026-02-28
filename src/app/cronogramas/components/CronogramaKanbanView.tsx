'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { KanbanBoard, type KanbanItem, type KanbanColumn } from '@/components/views/KanbanBoard';
import type { Schedule } from '@/lib/domain/schedule-status';
import {
    getKanbanColumn,
    SCHEDULE_KANBAN_COLUMNS,
    formatDateBR,
} from '@/lib/domain/schedule-status';
import { cn } from '@/lib/utils';

interface CronogramaKanbanViewProps {
    schedules: Schedule[];
    projectIds: string[];
    onActivityClick: (s: Schedule) => void;
    hideCompleted?: boolean;
}

const columnColorMap: Record<string, string> = {
    pendente: 'amber',
    em_execucao: 'blue',
    atrasada: 'red',
    concluida: 'green',
};

export function CronogramaKanbanView({
    schedules,
    projectIds,
    onActivityClick,
    hideCompleted = true,
}: CronogramaKanbanViewProps) {
    const columns: KanbanColumn[] = SCHEDULE_KANBAN_COLUMNS
        .filter((col) => !(hideCompleted && col.key === 'concluida'))
        .map((col) => ({
            id: col.key,
            title: col.label,
            color: columnColorMap[col.key] || 'gray',
        }));

    const kanbanItems: KanbanItem[] = schedules
        .filter((s) => !(hideCompleted && getKanbanColumn(s.status, !!s.atrasado) === 'concluida'))
        .map((s) => ({
            id: s.id,
            title: s.atividade || 'Sem título',
            subtitle: s.responsavel || undefined,
            status: getKanbanColumn(s.status, !!s.atrasado),
            metadata: {
                ...(s.data_inicio ? { inicio: s.data_inicio } : {}),
                ...(s.data_fim ? { fim: s.data_fim } : {}),
                ...(s.fase_atividade ? { fase: s.fase_atividade } : {}),
            },
        }));

    const handleItemClick = (item: KanbanItem) => {
        const schedule = schedules.find((s) => s.id === item.id);
        if (schedule) onActivityClick(schedule);
    };

    return (
        <KanbanBoard
            columns={columns}
            items={kanbanItems}
            readOnly
            onItemClick={handleItemClick}
            renderItemContent={(item) => {
                const schedule = schedules.find((s) => s.id === item.id);
                if (!schedule) return null;
                return <ScheduleKanbanCard schedule={schedule} />;
            }}
            emptyMessage="Nenhum cronograma encontrado para o período selecionado."
        />
    );
}

function ScheduleKanbanCard({ schedule }: { schedule: Schedule }) {
    const isOverdue = !!schedule.atrasado;

    return (
        <div className="space-y-1.5">
            <span className="line-clamp-2 text-sm font-semibold leading-tight text-foreground/90">
                {schedule.atividade || 'Sem título'}
            </span>

            {schedule.responsavel && (
                <p className="text-[11px] text-muted-foreground">{schedule.responsavel}</p>
            )}

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                {schedule.data_inicio && <span>{formatDateBR(schedule.data_inicio)}</span>}
                {schedule.data_inicio && schedule.data_fim && <span>→</span>}
                {schedule.data_fim && <span>{formatDateBR(schedule.data_fim)}</span>}
            </div>

            <div className="flex items-center gap-1.5">
                {isOverdue && (
                    <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">
                        Atrasada
                    </Badge>
                )}
                {schedule.fase_atividade && (
                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                        {schedule.fase_atividade}
                    </Badge>
                )}
            </div>
        </div>
    );
}
