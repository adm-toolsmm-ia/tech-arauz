/**
 * Error classification for Espaider API
 * Distinguishes HTTP errors from data validation errors
 * @see Story 15.10 - Error Classification HTTP vs Data
 */

export enum EspaiderErrorClass {
  // HTTP-level errors (retryable)
  HTTP_TIMEOUT = 'HTTP_TIMEOUT',
  HTTP_NETWORK = 'HTTP_NETWORK',
  HTTP_AUTH = 'HTTP_AUTH',
  HTTP_RATE_LIMIT = 'HTTP_RATE_LIMIT',

  // Data-level errors (non-retryable)
  DATA_VALIDATION = 'DATA_VALIDATION',
  DATA_MAPPING = 'DATA_MAPPING',

  // Circuit breaker
  CIRCUIT_OPEN = 'CIRCUIT_OPEN',

  // Unknown
  UNKNOWN = 'UNKNOWN',
}

export interface ClassifiedError {
  type: EspaiderErrorClass;
  message: string;
  statusCode?: number;
  retryable: boolean;
  requestId?: string;
}

/**
 * Classify an error to determine retry strategy
 */
export function classifyError(error: unknown, requestId?: string): ClassifiedError {
  // Timeout errors
  if (error instanceof Error) {
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return {
        type: EspaiderErrorClass.HTTP_TIMEOUT,
        message: 'Request timeout',
        retryable: true,
        requestId,
      };
    }

    if (error.message.includes('fetch')) {
      return {
        type: EspaiderErrorClass.HTTP_NETWORK,
        message: 'Network error',
        retryable: true,
        requestId,
      };
    }
  }

  // HTTP status code errors
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const statusCode = (error as Record<string, unknown>).statusCode as number;

    if (statusCode === 401 || statusCode === 403) {
      return {
        type: EspaiderErrorClass.HTTP_AUTH,
        message: 'Authentication/Authorization failed',
        statusCode,
        retryable: false,
        requestId,
      };
    }

    if (statusCode === 429) {
      return {
        type: EspaiderErrorClass.HTTP_RATE_LIMIT,
        message: 'Rate limit exceeded',
        statusCode,
        retryable: true,
        requestId,
      };
    }
  }

  // Validation errors (Zod)
  if (error && typeof error === 'object' && 'errors' in error) {
    return {
      type: EspaiderErrorClass.DATA_VALIDATION,
      message: 'API contract violation',
      retryable: false,
      requestId,
    };
  }

  return {
    type: EspaiderErrorClass.UNKNOWN,
    message: 'Unknown error',
    retryable: false,
    requestId,
  };
}

/**
 * Determine if error is retryable
 */
export function isRetryable(error: ClassifiedError | EspaiderErrorClass): boolean {
  if (typeof error === 'string') {
    return [
      EspaiderErrorClass.HTTP_TIMEOUT,
      EspaiderErrorClass.HTTP_NETWORK,
      EspaiderErrorClass.HTTP_RATE_LIMIT,
    ].includes(error as EspaiderErrorClass);
  }
  return error.retryable;
}

/**
 * Get human-readable error message
 */
export function getErrorMessage(error: ClassifiedError): string {
  const messages: Record<EspaiderErrorClass, string> = {
    [EspaiderErrorClass.HTTP_TIMEOUT]: 'Request timeout — retrying...',
    [EspaiderErrorClass.HTTP_NETWORK]: 'Network error — retrying...',
    [EspaiderErrorClass.HTTP_AUTH]: 'Authentication failed — check token',
    [EspaiderErrorClass.HTTP_RATE_LIMIT]: 'Rate limited — retrying with backoff...',
    [EspaiderErrorClass.DATA_VALIDATION]: 'API contract violation',
    [EspaiderErrorClass.DATA_MAPPING]: 'Data mapping error',
    [EspaiderErrorClass.CIRCUIT_OPEN]: 'Circuit breaker open',
    [EspaiderErrorClass.UNKNOWN]: 'Unknown error',
  };

  return messages[error.type] || error.message;
}
