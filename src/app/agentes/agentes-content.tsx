'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { KPICard } from '@/components/dashboard/KPICard';
import { CreateAgentDialog } from '@/components/agents/CreateAgentDialog';
import { AgentCockpit } from '@/components/agents/AgentCockpit';
import { AgentEditSheet } from '@/components/agents/AgentEditSheet';
import { SplitView } from '@/components/views/SplitView';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/badge';
import { FilterBar } from '@/components/filters/FilterBar';
import { ViewModeBar } from '@/components/filters/ViewModeBar';
import { Bot, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AgentSupabaseService } from '@/services/agents/agentSupabaseService';
import type { UIAgent } from '@/lib/transformers/agent';
import type { LmProvider } from '@/types/agents';
import { computeAgentKpis } from '@/lib/domain/agent-rules';
import { useAgentesFilters } from '@/hooks/useAgentesFilters';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { AgentsKanbanView } from './components/AgentsKanbanView';

interface AgentsContentProps {
  agents: UIAgent[];
  providers?: LmProvider[];
  agentTypes?: any[];
}

export function AgentsContent({
  agents: initialAgents,
  providers = [],
  agentTypes = [],
}: AgentsContentProps) {
  const router = useRouter();
  const [agents, setAgents] = useState(initialAgents);
  const [selectedAgent, setSelectedAgent] = useState<UIAgent | null>(null);
  const [editingAgent, setEditingAgent] = useState<UIAgent | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setAgents(initialAgents);
  }, [initialAgents]);

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
  } = useAgentesFilters(agents);

  const kpis = useMemo(() => computeAgentKpis(agents), [agents]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      router.refresh();
      toast.success('✅ Agentes recarregados!');
    } catch (error) {
      toast.error('❌ Erro ao recarregar');
    } finally {
      setIsRefreshing(false);
    }
  }, [router]);

  // Handle delete
  const handleDelete = useCallback(async (agent: UIAgent) => {
    if (!confirm(`Tem certeza que deseja deletar "${agent.name}"?`)) return;
    try {
      await AgentSupabaseService.deleteAgent(agent.id);
      setAgents((prev) => prev.filter((a) => a.id !== agent.id));
      setSelectedAgent(null);
      toast.success(`✅ Agente "${agent.name}" deletado!`);
    } catch (error) {
      toast.error(`❌ Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    }
  }, []);

  // Handle status change
  const handleStatusChange = useCallback(async (agentId: string, newStatus: string) => {
    try {
      await AgentSupabaseService.updateAgent(agentId, { status: newStatus as any });
      setAgents((prev) =>
        prev.map((a) => (a.id === agentId ? { ...a, status: newStatus as any } : a)),
      );
      toast.success('✅ Status atualizado!');
    } catch (error) {
      toast.error(`❌ Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    }
  }, []);

  // Handle agent saved from edit sheet
  const handleAgentSaved = (updated: UIAgent) => {
    setAgents((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setSelectedAgent(updated); // atualiza cockpit com dados novos
    setEditingAgent(null);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <DashboardHeader
          title="Gestão 360° de Agentes AI"
          subtitle="Crie, configure, monitore e gerencie seus agentes"
        />
        <CreateAgentDialog providers={providers} onSuccess={() => router.refresh()} />
      </div>

      {/* KPIs */}
      {agents.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            icon={Bot}
            title="Total"
            value={kpis.total}
            trend={{ value: '0', positive: false }}
          />
          <KPICard
            icon={Bot}
            title="Rascunho"
            value={kpis.draft}
            trend={{ value: '0', positive: false }}
          />
          <KPICard
            icon={Bot}
            title="Publicado"
            value={kpis.published}
            trend={{ value: '0', positive: true }}
          />
          <KPICard
            icon={Bot}
            title="Deprecado"
            value={kpis.deprecated}
            trend={{ value: '0', positive: false }}
          />
        </div>
      )}


      {/* ViewModeBar + FilterBar + Refresh */}
      <div className="space-y-3">
        <ViewModeBar
          moduleId="agentes"
          registry={registry}
          activeViewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <FilterBar
            moduleId="agentes"
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
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="mt-4 shrink-0 text-muted-foreground hover:text-foreground"
          title="Atualizar"
        >
          {isRefreshing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          <span className="sr-only sm:not-sr-only">
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </span>
        </Button>
      </div>
      </div>

      {/* Content */}
      {filteredData.length === 0 ? (
        <EmptyState
          icon={Bot}
          title={agents.length === 0 ? 'Nenhum agente criado' : 'Nenhum agente encontrado'}
          description={
            agents.length === 0
              ? 'Crie seu primeiro agente de IA para começar.'
              : 'Ajuste os filtros ou o termo de pesquisa.'
          }
        />
      ) : viewMode === 'list' ? (
        <div className="space-y-2">
          {filteredData.map((agent) => (
            <Card
              key={agent.id}
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => setSelectedAgent(agent)}
            >
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{agent.name}</h3>
                    <p className="text-sm text-muted-foreground">{agent.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{agent.agentType}</Badge>
                    <Badge variant={agent.status === 'published' ? 'default' : 'secondary'}>
                      {agent.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {agent.executionCount} exec
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <AgentsKanbanView
          agents={filteredData}
          selectedId={selectedAgent?.id}
          onAgentClick={setSelectedAgent}
        />
      )}

      {/* SplitView: detalhes do agente */}
      <SplitView
        isOpen={!!selectedAgent}
        onClose={() => setSelectedAgent(null)}
        title={selectedAgent?.name ?? ''}
        subtitle={selectedAgent?.slug}
        width="wide"
      >
        {selectedAgent && (
          <AgentCockpit
            agent={selectedAgent}
            providers={providers}
            agentTypes={agentTypes}
            onEdit={() => setEditingAgent(selectedAgent)}
          />
        )}
      </SplitView>

      {/* EditSheet: edição do agente */}
      <AgentEditSheet
        agent={editingAgent}
        isOpen={!!editingAgent}
        providers={providers}
        onClose={() => setEditingAgent(null)}
        onSaved={handleAgentSaved}
      />
    </div>
  );
}
