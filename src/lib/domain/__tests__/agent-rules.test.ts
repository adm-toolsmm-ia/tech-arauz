import { describe, it, expect } from 'vitest';
import {
  computeAgentKpis,
  filterAgents,
  getUniqueAgentTypes,
} from '../agent-rules';
import type { AgentLike } from '../agent-rules';

const agents: AgentLike[] = [
  { name: 'Agent A', slug: 'agent-a', status: 'draft', agentType: 'assistant', description: 'First agent' },
  { name: 'Agent B', slug: 'agent-b', status: 'published', agentType: 'assistant', description: 'Second agent' },
  { name: 'Agent C', slug: 'agent-c', status: 'published', agentType: 'tool', description: 'Tool agent' },
  { name: 'Agent D', slug: 'agent-d', status: 'deprecated', agentType: 'tool', description: null },
];

describe('computeAgentKpis', () => {
  it('computes all status counts', () => {
    const kpis = computeAgentKpis(agents);
    expect(kpis.total).toBe(4);
    expect(kpis.draft).toBe(1);
    expect(kpis.published).toBe(2);
    expect(kpis.deprecated).toBe(1);
  });

  it('handles empty array', () => {
    const kpis = computeAgentKpis([]);
    expect(kpis.total).toBe(0);
    expect(kpis.draft).toBe(0);
  });
});

describe('filterAgents', () => {
  it('filters by status', () => {
    const result = filterAgents(agents, { statusFilter: 'published' });
    expect(result).toHaveLength(2);
  });

  it('filters by type', () => {
    const result = filterAgents(agents, { typeFilter: 'tool' });
    expect(result).toHaveLength(2);
  });

  it('filters by search term', () => {
    const result = filterAgents(agents, { searchTerm: 'first' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Agent A');
  });

  it('combines filters', () => {
    const result = filterAgents(agents, { statusFilter: 'published', typeFilter: 'tool' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Agent C');
  });

  it('returns all when all filters are "all"', () => {
    const result = filterAgents(agents, { statusFilter: 'all', typeFilter: 'all' });
    expect(result).toHaveLength(4);
  });
});

describe('getUniqueAgentTypes', () => {
  it('returns sorted unique types', () => {
    const types = getUniqueAgentTypes(agents);
    expect(types).toEqual(['assistant', 'tool']);
  });

  it('handles empty array', () => {
    expect(getUniqueAgentTypes([])).toEqual([]);
  });
});
