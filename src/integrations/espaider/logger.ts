/**
 * Structured logger for Espaider sync with correlation IDs
 * @see Story 15.7 - Structured Logger with Correlation IDs
 */

import type { EspaiderDataset } from './types';

export interface LogContext {
  correlationId: string;
  dataset?: EspaiderDataset | 'Geral';
  operation?: string;
  duration?: number;
  recordCount?: number;
  success?: boolean;
  error?: string;
  statusCode?: number;
  [key: string]: unknown;
}

export type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'debug';

export interface StructuredLogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  correlationId: string;
  context: Partial<LogContext>;
}

/**
 * Create a sync logger with correlation ID
 * Provides consistent structured logging across all sync operations
 */
export function createSyncLogger(correlationId: string) {
  return {
    info(message: string, context?: Partial<LogContext>) {
      return logEntry('info', message, correlationId, context);
    },

    warn(message: string, context?: Partial<LogContext>) {
      return logEntry('warn', message, correlationId, context);
    },

    error(message: string, context?: Partial<LogContext>) {
      return logEntry('error', message, correlationId, context);
    },

    success(message: string, context?: Partial<LogContext>) {
      return logEntry('success', message, correlationId, context);
    },

    debug(message: string, context?: Partial<LogContext>) {
      return logEntry('debug', message, correlationId, context);
    },
  };
}

/**
 * Create a structured log entry with typed context
 */
function logEntry(
  level: LogLevel,
  message: string,
  correlationId: string,
  context?: Partial<LogContext>,
): StructuredLogEntry {
  const entry: StructuredLogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    correlationId,
    context: context || {},
  };

  // Emit to console in development
  const prefix = `[${level.toUpperCase()}][${context?.dataset || 'SYNC'}][${correlationId.substring(0, 8)}]`;
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';

  if (level === 'error') console.error(prefix, message, contextStr);
  else if (level === 'warn') console.warn(prefix, message, contextStr);
  else if (level === 'success') console.log(`✅ ${prefix}`, message, contextStr);
  else console.log(prefix, message, contextStr);

  return entry;
}

/**
 * Type-safe error message extraction
 */
export function extractErrorMessage(error: unknown, fallback = 'Erro desconhecido'): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as Record<string, unknown>).message;
    if (typeof msg === 'string') return msg;
  }
  return fallback;
}
