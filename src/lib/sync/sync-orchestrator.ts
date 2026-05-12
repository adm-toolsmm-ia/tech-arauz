/**
 * Espaider Sync Orchestrator — v1/v2 Execution Switch.
 *
 * Reads api_version from espaider_apis.settings and routes the sync run to
 * either v1 (executeSyncAll) or v2 (syncV2ParentDataset + syncV2ChildDatasets).
 *
 * The switch is:
 * - tenant-scoped (espaider_apis.settings per tenant)
 * - reversible without code changes (update settings.api_version to "v1")
 * - logged (every run emits which version was active)
 *
 * @see Story 19.7
 * @see supabase/migrations/080_expand_espaider_apis_tipo_v2.sql
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { executeSyncAll } from './espaider-sync';
import { syncV2ParentDataset } from './espaider-v2-sync';
import { syncV2ChildDatasets } from './espaider-v2-children-sync';
import { persistV2SyncLogs } from './logger-v2';
import { generateRequestId } from '@/integrations/espaider-v2/config';

// =============================================================================
// Types
// =============================================================================

export type ApiVersion = 'v1' | 'v2';

export interface OrchestratedSyncResult {
  success: boolean;
  version: ApiVersion;
  requestId: string;
  message: string;
  details: Record<string, unknown>;
}

// =============================================================================
// Version configuration
// =============================================================================

/**
 * Reads the active api_version for the tenant from espaider_apis.settings.
 * Defaults to 'v1' when no setting is found (safe migration default).
 */
export async function getApiVersion(
  supabase: SupabaseClient,
  tenantId: string,
): Promise<ApiVersion> {
  const { data } = await supabase
    .from('espaider_apis')
    .select('settings')
    .eq('tenant_id', tenantId)
    .eq('tipo', 'projetos')
    .eq('is_active', true)
    .maybeSingle();

  const settings = (data?.settings ?? {}) as Record<string, unknown>;
  const version = settings['api_version'];
  return version === 'v2' ? 'v2' : 'v1';
}

/**
 * Updates api_version in espaider_apis.settings for the tenant's projetos row.
 * Used by admin to toggle between v1 and v2 without a redeploy.
 */
export async function setApiVersion(
  supabase: SupabaseClient,
  tenantId: string,
  version: ApiVersion,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: current, error: readError } = await supabase
      .from('espaider_apis')
      .select('id, settings')
      .eq('tenant_id', tenantId)
      .eq('tipo', 'projetos')
      .eq('is_active', true)
      .maybeSingle();

    if (readError) return { success: false, error: readError.message };
    if (!current) return { success: false, error: 'Nenhuma API Projetos ativa encontrada' };

    const existingSettings = (current.settings ?? {}) as Record<string, unknown>;
    const newSettings = { ...existingSettings, api_version: version };

    const { error: updateError } = await supabase
      .from('espaider_apis')
      .update({ settings: newSettings })
      .eq('id', current.id as string);

    if (updateError) return { success: false, error: updateError.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// =============================================================================
// Orchestrated sync execution
// =============================================================================

/**
 * Runs the Espaider sync using whichever version is configured for the tenant.
 * V1: delegates to executeSyncAll (existing v1 flow).
 * V2: runs parent sync + children sync + persists frontend-visible logs.
 */
export async function runEspaiderSync(
  supabase: SupabaseClient,
  tenantId: string,
): Promise<OrchestratedSyncResult> {
  const version = await getApiVersion(supabase, tenantId);
  const requestId = generateRequestId();
  const startedAt = new Date();

  console.info(
    `[orchestrator] Sync iniciado — version=${version} tenant=${tenantId} requestId=${requestId}`,
  );

  if (version === 'v1') {
    try {
      const result = await executeSyncAll(supabase, tenantId);
      console.info(`[orchestrator] v1 sync completo — success=${result.success}`);
      return {
        success: result.success,
        version: 'v1',
        requestId,
        message: result.message || 'Sincronização v1 concluída.',
        details: {
          totalCreated: result.totalCreated,
          totalUpdated: result.totalUpdated,
          totalErrors: result.totalErrors,
          durationMs: result.durationMs,
          datasets: result.datasets,
        },
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[orchestrator] v1 sync falhou:', msg);
      return {
        success: false,
        version: 'v1',
        requestId,
        message: 'Falha na sincronização v1.',
        details: { error: msg },
      };
    }
  }

  // v2 path: parent + children + logging
  try {
    const parentResult = await syncV2ParentDataset({ supabase, tenantId });

    const childrenResult = await syncV2ChildDatasets({
      supabase,
      tenantId,
      requestId,
      childDatasets: [],
    });

    await persistV2SyncLogs({
      supabase,
      tenantId,
      requestId,
      startedAt,
      parentResult,
      childrenResult,
    });

    const overallSuccess = parentResult.success && childrenResult.success;
    const totalInvalid = parentResult.invalidRecords + childrenResult.totalQuarantined;

    console.info(
      `[orchestrator] v2 sync completo — success=${overallSuccess} new=${parentResult.newRecords} updated=${parentResult.updatedRecords} quarantined=${childrenResult.totalQuarantined}`,
    );

    return {
      success: overallSuccess,
      version: 'v2',
      requestId,
      message: overallSuccess
        ? `Sincronização v2 concluída: ${parentResult.newRecords} novos, ${parentResult.updatedRecords} atualizados${totalInvalid > 0 ? `, ${totalInvalid} quarentenados` : ''}.`
        : 'Sincronização v2 completada com erros.',
      details: {
        newRecords: parentResult.newRecords,
        updatedRecords: parentResult.updatedRecords,
        invalidRecords: parentResult.invalidRecords,
        pagesFetched: parentResult.pagesFetched,
        childDatasets: childrenResult.datasets.length,
        totalQuarantined: childrenResult.totalQuarantined,
        durationMs: Date.now() - startedAt.getTime(),
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[orchestrator] v2 sync falhou:', msg);
    return {
      success: false,
      version: 'v2',
      requestId,
      message: 'Falha na sincronização v2.',
      details: { error: msg },
    };
  }
}
