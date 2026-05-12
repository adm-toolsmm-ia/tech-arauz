'use server';

/**
 * Server action: switch Espaider API version for the current user's tenant.
 *
 * Updates espaider_apis.settings.api_version — takes effect on the next sync run.
 * Requires admin role. Rollback: call with version='v1'.
 *
 * @see Story 19.7
 */

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { setApiVersion, getApiVersion } from '@/lib/sync/sync-orchestrator';
import type { ApiVersion } from '@/lib/sync/sync-orchestrator';

export interface SwitchVersionResult {
  success: boolean;
  previousVersion: ApiVersion;
  newVersion: ApiVersion;
  error?: string;
}

export async function switchIntegrationVersion(
  targetVersion: ApiVersion,
): Promise<SwitchVersionResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      previousVersion: 'v1',
      newVersion: targetVersion,
      error: 'Não autenticado',
    };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return {
      success: false,
      previousVersion: 'v1',
      newVersion: targetVersion,
      error: 'Perfil não encontrado',
    };
  }

  if (profile.role !== 'admin') {
    return {
      success: false,
      previousVersion: 'v1',
      newVersion: targetVersion,
      error: 'Apenas administradores podem alterar a versão da integração',
    };
  }

  const serviceClient = createServiceClient();
  const tenantId = profile.tenant_id as string;

  const previousVersion = await getApiVersion(serviceClient, tenantId);
  const result = await setApiVersion(serviceClient, tenantId, targetVersion);

  if (!result.success) {
    return { success: false, previousVersion, newVersion: targetVersion, error: result.error };
  }

  console.info(
    `[version-switch] Tenant ${tenantId}: ${previousVersion} → ${targetVersion} by user ${user.id}`,
  );

  return { success: true, previousVersion, newVersion: targetVersion };
}
