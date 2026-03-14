'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { GitBranch, FileText, ClipboardList, Users, Monitor, Plus, Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmptyState } from '@/components/ui/EmptyState';
import { InfoField, OrgEntityCard } from '@/components/organization/shared';
import { BpmDocumentationPanel } from '@/components/organization/BpmDocumentationPanel';
import { OrgEntityFormSheet } from '@/components/organization/OrgEntityFormSheet';
import type { OrgProcess, OrgRoutine, OrgSystem } from '@/types/organization';
import { getRoutinesByProcess } from '@/app/actions/organization';

interface ProcessCockpit360Props {
  process: OrgProcess;
  areaName?: string;
  nucleusName?: string;
  routines?: OrgRoutine[];
  systems?: OrgSystem[];
  allSystems?: OrgSystem[];
  onEdit?: () => void;
  onDelete?: () => void;
  onSelectRoutine?: (routine: OrgRoutine) => void;
  onRoutinesUpdated?: (routines: OrgRoutine[]) => void;
  onLinkSystem?: (systemId: string) => void;
  onUnlinkSystem?: (systemId: string, systemName: string) => void;
}

export function ProcessCockpit360({
  process,
  areaName,
  nucleusName,
  routines: initialRoutines = [],
  systems = [],
  allSystems = [],
  onEdit,
  onDelete,
  onSelectRoutine,
  onRoutinesUpdated,
  onLinkSystem,
  onUnlinkSystem,
}: ProcessCockpit360Props) {
  const router = useRouter();
  const [showFormSheet, setShowFormSheet] = useState(false);
  const [routines, setRoutines] = useState<OrgRoutine[]>(initialRoutines);
  const [loadingRoutines, setLoadingRoutines] = useState(false);

  useEffect(() => {
    if (!process?.id) return;

    setLoadingRoutines(true);
    (async () => {
      try {
        const result = await getRoutinesByProcess(process.id);
        setRoutines(result || []);
      } catch (error) {
        console.error('Erro ao carregar rotinas:', error);
      } finally {
        setLoadingRoutines(false);
      }
    })();
  }, [process?.id]);

  const rolesDisplay =
    process.responsible_roles?.length > 0 ? process.responsible_roles.join(', ') : 'Não definido';

  const linkedSystemIds = new Set(systems.map((s) => s.id));
  const availableSystems = allSystems.filter((s) => !linkedSystemIds.has(s.id));

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
          <TabsTrigger
            value="sistemas"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Monitor className="mr-2 size-4" />
            Sistemas
            {systems.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({systems.length})</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="principal" className="mt-6 space-y-8">
          {(onEdit || onDelete) && (
            <div className="flex justify-end gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDelete}
                  className="text-destructive hover:text-destructive"
                >
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

          <BpmDocumentationPanel
            inputs={process.inputs}
            outputs={process.outputs}
            risks={process.risks}
            impacts={process.impacts}
            documentation={process.documentation}
            showSourceBadge={!!(process.documentation as { source?: string })?.source}
          />
        </TabsContent>

        <TabsContent value="rotinas" className="mt-6 space-y-3">
          <div className="mb-4">
            <Button
              variant="default"
              size="sm"
              className="gap-2"
              onClick={() => setShowFormSheet(true)}
              aria-label="Criar rotina vinculada a este processo"
            >
              <Plus className="size-4" />
              Nova Rotina
            </Button>
          </div>

          {loadingRoutines ? (
            <Skeleton className="h-20" />
          ) : routines.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Nenhuma rotina cadastrada
            </div>
          ) : (
            <div className="space-y-3">
              {routines.map((r) => (
                <OrgEntityCard
                  key={r.id}
                  title={r.name}
                  subtitle={r.description ?? undefined}
                  badge={`${r.activities_count || 0} atividades`}
                  onClick={() => onSelectRoutine?.(r)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sistemas" className="mt-6">
          {systems.length === 0 && !onLinkSystem ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Nenhum sistema vinculado a este processo
            </div>
          ) : systems.length === 0 && onLinkSystem && availableSystems.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Nenhum sistema vinculado. Selecione abaixo para vincular:
              </p>
              <Select
                onValueChange={(v) => {
                  if (v) onLinkSystem(v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um sistema..." />
                </SelectTrigger>
                <SelectContent>
                  {availableSystems.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : systems.length === 0 && onLinkSystem && availableSystems.length === 0 ? (
            <EmptyState
              icon={Monitor}
              title="Nenhum sistema disponível"
              description="Cadastre sistemas em Recursos para vinculá-los a processos."
              actionLabel="Ver Recursos"
              onAction={() => router.push('/organizacao/recursos?tab=sistemas')}
            />
          ) : (
            <div className="space-y-3">
              {onLinkSystem && availableSystems.length > 0 && (
                <div className="flex gap-2">
                  <Select
                    key={systems.length}
                    onValueChange={(v) => {
                      if (v) {
                        onLinkSystem(v);
                      }
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Vincular sistema..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSystems.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="gap-2 shrink-0" asChild>
                    <Link href="/organizacao/recursos?tab=sistemas">
                      <Plus className="h-4 w-4" />
                      Ver Recursos
                    </Link>
                  </Button>
                </div>
              )}
              {onLinkSystem && availableSystems.length === 0 && systems.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Todos os sistemas já estão vinculados.
                </p>
              )}
              <div className="space-y-2">
                {systems.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <Link
                      href={`/organizacao/recursos?tab=sistemas`}
                      className="min-w-0 flex-1 hover:underline"
                    >
                      <p className="text-sm font-medium">{s.name}</p>
                      {s.description && (
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {s.description}
                        </p>
                      )}
                    </Link>
                    {onUnlinkSystem && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-destructive hover:text-destructive shrink-0"
                        onClick={() => onUnlinkSystem(s.id, s.name)}
                        title="Desvincular sistema"
                        aria-label={`Desvincular ${s.name}`}
                      >
                        <Unlink className="h-4 w-4" />
                        Desvincular
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <OrgEntityFormSheet
        entity="routine"
        mode="create"
        isOpen={showFormSheet}
        context={{ processId: process.id }}
        onClose={() => setShowFormSheet(false)}
        onSaved={(newRoutine) => {
          const updated = [...routines, newRoutine as OrgRoutine];
          setRoutines(updated);
          onRoutinesUpdated?.(updated);
          setShowFormSheet(false);
        }}
      />
    </div>
  );
}
