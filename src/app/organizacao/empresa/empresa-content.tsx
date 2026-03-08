'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building,
  Building2,
  Pencil,
  List,
  LayoutGrid,
  Plus,
  GitBranch,
  ArrowRight,
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
import { EmpresaListView } from './components/EmpresaListView';
import { EmpresaKanbanView } from './components/EmpresaKanbanView';
import { EmpresaKPIBar } from './components/EmpresaKPIBar';
import { toast } from 'sonner';
import type { EmpresaVinculo } from './types';
import type { OrgNucleus, OrgProcess, OrgRoutine, OrgSystemResource } from '@/types/organization';
import {
  createAreaAction,
  createNucleusAction,
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
  processMap: Record<string, string>;
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
  const [nucleusFormData, setNucleusFormData] = React.useState<NucleusFormData>(DEFAULT_NUCLEUS_FORM);
  const [isAreaLoading, setIsAreaLoading] = React.useState(false);
  const [isNucleusLoading, setIsNucleusLoading] = React.useState(false);

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
    s ? s.split(',').map((r) => r.trim()).filter(Boolean) : [];

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
        (v.type === 'processos' && (v.areaName?.toLowerCase().includes(q) || v.nucleusName?.toLowerCase().includes(q))),
    );
  }, [vinculos, search]);

  if (error) {
    return (
      <div className="flex flex-col p-6">
        <DashboardHeader
          title="Empresa"
          subtitle="Cadastro e visão 360º da organização"
        />
        <Card className="mt-6">
          <CardContent className="py-8 text-center text-destructive">
            {error}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex flex-col p-6">
        <DashboardHeader
          title="Empresa"
          subtitle="Cadastro e visão 360º da organização"
        />
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
        <DashboardHeader
          title="Empresa"
          subtitle="Cadastro e visão 360º dos vínculos organizacionais"
        />
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsEditOpen(true)}>
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
      </div>

      <div className="flex-1 space-y-6 p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10">
                <Building className="size-7 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{tenant.name}</CardTitle>
                <CardDescription>Identificador: {tenant.slug}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cadastros vinculados</CardTitle>
            <CardDescription>
              Cadastre áreas e núcleos diretamente pela empresa.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              className="gap-2"
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
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link href="/organizacao/areas">
                Ver Áreas
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link href="/organizacao/nucleos">
                Ver Núcleos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {totalVinculos > 0 && (
          <>
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
          </>
        )}

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
                          processMap: {},
                        }
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
                onChange={(e) => setAreaFormData((p) => ({ ...p, responsible_roles: e.target.value }))}
                placeholder="ex.: coordenador, analista_senior"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAreaFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateArea} disabled={isAreaLoading || !areaFormData.name.trim()}>
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
                onChange={(e) => setNucleusFormData((p) => ({ ...p, responsible_roles: e.target.value }))}
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
                isNucleusLoading ||
                !nucleusFormData.name.trim() ||
                !nucleusFormData.area_id
              }
            >
              {isNucleusLoading ? 'Criando...' : 'Criar'}
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
}: {
  vinculo: EmpresaVinculo;
  linkedData: EmpresaLinkedData;
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
        />
      );
    case 'sistemas':
      return (
        <SystemCockpit360
          system={vinculo.entity}
          resources={linkedData.resourcesBySystemId[vinculo.entity.id] ?? []}
        />
      );
    case 'fornecedores':
      return <SupplierCockpit360 supplier={vinculo.entity} />;
    case 'servicos':
      return <ServiceCockpit360 service={vinculo.entity} />;
    case 'documentos':
      return (
        <DocumentCockpit360
          document={vinculo.entity}
          processName={
            vinculo.entity.associated_process_id
              ? linkedData.processMap[vinculo.entity.associated_process_id]
              : undefined
          }
        />
      );
    default:
      return null;
  }
}
