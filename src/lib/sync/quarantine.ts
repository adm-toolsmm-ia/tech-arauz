/**
 * Quarantine service for integration sync.
 *
 * Isolates invalid records with raw payload and traceable reason.
 * Records are written to integration_sync_quarantine table.
 * Never throws — a quarantine failure is logged but does not halt the sync.
 *
 * @see Story 19.5
 * @see supabase/migrations/078_create_integration_sync_quarantine.sql
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export type QuarantineStage = 'validation' | 'mapping' | 'persistence' | 'parent-link';

export interface QuarantineEntry {
  tenantId: string;
  requestId: string;
  dataset: string;
  stage: QuarantineStage;
  rawPayload: unknown;
  reason: string;
}

export interface QuarantineResult {
  quarantined: number;
  failed: number;
}

/**
 * Writes a batch of quarantine entries to the DB.
 * Errors are logged but never propagated — quarantine failures must not stop the sync run.
 */
export async function writeQuarantine(
  supabase: SupabaseClient,
  entries: QuarantineEntry[],
): Promise<QuarantineResult> {
  if (entries.length === 0) return { quarantined: 0, failed: 0 };

  const rows = entries.map((e) => ({
    tenant_id: e.tenantId,
    request_id: e.requestId,
    dataset: e.dataset,
    stage: e.stage,
    raw_payload: e.rawPayload as Record<string, unknown>,
    reason: e.reason,
  }));

  try {
    const { error } = await supabase.from('integration_sync_quarantine').insert(rows);

    if (error) {
      console.error('[quarantine] Failed to write quarantine entries:', error.message);
      return { quarantined: 0, failed: entries.length };
    }

    return { quarantined: entries.length, failed: 0 };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[quarantine] Unexpected error:', msg);
    return { quarantined: 0, failed: entries.length };
  }
}

/**
 * Writes a single quarantine entry. Convenience wrapper around writeQuarantine.
 */
export async function quarantineRecord(
  supabase: SupabaseClient,
  entry: QuarantineEntry,
): Promise<void> {
  await writeQuarantine(supabase, [entry]);
}

/**
 * Formats validation errors into a traceable quarantine reason string.
 */
export function formatValidationReason(
  errors: Array<{ path: string; message: string }>,
): string {
  return errors.map((e) => `${e.path || 'root'}: ${e.message}`).join('; ');
}
