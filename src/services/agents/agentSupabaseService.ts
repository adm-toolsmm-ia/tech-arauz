/**
 * @file Direct Supabase Agent Service
 * @description Agents management directly via Supabase (bypasses backend API)
 * Used for MVP when backend is unavailable
 */

import { createClient } from '@/lib/supabase/client';
import type { AgentHead, AgentConfig, CreateAgentRequest } from '@/types/agents';

const supabase = createClient();

/**
 * Serialize prompt_instructions for DB storage (JSON string).
 * Handles array, string, or undefined.
 */
function serializePromptInstructions(
  value: string[] | string | undefined
): string {
  if (value === undefined || value === null) return '[]';
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'string') return value;
  return '[]';
}

/**
 * Extract tenant_id via RLS function (get_user_tenant_id)
 * RLS will enforce tenant isolation automatically
 */
async function getTenantId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Query tenant via RLS - this will use get_user_tenant_id() on the server
  // We fetch from tenants table to get the actual tenant_id
  const { data: userTenants, error } = await supabase
    .from('tenants')
    .select('id')
    .limit(1)
    .single();

  if (error || !userTenants?.id) {
    throw new Error(
      `Failed to get tenant: ${error?.message || 'No tenant found for user'}. Ensure user is assigned to a tenant.`,
    );
  }

  return userTenants.id;
}

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

    const tenantId = await getTenantId();

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
      tags: data.tags ?? [],
      model_provider: data.model_provider || 'openai',
      model_id: data.model_id || 'gpt-4',
      model_temperature: data.model_temperature || 0.7,
      model_max_tokens: data.model_max_tokens || 2000,
      agent_type: data.agent_type || null,
      agent_type_id: data.agent_type_id || null,
      prompt_objective: data.prompt_objective ?? '',
      prompt_instructions: serializePromptInstructions(data.prompt_instructions),
      prompt_template: data.prompt_template ?? '',
      persona: data.persona ?? '',
      usage_type: data.usage_type ?? 'chatbot',
      show_in_shortcut: data.show_in_shortcut ?? false,
      is_global_chatbot: data.is_global_chatbot ?? false,
      requirements: data.requirements ?? [],
      output_schema: data.output_schema ?? null,
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

    const tenantId = await getTenantId();

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
    const { data, error } = await supabase.from('agents').select('*').eq('id', id).single();

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
