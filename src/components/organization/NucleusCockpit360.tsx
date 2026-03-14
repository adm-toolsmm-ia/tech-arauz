'use client';

import Link from 'next/link';
import { GitBranch, Building2, ExternalLink, Trash2, FileText, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InfoField } from '@/components/organization/shared';
import type { OrgNucleus } from '@/types/organization';

interface NucleusCockpit360Props {
  nucleus: OrgNucleus & { processes_count?: number; area_name?: string };
  areaId?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onCreateProcess?: () => void;
  onSelectProcess?: (process: any) => void;
}

export const NucleusCockpit360: React.FC<NucleusCockpit360Props> = ({
  nucleus,
  areaId,
  onEdit,
  onDelete,
  onCreateProcess,
  onSelectProcess,
}) => {
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
          {(onEdit || onDelete) && (
            <div className="flex justify-end gap-2">
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
          )}

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

          {onCreateProcess && (
            <Button
              variant="default"
              className="w-full gap-2"
              onClick={onCreateProcess}
              aria-label="Criar processo vinculado a este núcleo"
            >
              <Plus className="size-4" />
              Novo Processo
            </Button>
          )}
        </TabsContent>

        <TabsContent value="vinculos" className="mt-6 space-y-3">
          {onCreateProcess && (
            <div className="mb-4">
              <Button
                variant="default"
                size="sm"
                className="gap-2"
                onClick={onCreateProcess}
                aria-label="Criar processo vinculado a este núcleo"
              >
                <Plus className="size-4" />
                Novo Processo
              </Button>
            </div>
          )}
          {processesCount > 0 && (
            <Link href={`/organizacao/processos?nucleus_id=${nucleus.id}`}>
              <Button variant="secondary" className="w-full justify-start gap-2">
                <GitBranch className="size-4" />
                Processos ({processesCount})
              </Button>
            </Link>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
