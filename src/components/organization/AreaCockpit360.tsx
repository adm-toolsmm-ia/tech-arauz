'use client';

import React, { useState } from 'react';
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
  onEdit?: () => void;
  onSelectNucleus?: (nucleus: OrgNucleus) => void;
  onNucleiUpdated?: (nuclei: OrgNucleus[]) => void;
}

export const AreaCockpit360: React.FC<AreaCockpit360Props> = ({
  area,
  nuclei,
  processes,
  onEdit,
  onSelectNucleus,
  onNucleiUpdated,
}) => {
  const [showFormSheet, setShowFormSheet] = useState(false);
  const [localNuclei, setLocalNuclei] = useState(nuclei);

  const rolesDisplay =
    area.responsible_roles?.length > 0 ? area.responsible_roles.join(', ') : 'Não definido';

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
            value="nucleos"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Building2 className="mr-2 size-4" />
            Núcleos
            {nuclei.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({nuclei.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="processos"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <GitBranch className="mr-2 size-4" />
            Processos
            {processes.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({processes.length})</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="principal" className="mt-6 space-y-8">
          {onEdit && (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={onEdit}>
                Editar
              </Button>
            </div>
          )}

          <section>
            <div className="mb-4 flex items-center gap-2 border-b pb-2">
              <FileText className="size-5 text-primary" />
              <h3 className="text-base font-semibold">Informações</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <InfoField label="Descrição" value={area.description} />
              <InfoField label="Objetivo" value={area.objective} />
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center gap-2 border-b pb-2">
              <Users className="size-5 text-primary" />
              <h3 className="text-base font-semibold">Roles responsáveis</h3>
            </div>
            <p className="text-sm">{rolesDisplay}</p>
          </section>

          <Button
            variant="default"
            className="w-full gap-2"
            onClick={() => setShowFormSheet(true)}
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
              onClick={() => setShowFormSheet(true)}
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
              {localNuclei.map((n) => (
                <OrgEntityCard
                  key={n.id}
                  title={n.name}
                  subtitle={n.objective ?? undefined}
                  badge={`${n.processes_count || 0} processos`}
                  meta={{
                    roles: n.responsible_roles?.length || 0,
                  }}
                  onClick={() => onSelectNucleus?.(n)}
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
              {processes.map((p) => (
                <Link key={p.id} href={`/organizacao/processos/${p.id}/rotinas`}>
                  <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      {p.description && (
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {p.description}
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
        isOpen={showFormSheet}
        context={{ areaId: area.id }}
        onClose={() => setShowFormSheet(false)}
        onSaved={(newNucleus) => {
          const updated = [...localNuclei, newNucleus as OrgNucleus];
          setLocalNuclei(updated);
          onNucleiUpdated?.(updated);
          setShowFormSheet(false);
        }}
      />
    </div>
  );
};
