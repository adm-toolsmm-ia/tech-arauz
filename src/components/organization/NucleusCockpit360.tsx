'use client';

import Link from 'next/link';
import { GitBranch, Building2, ExternalLink, Trash2, FileText, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { OrgNucleus } from '@/types/organization';

interface NucleusCockpit360Props {
  nucleus: OrgNucleus & { processes_count?: number; area_name?: string };
  areaId?: string;
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

export function NucleusCockpit360({ nucleus, areaId, onEdit, onDelete }: NucleusCockpit360Props) {
  const rolesDisplay =
    nucleus.responsible_roles?.length > 0 ? nucleus.responsible_roles.join(', ') : 'Não definido';
  const processesCount = nucleus.processes_count ?? 0;

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
            value="vinculos"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <GitBranch className="mr-2 size-4" />
            Vínculos
            {processesCount > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({processesCount})</span>
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
                <h3 className="font-semibold">{nucleus.name}</h3>
                {nucleus.area_name && (
                  <p className="text-sm text-muted-foreground">{nucleus.area_name}</p>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDelete}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                  Excluir
                </Button>
              )}
            </div>
          </div>

          <section>
            <div className="mb-4 flex items-center gap-2 border-b pb-2">
              <FileText className="size-5 text-primary" />
              <h3 className="text-base font-semibold">Informações</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <InfoField label="Descrição" value={nucleus.description} />
              <InfoField label="Objetivo" value={nucleus.objective} />
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center gap-2 border-b pb-2">
              <Users className="size-5 text-primary" />
              <h3 className="text-base font-semibold">Roles responsáveis</h3>
            </div>
            <p className="text-sm">{rolesDisplay}</p>
          </section>
        </TabsContent>

        <TabsContent value="vinculos" className="mt-6 space-y-3">
          <div className="flex flex-col gap-2">
            {areaId && (
              <Link href={`/organizacao/areas/${areaId}/nucleos`}>
                <Button variant="secondary" className="w-full justify-start gap-2">
                  <Building2 className="size-4" />
                  Ver Área
                </Button>
              </Link>
            )}
            <Link href={`/organizacao/processos?nucleus_id=${nucleus.id}`}>
              <Button variant="secondary" className="w-full justify-start gap-2">
                <GitBranch className="size-4" />
                Processos ({processesCount})
              </Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
