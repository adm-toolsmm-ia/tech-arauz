'use client';

import * as React from 'react';
import { KanbanBoard, type KanbanItem, type KanbanColumn } from '@/components/views/KanbanBoard';
import type { OrgArea } from '@/types/organization';

interface AreasKanbanViewProps {
  areas: OrgArea[];
  selectedAreaId?: string;
  onAreaClick: (area: OrgArea) => void;
}

const COLUMNS: KanbanColumn[] = [
  { id: 'sem_nucleos', title: 'Sem Núcleos', color: 'gray' },
  { id: 'com_nucleos', title: 'Com Núcleos', color: 'green' },
];

export function AreasKanbanView({ areas, selectedAreaId, onAreaClick }: AreasKanbanViewProps) {
  const kanbanItems: KanbanItem[] = areas.map((area) => ({
    id: area.id,
    title: area.name,
    subtitle: area.description ?? undefined,
    value: `${area.nuclei_count ?? 0} núcleo(s)`,
    status: (area.nuclei_count ?? 0) > 0 ? 'com_nucleos' : 'sem_nucleos',
    priority: 'normal',
    metadata: {},
  }));

  return (
    <KanbanBoard
      columns={COLUMNS}
      items={kanbanItems}
      selectedId={selectedAreaId}
      onItemClick={(item) => {
        const area = areas.find((a) => a.id === item.id);
        if (area) onAreaClick(area);
      }}
      readOnly
      emptyMessage="Nenhuma área para exibir"
    />
  );
}
