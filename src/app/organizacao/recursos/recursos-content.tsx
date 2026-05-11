'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { OrgBreadcrumb } from '@/components/organization/OrgBreadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { EmptyState } from '@/components/ui/EmptyState';
import { RecursosKPIBar } from './components/RecursosKPIBar';
import { RecursosFilters } from './components/RecursosFilters';
import { SystemCockpit360 } from '@/components/organization/SystemCockpit360';
import { SupplierCockpit360 } from '@/components/organization/SupplierCockpit360';
import { ServiceCockpit360 } from '@/components/organization/ServiceCockpit360';
import { DocumentCockpit360 } from '@/components/organization/DocumentCockpit360';
import { ResourceEntityFormSheet } from '@/components/organization/ResourceEntityFormSheet';
import { SystemResourceFormSheet } from '@/components/organization/SystemResourceFormSheet';
import {
  deleteSystemAction,
  deleteSupplierAction,
  deleteServiceAction,
  deleteOrgDocumentAction,
  deleteSystemResourceAction,
} from '@/app/actions/organization';
import { toast } from 'sonner';
import type {
  OrgSystem,
  OrgSupplier,
  OrgService,
  OrgDocument,
  OrgSystemResource,
} from '@/types/organization';
import { useRecursosFilters } from '@/hooks/useRecursosFilters';
import { Monitor, Truck, Wrench, FileText } from 'lucide-react';

const VALID_TABS = ['sistemas', 'fornecedores', 'servicos', 'documentos'] as const;
type RecursosTab = (typeof VALID_TABS)[number];

type RecursosEntity = OrgSystem | OrgSupplier | OrgService | OrgDocument;

interface RecursosContentProps {
  systems: OrgSystem[];
  suppliers: OrgSupplier[];
  services: OrgService[];
  documents: OrgDocument[];
  resourcesBySystemId: Record<string, OrgSystemResource[]>;
  processes: { id: string; name: string }[];
  processMap: Record<string, string>;
}

type ResourceSheetEntity = 'system' | 'supplier' | 'service' | 'document';

export function RecursosContent({
  systems: initialSystems,
  suppliers: initialSuppliers,
  services: initialServices,
  documents: initialDocuments,
  resourcesBySystemId,
  processes,
  processMap,
}: RecursosContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const defaultTab: RecursosTab =
    tabParam && VALID_TABS.includes(tabParam as RecursosTab)
      ? (tabParam as RecursosTab)
      : 'sistemas';

  const [activeTab, setActiveTab] = React.useState<RecursosTab>(defaultTab);
  const [systems, setSystems] = React.useState<OrgSystem[]>(initialSystems);
  const [suppliers, setSuppliers] = React.useState<OrgSupplier[]>(initialSuppliers);
  const [services, setServices] = React.useState<OrgService[]>(initialServices);
  const [documents, setDocuments] = React.useState<OrgDocument[]>(initialDocuments);
  const [systemResourcesMap, setSystemResourcesMap] =
    React.useState<Record<string, OrgSystemResource[]>>(resourcesBySystemId);
  const [selectedItem, setSelectedItem] = React.useState<RecursosEntity | null>(null);
  const [selectedTab, setSelectedTab] = React.useState<RecursosTab | null>(null);
  const [isResourceFormOpen, setIsResourceFormOpen] = React.useState(false);
  const [resourceFormEntity, setResourceFormEntity] = React.useState<ResourceSheetEntity>('system');
  const [editingItem, setEditingItem] = React.useState<RecursosEntity | null>(null);
  const [itemToDelete, setItemToDelete] = React.useState<RecursosEntity | null>(null);
  const [isSystemResourceFormOpen, setIsSystemResourceFormOpen] = React.useState(false);
  const [selectedSystemForResource, setSelectedSystemForResource] = React.useState<OrgSystem | null>(
    null,
  );
  const [editingSystemResource, setEditingSystemResource] =
    React.useState<OrgSystemResource | null>(null);
  const [systemResourceToDelete, setSystemResourceToDelete] =
    React.useState<OrgSystemResource | null>(null);

  React.useEffect(() => {
    setSystems(initialSystems);
    setSuppliers(initialSuppliers);
    setServices(initialServices);
    setDocuments(initialDocuments);
    setSystemResourcesMap(resourcesBySystemId);
  }, [initialSystems, initialSuppliers, initialServices, initialDocuments, resourcesBySystemId]);

  React.useEffect(() => {
    if (tabParam && VALID_TABS.includes(tabParam as RecursosTab)) {
      setActiveTab(tabParam as RecursosTab);
    }
  }, [tabParam]);

  const handleTabChange = React.useCallback(
    (tab: RecursosTab) => {
      setActiveTab(tab);
      setSelectedItem(null);
      setSelectedTab(null);
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', tab);
      router.replace(`/organizacao/recursos?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const currentItems = React.useMemo(() => {
    switch (activeTab) {
      case 'sistemas':
        return systems;
      case 'fornecedores':
        return suppliers;
      case 'servicos':
        return services;
      case 'documentos':
        return documents;
      default:
        return systems;
    }
  }, [activeTab, systems, suppliers, services, documents]);

  const filterState = useRecursosFilters(currentItems as RecursosEntity[]);

  const openCreate = React.useCallback(() => {
    setEditingItem(null);
    setResourceFormEntity(
      activeTab === 'sistemas'
        ? 'system'
        : activeTab === 'fornecedores'
          ? 'supplier'
          : activeTab === 'servicos'
            ? 'service'
            : 'document',
    );
    setIsResourceFormOpen(true);
  }, [activeTab]);

  const handleOpenEdit = React.useCallback((item: RecursosEntity) => {
    setEditingItem(item);
    setResourceFormEntity(
      'purpose' in item
        ? 'system'
        : 'associated_process_id' in item
          ? 'document'
          : 'responsible_roles' in item && activeTab === 'fornecedores'
            ? 'supplier'
            : 'service',
    );
    setIsResourceFormOpen(true);
  }, [activeTab]);

  const handleResourceSaved = React.useCallback(
    (saved: RecursosEntity) => {
      if ('purpose' in saved) {
        setSystems((prev) => {
          const exists = prev.some((item) => item.id === saved.id);
          return exists
            ? prev.map((item) => (item.id === saved.id ? (saved as OrgSystem) : item))
            : [...prev, saved as OrgSystem];
        });
      } else if ('associated_process_id' in saved) {
        setDocuments((prev) => {
          const exists = prev.some((item) => item.id === saved.id);
          return exists
            ? prev.map((item) => (item.id === saved.id ? (saved as OrgDocument) : item))
            : [...prev, saved as OrgDocument];
        });
      } else if (activeTab === 'fornecedores' || resourceFormEntity === 'supplier') {
        setSuppliers((prev) => {
          const exists = prev.some((item) => item.id === saved.id);
          return exists
            ? prev.map((item) => (item.id === saved.id ? (saved as OrgSupplier) : item))
            : [...prev, saved as OrgSupplier];
        });
      } else {
        setServices((prev) => {
          const exists = prev.some((item) => item.id === saved.id);
          return exists
            ? prev.map((item) => (item.id === saved.id ? (saved as OrgService) : item))
            : [...prev, saved as OrgService];
        });
      }

      if (selectedItem?.id === saved.id) {
        setSelectedItem(saved);
      }
    },
    [activeTab, resourceFormEntity, selectedItem],
  );

  const handleConfirmDelete = React.useCallback(async () => {
    if (!itemToDelete) return;
    try {
      if ('purpose' in itemToDelete) {
        const result = await deleteSystemAction(itemToDelete.id);
        if (result.success) {
          setSystems((prev) => prev.filter((s) => s.id !== itemToDelete.id));
          setSelectedItem(null);
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } else if ('description' in itemToDelete && !('type' in itemToDelete)) {
        const result = await deleteSupplierAction(itemToDelete.id);
        if (result.success) {
          setSuppliers((prev) => prev.filter((s) => s.id !== itemToDelete.id));
          setSelectedItem(null);
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } else if ('description' in itemToDelete && !('associated_process_id' in itemToDelete)) {
        const service = itemToDelete as any;
        const result = await deleteServiceAction(service.id);
        if (result.success) {
          setServices((prev) => prev.filter((s) => s.id !== service.id));
          setSelectedItem(null);
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } else {
        const result = await deleteOrgDocumentAction(itemToDelete.id);
        if (result.success) {
          setDocuments((prev) => prev.filter((d) => d.id !== itemToDelete.id));
          setSelectedItem(null);
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      }
      setItemToDelete(null);
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    }
  }, [itemToDelete]);

  const handleSystemResourceSaved = React.useCallback(
    (saved: OrgSystemResource) => {
      setSystemResourcesMap((prev) => {
        const current = prev[saved.system_id] ?? [];
        const exists = current.some((item) => item.id === saved.id);
        return {
          ...prev,
          [saved.system_id]: exists
            ? current.map((item) => (item.id === saved.id ? saved : item))
            : [...current, saved],
        };
      });
    },
    [],
  );

  const handleConfirmDeleteSystemResource = React.useCallback(async () => {
    if (!systemResourceToDelete) return;
    try {
      const result = await deleteSystemResourceAction(systemResourceToDelete.id);
      if (result.success) {
        toast.success(result.message);
        setSystemResourcesMap((prev) => ({
          ...prev,
          [systemResourceToDelete.system_id]: (prev[systemResourceToDelete.system_id] ?? []).filter(
            (item) => item.id !== systemResourceToDelete.id,
          ),
        }));
        setSystemResourceToDelete(null);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    }
  }, [systemResourceToDelete]);

  const listAnnouncement = `${filterState.filteredData.length} ${activeTab === 'sistemas' ? 'sistemas' : activeTab === 'fornecedores' ? 'fornecedores' : activeTab === 'servicos' ? 'serviços' : 'documentos'} exibidos`;

  const hasAny =
    systems.length > 0 || suppliers.length > 0 || services.length > 0 || documents.length > 0;

  const selectItem = React.useCallback(
    (item: RecursosEntity) => {
      setSelectedItem(item);
      setSelectedTab(activeTab);
    },
    [activeTab],
  );

  const renderList = (items: RecursosEntity[], icon: React.ElementType, iconBg: string) => (
    <Card>
      <CardContent className="divide-y p-0">
        {items.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Nenhum resultado encontrado.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => selectItem(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  selectItem(item);
                }
              }}
              className="hover:bg-muted/50 flex cursor-pointer items-center gap-3 p-4 transition-colors"
            >
              <div className={`flex size-10 items-center justify-center rounded-lg ${iconBg}`}>
                {React.createElement(icon, { className: 'size-5 text-primary' })}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="line-clamp-1 text-sm text-muted-foreground">
                  {item.description ?? '-'}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );

  const renderCards = (items: RecursosEntity[], icon: React.ElementType, iconBg: string) => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.length === 0 ? (
        <div className="col-span-full rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Nenhum resultado encontrado.
        </div>
      ) : (
        items.map((item) => (
          <Card
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => selectItem(item)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectItem(item);
              }
            }}
            className="hover:bg-muted/50 cursor-pointer transition-colors"
          >
            <CardContent className="flex flex-col gap-3 p-4">
              <div className={`flex size-12 items-center justify-center rounded-xl ${iconBg}`}>
                {React.createElement(icon, { className: 'size-6 text-primary' })}
              </div>
              <div className="min-w-0">
                <p className="font-medium">{item.name}</p>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {item.description ?? '-'}
                </p>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderView = (items: RecursosEntity[], icon: React.ElementType, iconBg: string) =>
    filterState.viewMode === 'cards'
      ? renderCards(items, icon, iconBg)
      : renderList(items, icon, iconBg);

  const renderCockpit = () => {
    if (!selectedItem || !selectedTab) return null;
    switch (selectedTab) {
      case 'sistemas': {
        const system = selectedItem as OrgSystem;
        const resources = systemResourcesMap[system.id] ?? [];
        return (
          <SystemCockpit360
            system={system}
            resources={resources}
            onEdit={() => handleOpenEdit(system)}
            onDelete={() => setItemToDelete(system)}
            onAddResource={() => {
              setSelectedSystemForResource(system);
              setEditingSystemResource(null);
              setIsSystemResourceFormOpen(true);
            }}
            onEditResource={(r) => {
              setSelectedSystemForResource(system);
              setEditingSystemResource(r);
              setIsSystemResourceFormOpen(true);
            }}
            onDeleteResource={(r) => setSystemResourceToDelete(r)}
          />
        );
      }
      case 'fornecedores':
        return (
          <SupplierCockpit360
            supplier={selectedItem as OrgSupplier}
            onEdit={() => handleOpenEdit(selectedItem)}
            onDelete={() => setItemToDelete(selectedItem)}
          />
        );
      case 'servicos':
        return (
          <ServiceCockpit360
            service={selectedItem as OrgService}
            onEdit={() => handleOpenEdit(selectedItem)}
            onDelete={() => setItemToDelete(selectedItem)}
          />
        );
      case 'documentos': {
        const doc = selectedItem as OrgDocument;
        const processName = doc.associated_process_id
          ? processMap[doc.associated_process_id]
          : undefined;
        return (
          <DocumentCockpit360
            document={doc}
            processName={processName}
            onEdit={() => handleOpenEdit(doc)}
            onDelete={() => setItemToDelete(doc)}
          />
        );
      }
      default:
        return null;
    }
  };

  const getNewButtonLabel = () => {
    switch (activeTab) {
      case 'sistemas':
        return 'Novo Sistema';
      case 'fornecedores':
        return 'Novo Fornecedor';
      case 'servicos':
        return 'Novo Serviço';
      case 'documentos':
        return 'Novo Documento';
      default:
        return 'Novo';
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <DashboardHeader
            title="Recursos"
            subtitle="Sistemas, fornecedores, serviços e documentos organizacionais"
          />
          <OrgBreadcrumb items={[{ label: 'Recursos' }]} />
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {getNewButtonLabel()}
        </Button>
      </div>

      <div className="flex-1 space-y-6 p-6">
        <p className="sr-only" role="status" aria-live="polite">
          {listAnnouncement}
        </p>

        <RecursosKPIBar
          systemsCount={systems.length}
          suppliersCount={suppliers.length}
          servicesCount={services.length}
          documentsCount={documents.length}
          activeTab={activeTab}
          onTabClick={handleTabChange}
        />

        {!hasAny ? (
          <EmptyState
            icon={Monitor}
            title="Nenhum recurso cadastrado"
            description="Cadastre sistemas, fornecedores, serviços e documentos utilizados na operação."
            actionLabel="Novo Recurso"
            onAction={openCreate}
          />
        ) : (
          <>
            <RecursosFilters
              registry={filterState.registry}
              filters={filterState.filters}
              search={filterState.search}
              viewMode={filterState.viewMode}
              onUpdateFilter={filterState.updateFilter}
              onResetFilters={filterState.resetAllFilters}
              onSearchChange={filterState.setSearch}
              onViewModeChange={filterState.setViewMode}
            />

            <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as RecursosTab)}>
              <TabsList>
                <TabsTrigger value="sistemas">Sistemas ({systems.length})</TabsTrigger>
                <TabsTrigger value="fornecedores">Fornecedores ({suppliers.length})</TabsTrigger>
                <TabsTrigger value="servicos">Serviços ({services.length})</TabsTrigger>
                <TabsTrigger value="documentos">Documentos ({documents.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="sistemas" className="mt-4">
                <div className="flex gap-6">
                  <div className="min-w-0 flex-1">
                    {renderView(
                      filterState.filteredData as OrgSystem[],
                      Monitor,
                      'bg-amber-500/10',
                    )}
                  </div>
                  <SplitView
                    isOpen={!!selectedItem && selectedTab === 'sistemas'}
                    onClose={() => {
                      if (selectedTab === 'sistemas') {
                        setSelectedItem(null);
                        setSelectedTab(null);
                      }
                    }}
                    title={
                      (selectedItem && selectedTab === 'sistemas' ? selectedItem.name : '') ?? ''
                    }
                    subtitle={
                      selectedItem && selectedTab === 'sistemas'
                        ? ((selectedItem as OrgSystem).description ?? undefined)
                        : undefined
                    }
                    width="lg"
                  >
                    {renderCockpit()}
                  </SplitView>
                </div>
              </TabsContent>

              <TabsContent value="fornecedores" className="mt-4">
                <div className="flex gap-6">
                  <div className="min-w-0 flex-1">
                    {renderView(
                      filterState.filteredData as OrgSupplier[],
                      Truck,
                      'bg-emerald-500/10',
                    )}
                  </div>
                  <SplitView
                    isOpen={!!selectedItem && selectedTab === 'fornecedores'}
                    onClose={() => {
                      if (selectedTab === 'fornecedores') {
                        setSelectedItem(null);
                        setSelectedTab(null);
                      }
                    }}
                    title={
                      (selectedItem && selectedTab === 'fornecedores' ? selectedItem.name : '') ??
                      ''
                    }
                    subtitle={
                      selectedItem && selectedTab === 'fornecedores'
                        ? ((selectedItem as OrgSupplier).description ?? undefined)
                        : undefined
                    }
                    width="lg"
                  >
                    {renderCockpit()}
                  </SplitView>
                </div>
              </TabsContent>

              <TabsContent value="servicos" className="mt-4">
                <div className="flex gap-6">
                  <div className="min-w-0 flex-1">
                    {renderView(
                      filterState.filteredData as OrgService[],
                      Wrench,
                      'bg-purple-500/10',
                    )}
                  </div>
                  <SplitView
                    isOpen={!!selectedItem && selectedTab === 'servicos'}
                    onClose={() => {
                      if (selectedTab === 'servicos') {
                        setSelectedItem(null);
                        setSelectedTab(null);
                      }
                    }}
                    title={
                      (selectedItem && selectedTab === 'servicos' ? selectedItem.name : '') ?? ''
                    }
                    subtitle={
                      selectedItem && selectedTab === 'servicos'
                        ? ((selectedItem as OrgService).description ?? undefined)
                        : undefined
                    }
                    width="lg"
                  >
                    {renderCockpit()}
                  </SplitView>
                </div>
              </TabsContent>

              <TabsContent value="documentos" className="mt-4">
                <div className="flex gap-6">
                  <div className="min-w-0 flex-1">
                    {renderView(
                      filterState.filteredData as OrgDocument[],
                      FileText,
                      'bg-cyan-500/10',
                    )}
                  </div>
                  <SplitView
                    isOpen={!!selectedItem && selectedTab === 'documentos'}
                    onClose={() => {
                      if (selectedTab === 'documentos') {
                        setSelectedItem(null);
                        setSelectedTab(null);
                      }
                    }}
                    title={
                      (selectedItem && selectedTab === 'documentos' ? selectedItem.name : '') ?? ''
                    }
                    subtitle={
                      selectedItem && selectedTab === 'documentos'
                        ? ((selectedItem as OrgDocument).type ?? undefined)
                        : undefined
                    }
                    width="lg"
                  >
                    {renderCockpit()}
                  </SplitView>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      <ResourceEntityFormSheet
        entity={resourceFormEntity}
        mode={editingItem ? 'edit' : 'create'}
        initialData={editingItem ?? undefined}
        processOptions={processes}
        isOpen={isResourceFormOpen}
        onClose={() => {
          setIsResourceFormOpen(false);
          setEditingItem(null);
        }}
        onSaved={handleResourceSaved}
      />

      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir item</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir &quot;{itemToDelete?.name}&quot;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
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
        onSaved={handleSystemResourceSaved}
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
    </div>
  );
}
