'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Bot } from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { AgentCard, AgentKPIs, type Agent } from '@/components/agents';
import { CreateAgentDialog } from '@/components/agents/CreateAgentDialog';
import { useAgentsList } from '@/services/agents/agentsStore';
import type { AgentHead } from '@/types/agents';

export function AgentsContent() {
  const router = useRouter();
  const { data: agents = [], isLoading, refetch } = useAgentsList();

  const handleAgentClick = (agent: AgentHead | Agent) => {
    router.push(`/agentes/${agent.id}`);
  };

  const handleCreateSuccess = () => {
    refetch();
  };

  // Cast AgentHead to Agent for display (UI only)
  const displayAgents = agents.map((agent) => ({
    id: agent.id,
    name: agent.name,
    slug: agent.slug,
    status: agent.status,
    tags: agent.tags,
    model_id: agent.model_id,
    owners: agent.owners,
    created_at: agent.created_at,
    updated_at: agent.updated_at,
    current_version: agent.current_version,
    description: agent.slug,
    type: 'assistant' as const,
    version: agent.current_version || '0.1.0',
    last_run: null,
    total_runs: 0,
    success_rate: 0,
    avg_latency_ms: 0,
    total_cost_usd: 0,
  })) as Agent[];

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <DashboardHeader
          title="Gestão de Agentes AI"
          subtitle="Monitore e gerencie seus agentes de inteligência artificial"
        />
      </div>

      <div className="flex-1 space-y-6 p-6">
        {/* Header with create button */}
        <div className="flex justify-between items-center">
          <div></div>
          <CreateAgentDialog onSuccess={handleCreateSuccess} />
        </div>

        {/* KPIs */}
        {displayAgents.length > 0 && <AgentKPIs agents={displayAgents} />}

        {/* Agent list */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Carregando agentes...</p>
            </div>
          ) : displayAgents.length === 0 ? (
            <div className="py-12 text-center">
              <Bot className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Nenhum agente encontrado</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Crie seu primeiro agente para começar a gerenciar inteligência artificial.
              </p>
            </div>
          ) : (
            displayAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} onClick={() => handleAgentClick(agent)} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
