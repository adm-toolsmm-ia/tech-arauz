'use client';

import { Truck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { OrgSupplier } from '@/types/organization';
import Link from 'next/link';

interface SupplierCockpitProps {
  supplier: OrgSupplier;
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

export const SupplierCockpit: React.FC<SupplierCockpitProps> = ({ supplier, onEdit }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-lg bg-emerald-500/10">
            <Truck className="size-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold">{supplier.name}</h3>
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
        <InfoField label="Descrição" value={supplier.description} />
      </div>

      <Separator />

      <Link href="/organizacao/recursos?tab=fornecedores">
        <Button variant="secondary" className="w-full">
          Ver Recursos
        </Button>
      </Link>
    </div>
  );
};
