'use client';

import * as React from 'react';
import { KanbanBoard, type KanbanItem, type KanbanColumn } from '@/components/views/KanbanBoard';
import type { NucleusWithMeta } from '@/hooks/useNucleosFilters';

interface NucleosKanbanViewProps {
  nuclei: NucleusWithMeta[];
  selectedNucleusId?: string;
  onNucleusClick: (nucleus: NucleusWithMeta) => void;
}

const COLUMNS: KanbanColumn[] = [
  { id: 'sem_processos', title: 'Sem Processos', color: 'gray' },
  { id: 'com_processos', title: 'Com Processos', color: 'green' },
];

export function NucleosKanbanView({
  nuclei,
  selectedNucleusId,
  onNucleusClick,
}: NucleosKanbanViewProps) {
  const kanbanItems: KanbanItem[] = nuclei.map((nucleus) => ({
    id: nucleus.id,
    title: nucleus.name,
    subtitle: nucleus.area_name ?? undefined,
    value: `${nucleus.processes_count ?? 0} processo(s)`,
    status: (nucleus.processes_count ?? 0) > 0 ? 'com_processos' : 'sem_processos',
    priority: 'normal',
    metadata: {},
  }));

  return (
    <KanbanBoard
      columns={COLUMNS}
      items={kanbanItems}
      selectedId={selectedNucleusId}
      onItemClick={(item) => {
        const nucleus = nuclei.find((n) => n.id === item.id);
        if (nucleus) onNucleusClick(nucleus);
      }}
      readOnly
      emptyMessage="Nenhum núcleo para exibir"
    />
  );
}
