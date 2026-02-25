'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { LmModel } from '@/types/agents';

export interface LmModelActionResult {
  success: boolean;
  message: string;
  data?: LmModel;
}

/**
 * Server Action: Create new LM model
 */
export async function createLmModelAction(
  payload: Omit<LmModel, 'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>,
): Promise<LmModelActionResult> {
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

  const { data: provider, error: providerError } = await supabase
    .from('lm_providers')
    .select('tenant_id')
    .eq('id', payload.provider_id)
    .single();

  if (providerError || !provider) {
    return { success: false, message: 'Provedor não encontrado.' };
  }

  if (provider.tenant_id !== profile.tenant_id) {
    return { success: false, message: 'Provedor não pertence ao seu tenant.' };
  }

  const modelData = {
    ...payload,
    tenant_id: profile.tenant_id,
    created_by: user.id,
    updated_by: user.id,
  };

  const { data: created, error } = await supabase
    .from('lm_models')
    .insert([modelData])
    .select()
    .single();

  if (error) {
    return { success: false, message: `Erro ao criar modelo: ${error.message}` };
  }

  revalidatePath('/auxiliares/lm-providers');
  return { success: true, message: `Modelo "${created.name}" criado!`, data: created as LmModel };
}
