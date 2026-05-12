/**
 * Types for Espaider API v2 integration.
 *
 * v2 contract differs materially from v1:
 * - Records are flattened objects (no ListaCampos wrapper)
 * - Children are embedded inline in ListaFilhos (not separate URL fetches)
 * - Auth goes in headers, not request body
 * - MensagemRetorno is an object { Mensagem: string }, not a plain string
 *
 * @see ESPAIDER-V2-API-CONTEXT.md
 */

// =============================================================================
// Raw API shapes (before schema validation — see schemas.ts for Zod schemas)
// =============================================================================

/**
 * Flattened parent record from ListaRegistros.
 * Fields are direct top-level keys (NOME, CODIGO, STATUSPROJETO, etc.)
 * Strict typed schemas are in schemas.ts (Story 19.2).
 */
export type RawV2Record = Record<string, unknown>;

/**
 * Child dataset embedded inline within a v2 response.
 * Each child has its own Identificador, records, and optional pagination URL.
 */
export interface FilhoDataset {
  Identificador: string;
  ListaRegistros: RawV2Record[];
  URLPaginacao?: string | null;
}

/**
 * Return envelope from MensagemRetorno field in v2 response.
 * In v2 this is an object, not a plain string.
 */
export interface MensagemRetorno {
  Mensagem: string;
}

/**
 * Top-level v2 API response from ConsultarRegistros / ConsultarRegistrosComChave.
 */
export interface ConsultarRegistrosResponse {
  ListaRegistros: RawV2Record[];
  ListaFilhos: FilhoDataset[];
  URLPaginacao: string | null;
  MensagemRetorno: MensagemRetorno;
  Situacao: 'S' | 'E';
}

// =============================================================================
// Request types
// =============================================================================

/**
 * Date filter block for incremental sync.
 * Sent as the JSON body on ConsultarRegistros POST.
 * @see ESPAIDER-V2-API-CONTEXT.md — filter format: "dd/MM/yyyy HH:mm:ss"
 */
export interface DateFilterBlock {
  Identificador: 'DATAS';
  Filtro: {
    DATAMOVIMENTACAO_DE: string;
    DATAMOVIMENTACAO_ATE: string;
  };
}

/**
 * Parameters for consultarRegistros.
 * Credentials come from config and go in headers, not here.
 */
export interface ConsultarRegistrosParams {
  /** Optional date filter for incremental sync. Full sync when omitted. */
  dateFilter?: {
    de: string;
    ate: string;
  };
  /** Override config for testing or per-tenant credentials */
  configOverride?: Partial<import('./config').EspaiderV2Config>;
}

// =============================================================================
// Error types (aligned with v1 conventions)
// =============================================================================

export type EspaiderV2ErrorType =
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'AUTH_ERROR'
  | 'RATE_LIMIT'
  | 'INVALID_RESPONSE'
  | 'CIRCUIT_OPEN'
  | 'UNKNOWN';

export interface EspaiderV2Error {
  type: EspaiderV2ErrorType;
  message: string;
  statusCode?: number;
  retryable: boolean;
  requestId: string;
}

// =============================================================================
// Result types
// =============================================================================

/**
 * Final result returned by consultarRegistros after draining all pagination.
 */
export interface ConsultarRegistrosResult {
  requestId: string;
  parentRecords: RawV2Record[];
  childDatasets: FilhoDataset[];
  pagesFetched: number;
  durationMs: number;
}

/**
 * Sanitized connectivity check result — no secrets exposed.
 */
export interface ConnectivityResult {
  success: boolean;
  requestId: string;
  recordCount?: number;
  childDatasetCount?: number;
  situacao?: 'S' | 'E';
  error?: string;
  durationMs: number;
}
