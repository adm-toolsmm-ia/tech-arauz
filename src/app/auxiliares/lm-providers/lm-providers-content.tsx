'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { KPICard } from '@/components/dashboard/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Lock, AlertCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';
import {
  createLmProviderAction,
  updateLmProviderAction,
  deleteLmProviderAction,
} from '@/app/actions/lm-providers';
import { FilterBar } from '@/components/filters/FilterBar';
import { useLmProvidersFilters } from '@/hooks/useLmProvidersFilters';
import { LmModelsService } from '@/services/agents/lmModelsService';
import { KanbanBoard, type KanbanItem } from '@/components/views/KanbanBoard';
import { SplitView } from '@/components/views/SplitView';
import { LmProviderCockpit } from '@/components/lm-providers/LmProviderCockpit';
import type { LmProvider, LmModel } from '@/types/agents';

const EMOJI_OPTIONS = ['🤖', '⚡', '🔮', '🎨', '🧠', '💡', '🚀', '📊', '🔧', '⚙️'];
const COLOR_OPTIONS = [
  { hex: '#64748B', label: 'Cinza' },
  { hex: '#3B82F6', label: 'Azul' },
  { hex: '#8B5CF6', label: 'Roxo' },
  { hex: '#EC4899', label: 'Rosa' },
  { hex: '#F59E0B', label: 'Âmbar' },
  { hex: '#10B981', label: 'Verde' },
];

interface LmProvidersContentProps {
  initialProviders: LmProvider[];
}

interface CreateProviderFormData {
  name: string;
  slug: string;
  description: string;
  api_endpoint: string;
  docs_url: string;
  icon_emoji: string;
  color_hex: string;
  is_active: boolean;
}

const LM_PROVIDER_KANBAN_COLUMNS = [
  { id: 'active', title: 'Ativos', color: 'green' },
  { id: 'inactive', title: 'Inativos', color: 'gray' },
];

export function LmProvidersContent({ initialProviders }: LmProvidersContentProps) {
  const [providers, setProviders] = useState(initialProviders);
  const [modelsByProviderId, setModelsByProviderId] = useState<Record<string, LmModel[]>>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<LmProvider | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<LmProvider | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateProviderFormData>({
    name: '',
    slug: '',
    description: '',
    api_endpoint: '',
    docs_url: '',
    icon_emoji: '🤖',
    color_hex: '#64748B',
    is_active: true,
  });

  // KPIs
  const kpis = useMemo(
    () => ({
      total: providers.length,
      active: providers.filter((p) => p.is_active).length,
      system: providers.filter((p) => p.is_system).length,
    }),
    [providers]
  );

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
  } = useLmProvidersFilters(providers);

  // Auto-generate slug
  const handleNameChange = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: value.toLowerCase().replace(/\s+/g, '_'),
    }));
  }, []);

  // Create provider
  const handleCreate = useCallback(async () => {
    if (!formData.name.trim()) {
      toast.error('❌ Nome é obrigatório');
      return;
    }

    setIsLoading(true);
    try {
      const result = await createLmProviderAction({
        ...formData,
        is_system: false,
      });
      if (result.success && result.data) {
        setProviders((prev) => [...prev, result.data!]);
        toast.success(`✅ ${result.message}`);
        setFormData({
          name: '',
          slug: '',
          description: '',
          api_endpoint: '',
          docs_url: '',
          icon_emoji: '🤖',
          color_hex: '#64748B',
          is_active: true,
        });
        setIsCreateDialogOpen(false);
      } else {
        toast.error(`❌ ${result.message}`);
      }
    } catch (error) {
      toast.error(`❌ Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  // Delete provider
  const handleDelete = useCallback(async (provider: LmProvider) => {
    if (provider.is_system) {
      toast.error('❌ Fornecedores de sistema não podem ser deletados');
      return;
    }

    try {
      const result = await deleteLmProviderAction(provider.id);
      if (result.success) {
        setProviders((prev) => prev.filter((p) => p.id !== provider.id));
        setSelectedProvider(null);
        setProviderToDelete(null);
        toast.success(`✅ ${result.message}`);
      } else {
        toast.error(`❌ ${result.message}`);
      }
    } catch (error) {
      toast.error(`❌ Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    }
  }, []);

  // Toggle active status
  const handleToggleActive = useCallback(async (provider: LmProvider) => {
    try {
      const result = await updateLmProviderAction(provider.id, {
        is_active: !provider.is_active,
      });
      if (result.success) {
        setProviders((prev) =>
          prev.map((p) => (p.id === provider.id ? { ...p, is_active: !p.is_active } : p))
        );
        toast.success(`✅ ${result.message}`);
      } else {
        toast.error(`❌ ${result.message}`);
      }
    } catch (error) {
      toast.error(`❌ Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    }
  }, []);

  // Load models and open cockpit when selecting a provider
  const handleSelectProvider = useCallback(async (provider: LmProvider) => {
    setSelectedProvider(provider);
    try {
      const providerModels = await LmModelsService.listModels(provider.id);
      setModelsByProviderId((prev) => ({ ...prev, [provider.id]: providerModels }));
    } catch {
      toast.error('❌ Erro ao carregar modelos');
    }
  }, []);

  // Kanban items (grouped by is_active)
  const kanbanItems: KanbanItem[] = useMemo(
    () =>
      filteredData.map((p) => ({
        id: p.id,
        title: p.name,
        subtitle: p.slug,
        status: p.is_active ? 'active' : 'inactive',
        metadata: {},
      })),
    [filteredData],
  );

  const handleKanbanStatusChange = useCallback(
    async (itemId: string | number, newStatus: string) => {
      const provider = providers.find((p) => p.id === itemId);
      if (!provider || provider.is_system) return;

      const newIsActive = newStatus === 'active';
      try {
        const result = await updateLmProviderAction(provider.id, { is_active: newIsActive });
        if (result.success) {
          setProviders((prev) =>
            prev.map((p) => (p.id === provider.id ? { ...p, is_active: newIsActive } : p)),
          );
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } catch {
        toast.error('❌ Erro ao atualizar status');
      }
    },
    [providers],
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <DashboardHeader
          title="Provedores de LM"
          subtitle="Gerencie provedores de modelos de linguagem e seus modelos disponíveis"
        />
        <Button className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo Provedor
        </Button>
      </div>

      {/* KPIs */}
      {providers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard
            icon={Zap}
            title="Total"
            value={kpis.total}
            trend={{ value: '0', positive: false }}
          />
          <KPICard
            icon={Zap}
            title="Ativos"
            value={kpis.active}
            trend={{ value: '0', positive: true }}
          />
          <KPICard
            icon={Lock}
            title="Sistema"
            value={kpis.system}
            trend={{ value: '0', positive: false }}
          />
        </div>
      )}

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Sobre Fornecedores IA
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Fornecedores IA são serviços externos que fornecem modelos de linguagem (como OpenAI,
            Anthropic, etc.). Cada fornecedor pode ter múltiplos modelos com configurações diferentes.
          </p>
        </CardContent>
      </Card>

      {/* FilterBar: busca padronizada + ViewToggle */}
      <FilterBar
        moduleId="lm-providers"
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

      {/* Providers List or Kanban */}
      {filteredData.length === 0 ? (
        <Card>
          <CardContent className="pb-12 pt-12">
            <div className="text-center">
              <p className="mb-4 text-muted-foreground">
                {providers.length === 0 ? 'Nenhum provedor criado ainda' : 'Nenhum resultado encontrado'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'kanban' ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {filteredData.length} de {providers.length} fornecedores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <KanbanBoard
              columns={LM_PROVIDER_KANBAN_COLUMNS}
              items={kanbanItems}
              selectedId={selectedProvider?.id}
              onItemClick={(item) => {
                const provider = filteredData.find((p) => p.id === item.id);
                if (provider) void handleSelectProvider(provider);
              }}
              onStatusChange={handleKanbanStatusChange}
              renderItemContent={(item) => (
                <div className="space-y-1">
                  <p className="font-medium">{item.title}</p>
                  {item.subtitle && (
                    <p className="text-xs font-mono text-muted-foreground">{item.subtitle}</p>
                  )}
                </div>
              )}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {filteredData.length} de {providers.length} fornecedores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredData.map((provider) => (
                <div
                  key={provider.id}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  onClick={() => void handleSelectProvider(provider)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      void handleSelectProvider(provider);
                    }
                  }}
                >
                  {/* Provider Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-1 items-center gap-4">
                      <div
                        className="text-2xl w-10 h-10 flex items-center justify-center rounded"
                        style={{ backgroundColor: `${provider.color_hex}20` }}
                      >
                        {provider.icon_emoji || '🤖'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{provider.name}</h3>
                        <p className="text-sm text-muted-foreground font-mono text-xs">
                          {provider.slug}
                        </p>
                        {provider.description && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                            {provider.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 mr-4">
                      {provider.is_system && (
                        <Badge variant="outline">
                          <Lock className="h-3 w-3 mr-1" />
                          Sistema
                        </Badge>
                      )}
                      {provider.is_active ? (
                        <Badge variant="default" className="bg-green-600">
                          ✅ Ativo
                        </Badge>
                      ) : (
                        <Badge variant="secondary">⭐ Inativo</Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {!provider.is_system && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Alternar status"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleActive(provider);
                            }}
                          >
                            {provider.is_active ? '🔴' : '🟢'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Deletar"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProviderToDelete(provider);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                      {provider.is_system && (
                        <Button variant="ghost" size="sm" disabled>
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* API Endpoint */}
                  {provider.api_endpoint && (
                    <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded font-mono">
                      {provider.api_endpoint}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SplitView: detalhes do provedor + modelos */}
      <SplitView
        isOpen={!!selectedProvider}
        onClose={() => setSelectedProvider(null)}
        title={selectedProvider?.name ?? ''}
        subtitle={selectedProvider?.slug}
        width="lg"
      >
        {selectedProvider && (
          <LmProviderCockpit
            provider={selectedProvider}
            models={modelsByProviderId[selectedProvider.id] ?? []}
            onModelCreated={(model) =>
              setModelsByProviderId((prev) => ({
                ...prev,
                [selectedProvider.id]: [...(prev[selectedProvider.id] ?? []), model],
              }))
            }
          />
        )}
      </SplitView>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Provedor de LM</DialogTitle>
            <DialogDescription>
              Adicione um novo provedor de modelo de linguagem ao sistema
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Ex: OpenAI"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Slug */}
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="Ex: openai"
                value={formData.slug}
                disabled
                className="bg-muted text-sm text-muted-foreground"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Descreva este provedor..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                disabled={isLoading}
              />
            </div>

            {/* API Endpoint */}
            <div>
              <Label htmlFor="api_endpoint">Endpoint da API</Label>
              <Input
                id="api_endpoint"
                placeholder="Ex: https://api.openai.com/v1"
                value={formData.api_endpoint}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, api_endpoint: e.target.value }))
                }
                disabled={isLoading}
              />
            </div>

            {/* URL Documentação */}
            <div>
              <Label htmlFor="docs_url">URL da documentação</Label>
              <Input
                id="docs_url"
                placeholder="Ex: https://platform.openai.com/docs"
                value={formData.docs_url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, docs_url: e.target.value }))
                }
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Base para rotinas futuras de atualização de dados
              </p>
            </div>

            {/* Emoji */}
            <div>
              <Label>Ícone Emoji</Label>
              <div className="grid grid-cols-5 gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <Button
                    key={emoji}
                    variant={formData.icon_emoji === emoji ? 'default' : 'outline'}
                    size="sm"
                    className="text-xl"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, icon_emoji: emoji }))
                    }
                    disabled={isLoading}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <Label>Cor</Label>
              <div className="grid grid-cols-3 gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <Button
                    key={color.hex}
                    variant={formData.color_hex === color.hex ? 'default' : 'outline'}
                    size="sm"
                    className="justify-start"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, color_hex: color.hex }))
                    }
                    disabled={isLoading}
                  >
                    <div
                      className="w-4 h-4 rounded mr-2"
                      style={{ backgroundColor: color.hex }}
                    />
                    {color.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!providerToDelete} onOpenChange={(open) => !open && setProviderToDelete(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Confirmar exclusao</DialogTitle>
            <DialogDescription>
              Deseja excluir o provedor {providerToDelete?.name}? Esta acao nao pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProviderToDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (providerToDelete) void handleDelete(providerToDelete);
              }}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

