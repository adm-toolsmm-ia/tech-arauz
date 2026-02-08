/**
 * Tipos para integração com API Espaider
 * @see ADR-002: Auth Espaider
 */

// =============================================================================
// Tipos de Requisição
// =============================================================================

/**
 * Datasets disponíveis para exportação
 */
export type EspaiderDataset =
    | 'Projetos'
    | 'Entregas'
    | 'Cronogramas'
    | 'Requisitos';

/**
 * Parâmetros para a função exportarDados
 */
export interface ExportarDadosParams {
    /** Dataset a ser exportado */
    identificador: EspaiderDataset;
    /** Filtros opcionais para a consulta */
    filtros?: Record<string, string>;
}

// =============================================================================
// Tipos de Resposta da API
// =============================================================================

/**
 * Estrutura de um campo retornado pela API
 */
export interface CampoEspaider {
    /** Nome/identificador do campo */
    Identificador: string;
    /** Valor do campo (sempre string na API) */
    Valor: string;
}

/**
 * Estrutura de um registro retornado pela API
 */
export interface RegistroEspaider {
    /** ID único do registro no Espaider */
    IDEspaider: number;
    /** Dataset de origem */
    Identificador: string;
    /** Lista de campos do registro */
    ListaCampos: CampoEspaider[];
}

/**
 * Resposta completa da API ExportaDados
 */
export interface ExportarDadosResponse {
    /** Lista de registros retornados */
    ListaRegistros: RegistroEspaider[];
}

// =============================================================================
// Tipos Mapeados (após transformação)
// =============================================================================

/**
 * Projeto mapeado para uso interno
 * @see BR-003: Mapeamento de Campos Espaider
 */
export interface ProjetoMapeado {
    id_espaider: number;
    codigo: string;
    titulo: string;
    status: string;
    responsavel: string;
    prioridade: string;
    prazo_final: Date | null;
    updated_at: Date | null;
    categoria: string;
    /** Campos extras não mapeados */
    extras: Record<string, string>;
}

/**
 * Entrega mapeada para uso interno
 */
export interface EntregaMapeada {
    id_espaider: number;
    projeto_id_espaider: number;
    titulo: string;
    status: string;
    data_prevista: Date | null;
    data_realizada: Date | null;
    extras: Record<string, string>;
}

/**
 * Cronograma mapeado para uso interno
 */
export interface CronogramaMapeado {
    id_espaider: number;
    projeto_id_espaider: number;
    atividade: string;
    responsavel: string;
    data_inicio: Date | null;
    data_fim: Date | null;
    status: string;
    extras: Record<string, string>;
}

/**
 * Requisito mapeado para uso interno
 */
export interface RequisitoMapeado {
    id_espaider: number;
    projeto_id_espaider: number;
    codigo: string;
    descricao: string;
    tipo: string;
    prioridade: string;
    status: string;
    extras: Record<string, string>;
}

// =============================================================================
// Tipos de Erro
// =============================================================================

/**
 * Tipos de erro da integração Espaider
 */
export type EspaiderErrorType =
    | 'TIMEOUT'
    | 'NETWORK_ERROR'
    | 'AUTH_ERROR'
    | 'RATE_LIMIT'
    | 'INVALID_RESPONSE'
    | 'CIRCUIT_OPEN'
    | 'UNKNOWN';

/**
 * Erro estruturado da integração
 */
export interface EspaiderError {
    type: EspaiderErrorType;
    message: string;
    statusCode?: number;
    retryable: boolean;
    requestId: string;
}

// =============================================================================
// Tipos de Configuração
// =============================================================================

/**
 * Configuração do client Espaider
 */
export interface EspaiderConfig {
    baseUrl: string;
    token: string;
    key: string;
    timeout: number;
    retry: {
        maxAttempts: number;
        baseDelay: number;
        maxDelay: number;
    };
    circuitBreaker: {
        failureThreshold: number;
        windowMs: number;
        resetTimeoutMs: number;
    };
}

/**
 * Métricas de uma sincronização
 */
export interface SyncMetrics {
    requestId: string;
    dataset: EspaiderDataset;
    startedAt: Date;
    completedAt: Date;
    durationMs: number;
    totalRecords: number;
    newRecords: number;
    updatedRecords: number;
    errors: number;
    retries: number;
}
