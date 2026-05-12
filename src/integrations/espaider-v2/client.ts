/**
 * HTTP client for Espaider API v2.
 *
 * Key differences from v1:
 * - Auth via headers (token + identificador) — not in request body
 * - Initial call is POST to ConsultarRegistros
 * - Pagination is GET via URLPaginacao (full URL returned by API)
 * - Children are embedded inline in ListaFilhos (no separate URL fetching)
 * - Each child dataset may also have its own URLPaginacao
 *
 * @see ESPAIDER-V2-API-CONTEXT.md
 * @see Story 19.1
 */

import type { EspaiderV2Config } from './config';
import { loadV2Config, maskToken, generateRequestId } from './config';
import type {
  ConsultarRegistrosParams,
  ConsultarRegistrosResponse,
  ConsultarRegistrosResult,
  ConnectivityResult,
  EspaiderV2Error,
  EspaiderV2ErrorType,
  FilhoDataset,
  RawV2Record,
} from './types';

// =============================================================================
// Circuit breaker (v2-scoped, independent from v1)
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
// Internal logger (no PII / no token values)
// =============================================================================

interface LogContext {
  requestId: string;
  dataset?: string;
  duration?: number;
  attempt?: number;
  statusCode?: number;
  error?: string;
  pages?: number;
}

function log(level: 'INFO' | 'WARN' | 'ERROR', message: string, context: LogContext): void {
  const entry = { timestamp: new Date().toISOString(), level, message, ...context };
  if (level === 'ERROR') console.error(JSON.stringify(entry));
  else if (level === 'WARN') console.warn(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
}

// =============================================================================
// Error helpers
// =============================================================================

function createError(
  type: EspaiderV2ErrorType,
  message: string,
  requestId: string,
  statusCode?: number,
): EspaiderV2Error {
  const retryable = ['TIMEOUT', 'NETWORK_ERROR', 'RATE_LIMIT'].includes(type);
  return { type, message, statusCode, retryable, requestId };
}

function classifyHttpError(statusCode: number, requestId: string): EspaiderV2Error {
  if (statusCode === 401 || statusCode === 403) {
    return createError('AUTH_ERROR', `HTTP ${statusCode}`, requestId, statusCode);
  }
  if (statusCode === 429) {
    return createError('RATE_LIMIT', `HTTP ${statusCode}`, requestId, statusCode);
  }
  if (statusCode >= 500) {
    return createError('NETWORK_ERROR', `HTTP ${statusCode}`, requestId, statusCode);
  }
  return createError('UNKNOWN', `HTTP ${statusCode}`, requestId, statusCode);
}

function classifyException(error: unknown, requestId: string): EspaiderV2Error {
  if (error instanceof Error) {
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return createError('TIMEOUT', 'Request timed out', requestId);
    }
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return createError('NETWORK_ERROR', 'Network error', requestId);
    }
  }
  return createError('UNKNOWN', 'Unknown error', requestId);
}

// =============================================================================
// Circuit breaker
// =============================================================================

function checkCircuitBreaker(config: EspaiderV2Config, requestId: string): void {
  const now = Date.now();
  if (circuitState.isOpen) {
    if (now - circuitState.lastFailure > config.circuitBreaker.resetTimeoutMs) {
      circuitState.isOpen = false;
      circuitState.failures = 0;
      log('INFO', 'Circuit breaker reset', { requestId });
    } else {
      throw createError('CIRCUIT_OPEN', 'Circuit breaker is open', requestId);
    }
  }
  if (now - circuitState.lastFailure > config.circuitBreaker.windowMs) {
    circuitState.failures = 0;
  }
}

function recordFailure(config: EspaiderV2Config, requestId: string): void {
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
// Retry
// =============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryDelay(attempt: number, config: EspaiderV2Config): number {
  return Math.min(config.retry.baseDelay * Math.pow(2, attempt - 1), config.retry.maxDelay);
}

// =============================================================================
// Request execution
// =============================================================================

/**
 * Builds the v2 request headers. Token and identificador go in headers, not body.
 */
function buildHeaders(config: EspaiderV2Config): HeadersInit {
  return {
    'Content-Type': 'application/json',
    token: config.token,
    identificador: config.identificador,
  };
}

/**
 * Builds the filter body for the initial POST.
 * Sends date filters when provided; empty array for full sync.
 */
function buildRequestBody(params: ConsultarRegistrosParams): unknown {
  if (!params.dateFilter) return [];

  return [
    {
      Identificador: 'DATAS',
      Filtro: {
        DATAMOVIMENTACAO_DE: params.dateFilter.de,
        DATAMOVIMENTACAO_ATE: params.dateFilter.ate,
      },
    },
  ];
}

async function executeRequest(
  url: string,
  method: 'POST' | 'GET',
  config: EspaiderV2Config,
  requestId: string,
  body?: unknown,
): Promise<ConsultarRegistrosResponse> {
  let attempt = 0;
  let lastError: EspaiderV2Error | null = null;

  while (attempt < config.retry.maxAttempts) {
    attempt++;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
      const fetchOptions: RequestInit = {
        method,
        headers: buildHeaders(config),
        signal: controller.signal,
      };

      if (method === 'POST' && body !== undefined) {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const err = classifyHttpError(response.status, requestId);

        if (!err.retryable) {
          log('ERROR', err.message, { requestId, statusCode: response.status });
          throw err;
        }

        lastError = err;
        log('WARN', `Request failed, retrying`, {
          requestId,
          attempt,
          statusCode: response.status,
        });

        if (attempt < config.retry.maxAttempts) {
          await sleep(retryDelay(attempt, config));
          continue;
        }
        throw lastError;
      }

      const raw = await response.json();

      if (!raw || typeof raw !== 'object') {
        throw createError('INVALID_RESPONSE', 'Invalid JSON response', requestId);
      }

      const data = raw as ConsultarRegistrosResponse;

      if (data.Situacao === 'E') {
        const msg = data.MensagemRetorno?.Mensagem ?? 'Erro desconhecido';
        throw createError('INVALID_RESPONSE', `API error: ${msg}`, requestId);
      }

      recordSuccess();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      const espaiderError = (error as EspaiderV2Error).type
        ? (error as EspaiderV2Error)
        : classifyException(error, requestId);

      lastError = espaiderError;

      if (!espaiderError.retryable) {
        recordFailure(config, requestId);
        throw espaiderError;
      }

      if (attempt < config.retry.maxAttempts) {
        log('WARN', `Retrying after error`, { requestId, attempt, error: espaiderError.type });
        await sleep(retryDelay(attempt, config));
        continue;
      }
    }
  }

  recordFailure(config, requestId);
  throw lastError ?? createError('UNKNOWN', 'Unknown error', requestId);
}

// =============================================================================
// Child pagination drainer
// =============================================================================

async function drainChildPagination(
  child: FilhoDataset,
  config: EspaiderV2Config,
  requestId: string,
): Promise<RawV2Record[]> {
  const allRecords: RawV2Record[] = [...child.ListaRegistros];
  let nextUrl = child.URLPaginacao;
  let pageCount = 1;
  const MAX_PAGES = 50;

  while (nextUrl && nextUrl.trim() !== '' && pageCount < MAX_PAGES) {
    pageCount++;
    log('INFO', `GET child page ${pageCount} for ${child.Identificador}`, {
      requestId,
      dataset: child.Identificador,
    });

    const page = await executeRequest(nextUrl, 'GET', config, requestId);
    allRecords.push(...(page.ListaRegistros ?? []));
    nextUrl = page.URLPaginacao;
  }

  return allRecords;
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Executes a full ConsultarRegistros flow:
 * 1. POST to ConsultarRegistros with optional date filters
 * 2. Drains parent pagination via GET on URLPaginacao
 * 3. Drains each child dataset's pagination as needed
 *
 * Returns all parent records and all child datasets with complete records.
 */
export async function consultarRegistros(
  params: ConsultarRegistrosParams = {},
): Promise<ConsultarRegistrosResult> {
  const config = { ...loadV2Config(true), ...params.configOverride };
  const requestId = generateRequestId();
  const startTime = Date.now();

  log('INFO', 'Starting Espaider v2 ConsultarRegistros', {
    requestId,
    dataset: config.identificador,
  });

  checkCircuitBreaker(config, requestId);

  const maskedToken = maskToken(config.token);
  const initialUrl = `${config.baseUrl}/ConsultarRegistros`;
  const body = buildRequestBody(params);

  log('INFO', `POST ${initialUrl} token=${maskedToken}`, { requestId });

  const firstPage = await executeRequest(initialUrl, 'POST', config, requestId, body);

  const allParentRecords: RawV2Record[] = [...(firstPage.ListaRegistros ?? [])];
  const childMap = new Map<string, FilhoDataset>();

  for (const child of firstPage.ListaFilhos ?? []) {
    childMap.set(child.Identificador, {
      Identificador: child.Identificador,
      ListaRegistros: [...child.ListaRegistros],
      URLPaginacao: child.URLPaginacao,
    });
  }

  let nextUrl = firstPage.URLPaginacao;
  let pageCount = 1;
  const MAX_PAGES = 100;

  while (nextUrl && nextUrl.trim() !== '' && pageCount < MAX_PAGES) {
    pageCount++;
    log('INFO', `GET parent page ${pageCount}`, { requestId, pages: pageCount });

    const page = await executeRequest(nextUrl, 'GET', config, requestId);
    allParentRecords.push(...(page.ListaRegistros ?? []));

    for (const child of page.ListaFilhos ?? []) {
      const existing = childMap.get(child.Identificador);
      if (existing) {
        existing.ListaRegistros.push(...child.ListaRegistros);
        if (child.URLPaginacao) existing.URLPaginacao = child.URLPaginacao;
      } else {
        childMap.set(child.Identificador, {
          Identificador: child.Identificador,
          ListaRegistros: [...child.ListaRegistros],
          URLPaginacao: child.URLPaginacao,
        });
      }
    }

    nextUrl = page.URLPaginacao;
  }

  const childDatasets: FilhoDataset[] = [];
  for (const child of Array.from(childMap.values())) {
    if (child.URLPaginacao) {
      const fullRecords = await drainChildPagination(child, config, requestId);
      childDatasets.push({ ...child, ListaRegistros: fullRecords, URLPaginacao: null });
    } else {
      childDatasets.push(child);
    }
  }

  const durationMs = Date.now() - startTime;

  log('INFO', `ConsultarRegistros complete: ${allParentRecords.length} parent records`, {
    requestId,
    duration: durationMs,
    pages: pageCount,
  });

  return {
    requestId,
    parentRecords: allParentRecords,
    childDatasets,
    pagesFetched: pageCount,
    durationMs,
  };
}

/**
 * Validates connectivity to the Espaider v2 API.
 * Returns sanitized operational feedback — no secrets exposed.
 */
export async function validateConnectivity(
  configOverride?: Partial<EspaiderV2Config>,
): Promise<ConnectivityResult> {
  const config = { ...loadV2Config(true), ...configOverride };
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    checkCircuitBreaker(config, requestId);

    const url = `${config.baseUrl}/ConsultarRegistros`;
    const page = await executeRequest(url, 'POST', config, requestId, []);

    return {
      success: true,
      requestId,
      recordCount: page.ListaRegistros?.length ?? 0,
      childDatasetCount: page.ListaFilhos?.length ?? 0,
      situacao: page.Situacao,
      durationMs: Date.now() - startTime,
    };
  } catch (error) {
    const espaiderError = error as EspaiderV2Error;
    return {
      success: false,
      requestId,
      error: espaiderError.type ?? 'UNKNOWN',
      durationMs: Date.now() - startTime,
    };
  }
}

/** Resets the circuit breaker — for testing only. */
export function resetCircuitBreaker(): void {
  circuitState.failures = 0;
  circuitState.lastFailure = 0;
  circuitState.isOpen = false;
}
