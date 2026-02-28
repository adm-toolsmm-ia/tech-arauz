'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { KPICard } from '@/components/dashboard/KPICard';
import { CreateAgentDialog } from '@/components/agents/CreateAgentDialog';
import { AgentCockpit } from '@/components/agents/AgentCockpit';
import { SplitView } from '@/components/views/SplitView';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bot, RefreshCw, Grid3X3, LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';
import { AgentSupabaseService } from '@/services/agents/agentSupabaseService';
import type { UIAgent } from '@/lib/transformers/agent';
import type { LmProvider } from '@/types/agents';
import { computeAgentKpis, filterAgents, getUniqueAgentTypes } from '@/lib/domain/agent-rules';

interface AgentsContentProps {
  agents: UIAgent[];
  providers?: LmProvider[];
}

type ViewMode = 'kanban' | 'list' | 'grid';

export function AgentsContent({ agents: initialAgents, providers = [] }: AgentsContentProps) {
  const router = useRouter();
  const [agents, setAgents] = useState(initialAgents);
  const [selectedAgent, setSelectedAgent] = useState<UIAgent | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // KPIs (domain-extracted)
  const kpis = useMemo(() => computeAgentKpis(agents), [agents]);

  // Apply filters & search (domain-extracted)
  const filtered = useMemo(
    () => filterAgents(agents, { statusFilter, typeFilter, searchTerm }),
    [agents, statusFilter, typeFilter, searchTerm],
  );

  // Unique types for filter dropdown (domain-extracted)
  const uniqueTypes = useMemo(() => getUniqueAgentTypes(agents), [agents]);

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

      {/* Filters & View Controls */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Pesquisar agentes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="draft">📝 Rascunho</SelectItem>
              <SelectItem value="published">✅ Publicado</SelectItem>
              <SelectItem value="deprecated">⛔ Deprecado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {uniqueTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="ml-auto flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              title="Visualização de grade"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              title="Visualização em lista"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              title="Visualização Kanban"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Atualizar"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {filtered.length} de {agents.length} agentes
        </p>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
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
          {filtered.map((agent) => (
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
      ) : viewMode === 'kanban' ? (
        <div className="grid auto-cols-max gap-4 overflow-x-auto pb-4">
          {['draft', 'published', 'deprecated'].map((status) => (
            <div key={status} className="min-w-[300px] space-y-3 rounded-lg bg-muted/30 p-3">
              <h3 className="text-sm font-semibold">
                {status === 'draft' && '📝 Rascunho'}
                {status === 'published' && '✅ Publicado'}
                {status === 'deprecated' && '⛔ Deprecado'}
                <span className="ml-2 text-xs text-muted-foreground">
                  ({filtered.filter((a) => a.status === status).length})
                </span>
              </h3>
              <div className="space-y-2">
                {filtered
                  .filter((a) => a.status === status)
                  .map((agent) => (
                    <Card
                      key={agent.id}
                      className="cursor-pointer transition-all hover:shadow-md"
                      onClick={() => setSelectedAgent(agent)}
                    >
                      <CardContent className="pt-4">
                        <h4 className="mb-1 text-sm font-semibold">{agent.name}</h4>
                        <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
                          {agent.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            {agent.agentType}
                          </Badge>
                          <Badge className="text-xs">{agent.modelId}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Grid view (default)
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((agent) => (
            <Card
              key={agent.id}
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => setSelectedAgent(agent)}
            >
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold">{agent.name}</h3>
                    <p className="text-xs text-muted-foreground">{agent.slug}</p>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{agent.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Modelo:</span>
                      <span className="font-mono">{agent.modelId}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Tipo:</span>
                      <Badge variant="outline" className="text-xs">
                        {agent.agentType}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Badge variant={agent.status === 'published' ? 'default' : 'secondary'}>
                      {agent.status}
                    </Badge>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {agent.executionCount} exec
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* SplitView: detalhes do agente */}
      <SplitView
        isOpen={!!selectedAgent}
        onClose={() => setSelectedAgent(null)}
        title={selectedAgent?.name ?? ''}
        subtitle={selectedAgent?.slug}
        width="lg"
      >
        {selectedAgent && (
          <AgentCockpit
            agent={selectedAgent}
            onEdit={() => {
              if (selectedAgent) {
                setSelectedAgent(null);
                router.push(`/agentes/${selectedAgent.id}`);
              }
            }}
          />
        )}
      </SplitView>
    </div>
  );
}
