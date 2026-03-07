'use client';

import Link from 'next/link';
import { Truck, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { OrgSupplier } from '@/types/organization';

interface SupplierCockpit360Props {
  supplier: OrgSupplier;
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

export function SupplierCockpit360({ supplier, onEdit }: SupplierCockpit360Props) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="principal" className="w-full">
        <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="principal"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <FileText className="mr-2 size-4" />
            Principal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="principal" className="mt-6 space-y-8">
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
                Editar
              </Button>
            )}
          </div>

          <section>
            <div className="mb-4 flex items-center gap-2 border-b pb-2">
              <FileText className="size-5 text-primary" />
              <h3 className="text-base font-semibold">Informações</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <InfoField label="Descrição" value={supplier.description} />
            </div>
          </section>

          <Link href="/organizacao/recursos?tab=fornecedores">
            <Button variant="secondary" className="w-full">
              Ver Recursos
            </Button>
          </Link>
        </TabsContent>
      </Tabs>
    </div>
  );
}
