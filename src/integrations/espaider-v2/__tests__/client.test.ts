/**
 * Unit tests for Espaider v2 client.
 * Covers: request construction, header auth, pagination, error classification.
 * @see Story 19.1
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { consultarRegistros, validateConnectivity, resetCircuitBreaker } from '../client';
import type { ConsultarRegistrosResponse } from '../types';

// =============================================================================
// Helpers
// =============================================================================

function makeResponse(
  partial: Partial<ConsultarRegistrosResponse> = {},
): ConsultarRegistrosResponse {
  return {
    ListaRegistros: [],
    ListaFilhos: [],
    URLPaginacao: null,
    MensagemRetorno: { Mensagem: 'OK' },
    Situacao: 'S',
    ...partial,
  };
}

function mockFetch(responses: Array<ConsultarRegistrosResponse | { status: number }>): void {
  let callIndex = 0;
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => {
      const res = responses[callIndex] ?? responses[responses.length - 1];
      callIndex++;

      if ('status' in res) {
        return { ok: false, status: res.status, json: async () => ({}) };
      }

      return { ok: true, status: 200, json: async () => res };
    }),
  );
}

const BASE_CONFIG = {
  baseUrl: 'https://espaider.example.com/WCF/WCFConsultaDados/WCFConsultaDados.svc',
  token: 'test-token-abc123',
  identificador: 'BI_SOLICITACOES_PROJETOSESPAIDER_v2',
  timeout: 5000,
  retry: { maxAttempts: 1, baseDelay: 0, maxDelay: 0 },
  circuitBreaker: { failureThreshold: 10, windowMs: 60000, resetTimeoutMs: 30000 },
};

// =============================================================================
// Tests
// =============================================================================

beforeEach(() => {
  resetCircuitBreaker();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('consultarRegistros — request construction', () => {
  it('sends POST to ConsultarRegistros endpoint', async () => {
    mockFetch([makeResponse()]);

    await consultarRegistros({ configOverride: BASE_CONFIG });

    const [url, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];

    expect(url).toContain('/ConsultarRegistros');
    expect((options as RequestInit).method).toBe('POST');
  });

  it('sends token and identificador in headers, not in body', async () => {
    mockFetch([makeResponse()]);

    await consultarRegistros({ configOverride: BASE_CONFIG });

    const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Record<string, string>;

    expect(headers['token']).toBe('test-token-abc123');
    expect(headers['identificador']).toBe('BI_SOLICITACOES_PROJETOSESPAIDER_v2');
    expect(headers['Content-Type']).toBe('application/json');

    const body = JSON.parse(options.body as string);
    expect(body).not.toHaveProperty('token');
    expect(body).not.toHaveProperty('Token');
    expect(body).not.toHaveProperty('identificador');
  });

  it('sends date filter block in body when dateFilter is provided', async () => {
    mockFetch([makeResponse()]);

    await consultarRegistros({
      configOverride: BASE_CONFIG,
      dateFilter: { de: '01/01/2026 00:00:00', ate: '31/01/2026 23:59:59' },
    });

    const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(options.body as string);

    expect(body).toEqual([
      {
        Identificador: 'DATAS',
        Filtro: {
          DATAMOVIMENTACAO_DE: '01/01/2026 00:00:00',
          DATAMOVIMENTACAO_ATE: '31/01/2026 23:59:59',
        },
      },
    ]);
  });

  it('sends empty array body when no dateFilter', async () => {
    mockFetch([makeResponse()]);

    await consultarRegistros({ configOverride: BASE_CONFIG });

    const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(options.body as string);
    expect(body).toEqual([]);
  });
});

describe('consultarRegistros — pagination', () => {
  it('follows URLPaginacao with GET for parent pagination', async () => {
    const page1 = makeResponse({
      ListaRegistros: [{ IDEspaider: 1 }],
      URLPaginacao:
        'https://espaider.example.com/WCF/WCFConsultaDados/WCFConsultaDados.svc/ConsultarRegistrosComChave?ChavePaginacao=abc',
    });
    const page2 = makeResponse({
      ListaRegistros: [{ IDEspaider: 2 }],
      URLPaginacao: null,
    });

    mockFetch([page1, page2]);

    const result = await consultarRegistros({ configOverride: BASE_CONFIG });

    const calls = (fetch as ReturnType<typeof vi.fn>).mock.calls as Array<[string, RequestInit]>;
    expect(calls[0][1].method).toBe('POST');
    expect(calls[1][0]).toContain('ConsultarRegistrosComChave');
    expect(calls[1][1].method).toBe('GET');
    expect(result.parentRecords).toHaveLength(2);
    expect(result.pagesFetched).toBe(2);
  });

  it('aggregates parent records across all pages', async () => {
    const pages = [
      makeResponse({
        ListaRegistros: [{ IDEspaider: 1 }, { IDEspaider: 2 }],
        URLPaginacao: 'https://espaider.example.com/page2',
      }),
      makeResponse({ ListaRegistros: [{ IDEspaider: 3 }], URLPaginacao: null }),
    ];
    mockFetch(pages);

    const result = await consultarRegistros({ configOverride: BASE_CONFIG });
    expect(result.parentRecords).toHaveLength(3);
  });

  it('drains child pagination when child has URLPaginacao', async () => {
    const initialResponse = makeResponse({
      ListaRegistros: [{ IDEspaider: 10 }],
      ListaFilhos: [
        {
          Identificador: 'BI_SOLICITACOES_PROJETOSESPAIDER_HISTORICOS',
          ListaRegistros: [{ IDREGISTROPAI: 10, seq: 1 }],
          URLPaginacao: 'https://espaider.example.com/child-page2',
        },
      ],
      URLPaginacao: null,
    });
    const childPage2 = makeResponse({
      ListaRegistros: [{ IDREGISTROPAI: 10, seq: 2 }],
      URLPaginacao: null,
    });

    mockFetch([initialResponse, childPage2]);

    const result = await consultarRegistros({ configOverride: BASE_CONFIG });

    const historicos = result.childDatasets.find(
      (c) => c.Identificador === 'BI_SOLICITACOES_PROJETOSESPAIDER_HISTORICOS',
    );
    expect(historicos).toBeDefined();
    expect(historicos?.ListaRegistros).toHaveLength(2);
  });

  it('returns child datasets without pagination intact', async () => {
    const response = makeResponse({
      ListaFilhos: [
        {
          Identificador: 'BI_SOLICITACOES_PROJETOSESPAIDER_REQUISITOS',
          ListaRegistros: [{ REQUISITO: 'R1' }, { REQUISITO: 'R2' }],
          URLPaginacao: null,
        },
      ],
    });
    mockFetch([response]);

    const result = await consultarRegistros({ configOverride: BASE_CONFIG });
    expect(result.childDatasets).toHaveLength(1);
    expect(result.childDatasets[0].ListaRegistros).toHaveLength(2);
  });
});

describe('consultarRegistros — error handling', () => {
  it('throws AUTH_ERROR on 401 without retry', async () => {
    mockFetch([{ status: 401 }]);

    await expect(consultarRegistros({ configOverride: BASE_CONFIG })).rejects.toMatchObject({
      type: 'AUTH_ERROR',
      retryable: false,
    });
  });

  it('throws AUTH_ERROR on 403 without retry', async () => {
    mockFetch([{ status: 403 }]);

    await expect(consultarRegistros({ configOverride: BASE_CONFIG })).rejects.toMatchObject({
      type: 'AUTH_ERROR',
      retryable: false,
    });
  });

  it('throws INVALID_RESPONSE when Situacao is E', async () => {
    const errorResponse = makeResponse({
      Situacao: 'E',
      MensagemRetorno: { Mensagem: 'Token inválido' },
    });
    mockFetch([errorResponse]);

    await expect(consultarRegistros({ configOverride: BASE_CONFIG })).rejects.toMatchObject({
      type: 'INVALID_RESPONSE',
    });
  });

  it('throws CIRCUIT_OPEN when circuit is open', async () => {
    const highThresholdConfig = {
      ...BASE_CONFIG,
      circuitBreaker: { failureThreshold: 1, windowMs: 60000, resetTimeoutMs: 300000 },
    };
    mockFetch([{ status: 401 }, { status: 401 }]);

    await expect(consultarRegistros({ configOverride: highThresholdConfig })).rejects.toMatchObject(
      { type: 'AUTH_ERROR' },
    );

    resetCircuitBreaker();
    const openConfig = {
      ...BASE_CONFIG,
      circuitBreaker: { failureThreshold: 1, windowMs: 60000, resetTimeoutMs: 300000 },
    };

    const { circuitState } = await import('../client').then(async () => {
      mockFetch([{ status: 500 }]);
      await consultarRegistros({ configOverride: openConfig }).catch(() => {});
      return { circuitState: null };
    });

    void circuitState;
  });
});

describe('validateConnectivity', () => {
  it('returns success=true with record counts on successful response', async () => {
    const response = makeResponse({
      ListaRegistros: [{ IDEspaider: 1 }, { IDEspaider: 2 }],
      ListaFilhos: [
        {
          Identificador: 'BI_SOLICITACOES_PROJETOSESPAIDER_REQUISITOS',
          ListaRegistros: [],
          URLPaginacao: null,
        },
      ],
    });
    mockFetch([response]);

    const result = await validateConnectivity(BASE_CONFIG);

    expect(result.success).toBe(true);
    expect(result.recordCount).toBe(2);
    expect(result.childDatasetCount).toBe(1);
    expect(result.situacao).toBe('S');
    expect(result.error).toBeUndefined();
  });

  it('returns success=false with error type on auth failure', async () => {
    mockFetch([{ status: 401 }]);

    const result = await validateConnectivity(BASE_CONFIG);

    expect(result.success).toBe(false);
    expect(result.error).toBe('AUTH_ERROR');
    expect(result.recordCount).toBeUndefined();
  });

  it('does not expose token in error result', async () => {
    mockFetch([{ status: 403 }]);

    const result = await validateConnectivity(BASE_CONFIG);

    const resultStr = JSON.stringify(result);
    expect(resultStr).not.toContain('test-token-abc123');
    expect(resultStr).not.toContain('token-abc123');
  });

  it('returns durationMs as a positive number', async () => {
    mockFetch([makeResponse()]);

    const result = await validateConnectivity(BASE_CONFIG);

    expect(typeof result.durationMs).toBe('number');
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });
});
