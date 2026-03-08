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
  payload: Omit<
    LmModel,
    'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'
  >,
): Promise<LmModelActionResult> {
  const supabase = await createClient();

  // Validate tier if present
  const VALID_TIERS = ['entry', 'balanced', 'pro', 'flagship'];
  if (payload.tier && !VALID_TIERS.includes(payload.tier)) {
    return {
      success: false,
      message: `Tier inválido. Valores permitidos: ${VALID_TIERS.join(', ')}`,
    };
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
  revalidatePath('/auxiliares/modelos-ia');
  return { success: true, message: `Modelo "${created.name}" criado!`, data: created as LmModel };
}

/**
 * Server Action: Delete LM model
 */
export async function deleteLmModelAction(modelId: string): Promise<LmModelActionResult> {
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

  const { data: existing, error: fetchError } = await supabase
    .from('lm_models')
    .select('id, tenant_id, name, is_system')
    .eq('id', modelId)
    .single();

  if (fetchError || !existing) {
    return { success: false, message: 'Modelo não encontrado.' };
  }

  if (existing.tenant_id !== profile.tenant_id) {
    return { success: false, message: 'Modelo não pertence ao seu tenant.' };
  }

  if (existing.is_system) {
    return { success: false, message: 'Modelos de sistema não podem ser excluídos.' };
  }

  const { error } = await supabase.from('lm_models').delete().eq('id', modelId);

  if (error) {
    return { success: false, message: `Erro ao excluir modelo: ${error.message}` };
  }

  revalidatePath('/auxiliares/lm-providers');
  revalidatePath('/auxiliares/modelos-ia');

  return { success: true, message: `Modelo "${existing.name}" excluído com sucesso.` };
}

/**
 * Server Action: Update LM model (full update for non-system models)
 */
export async function updateLmModelAction(
  id: string,
  updates: Partial<
    Omit<LmModel, 'id' | 'tenant_id' | 'provider_id' | 'created_at' | 'created_by' | 'is_system'>
  >,
): Promise<LmModelActionResult> {
  const supabase = await createClient();

  const VALID_TIERS = ['entry', 'balanced', 'pro', 'flagship'];
  if (updates.tier && !VALID_TIERS.includes(updates.tier)) {
    return {
      success: false,
      message: `Tier inválido. Valores permitidos: ${VALID_TIERS.join(', ')}`,
    };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, message: 'Usuário não autenticado. Faça login novamente.' };
  }

  const { data: existing, error: fetchError } = await supabase
    .from('lm_models')
    .select('id, tenant_id, is_system')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    return { success: false, message: 'Modelo não encontrado.' };
  }

  if (existing.is_system) {
    return { success: false, message: 'Modelos de sistema não podem ser editados.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile || existing.tenant_id !== profile.tenant_id) {
    return { success: false, message: 'Modelo não pertence ao seu tenant.' };
  }

  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, v]) => v !== undefined),
  );
  const { data: updated, error } = await supabase
    .from('lm_models')
    .update({
      ...cleanUpdates,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, message: `Erro ao atualizar modelo: ${error.message}` };
  }

  revalidatePath('/auxiliares/modelos-ia');
  revalidatePath('/auxiliares/lm-providers');
  return { success: true, message: 'Modelo atualizado!', data: updated as LmModel };
}

/**
 * Server Action: Update model display_order (for drag-drop reordering)
 */
export async function updateLmModelDisplayOrderAction(
  modelId: string,
  newDisplayOrder: number,
): Promise<LmModelActionResult> {
  const supabase = await createClient();

  // Validate display_order (should be a non-negative number)
  if (newDisplayOrder < 0) {
    return { success: false, message: 'Display order deve ser um número não-negativo.' };
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

  const { data: model, error: modelError } = await supabase
    .from('lm_models')
    .select('tenant_id')
    .eq('id', modelId)
    .single();

  if (modelError || !model) {
    return { success: false, message: 'Modelo não encontrado.' };
  }

  if (model.tenant_id !== profile.tenant_id) {
    return { success: false, message: 'Modelo não pertence ao seu tenant.' };
  }

  const { data: updated, error } = await supabase
    .from('lm_models')
    .update({ display_order: newDisplayOrder, updated_by: user.id })
    .eq('id', modelId)
    .select()
    .single();

  if (error) {
    return { success: false, message: `Erro ao atualizar modelo: ${error.message}` };
  }

  revalidatePath('/auxiliares/modelos-ia');
  return { success: true, message: 'Ordem atualizada!', data: updated as LmModel };
}

/**
 * Server Action: Bulk update is_active status for multiple models
 */
export async function bulkUpdateLmModelsActiveAction(
  modelIds: string[],
  isActive: boolean,
): Promise<{ success: boolean; message: string; ids?: string[] }> {
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

  const { data: models, error: modelsError } = await supabase
    .from('lm_models')
    .select('id, tenant_id')
    .in('id', modelIds);

  if (modelsError) {
    return { success: false, message: `Erro ao buscar modelos: ${modelsError.message}` };
  }

  const validIds = (models || []).filter((m) => m.tenant_id === profile.tenant_id).map((m) => m.id);

  if (validIds.length === 0) {
    return { success: false, message: 'Nenhum modelo válido encontrado.' };
  }

  const { error } = await supabase
    .from('lm_models')
    .update({ is_active: isActive, updated_by: user.id })
    .in('id', validIds);

  if (error) {
    return { success: false, message: `Erro ao atualizar modelos: ${error.message}` };
  }

  revalidatePath('/auxiliares/modelos-ia');
  return {
    success: true,
    message: `${validIds.length} modelo(s) ${isActive ? 'ativado(s)' : 'desativado(s)'}!`,
    ids: validIds,
  };
}
