/**
 * @file Direct Supabase Agent Service
 * @description Agents management directly via Supabase (bypasses backend API)
 * Used for MVP when backend is unavailable
 */

import { createClient } from '@/lib/supabase/client';
import type { AgentHead, AgentConfig, CreateAgentRequest } from '@/types/agents';

const supabase = createClient();

export class AgentSupabaseService {
  /**
   * Create agent directly in Supabase
   */
  static async createAgent(data: CreateAgentRequest & { owners?: string[] }): Promise<AgentHead> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('No session');
    }

    // Get tenant ID from JWT
    const parts = session.access_token.split('.');
    const payload = JSON.parse(atob(parts[1]));
    const tenantId = payload.tenant_id;

    if (!tenantId) {
      throw new Error('No tenant ID in token');
    }

    const agentId = crypto.randomUUID();
    const now = new Date().toISOString();

    const agentData = {
      id: agentId,
      tenant_id: tenantId,
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      status: 'draft' as const,
      owners: data.owners || [user.email || user.id],
      tags: [],
      model_id: 'gpt-4',
      agent_type: data.agent_type || null,
      created_at: now,
      updated_at: now,
      created_by: user.id,
      updated_by: user.id,
    };

    const { data: created, error } = await supabase
      .from('agents')
      .insert([agentData])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error(`Failed to create agent: ${error.message}`);
    }

    return created as AgentHead;
  }

  /**
   * List all agents for tenant
   */
  static async listAgents(): Promise<AgentHead[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('No session');
    }

    const parts = session.access_token.split('.');
    const payload = JSON.parse(atob(parts[1]));
    const tenantId = payload.tenant_id;

    if (!tenantId) {
      throw new Error('No tenant ID in token');
    }

    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase select error:', error);
      throw new Error(`Failed to list agents: ${error.message}`);
    }

    return (data || []) as AgentHead[];
  }

  /**
   * Get single agent
   */
  static async getAgent(id: string): Promise<AgentHead> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase select error:', error);
      throw new Error(`Failed to get agent: ${error.message}`);
    }

    return data as AgentHead;
  }

  /**
   * Update agent draft
   */
  static async updateAgent(id: string, updates: Partial<AgentConfig>): Promise<AgentHead> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    };

    const { data, error } = await supabase
      .from('agents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      throw new Error(`Failed to update agent: ${error.message}`);
    }

    return data as AgentHead;
  }

  /**
   * Delete agent
   */
  static async deleteAgent(id: string): Promise<void> {
    const { error } = await supabase.from('agents').delete().eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(`Failed to delete agent: ${error.message}`);
    }
  }
}
