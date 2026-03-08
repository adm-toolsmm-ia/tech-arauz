'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { KanbanBoard, type KanbanItem, type KanbanColumn } from '@/components/views/KanbanBoard';
import type { Schedule } from '@/lib/domain/schedule-status';
import {
  getKanbanColumnByStatus,
  buildScheduleKanbanColumns,
  KANBAN_ATRASADA_KEY,
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
  [KANBAN_ATRASADA_KEY]: 'red',
  'Aguardando confirmação': 'amber',
  'Aguardando data de início': 'amber',
  'Em execução': 'blue',
  'Em andamento': 'blue',
  Concluído: 'green',
  Concluida: 'green',
};

function getColumnColor(key: string): string {
  return columnColorMap[key] ?? 'gray';
}

export function CronogramaKanbanView({
  schedules,
  projectIds,
  onActivityClick,
  hideCompleted = true,
}: CronogramaKanbanViewProps) {
  const columnDefs = buildScheduleKanbanColumns(schedules, hideCompleted);
  const columns: KanbanColumn[] = columnDefs.map((col) => ({
    id: col.key,
    title: col.label,
    color: getColumnColor(col.key),
  }));

  const isCompleted = (s: Schedule) => {
    const lower = (s.status || '').toLowerCase();
    return lower === 'concluído' || lower === 'concluido' || lower === 'cancelado';
  };

  const kanbanItems: KanbanItem[] = schedules
    .filter((s) => !(hideCompleted && isCompleted(s)))
    .map((s) => ({
      id: s.id,
      title: s.atividade || 'Sem título',
      subtitle: s.responsavel || undefined,
      status: getKanbanColumnByStatus(s),
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
