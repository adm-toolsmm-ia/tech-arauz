/**
 * Agent Domain Rules
 *
 * Pure functions for computing agent KPIs and validation rules.
 * Extracted from agentes-content.tsx (Story 2.6).
 */

export interface AgentLike {
  status?: string | null;
  agentType?: string | null;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
}

export interface AgentKpis {
  total: number;
  draft: number;
  published: number;
  deprecated: number;
}

export function computeAgentKpis(agents: AgentLike[]): AgentKpis {
  return {
    total: agents.length,
    draft: agents.filter((a) => a.status === 'draft').length,
    published: agents.filter((a) => a.status === 'published').length,
    deprecated: agents.filter((a) => a.status === 'deprecated').length,
  };
}

export function filterAgents<T extends AgentLike>(
  agents: T[],
  opts: { statusFilter?: string; typeFilter?: string; searchTerm?: string },
): T[] {
  return agents.filter((agent) => {
    if (opts.statusFilter && opts.statusFilter !== 'all' && agent.status !== opts.statusFilter) {
      return false;
    }
    if (opts.typeFilter && opts.typeFilter !== 'all' && agent.agentType !== opts.typeFilter) {
      return false;
    }
    if (opts.searchTerm) {
      const term = opts.searchTerm.toLowerCase();
      return (
        (agent.name || '').toLowerCase().includes(term) ||
        (agent.slug || '').toLowerCase().includes(term) ||
        (agent.description || '').toLowerCase().includes(term)
      );
    }
    return true;
  });
}

export function getUniqueAgentTypes(agents: AgentLike[]): string[] {
  const types: string[] = [];
  agents.forEach((a) => {
    if (a.agentType && !types.includes(a.agentType)) {
      types.push(a.agentType);
    }
  });
  return types.sort();
}
