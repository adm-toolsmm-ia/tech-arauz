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
import { OrgBreadcrumb } from '@/components/organization/OrgBreadcrumb';
import { EmpresaListView } from './components/EmpresaListView';
import { EmpresaKanbanView } from './components/EmpresaKanbanView';
import { EmpresaKPIBar } from './components/EmpresaKPIBar';
import { toast } from 'sonner';
import type { EmpresaVinculo } from './types';
import type {
  OrgNucleus,
  OrgProcess,
  OrgRoutine,
  OrgSystemResource,
  OrgSystem,
} from '@/types/organization';
import {
  createAreaAction,
  createNucleusAction,
  createSystemAction,
  createSupplierAction,
  createServiceAction,
  createOrgDocumentAction,
  updateSystemAction,
  updateSupplierAction,
  updateServiceAction,
  updateOrgDocumentAction,
  deleteSystemAction,
  deleteSupplierAction,
  deleteServiceAction,
  deleteOrgDocumentAction,
  createSystemResourceAction,
  updateSystemResourceAction,
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

interface AreaFormData {
  name: string;
  description: string;
  objective: string;
  responsible_roles: string;
}

interface NucleusFormData {
  area_id: string;
  name: string;
  description: string;
  objective: string;
  responsible_roles: string;
}

const DEFAULT_AREA_FORM: AreaFormData = {
  name: '',
  description: '',
  objective: '',
  responsible_roles: '',
};

const DEFAULT_NUCLEUS_FORM: NucleusFormData = {
  area_id: '',
  name: '',
  description: '',
  objective: '',
  responsible_roles: '',
};

type ResourceFormType = 'system' | 'supplier' | 'service' | 'document';

interface ResourceFormData {
  name: string;
  description: string;
  purpose: string;
  type: string;
  associated_process_id: string;
}

const DEFAULT_RESOURCE_FORM: ResourceFormData = {
  name: '',
  description: '',
  purpose: '',
  type: '',
  associated_process_id: '',
};

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
  const [areaFormData, setAreaFormData] = React.useState<AreaFormData>(DEFAULT_AREA_FORM);
  const [nucleusFormData, setNucleusFormData] =
    React.useState<NucleusFormData>(DEFAULT_NUCLEUS_FORM);
  const [isAreaLoading, setIsAreaLoading] = React.useState(false);
  const [isNucleusLoading, setIsNucleusLoading] = React.useState(false);
  const [isResourceFormOpen, setIsResourceFormOpen] = React.useState(false);
  const [resourceFormType, setResourceFormType] = React.useState<ResourceFormType | null>(null);
  const [resourceFormData, setResourceFormData] =
    React.useState<ResourceFormData>(DEFAULT_RESOURCE_FORM);
  const [editingVinculo, setEditingVinculo] = React.useState<EmpresaVinculo | null>(null);
  const [vinculoToDelete, setVinculoToDelete] = React.useState<EmpresaVinculo | null>(null);
  const [isResourceLoading, setIsResourceLoading] = React.useState(false);
  const [isSystemResourceFormOpen, setIsSystemResourceFormOpen] = React.useState(false);
  const [editingSystemResource, setEditingSystemResource] =
    React.useState<OrgSystemResource | null>(null);
  const [systemResourceToDelete, setSystemResourceToDelete] =
    React.useState<OrgSystemResource | null>(null);
  const [systemResourceFormData, setSystemResourceFormData] = React.useState({
    name: '',
    description: '',
  });
  const [isSystemResourceLoading, setIsSystemResourceLoading] = React.useState(false);

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

  const parseRoles = (s: string) =>
    s
      ? s
          .split(',')
          .map((r) => r.trim())
          .filter(Boolean)
      : [];

  const handleCreateArea = React.useCallback(async () => {
    if (!areaFormData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    setIsAreaLoading(true);
    try {
      const result = await createAreaAction({
        name: areaFormData.name.trim(),
        description: areaFormData.description.trim() || null,
        objective: areaFormData.objective.trim() || null,
        responsible_roles: parseRoles(areaFormData.responsible_roles),
        documentation: {},
      });
      if (result.success) {
        toast.success(result.message);
        setAreaFormData(DEFAULT_AREA_FORM);
        setIsAreaFormOpen(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (e) {
      toast.error(`Erro: ${e instanceof Error ? e.message : 'desconhecido'}`);
    } finally {
      setIsAreaLoading(false);
    }
  }, [areaFormData, router]);

  const handleCreateNucleus = React.useCallback(async () => {
    if (!nucleusFormData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (!nucleusFormData.area_id) {
      toast.error('Área é obrigatória');
      return;
    }
    setIsNucleusLoading(true);
    try {
      const result = await createNucleusAction({
        area_id: nucleusFormData.area_id,
        name: nucleusFormData.name.trim(),
        description: nucleusFormData.description.trim() || null,
        objective: nucleusFormData.objective.trim() || null,
        responsible_roles: parseRoles(nucleusFormData.responsible_roles),
        documentation: {},
      });
      if (result.success) {
        toast.success(result.message);
        setNucleusFormData(DEFAULT_NUCLEUS_FORM);
        setIsNucleusFormOpen(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (e) {
      toast.error(`Erro: ${e instanceof Error ? e.message : 'desconhecido'}`);
    } finally {
      setIsNucleusLoading(false);
    }
  }, [nucleusFormData, router]);

  const processOptions = React.useMemo(
    () =>
      linkedData ? Object.entries(linkedData.processMap).map(([id, name]) => ({ id, name })) : [],
    [linkedData],
  );

  const openResourceCreate = React.useCallback((type: ResourceFormType) => {
    setResourceFormType(type);
    setResourceFormData(DEFAULT_RESOURCE_FORM);
    setEditingVinculo(null);
    setIsResourceFormOpen(true);
  }, []);

  const handleResourceCreateOrUpdate = React.useCallback(async () => {
    if (!resourceFormData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    setIsResourceLoading(true);
    try {
      if (editingVinculo) {
        const entity = editingVinculo.entity;
        if (editingVinculo.type === 'sistemas') {
          const result = await updateSystemAction(entity.id, {
            name: resourceFormData.name.trim(),
            description: resourceFormData.description.trim() || null,
            purpose: resourceFormData.purpose.trim() || null,
          });
          if (result.success) {
            toast.success(result.message);
            router.refresh();
          } else toast.error(result.message);
        } else if (editingVinculo.type === 'fornecedores') {
          const result = await updateSupplierAction(entity.id, {
            name: resourceFormData.name.trim(),
            description: resourceFormData.description.trim() || null,
          });
          if (result.success) {
            toast.success(result.message);
            router.refresh();
          } else toast.error(result.message);
        } else if (editingVinculo.type === 'servicos') {
          const result = await updateServiceAction(entity.id, {
            name: resourceFormData.name.trim(),
            description: resourceFormData.description.trim() || null,
          });
          if (result.success) {
            toast.success(result.message);
            router.refresh();
          } else toast.error(result.message);
        } else if (editingVinculo.type === 'documentos') {
          const result = await updateOrgDocumentAction(entity.id, {
            name: resourceFormData.name.trim(),
            type: resourceFormData.type.trim() || null,
            description: resourceFormData.description.trim() || null,
            associated_process_id: resourceFormData.associated_process_id || null,
          });
          if (result.success) {
            toast.success(result.message);
            router.refresh();
          } else toast.error(result.message);
        }
      } else if (resourceFormType) {
        switch (resourceFormType) {
          case 'system': {
            const result = await createSystemAction({
              name: resourceFormData.name.trim(),
              description: resourceFormData.description.trim() || null,
              purpose: resourceFormData.purpose.trim() || null,
            });
            if (result.success) {
              toast.success(result.message);
              router.refresh();
            } else toast.error(result.message);
            break;
          }
          case 'supplier': {
            const result = await createSupplierAction({
              name: resourceFormData.name.trim(),
              description: resourceFormData.description.trim() || null,
              responsible_roles: [],
            });
            if (result.success) {
              toast.success(result.message);
              router.refresh();
            } else toast.error(result.message);
            break;
          }
          case 'service': {
            const result = await createServiceAction({
              name: resourceFormData.name.trim(),
              description: resourceFormData.description.trim() || null,
              responsible_roles: [],
            });
            if (result.success) {
              toast.success(result.message);
              router.refresh();
            } else toast.error(result.message);
            break;
          }
          case 'document': {
            const result = await createOrgDocumentAction({
              name: resourceFormData.name.trim(),
              type: resourceFormData.type.trim() || null,
              description: resourceFormData.description.trim() || null,
              associated_process_id: resourceFormData.associated_process_id || null,
              responsible_roles: [],
            });
            if (result.success) {
              toast.success(result.message);
              router.refresh();
            } else toast.error(result.message);
            break;
          }
        }
      }
      setResourceFormData(DEFAULT_RESOURCE_FORM);
      setResourceFormType(null);
      setEditingVinculo(null);
      setIsResourceFormOpen(false);
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    } finally {
      setIsResourceLoading(false);
    }
  }, [resourceFormData, resourceFormType, editingVinculo, router]);

  const openSystemResourceForm = React.useCallback(
    (system?: OrgSystem, resource?: OrgSystemResource) => {
      if (resource) {
        setEditingSystemResource(resource);
        setSystemResourceFormData({
          name: resource.name,
          description: resource.description ?? '',
        });
      } else {
        setEditingSystemResource(null);
        setSystemResourceFormData({ name: '', description: '' });
      }
      setIsSystemResourceFormOpen(true);
    },
    [],
  );

  const handleSystemResourceCreateOrUpdate = React.useCallback(async () => {
    const system = selectedVinculo?.type === 'sistemas' ? selectedVinculo.entity : null;
    if (!system) return;
    if (!systemResourceFormData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    setIsSystemResourceLoading(true);
    try {
      if (editingSystemResource) {
        const result = await updateSystemResourceAction(editingSystemResource.id, {
          name: systemResourceFormData.name.trim(),
          description: systemResourceFormData.description.trim() || null,
        });
        if (result.success) {
          toast.success(result.message);
          setEditingSystemResource(null);
          setSystemResourceFormData({ name: '', description: '' });
          setIsSystemResourceFormOpen(false);
          router.refresh();
        } else toast.error(result.message);
      } else {
        const result = await createSystemResourceAction({
          system_id: system.id,
          name: systemResourceFormData.name.trim(),
          description: systemResourceFormData.description.trim() || null,
        });
        if (result.success) {
          toast.success(result.message);
          setSystemResourceFormData({ name: '', description: '' });
          setIsSystemResourceFormOpen(false);
          router.refresh();
        } else toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    } finally {
      setIsSystemResourceLoading(false);
    }
  }, [selectedVinculo, editingSystemResource, systemResourceFormData, router]);

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
            onClick={() => {
              setAreaFormData(DEFAULT_AREA_FORM);
              setIsAreaFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Nova Área
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              setNucleusFormData(DEFAULT_NUCLEUS_FORM);
              setIsNucleusFormOpen(true);
            }}
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
                        const e = v.entity;
                        setResourceFormData({
                          name: e.name,
                          description: e.description ?? '',
                          purpose: 'purpose' in e ? (e.purpose ?? '') : '',
                          type: 'type' in e ? (e.type ?? '') : '',
                          associated_process_id:
                            'associated_process_id' in e ? (e.associated_process_id ?? '') : '',
                        });
                        setResourceFormType(null);
                        setIsResourceFormOpen(true);
                      }}
                      onDelete={(v) => setVinculoToDelete(v)}
                      onAddSystemResource={() => openSystemResourceForm()}
                      onEditSystemResource={(r) => openSystemResourceForm(undefined, r)}
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

      <Dialog open={isAreaFormOpen} onOpenChange={setIsAreaFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Área</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar uma nova área na organização.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="area-name">Nome *</Label>
              <Input
                id="area-name"
                value={areaFormData.name}
                onChange={(e) => setAreaFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="ex.: Recuperação de Crédito"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="area-description">Descrição</Label>
              <Textarea
                id="area-description"
                value={areaFormData.description}
                onChange={(e) => setAreaFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Descrição da área"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="area-objective">Objetivo</Label>
              <Textarea
                id="area-objective"
                value={areaFormData.objective}
                onChange={(e) => setAreaFormData((p) => ({ ...p, objective: e.target.value }))}
                placeholder="Objetivo da área"
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="area-roles">Roles responsáveis (separados por vírgula)</Label>
              <Input
                id="area-roles"
                value={areaFormData.responsible_roles}
                onChange={(e) =>
                  setAreaFormData((p) => ({ ...p, responsible_roles: e.target.value }))
                }
                placeholder="ex.: coordenador, analista_senior"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAreaFormOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateArea}
              disabled={isAreaLoading || !areaFormData.name.trim()}
            >
              {isAreaLoading ? 'Criando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNucleusFormOpen} onOpenChange={setIsNucleusFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Núcleo</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar um novo núcleo vinculado a uma área.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nucleus-area">Área *</Label>
              <Select
                value={nucleusFormData.area_id}
                onValueChange={(v) => setNucleusFormData((p) => ({ ...p, area_id: v }))}
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
                value={nucleusFormData.name}
                onChange={(e) => setNucleusFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="ex.: Núcleo de Ajuizamento"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nucleus-description">Descrição</Label>
              <Textarea
                id="nucleus-description"
                value={nucleusFormData.description}
                onChange={(e) => setNucleusFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Descrição do núcleo"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nucleus-objective">Objetivo</Label>
              <Textarea
                id="nucleus-objective"
                value={nucleusFormData.objective}
                onChange={(e) => setNucleusFormData((p) => ({ ...p, objective: e.target.value }))}
                placeholder="Objetivo do núcleo"
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nucleus-roles">Roles responsáveis (separados por vírgula)</Label>
              <Input
                id="nucleus-roles"
                value={nucleusFormData.responsible_roles}
                onChange={(e) =>
                  setNucleusFormData((p) => ({ ...p, responsible_roles: e.target.value }))
                }
                placeholder="ex.: coordenador, analista"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNucleusFormOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateNucleus}
              disabled={
                isNucleusLoading || !nucleusFormData.name.trim() || !nucleusFormData.area_id
              }
            >
              {isNucleusLoading ? 'Criando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isResourceFormOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsResourceFormOpen(false);
            setResourceFormType(null);
            setEditingVinculo(null);
            setResourceFormData(DEFAULT_RESOURCE_FORM);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingVinculo
                ? 'Editar'
                : resourceFormType === 'system'
                  ? 'Novo Sistema'
                  : resourceFormType === 'supplier'
                    ? 'Novo Fornecedor'
                    : resourceFormType === 'service'
                      ? 'Novo Serviço'
                      : 'Novo Documento'}
            </DialogTitle>
            <DialogDescription>
              {editingVinculo
                ? 'Atualize os dados do item.'
                : 'Preencha os dados para criar um novo item.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="resource-name">Nome *</Label>
              <Input
                id="resource-name"
                value={resourceFormData.name}
                onChange={(e) => setResourceFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="Nome"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="resource-description">Descrição</Label>
              <Textarea
                id="resource-description"
                value={resourceFormData.description}
                onChange={(e) =>
                  setResourceFormData((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Descrição"
                rows={3}
              />
            </div>
            {(resourceFormType === 'system' || editingVinculo?.type === 'sistemas') && (
              <div className="grid gap-2">
                <Label htmlFor="resource-purpose">Propósito</Label>
                <Input
                  id="resource-purpose"
                  value={resourceFormData.purpose}
                  onChange={(e) => setResourceFormData((p) => ({ ...p, purpose: e.target.value }))}
                  placeholder="Propósito do sistema"
                />
              </div>
            )}
            {(resourceFormType === 'document' || editingVinculo?.type === 'documentos') && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="resource-type">Tipo</Label>
                  <Input
                    id="resource-type"
                    value={resourceFormData.type}
                    onChange={(e) => setResourceFormData((p) => ({ ...p, type: e.target.value }))}
                    placeholder="Tipo do documento"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="resource-process">Processo associado</Label>
                  <Select
                    value={resourceFormData.associated_process_id}
                    onValueChange={(v) =>
                      setResourceFormData((p) => ({
                        ...p,
                        associated_process_id: v,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o processo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
                      {processOptions.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsResourceFormOpen(false);
                setResourceFormType(null);
                setEditingVinculo(null);
                setResourceFormData(DEFAULT_RESOURCE_FORM);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleResourceCreateOrUpdate}
              disabled={isResourceLoading || !resourceFormData.name.trim()}
            >
              {editingVinculo ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      <Dialog
        open={isSystemResourceFormOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsSystemResourceFormOpen(false);
            setEditingSystemResource(null);
            setSystemResourceFormData({ name: '', description: '' });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSystemResource ? 'Editar recurso' : 'Adicionar recurso'}
            </DialogTitle>
            <DialogDescription>
              {editingSystemResource
                ? 'Atualize os dados do recurso de sistema.'
                : 'Preencha os dados para adicionar um recurso ao sistema.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="empresa-system-resource-name">Nome *</Label>
              <Input
                id="empresa-system-resource-name"
                value={systemResourceFormData.name}
                onChange={(e) => setSystemResourceFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="Nome do recurso"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="empresa-system-resource-description">Descrição</Label>
              <Textarea
                id="empresa-system-resource-description"
                value={systemResourceFormData.description}
                onChange={(e) =>
                  setSystemResourceFormData((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Descrição"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsSystemResourceFormOpen(false);
                setEditingSystemResource(null);
                setSystemResourceFormData({ name: '', description: '' });
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSystemResourceCreateOrUpdate}
              disabled={isSystemResourceLoading || !systemResourceFormData.name.trim()}
            >
              {editingSystemResource ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
          onEdit={onEdit ? () => onEdit(vinculo) : undefined}
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
          onEdit={onEdit ? () => onEdit(vinculo) : undefined}
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
