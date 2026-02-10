'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface UpdateStatusResult {
  success: boolean;
  message: string;
}

/**
 * Server Action: update a project's status (e.g. from Kanban drag-and-drop).
 *
 * 1. Validates the authenticated user
 * 2. Checks role (blocks viewer)
 * 3. Updates the project status in the database
 * 4. Revalidates cached pages
 */
export async function updateProjectStatusAction(
  projectId: string,
  newStatus: string
): Promise<UpdateStatusResult> {
  const supabase = await createClient();

  // 1. Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      message: 'Usuário não autenticado. Faça login novamente.',
    };
  }

  // 2. Get tenant_id and role from profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return {
      success: false,
      message: 'Perfil não encontrado. Contate o administrador.',
    };
  }

  // 3. Only admin and user roles can update status
  if (profile.role === 'viewer') {
    return {
      success: false,
      message: 'Sem permissão para alterar status. Role "viewer" é somente leitura.',
    };
  }

  // 4. Validate status value
  const validStatuses = [
    'projeto_futuro',
    'em_aprovacao',
    'em_desenvolvimento',
    'em_homologacao',
    'concluido',
    'cancelado',
    'suspenso',
  ];

  if (!validStatuses.includes(newStatus)) {
    return {
      success: false,
      message: `Status inválido: "${newStatus}". Valores aceitos: ${validStatuses.join(', ')}`,
    };
  }

  // 5. Update in database (RLS ensures tenant isolation)
  const { error: updateError } = await supabase
    .from('projects')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', projectId)
    .eq('tenant_id', profile.tenant_id);

  if (updateError) {
    console.error('[updateProjectStatusAction] error:', updateError);
    return {
      success: false,
      message: `Erro ao atualizar status: ${updateError.message}`,
    };
  }

  // 6. Revalidate pages
  revalidatePath('/projetos');
  revalidatePath('/dashboard');

  return {
    success: true,
    message: 'Status atualizado com sucesso.',
  };
}
