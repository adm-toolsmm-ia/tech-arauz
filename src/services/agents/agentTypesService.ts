/**
 * @file Agent Types Supabase Service
 * @description Manage agent types (auxiliary reference data)
 */

import { createClient } from '@/lib/supabase/client';
import type { AgentType } from '@/types/agents';

const supabase = createClient();

export class AgentTypesService {
  /**
   * Fetch all agent types for current tenant
   */
  static async listAgentTypes(): Promise<AgentType[]> {
    const { data, error } = await supabase
      .from('agent_types')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch agent types: ${error.message}`);
    }

    return (data as AgentType[]) || [];
  }

  /**
   * Get single agent type by ID
   */
  static async getAgentType(id: string): Promise<AgentType> {
    const { data, error } = await supabase
      .from('agent_types')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch agent type: ${error.message}`);
    }

    return data as AgentType;
  }

  /**
   * Create new agent type (admin only)
   */
  static async createAgentType(data: Omit<AgentType, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>): Promise<AgentType> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const agentTypeData = {
      ...data,
      created_by: user.id,
      updated_by: user.id,
    };

    const { data: created, error } = await supabase
      .from('agent_types')
      .insert([agentTypeData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create agent type: ${error.message}`);
    }

    return created as AgentType;
  }

  /**
   * Update agent type (admin only, cannot modify system types)
   */
  static async updateAgentType(
    id: string,
    updates: Partial<Omit<AgentType, 'id' | 'tenant_id' | 'created_at' | 'created_by'>>
  ): Promise<AgentType> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if type is system type
    const { data: agentType } = await supabase
      .from('agent_types')
      .select('is_system')
      .eq('id', id)
      .single();

    if (agentType?.is_system) {
      throw new Error('Cannot modify system agent types');
    }

    const { data: updated, error } = await supabase
      .from('agent_types')
      .update({
        ...updates,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update agent type: ${error.message}`);
    }

    return updated as AgentType;
  }

  /**
   * Delete agent type (admin only, cannot delete system types)
   */
  static async deleteAgentType(id: string): Promise<void> {
    // Check if type is system type
    const { data: agentType } = await supabase
      .from('agent_types')
      .select('is_system')
      .eq('id', id)
      .single();

    if (agentType?.is_system) {
      throw new Error('Cannot delete system agent types');
    }

    const { error } = await supabase.from('agent_types').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete agent type: ${error.message}`);
    }
  }
}
