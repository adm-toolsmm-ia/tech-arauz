/**
 * Frontend-visible logging service for Espaider v2 sync runs.
 *
 * Writes to:
 * - sync_logs: one summary row per sync run (for the summary endpoint)
 * - integration_log_entries: individual log events (for the log viewer)
 *
 * Never throws — logging failures are printed but must not halt the sync.
 * Dataset names are mapped from v2 internal labels to CHECK-constraint-valid values.
 *
 * @see Story 19.6
 * @see supabase/migrations/079_expand_dataset_constraints_espaider_v2.sql
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { SyncV2ParentResult } from './espaider-v2-sync';
import type { SyncChildrenResult } from './espaider-v2-children-sync';
import { CHILD_IDENTIFIERS } from '@/integrations/espaider-v2/schemas';

// =============================================================================
// Dataset name mapping (internal → frontend-visible CHECK-valid values)
// =============================================================================

const CHILD_IDENTIFIER_TO_DATASET: Record<string, string> = {
  [CHILD_IDENTIFIERS.CRONOGRAMAS]: 'Cronogramas-v2',
  [CHILD_IDENTIFIERS.ENTREGAS]: 'Entregas-v2',
  [CHILD_IDENTIFIERS.REQUISITOS]: 'Requisitos-v2',
  [CHILD_IDENTIFIERS.HISTORICOS]: 'Historicos-v2',
  [CHILD_IDENTIFIERS.ORCAMENTOS]: 'Orcamentos-v2',
  [CHILD_IDENTIFIERS.APROVADORES]: 'Aprovadores-v2',
  [CHILD_IDENTIFIERS.TEMPOSPERMANCENCIA]: 'TempoPermanencia-v2',
  [CHILD_IDENTIFIERS.HORASLANCADAS]: 'HorasLancadas-v2',
};

function mapDatasetLabel(internalLabel: string): string {
  if (internalLabel === 'Projetos-v2') return 'Projetos-v2';
  if (internalLabel === 'Children-v2') return 'Geral-v2';
  return CHILD_IDENTIFIER_TO_DATASET[internalLabel] ?? 'Geral-v2';
}

// =============================================================================
// Types
// =============================================================================

interface SyncLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  dataset: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PersistV2SyncLogsParams {
  supabase: SupabaseClient;
  tenantId: string;
  requestId: string;
  startedAt: Date;
  parentResult?: SyncV2ParentResult;
  childrenResult?: SyncChildrenResult;
}

export interface PersistV2SyncLogsResult {
  syncLogId: string | null;
  logsPersisted: number;
  logsFailed: number;
}

// =============================================================================
// Main export: persist v2 sync run to frontend-visible tables
// =============================================================================

export async function persistV2SyncLogs(
  params: PersistV2SyncLogsParams,
): Promise<PersistV2SyncLogsResult> {
  const { supabase, tenantId, requestId, startedAt, parentResult, childrenResult } = params;

  let syncLogId: string | null = null;

  // 1. Write sync_logs summary row
  try {
    const completedAt = new Date();
    const durationMs = completedAt.getTime() - startedAt.getTime();

    const totalNew = parentResult?.newRecords ?? 0;
    const totalUpdated = parentResult?.updatedRecords ?? 0;
    const totalInvalid = (parentResult?.invalidRecords ?? 0) + (childrenResult?.totalQuarantined ?? 0);
    const parentSuccess = parentResult ? parentResult.success : true;
    const childrenSuccess = childrenResult ? childrenResult.success : true;

    const status = !parentSuccess || !childrenSuccess
      ? 'failed'
      : totalInvalid > 0
        ? 'partial'
        : 'success';

    const { data: syncLogRow, error: syncLogError } = await supabase
      .from('sync_logs')
      .insert({
        tenant_id: tenantId,
        request_id: requestId,
        dataset: 'Projetos-v2',
        started_at: startedAt.toISOString(),
        completed_at: completedAt.toISOString(),
        duration_ms: durationMs,
        total_records: totalNew + totalUpdated + totalInvalid,
        new_records: totalNew,
        updated_records: totalUpdated,
        errors: totalInvalid,
        retries: 0,
        status,
        error_message: totalInvalid > 0 ? `${totalInvalid} registros inválidos/quarentenados` : null,
      })
      .select('id')
      .single();

    if (syncLogError) {
      console.error('[v2-logger] Failed to write sync_logs entry:', syncLogError.message);
    } else {
      syncLogId = (syncLogRow as { id: string } | null)?.id ?? null;
    }
  } catch (err) {
    console.error('[v2-logger] Unexpected error writing sync_logs:', err instanceof Error ? err.message : String(err));
  }

  // 2. Collect and map all log entries
  const allLogs: SyncLogEntry[] = [
    ...(parentResult?.logs ?? []),
    ...(childrenResult?.logs ?? []),
  ];

  if (allLogs.length === 0) {
    return { syncLogId, logsPersisted: 0, logsFailed: 0 };
  }

  const rows = allLogs.map((log) => ({
    tenant_id: tenantId,
    sync_log_id: syncLogId,
    request_id: requestId,
    level: log.level,
    dataset: mapDatasetLabel(log.dataset),
    message: log.message,
    details: log.details ?? null,
    logged_at: log.timestamp,
  }));

  // 3. Batch insert to integration_log_entries (100 per batch)
  const BATCH_SIZE = 100;
  let logsPersisted = 0;
  let logsFailed = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    try {
      const { error } = await supabase.from('integration_log_entries').insert(batch);
      if (error) {
        console.error('[v2-logger] Failed to insert log batch:', error.message);
        logsFailed += batch.length;
      } else {
        logsPersisted += batch.length;
      }
    } catch (err) {
      console.error('[v2-logger] Unexpected error inserting log batch:', err instanceof Error ? err.message : String(err));
      logsFailed += batch.length;
    }
  }

  return { syncLogId, logsPersisted, logsFailed };
}
