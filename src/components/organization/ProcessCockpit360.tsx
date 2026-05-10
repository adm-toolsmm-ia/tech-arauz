'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  FileText,
  ClipboardList,
  Users,
  Monitor,
  Plus,
  Unlink,
  BarChart3,
  Target,
} from 'lucide-react';
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
import { InputsList } from '@/components/organization/InputsList';
import { OutputsList } from '@/components/organization/OutputsList';
import { RisksList } from '@/components/organization/RisksList';
import { ImpactsList } from '@/components/organization/ImpactsList';
import { ProcessMetricsCard } from '@/components/organization/ProcessMetricsCard';
import { ProcessMetricsHistory } from '@/components/organization/ProcessMetricsHistory';
import { ProcessSlaModal } from '@/components/organization/ProcessSlaModal';
import { ProcessSlaList } from '@/components/organization/ProcessSlaList';
import type { OrgProcess, OrgRoutine, OrgSystem, OrgProcessSla } from '@/types/organization';
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
  const [showEditProcess, setShowEditProcess] = useState(false);
  const [routines, setRoutines] = useState<OrgRoutine[]>(initialRoutines);
  const [loadingRoutines, setLoadingRoutines] = useState(false);
  const [metricsTimeframe, setMetricsTimeframe] = useState<'week' | 'month' | 'quarter'>('month');
  const [slas, setSlas] = useState<OrgProcessSla[]>([]);
  const [loadingSlas, setLoadingSlas] = useState(false);
  const [showSlaModal, setShowSlaModal] = useState(false);
  const [slaToEdit, setSlaToEdit] = useState<OrgProcessSla | null>(null);

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

  // Load SLAs
  useEffect(() => {
    if (!process?.id) return;

    setLoadingSlas(true);
    (async () => {
      try {
        const { getProcessSLAsAction } = await import('@/app/actions/organization');
        const result = await getProcessSLAsAction(process.id);
        if (result.success && result.data) {
          setSlas(result.data as OrgProcessSla[]);
        }
      } catch (error) {
        console.error('Erro ao carregar SLAs:', error);
      } finally {
        setLoadingSlas(false);
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
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:bg-transparent"
          >
            <FileText className="mr-2 size-4" />
            Principal
          </TabsTrigger>
          <TabsTrigger
            value="detalhes"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:bg-transparent"
          >
            <ClipboardList className="mr-2 size-4" />
            Detalhes
          </TabsTrigger>
          <TabsTrigger
            value="rotinas"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:bg-transparent"
          >
            <ClipboardList className="mr-2 size-4" />
            Rotinas
            {routines.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({routines.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="sistemas"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:bg-transparent"
          >
            <Monitor className="mr-2 size-4" />
            Sistemas
            {systems.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({systems.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="metricas"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:bg-transparent"
          >
            <BarChart3 className="mr-2 size-4" />
            Métricas
          </TabsTrigger>
          <TabsTrigger
            value="slas"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:bg-transparent"
          >
            <Target className="mr-2 size-4" />
            SLAs
            {slas.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({slas.length})</span>
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
              <FileText className="text-primary size-5" />
              <h3 className="text-base font-semibold">Informações</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <InfoField label="Descrição" value={process.description} />
              <InfoField label="Objetivo" value={process.objective} />
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center gap-2 border-b pb-2">
              <Users className="text-primary size-5" />
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

        <TabsContent value="detalhes" className="mt-6 space-y-6">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowEditProcess(true)}>
              Editar
            </Button>
          </div>

          <InputsList inputs={process.inputs} />
          <OutputsList outputs={process.outputs} />
          <RisksList risks={process.risks} />
          <ImpactsList impacts={process.impacts} />
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
                  <Button variant="outline" size="sm" className="shrink-0 gap-2" asChild>
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
                    className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
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
                        className="shrink-0 gap-2 text-destructive hover:text-destructive"
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

        {/* Tab: Métricas - Story 11.9 */}
        <TabsContent value="metricas" className="mt-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label htmlFor="metricsTimeframeSelect" className="text-sm font-medium">
                Período:
              </label>
              <select
                id="metricsTimeframeSelect"
                value={metricsTimeframe}
                onChange={(e) =>
                  setMetricsTimeframe(e.target.value as 'week' | 'month' | 'quarter')
                }
                className="rounded-md border px-3 py-2 text-sm"
              >
                <option value="week">Semanal</option>
                <option value="month">Mensal</option>
                <option value="quarter">Trimestral</option>
              </select>
            </div>

            <ProcessMetricsCard processId={process.id} />

            <ProcessMetricsHistory
              processId={process.id}
              timeframe={metricsTimeframe}
              onTimeframeChange={setMetricsTimeframe}
              metrics={[]}
            />
          </div>
        </TabsContent>

        {/* Tab: SLAs - Story 13.1 */}
        <TabsContent value="slas" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <Button
              variant="default"
              size="sm"
              className="gap-2"
              onClick={() => {
                setSlaToEdit(null);
                setShowSlaModal(true);
              }}
            >
              <Plus className="size-4" />
              Novo SLA
            </Button>
          </div>

          {loadingSlas ? (
            <Skeleton className="h-40" />
          ) : (
            <ProcessSlaList
              slas={slas}
              isLoading={false}
              onEdit={(sla) => {
                setSlaToEdit(sla);
                setShowSlaModal(true);
              }}
              onDeleteSuccess={() => {
                // Reload SLAs
                setLoadingSlas(true);
                (async () => {
                  try {
                    const { getProcessSLAsAction } = await import('@/app/actions/organization');
                    const result = await getProcessSLAsAction(process.id);
                    if (result.success && result.data) {
                      setSlas(result.data as OrgProcessSla[]);
                    }
                  } catch (error) {
                    console.error('Erro ao recarregar SLAs:', error);
                  } finally {
                    setLoadingSlas(false);
                  }
                })();
              }}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* SLA Modal */}
      <ProcessSlaModal
        processId={process.id}
        isOpen={showSlaModal}
        onClose={() => {
          setShowSlaModal(false);
          setSlaToEdit(null);
        }}
        onSave={() => {
          // Reload SLAs
          setLoadingSlas(true);
          (async () => {
            try {
              const { getProcessSLAsAction } = await import('@/app/actions/organization');
              const result = await getProcessSLAsAction(process.id);
              if (result.success && result.data) {
                setSlas(result.data as OrgProcessSla[]);
              }
            } catch (error) {
              console.error('Erro ao recarregar SLAs:', error);
            } finally {
              setLoadingSlas(false);
            }
          })();
        }}
        slaToEdit={slaToEdit}
        mode={slaToEdit ? 'edit' : 'create'}
      />

      <OrgEntityFormSheet
        entity="routine"
        mode="create"
        isOpen={showFormSheet}
        context={{ processId: process.id }}
        contextSummary={[
          ...(areaName ? [{ label: 'Área', value: areaName }] : []),
          ...(nucleusName ? [{ label: 'Núcleo', value: nucleusName }] : []),
          { label: 'Processo', value: process.name },
        ]}
        onClose={() => setShowFormSheet(false)}
        onSaved={(newRoutine) => {
          const updated = [...routines, newRoutine as OrgRoutine];
          setRoutines(updated);
          onRoutinesUpdated?.(updated);
          setShowFormSheet(false);
        }}
      />

      <OrgEntityFormSheet
        entity="process"
        mode="edit"
        initialData={process}
        isOpen={showEditProcess}
        onClose={() => setShowEditProcess(false)}
        onSaved={() => {
          setShowEditProcess(false);
          // Parent component should handle refetching data
        }}
        contextSummary={[
          ...(areaName ? [{ label: 'Área', value: areaName }] : []),
          ...(nucleusName ? [{ label: 'Núcleo', value: nucleusName }] : []),
          { label: 'Processo', value: process.name },
        ]}
      />
    </div>
  );
}
