'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { GitBranch, Trash2, FileText, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InfoField } from '@/components/organization/shared';
import { OrgEntityFormSheet } from '@/components/organization/OrgEntityFormSheet';
import type { OrgArea, OrgNucleus, OrgProcess } from '@/types/organization';

interface NucleusCockpit360Props {
  nucleus: OrgNucleus & { processes_count?: number; area_name?: string };
  areaId?: string;
  areaOptions?: Array<Pick<OrgArea, 'id' | 'name'>>;
  onDelete?: () => void;
  onSelectProcess?: (process: OrgProcess) => void;
  onProcessesUpdated?: (processes: OrgProcess[]) => void;
  onNucleusUpdated?: (nucleus: OrgNucleus) => void;
}

export const NucleusCockpit360: React.FC<NucleusCockpit360Props> = ({
  nucleus,
  areaId,
  areaOptions,
  onDelete,
  onSelectProcess,
  onProcessesUpdated,
  onNucleusUpdated,
}) => {
  const [showCreateProcessSheet, setShowCreateProcessSheet] = useState(false);
  const [showEditNucleusSheet, setShowEditNucleusSheet] = useState(false);
  const [currentNucleus, setCurrentNucleus] = useState(nucleus);
  const [localProcesses, setLocalProcesses] = useState<OrgProcess[]>([]);

  useEffect(() => {
    setCurrentNucleus(nucleus);
  }, [nucleus]);

  const rolesDisplay =
    currentNucleus.responsible_roles?.length > 0
      ? currentNucleus.responsible_roles.join(', ')
      : 'Não definido';
  const processesCount = Math.max(currentNucleus.processes_count ?? 0, localProcesses.length);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="principal" className="w-full">
        <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="principal"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:bg-transparent"
          >
            <FileText className="mr-2 size-4" />
            Principal
          </TabsTrigger>
          <TabsTrigger
            value="vinculos"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:bg-transparent"
          >
            <GitBranch className="mr-2 size-4" />
            Vínculos
            {processesCount > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({processesCount})</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="principal" className="mt-6 space-y-8">
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowEditNucleusSheet(true)}>
              Editar
            </Button>
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

          <section>
            <div className="mb-4 flex items-center gap-2 border-b pb-2">
              <FileText className="text-primary size-5" />
              <h3 className="text-base font-semibold">Informações</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <InfoField label="Descrição" value={currentNucleus.description} />
              <InfoField label="Objetivo" value={currentNucleus.objective} />
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center gap-2 border-b pb-2">
              <Users className="text-primary size-5" />
              <h3 className="text-base font-semibold">Roles responsáveis</h3>
            </div>
            <p className="text-sm">{rolesDisplay}</p>
          </section>

          <Button
            variant="default"
            className="w-full gap-2"
            onClick={() => setShowCreateProcessSheet(true)}
            aria-label="Criar processo vinculado a este núcleo"
          >
            <Plus className="size-4" />
            Novo Processo
          </Button>
        </TabsContent>

        <TabsContent value="vinculos" className="mt-6 space-y-3">
          <div className="mb-4">
            <Button
              variant="default"
              size="sm"
              className="gap-2"
              onClick={() => setShowCreateProcessSheet(true)}
              aria-label="Criar processo vinculado a este núcleo"
            >
              <Plus className="size-4" />
              Novo Processo
            </Button>
          </div>
          {processesCount > 0 && (
            <Link href={`/organizacao/processos?nucleus_id=${currentNucleus.id}`}>
              <Button variant="secondary" className="w-full justify-start gap-2">
                <GitBranch className="size-4" />
                Processos ({processesCount})
              </Button>
            </Link>
          )}
          {localProcesses.length > 0 && (
            <div className="space-y-3">
              {localProcesses.map((process) => (
                <button
                  key={process.id}
                  type="button"
                  className="hover:bg-muted/50 flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors"
                  onClick={() => onSelectProcess?.(process)}
                >
                  <div>
                    <p className="text-sm font-medium">{process.name}</p>
                    {process.description && (
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {process.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <OrgEntityFormSheet
        entity="process"
        mode="create"
        isOpen={showCreateProcessSheet}
        context={{ nucleusId: currentNucleus.id, areaId: areaId ?? currentNucleus.area_id }}
        contextSummary={[
          ...(currentNucleus.area_name ? [{ label: 'Área', value: currentNucleus.area_name }] : []),
          { label: 'Núcleo', value: currentNucleus.name },
        ]}
        onClose={() => setShowCreateProcessSheet(false)}
        onSaved={(newProcess) => {
          const updated = [...localProcesses, newProcess as OrgProcess];
          setLocalProcesses(updated);
          onProcessesUpdated?.(updated);
          setShowCreateProcessSheet(false);
        }}
      />

      <OrgEntityFormSheet
        entity="nucleus"
        mode="edit"
        initialData={currentNucleus}
        relationOptions={
          areaOptions?.length
            ? {
                areas: areaOptions.map((areaOption) => ({
                  id: areaOption.id,
                  name: areaOption.name,
                })),
              }
            : undefined
        }
        isOpen={showEditNucleusSheet}
        contextSummary={[
          ...(currentNucleus.area_name ? [{ label: 'Área', value: currentNucleus.area_name }] : []),
          { label: 'Núcleo', value: currentNucleus.name },
        ]}
        onClose={() => setShowEditNucleusSheet(false)}
        onSaved={(savedNucleus) => {
          setCurrentNucleus(savedNucleus as OrgNucleus & { processes_count?: number; area_name?: string });
          onNucleusUpdated?.(savedNucleus as OrgNucleus);
          setShowEditNucleusSheet(false);
        }}
      />
    </div>
  );
};
