/**
 * Espaider v2 Child Datasets Orchestration.
 *
 * Processes inline ListaFilhos from a sync run result:
 * - Routes each child by Identificador (literal vendor strings)
 * - Validates records with per-dataset schemas
 * - Resolves project_id from IDREGISTROPAI → projects.espaider_id
 * - Persists valid records to the correct table
 * - Quarantines invalid and orphan records
 *
 * This module is called after the parent sync completes (Story 19.3)
 * so the project UUID map is available for child linking.
 *
 * @see Story 19.4
 * @see Story 19.5 (quarantine)
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { FilhoDataset } from '@/integrations/espaider-v2/types';
import { CHILD_IDENTIFIERS, validateChildRecords } from '@/integrations/espaider-v2/schemas';
import type {
  CronogramasRecord,
  EntregasRecord,
  RequisitosRecord,
  HistoricosRecord,
  OrcamentosRecord,
  AprovadoresRecord,
  TemposPermanenciaRecord,
  HorasLancadasRecord,
} from '@/integrations/espaider-v2/schemas';
import {
  mapCronogramaV2,
  mapEntregaV2,
  mapRequisitoV2,
  mapHistoricoV2,
  mapOrcamentoV2,
  mapAprovadorV2,
  mapTempoPermanenciaV2,
  mapHorasLancadasV2,
} from '@/integrations/espaider-v2/mappers/child-mappers';
import { writeQuarantine, formatValidationReason } from './quarantine';
import type { QuarantineEntry } from './quarantine';

// =============================================================================
// Types
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

export interface SyncChildrenParams {
  supabase: SupabaseClient;
  tenantId: string;
  requestId: string;
  childDatasets: FilhoDataset[];
}

export interface ChildDatasetResult {
  dataset: string;
  processed: number;
  persisted: number;
  invalid: number;
  orphans: number;
}

export interface SyncChildrenResult {
  success: boolean;
  datasets: ChildDatasetResult[];
  totalQuarantined: number;
  logs: SyncLogEntry[];
}

// =============================================================================
// Project ID map builder
// =============================================================================

async function buildProjectIdMap(
  supabase: SupabaseClient,
  tenantId: string,
  espaiderIds: number[],
): Promise<Map<number, string>> {
  if (espaiderIds.length === 0) return new Map();

  const { data } = await supabase
    .from('projects')
    .select('id, espaider_id')
    .eq('tenant_id', tenantId)
    .in('espaider_id', espaiderIds);

  const map = new Map<number, string>();
  for (const row of data ?? []) {
    map.set(row.espaider_id as number, row.id as string);
  }
  return map;
}

// =============================================================================
// Generic child upsert helper
// =============================================================================

async function upsertChildBatch(
  supabase: SupabaseClient,
  tableName: string,
  rows: unknown[],
): Promise<{ error: { message: string; code: string } | null }> {
  if (rows.length === 0) return { error: null };

  const { error } = await supabase
    .from(tableName)
    .upsert(rows as Record<string, unknown>[], { onConflict: 'tenant_id,espaider_id' });

  return { error: error as { message: string; code: string } | null };
}

// =============================================================================
// Per-dataset processors
// =============================================================================

type ChildProcessor = (
  child: FilhoDataset,
  params: SyncChildrenParams,
  projectIdMap: Map<number, string>,
  quarantineEntries: QuarantineEntry[],
  logs: SyncLogEntry[],
) => Promise<ChildDatasetResult>;

const PROCESSORS: Record<string, ChildProcessor> = {
  [CHILD_IDENTIFIERS.CRONOGRAMAS]: async (child, params, projectIdMap, quarantineEntries, logs) => {
    return processChildDataset({
      child,
      tableName: 'project_schedules',
      params,
      projectIdMap,
      quarantineEntries,
      logs,
      mapRecord: (record, projectId) =>
        mapCronogramaV2(record as CronogramasRecord, params.tenantId, projectId),
    });
  },

  [CHILD_IDENTIFIERS.ENTREGAS]: async (child, params, projectIdMap, quarantineEntries, logs) => {
    return processChildDataset({
      child,
      tableName: 'project_deliveries',
      params,
      projectIdMap,
      quarantineEntries,
      logs,
      mapRecord: (record, projectId) =>
        mapEntregaV2(record as EntregasRecord, params.tenantId, projectId),
    });
  },

  [CHILD_IDENTIFIERS.REQUISITOS]: async (child, params, projectIdMap, quarantineEntries, logs) => {
    return processChildDataset({
      child,
      tableName: 'project_requirements',
      params,
      projectIdMap,
      quarantineEntries,
      logs,
      mapRecord: (record, projectId) =>
        mapRequisitoV2(record as RequisitosRecord, params.tenantId, projectId),
    });
  },

  [CHILD_IDENTIFIERS.HISTORICOS]: async (child, params, projectIdMap, quarantineEntries, logs) => {
    return processChildDataset({
      child,
      tableName: 'project_histories',
      params,
      projectIdMap,
      quarantineEntries,
      logs,
      mapRecord: (record, projectId) =>
        mapHistoricoV2(record as HistoricosRecord, params.tenantId, projectId),
    });
  },

  [CHILD_IDENTIFIERS.ORCAMENTOS]: async (child, params, projectIdMap, quarantineEntries, logs) => {
    return processChildDataset({
      child,
      tableName: 'project_budgets',
      params,
      projectIdMap,
      quarantineEntries,
      logs,
      mapRecord: (record, projectId) =>
        mapOrcamentoV2(record as OrcamentosRecord, params.tenantId, projectId),
    });
  },

  [CHILD_IDENTIFIERS.APROVADORES]: async (child, params, projectIdMap, quarantineEntries, logs) => {
    return processChildDataset({
      child,
      tableName: 'project_approvers',
      params,
      projectIdMap,
      quarantineEntries,
      logs,
      mapRecord: (record, projectId) =>
        mapAprovadorV2(record as AprovadoresRecord, params.tenantId, projectId),
    });
  },

  [CHILD_IDENTIFIERS.TEMPOSPERMANCENCIA]: async (
    child,
    params,
    projectIdMap,
    quarantineEntries,
    logs,
  ) => {
    return processChildDataset({
      child,
      tableName: 'project_tempo_permanencia',
      params,
      projectIdMap,
      quarantineEntries,
      logs,
      mapRecord: (record, projectId) =>
        mapTempoPermanenciaV2(record as TemposPermanenciaRecord, params.tenantId, projectId),
    });
  },

  [CHILD_IDENTIFIERS.HORASLANCADAS]: async (
    child,
    params,
    projectIdMap,
    quarantineEntries,
    logs,
  ) => {
    return processChildDataset({
      child,
      tableName: 'project_horas_lancadas',
      params,
      projectIdMap,
      quarantineEntries,
      logs,
      mapRecord: (record, projectId) =>
        mapHorasLancadasV2(record as HorasLancadasRecord, params.tenantId, projectId),
    });
  },
};

// =============================================================================
// Generic child dataset processor
// =============================================================================

async function processChildDataset<T>({
  child,
  tableName,
  params,
  projectIdMap,
  quarantineEntries,
  logs,
  mapRecord,
}: {
  child: FilhoDataset;
  tableName: string;
  params: SyncChildrenParams;
  projectIdMap: Map<number, string>;
  quarantineEntries: QuarantineEntry[];
  logs: SyncLogEntry[];
  mapRecord: (record: unknown, projectId: string) => T;
}): Promise<ChildDatasetResult> {
  const { tenantId, requestId } = params;
  const dataset = child.Identificador;
  let invalid = 0;
  let orphans = 0;

  const validationResults = validateChildRecords(dataset, child.ListaRegistros);
  const validRecords: Array<{ record: unknown; parentEspaider: number }> = [];

  validationResults.forEach((result, idx) => {
    const raw = child.ListaRegistros[idx];
    if (!result.success) {
      invalid++;
      quarantineEntries.push({
        tenantId,
        requestId,
        dataset,
        stage: 'validation',
        rawPayload: raw,
        reason: formatValidationReason(result.errors ?? []),
      });
      return;
    }
    const parentId = (raw as Record<string, unknown>)['IDREGISTROPAI'];
    if (typeof parentId !== 'number') {
      invalid++;
      quarantineEntries.push({
        tenantId,
        requestId,
        dataset,
        stage: 'validation',
        rawPayload: raw,
        reason: 'IDREGISTROPAI is missing or not a number',
      });
      return;
    }
    validRecords.push({ record: result.data, parentEspaider: parentId });
  });

  const rows: unknown[] = [];
  for (const { record, parentEspaider } of validRecords) {
    const projectId = projectIdMap.get(parentEspaider);
    if (!projectId) {
      orphans++;
      quarantineEntries.push({
        tenantId,
        requestId,
        dataset,
        stage: 'parent-link',
        rawPayload: record as Record<string, unknown>,
        reason: `Parent project not found for IDREGISTROPAI=${parentEspaider}`,
      });
      continue;
    }
    rows.push(mapRecord(record, projectId));
  }

  if (orphans > 0) {
    logs.push(createLog('warn', dataset, `${orphans} registros órfãos (pai não encontrado)`));
  }

  if (rows.length > 0) {
    const { error } = await upsertChildBatch(params.supabase, tableName, rows);
    if (error) {
      logs.push(
        createLog('error', dataset, `Upsert error: ${error.message}`, { code: error.code }),
      );
      return { dataset, processed: child.ListaRegistros.length, persisted: 0, invalid, orphans };
    }
    logs.push(createLog('success', dataset, `${rows.length} registros persistidos`));
  }

  return {
    dataset,
    processed: child.ListaRegistros.length,
    persisted: rows.length,
    invalid,
    orphans,
  };
}

// =============================================================================
// Main entry point
// =============================================================================

export async function syncV2ChildDatasets(params: SyncChildrenParams): Promise<SyncChildrenResult> {
  const { supabase, tenantId, childDatasets } = params;
  const logs: SyncLogEntry[] = [];
  const datasetResults: ChildDatasetResult[] = [];
  const quarantineEntries: QuarantineEntry[] = [];

  if (childDatasets.length === 0) {
    logs.push(createLog('info', 'Children-v2', 'Nenhum child dataset para processar'));
    return { success: true, datasets: [], totalQuarantined: 0, logs };
  }

  logs.push(createLog('info', 'Children-v2', `Processando ${childDatasets.length} child datasets`));

  // Build projectIdMap for all unique IDREGISTROPAI values across all child datasets
  const allParentIds = new Set<number>();
  for (const child of childDatasets) {
    for (const record of child.ListaRegistros) {
      const parentId = (record as Record<string, unknown>)['IDREGISTROPAI'];
      if (typeof parentId === 'number') allParentIds.add(parentId);
    }
  }

  const projectIdMap = await buildProjectIdMap(supabase, tenantId, Array.from(allParentIds));

  logs.push(
    createLog('info', 'Children-v2', `Project ID map: ${projectIdMap.size} projetos resolvidos`),
  );

  // Process each child dataset by Identificador
  for (const child of childDatasets) {
    const processor = PROCESSORS[child.Identificador];

    if (!processor) {
      logs.push(
        createLog(
          'warn',
          child.Identificador,
          `Dataset desconhecido — ignorado. Registros: ${child.ListaRegistros.length}`,
        ),
      );
      datasetResults.push({
        dataset: child.Identificador,
        processed: child.ListaRegistros.length,
        persisted: 0,
        invalid: child.ListaRegistros.length,
        orphans: 0,
      });
      continue;
    }

    logs.push(
      createLog(
        'info',
        child.Identificador,
        `Processando ${child.ListaRegistros.length} registros`,
      ),
    );

    const result = await processor(child, params, projectIdMap, quarantineEntries, logs);
    datasetResults.push(result);
  }

  // Write quarantine entries
  let totalQuarantined = 0;
  if (quarantineEntries.length > 0) {
    const qResult = await writeQuarantine(supabase, quarantineEntries);
    totalQuarantined = qResult.quarantined;
    logs.push(
      createLog(
        'warn',
        'Children-v2',
        `${totalQuarantined} registros quarentenados, ${qResult.failed} falhas na quarentena`,
      ),
    );
  }

  const totalPersisted = datasetResults.reduce((sum, r) => sum + r.persisted, 0);
  const totalInvalid = datasetResults.reduce((sum, r) => sum + r.invalid + r.orphans, 0);

  logs.push(
    createLog(
      'info',
      'Children-v2',
      `Sync de filhos completo: ${totalPersisted} persistidos, ${totalInvalid} inválidos/órfãos`,
    ),
  );

  return { success: true, datasets: datasetResults, totalQuarantined, logs };
}
