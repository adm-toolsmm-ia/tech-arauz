'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { KanbanBoard, type KanbanItem, type KanbanColumn } from '@/components/views/KanbanBoard';
import type { UIAgent } from '@/lib/transformers/agent';

const AGENT_COLUMNS: KanbanColumn[] = [
  { id: 'draft', title: 'Rascunho', color: 'amber' },
  { id: 'published', title: 'Publicado', color: 'green' },
  { id: 'deprecated', title: 'Deprecado', color: 'gray' },
];

interface AgentsKanbanViewProps {
  agents: UIAgent[];
  selectedId?: string;
  onAgentClick: (agent: UIAgent) => void;
}

export function AgentsKanbanView({ agents, selectedId, onAgentClick }: AgentsKanbanViewProps) {
  const kanbanItems: KanbanItem[] = React.useMemo(
    () =>
      agents.map((a) => ({
        id: a.id,
        title: a.name,
        subtitle: a.description || undefined,
        status: a.status || 'draft',
        metadata: {
          agentType: a.agentType,
          modelId: a.modelId,
          executionCount: a.executionCount,
        },
      })),
    [agents],
  );

  const handleItemClick = (item: KanbanItem) => {
    const agent = agents.find((a) => a.id === item.id);
    if (agent) onAgentClick(agent);
  };

  return (
    <KanbanBoard
      columns={AGENT_COLUMNS}
      items={kanbanItems}
      selectedId={selectedId}
      readOnly
      onItemClick={handleItemClick}
      renderItemContent={(item) => {
        const agent = agents.find((a) => a.id === item.id);
        if (!agent) return null;
        return <AgentKanbanCard agent={agent} />;
      }}
      emptyMessage="Nenhum agente encontrado."
    />
  );
}

function AgentKanbanCard({ agent }: { agent: UIAgent }) {
  return (
    <div className="space-y-1.5">
      <span className="line-clamp-2 text-sm font-semibold leading-tight text-foreground/90">
        {agent.name}
      </span>
      {agent.description && (
        <p className="line-clamp-2 text-[11px] text-muted-foreground">{agent.description}</p>
      )}
      <div className="flex flex-wrap gap-1">
        <Badge
          variant={agent.usageType === 'chatbot' ? 'default' : 'secondary'}
          className="px-1.5 py-0 text-[10px]"
        >
          {agent.usageType === 'chatbot' ? '🗨️ CB' : '⚙️ WF'}
        </Badge>
        <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
          {agent.agentType}
        </Badge>
        <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
          {agent.modelId}
        </Badge>
      </div>
    </div>
  );
}
