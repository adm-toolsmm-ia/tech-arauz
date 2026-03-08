'use client';

import { Monitor, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { OrgSystem } from '@/types/organization';
import Link from 'next/link';

interface SystemCockpitProps {
  system: OrgSystem;
  onEdit?: () => void;
}

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || '-'}</p>
    </div>
  );
}

export const SystemCockpit: React.FC<SystemCockpitProps> = ({ system, onEdit }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-lg bg-amber-500/10">
            <Monitor className="size-6 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold">{system.name}</h3>
          </div>
        </div>
        {onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-2">
            <ExternalLink className="size-4" />
            Editar
          </Button>
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <InfoField label="Descrição" value={system.description} />
        <InfoField label="Propósito" value={system.purpose} />
      </div>

      <Separator />

      <Link href="/organizacao/recursos?tab=sistemas">
        <Button variant="secondary" className="w-full">
          Ver Recursos
        </Button>
      </Link>
    </div>
  );
};
