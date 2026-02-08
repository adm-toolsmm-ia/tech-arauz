/**
 * Barrel export para integração Espaider
 */

// Types
export type {
    EspaiderDataset,
    ExportarDadosParams,
    ExportarDadosResponse,
    CampoEspaider,
    RegistroEspaider,
    ProjetoMapeado,
    EntregaMapeada,
    CronogramaMapeado,
    RequisitoMapeado,
    EspaiderError,
    EspaiderErrorType,
    EspaiderConfig,
    SyncMetrics,
} from './types';

// Config
export { loadConfig, maskToken, generateRequestId } from './config';

// Client
export { exportarDados, createSyncMetrics, resetCircuitBreaker } from './client';

// Mappers
export {
    mapearProjeto,
    mapearEntrega,
    mapearCronograma,
    mapearRequisito,
    mapearRegistros,
} from './mapper';
