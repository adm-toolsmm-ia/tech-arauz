'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { KPICard } from '@/components/dashboard/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  createAgentTypeAction,
  updateAgentTypeAction,
  deleteAgentTypeAction,
} from '@/app/actions/agent-types';
import { FilterBar } from '@/components/filters/FilterBar';
import { ViewModeBar } from '@/components/filters/ViewModeBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAgentTypesFilters } from '@/hooks/useAgentTypesFilters';
import { KanbanBoard } from '@/components/views/KanbanBoard';
import { SplitView } from '@/components/views/SplitView';
import { AgentTypeCockpit } from '@/components/agent-types/AgentTypeCockpit';
import { LmModelsService } from '@/services/agents/lmModelsService';
import { AgentTypeListItem } from './components/AgentTypeListItem';
import { AgentTypeFormDialog, type AgentTypeFormData } from './components/AgentTypeFormDialog';
import type { AgentType, LmProvider, LmModel } from '@/types/agents';

interface AgentTypesContentProps {
  initialAgentTypes: AgentType[];
  providers?: LmProvider[];
}

const AGENT_TYPE_KANBAN_COLUMNS = [
  { id: 'active', title: 'Ativos', color: 'green' },
  { id: 'inactive', title: 'Inativos', color: 'gray' },
];

const DEFAULT_FORM: AgentTypeFormData = {
  name: '',
  slug: '',
  description: '',
  icon_emoji: '⚙️',
  color_hex: '#64748B',
  is_active: true,
};

export function AgentTypesContent({ initialAgentTypes, providers = [] }: AgentTypesContentProps) {
  const [agentTypes, setAgentTypes] = useState(initialAgentTypes);
  const [selectedAgentType, setSelectedAgentType] = useState<AgentType | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingType, setEditingType] = useState<AgentType | null>(null);
  const [agentTypeToDelete, setAgentTypeToDelete] = useState<AgentType | null>(null);
  const [modelsByProvider, setModelsByProvider] = useState<Record<string, LmModel[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AgentTypeFormData>(DEFAULT_FORM);

  const kpis = useMemo(
    () => ({
      total: agentTypes.length,
      active: agentTypes.filter((t) => t.is_active).length,
      system: agentTypes.filter((t) => t.is_system).length,
    }),
    [agentTypes],
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

  const loadModelsForProvider = useCallback(
    async (providerId: string) => {
      if (modelsByProvider[providerId]) return;
      try {
        const models = await LmModelsService.listModels(providerId);
        setModelsByProvider((prev) => ({ ...prev, [providerId]: models }));
      } catch {
        toast.error('Erro ao carregar modelos');
      }
    },
    [modelsByProvider],
  );

  useEffect(() => {
    if (editingType?.default_model_provider && providers.length > 0) {
      const provider = providers.find((p) => p.slug === editingType.default_model_provider);
      if (provider) void loadModelsForProvider(provider.id);
    }
  }, [editingType?.default_model_provider, providers, loadModelsForProvider]);

  const resetForm = useCallback(() => {
    setFormData(DEFAULT_FORM);
    setEditingType(null);
  }, []);

  const handleNameChange = useCallback(
    (value: string) => {
      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: editingType ? prev.slug : value.toLowerCase().replace(/\s+/g, '_'),
      }));
    },
    [editingType],
  );

  const handleFormDataChange = useCallback((data: Partial<AgentTypeFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const handleCreate = useCallback(async () => {
    if (!formData.name.trim()) {
      toast.error('❌ Nome é obrigatório');
      return;
    }
    setIsLoading(true);
    try {
      const result = await createAgentTypeAction({ ...formData, is_system: false });
      if (result.success && result.data) {
        setAgentTypes((prev) => [...prev, result.data!]);
        toast.success(`✅ ${result.message}`);
        resetForm();
        setIsFormOpen(false);
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
        setAgentTypes((prev) => prev.map((t) => (t.id === editingType.id ? result.data! : t)));
        toast.success('✅ Tipo atualizado!');
        resetForm();
        setIsFormOpen(false);
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
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback((type: AgentType) => {
    if (type.is_system) {
      toast.error('❌ Tipos de sistema não podem ser deletados');
      return;
    }
    setAgentTypeToDelete(type);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!agentTypeToDelete) return;
    try {
      const result = await deleteAgentTypeAction(agentTypeToDelete.id);
      if (result.success) {
        setAgentTypes((prev) => prev.filter((t) => t.id !== agentTypeToDelete.id));
        setSelectedAgentType(null);
        setAgentTypeToDelete(null);
        toast.success(`✅ ${result.message}`);
      } else {
        toast.error(`❌ ${result.message}`);
      }
    } catch (error) {
      toast.error(`❌ Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    }
  }, [agentTypeToDelete]);

  const handleToggleActive = useCallback(async (type: AgentType) => {
    try {
      const result = await updateAgentTypeAction(type.id, { is_active: !type.is_active });
      if (result.success) {
        setAgentTypes((prev) =>
          prev.map((t) => (t.id === type.id ? { ...t, is_active: !t.is_active } : t)),
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
            setIsFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Novo Tipo
        </Button>
      </div>

      {/* KPIs */}
      {agentTypes.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
          <div className="flex items-center gap-2 text-sm font-semibold">
            <AlertCircle className="h-4 w-4" />
            Sobre Tipos de Agentes
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Tipos de agentes são categorias que padronizam a configuração e o comportamento dos
            agentes. Cada tipo pode ter modelos padrão, temperatura e outras configurações
            pré-definidas. Tipos marcados com 🔒 são do sistema e não podem ser editados.
          </p>
        </CardContent>
      </Card>

      {/* ViewModeBar + FilterBar */}
      <div className="space-y-3">
        <ViewModeBar
          moduleId="agent-types"
          registry={registry}
          activeViewMode={viewMode}
          onViewModeChange={setViewMode}
        />
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
      </div>

      {/* Results */}
      {filteredData.length === 0 ? (
        <EmptyState
          title={
            agentTypes.length === 0
              ? 'Nenhum tipo de agente cadastrado'
              : 'Nenhum resultado encontrado'
          }
          description={
            agentTypes.length === 0
              ? 'Crie o primeiro tipo de agente para organizar seus agentes de IA.'
              : 'Tente ajustar ou limpar os filtros aplicados.'
          }
          actionLabel={agentTypes.length === 0 ? 'Criar Tipo' : undefined}
          onAction={agentTypes.length === 0 ? () => setIsFormOpen(true) : undefined}
        />
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
                    setAgentTypes((prev) => prev.map((t) => (t.id === type.id ? result.data! : t)));
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
                    <p className="font-mono text-xs text-muted-foreground">{item.subtitle}</p>
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
                <AgentTypeListItem
                  key={type.id}
                  type={type}
                  isSelected={selectedAgentType?.id === type.id}
                  onSelect={setSelectedAgentType}
                  onToggleActive={handleToggleActive}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SplitView */}
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
              !selectedAgentType.is_system ? () => handleOpenEdit(selectedAgentType) : undefined
            }
          />
        )}
      </SplitView>

      {/* Create/Edit Dialog */}
      <AgentTypeFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetForm();
            setEditingType(null);
          }
          setIsFormOpen(open);
        }}
        editingType={editingType}
        formData={formData}
        onFormDataChange={handleFormDataChange}
        onNameChange={handleNameChange}
        onSubmit={editingType ? handleUpdate : handleCreate}
        isLoading={isLoading}
        providers={providers}
        modelsByProvider={modelsByProvider}
        onLoadModels={loadModelsForProvider}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!agentTypeToDelete}
        onOpenChange={(open) => !open && setAgentTypeToDelete(null)}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Deseja excluir o tipo &quot;{agentTypeToDelete?.name}&quot;? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAgentTypeToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => void handleConfirmDelete()}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
