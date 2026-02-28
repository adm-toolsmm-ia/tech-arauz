'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { LmProvider } from '@/types/agents';

export interface LmProviderActionResult {
  success: boolean;
  message: string;
  data?: LmProvider;
}

/**
 * Server Action: Create new LM provider
 */
export async function createLmProviderAction(
  payload: Omit<
    LmProvider,
    'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'
  >,
): Promise<LmProviderActionResult> {
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

  const providerData = {
    ...payload,
    tenant_id: profile.tenant_id,
    created_by: user.id,
    updated_by: user.id,
  };

  const { data: created, error } = await supabase
    .from('lm_providers')
    .insert([providerData])
    .select()
    .single();

  if (error) {
    return { success: false, message: `Erro ao criar provedor: ${error.message}` };
  }

  revalidatePath('/auxiliares/lm-providers');
  return {
    success: true,
    message: `Provedor "${created.name}" criado!`,
    data: created as LmProvider,
  };
}

/**
 * Server Action: Update LM provider
 */
export async function updateLmProviderAction(
  id: string,
  updates: Partial<Omit<LmProvider, 'id' | 'tenant_id' | 'created_at' | 'created_by'>>,
): Promise<LmProviderActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, message: 'Usuário não autenticado. Faça login novamente.' };
  }

  const { data: existing, error: fetchError } = await supabase
    .from('lm_providers')
    .select('is_system')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    return { success: false, message: 'Provedor não encontrado.' };
  }

  if (existing.is_system) {
    return { success: false, message: 'Provedores de sistema não podem ser editados.' };
  }

  const { data: updated, error } = await supabase
    .from('lm_providers')
    .update({
      ...updates,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, message: `Erro ao atualizar provedor: ${error.message}` };
  }

  revalidatePath('/auxiliares/lm-providers');
  return { success: true, message: 'Status atualizado!', data: updated as LmProvider };
}

/**
 * Server Action: Delete LM provider
 */
export async function deleteLmProviderAction(id: string): Promise<LmProviderActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, message: 'Usuário não autenticado. Faça login novamente.' };
  }

  const { data: existing, error: fetchError } = await supabase
    .from('lm_providers')
    .select('name, is_system')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    return { success: false, message: 'Provedor não encontrado.' };
  }

  if (existing.is_system) {
    return { success: false, message: 'Provedores de sistema não podem ser deletados.' };
  }

  const { error } = await supabase.from('lm_providers').delete().eq('id', id);

  if (error) {
    return { success: false, message: `Erro ao deletar provedor: ${error.message}` };
  }

  revalidatePath('/auxiliares/lm-providers');
  return { success: true, message: `Provedor "${existing.name}" deletado!` };
}
