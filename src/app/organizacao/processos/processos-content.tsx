'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { GitBranch, Layers, Monitor, Plus } from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { OrgBreadcrumb } from '@/components/organization/OrgBreadcrumb';
import { KPICard } from '@/components/dashboard/KPICard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SplitView } from '@/components/views/SplitView';
import { ContextPanel } from '@/components/views/ContextPanel';
import { FilterBar } from '@/components/filters/FilterBar';
import { ViewModeBar } from '@/components/filters/ViewModeBar';
import { ProcessCockpit360 } from '@/components/organization/ProcessCockpit360';
import { RoutineCockpit360 } from '@/components/organization/RoutineCockpit360';
import { ActivityCockpit360 } from '@/components/organization/ActivityCockpit360';
import { OrgEntityFormSheet } from '@/components/organization/OrgEntityFormSheet';
import { OrgEntityCard } from '@/components/organization/shared';
import { EmptyState } from '@/components/ui/EmptyState';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useProcessosFilters } from '@/hooks/useOrganizacaoFilters';
import {
  deleteProcessAction,
  addProcessSystemAction,
  removeProcessSystemAction,
} from '@/app/actions/organization';
import { toast } from 'sonner';
import type { OrgActivity, OrgProcess, OrgRoutine, OrgSystem } from '@/types/organization';

interface ProcessosContentProps {
  processes: OrgProcess[];
  areas: { id: string; name: string }[];
  nuclei: { id: string; name: string; area_id: string }[];
  areaMap: Record<string, string>;
  nucleusMap: Record<string, string>;
  routinesByProcessId: Record<string, OrgRoutine[]>;
  systems: OrgSystem[];
  systemsByProcessId: Record<string, OrgSystem[]>;
}

export function ProcessosContent({
  processes: initialProcesses,
  areas,
  nuclei,
  areaMap,
  nucleusMap,
  routinesByProcessId: initialRoutinesByProcessId = {},
  systems = [],
  systemsByProcessId = {},
}: ProcessosContentProps) {
  const router = useRouter();
  const [processes, setProcesses] = React.useState<OrgProcess[]>(initialProcesses);
  const [selectedProcess, setSelectedProcess] = React.useState<OrgProcess | null>(null);
  const [selectedRoutine, setSelectedRoutine] = React.useState<OrgRoutine | null>(null);
  const [selectedActivity, setSelectedActivity] = React.useState<OrgActivity | null>(null);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = React.useState(false);
  const [processToDelete, setProcessToDelete] = React.useState<OrgProcess | null>(null);
  const [processSystemToUnlink, setProcessSystemToUnlink] = React.useState<{
    processId: string;
    systemId: string;
    systemName: string;
  } | null>(null);
  const [routinesByProcessId, setRoutinesByProcessId] =
    React.useState<Record<string, OrgRoutine[]>>(initialRoutinesByProcessId);

  const {
    filters,
    search,
    viewMode,
    setViewMode,
    filteredData,
    updateFilter,
    setSearch,
    resetAllFilters,
    registry,
  } = useProcessosFilters(processes, areaMap, nucleusMap, routinesByProcessId);

  React.useEffect(() => {
    setProcesses(initialProcesses);
  }, [initialProcesses]);

  React.useEffect(() => {
    setRoutinesByProcessId(initialRoutinesByProcessId);
  }, [initialRoutinesByProcessId]);

  const kpis = React.useMemo(
    () => ({
      total: processes.length,
      withRoutines: processes.filter((process) => (routinesByProcessId[process.id] ?? []).length > 0)
        .length,
      withSystems: processes.filter((process) => (systemsByProcessId[process.id] ?? []).length > 0)
        .length,
    }),
    [processes, routinesByProcessId, systemsByProcessId],
  );

  const getProcessSubtitle = React.useCallback(
    (process: OrgProcess) =>
      [
        process.area_id ? areaMap[process.area_id] : null,
        process.nucleus_id ? nucleusMap[process.nucleus_id] : null,
      ]
        .filter(Boolean)
        .join(' / ') || 'Sem área/núcleo',
    [areaMap, nucleusMap],
  );

  const handleConfirmDelete = React.useCallback(async () => {
    if (!processToDelete) return;
    try {
      const result = await deleteProcessAction(processToDelete.id);
      if (result.success) {
        setProcesses((prev) => prev.filter((process) => process.id !== processToDelete.id));
        setRoutinesByProcessId((prev) => {
          const next = { ...prev };
          delete next[processToDelete.id];
          return next;
        });
        if (selectedProcess?.id === processToDelete.id) {
          setSelectedProcess(null);
          setSelectedRoutine(null);
        }
        setProcessToDelete(null);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    }
  }, [processToDelete, selectedProcess]);

  const handleLinkProcessSystem = React.useCallback(
    async (processId: string, systemId: string) => {
      try {
        const result = await addProcessSystemAction(processId, systemId);
        if (result.success) {
          toast.success(result.message);
          router.refresh();
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
      }
    },
    [router],
  );

  const handleUnlinkProcessSystem = React.useCallback(
    async (processId: string, systemId: string) => {
      try {
        const result = await removeProcessSystemAction(processId, systemId);
        if (result.success) {
          toast.success(result.message);
          setProcessSystemToUnlink(null);
          router.refresh();
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
      }
    },
    [router],
  );

  const handleProcessSaved = React.useCallback(
    (savedProcess: OrgProcess) => {
      setProcesses((prev) => {
        const exists = prev.some((process) => process.id === savedProcess.id);
        return exists
          ? prev.map((process) => (process.id === savedProcess.id ? savedProcess : process))
          : [...prev, savedProcess];
      });
      setSelectedProcess(savedProcess);
      setIsCreateSheetOpen(false);
    },
    [],
  );

  const renderListView = React.useCallback(
    (items: OrgProcess[]) => (
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {items.map((process) => (
              <div
                key={process.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedProcess(process);
                  setSelectedRoutine(null);
                  setSelectedActivity(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedProcess(process);
                    setSelectedRoutine(null);
                    setSelectedActivity(null);
                  }
                }}
                className="hover:bg-muted/50 flex cursor-pointer items-center justify-between p-4 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
                    <GitBranch className="text-primary size-5" />
                  </div>
                  <div>
                    <p className="font-medium">{process.name}</p>
                    <p className="text-sm text-muted-foreground">{getProcessSubtitle(process)}</p>
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {(routinesByProcessId[process.id] ?? []).length} rotina(s)
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    ),
    [getProcessSubtitle, routinesByProcessId],
  );

  const renderCardView = React.useCallback(
    (items: OrgProcess[]) => (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((process) => (
          <OrgEntityCard
            key={process.id}
            title={process.name}
            subtitle={getProcessSubtitle(process)}
            badge={`${(routinesByProcessId[process.id] ?? []).length} rotina(s)`}
            meta={{
              sistemas: (systemsByProcessId[process.id] ?? []).length,
            }}
            onClick={() => {
              setSelectedProcess(process);
              setSelectedRoutine(null);
              setSelectedActivity(null);
            }}
            className="h-full"
          />
        ))}
      </div>
    ),
    [getProcessSubtitle, routinesByProcessId, systemsByProcessId],
  );

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <DashboardHeader title="Processos" subtitle="Fluxos operacionais da organização" />
          <OrgBreadcrumb items={[{ label: 'Processos' }]} />
        </div>
        <Button className="gap-2" onClick={() => setIsCreateSheetOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo Processo
        </Button>
      </div>

      <div className="flex-1 space-y-6 p-6">
        <p className="sr-only" role="status" aria-live="polite">
          {`Lista com ${filteredData.length} processo(s).`}
        </p>

        {processes.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <KPICard
              icon={GitBranch}
              title="Total de Processos"
              value={kpis.total}
              trend={{ value: '0', positive: false }}
            />
            <KPICard
              icon={Layers}
              title="Com Rotinas"
              value={kpis.withRoutines}
              trend={{ value: '0', positive: true }}
            />
            <KPICard
              icon={Monitor}
              title="Com Sistemas"
              value={kpis.withSystems}
              trend={{ value: '0', positive: true }}
            />
          </div>
        )}

        <div className="space-y-3">
          <div className="flex justify-end">
            <ViewModeBar
              moduleId="organizacao-processos"
              registry={registry}
              activeViewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
          <FilterBar
            moduleId="organizacao-processos"
            filters={registry}
            onFiltersChange={(newFilters) => {
              Object.entries(newFilters).forEach(([key, value]) => {
                if (filters[key] !== value) {
                  updateFilter(key, value);
                }
              });
            }}
            onSearchChange={setSearch}
            onViewModeChange={setViewMode}
            initialFilters={filters}
            initialSearch={search}
            initialViewMode={viewMode}
            currentFilters={filters}
            currentSearch={search}
            currentViewMode={viewMode}
            onUpdateFilter={updateFilter}
            onResetFilters={() => {
              resetAllFilters();
              setSearch('');
            }}
          />
        </div>

        <div className="flex gap-6">
          <div className="min-w-0 flex-1">
            {filteredData.length === 0 ? (
              <EmptyState
                icon={GitBranch}
                title={processes.length === 0 ? 'Nenhum processo cadastrado' : 'Nenhum resultado'}
                description={
                  processes.length === 0
                    ? 'Crie processos para mapear os fluxos operacionais da empresa.'
                    : 'Ajuste os filtros ou busque por outro termo.'
                }
                actionLabel={processes.length === 0 ? 'Novo Processo' : undefined}
                onAction={processes.length === 0 ? () => setIsCreateSheetOpen(true) : undefined}
              />
            ) : viewMode === 'cards' ? (
              renderCardView(filteredData)
            ) : (
              renderListView(filteredData)
            )}
          </div>

          <SplitView
            isOpen={!!selectedProcess}
            onClose={() => {
              setSelectedProcess(null);
              setSelectedRoutine(null);
              setSelectedActivity(null);
            }}
            title={selectedProcess?.name ?? ''}
            subtitle={selectedProcess ? getProcessSubtitle(selectedProcess) : undefined}
            width="wide"
            contextDepth={selectedRoutine ? 1 : 0}
          >
            {selectedProcess && (
              <ProcessCockpit360
                process={selectedProcess}
                areaName={selectedProcess.area_id ? areaMap[selectedProcess.area_id] : undefined}
                nucleusName={
                  selectedProcess.nucleus_id ? nucleusMap[selectedProcess.nucleus_id] : undefined
                }
                routines={routinesByProcessId[selectedProcess.id] ?? []}
                systems={systemsByProcessId[selectedProcess.id] ?? []}
                allSystems={systems}
                areaOptions={areas}
                nucleusOptions={nuclei}
                onDelete={() => setProcessToDelete(selectedProcess)}
                onSelectRoutine={setSelectedRoutine}
                onRoutinesUpdated={(updatedRoutines) => {
                  setRoutinesByProcessId((prev) => ({
                    ...prev,
                    [selectedProcess.id]: updatedRoutines,
                  }));
                }}
                onProcessUpdated={(updatedProcess) => {
                  setProcesses((prev) =>
                    prev.map((process) =>
                      process.id === updatedProcess.id ? updatedProcess : process,
                    ),
                  );
                  setSelectedProcess(updatedProcess);
                }}
                onLinkSystem={(systemId) => handleLinkProcessSystem(selectedProcess.id, systemId)}
                onUnlinkSystem={(systemId, systemName) =>
                  setProcessSystemToUnlink({
                    processId: selectedProcess.id,
                    systemId,
                    systemName,
                  })
                }
              />
            )}
          </SplitView>

          <ContextPanel
            isOpen={!!selectedRoutine}
            onClose={() => setSelectedRoutine(null)}
            title={selectedRoutine?.name ?? ''}
            subtitle={selectedRoutine?.objective ?? undefined}
            breadcrumb={
              selectedProcess && selectedRoutine
                ? [
                    {
                      label: selectedProcess.name,
                      onClick: () => setSelectedRoutine(null),
                    },
                    {
                      label: selectedRoutine.name,
                      isCurrent: true,
                    },
                  ]
                : undefined
            }
            depth={2}
            className="w-full max-w-[min(92vw,560px)]"
          >
            {selectedRoutine && (
              <RoutineCockpit360
                routine={selectedRoutine}
                processOptions={
                  selectedProcess ? [{ id: selectedProcess.id, name: selectedProcess.name }] : undefined
                }
                onSelectActivity={setSelectedActivity}
                onRoutineUpdated={(updatedRoutine) => {
                  setSelectedRoutine(updatedRoutine);
                  setRoutinesByProcessId((prev) => ({
                    ...prev,
                    [updatedRoutine.process_id]: (prev[updatedRoutine.process_id] ?? []).map(
                      (routine) => (routine.id === updatedRoutine.id ? updatedRoutine : routine),
                    ),
                  }));
                }}
              />
            )}
          </ContextPanel>
        </div>
      </div>

      <Sheet open={selectedActivity !== null} onOpenChange={(open) => !open && setSelectedActivity(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          {selectedActivity && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle>{selectedActivity.name}</SheetTitle>
              </SheetHeader>
              <ActivityCockpit360 activity={selectedActivity} routine={selectedRoutine ?? undefined} />
            </>
          )}
        </SheetContent>
      </Sheet>

      <OrgEntityFormSheet
        entity="process"
        mode="create"
        isOpen={isCreateSheetOpen}
        relationOptions={{
          areas,
          nuclei,
        }}
        onClose={() => setIsCreateSheetOpen(false)}
        onSaved={(savedProcess) => handleProcessSaved(savedProcess as OrgProcess)}
      />

      <Dialog open={!!processToDelete} onOpenChange={(open) => !open && setProcessToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir processo</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o processo &quot;{processToDelete?.name}&quot;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!processSystemToUnlink}
        onOpenChange={(open) => !open && setProcessSystemToUnlink(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desvincular sistema</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja desvincular &quot;{processSystemToUnlink?.systemName}&quot; do
              processo?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessSystemToUnlink(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (processSystemToUnlink) {
                  handleUnlinkProcessSystem(
                    processSystemToUnlink.processId,
                    processSystemToUnlink.systemId,
                  );
                }
              }}
            >
              Desvincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
