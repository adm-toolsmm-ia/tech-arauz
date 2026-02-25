'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { AgentType } from '@/types/agents';

export interface AgentTypeActionResult {
  success: boolean;
  message: string;
  data?: AgentType;
}

/**
 * Server Action: Create new agent type
 */
export async function createAgentTypeAction(
  payload: Omit<AgentType, 'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>,
): Promise<AgentTypeActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, message: 'Usuário não autenticado. Faça login novamente.' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile?.tenant_id) {
    return { success: false, message: 'Perfil não encontrado. Contate o administrador.' };
  }

  const agentTypeData = {
    ...payload,
    tenant_id: profile.tenant_id,
    created_by: user.id,
    updated_by: user.id,
  };

  const { data: created, error } = await supabase
    .from('agent_types')
    .insert([agentTypeData])
    .select()
    .single();

  if (error) {
    return { success: false, message: `Erro ao criar tipo: ${error.message}` };
  }

  revalidatePath('/auxiliares/agent-types');
  return { success: true, message: `Tipo "${created.name}" criado!`, data: created as AgentType };
}

/**
 * Server Action: Update agent type
 */
export async function updateAgentTypeAction(
  id: string,
  updates: Partial<Omit<AgentType, 'id' | 'tenant_id' | 'created_at' | 'created_by'>>,
): Promise<AgentTypeActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, message: 'Usuário não autenticado. Faça login novamente.' };
  }

  const { data: existing, error: fetchError } = await supabase
    .from('agent_types')
    .select('is_system')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    return { success: false, message: 'Tipo não encontrado.' };
  }

  if (existing.is_system) {
    return { success: false, message: 'Tipos de sistema não podem ser editados.' };
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
    return { success: false, message: `Erro ao atualizar tipo: ${error.message}` };
  }

  revalidatePath('/auxiliares/agent-types');
  return { success: true, message: 'Status atualizado!', data: updated as AgentType };
}

/**
 * Server Action: Delete agent type
 */
export async function deleteAgentTypeAction(id: string): Promise<AgentTypeActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, message: 'Usuário não autenticado. Faça login novamente.' };
  }

  const { data: existing, error: fetchError } = await supabase
    .from('agent_types')
    .select('name, is_system')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    return { success: false, message: 'Tipo não encontrado.' };
  }

  if (existing.is_system) {
    return { success: false, message: 'Tipos de sistema não podem ser deletados.' };
  }

  const { error } = await supabase.from('agent_types').delete().eq('id', id);

  if (error) {
    return { success: false, message: `Erro ao deletar tipo: ${error.message}` };
  }

  revalidatePath('/auxiliares/agent-types');
  return { success: true, message: `Tipo "${existing.name}" deletado!` };
}
