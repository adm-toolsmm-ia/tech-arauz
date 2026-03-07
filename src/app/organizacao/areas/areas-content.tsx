'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FilterBar } from '@/components/filters/FilterBar';
import { ViewModeBar } from '@/components/filters/ViewModeBar';
import { SplitView } from '@/components/views/SplitView';
import { AreaCockpit360 } from '@/components/organization/AreaCockpit360';
import { EmptyState } from '@/components/ui/EmptyState';
import { AreasCardView } from './components/AreasCardView';
import { AreasKanbanView } from './components/AreasKanbanView';
import { useAreasFilters } from '@/hooks/useOrganizacaoFilters';
import {
  createAreaAction,
  updateAreaAction,
  deleteAreaAction,
  runBootstrapAction,
} from '@/app/actions/organization';
import { toast } from 'sonner';
import type { OrgArea } from '@/types/organization';
import { Building2 } from 'lucide-react';

interface AreasContentProps {
  areas: OrgArea[];
  linkedData?: {
    nucleiByAreaId: Record<string, import('@/types/organization').OrgNucleus[]>;
    processesByAreaId: Record<string, import('@/types/organization').OrgProcess[]>;
  };
}

interface AreaFormData {
  name: string;
  description: string;
  objective: string;
  responsible_roles: string[];
}

const DEFAULT_FORM: AreaFormData = {
  name: '',
  description: '',
  objective: '',
  responsible_roles: [],
};

export function AreasContent({
  areas: initialAreas,
  linkedData = { nucleiByAreaId: {}, processesByAreaId: {} },
}: AreasContentProps) {
  const [areas, setAreas] = React.useState<OrgArea[]>(initialAreas);
  const [selectedArea, setSelectedArea] = React.useState<OrgArea | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingArea, setEditingArea] = React.useState<OrgArea | null>(null);
  const [areaToDelete, setAreaToDelete] = React.useState<OrgArea | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isBootstrapRunning, setIsBootstrapRunning] = React.useState(false);
  const [formData, setFormData] = React.useState<AreaFormData>(DEFAULT_FORM);

  const {
    filters,
    search,
    viewMode,
    setViewMode,
    filteredData,
    setSearch,
    updateFilter,
    resetAllFilters,
    registry,
  } = useAreasFilters(areas);

  React.useEffect(() => {
    setAreas(initialAreas);
  }, [initialAreas]);

  const kpis = React.useMemo(
    () => ({
      total: areas.length,
      withNuclei: areas.filter((a) => (a.nuclei_count ?? 0) > 0).length,
    }),
    [areas],
  );

  const resetForm = React.useCallback(() => {
    setFormData(DEFAULT_FORM);
    setEditingArea(null);
  }, []);

  const handleCreate = React.useCallback(async () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    setIsLoading(true);
    try {
      const result = await createAreaAction({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        objective: formData.objective.trim() || null,
        responsible_roles: formData.responsible_roles,
        documentation: {},
      });
      if (result.success && result.data) {
        setAreas((prev) => [...prev, result.data as OrgArea]);
        toast.success(result.message);
        resetForm();
        setIsFormOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  }, [formData, resetForm]);

  const handleUpdate = React.useCallback(async () => {
    if (!editingArea) return;
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    setIsLoading(true);
    try {
      const result = await updateAreaAction(editingArea.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        objective: formData.objective.trim() || null,
        responsible_roles: formData.responsible_roles,
        documentation: editingArea.documentation,
      });
      if (result.success && result.data) {
        setAreas((prev) => prev.map((a) => (a.id === editingArea.id ? result.data! : a)));
        setSelectedArea(result.data);
        toast.success(result.message);
        resetForm();
        setIsFormOpen(false);
        setEditingArea(null);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  }, [editingArea, formData, resetForm]);

  const handleOpenEdit = React.useCallback((area: OrgArea) => {
    setEditingArea(area);
    setFormData({
      name: area.name,
      description: area.description ?? '',
      objective: area.objective ?? '',
      responsible_roles: area.responsible_roles ?? [],
    });
    setIsFormOpen(true);
  }, []);

  const handleDelete = React.useCallback((area: OrgArea) => {
    setAreaToDelete(area);
  }, []);

  const handleBootstrap = React.useCallback(async () => {
    if (areas.length > 0) {
      toast.error('O bootstrap só pode ser executado quando não há áreas cadastradas.');
      return;
    }
    setIsBootstrapRunning(true);
    try {
      const result = await runBootstrapAction('escritorio_juridico');
      if (result.success && result.data) {
        toast.success(result.message);
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    } finally {
      setIsBootstrapRunning(false);
    }
  }, [areas.length]);

  const handleConfirmDelete = React.useCallback(async () => {
    if (!areaToDelete) return;
    try {
      const result = await deleteAreaAction(areaToDelete.id);
      if (result.success) {
        setAreas((prev) => prev.filter((a) => a.id !== areaToDelete.id));
        setSelectedArea(null);
        setAreaToDelete(null);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    }
  }, [areaToDelete]);

  const listAnnouncement = `Lista com ${filteredData.length} área(s).`;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <DashboardHeader
          title="Áreas"
          subtitle="Estrutura organizacional — grandes domínios da empresa"
        />
        <div className="flex gap-2">
          {areas.length === 0 && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleBootstrap}
              disabled={isBootstrapRunning}
            >
              {isBootstrapRunning ? 'Gerando...' : 'Gerar Estrutura Inicial'}
            </Button>
          )}
          <Button
            className="gap-2"
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Nova Área
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-6 p-6">
        <p className="sr-only" role="status" aria-live="polite">
          {listAnnouncement}
        </p>

        {areas.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <KPICard
              icon={Building2}
              title="Total de Áreas"
              value={kpis.total}
              trend={{ value: '0', positive: false }}
            />
            <KPICard
              icon={Building2}
              title="Com Núcleos"
              value={kpis.withNuclei}
              trend={{ value: '0', positive: true }}
            />
          </div>
        )}

        <div className="space-y-3">
          <div className="flex justify-end">
            <ViewModeBar
              moduleId="organizacao-areas"
              registry={registry}
              activeViewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
          <FilterBar
            moduleId="organizacao-areas"
            filters={registry}
            onFiltersChange={(newFilters) => {
              Object.entries(newFilters).forEach(([key, value]) => {
                if (filters[key] !== value) updateFilter(key, value);
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
                icon={Building2}
                title={areas.length === 0 ? 'Nenhuma área cadastrada' : 'Nenhum resultado'}
                description={
                  areas.length === 0
                    ? 'Crie a primeira área para começar a estruturar a organização.'
                    : 'Ajuste os filtros ou busque por outro termo.'
                }
                actionLabel={areas.length === 0 ? 'Nova Área' : undefined}
                onAction={
                  areas.length === 0
                    ? () => {
                        resetForm();
                        setIsFormOpen(true);
                      }
                    : undefined
                }
              />
            ) : viewMode === 'cards' ? (
              <AreasCardView areas={filteredData} onAreaClick={setSelectedArea} />
            ) : viewMode === 'kanban' ? (
              <AreasKanbanView
                areas={filteredData}
                selectedAreaId={selectedArea?.id}
                onAreaClick={setSelectedArea}
              />
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {filteredData.map((area) => (
                      <div
                        key={area.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedArea(area)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedArea(area);
                          }
                        }}
                        className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                            <Building2 className="size-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{area.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {area.nuclei_count ?? 0} núcleo(s)
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <SplitView
            isOpen={!!selectedArea}
            onClose={() => setSelectedArea(null)}
            title={selectedArea?.name ?? ''}
            subtitle={selectedArea ? `${selectedArea.nuclei_count ?? 0} núcleo(s)` : undefined}
            width="wide"
          >
            {selectedArea && (
              <AreaCockpit360
                area={selectedArea}
                nuclei={linkedData.nucleiByAreaId[selectedArea.id] ?? []}
                processes={linkedData.processesByAreaId[selectedArea.id] ?? []}
                onEdit={() => handleOpenEdit(selectedArea)}
              />
            )}
          </SplitView>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingArea ? 'Editar Área' : 'Nova Área'}</DialogTitle>
            <DialogDescription>
              {editingArea
                ? 'Atualize os dados da área.'
                : 'Preencha os dados para criar uma nova área.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="area-name">Nome *</Label>
              <Input
                id="area-name"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="ex.: Recuperação de Crédito"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="area-description">Descrição</Label>
              <Textarea
                id="area-description"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Descrição da área"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="area-objective">Objetivo</Label>
              <Textarea
                id="area-objective"
                value={formData.objective}
                onChange={(e) => setFormData((p) => ({ ...p, objective: e.target.value }))}
                placeholder="Objetivo da área"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={editingArea ? handleUpdate : handleCreate} disabled={isLoading}>
              {editingArea ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!areaToDelete} onOpenChange={(open) => !open && setAreaToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir área</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a área &quot;{areaToDelete?.name}&quot;? Esta ação não
              pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAreaToDelete(null)}>
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
