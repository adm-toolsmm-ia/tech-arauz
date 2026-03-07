'use client';

import * as React from 'react';
import { Building, Building2, Pencil, List, LayoutGrid } from 'lucide-react';
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
import { SplitView } from '@/components/views/SplitView';
import { EmptyState } from '@/components/ui/EmptyState';
import { updateTenantAction } from '@/app/actions/tenant';
import type { TenantInfo, Tenant360Counts } from '@/app/actions/tenant';
import { AreaCockpit } from '@/components/organization/AreaCockpit';
import { ProcessCockpit } from '@/components/organization/ProcessCockpit';
import { SystemCockpit } from '@/components/organization/SystemCockpit';
import { SupplierCockpit } from '@/components/organization/SupplierCockpit';
import { ServiceCockpit } from '@/components/organization/ServiceCockpit';
import { DocumentCockpit } from '@/components/organization/DocumentCockpit';
import { EmpresaListView } from './components/EmpresaListView';
import { EmpresaKanbanView } from './components/EmpresaKanbanView';
import { toast } from 'sonner';
import type { EmpresaVinculo } from './types';

const EMPRESA_VIEW_REGISTRY = {
  moduleId: 'organizacao-empresa',
  filters: [],
  viewModes: [
    { id: 'list', label: 'Lista', icon: List, default: true },
    { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
  ],
};

interface EmpresaContentProps {
  tenant: TenantInfo | null;
  counts: Tenant360Counts;
  vinculos: EmpresaVinculo[];
  error?: string;
}

export function EmpresaContent({
  tenant,
  counts,
  vinculos,
  error,
}: EmpresaContentProps) {
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editName, setEditName] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'list' | 'kanban'>('list');
  const [selectedVinculo, setSelectedVinculo] = React.useState<EmpresaVinculo | null>(null);

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
  const listAnnouncement = `Lista com ${totalVinculos} vínculo(s) organizacionais.`;

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

      <div className="space-y-6 p-6">
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
              <div className="mb-4 flex justify-end">
                <ViewModeBar
                  moduleId="organizacao-empresa"
                  registry={EMPRESA_VIEW_REGISTRY}
                  activeViewMode={viewMode}
                  onViewModeChange={(mode) => setViewMode(mode as 'list' | 'kanban')}
                />
              </div>

              <p className="sr-only" role="status" aria-live="polite">
                {listAnnouncement}
              </p>

              <div className="flex gap-6">
                <div className="min-w-0 flex-1">
                  {viewMode === 'kanban' ? (
                    <EmpresaKanbanView
                      vinculos={vinculos}
                      selectedId={selectedVinculo?.id}
                      onItemClick={setSelectedVinculo}
                    />
                  ) : (
                    <EmpresaListView
                      vinculos={vinculos}
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
                  width="lg"
                >
                  {selectedVinculo && (
                    <EmpresaCockpitRenderer vinculo={selectedVinculo} />
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

function EmpresaCockpitRenderer({ vinculo }: { vinculo: EmpresaVinculo }) {
  switch (vinculo.type) {
    case 'areas':
      return <AreaCockpit area={vinculo.entity} />;
    case 'processos':
      return (
        <ProcessCockpit
          process={vinculo.entity}
          areaName={vinculo.areaName}
          nucleusName={vinculo.nucleusName}
        />
      );
    case 'sistemas':
      return <SystemCockpit system={vinculo.entity} />;
    case 'fornecedores':
      return <SupplierCockpit supplier={vinculo.entity} />;
    case 'servicos':
      return <ServiceCockpit service={vinculo.entity} />;
    case 'documentos':
      return <DocumentCockpit document={vinculo.entity} />;
    default:
      return null;
  }
}
