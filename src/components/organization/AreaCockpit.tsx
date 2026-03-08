'use client';

import { Building2, ExternalLink, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { OrgArea } from '@/types/organization';
import Link from 'next/link';

interface AreaCockpitProps {
  area: OrgArea;
  onEdit?: () => void;
}

interface InfoFieldProps {
  label: string;
  value: string | null | undefined;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value }) => {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || '-'}</p>
    </div>
  );
};

export const AreaCockpit: React.FC<AreaCockpitProps> = ({ area, onEdit }) => {
  const rolesDisplay =
    area.responsible_roles?.length > 0 ? area.responsible_roles.join(', ') : 'Não definido';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="size-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{area.name}</h3>
            {area.nuclei_count != null && (
              <p className="text-sm text-muted-foreground">{area.nuclei_count} núcleo(s)</p>
            )}
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
        <InfoField label="Descrição" value={area.description} />
        <InfoField label="Objetivo" value={area.objective} />
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="flex items-center gap-2 text-sm font-semibold">
          <Users className="size-4" />
          Roles responsáveis
        </h4>
        <p className="text-sm">{rolesDisplay}</p>
      </div>

      {area.id && (
        <>
          <Separator />
          <Link href={`/organizacao/areas/${area.id}/nucleos`}>
            <Button variant="secondary" className="w-full">
              Ver Núcleos
            </Button>
          </Link>
        </>
      )}
    </div>
  );
};
