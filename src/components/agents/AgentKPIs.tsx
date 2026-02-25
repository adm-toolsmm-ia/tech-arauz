'use client';

import React from 'react';
import { KPICard } from '@/components/dashboard/KPICard';
import { Brain, Zap, CheckCircle2, Clock } from 'lucide-react';
import type { UIAgent } from '@/lib/transformers/agent';

interface AgentKPIsProps {
  agents: UIAgent[];
}

export function AgentKPIs({ agents }: AgentKPIsProps) {
  const totalAgents = agents.length;
  const publishedAgents = agents.filter((a) => a.status === 'published').length;
  const draftAgents = agents.filter((a) => a.status === 'draft').length;
  const totalExecutions = agents.reduce((sum, a) => sum + a.executionCount, 0);

  return (
    <div className="grid grid-cols-4 gap-4">
      <KPICard title="Agentes" value={totalAgents} icon={Brain} subtitle="Total no sistema" />
      <KPICard
        title="Publicados"
        value={publishedAgents}
        icon={CheckCircle2}
        subtitle="Prontos para uso"
      />
      <KPICard title="Rascunhos" value={draftAgents} icon={Clock} subtitle="Em configuração" />
      <KPICard title="Execuções" value={totalExecutions} icon={Zap} subtitle="Total do período" />
    </div>
  );
}
