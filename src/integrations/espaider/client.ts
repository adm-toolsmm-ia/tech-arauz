/**
 * Client HTTP para API Espaider
 * Implementa retry com backoff exponencial, circuit breaker e logging seguro
 * @see ADR-002: Auth Espaider
 */

import { z } from 'zod';
import type {
  ExportarDadosParams,
  ExportarDadosResponse,
  EspaiderConfig,
  EspaiderError,
  EspaiderErrorType,
  SyncMetrics,
  EspaiderDataset,
} from './types';
import { loadConfig, maskToken, generateRequestId } from './config';
import { ExportarDadosResponseSchema } from './schemas';

// =============================================================================
// Circuit Breaker State
// =============================================================================

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  isOpen: boolean;
}

const circuitState: CircuitBreakerState = {
  failures: 0,
  lastFailure: 0,
  isOpen: false,
};

// =============================================================================
// Logger (sem PII)
// =============================================================================

interface LogContext {
  requestId: string;
  dataset?: string;
  duration?: number;
  attempt?: number;
  statusCode?: number;
  error?: string;
}

function log(level: 'INFO' | 'WARN' | 'ERROR', message: string, context: LogContext): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...context,
  };

  // Em produção, enviar para sistema de logs (Sentry, etc)
  // Aqui usamos console para desenvolvimento
  if (level === 'ERROR') {
    console.error(JSON.stringify(logEntry));
  } else if (level === 'WARN') {
    console.warn(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
}

// =============================================================================
// Circuit Breaker
// =============================================================================

function checkCircuitBreaker(config: EspaiderConfig, requestId: string): void {
  const now = Date.now();
  const { failureThreshold, windowMs, resetTimeoutMs } = config.circuitBreaker;

  // Se o circuito está aberto, verifica se pode resetar
  if (circuitState.isOpen) {
    if (now - circuitState.lastFailure > resetTimeoutMs) {
      circuitState.isOpen = false;
      circuitState.failures = 0;
      log('INFO', 'Circuit breaker reset', { requestId });
    } else {
      throw createError('CIRCUIT_OPEN', 'Circuit breaker is open', requestId);
    }
  }

  // Limpa falhas antigas fora da janela
  if (now - circuitState.lastFailure > windowMs) {
    circuitState.failures = 0;
  }
}

function recordFailure(config: EspaiderConfig, requestId: string): void {
  circuitState.failures++;
  circuitState.lastFailure = Date.now();

  if (circuitState.failures >= config.circuitBreaker.failureThreshold) {
    circuitState.isOpen = true;
    log('WARN', 'Circuit breaker opened', { requestId });
  }
}

function recordSuccess(): void {
  circuitState.failures = 0;
}

// =============================================================================
// Error Handling
// =============================================================================

function createError(
  type: EspaiderErrorType,
  message: string,
  requestId: string,
  statusCode?: number,
): EspaiderError {
  const retryable = ['TIMEOUT', 'NETWORK_ERROR', 'RATE_LIMIT'].includes(type);

  return {
    type,
    message,
    statusCode,
    retryable,
    requestId,
  };
}

function classifyError(error: unknown, requestId: string): EspaiderError {
  if (error instanceof Error) {
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return createError('TIMEOUT', 'Request timed out', requestId);
    }
    if (error.message.includes('fetch')) {
      return createError('NETWORK_ERROR', 'Network error', requestId);
    }
  }

  return createError('UNKNOWN', 'Unknown error occurred', requestId);
}

// =============================================================================
// Retry Logic
// =============================================================================

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateDelay(attempt: number, config: EspaiderConfig): number {
  const { baseDelay, maxDelay } = config.retry;
  const delay = baseDelay * Math.pow(2, attempt - 1);
  return Math.min(delay, maxDelay);
}

// =============================================================================
// URL Builder
// =============================================================================

function buildUrl(config: EspaiderConfig, params: ExportarDadosParams): string {
  // URL correta: baseUrl já inclui o caminho até WCFExportaDados.svc
  // NOTA: Para POST, Token vai no body JSON, não na URL
  const url = new URL(`${config.baseUrl}/ExportaDados`);

  // Apenas Identificador vai na URL para POST (o resto vai no body)
  // Para GET de interfaces filhas, a URL inteira já vem pronta em ListaURLFilhos

  return url.toString();
}

/**
 * Constrói o body JSON para requisições POST
 * Token deve estar no JSON body, não na URL
 */
function buildPostBody(
  config: EspaiderConfig,
  params: ExportarDadosParams,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    Token: config.token,
    Identificador: params.identificador,
    NumPagina: params.numPagina ?? 1,
    QuantRegistrosPorPagina: params.quantRegistrosPorPagina ?? 100,
  };

  // Key é opcional — só envia se fornecido e não vazio
  if (config.key) {
    body.Key = config.key;
  }

  // Adiciona filtros (BlocoFiltros) se existirem
  if (params.filtros) {
    for (const [key, value] of Object.entries(params.filtros)) {
      body[key] = value;
    }
  }

  return body;
}

// =============================================================================
// Main Export Function
// =============================================================================

/**
 * Executa uma requisição individual com retry
 * @param url - URL base para requisição
 * @param method - POST (para requisições iniciais) ou GET (para paginação/filhos)
 * @param config - Configuração Espaider
 * @param requestId - ID único para correlação de logs
 * @param body - Body JSON (apenas para POST)
 */
async function executeWithRetry(
  url: string,
  method: 'POST' | 'GET',
  config: EspaiderConfig,
  requestId: string,
  body?: Record<string, unknown>,
): Promise<ExportarDadosResponse> {
  let attempt = 0;
  let lastError: EspaiderError | null = null;

  while (attempt < config.retry.maxAttempts) {
    attempt++;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      try {
        const fetchOptions: RequestInit = {
          method,
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
        };

        // Adicionar body apenas para POST
        if (method === 'POST' && body) {
          fetchOptions.body = JSON.stringify(body);
        }

        const response = await fetch(url, fetchOptions);

        clearTimeout(timeoutId);

        if (!response.ok) {
          const statusCode = response.status;

          if (statusCode >= 400 && statusCode < 500 && statusCode !== 429) {
            const errorType = statusCode === 401 || statusCode === 403 ? 'AUTH_ERROR' : 'UNKNOWN';
            throw createError(errorType, `HTTP ${statusCode}`, requestId, statusCode);
          }

          const errorType = statusCode === 429 ? 'RATE_LIMIT' : 'NETWORK_ERROR';
          lastError = createError(errorType, `HTTP ${statusCode}`, requestId, statusCode);

          log('WARN', `Request failed, retrying`, { requestId, attempt, statusCode });

          if (attempt < config.retry.maxAttempts) {
            await sleep(calculateDelay(attempt, config));
            continue;
          }
          throw lastError;
        }

        const data = await response.json();

        if (!data || typeof data !== 'object') {
          throw createError('INVALID_RESPONSE', 'Invalid JSON response', requestId);
        }

        // Validate response against schema
        let validatedData: ExportarDadosResponse;
        try {
          validatedData = ExportarDadosResponseSchema.parse(data);
        } catch (error) {
          if (error instanceof z.ZodError) {
            const fieldErrors = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
            throw createError(
              'INVALID_RESPONSE',
              `API contract violation: ${fieldErrors}`,
              requestId,
            );
          }
          throw error;
        }

        // Verifica Situacao do Espaider
        if (validatedData.Situacao === 'E') {
          throw createError(
            'INVALID_RESPONSE',
            `Espaider error: ${validatedData.MensagemRetorno || 'Erro desconhecido'}`,
            requestId,
          );
        }

        recordSuccess();
        return validatedData;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      if ((error as EspaiderError).type) {
        lastError = error as EspaiderError;
      } else {
        lastError = classifyError(error, requestId);
      }

      if (!lastError.retryable) {
        recordFailure(config, requestId);
        log('ERROR', lastError.message, { requestId, error: lastError.type });
        throw lastError;
      }

      if (attempt < config.retry.maxAttempts) {
        log('WARN', `Retrying`, { requestId, attempt, error: lastError.type });
        await sleep(calculateDelay(attempt, config));
        continue;
      }
    }
  }

  recordFailure(config, requestId);
  throw lastError || createError('UNKNOWN', 'Unknown error', requestId);
}

/**
 * Exporta dados do Espaider com retry, circuit breaker e paginação automática.
 *
 * - Primeira chamada: POST para ExportaDados
 * - Páginas seguintes: GET via URLPaginacao retornada pela API
 *
 * @param params - Parâmetros da exportação (identificador obrigatório)
 * @param configOverride - Configuração opcional (usa env vars por padrão)
 * @returns Resposta unificada com todos os registros de todas as páginas
 *
 * @example
 * ```ts
 * const response = await exportarDados({
 *   identificador: 'BI_SOLICITACOES_SUPORTEESPAIDER'
 * });
 * console.log(response.ListaRegistros.length);
 * ```
 */
export async function exportarDados(
  params: ExportarDadosParams,
  configOverride?: Partial<EspaiderConfig>,
): Promise<ExportarDadosResponse> {
  // Skip env validation when DB-based overrides are provided
  const hasOverrides = !!(params.baseUrl && params.token);
  const config = {
    ...loadConfig(hasOverrides),
    ...configOverride,
    ...(params.baseUrl ? { baseUrl: params.baseUrl } : {}),
    ...(params.token ? { token: params.token } : {}),
  };
  const requestId = generateRequestId();
  const startTime = Date.now();

  log('INFO', 'Starting Espaider export', {
    requestId,
    dataset: params.identificador as EspaiderDataset,
  });

  checkCircuitBreaker(config, requestId);

  // 1) POST inicial
  const url = buildUrl(config, params);
  const postBody = buildPostBody(config, params);
  const maskedToken = maskToken(config.token);
  log('INFO', `POST ${url} com Token=${maskedToken}`, { requestId });

  const allRegistros: ExportarDadosResponse['ListaRegistros'] = [];
  const firstPage = await executeWithRetry(url, 'POST', config, requestId, postBody);
  allRegistros.push(...firstPage.ListaRegistros);

  // 2) Paginação via GET (URLPaginacao)
  let nextUrl = firstPage.URLPaginacao;
  let pageCount = 1;
  const MAX_PAGES = 50; // safety limit

  while (nextUrl && nextUrl.trim() !== '' && pageCount < MAX_PAGES) {
    pageCount++;
    log('INFO', `GET page ${pageCount}`, { requestId });

    const page = await executeWithRetry(nextUrl, 'GET', config, requestId);
    allRegistros.push(...page.ListaRegistros);
    nextUrl = page.URLPaginacao;
  }

  const duration = Date.now() - startTime;
  log('INFO', `Export completed: ${allRegistros.length} records in ${pageCount} pages`, {
    requestId,
    dataset: params.identificador as EspaiderDataset,
    duration,
  });

  return {
    Situacao: 'S',
    ListaRegistros: allRegistros,
    ListaURLFilhos: firstPage.ListaURLFilhos,
  };
}

/**
 * Busca dados de uma interface filha via GET na URL fornecida.
 * Usado para buscar cronogramas, entregas e requisitos após obter ListaURLFilhos.
 *
 * @param url - URL completa retornada em ListaURLFilhos
 * @param configOverride - Configuração opcional
 * @returns Resposta com registros da interface filha
 *
 * @example
 * ```ts
 * const projetos = await exportarDados({ identificador: 'BI_SOLICITACOES_SUPORTEESPAIDER' });
 * for (const urlFilho of projetos.ListaURLFilhos || []) {
 *   const filhos = await buscarFilhos(urlFilho.URL);
 *   console.log(`${urlFilho.Descricao}: ${filhos.ListaRegistros.length} registros`);
 * }
 * ```
 */
export async function buscarFilhos(
  url: string,
  configOverride?: Partial<EspaiderConfig>,
): Promise<ExportarDadosResponse> {
  const config = { ...loadConfig(true), ...configOverride };
  const requestId = generateRequestId();
  const startTime = Date.now();

  log('INFO', 'Fetching child records', { requestId, dataset: url.split('/').pop() || 'filhos' });

  checkCircuitBreaker(config, requestId);

  const allRegistros: ExportarDadosResponse['ListaRegistros'] = [];

  // GET na URL fornecida
  const firstPage = await executeWithRetry(url, 'GET', config, requestId);
  allRegistros.push(...firstPage.ListaRegistros);

  // Paginação (se houver)
  let nextUrl = firstPage.URLPaginacao;
  let pageCount = 1;
  const MAX_PAGES = 50;

  while (nextUrl && nextUrl.trim() !== '' && pageCount < MAX_PAGES) {
    pageCount++;
    log('INFO', `GET child page ${pageCount}`, { requestId });

    const page = await executeWithRetry(nextUrl, 'GET', config, requestId);
    allRegistros.push(...page.ListaRegistros);
    nextUrl = page.URLPaginacao;
  }

  const duration = Date.now() - startTime;
  log('INFO', `Child fetch completed: ${allRegistros.length} records`, { requestId, duration });

  return {
    Situacao: 'S',
    ListaRegistros: allRegistros,
  };
}

/**
 * Cria métricas de sincronização
 */
export function createSyncMetrics(
  requestId: string,
  dataset: EspaiderDataset,
  startedAt: Date,
  results: { new: number; updated: number; errors: number; retries: number },
): SyncMetrics {
  const completedAt = new Date();

  return {
    requestId,
    dataset,
    startedAt,
    completedAt,
    durationMs: completedAt.getTime() - startedAt.getTime(),
    totalRecords: results.new + results.updated,
    newRecords: results.new,
    updatedRecords: results.updated,
    errors: results.errors,
    retries: results.retries,
  };
}

/**
 * Reseta o circuit breaker (para testes)
 */
export function resetCircuitBreaker(): void {
  circuitState.failures = 0;
  circuitState.lastFailure = 0;
  circuitState.isOpen = false;
}
