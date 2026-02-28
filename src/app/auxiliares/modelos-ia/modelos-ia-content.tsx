'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { KPICard } from '@/components/dashboard/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Database, Plus, Trash2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { FilterBar } from '@/components/filters/FilterBar';
import { SplitView } from '@/components/views/SplitView';
import { KanbanBoard, type KanbanColumn, type KanbanItem } from '@/components/views/KanbanBoard';
import { ModelCard } from '@/components/lm-models/ModelCard';
import { ModelsKanbanCard } from '@/components/lm-models/ModelsKanbanCard';
import { ModelsListView } from '@/components/lm-models/ModelsListView';
import {
  createLmModelAction,
  deleteLmModelAction,
  updateLmModelDisplayOrderAction,
} from '@/app/actions/lm-models';
import { useModelosIaFilters, type ModelWithProvider } from '@/hooks/useModelosIaFilters';
import type { LmModel, LmProvider } from '@/types/agents';
import { computeModelKpis } from '@/lib/domain/lm-model-rules';

interface ModelsIaContentProps {
  initialModels: (LmModel & { lm_providers: LmProvider })[];
  initialProviders: LmProvider[];
}

interface FormData {
  name: string;
  model_id: string;
  provider_id: string;
  docs_url: string;
  max_tokens?: number;
}

export function ModelsIaContent({ initialModels, initialProviders }: ModelsIaContentProps) {
  const [models, setModels] = useState<ModelWithProvider[]>(initialModels);
  const [selectedModel, setSelectedModel] = useState<ModelWithProvider | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<ModelWithProvider | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    model_id: '',
    provider_id: '',
    docs_url: '',
    max_tokens: undefined,
  });

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
  } = useModelosIaFilters(models, initialProviders);

  const filteredModels = useMemo(
    () =>
      [...filteredData].sort((a, b) => {
        const orderA = a.display_order ?? 100;
        const orderB = b.display_order ?? 100;
        if (orderA !== orderB) return orderA - orderB;
        return a.name.localeCompare(b.name, 'pt-BR');
      }),
    [filteredData],
  );

  const selectedProviderFilters = useMemo(
    () => (Array.isArray(filters.provider_id) ? (filters.provider_id as string[]) : []),
    [filters.provider_id],
  );

  // KPIs (domain-extracted)
  const kpis = useMemo(
    () => computeModelKpis(models, selectedProviderFilters),
    [models, selectedProviderFilters],
  );

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      model_id: '',
      provider_id: '',
      docs_url: '',
      max_tokens: undefined,
    });
  }, []);

  const handleCreate = useCallback(async () => {
    if (!formData.provider_id) {
      toast.error('Selecione o fornecedor do modelo.');
      return;
    }

    if (!formData.name.trim() || !formData.model_id.trim()) {
      toast.error('Nome e Model ID sao obrigatorios.');
      return;
    }

    const toastId = toast.loading('Criando modelo...');
    setIsLoading(true);

    try {
      const result = await createLmModelAction({
        provider_id: formData.provider_id,
        name: formData.name.trim(),
        model_id: formData.model_id.trim(),
        docs_url: formData.docs_url.trim() || undefined,
        max_tokens: formData.max_tokens,
        is_active: true,
        is_system: false,
      });

      if (!result.success || !result.data) {
        toast.error(result.message, { id: toastId });
        return;
      }

      const provider = initialProviders.find((item) => item.id === result.data?.provider_id);
      const modelWithProvider: ModelWithProvider = {
        ...result.data,
        lm_providers: provider,
      };

      setModels((prev) => [...prev, modelWithProvider]);
      setSelectedModel(modelWithProvider);
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success(result.message, { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar modelo.', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  }, [formData, initialProviders, resetForm]);

  const handleDelete = useCallback(async () => {
    if (!modelToDelete) return;

    const toastId = toast.loading('Excluindo modelo...');

    try {
      const result = await deleteLmModelAction(modelToDelete.id);

      if (!result.success) {
        toast.error(result.message, { id: toastId });
        return;
      }

      setModels((prev) => prev.filter((model) => model.id !== modelToDelete.id));
      setSelectedModel((prev) => (prev?.id === modelToDelete.id ? null : prev));
      setModelToDelete(null);
      toast.success(result.message, { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir modelo.', { id: toastId });
    }
  }, [modelToDelete]);

  const kanbanColumns: KanbanColumn[] = useMemo(() => {
    const providerIds = new Set(filteredModels.map((model) => model.provider_id));

    return initialProviders
      .filter((provider) => providerIds.has(provider.id))
      .map((provider) => ({
        id: provider.id,
        title: `${provider.icon_emoji || 'AI'} ${provider.name}`,
        color: 'blue',
      }));
  }, [filteredModels, initialProviders]);

  const kanbanItems: KanbanItem[] = useMemo(
    () =>
      filteredModels.map((model) => ({
        id: model.id,
        title: model.name,
        subtitle: model.model_id,
        status: model.provider_id,
        metadata: {
          tier: model.tier || 'balanced',
        },
      })),
    [filteredModels],
  );

  const handleKanbanStatusChange = useCallback(
    async (itemId: string | number, newStatus: string) => {
      const modelId = String(itemId);
      const model = models.find((item) => item.id === modelId);
      if (!model) return;

      const newDisplayOrder = (model.display_order ?? 100) + 1;
      const toastId = toast.loading('Atualizando ordem e fornecedor...');

      try {
        const result = await updateLmModelDisplayOrderAction(modelId, newDisplayOrder);

        if (!result.success) {
          toast.error(result.message, { id: toastId });
          return;
        }

        const provider = initialProviders.find((item) => item.id === newStatus);

        setModels((prev) =>
          prev.map((item) =>
            item.id === modelId
              ? { ...item, provider_id: newStatus, display_order: newDisplayOrder, lm_providers: provider }
              : item,
          ),
        );

        setSelectedModel((prev) =>
          prev?.id === modelId
            ? { ...prev, provider_id: newStatus, display_order: newDisplayOrder, lm_providers: provider }
            : prev,
        );

        toast.success('Modelo atualizado com sucesso.', { id: toastId });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erro ao atualizar modelo.', { id: toastId });
      }
    },
    [initialProviders, models],
  );

  const handleBulkToggleActive = useCallback(async (modelIds: string[], isActive: boolean) => {
    const toastId = toast.loading(isActive ? 'Ativando modelos...' : 'Desativando modelos...');

    try {
      setIsBulkUpdating(true);

      const response = await fetch('/api/lm-models/bulk-update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelIds, isActive }),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar modelos em lote.');
      }

      const updated = await response.json();

      setModels((prevModels) =>
        prevModels.map((model) =>
          updated.ids.includes(model.id) ? { ...model, is_active: isActive } : model,
        ),
      );

      setSelectedModel((prev) =>
        prev && updated.ids.includes(prev.id) ? { ...prev, is_active: isActive } : prev,
      );

      toast.success(
        `${updated.ids.length} modelo${updated.ids.length !== 1 ? 's' : ''} ${isActive ? 'ativado(s)' : 'desativado(s)'}.`,
        { id: toastId },
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar modelos.', { id: toastId });
    } finally {
      setIsBulkUpdating(false);
    }
  }, []);

  const listAnnouncement = `Lista com ${filteredModels.length} modelos.`;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <DashboardHeader
          title="Gestao 360 de Modelos IA"
          subtitle="Visualize, organize e gerencie modelos de IA por fornecedor"
        />
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Modelo
        </Button>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {listAnnouncement}
      </p>

      {models.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <KPICard icon={Database} title="Total de Modelos" value={kpis.total} trend={{ value: '0', positive: false }} />
          <KPICard
            icon={Zap}
            title={selectedProviderFilters.length === 1 ? 'Modelos do Fornecedor' : 'Fornecedores'}
            value={selectedProviderFilters.length === 1 ? kpis.byProvider : kpis.uniqueProviders}
            trend={{ value: '0', positive: false }}
          />
          <KPICard icon={Plus} title="Filtrados" value={filteredModels.length} trend={{ value: '0', positive: true }} />
        </div>
      )}

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-sm">Sobre Modelos IA</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Modelos IA representam as configuracoes operacionais dos fornecedores. Use filtros,
            kanban e lista para manter catalogo padronizado e priorizado.
          </p>
        </CardContent>
      </Card>

      <FilterBar
        moduleId="modelos-ia"
        filters={registry}
        onFiltersChange={(newFilters) => {
          Object.entries(newFilters).forEach(([key, value]) => {
            if (filters[key] !== value) {
              updateFilter(key, value);
            }
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

      {filteredModels.length === 0 ? (
        <Card>
          <CardContent className="pb-12 pt-12">
            <div className="text-center">
              <p className="mb-4 text-muted-foreground">
                {models.length === 0 ? 'Nenhum modelo criado ainda' : 'Nenhum resultado encontrado'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'kanban' ? (
        <div className="space-y-4">
          <KanbanBoard
            columns={kanbanColumns}
            items={kanbanItems}
            selectedId={selectedModel?.id}
            onItemClick={(item) => {
              const model = models.find((entry) => entry.id === item.id);
              if (model) {
                setSelectedModel(model);
              }
            }}
            onStatusChange={handleKanbanStatusChange}
            renderItemContent={(item) => {
              const model = models.find((entry) => entry.id === item.id);
              if (!model) return null;

              const provider = initialProviders.find((entry) => entry.id === model.provider_id);
              return <ModelsKanbanCard model={model} provider={provider} />;
            }}
            emptyMessage="Nenhum modelo disponivel no Kanban"
          />
        </div>
      ) : viewMode === 'list' ? (
        <ModelsListView
          models={filteredModels}
          providers={initialProviders}
          onSelectModel={(modelId) => {
            const model = models.find((entry) => entry.id === modelId);
            if (model) {
              setSelectedModel(model);
            }
          }}
          onBulkToggleActive={handleBulkToggleActive}
          isLoading={isBulkUpdating}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {filteredModels.length} de {models.length} modelos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredModels.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  provider={model.lm_providers}
                  isSelected={selectedModel?.id === model.id}
                  onSelect={setSelectedModel}
                  onDelete={(_, target) => {
                    setModelToDelete(target as ModelWithProvider);
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedModel && (
        <SplitView
          isOpen={!!selectedModel}
          onClose={() => setSelectedModel(null)}
          title="Detalhes do Modelo"
          subtitle={selectedModel.name}
          width="lg"
        >
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-semibold">Informacoes Gerais</h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Nome:</dt>
                  <dd className="font-medium">{selectedModel.name}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Model ID:</dt>
                  <dd className="font-mono">{selectedModel.model_id}</dd>
                </div>
                {selectedModel.max_tokens != null && (
                  <div>
                    <dt className="text-muted-foreground">Max. Tokens:</dt>
                    <dd className="font-medium">{selectedModel.max_tokens.toLocaleString('pt-BR')} tokens</dd>
                  </div>
                )}
              </dl>
            </div>

            {selectedModel.docs_url && (
              <div>
                <h3 className="mb-2 text-sm font-semibold">Documentacao</h3>
                <a
                  href={selectedModel.docs_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary underline"
                >
                  Ver documentacao
                </a>
              </div>
            )}

            {!selectedModel.is_system && (
              <Button
                variant="destructive"
                onClick={() => setModelToDelete(selectedModel)}
                className="w-full"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir Modelo
              </Button>
            )}
          </div>
        </SplitView>
      )}

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Modelo IA</DialogTitle>
            <DialogDescription>
              Crie um novo modelo vinculando ao fornecedor e parametros basicos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Fornecedor</Label>
              <Select
                value={formData.provider_id}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, provider_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um fornecedor..." />
                </SelectTrigger>
                <SelectContent>
                  {initialProviders.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.icon_emoji} {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Nome do Modelo</Label>
              <Input
                placeholder="Ex: GPT-4 Turbo"
                value={formData.name}
                onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>

            <div>
              <Label>Model ID</Label>
              <Input
                placeholder="Ex: gpt-4-turbo-preview"
                value={formData.model_id}
                onChange={(event) => setFormData((prev) => ({ ...prev, model_id: event.target.value }))}
              />
            </div>

            <div>
              <Label>URL de Documentacao (opcional)</Label>
              <Input
                placeholder="https://..."
                value={formData.docs_url}
                onChange={(event) => setFormData((prev) => ({ ...prev, docs_url: event.target.value }))}
              />
            </div>

            <div>
              <Label>Max. Tokens (opcional)</Label>
              <Input
                type="number"
                placeholder="Ex: 8000"
                value={formData.max_tokens ?? ''}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    max_tokens: event.target.value ? parseInt(event.target.value, 10) : undefined,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button disabled={isLoading} onClick={handleCreate}>
              {isLoading ? 'Criando...' : 'Criar Modelo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!modelToDelete} onOpenChange={(open) => !open && setModelToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusao</DialogTitle>
            <DialogDescription>
              Deseja realmente excluir o modelo {modelToDelete?.name}? Esta acao nao pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModelToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
