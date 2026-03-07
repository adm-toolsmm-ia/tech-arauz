'use client';

import { GitBranch, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { OrgProcess } from '@/types/organization';
import Link from 'next/link';

interface ProcessCockpitProps {
  process: OrgProcess;
  areaName?: string;
  nucleusName?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || '-'}</p>
    </div>
  );
}

export function ProcessCockpit({ process, areaName, nucleusName, onEdit, onDelete }: ProcessCockpitProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
            <GitBranch className="size-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{process.name}</h3>
            {(areaName || nucleusName) && (
              <p className="text-sm text-muted-foreground">
                {[areaName, nucleusName].filter(Boolean).join(' / ')}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit} className="gap-2">
              <ExternalLink className="size-4" />
              Editar
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
              Excluir
            </Button>
          )}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <InfoField label="Descrição" value={process.description} />
        <InfoField label="Objetivo" value={process.objective} />
      </div>

      {process.id && (
        <>
          <Separator />
          <Link href={`/organizacao/processos/${process.id}/rotinas`}>
            <Button variant="secondary" className="w-full">
              Ver Rotinas
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}
