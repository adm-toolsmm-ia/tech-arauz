'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, ClipboardList, FileText, Plus } from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { OrgBreadcrumb } from '@/components/organization/OrgBreadcrumb';
import { KPICard } from '@/components/dashboard/KPICard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SplitView } from '@/components/views/SplitView';
import { FilterBar } from '@/components/filters/FilterBar';
import { ViewModeBar } from '@/components/filters/ViewModeBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { RoutineCockpit360 } from '@/components/organization/RoutineCockpit360';
import { ActivityCockpit360 } from '@/components/organization/ActivityCockpit360';
import { OrgEntityFormSheet } from '@/components/organization/OrgEntityFormSheet';
import { OrgEntityCard } from '@/components/organization/shared';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deleteRoutineAction } from '@/app/actions/organization';
import { useRotinasFilters } from '@/hooks/useOrganizacaoFilters';
import { toast } from 'sonner';
import type { OrgActivity, OrgRoutine } from '@/types/organization';

interface RotinasContentProps {
  processId: string;
  processName: string;
  routines: OrgRoutine[];
}

interface RoutineWithMeta extends OrgRoutine {
  process_name: string;
}

export function RotinasContent({
  processId,
  processName,
  routines: initialRoutines,
}: RotinasContentProps) {
  const seededRoutines = React.useMemo<RoutineWithMeta[]>(
    () =>
      initialRoutines.map((routine) => ({
        ...routine,
        process_name: processName,
      })),
    [initialRoutines, processName],
  );

  const [routines, setRoutines] = React.useState<RoutineWithMeta[]>(seededRoutines);
  const [selectedRoutine, setSelectedRoutine] = React.useState<RoutineWithMeta | null>(null);
  const [selectedActivity, setSelectedActivity] = React.useState<OrgActivity | null>(null);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = React.useState(false);
  const [routineToDelete, setRoutineToDelete] = React.useState<RoutineWithMeta | null>(null);

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
  } = useRotinasFilters(routines, [{ id: processId, name: processName }], {
    enableProcessFilter: false,
  });

  React.useEffect(() => {
    setRoutines(seededRoutines);
  }, [seededRoutines]);

  const kpis = React.useMemo(
    () => ({
      total: routines.length,
      comObjetivo: routines.filter((routine) => Boolean(routine.objective?.trim())).length,
      comRoles: routines.filter((routine) => (routine.responsible_roles ?? []).length > 0).length,
    }),
    [routines],
  );

  const handleConfirmDelete = React.useCallback(async () => {
    if (!routineToDelete) return;
    try {
      const result = await deleteRoutineAction(routineToDelete.id);
      if (result.success) {
        setRoutines((prev) => prev.filter((routine) => routine.id !== routineToDelete.id));
        if (selectedRoutine?.id === routineToDelete.id) {
          setSelectedRoutine(null);
          setSelectedActivity(null);
        }
        setRoutineToDelete(null);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    }
  }, [routineToDelete, selectedRoutine]);

  const renderListView = React.useCallback(
    (items: RoutineWithMeta[]) => (
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {items.map((routine) => (
              <div
                key={routine.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedRoutine(routine);
                  setSelectedActivity(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedRoutine(routine);
                    setSelectedActivity(null);
                  }
                }}
                className="hover:bg-muted/50 flex cursor-pointer items-center justify-between p-4 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
                    <ClipboardList className="text-primary size-5" />
                  </div>
                  <div>
                    <p className="font-medium">{routine.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {routine.description || 'Sem descrição'}
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {routine.activities_count ?? 0} atividade(s)
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    ),
    [],
  );

  const renderCardView = React.useCallback(
    (items: RoutineWithMeta[]) => (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((routine) => (
          <OrgEntityCard
            key={routine.id}
            title={routine.name}
            subtitle={routine.description ?? processName}
            badge={`${routine.activities_count ?? 0} atividade(s)`}
            meta={{
              roles: (routine.responsible_roles ?? []).length,
            }}
            onClick={() => {
              setSelectedRoutine(routine);
              setSelectedActivity(null);
            }}
            className="h-full"
          />
        ))}
      </div>
    ),
    [processName],
  );

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <DashboardHeader
            title={`Rotinas — ${processName}`}
            subtitle="Conjunto recorrente de atividades"
          />
          <OrgBreadcrumb
            items={[
              { label: 'Processos', href: '/organizacao/processos' },
              { label: processName, href: `/organizacao/processos/${processId}/rotinas` },
              { label: 'Rotinas' },
            ]}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/organizacao/processos" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <Button className="gap-2" onClick={() => setIsCreateSheetOpen(true)}>
            <Plus className="h-4 w-4" />
            Nova Rotina
          </Button>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <p className="sr-only" role="status" aria-live="polite">
          {`Lista com ${filteredData.length} rotina(s).`}
        </p>

        {routines.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <KPICard
              icon={ClipboardList}
              title="Total de Rotinas"
              value={kpis.total}
              trend={{ value: '0', positive: false }}
            />
            <KPICard
              icon={FileText}
              title="Com Objetivo"
              value={kpis.comObjetivo}
              trend={{ value: '0', positive: true }}
            />
            <KPICard
              icon={Plus}
              title="Com Roles"
              value={kpis.comRoles}
              trend={{ value: '0', positive: true }}
            />
          </div>
        )}

        <div className="space-y-3">
          <div className="flex justify-end">
            <ViewModeBar
              moduleId="organizacao-processo-rotinas"
              registry={registry}
              activeViewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
          <FilterBar
            moduleId="organizacao-processo-rotinas"
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

        {routines.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Nenhuma rotina cadastrada"
            description="Crie rotinas para organizar as atividades deste processo."
            actionLabel="Nova Rotina"
            onAction={() => setIsCreateSheetOpen(true)}
          />
        ) : (
          <div className="flex gap-6">
            <div className="min-w-0 flex-1">
              {filteredData.length === 0 ? (
                <EmptyState
                  icon={ClipboardList}
                  title="Nenhum resultado"
                  description="Ajuste a busca para encontrar outra rotina."
                />
              ) : viewMode === 'cards' ? (
                renderCardView(filteredData)
              ) : (
                renderListView(filteredData)
              )}
            </div>

            <SplitView
              isOpen={!!selectedRoutine}
              onClose={() => {
                setSelectedRoutine(null);
                setSelectedActivity(null);
              }}
              title={selectedRoutine?.name ?? ''}
              subtitle={selectedRoutine?.description ?? processName}
              width="wide"
            >
              {selectedRoutine && (
                <RoutineCockpit360
                  routine={selectedRoutine}
                  processOptions={[{ id: processId, name: processName }]}
                  onDelete={() => setRoutineToDelete(selectedRoutine)}
                  onSelectActivity={setSelectedActivity}
                  onRoutineUpdated={(updatedRoutine) => {
                    const nextRoutine = {
                      ...(updatedRoutine as RoutineWithMeta),
                      process_name: processName,
                    };
                    setRoutines((prev) =>
                      prev.map((routine) =>
                        routine.id === nextRoutine.id ? nextRoutine : routine,
                      ),
                    );
                    setSelectedRoutine(nextRoutine);
                  }}
                />
              )}
            </SplitView>
          </div>
        )}
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
        entity="routine"
        mode="create"
        isOpen={isCreateSheetOpen}
        context={{ processId }}
        relationOptions={{
          processes: [{ id: processId, name: processName }],
        }}
        contextSummary={[{ label: 'Processo', value: processName }]}
        onClose={() => setIsCreateSheetOpen(false)}
        onSaved={(savedRoutine) => {
          const nextRoutine = {
            ...(savedRoutine as RoutineWithMeta),
            process_name: processName,
          };
          setRoutines((prev) => [...prev, nextRoutine]);
          setSelectedRoutine(nextRoutine);
          setIsCreateSheetOpen(false);
        }}
      />

      <Dialog open={!!routineToDelete} onOpenChange={(open) => !open && setRoutineToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir rotina</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a rotina &quot;{routineToDelete?.name}&quot;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoutineToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
