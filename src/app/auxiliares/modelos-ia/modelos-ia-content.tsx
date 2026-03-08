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
import { Database, Plus, Trash2, Zap, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { FilterBar } from '@/components/filters/FilterBar';
import { ViewModeBar } from '@/components/filters/ViewModeBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { SplitView } from '@/components/views/SplitView';
import { KanbanBoard, type KanbanColumn, type KanbanItem } from '@/components/views/KanbanBoard';
import { ModelCard } from '@/components/lm-models/ModelCard';
import { ModelCockpit } from '@/components/lm-models/ModelCockpit';
import { ModelsKanbanCard } from '@/components/lm-models/ModelsKanbanCard';
import { ModelsListView } from '@/components/lm-models/ModelsListView';
import {
  createLmModelAction,
  deleteLmModelAction,
  updateLmModelAction,
  updateLmModelDisplayOrderAction,
  bulkUpdateLmModelsActiveAction,
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
  description: string;
  docs_url: string;
  max_tokens?: number;
  default_temperature?: number;
  context_window?: number;
  display_order?: number;
  tier: 'entry' | 'balanced' | 'pro' | 'flagship' | '';
  input_cost_per_1k_tokens?: number;
  output_cost_per_1k_tokens?: number;
  // Governança
  stability_level?: 'ga' | 'preview' | 'experimental' | 'deprecated';
  release_channel?: 'stable' | 'beta' | 'alpha';
  supports_tool_calling?: boolean;
  supports_json_mode?: boolean;
  supports_streaming?: boolean;
  supports_vision?: boolean;
  supports_audio?: boolean;
  deprecated_at?: string;
  sunset_at?: string;
}

export function ModelsIaContent({ initialModels, initialProviders }: ModelsIaContentProps) {
  const [models, setModels] = useState<ModelWithProvider[]>(initialModels);
  const [selectedModel, setSelectedModel] = useState<ModelWithProvider | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<ModelWithProvider | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isEditingModel, setIsEditingModel] = useState(false);
  const [editForm, setEditForm] = useState<Partial<FormData>>({});
  const [formData, setFormData] = useState<FormData>({
    name: '',
    model_id: '',
    provider_id: '',
    description: '',
    docs_url: '',
    max_tokens: undefined,
    default_temperature: undefined,
    context_window: undefined,
    display_order: undefined,
    tier: 'balanced',
    input_cost_per_1k_tokens: undefined,
    output_cost_per_1k_tokens: undefined,
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
      description: '',
      docs_url: '',
      max_tokens: undefined,
      default_temperature: undefined,
      context_window: undefined,
      display_order: undefined,
      tier: 'balanced',
      input_cost_per_1k_tokens: undefined,
      output_cost_per_1k_tokens: undefined,
      stability_level: undefined,
      release_channel: undefined,
      supports_tool_calling: undefined,
      supports_json_mode: undefined,
      supports_streaming: undefined,
      supports_vision: undefined,
      supports_audio: undefined,
      deprecated_at: undefined,
      sunset_at: undefined,
    });
  }, []);

  const handleCreate = useCallback(async () => {
    if (!formData.provider_id) {
      toast.error('Selecione o provedor do modelo.');
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
        model_id: formData.model_id.trim().toLowerCase().replace(/\s+/g, '-'),
        description: formData.description.trim() || undefined,
        docs_url: formData.docs_url.trim() || undefined,
        max_tokens: formData.max_tokens,
        default_temperature: formData.default_temperature,
        context_window: formData.context_window,
        display_order: formData.display_order,
        tier: formData.tier || undefined,
        input_cost_per_1k_tokens: formData.input_cost_per_1k_tokens,
        output_cost_per_1k_tokens: formData.output_cost_per_1k_tokens,
        stability_level: formData.stability_level,
        release_channel: formData.release_channel,
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
        lm_providers: provider!,
      };

      setModels((prev) => [...prev, modelWithProvider]);
      setSelectedModel(modelWithProvider);
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success(result.message, { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar modelo.', {
        id: toastId,
      });
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
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir modelo.', {
        id: toastId,
      });
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
              ? {
                  ...item,
                  provider_id: newStatus,
                  display_order: newDisplayOrder,
                  lm_providers: provider,
                }
              : item,
          ),
        );

        setSelectedModel((prev) =>
          prev?.id === modelId
            ? {
                ...prev,
                provider_id: newStatus,
                display_order: newDisplayOrder,
                lm_providers: provider,
              }
            : prev,
        );

        toast.success('Modelo atualizado com sucesso.', { id: toastId });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erro ao atualizar modelo.', {
          id: toastId,
        });
      }
    },
    [initialProviders, models],
  );

  const handleBulkToggleActive = useCallback(async (modelIds: string[], isActive: boolean) => {
    const toastId = toast.loading(isActive ? 'Ativando modelos...' : 'Desativando modelos...');

    try {
      setIsBulkUpdating(true);

      const result = await bulkUpdateLmModelsActiveAction(modelIds, isActive);

      if (!result.success || !result.ids) {
        throw new Error(result.message ?? 'Falha ao atualizar modelos em lote.');
      }

      setModels((prevModels) =>
        prevModels.map((model) =>
          result.ids!.includes(model.id) ? { ...model, is_active: isActive } : model,
        ),
      );

      setSelectedModel((prev) =>
        prev && result.ids!.includes(prev.id) ? { ...prev, is_active: isActive } : prev,
      );

      toast.success(
        `${result.ids.length} modelo${result.ids.length !== 1 ? 's' : ''} ${isActive ? 'ativado(s)' : 'desativado(s)'}.`,
        { id: toastId },
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar modelos.', {
        id: toastId,
      });
    } finally {
      setIsBulkUpdating(false);
    }
  }, []);

  const handleSaveEditModel = useCallback(
    async (model: ModelWithProvider) => {
      if (!editForm.name?.trim()) {
        toast.error('Nome é obrigatório.');
        return;
      }
      setIsLoading(true);
      try {
        const result = await updateLmModelAction(model.id, {
          name: editForm.name.trim(),
          model_id: editForm.model_id?.trim().toLowerCase().replace(/\s+/g, '-'),
          description: editForm.description?.trim() || undefined,
          max_tokens: editForm.max_tokens,
          default_temperature: editForm.default_temperature,
          context_window: editForm.context_window,
          display_order: editForm.display_order,
          tier: editForm.tier || undefined,
          docs_url: editForm.docs_url?.trim() || undefined,
          input_cost_per_1k_tokens: editForm.input_cost_per_1k_tokens,
          output_cost_per_1k_tokens: editForm.output_cost_per_1k_tokens,
          stability_level: editForm.stability_level,
          release_channel: editForm.release_channel,
          supports_tool_calling: editForm.supports_tool_calling,
          supports_json_mode: editForm.supports_json_mode,
          supports_streaming: editForm.supports_streaming,
          supports_vision: editForm.supports_vision,
          supports_audio: editForm.supports_audio,
          deprecated_at: editForm.deprecated_at,
          sunset_at: editForm.sunset_at,
        });
        if (result.success && result.data) {
          const provider = model.lm_providers;
          setModels((prev) =>
            prev.map((m) => (m.id === model.id ? { ...result.data!, lm_providers: provider } : m)),
          );
          setSelectedModel((prev) =>
            prev?.id === model.id ? { ...result.data!, lm_providers: provider } : prev,
          );
          toast.success(result.message);
          setIsEditingModel(false);
        } else {
          toast.error(result.message);
        }
      } catch {
        toast.error('Erro ao atualizar modelo.');
      } finally {
        setIsLoading(false);
      }
    },
    [editForm],
  );

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
          <KPICard
            icon={Database}
            title="Total de Modelos"
            value={kpis.total}
            trend={{ value: '0', positive: false }}
          />
          <KPICard
            icon={Zap}
            title={selectedProviderFilters.length === 1 ? 'Modelos do Provedor' : 'Provedores'}
            value={selectedProviderFilters.length === 1 ? kpis.byProvider : kpis.uniqueProviders}
            trend={{ value: '0', positive: false }}
          />
          <KPICard
            icon={Plus}
            title="Filtrados"
            value={filteredModels.length}
            trend={{ value: '0', positive: true }}
          />
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

      <div className="space-y-3">
        <ViewModeBar
          moduleId="modelos-ia"
          registry={registry}
          activeViewMode={viewMode}
          onViewModeChange={setViewMode}
        />
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
      </div>

      {filteredModels.length === 0 ? (
        <EmptyState
          title={models.length === 0 ? 'Nenhum modelo cadastrado' : 'Nenhum resultado encontrado'}
          description={
            models.length === 0
              ? 'Adicione o primeiro modelo de IA para usar nos seus agentes.'
              : 'Tente ajustar ou limpar os filtros aplicados.'
          }
          actionLabel={models.length === 0 ? 'Adicionar Modelo' : undefined}
          onAction={models.length === 0 ? () => setIsCreateDialogOpen(true) : undefined}
        />
      ) : viewMode === 'kanban' || viewMode === 'grid' ? (
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
          onClose={() => {
            setSelectedModel(null);
            setIsEditingModel(false);
          }}
          title="Detalhes do Modelo"
          subtitle={selectedModel.name}
          width="lg"
        >
          <div className="space-y-6">
            {isEditingModel ? (
              <>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingModel(false)}
                    disabled={isLoading}
                    className="gap-1"
                  >
                    <X className="size-4" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSaveEditModel(selectedModel)}
                    disabled={isLoading}
                    className="gap-1"
                  >
                    <Check className="size-4" />
                    Salvar
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Nome *</Label>
                    <Input
                      value={editForm.name ?? ''}
                      onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label>Model ID *</Label>
                    <Input
                      value={editForm.model_id ?? ''}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          model_id: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                        }))
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Descrição</Label>
                    <Input
                      value={editForm.description ?? ''}
                      onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label>Max. Tokens</Label>
                    <Input
                      type="number"
                      value={editForm.max_tokens ?? ''}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          max_tokens: e.target.value ? parseInt(e.target.value, 10) : undefined,
                        }))
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label>Context Window</Label>
                    <Input
                      type="number"
                      value={editForm.context_window ?? ''}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          context_window: e.target.value ? parseInt(e.target.value, 10) : undefined,
                        }))
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label>Tier</Label>
                    <Select
                      value={editForm.tier ?? 'balanced'}
                      onValueChange={(v) =>
                        setEditForm((p) => ({ ...p, tier: v as FormData['tier'] }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="flagship">Flagship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Display Order</Label>
                    <Input
                      type="number"
                      value={editForm.display_order ?? ''}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          display_order: e.target.value ? parseInt(e.target.value, 10) : undefined,
                        }))
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label>URL Documentação</Label>
                    <Input
                      value={editForm.docs_url ?? ''}
                      onChange={(e) => setEditForm((p) => ({ ...p, docs_url: e.target.value }))}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label>Temperatura padrão</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={editForm.default_temperature ?? ''}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          default_temperature: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        }))
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label>Custo entrada /1K</Label>
                    <Input
                      type="number"
                      step="0.000001"
                      value={editForm.input_cost_per_1k_tokens ?? ''}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          input_cost_per_1k_tokens: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        }))
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label>Custo saída /1K</Label>
                    <Input
                      type="number"
                      step="0.000001"
                      value={editForm.output_cost_per_1k_tokens ?? ''}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          output_cost_per_1k_tokens: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        }))
                      }
                      disabled={isLoading}
                    />
                  </div>

                  {/* Governança Section */}
                  <div className="sm:col-span-2">
                    <h4 className="mb-4 text-sm font-semibold">Governança</h4>
                  </div>
                  <div>
                    <Label>Stability Level</Label>
                    <Select
                      value={editForm.stability_level ?? ''}
                      onValueChange={(v) =>
                        setEditForm((p) => ({ ...p, stability_level: v as any }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ga">GA</SelectItem>
                        <SelectItem value="preview">Preview</SelectItem>
                        <SelectItem value="experimental">Experimental</SelectItem>
                        <SelectItem value="deprecated">Deprecated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Release Channel</Label>
                    <Select
                      value={editForm.release_channel ?? ''}
                      onValueChange={(v) =>
                        setEditForm((p) => ({ ...p, release_channel: v as any }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stable">Stable</SelectItem>
                        <SelectItem value="beta">Beta</SelectItem>
                        <SelectItem value="alpha">Alpha</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Deprecated At (ISO)</Label>
                    <Input
                      type="datetime-local"
                      value={editForm.deprecated_at?.slice(0, 16) ?? ''}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          deprecated_at: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : undefined,
                        }))
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label>Sunset At (ISO)</Label>
                    <Input
                      type="datetime-local"
                      value={editForm.sunset_at?.slice(0, 16) ?? ''}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          sunset_at: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : undefined,
                        }))
                      }
                      disabled={isLoading}
                    />
                  </div>

                  {/* Capabilities */}
                  <div className="sm:col-span-2">
                    <h4 className="mb-4 text-sm font-semibold">Capacidades</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.supports_tool_calling ?? false}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, supports_tool_calling: e.target.checked }))
                      }
                      disabled={isLoading}
                      id="tool_calling"
                    />
                    <Label htmlFor="tool_calling">🔧 Tool Calling</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.supports_json_mode ?? false}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, supports_json_mode: e.target.checked }))
                      }
                      disabled={isLoading}
                      id="json_mode"
                    />
                    <Label htmlFor="json_mode">📄 JSON Mode</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.supports_streaming ?? false}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, supports_streaming: e.target.checked }))
                      }
                      disabled={isLoading}
                      id="streaming"
                    />
                    <Label htmlFor="streaming">🌊 Streaming</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.supports_vision ?? false}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, supports_vision: e.target.checked }))
                      }
                      disabled={isLoading}
                      id="vision"
                    />
                    <Label htmlFor="vision">👁️ Vision</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.supports_audio ?? false}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, supports_audio: e.target.checked }))
                      }
                      disabled={isLoading}
                      id="audio"
                    />
                    <Label htmlFor="audio">🎵 Audio</Label>
                  </div>
                </div>
              </>
            ) : (
              <>
                <ModelCockpit
                  model={selectedModel}
                  provider={selectedModel.lm_providers}
                  onEdit={
                    !selectedModel.is_system
                      ? () => {
                          setEditForm({
                            name: selectedModel.name,
                            model_id: selectedModel.model_id,
                            description: selectedModel.description ?? '',
                            docs_url: selectedModel.docs_url ?? '',
                            max_tokens: selectedModel.max_tokens,
                            default_temperature: selectedModel.default_temperature,
                            context_window: selectedModel.context_window,
                            display_order: selectedModel.display_order,
                            tier: selectedModel.tier ?? 'balanced',
                            input_cost_per_1k_tokens: selectedModel.input_cost_per_1k_tokens,
                            output_cost_per_1k_tokens: selectedModel.output_cost_per_1k_tokens,
                            stability_level: selectedModel.stability_level,
                            release_channel: selectedModel.release_channel,
                            supports_tool_calling: selectedModel.supports_tool_calling,
                            supports_json_mode: selectedModel.supports_json_mode,
                            supports_streaming: selectedModel.supports_streaming,
                            supports_vision: selectedModel.supports_vision,
                            supports_audio: selectedModel.supports_audio,
                            deprecated_at: selectedModel.deprecated_at ?? undefined,
                            sunset_at: selectedModel.sunset_at ?? undefined,
                          });
                          setIsEditingModel(true);
                        }
                      : undefined
                  }
                />
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
              </>
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
              Crie um novo modelo vinculando ao provedor e parâmetros básicos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Provedor</Label>
              <Select
                value={formData.provider_id}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, provider_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um provedor..." />
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
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, model_id: event.target.value }))
                }
              />
            </div>

            <div>
              <Label>URL de Documentacao (opcional)</Label>
              <Input
                placeholder="https://..."
                value={formData.docs_url}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, docs_url: event.target.value }))
                }
              />
            </div>

            <div>
              <Label>Descrição (opcional)</Label>
              <Input
                placeholder="Breve descrição do modelo"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
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
            <div>
              <Label>Context Window (opcional)</Label>
              <Input
                type="number"
                placeholder="Ex: 128000"
                value={formData.context_window ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    context_window: e.target.value ? parseInt(e.target.value, 10) : undefined,
                  }))
                }
              />
            </div>
            <div>
              <Label>Tier</Label>
              <Select
                value={formData.tier}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, tier: v as FormData['tier'] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="flagship">Flagship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Display Order (opcional)</Label>
              <Input
                type="number"
                placeholder="Ex: 10"
                value={formData.display_order ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    display_order: e.target.value ? parseInt(e.target.value, 10) : undefined,
                  }))
                }
              />
            </div>
            <div>
              <Label>Temperatura padrão (opcional)</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="2"
                placeholder="Ex: 0.7"
                value={formData.default_temperature ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    default_temperature: e.target.value ? parseFloat(e.target.value) : undefined,
                  }))
                }
              />
            </div>
            <div>
              <Label>Custo entrada /1K tokens (opcional)</Label>
              <Input
                type="number"
                step="0.000001"
                placeholder="Ex: 0.00015"
                value={formData.input_cost_per_1k_tokens ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    input_cost_per_1k_tokens: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  }))
                }
              />
            </div>
            <div>
              <Label>Custo saída /1K tokens (opcional)</Label>
              <Input
                type="number"
                step="0.000001"
                placeholder="Ex: 0.0006"
                value={formData.output_cost_per_1k_tokens ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    output_cost_per_1k_tokens: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  }))
                }
              />
            </div>

            {/* Governança */}
            <div className="border-t pt-4">
              <h3 className="mb-4 text-sm font-semibold">Governança (opcional)</h3>
            </div>
            <div>
              <Label>Stability Level</Label>
              <Select
                value={formData.stability_level ?? ''}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, stability_level: v as any }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ga">GA</SelectItem>
                  <SelectItem value="preview">Preview</SelectItem>
                  <SelectItem value="experimental">Experimental</SelectItem>
                  <SelectItem value="deprecated">Deprecated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Release Channel</Label>
              <Select
                value={formData.release_channel ?? ''}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, release_channel: v as any }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="beta">Beta</SelectItem>
                  <SelectItem value="alpha">Alpha</SelectItem>
                </SelectContent>
              </Select>
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
              Deseja realmente excluir o modelo {modelToDelete?.name}? Esta acao nao pode ser
              desfeita.
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
