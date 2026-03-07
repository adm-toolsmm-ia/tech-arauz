'use client';

import { Wrench, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { OrgService } from '@/types/organization';
import Link from 'next/link';

interface ServiceCockpitProps {
  service: OrgService;
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

export function ServiceCockpit({ service, onEdit }: ServiceCockpitProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-lg bg-purple-500/10">
            <Wrench className="size-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold">{service.name}</h3>
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
        <InfoField label="Descrição" value={service.description} />
      </div>

      <Separator />

      <Link href="/organizacao/recursos?tab=servicos">
        <Button variant="secondary" className="w-full">
          Ver Recursos
        </Button>
      </Link>
    </div>
  );
}
