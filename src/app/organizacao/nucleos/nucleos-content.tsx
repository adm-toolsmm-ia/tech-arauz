'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, GitBranch } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilterBar } from '@/components/filters/FilterBar';
import { ViewModeBar } from '@/components/filters/ViewModeBar';
import { SplitView } from '@/components/views/SplitView';
import { NucleusCockpit360 } from '@/components/organization/NucleusCockpit360';
import { ResponsibleRolesInput } from '@/components/organization/ResponsibleRolesInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { NucleosCardView } from './components/NucleosCardView';
import { NucleosKanbanView } from './components/NucleosKanbanView';
import { useNucleosFilters, type NucleusWithMeta } from '@/hooks/useNucleosFilters';
import {
  createNucleusAction,
  deleteNucleusAction,
} from '@/app/actions/organization';
import { toast } from 'sonner';

interface NucleosContentProps {
  nuclei: NucleusWithMeta[];
  areas: { id: string; name: string }[];
}

interface NucleusFormData {
  area_id: string;
  name: string;
  description: string;
  objective: string;
  responsible_roles: string[];
}

const DEFAULT_FORM: NucleusFormData = {
  area_id: '',
  name: '',
  description: '',
  objective: '',
  responsible_roles: [],
};

interface ProcessFormData {
  area_id: string;
  nucleus_id: string;
  name: string;
  description: string;
  objective: string;
}

const DEFAULT_PROCESS_FORM: ProcessFormData = {
  area_id: '',
  nucleus_id: '',
  name: '',
  description: '',
  objective: '',
};

export function NucleosContent({ nuclei: initialNuclei, areas }: NucleosContentProps) {
  const router = useRouter();
  const [nuclei, setNuclei] = React.useState<NucleusWithMeta[]>(initialNuclei);
  const [selectedNucleus, setSelectedNucleus] = React.useState<NucleusWithMeta | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [nucleusToDelete, setNucleusToDelete] = React.useState<NucleusWithMeta | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<NucleusFormData>(DEFAULT_FORM);

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
  } = useNucleosFilters(nuclei, areas);

  React.useEffect(() => {
    setNuclei(initialNuclei);
  }, [initialNuclei]);

  const kpis = React.useMemo(
    () => ({
      total: nuclei.length,
      withProcesses: nuclei.filter((n) => (n.processes_count ?? 0) > 0).length,
    }),
    [nuclei],
  );

  const resetForm = React.useCallback(() => {
    setFormData(DEFAULT_FORM);
  }, []);

  const handleCreate = React.useCallback(async () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (!formData.area_id) {
      toast.error('Área é obrigatória');
      return;
    }
    setIsLoading(true);
    try {
      const result = await createNucleusAction({
        area_id: formData.area_id,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        objective: formData.objective.trim() || null,
        responsible_roles: formData.responsible_roles,
        documentation: {},
      });
      if (result.success && result.data) {
        const newNucleus: NucleusWithMeta = {
          ...result.data,
          processes_count: 0,
          area_name: areas.find((a) => a.id === formData.area_id)?.name ?? '',
        };
        setNuclei((prev) => [...prev, newNucleus]);
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
  }, [formData, areas, resetForm]);

  const handleConfirmDelete = React.useCallback(async () => {
    if (!nucleusToDelete) return;
    try {
      const result = await deleteNucleusAction(nucleusToDelete.id);
      if (result.success) {
        setNuclei((prev) => prev.filter((n) => n.id !== nucleusToDelete.id));
        setSelectedNucleus(null);
        setNucleusToDelete(null);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    }
  }, [nucleusToDelete]);

  const listAnnouncement = `Lista com ${filteredData.length} núcleo(s).`;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <DashboardHeader
          title="Núcleos"
          subtitle="Especializações dentro das áreas — visão e gestão 360º"
        />
        <Button
          className="gap-2"
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Novo Núcleo
        </Button>
      </div>

      <div className="flex-1 space-y-6 p-6">
        <p className="sr-only" role="status" aria-live="polite">
          {listAnnouncement}
        </p>

        {nuclei.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <KPICard
              icon={GitBranch}
              title="Total de Núcleos"
              value={kpis.total}
              trend={{ value: '0', positive: false }}
            />
            <KPICard
              icon={GitBranch}
              title="Com Processos"
              value={kpis.withProcesses}
              trend={{ value: '0', positive: true }}
            />
          </div>
        )}

        <div className="space-y-3">
          <div className="flex justify-end">
            <ViewModeBar
              moduleId="organizacao-nucleos"
              registry={registry}
              activeViewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
          <FilterBar
            moduleId="organizacao-nucleos"
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
                icon={GitBranch}
                title={nuclei.length === 0 ? 'Nenhum núcleo cadastrado' : 'Nenhum resultado'}
                description={
                  nuclei.length === 0
                    ? 'Crie o primeiro núcleo para especializar uma área.'
                    : 'Ajuste os filtros ou busque por outro termo.'
                }
                actionLabel={nuclei.length === 0 ? 'Novo Núcleo' : undefined}
                onAction={
                  nuclei.length === 0
                    ? () => {
                        resetForm();
                        setIsFormOpen(true);
                      }
                    : undefined
                }
              />
            ) : viewMode === 'cards' ? (
              <NucleosCardView nuclei={filteredData} onNucleusClick={setSelectedNucleus} />
            ) : viewMode === 'kanban' ? (
              <NucleosKanbanView
                nuclei={filteredData}
                selectedNucleusId={selectedNucleus?.id}
                onNucleusClick={setSelectedNucleus}
              />
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {filteredData.map((nucleus) => (
                      <div
                        key={nucleus.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedNucleus(nucleus)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedNucleus(nucleus);
                          }
                        }}
                        className="hover:bg-muted/50 flex cursor-pointer items-center justify-between p-4 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
                            <GitBranch className="text-primary size-5" />
                          </div>
                          <div>
                            <p className="font-medium">{nucleus.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {nucleus.area_name ?? 'Sem área'} · {nucleus.processes_count ?? 0}{' '}
                              processo(s)
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
            isOpen={!!selectedNucleus}
            onClose={() => setSelectedNucleus(null)}
            title={selectedNucleus?.name ?? ''}
            subtitle={
              selectedNucleus
                ? `${selectedNucleus.area_name ?? 'Sem área'} · ${selectedNucleus.processes_count ?? 0} processo(s)`
                : undefined
            }
            width="wide"
          >
            {selectedNucleus && (
              <NucleusCockpit360
                nucleus={selectedNucleus}
                areaId={selectedNucleus.area_id}
                areaOptions={areas.map((area) => ({ id: area.id, name: area.name }))}
                onDelete={() => setNucleusToDelete(selectedNucleus)}
                onNucleusUpdated={(updatedNucleus) => {
                  const updated: NucleusWithMeta = {
                    ...(updatedNucleus as NucleusWithMeta),
                    processes_count: selectedNucleus.processes_count,
                    area_name:
                      areas.find((area) => area.id === updatedNucleus.area_id)?.name ??
                      selectedNucleus.area_name,
                  };
                  setNuclei((prev) =>
                    prev.map((nucleus) => (nucleus.id === updated.id ? updated : nucleus)),
                  );
                  setSelectedNucleus(updated);
                }}
              />
            )}
          </SplitView>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Núcleo</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar um novo núcleo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nucleus-area">Área *</Label>
              <Select
                value={formData.area_id}
                onValueChange={(v) => setFormData((p) => ({ ...p, area_id: v }))}
              >
                <SelectTrigger id="nucleus-area">
                  <SelectValue placeholder="Selecione a área" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nucleus-name">Nome *</Label>
              <Input
                id="nucleus-name"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="ex.: Núcleo de Ajuizamento"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nucleus-description">Descrição</Label>
              <Textarea
                id="nucleus-description"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Descrição do núcleo"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nucleus-objective">Objetivo</Label>
              <Textarea
                id="nucleus-objective"
                value={formData.objective}
                onChange={(e) => setFormData((p) => ({ ...p, objective: e.target.value }))}
                placeholder="Objetivo do núcleo"
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label>Roles responsáveis</Label>
              <ResponsibleRolesInput
                value={formData.responsible_roles}
                onChange={(roles) => setFormData((p) => ({ ...p, responsible_roles: roles }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={isLoading}>
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!nucleusToDelete} onOpenChange={(open) => !open && setNucleusToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir núcleo</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o núcleo &quot;{nucleusToDelete?.name}&quot;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNucleusToDelete(null)}>
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
