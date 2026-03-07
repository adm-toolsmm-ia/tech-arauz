'use client';

import Link from 'next/link';
import { GitBranch, FileText, ClipboardList, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { OrgProcess, OrgRoutine } from '@/types/organization';

interface ProcessCockpit360Props {
  process: OrgProcess;
  areaName?: string;
  nucleusName?: string;
  routines: OrgRoutine[];
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

export function ProcessCockpit360({
  process,
  areaName,
  nucleusName,
  routines,
  onEdit,
}: ProcessCockpit360Props) {
  const rolesDisplay =
    process.responsible_roles?.length > 0 ? process.responsible_roles.join(', ') : 'Não definido';

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
            value="rotinas"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <ClipboardList className="mr-2 size-4" />
            Rotinas
            {routines.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({routines.length})</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="principal" className="mt-6 space-y-8">
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
              <InfoField label="Descrição" value={process.description} />
              <InfoField label="Objetivo" value={process.objective} />
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center gap-2 border-b pb-2">
              <Users className="size-5 text-primary" />
              <h3 className="text-base font-semibold">Roles responsáveis</h3>
            </div>
            <p className="text-sm">{rolesDisplay}</p>
          </section>

          {process.id && (
            <Link href={`/organizacao/processos/${process.id}/rotinas`}>
              <Button variant="secondary" className="w-full">
                Ver Rotinas
              </Button>
            </Link>
          )}
        </TabsContent>

        <TabsContent value="rotinas" className="mt-6">
          {routines.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Nenhuma rotina cadastrada
            </div>
          ) : (
            <div className="space-y-3">
              {routines.map((r) => (
                <Link key={r.id} href={`/organizacao/processos/${process.id}/rotinas`}>
                  <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{r.name}</p>
                      {r.description && (
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {r.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
