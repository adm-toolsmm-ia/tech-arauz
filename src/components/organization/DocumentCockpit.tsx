'use client';

import { FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { OrgDocument } from '@/types/organization';
import Link from 'next/link';

interface DocumentCockpitProps {
  document: OrgDocument;
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

export function DocumentCockpit({ document, onEdit }: DocumentCockpitProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-lg bg-cyan-500/10">
            <FileText className="size-6 text-cyan-600" />
          </div>
          <div>
            <h3 className="font-semibold">{document.name}</h3>
            {document.type && <p className="text-sm text-muted-foreground">{document.type}</p>}
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
        <InfoField label="Descrição" value={document.description} />
      </div>

      <Separator />

      <Link href="/organizacao/recursos?tab=documentos">
        <Button variant="secondary" className="w-full">
          Ver Recursos
        </Button>
      </Link>
    </div>
  );
}
