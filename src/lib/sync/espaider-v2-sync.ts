/**
 * Espaider v2 Sync Service — Parent Dataset Orchestration.
 *
 * Orchestrates: ConsultarRegistros → validate → map → upsert projects → log.
 *
 * Sync modes:
 * - Bootstrap (full sync): no watermark or explicit `fullSync: true`
 * - Incremental: uses DATAMOVIMENTACAO_DE/ATE based on last successful sync
 *
 * This file owns the parent dataset sync only.
 * Child datasets are handled in espaider-v2-children-sync.ts (Story 19.4).
 *
 * @see Story 19.3
 * @see espaider-v2/client.ts — HTTP transport
 * @see espaider-v2/schemas.ts — validation
 * @see espaider-v2/mappers/project-mapper.ts — domain mapping
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { consultarRegistros } from '@/integrations/espaider-v2/client';
import { validateProjetoRecord } from '@/integrations/espaider-v2/schemas';
import { mapProjetoV2ToRow } from '@/integrations/espaider-v2/mappers/project-mapper';
import type { EspaiderV2Config } from '@/integrations/espaider-v2/config';
import {
  decryptIntegrationToken,
  isEncryptedIntegrationToken,
} from '@/lib/security/integration-token';

// =============================================================================
// Sync log entry (shared surface with v1 log model)
// =============================================================================

type SyncLogLevel = 'info' | 'warn' | 'error' | 'success';

interface SyncLogEntry {
  timestamp: string;
  level: SyncLogLevel;
  dataset: string;
  message: string;
  details?: Record<string, unknown>;
}

function createLog(
  level: SyncLogLevel,
  dataset: string,
  message: string,
  details?: Record<string, unknown>,
): SyncLogEntry {
  const entry: SyncLogEntry = {
    timestamp: new Date().toISOString(),
    level,
    dataset,
    message,
    ...(details ? { details } : {}),
  };
  const prefix = `[v2-sync][${dataset}]`;
  if (level === 'error') console.error(prefix, message, details ?? '');
  else if (level === 'warn') console.warn(prefix, message, details ?? '');
  else console.log(prefix, message, details ?? '');
  return entry;
}

// =============================================================================
// Token resolution
// =============================================================================

function resolveToken(rawToken: string | null | undefined): string {
  if (!rawToken || rawToken === 'PREENCHER_TOKEN') {
    return process.env.ESPAIDER_V2_TOKEN || '';
  }
  if (!isEncryptedIntegrationToken(rawToken)) return rawToken;
  try {
    return decryptIntegrationToken(rawToken);
  } catch {
    console.error('[v2-sync] failed to decrypt token, falling back to env');
    return process.env.ESPAIDER_V2_TOKEN || '';
  }
}

// =============================================================================
// Date formatting for v2 filter
// =============================================================================

function formatV2Date(date: Date): string {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  const h = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  const s = date.getSeconds().toString().padStart(2, '0');
  return `${d}/${m}/${y} ${h}:${min}:${s}`;
}

// =============================================================================
// Sync params
// =============================================================================

export interface SyncV2ParentParams {
  supabase: SupabaseClient;
  tenantId: string;
  /** Override config (for testing or per-tenant tokens) */
  configOverride?: Partial<EspaiderV2Config>;
  /** Force full sync regardless of watermark */
  fullSync?: boolean;
  /**
   * Explicit sync window — if provided, skips watermark lookup.
   * For testing and manual override use cases.
   */
  syncWindow?: { de: string; ate: string };
}

export interface SyncV2ParentResult {
  success: boolean;
  newRecords: number;
  updatedRecords: number;
  invalidRecords: number;
  pagesFetched: number;
  durationMs: number;
  logs: SyncLogEntry[];
}

// =============================================================================
// Main entry point
// =============================================================================

export async function syncV2ParentDataset(params: SyncV2ParentParams): Promise<SyncV2ParentResult> {
  const { supabase, tenantId, configOverride, fullSync = false, syncWindow } = params;
  const startTime = Date.now();
  const logs: SyncLogEntry[] = [];

  logs.push(createLog('info', 'Projetos-v2', 'Iniciando sync do parent dataset v2'));

  // 1) Determine date filter
  let dateFilter: { de: string; ate: string } | undefined;

  if (syncWindow) {
    dateFilter = syncWindow;
    logs.push(createLog('info', 'Projetos-v2', `Janela explícita: ${dateFilter.de} → ${dateFilter.ate}`));
  } else if (!fullSync) {
    const watermark = await loadWatermark(supabase, tenantId);
    if (watermark) {
      const from = new Date(watermark);
      // 5-minute overlap window to avoid edge-case gaps
      from.setMinutes(from.getMinutes() - 5);
      const to = new Date();
      dateFilter = { de: formatV2Date(from), ate: formatV2Date(to) };
      logs.push(
        createLog('info', 'Projetos-v2', `Incremental sync: ${dateFilter.de} → ${dateFilter.ate}`),
      );
    } else {
      logs.push(createLog('info', 'Projetos-v2', 'Sem watermark — executando full bootstrap sync'));
    }
  } else {
    logs.push(createLog('info', 'Projetos-v2', 'fullSync=true — ignorando watermark'));
  }

  // 2) Fetch from v2 API
  let fetchResult;
  try {
    fetchResult = await consultarRegistros({ dateFilter, configOverride });
    logs.push(
      createLog(
        'info',
        'Projetos-v2',
        `Fetch completo: ${fetchResult.parentRecords.length} registros pai em ${fetchResult.pagesFetched} páginas`,
        { requestId: fetchResult.requestId },
      ),
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logs.push(createLog('error', 'Projetos-v2', `Falha no fetch: ${msg}`));
    return {
      success: false,
      newRecords: 0,
      updatedRecords: 0,
      invalidRecords: 0,
      pagesFetched: 0,
      durationMs: Date.now() - startTime,
      logs,
    };
  }

  if (fetchResult.parentRecords.length === 0) {
    logs.push(createLog('warn', 'Projetos-v2', 'Nenhum registro retornado — pulando upsert'));
    return {
      success: true,
      newRecords: 0,
      updatedRecords: 0,
      invalidRecords: 0,
      pagesFetched: fetchResult.pagesFetched,
      durationMs: Date.now() - startTime,
      logs,
    };
  }

  // 3) Validate and map
  const validRows: ReturnType<typeof mapProjetoV2ToRow>[] = [];
  let invalidCount = 0;

  for (const raw of fetchResult.parentRecords) {
    const validation = validateProjetoRecord(raw);
    if (!validation.success || !validation.data) {
      invalidCount++;
      logs.push(
        createLog('warn', 'Projetos-v2', `Registro inválido — will be handled by quarantine`, {
          errors: validation.errors,
          record: (raw as Record<string, unknown>)['IDEspaider'],
        }),
      );
      continue;
    }
    validRows.push(mapProjetoV2ToRow(validation.data, tenantId));
  }

  logs.push(
    createLog(
      'info',
      'Projetos-v2',
      `Validação: ${validRows.length} válidos, ${invalidCount} inválidos`,
    ),
  );

  if (validRows.length === 0) {
    logs.push(createLog('warn', 'Projetos-v2', 'Nenhum registro válido para persistir'));
    return {
      success: true,
      newRecords: 0,
      updatedRecords: 0,
      invalidRecords: invalidCount,
      pagesFetched: fetchResult.pagesFetched,
      durationMs: Date.now() - startTime,
      logs,
    };
  }

  // 4) Load existing IDs for new/updated accounting
  const { data: existing } = await supabase
    .from('projects')
    .select('espaider_id')
    .eq('tenant_id', tenantId)
    .in(
      'espaider_id',
      validRows.map((r) => r.espaider_id),
    );

  const existingIds = new Set<number>(
    (existing ?? []).map((r: { espaider_id: number }) => r.espaider_id),
  );

  // 5) Upsert
  const BATCH_SIZE = 200;
  let newRecords = 0;
  let updatedRecords = 0;

  for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
    const batch = validRows.slice(i, i + BATCH_SIZE);

    const { error } = await supabase
      .from('projects')
      .upsert(batch, { onConflict: 'tenant_id,espaider_id' });

    if (error) {
      logs.push(createLog('error', 'Projetos-v2', `Upsert error: ${error.message}`, { code: error.code }));
      return {
        success: false,
        newRecords,
        updatedRecords,
        invalidRecords: invalidCount,
        pagesFetched: fetchResult.pagesFetched,
        durationMs: Date.now() - startTime,
        logs,
      };
    }

    for (const row of batch) {
      if (existingIds.has(row.espaider_id)) updatedRecords++;
      else newRecords++;
    }
  }

  logs.push(
    createLog(
      'success',
      'Projetos-v2',
      `Upsert concluído: ${newRecords} novos, ${updatedRecords} atualizados`,
    ),
  );

  // 6) Advance watermark
  await advanceWatermark(supabase, tenantId);

  const durationMs = Date.now() - startTime;
  logs.push(
    createLog('info', 'Projetos-v2', `Sync completo em ${durationMs}ms`, {
      newRecords,
      updatedRecords,
      invalidRecords: invalidCount,
      pagesFetched: fetchResult.pagesFetched,
    }),
  );

  return {
    success: true,
    newRecords,
    updatedRecords,
    invalidRecords: invalidCount,
    pagesFetched: fetchResult.pagesFetched,
    durationMs,
    logs,
  };
}

// =============================================================================
// Watermark helpers (use espaider_apis.last_sync_at for v2)
// =============================================================================

async function loadWatermark(supabase: SupabaseClient, tenantId: string): Promise<string | null> {
  const { data } = await supabase
    .from('espaider_apis')
    .select('last_sync_at')
    .eq('tenant_id', tenantId)
    .eq('tipo', 'Projetos-v2')
    .eq('is_active', true)
    .maybeSingle();

  return data?.last_sync_at ?? null;
}

async function advanceWatermark(supabase: SupabaseClient, tenantId: string): Promise<void> {
  await supabase
    .from('espaider_apis')
    .update({ last_sync_at: new Date().toISOString() })
    .eq('tenant_id', tenantId)
    .eq('tipo', 'Projetos-v2');
}

// =============================================================================
// Token resolver export for orchestration layer
// =============================================================================

export { resolveToken as resolveV2Token };
