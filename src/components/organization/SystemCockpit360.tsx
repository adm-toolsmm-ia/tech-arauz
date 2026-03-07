'use client';

import Link from 'next/link';
import { Monitor, FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { OrgSystem, OrgSystemResource } from '@/types/organization';

interface SystemCockpit360Props {
  system: OrgSystem;
  resources: OrgSystemResource[];
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

export function SystemCockpit360({ system, resources, onEdit }: SystemCockpit360Props) {
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
          <TabsTrigger
            value="recursos"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Settings className="mr-2 size-4" />
            Recursos
            {resources.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({resources.length})</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="principal" className="mt-6 space-y-8">
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
              <InfoField label="Descrição" value={system.description} />
              <InfoField label="Propósito" value={system.purpose} />
            </div>
          </section>

          <Link href="/organizacao/recursos?tab=sistemas">
            <Button variant="secondary" className="w-full">
              Ver Recursos
            </Button>
          </Link>
        </TabsContent>

        <TabsContent value="recursos" className="mt-6">
          {resources.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Nenhum recurso cadastrado neste sistema
            </div>
          ) : (
            <div className="space-y-3">
              {resources.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    {r.description && (
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {r.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
