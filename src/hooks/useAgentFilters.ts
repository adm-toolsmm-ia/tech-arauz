'use client';

import { useState, useMemo } from 'react';
import type { UIAgent } from '@/lib/transformers/agent';

export interface AgentFilters {
  status?: 'draft' | 'published' | 'deprecated';
  agentType?: string;
  searchTerm?: string;
  tag?: string;
}

export function useAgentFilters(agents: UIAgent[]) {
  const [filters, setFilters] = useState<AgentFilters>({});

  const filtered = useMemo(() => {
    return agents.filter((agent) => {
      // Status filter
      if (filters.status && agent.status !== filters.status) {
        return false;
      }

      // Agent type filter
      if (filters.agentType && agent.agentType !== filters.agentType) {
        return false;
      }

      // Search term
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        const matchesName = agent.name.toLowerCase().includes(term);
        const matchesSlug = agent.slug.toLowerCase().includes(term);
        const matchesDesc = agent.description.toLowerCase().includes(term);

        if (!matchesName && !matchesSlug && !matchesDesc) {
          return false;
        }
      }

      // Tag filter
      if (filters.tag && !agent.tags.includes(filters.tag)) {
        return false;
      }

      return true;
    });
  }, [agents, filters]);

  return {
    filters,
    setFilters,
    filtered,
    totalAgents: agents.length,
    filteredCount: filtered.length,
  };
}
