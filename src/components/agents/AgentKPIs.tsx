'use client';

import { Bot, Activity, TrendingUp, DollarSign } from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import type { Agent } from './AgentCard';

interface AgentKPIsProps {
  agents: Agent[];
}

export function AgentKPIs({ agents }: AgentKPIsProps) {
  const totalAgents = agents.length;
  const activeAgents = agents.filter((a) => a.status === 'active').length;
  const totalRuns = agents.reduce((sum, a) => sum + a.total_runs, 0);
  const avgSuccessRate =
    agents.length > 0
      ? agents.reduce((sum, a) => sum + a.success_rate, 0) / agents.length
      : 0;
  const totalCost = agents.reduce((sum, a) => sum + a.total_cost_usd, 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Agentes"
        value={totalAgents}
        icon={Bot}
        subtitle={`${activeAgents} ativos`}
      />
      <KPICard
        title="Total de Execuções"
        value={totalRuns}
        icon={Activity}
        trend={{ value: '+12 esta semana', positive: true }}
      />
      <KPICard
        title="Taxa de Sucesso"
        value={`${avgSuccessRate.toFixed(1)}%`}
        icon={TrendingUp}
        trend={{ value: avgSuccessRate >= 90 ? 'Saudável' : 'Atenção', positive: avgSuccessRate >= 90 }}
      />
      <KPICard
        title="Custo Total"
        value={`$${totalCost.toFixed(2)}`}
        icon={DollarSign}
        subtitle="Acumulado este mês"
      />
    </div>
  );
}
