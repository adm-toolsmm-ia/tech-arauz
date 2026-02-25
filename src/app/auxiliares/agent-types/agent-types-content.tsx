'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Lock, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  createAgentTypeAction,
  updateAgentTypeAction,
  deleteAgentTypeAction,
} from '@/app/actions/agent-types';
import { FilterBar } from '@/components/filters/FilterBar';
import { useAgentTypesFilters } from '@/hooks/useAgentTypesFilters';
import { KanbanBoard, type KanbanItem } from '@/components/views/KanbanBoard';
import { SplitView } from '@/components/views/SplitView';
import { AgentTypeCockpit } from '@/components/agent-types/AgentTypeCockpit';
import { LmModelsService } from '@/services/agents/lmModelsService';
import type { AgentType, LmProvider, LmModel } from '@/types/agents';

interface AgentTypesContentProps {
  initialAgentTypes: AgentType[];
  providers?: LmProvider[];
}

interface FormData {
  name: string;
  slug: string;
  description: string;
  icon_emoji: string;
  color_hex: string;
  is_active: boolean;
  default_model_provider?: string;
  default_model_id?: string;
  default_temperature?: number;
}

const AGENT_TYPE_KANBAN_COLUMNS = [
  { id: 'active', title: 'Ativos', color: 'green' },
  { id: 'inactive', title: 'Inativos', color: 'gray' },
];

const EMOJI_OPTIONS = ['⚙️', '📊', '🤖', '📋', '🔍', '🚀', '💡', '🎯', '📈', '🔧'];
const COLOR_OPTIONS = [
  { hex: '#64748B', label: 'Cinza' },
  { hex: '#3B82F6', label: 'Azul' },
  { hex: '#8B5CF6', label: 'Roxo' },
  { hex: '#EC4899', label: 'Rosa' },
  { hex: '#F59E0B', label: 'Âmbar' },
  { hex: '#10B981', label: 'Verde' },
];

export function AgentTypesContent({ initialAgentTypes, providers = [] }: AgentTypesContentProps) {
  const [agentTypes, setAgentTypes] = useState(initialAgentTypes);
  const [selectedAgentType, setSelectedAgentType] = useState<AgentType | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<AgentType | null>(null);
  const [modelsByProvider, setModelsByProvider] = useState<Record<string, LmModel[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    description: '',
    icon_emoji: '⚙️',
    color_hex: '#64748B',
    is_active: true,
  });

  const loadModelsForProvider = useCallback(async (providerId: string) => {
    if (modelsByProvider[providerId]) return;
    try {
      const models = await LmModelsService.listModels(providerId);
      setModelsByProvider((prev) => ({ ...prev, [providerId]: models }));
    } catch {
      toast.error('Erro ao carregar modelos');
    }
  }, [modelsByProvider]);

  // KPIs
  const kpis = useMemo(
    () => ({
      total: agentTypes.length,
      active: agentTypes.filter((t) => t.is_active).length,
      system: agentTypes.filter((t) => t.is_system).length,
    }),
    [agentTypes]
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
  } = useAgentTypesFilters(agentTypes);

  // Preload models when editing
  useEffect(() => {
    if (editingType?.default_model_provider && providers.length > 0) {
      const provider = providers.find((p) => p.slug === editingType.default_model_provider);
      if (provider) void loadModelsForProvider(provider.id);
    }
  }, [editingType?.default_model_provider, providers, loadModelsForProvider]);

  // Auto-generate slug (apenas ao criar, não ao editar)
  const handleNameChange = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: editingType ? prev.slug : value.toLowerCase().replace(/\s+/g, '_'),
    }));
  }, [editingType]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon_emoji: '⚙️',
      color_hex: '#64748B',
      is_active: true,
      default_model_provider: undefined,
      default_model_id: undefined,
      default_temperature: undefined,
    });
    setEditingType(null);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!formData.name.trim()) {
      toast.error('❌ Nome é obrigatório');
      return;
    }

    setIsLoading(true);
    try {
      const result = await createAgentTypeAction({
        ...formData,
        is_system: false,
      });
      if (result.success && result.data) {
        setAgentTypes((prev) => [...prev, result.data!]);
        toast.success(`✅ ${result.message}`);
        resetForm();
        setIsCreateDialogOpen(false);
      } else {
        toast.error(`❌ ${result.message}`);
      }
    } catch (error) {
      toast.error(`❌ Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  }, [formData, resetForm]);

  const handleUpdate = useCallback(async () => {
    if (!editingType) return;
    if (!formData.name.trim()) {
      toast.error('❌ Nome é obrigatório');
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateAgentTypeAction(editingType.id, {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        icon_emoji: formData.icon_emoji,
        color_hex: formData.color_hex,
        is_active: formData.is_active,
        default_model_provider: formData.default_model_provider,
        default_model_id: formData.default_model_id,
        default_temperature: formData.default_temperature,
      });
      if (result.success && result.data) {
        setAgentTypes((prev) =>
          prev.map((t) => (t.id === editingType.id ? result.data! : t)),
        );
        toast.success('✅ Tipo atualizado!');
        resetForm();
        setIsCreateDialogOpen(false);
        setSelectedAgentType(null);
      } else {
        toast.error(`❌ ${result.message}`);
      }
    } catch (error) {
      toast.error(`❌ Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  }, [editingType, formData, resetForm]);

  const handleOpenEdit = useCallback((type: AgentType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      slug: type.slug,
      description: type.description ?? '',
      icon_emoji: type.icon_emoji ?? '⚙️',
      color_hex: type.color_hex ?? '#64748B',
      is_active: type.is_active,
      default_model_provider: type.default_model_provider,
      default_model_id: type.default_model_id,
      default_temperature: type.default_temperature,
    });
    setIsCreateDialogOpen(true);
  }, []);

  // Delete agent type
  const handleDelete = useCallback(async (type: AgentType) => {
    if (type.is_system) {
      toast.error('❌ Tipos de sistema não podem ser deletados');
      return;
    }

    if (!confirm(`Tem certeza que deseja deletar "${type.name}"?`)) return;

    try {
      const result = await deleteAgentTypeAction(type.id);
      if (result.success) {
        setAgentTypes((prev) => prev.filter((t) => t.id !== type.id));
        setSelectedAgentType(null);
        toast.success(`✅ ${result.message}`);
      } else {
        toast.error(`❌ ${result.message}`);
      }
    } catch (error) {
      toast.error(`❌ Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    }
  }, []);

  // Toggle active status
  const handleToggleActive = useCallback(async (type: AgentType) => {
    try {
      const result = await updateAgentTypeAction(type.id, {
        is_active: !type.is_active,
      });
      if (result.success) {
        setAgentTypes((prev) =>
          prev.map((t) => (t.id === type.id ? { ...t, is_active: !t.is_active } : t))
        );
        toast.success(`✅ ${result.message}`);
      } else {
        toast.error(`❌ ${result.message}`);
      }
    } catch (error) {
      toast.error(`❌ Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    }
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <DashboardHeader
          title="Tipos de Agentes"
          subtitle="Gerencie as categorias e tipos de agentes disponíveis no sistema"
        />
        <Button
          className="gap-2"
          onClick={() => {
            resetForm();
            setIsCreateDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Novo Tipo
        </Button>
      </div>

      {/* KPIs */}
      {agentTypes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard
            icon={Plus}
            title="Total"
            value={kpis.total}
            trend={{ value: '0', positive: false }}
          />
          <KPICard
            icon={Plus}
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
            Sobre Tipos de Agentes
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Tipos de agentes são categorias que padronizam a configuração e o comportamento dos
            agentes. Cada tipo pode ter modelos padrão, temperatura e outras configurações
            pré-definidas. Tipos marcados com 🔒 são do sistema e não podem ser editados.
          </p>
        </CardContent>
      </Card>

      {/* FilterBar: busca padronizada + ViewToggle */}
      <FilterBar
        moduleId="agent-types"
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

      {/* Results */}
      {filteredData.length === 0 ? (
        <Card>
          <CardContent className="pb-12 pt-12">
            <div className="text-center">
              <p className="mb-4 text-muted-foreground">
                {agentTypes.length === 0 ? 'Nenhum tipo criado ainda' : 'Nenhum resultado encontrado'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'kanban' ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {filteredData.length} de {agentTypes.length} tipos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <KanbanBoard
              columns={AGENT_TYPE_KANBAN_COLUMNS}
              items={filteredData.map((t) => ({
                id: t.id,
                title: t.name,
                subtitle: t.slug,
                status: t.is_active ? 'active' : 'inactive',
                metadata: {},
              }))}
              selectedId={selectedAgentType?.id}
              onItemClick={(item) => {
                const type = filteredData.find((t) => t.id === item.id);
                if (type) setSelectedAgentType(type);
              }}
              onStatusChange={async (itemId, newStatus) => {
                const type = agentTypes.find((t) => t.id === itemId);
                if (!type || type.is_system) return;
                const newIsActive = newStatus === 'active';
                try {
                  const result = await updateAgentTypeAction(type.id, { is_active: newIsActive });
                  if (result.success && result.data) {
                    setAgentTypes((prev) =>
                      prev.map((t) => (t.id === type.id ? result.data! : t)),
                    );
                    toast.success(result.message);
                  } else if (result) toast.error(result.message);
                } catch {
                  toast.error('Erro ao atualizar status');
                }
              }}
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
              {filteredData.length} de {agentTypes.length} tipos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredData.map((type) => (
                <div
                  key={type.id}
                  role="button"
                  tabIndex={0}
                  className="flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  onClick={() => setSelectedAgentType(type)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedAgentType(type);
                    }
                  }}
                >
                  {/* Icon & Name */}
                  <div className="flex flex-1 items-center gap-4">
                    <div
                      className="text-2xl w-10 h-10 flex items-center justify-center rounded"
                      style={{ backgroundColor: `${type.color_hex}20` }}
                    >
                      {type.icon_emoji || '⚙️'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{type.name}</h3>
                      <p className="text-sm text-muted-foreground font-mono text-xs">
                        {type.slug}
                      </p>
                      {type.description && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                          {type.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Badges & Status */}
                  <div className="flex items-center gap-2 mr-4">
                    {type.is_system && (
                      <Badge variant="outline">
                        <Lock className="h-3 w-3 mr-1" />
                        Sistema
                      </Badge>
                    )}
                    {type.is_active ? (
                      <Badge variant="default" className="bg-green-600">
                        ✅ Ativo
                      </Badge>
                    ) : (
                      <Badge variant="secondary">⭐ Inativo</Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!type.is_system && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Alternar status"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(type);
                          }}
                        >
                          {type.is_active ? '🔴' : '🟢'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Deletar"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(type);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </>
                    )}
                    {type.is_system && (
                      <Button variant="ghost" size="sm" disabled title="Tipo do sistema">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SplitView: detalhes do tipo de agente */}
      <SplitView
        isOpen={!!selectedAgentType}
        onClose={() => setSelectedAgentType(null)}
        title={selectedAgentType?.name ?? ''}
        subtitle={selectedAgentType?.slug}
        width="lg"
      >
        {selectedAgentType && (
          <AgentTypeCockpit
            agentType={selectedAgentType}
            onEdit={
              !selectedAgentType.is_system
                ? () => handleOpenEdit(selectedAgentType)
                : undefined
            }
          />
        )}
      </SplitView>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetForm();
            setEditingType(null);
          }
          setIsCreateDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingType ? 'Editar Tipo de Agente' : 'Criar Novo Tipo de Agente'}
            </DialogTitle>
            <DialogDescription>
              {editingType
                ? 'Atualize as configurações do tipo e o modelo padrão (tabelas auxiliares)'
                : 'Defina um novo tipo de agente com suas configurações padrão'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Ex: Análise de Requisitos"
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
                placeholder="Ex: analise_requisitos"
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
                placeholder="Descreva este tipo de agente..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                disabled={isLoading}
              />
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

            {/* Provedor e Modelo padrão (tabelas auxiliares) */}
            {providers.length > 0 && (
              <>
                <div>
                  <Label>Provedor padrão</Label>
                  <Select
                    value={formData.default_model_provider ?? 'none'}
                    onValueChange={(value) => {
                      const slug = value === 'none' ? undefined : value;
                      const provider = slug ? providers.find((p) => p.slug === slug) : undefined;
                      if (provider) void loadModelsForProvider(provider.id);
                      setFormData((prev) => ({
                        ...prev,
                        default_model_provider: slug,
                        default_model_id: provider
                          ? modelsByProvider[provider.id]?.[0]?.model_id
                          : undefined,
                      }));
                    }}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar provedor..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {providers.map((p) => (
                        <SelectItem key={p.id} value={p.slug}>
                          {p.icon_emoji} {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Modelo padrão</Label>
                  <Select
                    value={formData.default_model_id ?? 'none'}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        default_model_id: value === 'none' ? undefined : value,
                      }))
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar modelo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {(() => {
                        const provider = providers.find(
                          (p) => p.slug === formData.default_model_provider,
                        );
                        const models = provider ? modelsByProvider[provider.id] ?? [] : [];
                        if (provider && models.length === 0 && formData.default_model_provider) {
                          void loadModelsForProvider(provider.id);
                        }
                        return models.map((m) => (
                          <SelectItem key={m.id} value={m.model_id}>
                            {m.name} ({m.model_id})
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Temperatura padrão (0-2)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={2}
                    step={0.1}
                    value={formData.default_temperature ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        default_temperature: v === '' ? undefined : parseFloat(v),
                      }));
                    }}
                    placeholder="Ex: 0.7"
                    disabled={isLoading}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setIsCreateDialogOpen(false);
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={editingType ? handleUpdate : handleCreate}
              disabled={isLoading}
            >
              {isLoading
                ? editingType
                  ? 'Salvando...'
                  : 'Criando...'
                : editingType
                  ? 'Salvar'
                  : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
