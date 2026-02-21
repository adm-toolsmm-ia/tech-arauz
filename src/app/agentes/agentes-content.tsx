'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Bot } from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { AgentCard, AgentKPIs, BudgetGauge, type Agent } from '@/components/agents';

interface BudgetInfo {
  spent_usd: number;
  remaining_usd: number;
  total_agents_cost_usd: number;
  monthly_limit_usd: number;
  usage_percentage: number;
}

interface AgentsContentProps {
  agents: Array<Record<string, unknown>>;
  budget: BudgetInfo;
}

export function AgentsContent({ agents: rawAgents, budget }: AgentsContentProps) {
  const router = useRouter();

  // Cast agents to typed array
  const agents = rawAgents as unknown as Agent[];

  const handleAgentClick = (agent: Agent) => {
    router.push(`/agentes/${agent.id}`);
  };

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Gestão de Agentes AI"
        subtitle="Monitore e gerencie seus agentes de inteligência artificial"
      />

      <div className="flex-1 space-y-6 p-6">
        {/* KPIs */}
        <AgentKPIs agents={agents} />

        {/* Budget */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* Agent list */}
            <div className="space-y-3">
              {agents.length === 0 ? (
                <div className="py-12 text-center">
                  <Bot className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">Nenhum agente encontrado</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    O serviço AI não está disponível ou não há agentes configurados.
                  </p>
                </div>
              ) : (
                agents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} onClick={handleAgentClick} />
                ))
              )}
            </div>
          </div>

          {/* Budget gauge sidebar */}
          <div>
            <BudgetGauge
              spentUsd={budget.total_agents_cost_usd}
              limitUsd={budget.monthly_limit_usd}
              usagePercentage={budget.usage_percentage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
