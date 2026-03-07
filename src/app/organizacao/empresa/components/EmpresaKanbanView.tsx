'use client';

import * as React from 'react';
import { KanbanBoard, type KanbanItem, type KanbanColumn } from '@/components/views/KanbanBoard';
import type { EmpresaVinculo, EmpresaVinculoType } from '../types';
import { VINCULO_LABELS } from '../types';

const COLUMNS: KanbanColumn[] = [
  { id: 'areas', title: 'Áreas', color: 'green' },
  { id: 'processos', title: 'Processos', color: 'blue' },
  { id: 'sistemas', title: 'Sistemas', color: 'amber' },
  { id: 'fornecedores', title: 'Fornecedores', color: 'green' },
  { id: 'servicos', title: 'Serviços', color: 'purple' },
  { id: 'documentos', title: 'Documentos', color: 'cyan' },
];

interface EmpresaKanbanViewProps {
  vinculos: EmpresaVinculo[];
  selectedId?: string;
  onItemClick: (v: EmpresaVinculo) => void;
}

function getSubtitle(v: EmpresaVinculo): string | undefined {
  switch (v.type) {
    case 'areas':
      return v.entity.nuclei_count != null ? `${v.entity.nuclei_count} núcleo(s)` : undefined;
    case 'processos':
      return [v.areaName, v.nucleusName].filter(Boolean).join(' / ') || undefined;
    case 'documentos':
      return v.entity.type ?? undefined;
    default:
      return undefined;
  }
}

export function EmpresaKanbanView({
  vinculos,
  selectedId,
  onItemClick,
}: EmpresaKanbanViewProps) {
  const kanbanItems: KanbanItem[] = vinculos.map((v) => ({
    id: v.id,
    title: v.name,
    subtitle: getSubtitle(v),
    status: v.type as string,
    priority: 'normal',
    metadata: {},
  }));

  return (
    <KanbanBoard
      columns={COLUMNS}
      items={kanbanItems}
      selectedId={selectedId}
      onItemClick={(item) => {
        const v = vinculos.find((x) => x.id === item.id);
        if (v) onItemClick(v);
      }}
      readOnly
      emptyMessage="Nenhum vínculo para exibir"
    />
  );
}
