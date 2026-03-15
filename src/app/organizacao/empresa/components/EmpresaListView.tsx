'use client';

import * as React from 'react';
import { Building2, GitBranch, Monitor, Truck, Wrench, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { EmpresaVinculo, EmpresaVinculoType } from '../types';
import { VINCULO_LABELS } from '../types';

const VINCULO_ICONS: Record<EmpresaVinculoType, React.ComponentType<{ className?: string }>> = {
  areas: Building2,
  processos: GitBranch,
  sistemas: Monitor,
  fornecedores: Truck,
  servicos: Wrench,
  documentos: FileText,
};

const VINCULO_COLORS: Record<EmpresaVinculoType, string> = {
  areas: 'text-primary bg-primary/10',
  processos: 'text-blue-600 bg-blue-500/10',
  sistemas: 'text-amber-600 bg-amber-500/10',
  fornecedores: 'text-emerald-600 bg-emerald-500/10',
  servicos: 'text-purple-600 bg-purple-500/10',
  documentos: 'text-cyan-600 bg-cyan-500/10',
};

interface EmpresaListViewProps {
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

export function EmpresaListView({ vinculos, selectedId, onItemClick }: EmpresaListViewProps) {
  const byType = React.useMemo(() => {
    const map = new Map<EmpresaVinculoType, EmpresaVinculo[]>();
    for (const v of vinculos) {
      const list = map.get(v.type) ?? [];
      list.push(v);
      map.set(v.type, list);
    }
    return map;
  }, [vinculos]);

  return (
    <div className="space-y-6">
      {(['areas', 'processos', 'sistemas', 'fornecedores', 'servicos', 'documentos'] as const).map(
        (type) => {
          const items = byType.get(type) ?? [];
          if (items.length === 0) return null;

          const Icon = VINCULO_ICONS[type];
          const colors = VINCULO_COLORS[type];
          const label = VINCULO_LABELS[type];

          return (
            <div key={type}>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">{label}</h3>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {items.map((v) => {
                      const subtitle = getSubtitle(v);
                      const isSelected = selectedId === v.id;
                      return (
                        <div
                          key={v.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => onItemClick(v)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onItemClick(v);
                            }
                          }}
                          className={`hover:bg-muted/50 flex cursor-pointer items-center gap-3 p-4 transition-colors ${
                            isSelected ? 'bg-muted/70' : ''
                          }`}
                        >
                          <div
                            className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${colors}`}
                          >
                            <Icon className="size-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">{v.name}</p>
                            {subtitle && (
                              <p className="text-sm text-muted-foreground">{subtitle}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        },
      )}
    </div>
  );
}
