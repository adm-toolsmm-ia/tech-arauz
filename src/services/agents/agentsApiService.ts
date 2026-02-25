/**
 * @file Agents API Service
 * @description HTTP client for agent configuration CRUD operations
 *
 * This service communicates with:
 * - Next.js API routes: /api/agents/*
 * - Supabase via Next.js (authenticated via session)
 *
 * Used by React Query hooks (agentsStore.ts)
 */

import type {
  AgentConfig,
  AgentVersion,
  AgentHead,
  CreateAgentRequest,
  UpdateAgentDraftRequest,
  PublishAgentRequest,
  RollbackAgentRequest,
  ImportAgentRequest,
} from '@/types/agents';

export class AgentServiceError extends Error {
  constructor(
    public message: string,
    public status?: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AgentServiceError';
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    let details: unknown;
    try {
      details = JSON.parse(text);
    } catch {
      details = text;
    }
    throw new AgentServiceError(
      `API error: ${res.statusText}`,
      res.status,
      details,
    );
  }
  return res.json();
}

/**
 * Agents API Service
 * All methods communicate with /api/agents/* endpoints
 */
export const agentsApiService = {
  /**
   * List all agents for current tenant
   */
  async listAgents(filters?: {
    status?: string;
    tag?: string;
    search?: string;
  }): Promise<AgentHead[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.tag) params.append('tag', filters.tag);
    if (filters?.search) params.append('search', filters.search);

    const res = await fetch(`/api/agents${params.size ? `?${params}` : ''}`);
    const data = await handleResponse<{ agents: AgentHead[] }>(res);
    return data.agents;
  },

  /**
   * Get agent by ID (draft or published state)
   */
  async getAgent(id: string): Promise<AgentHead> {
    const res = await fetch(`/api/agents/${id}`);
    const data = await handleResponse<{ agent: AgentHead }>(res);
    return data.agent;
  },

  /**
   * Create new agent (starts as draft)
   */
  async createAgent(request: CreateAgentRequest): Promise<AgentHead> {
    const res = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    const data = await handleResponse<{ agent: AgentHead }>(res);
    return data.agent;
  },

  /**
   * Update agent draft
   * Only allowed on draft status agents
   */
  async saveDraft(
    id: string,
    updates: UpdateAgentDraftRequest,
  ): Promise<AgentConfig> {
    const res = await fetch(`/api/agents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await handleResponse<{ agent: AgentConfig }>(res);
    return data.agent;
  },

  /**
   * Delete agent draft
   * Only allowed on unpublished agents
   */
  async deleteDraft(id: string): Promise<void> {
    const res = await fetch(`/api/agents/${id}`, {
      method: 'DELETE',
    });
    await handleResponse<{ ok: boolean }>(res);
  },

  /**
   * Publish agent draft → creates immutable version
   * Auto-increments semver
   */
  async publish(
    id: string,
    request: PublishAgentRequest,
  ): Promise<AgentVersion> {
    const res = await fetch(`/api/agents/${id}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    const data = await handleResponse<{ version: AgentVersion }>(res);
    return data.version;
  },

  /**
   * Rollback agent to previous version
   * Restores draft from version snapshot
   */
  async rollback(id: string, request: RollbackAgentRequest): Promise<void> {
    const res = await fetch(`/api/agents/${id}/rollback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    await handleResponse<{ ok: boolean }>(res);
  },

  /**
   * Export published version as canonical JSON
   * Format for consumption by workflows (Phase 2)
   */
  async exportVersion(id: string): Promise<string> {
    const res = await fetch(`/api/agents/${id}/export`);
    const data = await handleResponse<Record<string, unknown>>(res);
    return JSON.stringify(data, null, 2);
  },

  /**
   * Get all versions of an agent
   */
  async getVersions(id: string): Promise<AgentVersion[]> {
    const res = await fetch(`/api/agents/${id}/versions`);
    const data = await handleResponse<{ versions: AgentVersion[] }>(res);
    return data.versions;
  },

  /**
   * Import canonical JSON → creates draft
   * Validates structure before importing
   */
  async importVersion(json: string): Promise<AgentHead> {
    const parsed = JSON.parse(json);
    const res = await fetch('/api/agents/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed),
    });
    const data = await handleResponse<{ agent: AgentHead }>(res);
    return data.agent;
  },

  /**
   * Duplicate published agent as new draft
   */
  async duplicateAsDraft(id: string): Promise<AgentHead> {
    const res = await fetch(`/api/agents/${id}/duplicate`, {
      method: 'POST',
    });
    const data = await handleResponse<{ agent: AgentHead }>(res);
    return data.agent;
  },
};
