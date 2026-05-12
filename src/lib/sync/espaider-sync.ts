/**
 * Espaider Sync Service
 *
 * Orchestrates: fetch from Espaider API -> map -> upsert to Supabase -> log.
 * Handles all 4 datasets: Projetos, Entregas, Cronogramas, Requisitos.
 *
 * Server-side only (uses Supabase service client).
 *
 * @see ADR-002: Auth Espaider
 * @see BR-003: Mapeamento de Campos Espaider
 * @see RT-001: Sincronização de Projetos
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { EspaiderDataset, SyncLogEntry, SyncLogLevel } from '@/integrations/espaider/types';
import { exportarDados, buscarFilhos } from '@/integrations/espaider/client';
import { generateRequestId } from '@/integrations/espaider/config';
import {
  decryptIntegrationToken,
  isEncryptedIntegrationToken,
} from '@/lib/security/integration-token';
import {
  mapearProjeto,
  mapearEntrega,
  mapearCronograma,
  mapearRequisito,
  mapearHistorico,
  mapearOrcamento,
  mapearAprovador,
  mapearTempoPermanencia,
  mapearHoraLancada,
  mapearRegistros,
} from '@/integrations/espaider/mapper';

// =============================================================================
// Structured logging helper
// =============================================================================

function createLog(
  level: SyncLogLevel,
  dataset: EspaiderDataset | 'Geral',
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
  // Also emit to server console for debugging
  const prefix = `[sync][${dataset}]`;
  if (level === 'error') console.error(prefix, message, details || '');
  else if (level === 'warn') console.warn(prefix, message, details || '');
  else console.log(prefix, message, details || '');
  return entry;
}

/**
 * Type-safe error message extraction
 * Handles Error instances, objects with message property, and unknown types
 */
function getErrorMessage(err: unknown, fallback = 'Erro desconhecido'): string {
  if (err instanceof Error) {
    return err.message;
  }
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as Record<string, unknown>).message;
    if (typeof msg === 'string') return msg;
  }
  return fallback;
}

// =============================================================================
// API config loading from espaider_apis table
// =============================================================================

interface EspaiderApiRow {
  id: string;
  base_url: string;
  token: string;
  identificador: string;
  tipo: string;
  is_active: boolean;
}

export function resolveApiToken(rawToken: string | null | undefined): string {
  if (!rawToken || rawToken === 'PREENCHER_TOKEN') {
    return process.env.ESPAIDER_TOKEN || '';
  }

  if (!isEncryptedIntegrationToken(rawToken)) {
    return rawToken;
  }

  try {
    return decryptIntegrationToken(rawToken);
  } catch (err) {
    console.error('[sync] failed to decrypt API token, falling back to env token');
    return process.env.ESPAIDER_TOKEN || '';
  }
}

/**
 * Load active API configs from espaider_apis table for a given tenant.
 * Falls back to environment variables if no rows found.
 */
async function loadApiConfigs(
  supabase: SupabaseClient,
  tenantId: string,
): Promise<Map<string, EspaiderApiRow>> {
  const { data, error } = await supabase
    .from('espaider_apis')
    .select('id, base_url, token, identificador, tipo, is_active')
    .eq('tenant_id', tenantId)
    .eq('is_active', true);

  const map = new Map<string, EspaiderApiRow>();
  if (!error && data) {
    for (const row of data) {
      // Resolve token from encrypted/plaintext storage with env fallback.
      row.token = resolveApiToken(row.token);
      if (!row.base_url) {
        row.base_url = process.env.ESPAIDER_BASE_URL || row.base_url;
      }
      map.set(row.tipo, row);
    }
  }
  return map;
}

/**
 * Update last_sync metadata on the espaider_apis row.
 */
async function updateApiSyncStatus(
  supabase: SupabaseClient,
  apiId: string,
  status: 'success' | 'partial' | 'failed',
): Promise<void> {
  await supabase
    .from('espaider_apis')
    .update({ last_sync_at: new Date().toISOString(), last_sync_status: status })
    .eq('id', apiId);
}

// =============================================================================
// Status normalization map
// Espaider returns free-text status; our Kanban expects specific slugs.
// =============================================================================

const STATUS_MAP: Record<string, string> = {
  // Espaider value (lowercase) -> Kanban slug
  // Mapeamentos diretos apenas para normalização básica
  // Se o valor não estiver aqui, será usado como slug (ex: "Aguardando Fornecedor" -> "aguardando_fornecedor")
  novo: 'projeto_futuro',
  futuro: 'projeto_futuro',
  projetofuturo: 'projeto_futuro',
  concluído: 'concluido',
  concluido: 'concluido',
  finalizado: 'concluido',
  encerrado: 'concluido',
};

/**
 * Normalize a free-text status from Espaider to a Kanban-compatible slug.
 * Falls back to 'projeto_futuro' if no match is found.
 */
export function normalizeStatus(raw: string): string {
  if (!raw) return 'projeto_futuro';
  const key = raw.trim().toLowerCase();

  // Direct match first
  if (STATUS_MAP[key]) return STATUS_MAP[key];

  // If no map, just slugify the value
  // "Aguardando Fornecedor" -> "aguardando_fornecedor"
  let slug = key
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '_') // Replace non-alphanumeric with underscore
    .replace(/^_+|_+$/g, ''); // Trim underscores

  return slug || 'projeto_futuro';
}

/**
 * Normalize phase values from APROVADORATUAL for Kanban grouping.
 * Example values:
 * - "Execução - Produção"
 * - "Execução - Homologação"
 * - "Fila de Projetos"
 * - "Validação - Homologação"
 * - "Levantamentos iniciais"
 * Falls back to 'fila_projetos' if empty.
 */
export function normalizeFase(raw: string): string {
  if (!raw) return 'fila_projetos';
  const key = raw.trim().toLowerCase();

  // Slugify the value
  let slug = key
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '_') // Replace non-alphanumeric with underscore
    .replace(/^_+|_+$/g, ''); // Trim underscores

  return slug || 'fila_projetos';
}

// =============================================================================
// Sync result types
// =============================================================================

export interface DatasetSyncResult {
  dataset: EspaiderDataset;
  total: number;
  created: number;
  updated: number;
  errors: number;
  durationMs: number;
}

export interface SyncAllResult {
  success: boolean;
  datasets: DatasetSyncResult[];
  totalCreated: number;
  totalUpdated: number;
  totalErrors: number;
  durationMs: number;
  message: string;
  logs: SyncLogEntry[];
}

// =============================================================================
// Generic sync helper — reduces boilerplate for all 7 dataset sync functions
// @see Story 15.6 - Refactor espaider-sync orchestrator (Wave 3)
// =============================================================================

/**
 * Generic dataset sync template
 * Handles: fetch → map → upsert → log for any dataset
 * Reduces ~300+ LOC of duplicated sync logic
 */
async function syncDataset<T>(
  supabase: SupabaseClient,
  tenantId: string,
  logs: SyncLogEntry[],
  config: {
    dataset: EspaiderDataset;
    identificador: string;
    tableName: string;
    conflictKey: string;
    mapper: (records: any[]) => T[];
    buildRows: (mapped: T[], existingIds?: Set<number>) => Record<string, any>[];
    apiConfig?: EspaiderApiRow;
  },
): Promise<DatasetSyncResult> {
  const start = Date.now();
  let created = 0;
  let updated = 0;
  let errors = 0;

  try {
    logs.push(createLog('info', config.dataset, `Buscando dados (${config.identificador})...`));

    const response = await exportarDados({
      identificador: config.identificador,
      baseUrl: config.apiConfig?.base_url,
      token: config.apiConfig?.token,
    });

    const registros = response.ListaRegistros || [];
    logs.push(createLog('info', config.dataset, `${registros.length} registros recebidos`));

    if (registros.length === 0) {
      logs.push(createLog('warn', config.dataset, 'Nenhum registro — pulando upsert'));
      return {
        dataset: config.dataset,
        total: 0,
        created: 0,
        updated: 0,
        errors: 0,
        durationMs: Date.now() - start,
      };
    }

    const mapped = config.mapper(registros);
    logs.push(createLog('info', config.dataset, `${mapped.length} registros mapeados`));

    const { data: existing } = await supabase
      .from(config.tableName)
      .select('espaider_id')
      .eq('tenant_id', tenantId);

    const existingIds = new Set((existing || []).map((r: any) => r.espaider_id));
    const rows = config.buildRows(mapped, existingIds);

    if (rows.length === 0) {
      logs.push(createLog('warn', config.dataset, 'Nenhum registro a inserir após filtros'));
      return {
        dataset: config.dataset,
        total: 0,
        created: 0,
        updated: 0,
        errors: 0,
        durationMs: Date.now() - start,
      };
    }

    const { error } = await supabase.from(config.tableName).upsert(rows, {
      onConflict: config.conflictKey,
    });

    if (error) {
      logs.push(createLog('error', config.dataset, `Erro no upsert: ${error.message}`));
      errors = rows.length;
    } else {
      for (const row of rows) {
        if (existingIds.has(row.espaider_id)) updated++;
        else created++;
      }
      logs.push(
        createLog('success', config.dataset, `Upsert: ${created} novos, ${updated} atualizados`),
      );
    }
  } catch (err) {
    const msg = getErrorMessage(err, 'Falha de conexão/acesso');
    logs.push(createLog('error', config.dataset, `Falha: ${msg}`));
    errors++;
  }

  return {
    dataset: config.dataset,
    total: created + updated + errors,
    created,
    updated,
    errors,
    durationMs: Date.now() - start,
  };
}

// =============================================================================
// Individual dataset sync functions
// =============================================================================

/**
 * Sync projects from Espaider -> Supabase.
 * Uses upsert on (tenant_id, espaider_id) unique constraint.
 */
export async function syncProjects(
  supabase: SupabaseClient,
  tenantId: string,
  logs: SyncLogEntry[],
  apiConfig?: EspaiderApiRow,
): Promise<DatasetSyncResult> {
  const start = Date.now();
  let created = 0;
  let updated = 0;
  let errors = 0;

  try {
    const identificador = apiConfig?.identificador || 'BI_SOLICITACOES_PROJETOSESPAIDER';
    logs.push(createLog('info', 'Projetos', `Buscando dados do Espaider (${identificador})...`));

    const response = await exportarDados({
      identificador,
      baseUrl: apiConfig?.base_url,
      token: apiConfig?.token,
    });
    const registros = response.ListaRegistros || [];

    logs.push(
      createLog('info', 'Projetos', `${registros.length} registros recebidos da API`, {
        count: registros.length,
      }),
    );

    if (registros.length === 0) {
      logs.push(createLog('warn', 'Projetos', 'Nenhum registro retornado — pulando upsert'));
      return {
        dataset: 'Projetos',
        total: 0,
        created: 0,
        updated: 0,
        errors: 0,
        durationMs: Date.now() - start,
      };
    }

    const mapped = mapearRegistros(registros, mapearProjeto);
    logs.push(createLog('info', 'Projetos', `${mapped.length} registros mapeados com sucesso`));

    const { data: existing } = await supabase
      .from('projects')
      .select('espaider_id')
      .eq('tenant_id', tenantId);
    const existingIds = new Set(
      (existing || []).map((r: { espaider_id: number }) => r.espaider_id),
    );

    const rows = mapped.map((p) => ({
      tenant_id: tenantId,
      espaider_id: p.id_espaider,
      codigo: p.codigo,
      titulo: p.titulo,
      situacao_original: p.situacao_atual || p.status,
      status_original: p.status,
      responsavel: p.responsavel || null,
      prioridade: p.prioridade || 'Normal',
      categoria: p.categoria || null,
      prazo_final: p.prazo_final ? p.prazo_final.toISOString().split('T')[0] : null,
      // === Novos campos (Migration 009) ===
      fase_atual: p.fase_atual || null,
      prazo_fase: p.prazo_fase ? p.prazo_fase.toISOString().split('T')[0] : null,
      cronograma_atual: p.cronograma_atual || null,
      prazo_cronograma: p.prazo_cronograma ? p.prazo_cronograma.toISOString().split('T')[0] : null,
      area: p.area || null,
      pasta_consultivo: p.pasta_consultivo || null,
      solucao_aplicada: p.solucao_aplicada || null,
      data_movimentacao: p.data_movimentacao?.toISOString() || null,
      data_encerramento: p.data_encerramento?.toISOString() || null,
      data_inicio_aprovacao: p.data_inicio_aprovacao?.toISOString() || null,

      // === Visão 360 (Migration 014) ===
      trm_espaider: p.trm_espaider || null,
      tipo_chamado: p.tipo_chamado || null,
      tipo_assunto: p.tipo_assunto || null,
      solicitante: p.solicitante || null,
      objetivo: p.objetivo || null,
      motivo_importancia_especial: p.motivo_importancia_especial || null,
      mensagem_movimentacao: p.mensagem_movimentacao || null,
      justificativa: p.justificativa || null,
      importancia_especial: p.importancia_especial || false,
      impacto_operacional: p.impacto_operacional || null,
      impacto_estrategico: p.impacto_estrategico || null,
      escopo: p.escopo || null,
      complexidade_tecnica: p.complexidade_tecnica || null,

      espaider_raw: p.extras,
      sync_status: 'synced',
      last_sync_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('projects')
      .upsert(rows, { onConflict: 'tenant_id,espaider_id' });

    if (error) {
      logs.push(
        createLog('error', 'Projetos', `Erro no upsert: ${error.message}`, { code: error.code }),
      );
      errors = rows.length;
    } else {
      for (const row of rows) {
        if (existingIds.has(row.espaider_id)) updated++;
        else created++;
      }
      logs.push(
        createLog(
          'success',
          'Projetos',
          `Upsert concluído: ${created} novos, ${updated} atualizados`,
        ),
      );
    }
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : getErrorMessage(err, 'Falha de conexão/acesso à API do Espaider (Erro desconhecido)');
    logs.push(createLog('error', 'Projetos', `Falha ao buscar dados: ${msg}`));
    errors++;
  }

  return {
    dataset: 'Projetos',
    total: created + updated + errors,
    created,
    updated,
    errors,
    durationMs: Date.now() - start,
  };
}

/**
 * Helper: build a map of espaider_id -> project UUID for linking children.
 */
async function getProjectIdMap(
  supabase: SupabaseClient,
  tenantId: string,
  logs?: SyncLogEntry[],
): Promise<Map<number, string>> {
  const { data, error } = await supabase
    .from('projects')
    .select('id, espaider_id')
    .eq('tenant_id', tenantId);

  if (error) {
    const msg = `Erro ao carregar mapa de projetos: ${error.message}`;
    console.error('[sync]', msg);
    logs?.push(createLog('error', 'Geral', msg, { code: error.code }));
  }

  const map = new Map<number, string>();
  for (const row of data || []) {
    map.set(row.espaider_id, row.id);
  }

  if (logs) {
    logs.push(createLog('info', 'Geral', `ProjectMap carregado: ${map.size} projetos mapeados`));
  }

  return map;
}

/**
 * Sync deliveries (Entregas) from Espaider -> Supabase.
 */
export async function syncDeliveries(
  supabase: SupabaseClient,
  tenantId: string,
  logs: SyncLogEntry[],
  apiConfig?: EspaiderApiRow,
): Promise<DatasetSyncResult> {
  const start = Date.now();
  let created = 0;
  let updated = 0;
  let errors = 0;

  try {
    const identificador = apiConfig?.identificador || 'BI_SOLICITACOES_SUPORTEESPAIDER_ENTREGAS';
    logs.push(createLog('info', 'Entregas', `Buscando dados do Espaider (${identificador})...`));

    const response = await exportarDados({
      identificador,
      baseUrl: apiConfig?.base_url,
      token: apiConfig?.token,
    });
    const registros = response.ListaRegistros || [];

    logs.push(
      createLog('info', 'Entregas', `${registros.length} registros recebidos da API`, {
        count: registros.length,
      }),
    );

    if (registros.length === 0) {
      logs.push(createLog('warn', 'Entregas', 'Nenhum registro retornado — pulando upsert'));
      return {
        dataset: 'Entregas',
        total: 0,
        created: 0,
        updated: 0,
        errors: 0,
        durationMs: Date.now() - start,
      };
    }

    const mapped = mapearRegistros(registros, mapearEntrega);
    const projectMap = await getProjectIdMap(supabase, tenantId);

    const { data: existing } = await supabase
      .from('project_deliveries')
      .select('espaider_id')
      .eq('tenant_id', tenantId);
    const existingIds = new Set(
      (existing || []).map((r: { espaider_id: number }) => r.espaider_id),
    );

    const rows = mapped
      .filter((e) => projectMap.has(e.projeto_id_espaider))
      .map((e) => ({
        tenant_id: tenantId,
        project_id: projectMap.get(e.projeto_id_espaider)!,
        espaider_id: e.id_espaider,
        titulo: e.titulo,
        status: e.status || 'Pendente',
        data_prevista: e.data_prevista ? e.data_prevista.toISOString().split('T')[0] : null,
        data_realizada: e.data_realizada ? e.data_realizada.toISOString().split('T')[0] : null,
        // === Novos campos (Migration 011) ===
        ordem: e.ordem || null,
        detalhamento: e.detalhamento || null,
        prioridade: e.prioridade || 'Normal',
        espaider_raw: e.extras,
      }));

    const orphans = mapped.length - rows.length;
    if (orphans > 0) {
      logs.push(
        createLog(
          'warn',
          'Entregas',
          `${orphans} registros ignorados (projeto pai não encontrado)`,
          { orphans },
        ),
      );
    }

    if (rows.length > 0) {
      const { error } = await supabase
        .from('project_deliveries')
        .upsert(rows, { onConflict: 'tenant_id,espaider_id' });

      if (error) {
        logs.push(
          createLog('error', 'Entregas', `Erro no upsert: ${error.message}`, { code: error.code }),
        );
        errors = rows.length;
      } else {
        for (const row of rows) {
          if (existingIds.has(row.espaider_id)) updated++;
          else created++;
        }
        logs.push(
          createLog(
            'success',
            'Entregas',
            `Upsert concluído: ${created} novos, ${updated} atualizados`,
          ),
        );
      }
    }
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : getErrorMessage(err, 'Falha de conexão/acesso à API do Espaider (Erro desconhecido)');
    logs.push(createLog('error', 'Entregas', `Falha ao buscar dados: ${msg}`));
    errors++;
  }

  return {
    dataset: 'Entregas',
    total: created + updated + errors,
    created,
    updated,
    errors,
    durationMs: Date.now() - start,
  };
}

/**
 * Sync schedules (Cronogramas) from Espaider -> Supabase.
 */
export async function syncSchedules(
  supabase: SupabaseClient,
  tenantId: string,
  logs: SyncLogEntry[],
  apiConfig?: EspaiderApiRow,
): Promise<DatasetSyncResult> {
  const start = Date.now();
  let created = 0;
  let updated = 0;
  let errors = 0;

  try {
    const identificador = apiConfig?.identificador || 'BI_SOLICITACOES_SUPORTEESPAIDER_CRONOGRAMAS';
    logs.push(createLog('info', 'Cronogramas', `Buscando dados do Espaider (${identificador})...`));

    const response = await exportarDados({
      identificador,
      baseUrl: apiConfig?.base_url,
      token: apiConfig?.token,
    });
    const registros = response.ListaRegistros || [];

    logs.push(
      createLog('info', 'Cronogramas', `${registros.length} registros recebidos da API`, {
        count: registros.length,
      }),
    );

    if (registros.length === 0) {
      logs.push(createLog('warn', 'Cronogramas', 'Nenhum registro retornado — pulando upsert'));
      return {
        dataset: 'Cronogramas',
        total: 0,
        created: 0,
        updated: 0,
        errors: 0,
        durationMs: Date.now() - start,
      };
    }

    const mapped = mapearRegistros(registros, mapearCronograma);
    const projectMap = await getProjectIdMap(supabase, tenantId);

    const { data: existing } = await supabase
      .from('project_schedules')
      .select('espaider_id')
      .eq('tenant_id', tenantId);
    const existingIds = new Set(
      (existing || []).map((r: { espaider_id: number }) => r.espaider_id),
    );

    const rows = mapped
      .filter((c) => projectMap.has(c.projeto_id_espaider))
      .map((c) => ({
        tenant_id: tenantId,
        project_id: projectMap.get(c.projeto_id_espaider)!,
        espaider_id: c.id_espaider,
        atividade: c.atividade,
        responsavel: c.responsavel || null,
        data_inicio: c.data_inicio ? c.data_inicio.toISOString().split('T')[0] : null,
        data_fim: c.data_fim ? c.data_fim.toISOString().split('T')[0] : null,
        status: c.status || 'Pendente',
        // === Novos campos (Migration 010) ===
        fase_atividade: c.fase_atividade || null,
        atrasado: c.atrasado || false,
        setor_responsavel: c.setor_responsavel || null,
        item: c.item || null,
        detalhamento: c.detalhamento || null,
        data_prazo: c.data_prazo ? c.data_prazo.toISOString().split('T')[0] : null,
        data_novo_prazo: c.data_novo_prazo ? c.data_novo_prazo.toISOString().split('T')[0] : null,
        data_alerta_prazo: c.data_alerta_prazo
          ? c.data_alerta_prazo.toISOString().split('T')[0]
          : null,
        prazo_confirmado: c.prazo_confirmado || null,
        espaider_raw: c.extras,
      }));

    const orphans = mapped.length - rows.length;
    if (orphans > 0) {
      logs.push(
        createLog(
          'warn',
          'Cronogramas',
          `${orphans} registros ignorados (projeto pai não encontrado)`,
          { orphans },
        ),
      );
    }

    if (rows.length > 0) {
      const { error } = await supabase
        .from('project_schedules')
        .upsert(rows, { onConflict: 'tenant_id,espaider_id' });

      if (error) {
        logs.push(
          createLog('error', 'Cronogramas', `Erro no upsert: ${error.message}`, {
            code: error.code,
          }),
        );
        errors = rows.length;
      } else {
        for (const row of rows) {
          if (existingIds.has(row.espaider_id)) updated++;
          else created++;
        }
        logs.push(
          createLog(
            'success',
            'Cronogramas',
            `Upsert concluído: ${created} novos, ${updated} atualizados`,
          ),
        );
      }
    }
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : getErrorMessage(err, 'Falha de conexão/acesso à API do Espaider (Erro desconhecido)');
    logs.push(createLog('error', 'Cronogramas', `Falha ao buscar dados: ${msg}`));
    errors++;
  }

  return {
    dataset: 'Cronogramas',
    total: created + updated + errors,
    created,
    updated,
    errors,
    durationMs: Date.now() - start,
  };
}

/**
 * Sync requirements (Requisitos) from Espaider -> Supabase.
 */
export async function syncRequirements(
  supabase: SupabaseClient,
  tenantId: string,
  logs: SyncLogEntry[],
  apiConfig?: EspaiderApiRow,
): Promise<DatasetSyncResult> {
  const start = Date.now();
  let created = 0;
  let updated = 0;
  let errors = 0;

  try {
    const identificador = apiConfig?.identificador || 'BI_SOLICITACOES_SUPORTEESPAIDER_REQUISITOS';
    logs.push(createLog('info', 'Requisitos', `Buscando dados do Espaider (${identificador})...`));

    const response = await exportarDados({
      identificador,
      baseUrl: apiConfig?.base_url,
      token: apiConfig?.token,
    });
    const registros = response.ListaRegistros || [];

    logs.push(
      createLog('info', 'Requisitos', `${registros.length} registros recebidos da API`, {
        count: registros.length,
      }),
    );

    if (registros.length === 0) {
      logs.push(createLog('warn', 'Requisitos', 'Nenhum registro retornado — pulando upsert'));
      return {
        dataset: 'Requisitos',
        total: 0,
        created: 0,
        updated: 0,
        errors: 0,
        durationMs: Date.now() - start,
      };
    }

    const mapped = mapearRegistros(registros, mapearRequisito);
    const projectMap = await getProjectIdMap(supabase, tenantId);

    const { data: existing } = await supabase
      .from('project_requirements')
      .select('espaider_id')
      .eq('tenant_id', tenantId);
    const existingIds = new Set(
      (existing || []).map((r: { espaider_id: number }) => r.espaider_id),
    );

    const rows = mapped
      .filter((r) => projectMap.has(r.projeto_id_espaider))
      .map((r) => ({
        tenant_id: tenantId,
        project_id: projectMap.get(r.projeto_id_espaider)!,
        espaider_id: r.id_espaider,
        codigo: r.codigo,
        descricao: r.descricao || null,
        tipo: r.tipo || null,
        prioridade: r.prioridade || 'Normal',
        status: r.status || 'Aberto',
        // === Novos campos (Migration 012) ===
        impacto: r.impacto || null,
        detalhamento: r.detalhamento || null,
        entrega_id_espaider: r.entrega_id_espaider || null,
        entrega_nome: r.entrega_nome || null,
        data_conclusao: r.data_conclusao ? r.data_conclusao.toISOString().split('T')[0] : null,
        espaider_raw: r.extras,
      }));

    const orphans = mapped.length - rows.length;
    if (orphans > 0) {
      logs.push(
        createLog(
          'warn',
          'Requisitos',
          `${orphans} registros ignorados (projeto pai não encontrado)`,
          { orphans },
        ),
      );
    }

    if (rows.length > 0) {
      const { error } = await supabase
        .from('project_requirements')
        .upsert(rows, { onConflict: 'tenant_id,espaider_id' });

      if (error) {
        logs.push(
          createLog('error', 'Requisitos', `Erro no upsert: ${error.message}`, {
            code: error.code,
          }),
        );
        errors = rows.length;
      } else {
        for (const row of rows) {
          if (existingIds.has(row.espaider_id)) updated++;
          else created++;
        }
        logs.push(
          createLog(
            'success',
            'Requisitos',
            `Upsert concluído: ${created} novos, ${updated} atualizados`,
          ),
        );
      }
    }
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : getErrorMessage(err, 'Falha de conexão/acesso à API do Espaider (Erro desconhecido)');
    logs.push(createLog('error', 'Requisitos', `Falha ao buscar dados: ${msg}`));
    errors++;
  }

  return {
    dataset: 'Requisitos',
    total: created + updated + errors,
    created,
    updated,
    errors,
    durationMs: Date.now() - start,
  };
}

// =============================================================================
// Orchestrator
// =============================================================================

/**
 * Map child dataset description to EspaiderDataset type
 * Handles null/undefined descriptions gracefully
 */
function descricaoToDataset(descricao: string | null | undefined): EspaiderDataset | null {
  if (!descricao) return null;
  const normalized = descricao.toLowerCase().trim();
  // Normaliza acentos para comparação mais robusta
  const noAccents = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (noAccents.includes('entrega') || noAccents.includes('delivery')) return 'Entregas';
  if (
    noAccents.includes('cronograma') ||
    noAccents.includes('schedule') ||
    noAccents.includes('atividade')
  )
    return 'Cronogramas';
  if (noAccents.includes('requisito') || noAccents.includes('requirement')) return 'Requisitos';
  if (
    noAccents.includes('historico') ||
    noAccents.includes('tramite') ||
    noAccents.includes('moviment')
  )
    return 'Historicos';
  if (
    noAccents.includes('orcamento') ||
    noAccents.includes('budget') ||
    noAccents.includes('custo')
  )
    return 'Orcamentos';
  if (
    noAccents.includes('aprovador') ||
    noAccents.includes('aprovacao') ||
    noAccents.includes('approver')
  )
    return 'Aprovadores';
  if (
    noAccents.includes('tempo') ||
    noAccents.includes('permanencia') ||
    noAccents.includes('fase')
  )
    return 'TempoPermanencia';
  if (
    noAccents.includes('hora') ||
    noAccents.includes('lancada') ||
    noAccents.includes('lancado') ||
    noAccents.includes('hours')
  )
    return 'HorasLancadas';
  return null;
}

/**
 * Execute full sync using hierarchical approach:
 * 1. POST to main API (Projetos) -> get projects + ListaURLFilhos
 * 2. GET each URL in ListaURLFilhos -> fetch children (entregas, cronogramas, requisitos)
 *
 * Uses single API config from espaider_apis table.
 */
export async function executeSyncAll(
  supabase: SupabaseClient,
  tenantId: string,
): Promise<SyncAllResult> {
  const overallStart = Date.now();
  const results: DatasetSyncResult[] = [];
  const logs: SyncLogEntry[] = [];

  logs.push(createLog('info', 'Geral', 'Iniciando sincronização hierárquica Espaider'));

  // Load API config (single API now)
  const apiConfigs = await loadApiConfigs(supabase, tenantId);
  const apiConfig = apiConfigs.get('projetos');

  if (!apiConfig) {
    logs.push(createLog('warn', 'Geral', 'Nenhuma API configurada — usando identificador padrão'));
  }

  // 1. Sync projects first (POST to main API)
  const projResult = await syncProjects(supabase, tenantId, logs, apiConfig);
  results.push(projResult);
  await logSyncResult(supabase, tenantId, 'Projetos', projResult);

  // 2. Fetch ListaURLFilhos from API response and sync children
  try {
    const identificador = apiConfig?.identificador || 'BI_SOLICITACOES_PROJETOSESPAIDER';
    logs.push(createLog('info', 'Geral', 'Buscando interfaces filhas via ListaURLFilhos...'));

    let response: any;
    try {
      response = await exportarDados({
        identificador,
        baseUrl: apiConfig?.base_url,
        token: apiConfig?.token,
      });
    } catch (apiErr) {
      const apiMsg = getErrorMessage(apiErr, 'Erro desconhecido na chamada à API');
      const detailedMsg = `Falha ao buscar ListaURLFilhos: Token pode estar inválido/expirado. Detalhes: ${apiMsg}`;
      logs.push(
        createLog('error', 'Geral', detailedMsg, {
          errorType: apiErr instanceof Error ? apiErr.name : 'Unknown',
          tokenStatus: 'verify_in_espaider',
        }),
      );
      throw new Error(detailedMsg);
    }

    const urlFilhos = response.ListaURLFilhos || [];
    logs.push(
      createLog('info', 'Geral', `${urlFilhos.length} interfaces filhas encontradas`, {
        interfaces: urlFilhos.map((u: any) => ({
          identificador: u.Identificador,
          descricao: u.Descricao,
          datasetDetectado:
            descricaoToDataset(u.Identificador || u.Descricao) ||
            descricaoToDataset(u.URL) ||
            'NAO_RECONHECIDO',
          url: u.URL?.substring(0, 80),
        })),
      }),
    );

    // Process each child interface
    for (const urlFilho of urlFilhos) {
      // Try to infer dataset from Identificador first (API retorna este campo), then Descricao, then URL
      let dataset = descricaoToDataset(urlFilho.Identificador || urlFilho.Descricao);
      if (!dataset && urlFilho.URL) {
        // Fallback: try to infer from URL pattern
        dataset = descricaoToDataset(urlFilho.URL);
      }
      if (!dataset) {
        logs.push(
          createLog('warn', 'Geral', `Interface filha não reconhecida`, {
            identificador: urlFilho.Identificador,
            descricao: urlFilho.Descricao,
            url: urlFilho.URL?.substring(0, 100),
          }),
        );
        continue;
      }

      logs.push(
        createLog(
          'info',
          dataset,
          `Buscando dados via GET: ${urlFilho.Descricao || urlFilho.URL?.substring(0, 50)}`,
        ),
      );

      try {
        const childResponse = await buscarFilhos(urlFilho.URL);
        const registros = childResponse.ListaRegistros || [];

        logs.push(createLog('info', dataset, `${registros.length} registros recebidos`));

        // Sync based on dataset type
        let childResult: DatasetSyncResult;
        if (dataset === 'Entregas') {
          childResult = await syncDeliveriesFromRegistros(supabase, tenantId, logs, registros);
        } else if (dataset === 'Cronogramas') {
          childResult = await syncSchedulesFromRegistros(supabase, tenantId, logs, registros);
        } else if (dataset === 'Requisitos') {
          childResult = await syncRequirementsFromRegistros(supabase, tenantId, logs, registros);
        } else if (dataset === 'Historicos') {
          childResult = await syncHistoriesFromRegistros(supabase, tenantId, logs, registros);
        } else if (dataset === 'Orcamentos') {
          childResult = await syncBudgetsFromRegistros(supabase, tenantId, logs, registros);
        } else if (dataset === 'TempoPermanencia') {
          childResult = await syncTempoPermanenciaFromRegistros(
            supabase,
            tenantId,
            logs,
            registros,
          );
        } else if (dataset === 'HorasLancadas') {
          childResult = await syncHorasLancadasFromRegistros(supabase, tenantId, logs, registros);
        } else if (dataset === 'Aprovadores') {
          childResult = await syncApproversFromRegistros(supabase, tenantId, logs, registros);
        } else {
          logs.push(createLog('warn', dataset, `Dataset desconhecido: ${dataset}`));
          childResult = {
            dataset,
            total: 0,
            created: 0,
            updated: 0,
            errors: 0,
            durationMs: 0,
          };
        }

        results.push(childResult);
        await logSyncResult(supabase, tenantId, dataset, childResult);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : (err as any)?.message ||
              'Falha de conexão/acesso à API do Espaider (Erro desconhecido)';
        logs.push(createLog('error', dataset, `Falha ao buscar ${urlFilho.Descricao}: ${msg}`));
        results.push({
          dataset,
          total: 0,
          created: 0,
          updated: 0,
          errors: 1,
          durationMs: 0,
        });
      }
    }
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : getErrorMessage(err, 'Falha de conexão/acesso à API do Espaider (Erro desconhecido)');
    logs.push(createLog('error', 'Geral', `Falha ao buscar ListaURLFilhos: ${msg}`));
  }

  // Update API status
  if (apiConfig) {
    const totalErrors = results.reduce((s, r) => s + r.errors, 0);
    await updateApiSyncStatus(supabase, apiConfig.id, totalErrors === 0 ? 'success' : 'failed');
  }

  // Aggregate
  const totalCreated = results.reduce((s, r) => s + r.created, 0);
  const totalUpdated = results.reduce((s, r) => s + r.updated, 0);
  let totalErrors = results.reduce((s, r) => s + r.errors, 0);
  const durationMs = Date.now() - overallStart;

  const success = totalErrors === 0;
  let message = success
    ? `Sincronização concluída: ${totalCreated} novos, ${totalUpdated} atualizados em ${(durationMs / 1000).toFixed(1)}s`
    : `Sincronização parcial: ${totalCreated} novos, ${totalUpdated} atualizados, ${totalErrors} erros em ${(durationMs / 1000).toFixed(1)}s`;

  logs.push(
    createLog(success ? 'success' : 'warn', 'Geral', message, {
      durationMs,
      totalCreated,
      totalUpdated,
      totalErrors,
    }),
  );

  // Persist detailed logs for history (LogViewer) — always, even on partial failure
  try {
    const globalRequestId = generateRequestId();
    const persistResult = await persistLogEntries(supabase, tenantId, globalRequestId, logs);
    console.log(
      `[executeSyncAll] ✅ Logs persistidos com sucesso: ${persistResult.persistedCount}/${logs.length} registros em integration_log_entries`,
    );
  } catch (logPersistErr) {
    // CRITICAL FIX #2: Log persistence failure is NOW VISIBLE in response
    const persistErrMsg =
      logPersistErr instanceof Error ? logPersistErr.message : String(logPersistErr);
    console.error('[executeSyncAll] ❌ Erro CRÍTICO ao persistir logs:', persistErrMsg);
    // Add error log entry for visibility
    logs.push(
      createLog(
        'error',
        'Geral',
        `Falha ao persistir histórico de sincronização em integration_log_entries: ${persistErrMsg}. Sincronização completada, mas logs podem não estar disponíveis em "Histórico de Sincronizações".`,
        { errorType: 'PersistenceFailure', context: 'LogPersistence' },
      ),
    );
    totalErrors++;
    message = `Sincronização parcial: ${totalCreated} novos, ${totalUpdated} atualizados, ${totalErrors} erros em ${(durationMs / 1000).toFixed(1)}s (⚠️ Logs não persistidos)`;
  }

  return {
    success,
    datasets: results,
    totalCreated,
    totalUpdated,
    totalErrors,
    durationMs,
    message,
    logs,
  };
}

// =============================================================================
// Sync from pre-fetched registros (for hierarchical flow)
// =============================================================================

/**
 * Sync deliveries from pre-fetched registros (from ListaURLFilhos GET)
 */
async function syncDeliveriesFromRegistros(
  supabase: SupabaseClient,
  tenantId: string,
  logs: SyncLogEntry[],
  registros: import('@/integrations/espaider/types').RegistroEspaider[],
): Promise<DatasetSyncResult> {
  const start = Date.now();
  let created = 0;
  let updated = 0;
  let errors = 0;

  try {
    const mapped = mapearRegistros(registros, mapearEntrega);
    const projectMap = await getProjectIdMap(supabase, tenantId);

    const { data: existing } = await supabase
      .from('project_deliveries')
      .select('espaider_id')
      .eq('tenant_id', tenantId);
    const existingIds = new Set(
      (existing || []).map((r: { espaider_id: number }) => r.espaider_id),
    );

    const rows = mapped
      .filter((e) => projectMap.has(e.projeto_id_espaider))
      .map((e) => ({
        tenant_id: tenantId,
        project_id: projectMap.get(e.projeto_id_espaider)!,
        espaider_id: e.id_espaider,
        titulo: e.titulo,
        status: e.status || 'Pendente',
        data_prevista: e.data_prevista ? e.data_prevista.toISOString().split('T')[0] : null,
        data_realizada: e.data_realizada ? e.data_realizada.toISOString().split('T')[0] : null,
        // === Novos campos (Migration 011) ===
        ordem: e.ordem || null,
        detalhamento: e.detalhamento || null,
        prioridade: e.prioridade || 'Normal',
        espaider_raw: e.extras,
      }));

    const orphans = mapped.length - rows.length;
    if (orphans > 0) {
      logs.push(
        createLog(
          'warn',
          'Entregas',
          `${orphans} registros ignorados (projeto pai não encontrado)`,
        ),
      );
    }

    if (rows.length > 0) {
      const { error } = await supabase
        .from('project_deliveries')
        .upsert(rows, { onConflict: 'tenant_id,espaider_id' });

      if (error) {
        logs.push(createLog('error', 'Entregas', `Erro no upsert: ${error.message}`));
        errors = rows.length;
      } else {
        for (const row of rows) {
          if (existingIds.has(row.espaider_id)) updated++;
          else created++;
        }
        logs.push(
          createLog(
            'success',
            'Entregas',
            `Upsert concluído: ${created} novos, ${updated} atualizados`,
          ),
        );
      }
    }
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : getErrorMessage(err, 'Falha de conexão/acesso à API do Espaider (Erro desconhecido)');
    logs.push(createLog('error', 'Entregas', `Falha no processamento: ${msg}`));
    errors++;
  }

  return {
    dataset: 'Entregas',
    total: created + updated + errors,
    created,
    updated,
    errors,
    durationMs: Date.now() - start,
  };
}

/**
 * Sync schedules from pre-fetched registros (from ListaURLFilhos GET)
 */
async function syncSchedulesFromRegistros(
  supabase: SupabaseClient,
  tenantId: string,
  logs: SyncLogEntry[],
  registros: import('@/integrations/espaider/types').RegistroEspaider[],
): Promise<DatasetSyncResult> {
  const start = Date.now();
  let created = 0;
  let updated = 0;
  let errors = 0;

  try {
    const mapped = mapearRegistros(registros, mapearCronograma);
    const projectMap = await getProjectIdMap(supabase, tenantId);

    const { data: existing } = await supabase
      .from('project_schedules')
      .select('espaider_id')
      .eq('tenant_id', tenantId);
    const existingIds = new Set(
      (existing || []).map((r: { espaider_id: number }) => r.espaider_id),
    );

    const rows = mapped
      .filter((c) => projectMap.has(c.projeto_id_espaider))
      .map((c) => ({
        tenant_id: tenantId,
        project_id: projectMap.get(c.projeto_id_espaider)!,
        espaider_id: c.id_espaider,
        atividade: c.atividade,
        responsavel: c.responsavel || null,
        data_inicio: c.data_inicio ? c.data_inicio.toISOString().split('T')[0] : null,
        data_fim: c.data_fim ? c.data_fim.toISOString().split('T')[0] : null,
        status: c.status || 'Pendente',
        // === Novos campos (Migration 010) ===
        fase_atividade: c.fase_atividade || null,
        atrasado: c.atrasado || false,
        setor_responsavel: c.setor_responsavel || null,
        item: c.item || null,
        detalhamento: c.detalhamento || null,
        data_prazo: c.data_prazo ? c.data_prazo.toISOString().split('T')[0] : null,
        data_novo_prazo: c.data_novo_prazo ? c.data_novo_prazo.toISOString().split('T')[0] : null,
        data_alerta_prazo: c.data_alerta_prazo
          ? c.data_alerta_prazo.toISOString().split('T')[0]
          : null,
        prazo_confirmado: c.prazo_confirmado || null,
        espaider_raw: c.extras,
      }));

    const orphans = mapped.length - rows.length;
    if (orphans > 0) {
      logs.push(
        createLog(
          'warn',
          'Cronogramas',
          `${orphans} registros ignorados (projeto pai não encontrado)`,
        ),
      );
    }

    if (rows.length > 0) {
      const { error } = await supabase
        .from('project_schedules')
        .upsert(rows, { onConflict: 'tenant_id,espaider_id' });

      if (error) {
        logs.push(createLog('error', 'Cronogramas', `Erro no upsert: ${error.message}`));
        errors = rows.length;
      } else {
        for (const row of rows) {
          if (existingIds.has(row.espaider_id)) updated++;
          else created++;
        }
        logs.push(
          createLog(
            'success',
            'Cronogramas',
            `Upsert concluído: ${created} novos, ${updated} atualizados`,
          ),
        );
      }
    }
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : getErrorMessage(err, 'Falha de conexão/acesso à API do Espaider (Erro desconhecido)');
    logs.push(createLog('error', 'Cronogramas', `Falha no processamento: ${msg}`));
    errors++;
  }

  return {
    dataset: 'Cronogramas',
    total: created + updated + errors,
    created,
    updated,
    errors,
    durationMs: Date.now() - start,
  };
}

/**
 * Sync requirements from pre-fetched registros (from ListaURLFilhos GET)
 */
async function syncRequirementsFromRegistros(
  supabase: SupabaseClient,
  tenantId: string,
  logs: SyncLogEntry[],
  registros: import('@/integrations/espaider/types').RegistroEspaider[],
): Promise<DatasetSyncResult> {
  const start = Date.now();
  let created = 0;
  let updated = 0;
  let errors = 0;

  try {
    const mapped = mapearRegistros(registros, mapearRequisito);
    const projectMap = await getProjectIdMap(supabase, tenantId);

    const { data: existing } = await supabase
      .from('project_requirements')
      .select('espaider_id')
      .eq('tenant_id', tenantId);
    const existingIds = new Set(
      (existing || []).map((r: { espaider_id: number }) => r.espaider_id),
    );

    const rows = mapped
      .filter((r) => projectMap.has(r.projeto_id_espaider))
      .map((r) => ({
        tenant_id: tenantId,
        project_id: projectMap.get(r.projeto_id_espaider)!,
        espaider_id: r.id_espaider,
        codigo: r.codigo,
        descricao: r.descricao || null,
        tipo: r.tipo || null,
        prioridade: r.prioridade || 'Normal',
        status: r.status || 'Aberto',
        // === Novos campos (Migration 012) ===
        impacto: r.impacto || null,
        detalhamento: r.detalhamento || null,
        entrega_id_espaider: r.entrega_id_espaider || null,
        entrega_nome: r.entrega_nome || null,
        data_conclusao: r.data_conclusao ? r.data_conclusao.toISOString().split('T')[0] : null,
        espaider_raw: r.extras,
      }));

    const orphans = mapped.length - rows.length;
    if (orphans > 0) {
      logs.push(
        createLog(
          'warn',
          'Requisitos',
          `${orphans} registros ignorados (projeto pai não encontrado)`,
        ),
      );
    }

    if (rows.length > 0) {
      const { error } = await supabase
        .from('project_requirements')
        .upsert(rows, { onConflict: 'tenant_id,espaider_id' });

      if (error) {
        logs.push(createLog('error', 'Requisitos', `Erro no upsert: ${error.message}`));
        errors = rows.length;
      } else {
        for (const row of rows) {
          if (existingIds.has(row.espaider_id)) updated++;
          else created++;
        }
        logs.push(
          createLog(
            'success',
            'Requisitos',
            `Upsert concluído: ${created} novos, ${updated} atualizados`,
          ),
        );
      }
    }
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : getErrorMessage(err, 'Falha de conexão/acesso à API do Espaider (Erro desconhecido)');
    logs.push(createLog('error', 'Requisitos', `Falha no processamento: ${msg}`));
    errors++;
  }

  return {
    dataset: 'Requisitos',
    total: created + updated + errors,
    created,
    updated,
    errors,
    durationMs: Date.now() - start,
  };
}

/**
 * Log sync result to the sync_logs table for audit.
 */
async function logSyncResult(
  supabase: SupabaseClient,
  tenantId: string,
  dataset: EspaiderDataset,
  result: DatasetSyncResult,
): Promise<void> {
  try {
    const now = new Date();
    await supabase.from('sync_logs').insert({
      tenant_id: tenantId,
      request_id: generateRequestId(),
      dataset,
      started_at: new Date(now.getTime() - result.durationMs).toISOString(),
      completed_at: now.toISOString(),
      duration_ms: result.durationMs,
      total_records: result.total,
      new_records: result.created,
      updated_records: result.updated,
      errors: result.errors,
      retries: 0,
      status:
        result.errors === 0
          ? 'success'
          : result.created + result.updated > 0
            ? 'partial'
            : 'failed',
      error_message: result.errors > 0 ? `${result.errors} records failed` : null,
    });
  } catch (err) {
    // Never let logging break the sync flow
    console.error('[sync] failed to write sync_log:', err);
  }
}

/**
 * Persist detailed log entries to integration_log_entries table.
 * Called after sync completion to save full audit trail for the LogViewer.
 * NOW WITH VALIDATION: Confirms that logs were actually inserted and throws on error.
 */
async function persistLogEntries(
  supabase: SupabaseClient,
  tenantId: string,
  requestId: string,
  logs: SyncLogEntry[],
): Promise<{ success: boolean; persistedCount: number }> {
  if (logs.length === 0) {
    return { success: true, persistedCount: 0 };
  }

  try {
    const rows = logs.map((log) => ({
      tenant_id: tenantId,
      request_id: requestId,
      level: log.level,
      dataset: log.dataset,
      message: log.message,
      details: log.details || null,
      logged_at: log.timestamp,
    }));

    // Batch insert in chunks of 100 to avoid large payloads
    const BATCH_SIZE = 100;
    let totalPersisted = 0;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const { error, count } = await supabase.from('integration_log_entries').insert(batch);

      // CRITICAL FIX #2: Validate insert success
      if (error) {
        const failMsg = `[persistLogEntries] Falha ao salvar batch de ${batch.length} logs em integration_log_entries: ${error.message}`;
        console.error(failMsg);
        throw new Error(failMsg);
      }

      if (!count || count === 0) {
        const zeroMsg = `[persistLogEntries] Nenhum log foi inserido na batch (esperado: ${batch.length}). Insert silencioso retornou count=0.`;
        console.error(zeroMsg);
        throw new Error(zeroMsg);
      }

      totalPersisted += count;
      console.log(
        `[persistLogEntries] ✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${count} logs persistidos`,
      );
    }

    if (totalPersisted === 0) {
      const totalMsg = `[persistLogEntries] Aviso: ${logs.length} logs mapeados, mas nenhum foi persistido!`;
      console.warn(totalMsg);
      throw new Error(totalMsg);
    }

    console.log(
      `[persistLogEntries] ✅ Sucesso total: ${totalPersisted}/${logs.length} logs persistidos em integration_log_entries`,
    );
    return { success: true, persistedCount: totalPersisted };
  } catch (err) {
    // CRITICAL FIX #2: DON'T silence this error!
    const errMsg = err instanceof Error ? err.message : String(err);
    const fullMsg = `[persistLogEntries] Erro crítico ao persistir logs de sincronização: ${errMsg}`;
    console.error(fullMsg);
    throw new Error(fullMsg);
  }
}

// =============================================================================
// Sync new children (Historicos, Orcamentos, Aprovadores)
// =============================================================================

/**
 * Sync histories from pre-fetched registros
 */
async function syncHistoriesFromRegistros(
  supabase: SupabaseClient,
  tenantId: string,
  logs: SyncLogEntry[],
  registros: import('@/integrations/espaider/types').RegistroEspaider[],
): Promise<DatasetSyncResult> {
  const start = Date.now();
  let created = 0;
  let updated = 0;
  let errors = 0;

  try {
    logs.push(
      createLog('info', 'Historicos', `Processando ${registros.length} registros brutos da API`),
    );

    // Log sample do primeiro registro para debug de campos
    if (registros.length > 0 && registros[0].ListaCampos) {
      const camposDisponiveis = registros[0].ListaCampos.map((c) => c.Identificador);
      logs.push(
        createLog(
          'info',
          'Historicos',
          `Campos disponíveis no primeiro registro: ${camposDisponiveis.join(', ')}`,
          {
            campos: camposDisponiveis,
            idEspaider: registros[0].IDEspaider,
          },
        ),
      );
    }

    const mapped = mapearRegistros(registros, mapearHistorico);
    logs.push(createLog('info', 'Historicos', `${mapped.length} registros mapeados`));

    if (mapped.length === 0) {
      logs.push(
        createLog(
          'warn',
          'Historicos',
          'Nenhum histórico mapeado — verificar estrutura de campos da API',
        ),
      );
      return {
        dataset: 'Historicos',
        total: 0,
        created: 0,
        updated: 0,
        errors: 0,
        durationMs: Date.now() - start,
      };
    }

    // Log amostra do mapeamento para verificar se IDREGISTROPAI vem preenchido
    const sampleMapped = mapped[0];
    logs.push(
      createLog(
        'info',
        'Historicos',
        `Amostra mapeada: espaider_id=${sampleMapped.id_espaider}, projeto_pai=${sampleMapped.projeto_id_espaider}, tipo=${sampleMapped.tipo || '(vazio)'}`,
        {
          sample: {
            id: sampleMapped.id_espaider,
            pai: sampleMapped.projeto_id_espaider,
            tipo: sampleMapped.tipo,
          },
        },
      ),
    );

    const projectMap = await getProjectIdMap(supabase, tenantId, logs);

    const { data: existing } = await supabase
      .from('project_histories')
      .select('espaider_id')
      .eq('tenant_id', tenantId);
    const existingIds = new Set(
      (existing || []).map((r: { espaider_id: number }) => r.espaider_id),
    );

    const rows = mapped
      .filter((r) => projectMap.has(r.projeto_id_espaider))
      .map((r) => ({
        tenant_id: tenantId,
        espaider_id: r.id_espaider,
        project_id: projectMap.get(r.projeto_id_espaider)!,
        type: r.tipo || null,
        responsible_to: r.responsavel_para || null,
        responsible_from: r.responsavel_de || null,
        step_to: r.passo_para || null,
        step_from: r.passo_de || null,
        procedure_number: r.numero_tramite || null,
        message: r.mensagem || null,
        date: r.data ? r.data.toISOString() : null,
        espaider_raw: r.espaider_raw || null,
      }));

    const orphans = mapped.length - rows.length;
    if (orphans > 0) {
      // Log detalhado dos IDs órfãos para diagnóstico
      const orphanIds = mapped
        .filter((r) => !projectMap.has(r.projeto_id_espaider))
        .map((r) => r.projeto_id_espaider)
        .filter((v, i, a) => a.indexOf(v) === i) // unique
        .slice(0, 10);
      logs.push(
        createLog(
          'warn',
          'Historicos',
          `${orphans} registros ignorados (projeto pai não encontrado). IDs pai únicos (amostra): ${orphanIds.join(', ')}`,
          {
            orphanParentIds: orphanIds,
          },
        ),
      );
    }

    logs.push(
      createLog(
        'info',
        'Historicos',
        `${rows.length} registros prontos para upsert (${existingIds.size} já existem no BD)`,
      ),
    );

    if (rows.length > 0) {
      const { error } = await supabase
        .from('project_histories')
        .upsert(rows, { onConflict: 'tenant_id,espaider_id' });

      if (error) {
        logs.push(
          createLog('error', 'Historicos', `Erro no upsert: ${error.message}`, {
            code: error.code,
            details: error.details,
            hint: error.hint,
          }),
        );
        errors = rows.length;
      } else {
        for (const row of rows) {
          if (existingIds.has(row.espaider_id)) updated++;
          else created++;
        }
        logs.push(
          createLog(
            'success',
            'Historicos',
            `Upsert concluído: ${created} novos, ${updated} atualizados`,
          ),
        );
      }
    } else {
      logs.push(
        createLog(
          'warn',
          'Historicos',
          'Nenhum registro a inserir após filtros (todos órfãos ou sem dados)',
        ),
      );
    }
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : getErrorMessage(err, 'Falha de conexão/acesso à API do Espaider (Erro desconhecido)');
    logs.push(
      createLog('error', 'Historicos', `Falha no processamento: ${msg}`, {
        stack: err instanceof Error ? err.stack?.substring(0, 500) : undefined,
      }),
    );
    errors++;
  }

  return {
    dataset: 'Historicos',
    total: created + updated + errors,
    created,
    updated,
    errors,
    durationMs: Date.now() - start,
  };
}

/**
 * Sync budgets from pre-fetched registros
 */
async function syncBudgetsFromRegistros(
  supabase: SupabaseClient,
  tenantId: string,
  logs: SyncLogEntry[],
  registros: import('@/integrations/espaider/types').RegistroEspaider[],
): Promise<DatasetSyncResult> {
  const start = Date.now();
  let created = 0;
  let updated = 0;
  let errors = 0;

  try {
    logs.push(
      createLog('info', 'Orcamentos', `Processando ${registros.length} registros brutos da API`),
    );

    if (registros.length > 0 && registros[0].ListaCampos) {
      const camposDisponiveis = registros[0].ListaCampos.map((c) => c.Identificador);
      logs.push(
        createLog('info', 'Orcamentos', `Campos disponíveis: ${camposDisponiveis.join(', ')}`, {
          campos: camposDisponiveis,
        }),
      );
    }

    const mapped = mapearRegistros(registros, mapearOrcamento);
    logs.push(createLog('info', 'Orcamentos', `${mapped.length} registros mapeados`));

    if (mapped.length === 0) {
      logs.push(createLog('warn', 'Orcamentos', 'Nenhum orçamento mapeado'));
      return {
        dataset: 'Orcamentos',
        total: 0,
        created: 0,
        updated: 0,
        errors: 0,
        durationMs: Date.now() - start,
      };
    }

    const projectMap = await getProjectIdMap(supabase, tenantId, logs);

    const { data: existing } = await supabase
      .from('project_budgets')
      .select('espaider_id')
      .eq('tenant_id', tenantId);
    const existingIds = new Set(
      (existing || []).map((r: { espaider_id: number }) => r.espaider_id),
    );

    const rows = mapped
      .filter((r) => projectMap.has(r.projeto_id_espaider))
      .map((r) => ({
        tenant_id: tenantId,
        espaider_id: r.id_espaider,
        project_id: projectMap.get(r.projeto_id_espaider)!,
        value: r.valor,
        provider: r.fornecedor || null,
        quotation_date: r.data_cotacao ? r.data_cotacao.toISOString().split('T')[0] : null,
        moeda: r.moeda || 'BRL',
        espaider_raw: r.espaider_raw || null,
      }));

    const orphans = mapped.length - rows.length;
    if (orphans > 0) {
      const orphanIds = mapped
        .filter((r) => !projectMap.has(r.projeto_id_espaider))
        .map((r) => r.projeto_id_espaider)
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 10);
      logs.push(
        createLog(
          'warn',
          'Orcamentos',
          `${orphans} registros ignorados (projeto pai não encontrado). IDs pai: ${orphanIds.join(', ')}`,
          { orphanParentIds: orphanIds },
        ),
      );
    }

    logs.push(createLog('info', 'Orcamentos', `${rows.length} registros prontos para upsert`));

    if (rows.length > 0) {
      const { error } = await supabase
        .from('project_budgets')
        .upsert(rows, { onConflict: 'tenant_id,espaider_id' });

      if (error) {
        logs.push(
          createLog('error', 'Orcamentos', `Erro no upsert: ${error.message}`, {
            code: error.code,
            details: error.details,
            hint: error.hint,
          }),
        );
        errors = rows.length;
      } else {
        for (const row of rows) {
          if (existingIds.has(row.espaider_id)) updated++;
          else created++;
        }
        logs.push(
          createLog(
            'success',
            'Orcamentos',
            `Upsert concluído: ${created} novos, ${updated} atualizados`,
          ),
        );
      }
    } else {
      logs.push(createLog('warn', 'Orcamentos', 'Nenhum registro a inserir após filtros'));
    }
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : getErrorMessage(err, 'Falha de conexão/acesso à API do Espaider (Erro desconhecido)');
    logs.push(
      createLog('error', 'Orcamentos', `Falha no processamento: ${msg}`, {
        stack: err instanceof Error ? err.stack?.substring(0, 500) : undefined,
      }),
    );
    errors++;
  }

  return {
    dataset: 'Orcamentos',
    total: created + updated + errors,
    created,
    updated,
    errors,
    durationMs: Date.now() - start,
  };
}

/**
 * Sync approvers from pre-fetched registros
 */
async function syncApproversFromRegistros(
  supabase: SupabaseClient,
  tenantId: string,
  logs: SyncLogEntry[],
  registros: import('@/integrations/espaider/types').RegistroEspaider[],
): Promise<DatasetSyncResult> {
  const start = Date.now();
  let created = 0;
  let updated = 0;
  let errors = 0;

  try {
    logs.push(
      createLog('info', 'Aprovadores', `Processando ${registros.length} registros brutos da API`),
    );

    if (registros.length > 0 && registros[0].ListaCampos) {
      const camposDisponiveis = registros[0].ListaCampos.map((c) => c.Identificador);
      logs.push(
        createLog('info', 'Aprovadores', `Campos disponíveis: ${camposDisponiveis.join(', ')}`, {
          campos: camposDisponiveis,
        }),
      );
    }

    const mapped = mapearRegistros(registros, mapearAprovador);
    logs.push(createLog('info', 'Aprovadores', `${mapped.length} registros mapeados`));

    if (mapped.length === 0) {
      logs.push(createLog('warn', 'Aprovadores', 'Nenhum aprovador mapeado'));
      return {
        dataset: 'Aprovadores',
        total: 0,
        created: 0,
        updated: 0,
        errors: 0,
        durationMs: Date.now() - start,
      };
    }

    // Log amostra do mapeamento
    const sampleMapped = mapped[0];
    logs.push(
      createLog(
        'info',
        'Aprovadores',
        `Amostra mapeada: espaider_id=${sampleMapped.id_espaider}, projeto_pai=${sampleMapped.projeto_id_espaider}, tipo=${sampleMapped.tipo || '(vazio)'}`,
        {
          sample: {
            id: sampleMapped.id_espaider,
            pai: sampleMapped.projeto_id_espaider,
            tipo: sampleMapped.tipo,
          },
        },
      ),
    );

    const projectMap = await getProjectIdMap(supabase, tenantId, logs);

    const { data: existing } = await supabase
      .from('project_approvers')
      .select('espaider_id')
      .eq('tenant_id', tenantId);
    const existingIds = new Set(
      (existing || []).map((r: { espaider_id: number }) => r.espaider_id),
    );

    const rows = mapped
      .filter((r) => projectMap.has(r.projeto_id_espaider))
      .map((r) => ({
        tenant_id: tenantId,
        espaider_id: r.id_espaider,
        project_id: projectMap.get(r.projeto_id_espaider)!,
        type: r.tipo || null,
        responsible: r.responsavel || null,
        attention_points: r.pontos_atencao || null,
        espaider_raw: r.espaider_raw || null,
      }));

    const orphans = mapped.length - rows.length;
    if (orphans > 0) {
      const orphanIds = mapped
        .filter((r) => !projectMap.has(r.projeto_id_espaider))
        .map((r) => r.projeto_id_espaider)
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 10);
      logs.push(
        createLog(
          'warn',
          'Aprovadores',
          `${orphans} registros ignorados (projeto pai não encontrado). IDs pai: ${orphanIds.join(', ')}`,
          { orphanParentIds: orphanIds },
        ),
      );
    }

    logs.push(createLog('info', 'Aprovadores', `${rows.length} registros prontos para upsert`));

    if (rows.length > 0) {
      const { error } = await supabase
        .from('project_approvers')
        .upsert(rows, { onConflict: 'tenant_id,espaider_id' });

      if (error) {
        logs.push(
          createLog('error', 'Aprovadores', `Erro no upsert: ${error.message}`, {
            code: error.code,
            details: error.details,
            hint: error.hint,
          }),
        );
        errors = rows.length;
      } else {
        for (const row of rows) {
          if (existingIds.has(row.espaider_id)) updated++;
          else created++;
        }
        logs.push(
          createLog(
            'success',
            'Aprovadores',
            `Upsert concluído: ${created} novos, ${updated} atualizados`,
          ),
        );
      }
    } else {
      logs.push(createLog('warn', 'Aprovadores', 'Nenhum registro a inserir após filtros'));
    }
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : getErrorMessage(err, 'Falha de conexão/acesso à API do Espaider (Erro desconhecido)');
    logs.push(
      createLog('error', 'Aprovadores', `Falha no processamento: ${msg}`, {
        stack: err instanceof Error ? err.stack?.substring(0, 500) : undefined,
      }),
    );
    errors++;
  }

  return {
    dataset: 'Aprovadores',
    total: created + updated + errors,
    created,
    updated,
    errors,
    durationMs: Date.now() - start,
  };
}

// =============================================================================
// Child datasets via ListaURLFilhos
// =============================================================================

// =============================================================================
// TempoPermanencia — Re-habilitado em 2026-03-20
// =============================================================================

async function syncTempoPermanenciaFromRegistros(
  supabase: SupabaseClient,
  tenantId: string,
  logs: SyncLogEntry[],
  registros: import('@/integrations/espaider/types').RegistroEspaider[],
): Promise<DatasetSyncResult> {
  const start = Date.now();
  let created = 0;
  let updated = 0;
  let errors = 0;

  try {
    logs.push(
      createLog(
        'info',
        'TempoPermanencia',
        `Processando ${registros.length} registros brutos da API`,
      ),
    );

    if (registros.length > 0 && registros[0].ListaCampos) {
      const camposDisponiveis = registros[0].ListaCampos.map((c) => c.Identificador);
      logs.push(
        createLog(
          'info',
          'TempoPermanencia',
          `Campos disponíveis: ${camposDisponiveis.join(', ')}`,
          { campos: camposDisponiveis },
        ),
      );
    }

    const mapped = mapearRegistros(registros, mapearTempoPermanencia);
    logs.push(createLog('info', 'TempoPermanencia', `${mapped.length} registros mapeados`));

    if (mapped.length === 0) {
      logs.push(createLog('warn', 'TempoPermanencia', 'Nenhum registro mapeado'));
      return {
        dataset: 'TempoPermanencia',
        total: 0,
        created: 0,
        updated: 0,
        errors: 0,
        durationMs: Date.now() - start,
      };
    }

    const s = mapped[0];
    logs.push(
      createLog(
        'info',
        'TempoPermanencia',
        `Amostra: espaider_id=${s.id_espaider}, projeto_pai=${s.projeto_id_espaider}, fase=${s.fase || '(vazio)'}`,
        {
          sample: {
            id: s.id_espaider,
            pai: s.projeto_id_espaider,
            fase: s.fase,
            tempo: s.tempo_permanencia_dias,
          },
        },
      ),
    );

    const projectMap = await getProjectIdMap(supabase, tenantId, logs);

    const { data: existing } = await supabase
      .from('project_tempo_permanencia')
      .select('espaider_id')
      .eq('tenant_id', tenantId);
    const existingIds = new Set(
      (existing || []).map((r: { espaider_id: number }) => r.espaider_id),
    );

    const rows = mapped
      .filter((r) => projectMap.has(r.projeto_id_espaider))
      .map((r) => ({
        tenant_id: tenantId,
        espaider_id: r.id_espaider,
        project_id: projectMap.get(r.projeto_id_espaider)!,
        fase: r.fase || null,
        responsavel: r.responsavel || null,
        situacao: r.situacao || null,
        tempo_permanencia_dias: r.tempo_permanencia_dias ?? null,
        data_inicio: r.data_inicio ? r.data_inicio.toISOString().split('T')[0] : null,
        data_fim: r.data_fim ? r.data_fim.toISOString().split('T')[0] : null,
        espaider_raw: r.espaider_raw || null,
      }));

    const orphans = mapped.length - rows.length;
    if (orphans > 0) {
      const orphanIds = mapped
        .filter((r) => !projectMap.has(r.projeto_id_espaider))
        .map((r) => r.projeto_id_espaider)
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 10);
      logs.push(
        createLog(
          'warn',
          'TempoPermanencia',
          `${orphans} ignorados (projeto pai não encontrado). IDs pai: ${orphanIds.join(', ')}`,
          { orphanParentIds: orphanIds },
        ),
      );
    }

    logs.push(
      createLog('info', 'TempoPermanencia', `${rows.length} registros prontos para upsert`),
    );

    if (rows.length > 0) {
      const { error } = await supabase
        .from('project_tempo_permanencia')
        .upsert(rows, { onConflict: 'tenant_id,espaider_id' });
      if (error) {
        logs.push(
          createLog('error', 'TempoPermanencia', `Erro no upsert: ${error.message}`, {
            code: error.code,
            details: error.details,
            hint: error.hint,
          }),
        );
        errors = rows.length;
      } else {
        for (const row of rows) {
          if (existingIds.has(row.espaider_id)) updated++;
          else created++;
        }
        logs.push(
          createLog(
            'success',
            'TempoPermanencia',
            `Upsert concluído: ${created} novos, ${updated} atualizados`,
          ),
        );
      }
    } else {
      logs.push(createLog('warn', 'TempoPermanencia', 'Nenhum registro a inserir após filtros'));
    }
  } catch (err) {
    const msg = getErrorMessage(err, 'Erro desconhecido');
    logs.push(
      createLog('error', 'TempoPermanencia', `Falha no processamento: ${msg}`, {
        stack: err instanceof Error ? err.stack?.substring(0, 500) : undefined,
      }),
    );
    errors++;
  }

  return {
    dataset: 'TempoPermanencia',
    total: created + updated + errors,
    created,
    updated,
    errors,
    durationMs: Date.now() - start,
  };
}

// =============================================================================
// HorasLancadas — Re-habilitado em 2026-03-20
// =============================================================================

async function syncHorasLancadasFromRegistros(
  supabase: SupabaseClient,
  tenantId: string,
  logs: SyncLogEntry[],
  registros: import('@/integrations/espaider/types').RegistroEspaider[],
): Promise<DatasetSyncResult> {
  const start = Date.now();
  let created = 0;
  let updated = 0;
  let errors = 0;

  try {
    logs.push(
      createLog('info', 'HorasLancadas', `Processando ${registros.length} registros brutos da API`),
    );

    if (registros.length > 0 && registros[0].ListaCampos) {
      const camposDisponiveis = registros[0].ListaCampos.map((c) => c.Identificador);
      logs.push(
        createLog('info', 'HorasLancadas', `Campos disponíveis: ${camposDisponiveis.join(', ')}`, {
          campos: camposDisponiveis,
        }),
      );
    }

    const mapped = mapearRegistros(registros, mapearHoraLancada);
    logs.push(createLog('info', 'HorasLancadas', `${mapped.length} registros mapeados`));

    if (mapped.length === 0) {
      logs.push(createLog('warn', 'HorasLancadas', 'Nenhum registro mapeado'));
      return {
        dataset: 'HorasLancadas',
        total: 0,
        created: 0,
        updated: 0,
        errors: 0,
        durationMs: Date.now() - start,
      };
    }

    const s = mapped[0];
    logs.push(
      createLog(
        'info',
        'HorasLancadas',
        `Amostra: espaider_id=${s.id_espaider}, projeto_pai=${s.projeto_id_espaider}, profissional=${s.profissional || '(vazio)'}`,
        {
          sample: {
            id: s.id_espaider,
            pai: s.projeto_id_espaider,
            profissional: s.profissional,
            horas: s.horas,
            data: s.data_lancamento,
          },
        },
      ),
    );

    // Fetch project map with cache — needed for triple-lookup
    const { data: allProjects } = await supabase
      .from('projects')
      .select('id, espaider_id, pasta_consultivo_id, pasta_consultivo')
      .eq('tenant_id', tenantId);

    const projectMap = new Map<number, string>();
    const pastaIdMap = new Map<number, string>();
    const pastaTextMap = new Map<string, string>();

    if (allProjects) {
      for (const proj of allProjects) {
        if (proj.espaider_id) projectMap.set(proj.espaider_id, proj.id);
        if (proj.pasta_consultivo_id) pastaIdMap.set(proj.pasta_consultivo_id, proj.id);
        if (proj.pasta_consultivo) {
          const normalized = proj.pasta_consultivo.toLowerCase().trim();
          pastaTextMap.set(normalized, proj.id);
        }
      }
    }

    const { data: existing } = await supabase
      .from('project_horas_lancadas')
      .select('espaider_id')
      .eq('tenant_id', tenantId);
    const existingIds = new Set(
      (existing || []).map((r: { espaider_id: number }) => r.espaider_id),
    );

    const rows = mapped
      .filter((r) => {
        const projectId =
          projectMap.get(r.projeto_id_espaider) ||
          (r.pasta_consultivo_id ? pastaIdMap.get(r.pasta_consultivo_id) : undefined) ||
          (r.pasta_consultivo_texto
            ? pastaTextMap.get(r.pasta_consultivo_texto.toLowerCase().trim())
            : undefined);
        return !!projectId;
      })
      .map((r) => {
        const projectId =
          projectMap.get(r.projeto_id_espaider) ||
          (r.pasta_consultivo_id ? pastaIdMap.get(r.pasta_consultivo_id) : undefined) ||
          (r.pasta_consultivo_texto
            ? pastaTextMap.get(r.pasta_consultivo_texto.toLowerCase().trim())
            : undefined);

        return {
          tenant_id: tenantId,
          espaider_id: r.id_espaider,
          project_id: projectId!,
          solicitacao_id: r.solicitacao_id || null,
          pasta_consultivo_id: r.pasta_consultivo_id || null,
          profissional: r.profissional || null,
          horas: r.horas ?? null,
          data_lancamento: r.data_lancamento ? r.data_lancamento.toISOString().split('T')[0] : null,
          tipo_lancamento: r.tipo_lancamento || null,
          espaider_raw: r.espaider_raw || null,
        };
      });

    const orphans = mapped.length - rows.length;
    if (orphans > 0) {
      const orphanIds = mapped
        .filter((r) => {
          const projectId =
            projectMap.get(r.projeto_id_espaider) ||
            (r.pasta_consultivo_id ? pastaIdMap.get(r.pasta_consultivo_id) : undefined) ||
            (r.pasta_consultivo_texto
              ? pastaTextMap.get(r.pasta_consultivo_texto.toLowerCase().trim())
              : undefined);
          return !projectId;
        })
        .map((r) => `proj=${r.projeto_id_espaider},pasta_id=${r.pasta_consultivo_id}`)
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 5);
      logs.push(
        createLog(
          'warn',
          'HorasLancadas',
          `${orphans} ignorados (projeto pai não encontrado via triple-lookup). Referências: ${orphanIds.join('; ')}`,
          { orphanCount: orphans, orphanRefs: orphanIds },
        ),
      );
    }

    logs.push(createLog('info', 'HorasLancadas', `${rows.length} registros prontos para upsert`));

    if (rows.length > 0) {
      const { error } = await supabase
        .from('project_horas_lancadas')
        .upsert(rows, { onConflict: 'tenant_id,espaider_id' });
      if (error) {
        logs.push(
          createLog('error', 'HorasLancadas', `Erro no upsert: ${error.message}`, {
            code: error.code,
            details: error.details,
            hint: error.hint,
          }),
        );
        errors = rows.length;
      } else {
        for (const row of rows) {
          if (existingIds.has(row.espaider_id)) updated++;
          else created++;
        }
        logs.push(
          createLog(
            'success',
            'HorasLancadas',
            `Upsert concluído: ${created} novos, ${updated} atualizados`,
          ),
        );
      }
    } else {
      logs.push(createLog('warn', 'HorasLancadas', 'Nenhum registro a inserir após filtros'));
    }
  } catch (err) {
    const msg = getErrorMessage(err, 'Erro desconhecido');
    logs.push(
      createLog('error', 'HorasLancadas', `Falha no processamento: ${msg}`, {
        stack: err instanceof Error ? err.stack?.substring(0, 500) : undefined,
      }),
    );
    errors++;
  }

  return {
    dataset: 'HorasLancadas',
    total: created + updated + errors,
    created,
    updated,
    errors,
    durationMs: Date.now() - start,
  };
}
