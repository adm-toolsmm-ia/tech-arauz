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
  mapearProjeto,
  mapearEntrega,
  mapearCronograma,
  mapearRequisito,
  mapearHistorico,
  mapearOrcamento,
  mapearAprovador,
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
      // Fallback to env vars for placeholder or missing credentials
      if (row.token === 'PREENCHER_TOKEN' || !row.token) {
        row.token = process.env.ESPAIDER_TOKEN || row.token;
      }
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
  'novo': 'projeto_futuro',
  'futuro': 'projeto_futuro',
  'projetofuturo': 'projeto_futuro',
  'concluído': 'concluido',
  'concluido': 'concluido',
  'finalizado': 'concluido',
  'encerrado': 'concluido',
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
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
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
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
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

    logs.push(createLog('info', 'Projetos', `${registros.length} registros recebidos da API`, { count: registros.length }));

    if (registros.length === 0) {
      logs.push(createLog('warn', 'Projetos', 'Nenhum registro retornado — pulando upsert'));
      return { dataset: 'Projetos', total: 0, created: 0, updated: 0, errors: 0, durationMs: Date.now() - start };
    }

    const mapped = mapearRegistros(registros, mapearProjeto);
    logs.push(createLog('info', 'Projetos', `${mapped.length} registros mapeados com sucesso`));

    const { data: existing } = await supabase
      .from('projects')
      .select('espaider_id')
      .eq('tenant_id', tenantId);
    const existingIds = new Set((existing || []).map((r: { espaider_id: number }) => r.espaider_id));

    const rows = mapped.map((p) => ({
      tenant_id: tenantId,
      espaider_id: p.id_espaider,
      codigo: p.codigo,
      titulo: p.titulo,
      status: normalizeStatus(p.situacao_atual || p.status),
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
      espaider_raw: p.extras,
      sync_status: 'synced',
      last_sync_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('projects')
      .upsert(rows, { onConflict: 'tenant_id,espaider_id' });

    if (error) {
      logs.push(createLog('error', 'Projetos', `Erro no upsert: ${error.message}`, { code: error.code }));
      errors = rows.length;
    } else {
      for (const row of rows) {
        if (existingIds.has(row.espaider_id)) updated++;
        else created++;
      }
      logs.push(createLog('success', 'Projetos', `Upsert concluído: ${created} novos, ${updated} atualizados`));
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
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
): Promise<Map<number, string>> {
  const { data } = await supabase
    .from('projects')
    .select('id, espaider_id')
    .eq('tenant_id', tenantId);

  const map = new Map<number, string>();
  for (const row of data || []) {
    map.set(row.espaider_id, row.id);
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

    logs.push(createLog('info', 'Entregas', `${registros.length} registros recebidos da API`, { count: registros.length }));

    if (registros.length === 0) {
      logs.push(createLog('warn', 'Entregas', 'Nenhum registro retornado — pulando upsert'));
      return { dataset: 'Entregas', total: 0, created: 0, updated: 0, errors: 0, durationMs: Date.now() - start };
    }

    const mapped = mapearRegistros(registros, mapearEntrega);
    const projectMap = await getProjectIdMap(supabase, tenantId);

    const { data: existing } = await supabase
      .from('project_deliveries')
      .select('espaider_id')
      .eq('tenant_id', tenantId);
    const existingIds = new Set((existing || []).map((r: { espaider_id: number }) => r.espaider_id));

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
      logs.push(createLog('warn', 'Entregas', `${orphans} registros ignorados (projeto pai não encontrado)`, { orphans }));
    }

    if (rows.length > 0) {
      const { error } = await supabase
        .from('project_deliveries')
        .upsert(rows, { onConflict: 'tenant_id,espaider_id' });

      if (error) {
        logs.push(createLog('error', 'Entregas', `Erro no upsert: ${error.message}`, { code: error.code }));
        errors = rows.length;
      } else {
        for (const row of rows) {
          if (existingIds.has(row.espaider_id)) updated++;
          else created++;
        }
        logs.push(createLog('success', 'Entregas', `Upsert concluído: ${created} novos, ${updated} atualizados`));
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    logs.push(createLog('error', 'Entregas', `Falha ao buscar dados: ${msg}`));
    errors++;
  }

  return { dataset: 'Entregas', total: created + updated + errors, created, updated, errors, durationMs: Date.now() - start };
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

    logs.push(createLog('info', 'Cronogramas', `${registros.length} registros recebidos da API`, { count: registros.length }));

    if (registros.length === 0) {
      logs.push(createLog('warn', 'Cronogramas', 'Nenhum registro retornado — pulando upsert'));
      return { dataset: 'Cronogramas', total: 0, created: 0, updated: 0, errors: 0, durationMs: Date.now() - start };
    }

    const mapped = mapearRegistros(registros, mapearCronograma);
    const projectMap = await getProjectIdMap(supabase, tenantId);

    const { data: existing } = await supabase
      .from('project_schedules')
      .select('espaider_id')
      .eq('tenant_id', tenantId);
    const existingIds = new Set((existing || []).map((r: { espaider_id: number }) => r.espaider_id));

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
        data_alerta_prazo: c.data_alerta_prazo ? c.data_alerta_prazo.toISOString().split('T')[0] : null,
        prazo_confirmado: c.prazo_confirmado || null,
        espaider_raw: c.extras,
      }));

    const orphans = mapped.length - rows.length;
    if (orphans > 0) {
      logs.push(createLog('warn', 'Cronogramas', `${orphans} registros ignorados (projeto pai não encontrado)`, { orphans }));
    }

    if (rows.length > 0) {
      const { error } = await supabase
        .from('project_schedules')
        .upsert(rows, { onConflict: 'tenant_id,espaider_id' });

      if (error) {
        logs.push(createLog('error', 'Cronogramas', `Erro no upsert: ${error.message}`, { code: error.code }));
        errors = rows.length;
      } else {
        for (const row of rows) {
          if (existingIds.has(row.espaider_id)) updated++;
          else created++;
        }
        logs.push(createLog('success', 'Cronogramas', `Upsert concluído: ${created} novos, ${updated} atualizados`));
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    logs.push(createLog('error', 'Cronogramas', `Falha ao buscar dados: ${msg}`));
    errors++;
  }

  return { dataset: 'Cronogramas', total: created + updated + errors, created, updated, errors, durationMs: Date.now() - start };
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

    logs.push(createLog('info', 'Requisitos', `${registros.length} registros recebidos da API`, { count: registros.length }));

    if (registros.length === 0) {
      logs.push(createLog('warn', 'Requisitos', 'Nenhum registro retornado — pulando upsert'));
      return { dataset: 'Requisitos', total: 0, created: 0, updated: 0, errors: 0, durationMs: Date.now() - start };
    }

    const mapped = mapearRegistros(registros, mapearRequisito);
    const projectMap = await getProjectIdMap(supabase, tenantId);

    const { data: existing } = await supabase
      .from('project_requirements')
      .select('espaider_id')
      .eq('tenant_id', tenantId);
    const existingIds = new Set((existing || []).map((r: { espaider_id: number }) => r.espaider_id));

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
      logs.push(createLog('warn', 'Requisitos', `${orphans} registros ignorados (projeto pai não encontrado)`, { orphans }));
    }

    if (rows.length > 0) {
      const { error } = await supabase
        .from('project_requirements')
        .upsert(rows, { onConflict: 'tenant_id,espaider_id' });

      if (error) {
        logs.push(createLog('error', 'Requisitos', `Erro no upsert: ${error.message}`, { code: error.code }));
        errors = rows.length;
      } else {
        for (const row of rows) {
          if (existingIds.has(row.espaider_id)) updated++;
          else created++;
        }
        logs.push(createLog('success', 'Requisitos', `Upsert concluído: ${created} novos, ${updated} atualizados`));
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    logs.push(createLog('error', 'Requisitos', `Falha ao buscar dados: ${msg}`));
    errors++;
  }

  return { dataset: 'Requisitos', total: created + updated + errors, created, updated, errors, durationMs: Date.now() - start };
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
  if (normalized.includes('entrega')) return 'Entregas';
  if (normalized.includes('cronograma')) return 'Cronogramas';
  if (normalized.includes('requisito')) return 'Requisitos';
  if (normalized.includes('histórico') || normalized.includes('historico')) return 'Historicos';
  if (normalized.includes('orçamento') || normalized.includes('orcamento')) return 'Orcamentos';
  if (normalized.includes('aprovador')) return 'Aprovadores';
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

    const response = await exportarDados({
      identificador,
      baseUrl: apiConfig?.base_url,
      token: apiConfig?.token,
    });

    const urlFilhos = response.ListaURLFilhos || [];
    logs.push(createLog('info', 'Geral', `${urlFilhos.length} interfaces filhas encontradas`, {
      interfaces: urlFilhos.map(u => ({ descricao: u.Descricao, url: u.URL?.substring(0, 80) })),
    }));

    // Process each child interface
    for (const urlFilho of urlFilhos) {
      // Try to infer dataset from Descricao first, then from URL if needed
      let dataset = descricaoToDataset(urlFilho.Descricao);
      if (!dataset && urlFilho.URL) {
        // Fallback: try to infer from URL pattern
        dataset = descricaoToDataset(urlFilho.URL);
      }
      if (!dataset) {
        logs.push(createLog('warn', 'Geral', `Interface filha não reconhecida`, {
          descricao: urlFilho.Descricao,
          url: urlFilho.URL?.substring(0, 100),
        }));
        continue;
      }

      logs.push(createLog('info', dataset, `Buscando dados via GET: ${urlFilho.Descricao || urlFilho.URL?.substring(0, 50)}`));

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
        } else {
          childResult = await syncApproversFromRegistros(supabase, tenantId, logs, registros);
        }

        results.push(childResult);
        await logSyncResult(supabase, tenantId, dataset, childResult);

      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro desconhecido';
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
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
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
  const totalErrors = results.reduce((s, r) => s + r.errors, 0);
  const durationMs = Date.now() - overallStart;

  const success = totalErrors === 0;
  const message = success
    ? `Sincronização concluída: ${totalCreated} novos, ${totalUpdated} atualizados em ${(durationMs / 1000).toFixed(1)}s`
    : `Sincronização parcial: ${totalCreated} novos, ${totalUpdated} atualizados, ${totalErrors} erros em ${(durationMs / 1000).toFixed(1)}s`;

  logs.push(createLog(success ? 'success' : 'warn', 'Geral', message, { durationMs, totalCreated, totalUpdated, totalErrors }));

  // Persist detailed logs for history (LogViewer)
  const globalRequestId = generateRequestId();
  await persistLogEntries(supabase, tenantId, globalRequestId, logs);

  return { success, datasets: results, totalCreated, totalUpdated, totalErrors, durationMs, message, logs };
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
    const existingIds = new Set((existing || []).map((r: { espaider_id: number }) => r.espaider_id));

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
      logs.push(createLog('warn', 'Entregas', `${orphans} registros ignorados (projeto pai não encontrado)`));
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
        logs.push(createLog('success', 'Entregas', `Upsert concluído: ${created} novos, ${updated} atualizados`));
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    logs.push(createLog('error', 'Entregas', `Falha no processamento: ${msg}`));
    errors++;
  }

  return { dataset: 'Entregas', total: created + updated + errors, created, updated, errors, durationMs: Date.now() - start };
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
    const existingIds = new Set((existing || []).map((r: { espaider_id: number }) => r.espaider_id));

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
        data_alerta_prazo: c.data_alerta_prazo ? c.data_alerta_prazo.toISOString().split('T')[0] : null,
        prazo_confirmado: c.prazo_confirmado || null,
        espaider_raw: c.extras,
      }));

    const orphans = mapped.length - rows.length;
    if (orphans > 0) {
      logs.push(createLog('warn', 'Cronogramas', `${orphans} registros ignorados (projeto pai não encontrado)`));
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
        logs.push(createLog('success', 'Cronogramas', `Upsert concluído: ${created} novos, ${updated} atualizados`));
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    logs.push(createLog('error', 'Cronogramas', `Falha no processamento: ${msg}`));
    errors++;
  }

  return { dataset: 'Cronogramas', total: created + updated + errors, created, updated, errors, durationMs: Date.now() - start };
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
    const existingIds = new Set((existing || []).map((r: { espaider_id: number }) => r.espaider_id));

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
      logs.push(createLog('warn', 'Requisitos', `${orphans} registros ignorados (projeto pai não encontrado)`));
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
        logs.push(createLog('success', 'Requisitos', `Upsert concluído: ${created} novos, ${updated} atualizados`));
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    logs.push(createLog('error', 'Requisitos', `Falha no processamento: ${msg}`));
    errors++;
  }

  return { dataset: 'Requisitos', total: created + updated + errors, created, updated, errors, durationMs: Date.now() - start };
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
      status: result.errors === 0 ? 'success' : (result.created + result.updated > 0 ? 'partial' : 'failed'),
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
 */
async function persistLogEntries(
  supabase: SupabaseClient,
  tenantId: string,
  requestId: string,
  logs: SyncLogEntry[],
): Promise<void> {
  if (logs.length === 0) return;

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
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const { error } = await supabase
        .from('integration_log_entries')
        .insert(batch);

      if (error) {
        console.error('[sync] failed to persist log entries batch:', error);
      }
    }
  } catch (err) {
    // Never let logging break the sync flow
    console.error('[sync] failed to persist log entries:', err);
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
    const mapped = mapearRegistros(registros, mapearHistorico);
    const projectMap = await getProjectIdMap(supabase, tenantId);

    const { data: existing } = await supabase
      .from('project_histories')
      .select('id')
      .eq('id', mapped[0]?.id_espaider || 0); // Optimization/Check logic could be better but sticking to pattern
    const existingIds = new Set((existing || []).map((r: { id: number }) => r.id));

    const rows = mapped
      .filter((r) => projectMap.has(r.projeto_id_espaider))
      .map((r) => ({
        id: r.id_espaider,
        project_id: projectMap.get(r.projeto_id_espaider)!,
        type: r.tipo || null,
        responsible_to: r.responsavel_para || null,
        responsible_from: r.responsavel_de || null,
        step_to: r.passo_para || null,
        step_from: r.passo_de || null,
        procedure_number: r.numero_tramite || null,
        message: r.mensagem || null,
        date: r.data ? r.data.toISOString() : null,
      }));

    const orphans = mapped.length - rows.length;
    if (orphans > 0) {
      logs.push(createLog('warn', 'Historicos', `${orphans} registros ignorados (projeto pai não encontrado)`));
    }

    if (rows.length > 0) {
      const { error } = await supabase
        .from('project_histories')
        .upsert(rows, { onConflict: 'id' }); // Note: histories PK is just 'id' (espaider_id), not composite

      if (error) {
        logs.push(createLog('error', 'Historicos', `Erro no upsert: ${error.message}`));
        errors = rows.length;
      } else {
        created = rows.length; // Simplified for now as we don't track existing well for non-composite PKs in this pattern yet
        logs.push(createLog('success', 'Historicos', `Upsert concluído: ${rows.length} registros processados`));
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    logs.push(createLog('error', 'Historicos', `Falha no processamento: ${msg}`));
    errors++;
  }

  return { dataset: 'Historicos', total: created + updated + errors, created, updated, errors, durationMs: Date.now() - start };
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
    const mapped = mapearRegistros(registros, mapearOrcamento);
    const projectMap = await getProjectIdMap(supabase, tenantId);

    const rows = mapped
      .filter((r) => projectMap.has(r.projeto_id_espaider))
      .map((r) => ({
        id: r.id_espaider,
        project_id: projectMap.get(r.projeto_id_espaider)!,
        value: r.valor,
        provider: r.fornecedor || null,
        quotation_date: r.data_cotacao ? r.data_cotacao.toISOString().split('T')[0] : null,
      }));

    const orphans = mapped.length - rows.length;
    if (orphans > 0) {
      logs.push(createLog('warn', 'Orcamentos', `${orphans} registros ignorados (projeto pai não encontrado)`));
    }

    if (rows.length > 0) {
      const { error } = await supabase
        .from('project_budgets')
        .upsert(rows, { onConflict: 'id' });

      if (error) {
        logs.push(createLog('error', 'Orcamentos', `Erro no upsert: ${error.message}`));
        errors = rows.length;
      } else {
        created = rows.length;
        logs.push(createLog('success', 'Orcamentos', `Upsert concluído: ${rows.length} registros processados`));
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    logs.push(createLog('error', 'Orcamentos', `Falha no processamento: ${msg}`));
    errors++;
  }

  return { dataset: 'Orcamentos', total: created + updated + errors, created, updated, errors, durationMs: Date.now() - start };
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
    const mapped = mapearRegistros(registros, mapearAprovador);
    const projectMap = await getProjectIdMap(supabase, tenantId);

    const rows = mapped
      .filter((r) => projectMap.has(r.projeto_id_espaider))
      .map((r) => ({
        id: r.id_espaider,
        project_id: projectMap.get(r.projeto_id_espaider)!,
        type: r.tipo || null,
        responsible: r.responsavel || null,
        attention_points: r.pontos_atencao || null,
      }));

    const orphans = mapped.length - rows.length;
    if (orphans > 0) {
      logs.push(createLog('warn', 'Aprovadores', `${orphans} registros ignorados (projeto pai não encontrado)`));
    }

    if (rows.length > 0) {
      const { error } = await supabase
        .from('project_approvers')
        .upsert(rows, { onConflict: 'id' });

      if (error) {
        logs.push(createLog('error', 'Aprovadores', `Erro no upsert: ${error.message}`));
        errors = rows.length;
      } else {
        created = rows.length;
        logs.push(createLog('success', 'Aprovadores', `Upsert concluído: ${rows.length} registros processados`));
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    logs.push(createLog('error', 'Aprovadores', `Falha no processamento: ${msg}`));
    errors++;
  }

  return { dataset: 'Aprovadores', total: created + updated + errors, created, updated, errors, durationMs: Date.now() - start };
}
