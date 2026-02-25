'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { AgentKPIs } from '@/components/agents/AgentKPIs';
import { AgentCard } from '@/components/agents/AgentCard';
import { CreateAgentDialog } from '@/components/agents/CreateAgentDialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Grid3x3,
  List,
  Filter,
  Search,
  Download,
  Upload,
  Bot,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAgentFilters } from '@/hooks/useAgentFilters';
import { AgentSupabaseService } from '@/services/agents/agentSupabaseService';
import type { UIAgent } from '@/lib/transformers/agent';

interface AgentsContentProps {
  agents: UIAgent[];
}

type ViewMode = 'grid' | 'list';

export function AgentsContent({ agents: initialAgents }: AgentsContentProps) {
  const router = useRouter();
  const [agents, setAgents] = React.useState(initialAgents);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isDeleting, setIsDeleting] = useState(false);
  const { filters, setFilters, filtered } = useAgentFilters(agents);

  const handleRefresh = () => {
    router.refresh();
    toast.success('✅ Agentes recarregados!');
  };

  const handleDelete = async (agent: UIAgent) => {
    if (!confirm(`Tem certeza que deseja deletar "${agent.name}"?\n\nEsta ação não pode ser desfeita!`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await AgentSupabaseService.deleteAgent(agent.id);
      setAgents((prev) => prev.filter((a) => a.id !== agent.id));
      toast.success(`✅ Agente "${agent.name}" deletado!`);
      router.refresh();
    } catch (error) {
      toast.error(
        `❌ Erro ao deletar: ${error instanceof Error ? error.message : 'desconhecido'}`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/agentes/${id}`);
  };

  const handleDuplicate = async (agent: UIAgent) => {
    try {
      await AgentSupabaseService.createAgent({
        name: `${agent.name} (Cópia)`,
        slug: `${agent.slug}-copy-${Date.now()}`,
        description: agent.description,
        agent_type: agent.agentType,
        model_provider: agent.fullConfig.modelProvider,
        model_id: agent.modelId,
        model_temperature: agent.fullConfig.modelTemperature,
        model_max_tokens: agent.fullConfig.modelMaxTokens,
      });
      toast.success(`✅ Agente "${agent.name}" duplicado!`);
      router.refresh();
    } catch (error) {
      toast.error(
        `❌ Erro ao duplicar: ${error instanceof Error ? error.message : 'desconhecido'}`
      );
    }
  };

  const AGENT_TYPES = [
    { value: 'status-report', label: '📊 Status Report' },
    { value: 'requirements', label: '📋 Requisitos' },
    { value: 'analysis', label: '🔍 Análise' },
    { value: 'custom', label: '⚙️ Custom' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <DashboardHeader
          title="Gestão 360° de Agentes AI"
          subtitle="Crie, configure, monitore e gerencie seus agentes de inteligência artificial"
        />
        <CreateAgentDialog onSuccess={() => router.refresh()} />
      </div>

      {/* KPIs */}
      {agents.length > 0 && <AgentKPIs agents={agents} />}

      {/* Filters & Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Top Row: Search + Controls */}
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nome, slug ou descrição..."
                    value={filters.searchTerm || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, searchTerm: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Mais Opções
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="cursor-pointer">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Importar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="sm" onClick={handleRefresh}>
                Recarregar
              </Button>
            </div>

            {/* Second Row: Filters */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Status
                </label>
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      status: value as 'draft' | 'published' | 'deprecated' | undefined,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="draft">📝 Rascunho</SelectItem>
                    <SelectItem value="published">✅ Publicado</SelectItem>
                    <SelectItem value="deprecated">⛔ Deprecado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Tipo
                </label>
                <Select
                  value={filters.agentType || ''}
                  onValueChange={(value) =>
                    setFilters({ ...filters, agentType: value || undefined })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {AGENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 items-end">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                  <TabsList className="w-full">
                    <TabsTrigger value="grid" className="gap-1">
                      <Grid3x3 className="h-4 w-4" />
                      <span className="hidden sm:inline">Grid</span>
                    </TabsTrigger>
                    <TabsTrigger value="list" className="gap-1">
                      <List className="h-4 w-4" />
                      <span className="hidden sm:inline">Lista</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
              Mostrando {filtered.length} de {agents.length} agentes
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agents View */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <Bot className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum agente encontrado</h3>
              <p className="text-sm text-muted-foreground">
                {agents.length === 0
                  ? 'Crie seu primeiro agente para começar!'
                  : 'Ajuste os filtros e tente novamente.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onEdit={() => handleEdit(agent.id)}
              onDelete={() => handleDelete(agent)}
              onDuplicate={() => handleDuplicate(agent)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((agent) => (
            <Card
              key={agent.id}
              className="cursor-pointer hover:shadow-md transition-all"
              onClick={() => handleEdit(agent.id)}
            >
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{agent.name}</h3>
                    <p className="text-sm text-muted-foreground">{agent.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className="text-xs">
                      {agent.agentType}
                    </Badge>
                    <Badge
                      variant={
                        agent.status === 'published' ? 'default' : 'secondary'
                      }
                    >
                      {agent.status === 'draft' && '📝 Rascunho'}
                      {agent.status === 'published' && '✅ Publicado'}
                      {agent.status === 'deprecated' && '⛔ Deprecado'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {agent.executionCount} execuções
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      {/* Handled via native confirm() dialog */}
    </div>
  );
}
