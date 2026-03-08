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
import { SplitView } from '@/components/views/SplitView';
import { EmptyState } from '@/components/ui/EmptyState';
import { RecursosKPIBar } from './components/RecursosKPIBar';
import { RecursosFilters } from './components/RecursosFilters';
import { SystemCockpit360 } from '@/components/organization/SystemCockpit360';
import { SupplierCockpit360 } from '@/components/organization/SupplierCockpit360';
import { ServiceCockpit360 } from '@/components/organization/ServiceCockpit360';
import { DocumentCockpit360 } from '@/components/organization/DocumentCockpit360';
import {
  createSystemAction,
  updateSystemAction,
  deleteSystemAction,
  createSupplierAction,
  updateSupplierAction,
  deleteSupplierAction,
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
  createOrgDocumentAction,
  updateOrgDocumentAction,
  deleteOrgDocumentAction,
  createSystemResourceAction,
  updateSystemResourceAction,
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

interface FormData {
  name: string;
  description: string;
  purpose: string;
  type: string;
  associated_process_id: string;
}

const DEFAULT_FORM: FormData = {
  name: '',
  description: '',
  purpose: '',
  type: '',
  associated_process_id: '',
};

interface SystemResourceFormData {
  name: string;
  description: string;
}

const DEFAULT_SYSTEM_RESOURCE_FORM: SystemResourceFormData = {
  name: '',
  description: '',
};

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
  const [selectedItem, setSelectedItem] = React.useState<RecursosEntity | null>(null);
  const [selectedTab, setSelectedTab] = React.useState<RecursosTab | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<RecursosEntity | null>(null);
  const [itemToDelete, setItemToDelete] = React.useState<RecursosEntity | null>(null);
  const [formData, setFormData] = React.useState<FormData>(DEFAULT_FORM);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSystemResourceFormOpen, setIsSystemResourceFormOpen] = React.useState(false);
  const [editingSystemResource, setEditingSystemResource] =
    React.useState<OrgSystemResource | null>(null);
  const [systemResourceToDelete, setSystemResourceToDelete] =
    React.useState<OrgSystemResource | null>(null);
  const [systemResourceFormData, setSystemResourceFormData] =
    React.useState<SystemResourceFormData>(DEFAULT_SYSTEM_RESOURCE_FORM);
  const [isSystemResourceLoading, setIsSystemResourceLoading] = React.useState(false);

  React.useEffect(() => {
    setSystems(initialSystems);
    setSuppliers(initialSuppliers);
    setServices(initialServices);
    setDocuments(initialDocuments);
  }, [initialSystems, initialSuppliers, initialServices, initialDocuments]);

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

  const filterState = useRecursosFilters(currentItems);

  const resetForm = React.useCallback(() => {
    setFormData(DEFAULT_FORM);
    setEditingItem(null);
  }, []);

  const openCreate = React.useCallback(() => {
    resetForm();
    setIsFormOpen(true);
  }, [resetForm]);

  const handleCreateOrUpdate = React.useCallback(async () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    setIsLoading(true);
    try {
      if (editingItem) {
        if ('purpose' in editingItem) {
          const result = await updateSystemAction(editingItem.id, {
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            purpose: formData.purpose.trim() || null,
          });
          if (result.success && result.data) {
            setSystems((prev) =>
              prev.map((s) => (s.id === editingItem.id ? result.data! : s)),
            );
            setSelectedItem(result.data);
            toast.success(result.message);
          } else {
            toast.error(result.message);
          }
        } else if ('description' in editingItem && !('type' in editingItem)) {
          const sup = editingItem as OrgSupplier;
          const result = await updateSupplierAction(sup.id, {
            name: formData.name.trim(),
            description: formData.description.trim() || null,
          });
          if (result.success && result.data) {
            setSuppliers((prev) =>
              prev.map((s) => (s.id === sup.id ? result.data! : s)),
            );
            setSelectedItem(result.data);
            toast.success(result.message);
          } else {
            toast.error(result.message);
          }
        } else if ('description' in editingItem && !('associated_process_id' in editingItem)) {
          const svc = editingItem as OrgService;
          const result = await updateServiceAction(svc.id, {
            name: formData.name.trim(),
            description: formData.description.trim() || null,
          });
          if (result.success && result.data) {
            setServices((prev) =>
              prev.map((s) => (s.id === svc.id ? result.data! : s)),
            );
            setSelectedItem(result.data);
            toast.success(result.message);
          } else {
            toast.error(result.message);
          }
        } else {
          const doc = editingItem as OrgDocument;
          const result = await updateOrgDocumentAction(doc.id, {
            name: formData.name.trim(),
            type: formData.type.trim() || null,
            description: formData.description.trim() || null,
            associated_process_id: formData.associated_process_id || null,
          });
          if (result.success && result.data) {
            setDocuments((prev) =>
              prev.map((d) => (d.id === doc.id ? result.data! : d)),
            );
            setSelectedItem(result.data);
            toast.success(result.message);
          } else {
            toast.error(result.message);
          }
        }
      } else {
        switch (activeTab) {
          case 'sistemas': {
            const result = await createSystemAction({
              name: formData.name.trim(),
              description: formData.description.trim() || null,
              purpose: formData.purpose.trim() || null,
            });
            if (result.success && result.data) {
              setSystems((prev) => [...prev, result.data!]);
              toast.success(result.message);
            } else {
              toast.error(result.message);
            }
            break;
          }
          case 'fornecedores': {
            const result = await createSupplierAction({
              name: formData.name.trim(),
              description: formData.description.trim() || null,
            });
            if (result.success && result.data) {
              setSuppliers((prev) => [...prev, result.data!]);
              toast.success(result.message);
            } else {
              toast.error(result.message);
            }
            break;
          }
          case 'servicos': {
            const result = await createServiceAction({
              name: formData.name.trim(),
              description: formData.description.trim() || null,
            });
            if (result.success && result.data) {
              setServices((prev) => [...prev, result.data!]);
              toast.success(result.message);
            } else {
              toast.error(result.message);
            }
            break;
          }
          case 'documentos': {
            const result = await createOrgDocumentAction({
              name: formData.name.trim(),
              type: formData.type.trim() || null,
              description: formData.description.trim() || null,
              associated_process_id: formData.associated_process_id || null,
            });
            if (result.success && result.data) {
              setDocuments((prev) => [...prev, result.data!]);
              toast.success(result.message);
            } else {
              toast.error(result.message);
            }
            break;
          }
        }
      }
      resetForm();
      setIsFormOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  }, [editingItem, formData, activeTab, resetForm, router]);

  const handleOpenEdit = React.useCallback((item: RecursosEntity) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description ?? '',
      purpose: 'purpose' in item ? (item.purpose ?? '') : '',
      type: 'type' in item ? (item.type ?? '') : '',
      associated_process_id: 'associated_process_id' in item ? (item.associated_process_id ?? '') : '',
    });
    setIsFormOpen(true);
  }, []);

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
      router.refresh();
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    }
  }, [itemToDelete, router]);

  const handleSystemResourceCreateOrUpdate = React.useCallback(async () => {
    const system = selectedItem && selectedTab === 'sistemas' ? (selectedItem as OrgSystem) : null;
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
          setSystemResourceFormData(DEFAULT_SYSTEM_RESOURCE_FORM);
          setEditingSystemResource(null);
          setIsSystemResourceFormOpen(false);
          router.refresh();
        } else {
          toast.error(result.message);
        }
      } else {
        const result = await createSystemResourceAction({
          system_id: system.id,
          name: systemResourceFormData.name.trim(),
          description: systemResourceFormData.description.trim() || null,
        });
        if (result.success) {
          toast.success(result.message);
          setSystemResourceFormData(DEFAULT_SYSTEM_RESOURCE_FORM);
          setIsSystemResourceFormOpen(false);
          router.refresh();
        } else {
          toast.error(result.message);
        }
      }
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    } finally {
      setIsSystemResourceLoading(false);
    }
  }, [
    selectedItem,
    selectedTab,
    editingSystemResource,
    systemResourceFormData,
    router,
  ]);

  const handleConfirmDeleteSystemResource = React.useCallback(async () => {
    if (!systemResourceToDelete) return;
    try {
      const result = await deleteSystemResourceAction(systemResourceToDelete.id);
      if (result.success) {
        toast.success(result.message);
        setSystemResourceToDelete(null);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    }
  }, [systemResourceToDelete, router]);

  const listAnnouncement = `${filterState.filteredData.length} ${activeTab === 'sistemas' ? 'sistemas' : activeTab === 'fornecedores' ? 'fornecedores' : activeTab === 'servicos' ? 'serviços' : 'documentos'} exibidos`;

  const hasAny =
    systems.length > 0 ||
    suppliers.length > 0 ||
    services.length > 0 ||
    documents.length > 0;

  const selectItem = React.useCallback(
    (item: RecursosEntity) => {
      setSelectedItem(item);
      setSelectedTab(activeTab);
    },
    [activeTab],
  );

  const renderList = (
    items: RecursosEntity[],
    icon: React.ElementType,
    iconBg: string,
  ) => (
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
              className="flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-muted/50"
            >
              <div
                className={`flex size-10 items-center justify-center rounded-lg ${iconBg}`}
              >
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

  const renderCards = (
    items: RecursosEntity[],
    icon: React.ElementType,
    iconBg: string,
  ) => (
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
            className="cursor-pointer transition-colors hover:bg-muted/50"
          >
            <CardContent className="flex flex-col gap-3 p-4">
              <div
                className={`flex size-12 items-center justify-center rounded-xl ${iconBg}`}
              >
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

  const renderView = (
    items: RecursosEntity[],
    icon: React.ElementType,
    iconBg: string,
  ) =>
    filterState.viewMode === 'cards'
      ? renderCards(items, icon, iconBg)
      : renderList(items, icon, iconBg);

  const renderCockpit = () => {
    if (!selectedItem || !selectedTab) return null;
    switch (selectedTab) {
      case 'sistemas': {
        const system = selectedItem as OrgSystem;
        const resources = resourcesBySystemId[system.id] ?? [];
        return (
          <SystemCockpit360
            system={system}
            resources={resources}
            onEdit={() => handleOpenEdit(system)}
            onDelete={() => setItemToDelete(system)}
            onAddResource={() => {
              setEditingSystemResource(null);
              setSystemResourceFormData(DEFAULT_SYSTEM_RESOURCE_FORM);
              setIsSystemResourceFormOpen(true);
            }}
            onEditResource={(r) => {
              setEditingSystemResource(r);
              setSystemResourceFormData({
                name: r.name,
                description: r.description ?? '',
              });
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

  const getFormTitle = () => {
    if (editingItem) return 'Editar';
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

            <Tabs
              value={activeTab}
              onValueChange={(v) => handleTabChange(v as RecursosTab)}
            >
              <TabsList>
                <TabsTrigger value="sistemas">Sistemas ({systems.length})</TabsTrigger>
                <TabsTrigger value="fornecedores">
                  Fornecedores ({suppliers.length})
                </TabsTrigger>
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
                    title={(selectedItem && selectedTab === 'sistemas' ? selectedItem.name : '') ?? ''}
                    subtitle={
                      selectedItem && selectedTab === 'sistemas'
                        ? (selectedItem as OrgSystem).description ?? undefined
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
                      (selectedItem && selectedTab === 'fornecedores'
                        ? selectedItem.name
                        : '') ?? ''
                    }
                    subtitle={
                      selectedItem && selectedTab === 'fornecedores'
                        ? (selectedItem as OrgSupplier).description ?? undefined
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
                      (selectedItem && selectedTab === 'servicos'
                        ? selectedItem.name
                        : '') ?? ''
                    }
                    subtitle={
                      selectedItem && selectedTab === 'servicos'
                        ? (selectedItem as OrgService).description ?? undefined
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
                      (selectedItem && selectedTab === 'documentos'
                        ? selectedItem.name
                        : '') ?? ''
                    }
                    subtitle={
                      selectedItem && selectedTab === 'documentos'
                        ? (selectedItem as OrgDocument).type ?? undefined
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getFormTitle()}</DialogTitle>
            <DialogDescription>
              {editingItem
                ? 'Atualize os dados do item.'
                : 'Preencha os dados para criar um novo item.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="recursos-name">Nome *</Label>
              <Input
                id="recursos-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Nome"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="recursos-description">Descrição</Label>
              <Textarea
                id="recursos-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Descrição"
                rows={3}
              />
            </div>
            {(activeTab === 'sistemas' || ('purpose' in (editingItem ?? {}))) ? (
              <div className="grid gap-2">
                <Label htmlFor="recursos-purpose">Propósito</Label>
                <Input
                  id="recursos-purpose"
                  value={formData.purpose}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, purpose: e.target.value }))
                  }
                  placeholder="Propósito do sistema"
                />
              </div>
            ) : null}
            {(activeTab === 'documentos' || ('type' in (editingItem ?? {}))) ? (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="recursos-type">Tipo</Label>
                  <Input
                    id="recursos-type"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, type: e.target.value }))
                    }
                    placeholder="Tipo do documento"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="recursos-process">Processo associado</Label>
                  <Select
                    value={formData.associated_process_id}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, associated_process_id: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o processo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
                      {processes.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateOrUpdate} disabled={isLoading}>
              {editingItem ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
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

      <Dialog
        open={isSystemResourceFormOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsSystemResourceFormOpen(false);
            setEditingSystemResource(null);
            setSystemResourceFormData(DEFAULT_SYSTEM_RESOURCE_FORM);
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
              <Label htmlFor="system-resource-name">Nome *</Label>
              <Input
                id="system-resource-name"
                value={systemResourceFormData.name}
                onChange={(e) =>
                  setSystemResourceFormData((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Nome do recurso"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="system-resource-description">Descrição</Label>
              <Textarea
                id="system-resource-description"
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
                setSystemResourceFormData(DEFAULT_SYSTEM_RESOURCE_FORM);
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
    </div>
  );
}
