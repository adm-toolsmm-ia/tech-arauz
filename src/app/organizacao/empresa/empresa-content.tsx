'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Building,
  Building2,
  Pencil,
  List,
  LayoutGrid,
  Plus,
  GitBranch,
  Monitor,
  Truck,
  Wrench,
  FileText,
} from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ViewModeBar } from '@/components/filters/ViewModeBar';
import { FilterBar } from '@/components/filters/FilterBar';
import { SplitView } from '@/components/views/SplitView';
import { EmptyState } from '@/components/ui/EmptyState';
import { updateTenantAction } from '@/app/actions/tenant';
import type { TenantInfo, Tenant360Counts } from '@/app/actions/tenant';
import { AreaCockpit360 } from '@/components/organization/AreaCockpit360';
import { ProcessCockpit360 } from '@/components/organization/ProcessCockpit360';
import { SystemCockpit360 } from '@/components/organization/SystemCockpit360';
import { SupplierCockpit360 } from '@/components/organization/SupplierCockpit360';
import { ServiceCockpit360 } from '@/components/organization/ServiceCockpit360';
import { DocumentCockpit360 } from '@/components/organization/DocumentCockpit360';
import { OrgEntityFormSheet } from '@/components/organization/OrgEntityFormSheet';
import { ResourceEntityFormSheet } from '@/components/organization/ResourceEntityFormSheet';
import { SystemResourceFormSheet } from '@/components/organization/SystemResourceFormSheet';
import { OrgBreadcrumb } from '@/components/organization/OrgBreadcrumb';
import { EmpresaListView } from './components/EmpresaListView';
import { EmpresaKanbanView } from './components/EmpresaKanbanView';
import { EmpresaKPIBar } from './components/EmpresaKPIBar';
import { toast } from 'sonner';
import type { EmpresaVinculo } from './types';
import type {
  OrgArea,
  OrgDocument,
  OrgNucleus,
  OrgProcess,
  OrgRoutine,
  OrgService,
  OrgSupplier,
  OrgSystemResource,
  OrgSystem,
} from '@/types/organization';
import {
  deleteSystemAction,
  deleteSupplierAction,
  deleteServiceAction,
  deleteOrgDocumentAction,
  deleteSystemResourceAction,
  addProcessSystemAction,
  removeProcessSystemAction,
} from '@/app/actions/organization';

const EMPRESA_VIEW_REGISTRY = {
  moduleId: 'organizacao-empresa',
  filters: [],
  searchable: true,
  viewModes: [
    { id: 'kanban', label: 'Kanban', icon: LayoutGrid, default: true },
    { id: 'list', label: 'Lista', icon: List },
  ],
};

export interface EmpresaLinkedData {
  nucleiByAreaId: Record<string, OrgNucleus[]>;
  processesByAreaId: Record<string, OrgProcess[]>;
  routinesByProcessId: Record<string, OrgRoutine[]>;
  resourcesBySystemId: Record<string, OrgSystemResource[]>;
  systemsByProcessId: Record<string, OrgSystem[]>;
  processMap: Record<string, string>;
  systems: OrgSystem[];
}

interface EmpresaContentProps {
  tenant: TenantInfo | null;
  counts: Tenant360Counts;
  vinculos: EmpresaVinculo[];
  linkedData?: EmpresaLinkedData;
  error?: string;
}
type ResourceFormType = 'system' | 'supplier' | 'service' | 'document';

export function EmpresaContent({
  tenant,
  counts,
  vinculos,
  linkedData,
  error,
}: EmpresaContentProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editName, setEditName] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'list' | 'kanban'>('kanban');
  const [selectedVinculo, setSelectedVinculo] = React.useState<EmpresaVinculo | null>(null);
  const [search, setSearch] = React.useState('');
  const [isAreaFormOpen, setIsAreaFormOpen] = React.useState(false);
  const [isNucleusFormOpen, setIsNucleusFormOpen] = React.useState(false);
  const [isResourceFormOpen, setIsResourceFormOpen] = React.useState(false);
  const [resourceFormType, setResourceFormType] = React.useState<ResourceFormType>('system');
  const [editingVinculo, setEditingVinculo] = React.useState<EmpresaVinculo | null>(null);
  const [vinculoToDelete, setVinculoToDelete] = React.useState<EmpresaVinculo | null>(null);
  const [isSystemResourceFormOpen, setIsSystemResourceFormOpen] = React.useState(false);
  const [selectedSystemForResource, setSelectedSystemForResource] = React.useState<OrgSystem | null>(
    null,
  );
  const [editingSystemResource, setEditingSystemResource] =
    React.useState<OrgSystemResource | null>(null);
  const [systemResourceToDelete, setSystemResourceToDelete] =
    React.useState<OrgSystemResource | null>(null);

  const areas = React.useMemo(
    () =>
      vinculos
        .filter((v): v is EmpresaVinculo & { type: 'areas' } => v.type === 'areas')
        .map((v) => ({ id: v.id, name: v.name })),
    [vinculos],
  );

  React.useEffect(() => {
    if (tenant) setEditName(tenant.name);
  }, [tenant]);

  const processOptions = React.useMemo(
    () =>
      linkedData ? Object.entries(linkedData.processMap).map(([id, name]) => ({ id, name })) : [],
    [linkedData],
  );

  const openResourceCreate = React.useCallback((type: ResourceFormType) => {
    setResourceFormType(type);
    setEditingVinculo(null);
    setIsResourceFormOpen(true);
  }, []);

  const openSystemResourceForm = React.useCallback(
    (system?: OrgSystem, resource?: OrgSystemResource) => {
      setSelectedSystemForResource(system ?? null);
      setEditingSystemResource(resource ?? null);
      setIsSystemResourceFormOpen(true);
    },
    [],
  );

  const [processSystemToUnlink, setProcessSystemToUnlink] = React.useState<{
    processId: string;
    systemId: string;
    systemName: string;
  } | null>(null);

  const handleLinkProcessSystem = React.useCallback(
    async (processId: string, systemId: string) => {
      try {
        const result = await addProcessSystemAction(processId, systemId);
        if (result.success) {
          toast.success(result.message);
          router.refresh();
        } else toast.error(result.message);
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
        } else toast.error(result.message);
      } catch (error) {
        toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
      }
    },
    [router],
  );

  const handleConfirmDeleteSystemResource = React.useCallback(async () => {
    if (!systemResourceToDelete) return;
    try {
      const result = await deleteSystemResourceAction(systemResourceToDelete.id);
      if (result.success) {
        toast.success(result.message);
        setSystemResourceToDelete(null);
        router.refresh();
      } else toast.error(result.message);
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    }
  }, [systemResourceToDelete, router]);

  const handleConfirmDeleteVinculo = React.useCallback(async () => {
    if (!vinculoToDelete) return;
    const entity = vinculoToDelete.entity;
    try {
      if (vinculoToDelete.type === 'sistemas') {
        const result = await deleteSystemAction(entity.id);
        if (result.success) {
          toast.success(result.message);
          router.refresh();
        } else toast.error(result.message);
      } else if (vinculoToDelete.type === 'fornecedores') {
        const result = await deleteSupplierAction(entity.id);
        if (result.success) {
          toast.success(result.message);
          router.refresh();
        } else toast.error(result.message);
      } else if (vinculoToDelete.type === 'servicos') {
        const result = await deleteServiceAction(entity.id);
        if (result.success) {
          toast.success(result.message);
          router.refresh();
        } else toast.error(result.message);
      } else if (vinculoToDelete.type === 'documentos') {
        const result = await deleteOrgDocumentAction(entity.id);
        if (result.success) {
          toast.success(result.message);
          router.refresh();
        } else toast.error(result.message);
      }
      setVinculoToDelete(null);
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    }
  }, [vinculoToDelete, router]);

  const handleSave = React.useCallback(async () => {
    if (!tenant) return;
    setIsLoading(true);
    try {
      const result = await updateTenantAction(tenant.id, { name: editName.trim() });
      if (result.success) {
        toast.success(result.message);
        setIsEditOpen(false);
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch (e) {
      toast.error(`Erro: ${e instanceof Error ? e.message : 'desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  }, [tenant, editName]);

  const filteredVinculos = React.useMemo(() => {
    if (!search.trim()) return vinculos;
    const q = search.toLowerCase();
    return vinculos.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        (v.type === 'processos' &&
          (v.areaName?.toLowerCase().includes(q) || v.nucleusName?.toLowerCase().includes(q))),
    );
  }, [vinculos, search]);

  if (error) {
    return (
      <div className="flex flex-col p-6">
        <DashboardHeader title="Empresa" subtitle="Cadastro e visão 360º da organização" />
        <Card className="mt-6">
          <CardContent className="py-8 text-center text-destructive">{error}</CardContent>
        </Card>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex flex-col p-6">
        <DashboardHeader title="Empresa" subtitle="Cadastro e visão 360º da organização" />
        <Card className="mt-6">
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhuma empresa encontrada.
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalVinculos = vinculos.length;
  const listAnnouncement = `Visão 360º com ${filteredVinculos.length} vínculo(s) organizacionais.`;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <DashboardHeader
            title="Empresa"
            subtitle="Cadastro e visão 360º dos vínculos organizacionais"
          />
          <OrgBreadcrumb items={[{ label: 'Empresa' }]} />
        </div>
        <div className="flex items-center gap-2 pr-6">
          <Button
            className="gap-2"
            size="sm"
            onClick={() => setIsAreaFormOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Nova Área
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setIsNucleusFormOpen(true)}
            disabled={areas.length === 0}
            title={areas.length === 0 ? 'Cadastre ao menos uma área antes' : undefined}
          >
            <GitBranch className="h-4 w-4" />
            Novo Núcleo
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => openResourceCreate('system')}
          >
            <Monitor className="h-4 w-4" />
            Novo Sistema
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => openResourceCreate('supplier')}
          >
            <Truck className="h-4 w-4" />
            Novo Fornecedor
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => openResourceCreate('service')}
          >
            <Wrench className="h-4 w-4" />
            Novo Serviço
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => openResourceCreate('document')}
          >
            <FileText className="h-4 w-4" />
            Novo Documento
          </Button>
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => setIsEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-6 p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex size-14 items-center justify-center rounded-xl">
                <Building className="text-primary size-7" />
              </div>
              <div>
                <CardTitle className="text-xl">{tenant.name}</CardTitle>
                <CardDescription>Identificador: {tenant.slug}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <EmpresaKPIBar counts={counts} />

        <div className="space-y-3">
          <div className="flex justify-between gap-2">
            <div className="min-w-0 flex-1">
              <FilterBar
                moduleId="organizacao-empresa"
                filters={EMPRESA_VIEW_REGISTRY}
                onFiltersChange={() => {}}
                onSearchChange={setSearch}
                onViewModeChange={(m) => setViewMode(m as 'list' | 'kanban')}
                initialFilters={{}}
                initialSearch={search}
                initialViewMode={viewMode}
                currentFilters={{}}
                currentSearch={search}
                currentViewMode={viewMode}
                onUpdateFilter={() => {}}
                onResetFilters={() => setSearch('')}
              />
            </div>
            <div className="shrink-0">
              <ViewModeBar
                moduleId="organizacao-empresa"
                registry={EMPRESA_VIEW_REGISTRY}
                activeViewMode={viewMode}
                onViewModeChange={(mode) => setViewMode(mode as 'list' | 'kanban')}
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Visão 360º — Vínculos</h2>

          {totalVinculos === 0 ? (
            <EmptyState
              icon={Building2}
              title="Nenhum vínculo cadastrado"
              description="Cadastre áreas, processos, sistemas, fornecedores, serviços e documentos para visualizar a visão 360º."
              actionLabel="Ver Áreas"
              onAction={() => (window.location.href = '/organizacao/areas')}
            />
          ) : (
            <>
              <p className="sr-only" role="status" aria-live="polite">
                {listAnnouncement}
              </p>

              <div className="flex gap-6">
                <div className="min-w-0 flex-1">
                  {viewMode === 'kanban' ? (
                    <EmpresaKanbanView
                      vinculos={filteredVinculos}
                      selectedId={selectedVinculo?.id}
                      onItemClick={setSelectedVinculo}
                    />
                  ) : (
                    <EmpresaListView
                      vinculos={filteredVinculos}
                      selectedId={selectedVinculo?.id}
                      onItemClick={setSelectedVinculo}
                    />
                  )}
                </div>

                <SplitView
                  isOpen={!!selectedVinculo}
                  onClose={() => setSelectedVinculo(null)}
                  title={selectedVinculo?.name ?? ''}
                  subtitle={
                    selectedVinculo
                      ? `${selectedVinculo.type === 'areas' ? 'Área' : selectedVinculo.type === 'processos' ? 'Processo' : selectedVinculo.type === 'sistemas' ? 'Sistema' : selectedVinculo.type === 'fornecedores' ? 'Fornecedor' : selectedVinculo.type === 'servicos' ? 'Serviço' : 'Documento'}`
                      : undefined
                  }
                  width="wide"
                >
                  {selectedVinculo && (
                    <EmpresaCockpitRenderer
                      vinculo={selectedVinculo}
                      linkedData={
                        linkedData ?? {
                          nucleiByAreaId: {},
                          processesByAreaId: {},
                          routinesByProcessId: {},
                          resourcesBySystemId: {},
                          systemsByProcessId: {},
                          processMap: {},
                          systems: [],
                        }
                      }
                      onEdit={(v) => {
                        setEditingVinculo(v);
                        setResourceFormType(
                          v.type === 'sistemas'
                            ? 'system'
                            : v.type === 'fornecedores'
                              ? 'supplier'
                              : v.type === 'servicos'
                                ? 'service'
                                : 'document',
                        );
                        setIsResourceFormOpen(true);
                      }}
                      onDelete={(v) => setVinculoToDelete(v)}
                      onAddSystemResource={() =>
                        selectedVinculo?.type === 'sistemas'
                          ? openSystemResourceForm(selectedVinculo.entity)
                          : undefined
                      }
                      onEditSystemResource={(r) =>
                        selectedVinculo?.type === 'sistemas'
                          ? openSystemResourceForm(selectedVinculo.entity, r)
                          : undefined
                      }
                      onDeleteSystemResource={(r) => setSystemResourceToDelete(r)}
                      systems={linkedData?.systems ?? []}
                      systemsByProcessId={linkedData?.systemsByProcessId ?? {}}
                      onLinkProcessSystem={handleLinkProcessSystem}
                      onUnlinkProcessSystem={(processId, systemId, systemName) =>
                        setProcessSystemToUnlink({ processId, systemId, systemName })
                      }
                    />
                  )}
                </SplitView>
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Empresa</DialogTitle>
            <DialogDescription>
              Atualize o nome da empresa. Apenas administradores podem editar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tenant-name">Nome</Label>
              <Input
                id="tenant-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nome da empresa"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isLoading || !editName.trim()}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <OrgEntityFormSheet
        entity="area"
        mode="create"
        isOpen={isAreaFormOpen}
        onClose={() => setIsAreaFormOpen(false)}
        onSaved={() => router.refresh()}
      />

      <OrgEntityFormSheet
        entity="nucleus"
        mode="create"
        isOpen={isNucleusFormOpen}
        relationOptions={{ areas }}
        onClose={() => setIsNucleusFormOpen(false)}
        onSaved={() => router.refresh()}
      />

      <ResourceEntityFormSheet
        entity={resourceFormType}
        mode={editingVinculo ? 'edit' : 'create'}
        initialData={editingVinculo?.entity as OrgSystem | OrgSupplier | OrgService | OrgDocument | undefined}
        processOptions={processOptions}
        isOpen={isResourceFormOpen}
        onClose={() => {
          setIsResourceFormOpen(false);
          setEditingVinculo(null);
        }}
        onSaved={() => router.refresh()}
      />

      <Dialog open={!!vinculoToDelete} onOpenChange={(open) => !open && setVinculoToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir item</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir &quot;{vinculoToDelete?.name}&quot;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVinculoToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDeleteVinculo}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SystemResourceFormSheet
        mode={editingSystemResource ? 'edit' : 'create'}
        systemId={selectedSystemForResource?.id}
        systemName={selectedSystemForResource?.name}
        initialData={editingSystemResource ?? undefined}
        isOpen={isSystemResourceFormOpen}
        onClose={() => {
          setIsSystemResourceFormOpen(false);
          setEditingSystemResource(null);
          setSelectedSystemForResource(null);
        }}
        onSaved={() => router.refresh()}
      />

      <Dialog
        open={!!systemResourceToDelete}
        onOpenChange={(open) => !open && setSystemResourceToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir recurso</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir &quot;{systemResourceToDelete?.name}&quot;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSystemResourceToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDeleteSystemResource}>
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

function EmpresaCockpitRenderer({
  vinculo,
  linkedData,
  onEdit,
  onDelete,
  onAddSystemResource,
  onEditSystemResource,
  onDeleteSystemResource,
  systems,
  systemsByProcessId,
  onLinkProcessSystem,
  onUnlinkProcessSystem,
}: {
  vinculo: EmpresaVinculo;
  linkedData: EmpresaLinkedData;
  onEdit?: (v: EmpresaVinculo) => void;
  onDelete?: (v: EmpresaVinculo) => void;
  onAddSystemResource?: () => void;
  onEditSystemResource?: (r: OrgSystemResource) => void;
  onDeleteSystemResource?: (r: OrgSystemResource) => void;
  systems?: OrgSystem[];
  systemsByProcessId?: Record<string, OrgSystem[]>;
  onLinkProcessSystem?: (processId: string, systemId: string) => void;
  onUnlinkProcessSystem?: (processId: string, systemId: string, systemName: string) => void;
}) {
  switch (vinculo.type) {
    case 'areas':
      return (
        <AreaCockpit360
          area={vinculo.entity}
          nuclei={linkedData.nucleiByAreaId[vinculo.entity.id] ?? []}
          processes={linkedData.processesByAreaId[vinculo.entity.id] ?? []}
        />
      );
    case 'processos':
      return (
        <ProcessCockpit360
          process={vinculo.entity}
          areaName={vinculo.areaName}
          nucleusName={vinculo.nucleusName}
          routines={linkedData.routinesByProcessId[vinculo.entity.id] ?? []}
          systems={systemsByProcessId?.[vinculo.entity.id] ?? []}
          allSystems={systems ?? []}
          onLinkSystem={
            onLinkProcessSystem
              ? (systemId) => onLinkProcessSystem(vinculo.entity.id, systemId)
              : undefined
          }
          onUnlinkSystem={
            onUnlinkProcessSystem
              ? (systemId, systemName) =>
                  onUnlinkProcessSystem(vinculo.entity.id, systemId, systemName)
              : undefined
          }
        />
      );
    case 'sistemas':
      return (
        <SystemCockpit360
          system={vinculo.entity}
          resources={linkedData.resourcesBySystemId[vinculo.entity.id] ?? []}
          onEdit={onEdit ? () => onEdit(vinculo) : undefined}
          onDelete={onDelete ? () => onDelete(vinculo) : undefined}
          onAddResource={onAddSystemResource}
          onEditResource={onEditSystemResource}
          onDeleteResource={onDeleteSystemResource}
        />
      );
    case 'fornecedores':
      return (
        <SupplierCockpit360
          supplier={vinculo.entity}
          onEdit={onEdit ? () => onEdit(vinculo) : undefined}
          onDelete={onDelete ? () => onDelete(vinculo) : undefined}
        />
      );
    case 'servicos':
      return (
        <ServiceCockpit360
          service={vinculo.entity}
          onEdit={onEdit ? () => onEdit(vinculo) : undefined}
          onDelete={onDelete ? () => onDelete(vinculo) : undefined}
        />
      );
    case 'documentos':
      return (
        <DocumentCockpit360
          document={vinculo.entity}
          processName={
            vinculo.entity.associated_process_id
              ? linkedData.processMap[vinculo.entity.associated_process_id]
              : undefined
          }
          onEdit={onEdit ? () => onEdit(vinculo) : undefined}
          onDelete={onDelete ? () => onDelete(vinculo) : undefined}
        />
      );
    default:
      return null;
  }
}
