'use client';

import * as React from 'react';
import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Schedule } from '@/lib/domain/schedule-status';
import { formatDateBR, isConsideredActive } from '@/lib/domain/schedule-status';

// ---------- Types ----------

type SortField =
  | 'atividade'
  | 'projeto'
  | 'responsavel'
  | 'setor'
  | 'data_inicio'
  | 'data_fim'
  | 'data_prazo'
  | 'status'
  | 'fase_atividade';
type SortDirection = 'asc' | 'desc';

interface CronogramaTableViewProps {
  schedules: Schedule[];
  hideCompleted?: boolean;
  onActivityClick: (s: Schedule) => void;
}

// ---------- Component ----------

export function CronogramaTableView({
  schedules,
  hideCompleted = true,
  onActivityClick,
}: CronogramaTableViewProps) {
  const [sortField, setSortField] = React.useState<SortField>('data_inicio');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc');

  const displaySchedules = React.useMemo(() => {
    let filtered = hideCompleted
      ? schedules.filter((s) => isConsideredActive(s.status))
      : schedules;

    return [...filtered].sort((a, b) => {
      const mul = sortDirection === 'asc' ? 1 : -1;
      const va = getSortValue(a, sortField);
      const vb = getSortValue(b, sortField);
      if (va < vb) return -1 * mul;
      if (va > vb) return 1 * mul;
      return 0;
    });
  }, [schedules, hideCompleted, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const columns: { key: SortField; label: string; className?: string }[] = [
    { key: 'atividade', label: 'Atividade', className: 'min-w-[200px]' },
    { key: 'projeto', label: 'Projeto', className: 'min-w-[140px]' },
    { key: 'responsavel', label: 'Responsável', className: 'min-w-[120px]' },
    { key: 'setor', label: 'Setor', className: 'min-w-[100px]' },
    { key: 'data_inicio', label: 'Início', className: 'w-[100px]' },
    { key: 'data_fim', label: 'Fim', className: 'w-[100px]' },
    { key: 'data_prazo', label: 'Prazo', className: 'w-[100px]' },
    { key: 'status', label: 'Status', className: 'w-[120px]' },
    { key: 'fase_atividade', label: 'Fase', className: 'w-[120px]' },
  ];

  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/40 border-b">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'cursor-pointer select-none px-3 py-2.5 text-left font-medium text-muted-foreground transition-colors hover:text-foreground',
                  col.className,
                )}
                onClick={() => handleSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {sortField === col.key ? (
                    sortDirection === 'asc' ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )
                  ) : (
                    <ArrowUpDown className="h-3 w-3 opacity-30" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displaySchedules.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-12 text-center text-muted-foreground">
                Nenhuma atividade encontrada.
              </td>
            </tr>
          ) : (
            displaySchedules.map((s) => (
              <tr
                key={s.id}
                className="hover:bg-muted/30 cursor-pointer border-b transition-colors last:border-0"
                onClick={() => onActivityClick(s)}
              >
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    {s.atrasado && (
                      <Badge variant="destructive" className="shrink-0 px-1.5 py-0 text-[10px]">
                        Atrasada
                      </Badge>
                    )}
                    <span className="line-clamp-1 font-medium">{s.atividade || 'Sem título'}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  <span className="line-clamp-1">{s.project?.titulo || '—'}</span>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  <span className="line-clamp-1">{s.responsavel || '—'}</span>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  <span className="line-clamp-1">{s.setor_responsavel || '—'}</span>
                </td>
                <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                  {formatDateBR(s.data_inicio)}
                </td>
                <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                  {formatDateBR(s.data_fim)}
                </td>
                <td
                  className={cn(
                    'px-3 py-2.5 tabular-nums',
                    s.atrasado ? 'font-medium text-red-500' : 'text-muted-foreground',
                  )}
                >
                  {formatDateBR(s.data_prazo)}
                </td>
                <td className="px-3 py-2.5">
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                    {s.status || 'Pendente'}
                  </Badge>
                </td>
                <td className="px-3 py-2.5">
                  {s.fase_atividade ? (
                    <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                      {s.fase_atividade}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="bg-muted/20 border-t px-3 py-2 text-xs text-muted-foreground">
        {displaySchedules.length} atividade{displaySchedules.length !== 1 ? 's' : ''}
        {hideCompleted && ' (excluindo concluídas)'}
      </div>
    </div>
  );
}

// ---------- Helpers ----------

function getSortValue(s: Schedule, field: SortField): string {
  switch (field) {
    case 'atividade':
      return (s.atividade || '').toLowerCase();
    case 'projeto':
      return (s.project?.titulo || '').toLowerCase();
    case 'responsavel':
      return (s.responsavel || '').toLowerCase();
    case 'setor':
      return (s.setor_responsavel || '').toLowerCase();
    case 'data_inicio':
      return s.data_inicio || '';
    case 'data_fim':
      return s.data_fim || '';
    case 'data_prazo':
      return s.data_prazo || '';
    case 'status':
      return (s.status || '').toLowerCase();
    case 'fase_atividade':
      return (s.fase_atividade || '').toLowerCase();
  }
}
