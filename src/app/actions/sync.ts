'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { executeSyncAll, type SyncAllResult } from '@/lib/sync/espaider-sync';

/**
 * Server Action: trigger a full Espaider sync.
 *
 * 1. Validates the authenticated user
 * 2. Resolves tenant_id from their profile
 * 3. Runs executeSyncAll (4 datasets)
 * 4. Revalidates cached pages so the UI shows fresh data
 * 5. Returns the sync result to the caller
 */
export async function syncEspaiderAction(): Promise<SyncAllResult> {
  const supabase = await createClient();

  // 1. Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      datasets: [],
      totalCreated: 0,
      totalUpdated: 0,
      totalErrors: 1,
      durationMs: 0,
      message: 'Usuário não autenticado. Faça login novamente.',
      logs: [],
    };
  }

  // 2. Get tenant_id from profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return {
      success: false,
      datasets: [],
      totalCreated: 0,
      totalUpdated: 0,
      totalErrors: 1,
      durationMs: 0,
      message: 'Perfil não encontrado. Contate o administrador.',
      logs: [],
    };
  }

  // 3. Only admin and user roles can sync
  if (profile.role === 'viewer') {
    return {
      success: false,
      datasets: [],
      totalCreated: 0,
      totalUpdated: 0,
      totalErrors: 1,
      durationMs: 0,
      message: 'Sem permissão para sincronizar. Role "viewer" é somente leitura.',
      logs: [],
    };
  }

  // 4. Execute sync using service client (bypasses RLS for data operations)
  const serviceClient = createServiceClient();
  try {
    const result = await executeSyncAll(serviceClient, profile.tenant_id);

    // 5. Revalidate pages so fresh data is shown
    revalidatePath('/dashboard');
    revalidatePath('/projetos');

    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido na sincronização';
    console.error('[syncEspaiderAction] error:', err);

    return {
      success: false,
      datasets: [],
      totalCreated: 0,
      totalUpdated: 0,
      totalErrors: 1,
      durationMs: 0,
      message: `Erro na sincronização: ${message}`,
      logs: [],
    };
  }
}
