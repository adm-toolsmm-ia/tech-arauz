/**
 * Configuração do client Espaider
 * Carrega variáveis de ambiente e define defaults
 * @see ADR-002: Auth Espaider
 */

import type { EspaiderConfig } from './types';

/**
 * Valida que as variáveis de ambiente obrigatórias existem.
 * ESPAIDER_KEY é opcional (API real usa apenas Token + Identificador).
 */
function validateEnv(): void {
  const required = ['ESPAIDER_BASE_URL', 'ESPAIDER_TOKEN'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Carrega configuração do ambiente
 * @see configs/project.yaml para valores padrão
 */
export function loadConfig(skipValidation = false): EspaiderConfig {
  if (!skipValidation) {
    validateEnv();
  }

  return {
    baseUrl: process.env.ESPAIDER_BASE_URL || '',
    token: process.env.ESPAIDER_TOKEN || '',
    key: process.env.ESPAIDER_KEY || '',
    timeout: parseInt(process.env.ESPAIDER_TIMEOUT || '10000', 10),
    retry: {
      maxAttempts: parseInt(process.env.ESPAIDER_RETRY_MAX || '3', 10),
      baseDelay: parseInt(process.env.ESPAIDER_RETRY_BASE_DELAY || '1000', 10),
      maxDelay: parseInt(process.env.ESPAIDER_RETRY_MAX_DELAY || '8000', 10),
    },
    circuitBreaker: {
      failureThreshold: parseInt(process.env.ESPAIDER_CB_THRESHOLD || '5', 10),
      windowMs: parseInt(process.env.ESPAIDER_CB_WINDOW || '60000', 10),
      resetTimeoutMs: parseInt(process.env.ESPAIDER_CB_RESET_TIMEOUT || '30000', 10),
    },
  };
}

/**
 * Mascara um token para logging seguro
 * @example maskToken('abc123xyz') => 'abc***xyz'
 */
export function maskToken(token: string): string {
  if (token.length <= 6) {
    return '***';
  }
  return `${token.slice(0, 3)}***${token.slice(-3)}`;
}

/**
 * Gera um request ID único para correlação de logs
 */
export function generateRequestId(): string {
  return `esp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
