'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, GitBranch, FileText, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InfoField, OrgEntityCard } from '@/components/organization/shared';
import { OrgEntityFormSheet } from '@/components/organization/OrgEntityFormSheet';
import type { OrgArea, OrgNucleus, OrgProcess } from '@/types/organization';

interface AreaCockpit360Props {
  area: OrgArea;
  nuclei: OrgNucleus[];
  processes: OrgProcess[];
  onSelectNucleus?: (nucleus: OrgNucleus) => void;
  onNucleiUpdated?: (nuclei: OrgNucleus[]) => void;
  onAreaUpdated?: (area: OrgArea) => void;
}

export const AreaCockpit360: React.FC<AreaCockpit360Props> = ({
  area,
  nuclei,
  processes,
  onSelectNucleus,
  onNucleiUpdated,
  onAreaUpdated,
}) => {
  const [showCreateNucleusSheet, setShowCreateNucleusSheet] = useState(false);
  const [showEditAreaSheet, setShowEditAreaSheet] = useState(false);
  const [currentArea, setCurrentArea] = useState(area);
  const [localNuclei, setLocalNuclei] = useState(nuclei);

  useEffect(() => {
    setCurrentArea(area);
  }, [area]);

  useEffect(() => {
    setLocalNuclei(nuclei);
  }, [nuclei]);

  const rolesDisplay =
    currentArea.responsible_roles?.length > 0
      ? currentArea.responsible_roles.join(', ')
      : 'Não definido';

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
            value="nucleos"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:bg-transparent"
          >
            <Building2 className="mr-2 size-4" />
            Núcleos
            {localNuclei.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({localNuclei.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="processos"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:bg-transparent"
          >
            <GitBranch className="mr-2 size-4" />
            Processos
            {processes.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({processes.length})</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="principal" className="mt-6 space-y-8">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowEditAreaSheet(true)}>
              Editar
            </Button>
          </div>

          <section>
            <div className="mb-4 flex items-center gap-2 border-b pb-2">
              <FileText className="text-primary size-5" />
              <h3 className="text-base font-semibold">Informações</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <InfoField label="Descrição" value={currentArea.description} />
              <InfoField label="Objetivo" value={currentArea.objective} />
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
            onClick={() => setShowCreateNucleusSheet(true)}
            aria-label="Criar núcleo vinculado a esta área"
          >
            <Plus className="size-4" />
            Novo Núcleo
          </Button>
        </TabsContent>

        <TabsContent value="nucleos" className="mt-6 space-y-3">
          <div className="mb-4">
            <Button
              variant="default"
              size="sm"
              className="gap-2"
              onClick={() => setShowCreateNucleusSheet(true)}
              aria-label="Criar núcleo vinculado a esta área"
            >
              <Plus className="size-4" />
              Novo Núcleo
            </Button>
          </div>
          {localNuclei.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Nenhum núcleo nesta área
            </div>
          ) : (
            <div className="space-y-3">
              {localNuclei.map((nucleus) => (
                <OrgEntityCard
                  key={nucleus.id}
                  title={nucleus.name}
                  subtitle={nucleus.objective ?? undefined}
                  badge={`${nucleus.processes_count || 0} processos`}
                  meta={{
                    roles: nucleus.responsible_roles?.length || 0,
                  }}
                  onClick={() => onSelectNucleus?.(nucleus)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="processos" className="mt-6">
          {processes.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Nenhum processo vinculado a esta área
            </div>
          ) : (
            <div className="space-y-3">
              {processes.map((process) => (
                <Link key={process.id} href={`/organizacao/processos/${process.id}/rotinas`}>
                  <div className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{process.name}</p>
                      {process.description && (
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {process.description}
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

      <OrgEntityFormSheet
        entity="nucleus"
        mode="create"
        isOpen={showCreateNucleusSheet}
        context={{ areaId: currentArea.id }}
        contextSummary={[{ label: 'Área', value: currentArea.name }]}
        onClose={() => setShowCreateNucleusSheet(false)}
        onSaved={(newNucleus) => {
          const updated = [...localNuclei, newNucleus as OrgNucleus];
          setLocalNuclei(updated);
          onNucleiUpdated?.(updated);
          setShowCreateNucleusSheet(false);
        }}
      />

      <OrgEntityFormSheet
        entity="area"
        mode="edit"
        initialData={currentArea}
        isOpen={showEditAreaSheet}
        contextSummary={[{ label: 'Área', value: currentArea.name }]}
        onClose={() => setShowEditAreaSheet(false)}
        onSaved={(savedArea) => {
          setCurrentArea(savedArea as OrgArea);
          onAreaUpdated?.(savedArea as OrgArea);
          setShowEditAreaSheet(false);
        }}
      />
    </div>
  );
};
