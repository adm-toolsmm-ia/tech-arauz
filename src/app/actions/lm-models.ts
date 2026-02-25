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

  // Validate tier if present
  const VALID_TIERS = ['entry', 'balanced', 'pro', 'flagship'];
  if (payload.tier && !VALID_TIERS.includes(payload.tier)) {
    return { success: false, message: `Tier inválido. Valores permitidos: ${VALID_TIERS.join(', ')}` };
  }

  // Validate display_order if present (should be a positive number)
  if (payload.display_order != null && payload.display_order < 0) {
    return { success: false, message: 'Display order deve ser um número não-negativo.' };
  }

  // Validate context_window if present (should be a positive number)
  if (payload.context_window != null && payload.context_window < 1) {
    return { success: false, message: 'Context window deve ser um número positivo.' };
  }

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
