'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus } from 'lucide-react';
import { getChatbotAgents } from '../actions';
import type { AgentHead } from '@/types/agents';

// Map AgentHead to simpler Agent interface for UI
interface Agent {
  id: string;
  name: string;
  description?: string;
  is_global_chatbot: boolean;
}

interface AgentSelectorProps {
  selectedAgent: Agent | null;
  onAgentSelect: (agent: Agent) => void;
  isLoading?: boolean;
}

/**
 * AgentSelector: Component to select from available chatbot agents
 *
 * Fetches agents where is_global_chatbot = true
 * Displays as dropdown with agent name and description
 */
export function AgentSelector({
  selectedAgent,
  onAgentSelect,
  isLoading = false,
}: AgentSelectorProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available agents on mount
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setIsFetching(true);
        setError(null);

        // Call server action to fetch global chatbot agents
        const agentHeads = await getChatbotAgents();

        // Transform AgentHead to Agent interface
        const transformedAgents: Agent[] = agentHeads.map((head: AgentHead) => ({
          id: head.id,
          name: head.name,
          description: `Published · v${head.current_version || '1.0.0'}`,
          is_global_chatbot: head.is_global_chatbot ?? false,
        }));

        setAgents(transformedAgents);
        setIsFetching(false);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch agents';
        console.error('Agent fetch error:', errorMsg);
        setError(errorMsg);
        setIsFetching(false);
      }
    };

    fetchAgents();
  }, []);

  if (isFetching || isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
        {error}
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="text-xs text-muted-foreground">No agents available</div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Select value={selectedAgent?.id || ''} onValueChange={(agentId) => {
        const agent = agents.find((a) => a.id === agentId);
        if (agent) onAgentSelect(agent);
      }}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose an agent..." />
        </SelectTrigger>
        <SelectContent>
          {agents.map((agent) => (
            <SelectItem key={agent.id} value={agent.id}>
              {agent.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedAgent && (
        <div className="text-xs text-muted-foreground">
          {selectedAgent.description}
        </div>
      )}

      {/* TODO: New chat button will go here in Phase 2 */}
    </div>
  );
}
