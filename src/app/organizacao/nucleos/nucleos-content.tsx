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
import { EmptyState } from '@/components/ui/EmptyState';
import { NucleosCardView } from './components/NucleosCardView';
import { NucleosKanbanView } from './components/NucleosKanbanView';
import { useNucleosFilters, type NucleusWithMeta } from '@/hooks/useNucleosFilters';
import {
  createNucleusAction,
  updateNucleusAction,
  deleteNucleusAction,
  createProcessAction,
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
  responsible_roles: string;
}

const DEFAULT_FORM: NucleusFormData = {
  area_id: '',
  name: '',
  description: '',
  objective: '',
  responsible_roles: '',
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
  const [editingNucleus, setEditingNucleus] = React.useState<NucleusWithMeta | null>(null);
  const [nucleusToDelete, setNucleusToDelete] = React.useState<NucleusWithMeta | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<NucleusFormData>(DEFAULT_FORM);

  const [isProcessFormOpen, setIsProcessFormOpen] = React.useState(false);
  const [processFormData, setProcessFormData] = React.useState<ProcessFormData>(DEFAULT_PROCESS_FORM);
  const [isProcessLoading, setIsProcessLoading] = React.useState(false);

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
    setEditingNucleus(null);
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
      const parseRoles = (s: string) =>
        s
          ? s
              .split(',')
              .map((r) => r.trim())
              .filter(Boolean)
          : [];
      const result = await createNucleusAction({
        area_id: formData.area_id,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        objective: formData.objective.trim() || null,
        responsible_roles: parseRoles(formData.responsible_roles),
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

  const handleUpdate = React.useCallback(async () => {
    if (!editingNucleus) return;
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    setIsLoading(true);
    try {
      const parseRoles = (s: string) =>
        s
          ? s
              .split(',')
              .map((r) => r.trim())
              .filter(Boolean)
          : [];
      const result = await updateNucleusAction(editingNucleus.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        objective: formData.objective.trim() || null,
        responsible_roles: parseRoles(formData.responsible_roles),
        documentation: editingNucleus.documentation,
      });
      if (result.success && result.data) {
        const updated: NucleusWithMeta = {
          ...result.data,
          processes_count: editingNucleus.processes_count,
          area_name: editingNucleus.area_name,
        };
        setNuclei((prev) => prev.map((n) => (n.id === editingNucleus.id ? updated : n)));
        setSelectedNucleus(updated);
        toast.success(result.message);
        resetForm();
        setIsFormOpen(false);
        setEditingNucleus(null);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  }, [editingNucleus, formData, resetForm]);

  const handleOpenEdit = React.useCallback((nucleus: NucleusWithMeta) => {
    setEditingNucleus(nucleus);
    setFormData({
      area_id: nucleus.area_id,
      name: nucleus.name,
      description: nucleus.description ?? '',
      objective: nucleus.objective ?? '',
      responsible_roles: (nucleus.responsible_roles ?? []).join(', '),
    });
    setIsFormOpen(true);
  }, []);

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

  const handleOpenCreateProcess = React.useCallback((nucleus: NucleusWithMeta) => {
    setProcessFormData({
      area_id: nucleus.area_id,
      nucleus_id: nucleus.id,
      name: '',
      description: '',
      objective: '',
    });
    setIsProcessFormOpen(true);
  }, []);

  const handleCreateProcess = React.useCallback(async () => {
    if (!processFormData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    setIsProcessLoading(true);
    try {
      const result = await createProcessAction({
        name: processFormData.name.trim(),
        description: processFormData.description.trim() || null,
        objective: processFormData.objective.trim() || null,
        area_id: processFormData.area_id || null,
        nucleus_id: processFormData.nucleus_id || null,
        inputs: [],
        outputs: [],
        responsible_roles: [],
        risks: [],
        impacts: [],
        documentation: {},
      });
      if (result.success && result.data) {
        toast.success(result.message);
        setProcessFormData(DEFAULT_PROCESS_FORM);
        setIsProcessFormOpen(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    } finally {
      setIsProcessLoading(false);
    }
  }, [processFormData, router]);

  const nucleiForProcessArea = React.useMemo(
    () => nuclei.filter((n) => n.area_id === processFormData.area_id),
    [nuclei, processFormData.area_id],
  );

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
                        className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                            <GitBranch className="size-5 text-primary" />
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
                onEdit={() => handleOpenEdit(selectedNucleus)}
                onDelete={() => setNucleusToDelete(selectedNucleus)}
              />
            )}
          </SplitView>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingNucleus ? 'Editar Núcleo' : 'Novo Núcleo'}</DialogTitle>
            <DialogDescription>
              {editingNucleus
                ? 'Atualize os dados do núcleo.'
                : 'Preencha os dados para criar um novo núcleo.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nucleus-area">Área *</Label>
              <Select
                value={formData.area_id}
                onValueChange={(v) => setFormData((p) => ({ ...p, area_id: v }))}
                disabled={!!editingNucleus}
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
              {editingNucleus && (
                <p className="text-xs text-muted-foreground">
                  A área não pode ser alterada na edição.
                </p>
              )}
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
              <Label htmlFor="nucleus-roles">Roles responsáveis (separados por vírgula)</Label>
              <Input
                id="nucleus-roles"
                value={formData.responsible_roles}
                onChange={(e) => setFormData((p) => ({ ...p, responsible_roles: e.target.value }))}
                placeholder="ex.: coordenador, analista"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={editingNucleus ? handleUpdate : handleCreate} disabled={isLoading}>
              {editingNucleus ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Process Dialog (from Nucleus card) */}
      <Dialog open={isProcessFormOpen} onOpenChange={setIsProcessFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Processo</DialogTitle>
            <DialogDescription>
              Crie um processo vinculado ao núcleo selecionado. Área e núcleo já estão
              pré-preenchidos.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="process-area">Área</Label>
              <Select
                value={processFormData.area_id}
                onValueChange={(v) =>
                  setProcessFormData((p) => ({ ...p, area_id: v, nucleus_id: '' }))
                }
              >
                <SelectTrigger id="process-area">
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
              <Label htmlFor="process-nucleus">Núcleo</Label>
              <Select
                value={processFormData.nucleus_id}
                onValueChange={(v) => setProcessFormData((p) => ({ ...p, nucleus_id: v }))}
              >
                <SelectTrigger id="process-nucleus">
                  <SelectValue placeholder="Selecione o núcleo" />
                </SelectTrigger>
                <SelectContent>
                  {nucleiForProcessArea.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="process-name">Nome *</Label>
              <Input
                id="process-name"
                value={processFormData.name}
                onChange={(e) => setProcessFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="ex.: Ajuizamento de Ações"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="process-description">Descrição</Label>
              <Textarea
                id="process-description"
                value={processFormData.description}
                onChange={(e) =>
                  setProcessFormData((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Descrição do processo"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="process-objective">Objetivo</Label>
              <Textarea
                id="process-objective"
                value={processFormData.objective}
                onChange={(e) => setProcessFormData((p) => ({ ...p, objective: e.target.value }))}
                placeholder="Objetivo do processo"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProcessFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateProcess} disabled={isProcessLoading}>
              {isProcessLoading ? 'Criando...' : 'Criar'}
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
