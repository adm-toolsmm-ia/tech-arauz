/**
 * Configuration for Espaider API v2 client.
 *
 * v2 uses header-based auth (token + identificador) instead of body-based token.
 * Uses separate env vars from v1 to allow parallel operation during cutover.
 */

export interface EspaiderV2Config {
  baseUrl: string;
  token: string;
  identificador: string;
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
 * Main v2 dataset identifier — sent via header per the v2 contract.
 * @see ESPAIDER-V2-API-CONTEXT.md
 */
export const ESPAIDER_V2_IDENTIFICADOR = 'BI_SOLICITACOES_PROJETOSESPAIDER_v2';

function validateEnv(): void {
  const required = ['ESPAIDER_V2_BASE_URL', 'ESPAIDER_V2_TOKEN'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export function loadV2Config(skipValidation = false): EspaiderV2Config {
  if (!skipValidation) {
    validateEnv();
  }

  return {
    baseUrl: process.env.ESPAIDER_V2_BASE_URL || '',
    token: process.env.ESPAIDER_V2_TOKEN || '',
    identificador: process.env.ESPAIDER_V2_IDENTIFICADOR || ESPAIDER_V2_IDENTIFICADOR,
    timeout: parseInt(process.env.ESPAIDER_V2_TIMEOUT || '15000', 10),
    retry: {
      maxAttempts: parseInt(process.env.ESPAIDER_V2_RETRY_MAX || '3', 10),
      baseDelay: parseInt(process.env.ESPAIDER_V2_RETRY_BASE_DELAY || '1000', 10),
      maxDelay: parseInt(process.env.ESPAIDER_V2_RETRY_MAX_DELAY || '8000', 10),
    },
    circuitBreaker: {
      failureThreshold: parseInt(process.env.ESPAIDER_V2_CB_THRESHOLD || '5', 10),
      windowMs: parseInt(process.env.ESPAIDER_V2_CB_WINDOW || '60000', 10),
      resetTimeoutMs: parseInt(process.env.ESPAIDER_V2_CB_RESET_TIMEOUT || '30000', 10),
    },
  };
}

export function maskToken(token: string): string {
  if (token.length <= 6) return '***';
  return `${token.slice(0, 3)}***${token.slice(-3)}`;
}

export function generateRequestId(): string {
  return `esp2_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
