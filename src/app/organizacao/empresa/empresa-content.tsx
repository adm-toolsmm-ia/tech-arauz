'use client';

import * as React from 'react';
import {
  Building,
  Building2,
  Pencil,
  List,
  LayoutGrid,
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

export function EmpresaContent({
  tenant,
  counts,
  vinculos,
  linkedData,
  error,
}: EmpresaContentProps) {
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editName, setEditName] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'list' | 'kanban'>('kanban');
  const [selectedVinculo, setSelectedVinculo] = React.useState<EmpresaVinculo | null>(null);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    if (tenant) setEditName(tenant.name);
  }, [tenant]);

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
