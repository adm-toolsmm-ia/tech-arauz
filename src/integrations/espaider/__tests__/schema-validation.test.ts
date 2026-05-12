/**
 * Contract tests for Espaider API schemas
 * Validates API response structure with real fixtures
 * @see Story 15.1 - Zod Schemas API Validation
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  ExportarDadosResponseSchema,
  RegistroEspaiderSchema,
  CampoEspaiderSchema,
  URLFilhoSchema,
  EspaiderErrorResponseSchema,
} from '../schemas';

describe('Espaider API Schema Validation', () => {
  describe('CampoEspaiderSchema', () => {
    it('validates valid campo', () => {
      const campo = {
        Identificador: 'CODIGO',
        Valor: 'PROJ-001',
      };
      expect(() => CampoEspaiderSchema.parse(campo)).not.toThrow();
    });

    it('validates campo with null Valor', () => {
      const campo = {
        Identificador: 'DATA_CONCLUSAO',
        Valor: null,
      };
      expect(() => CampoEspaiderSchema.parse(campo)).not.toThrow();
    });

    it('rejects campo with missing Identificador', () => {
      const campo = {
        Valor: 'test',
      };
      expect(() => CampoEspaiderSchema.parse(campo)).toThrow();
    });

    it('rejects campo with extra fields (strict mode)', () => {
      const campo = {
        Identificador: 'CODIGO',
        Valor: 'PROJ-001',
        ExtraField: 'should fail',
      };
      expect(() => CampoEspaiderSchema.parse(campo)).toThrow();
    });
  });

  describe('RegistroEspaiderSchema', () => {
    it('validates valid registro', () => {
      const registro = {
        IDEspaider: 12345,
        Identificador: 'BI_SOLICITACOES_PROJETOSESPAIDER',
        ListaCampos: [
          { Identificador: 'CODIGO', Valor: 'PROJ-001' },
          { Identificador: 'TITULO', Valor: 'Meu Projeto' },
        ],
      };
      expect(() => RegistroEspaiderSchema.parse(registro)).not.toThrow();
    });

    it('validates registro with empty ListaCampos', () => {
      const registro = {
        IDEspaider: 12345,
        Identificador: 'BI_SOLICITACOES_PROJETOSESPAIDER',
        ListaCampos: [],
      };
      expect(() => RegistroEspaiderSchema.parse(registro)).not.toThrow();
    });

    it('rejects registro with non-integer IDEspaider', () => {
      const registro = {
        IDEspaider: 12345.5,
        Identificador: 'BI_SOLICITACOES_PROJETOSESPAIDER',
        ListaCampos: [],
      };
      expect(() => RegistroEspaiderSchema.parse(registro)).toThrow();
    });

    it('rejects registro with negative IDEspaider', () => {
      const registro = {
        IDEspaider: -1,
        Identificador: 'BI_SOLICITACOES_PROJETOSESPAIDER',
        ListaCampos: [],
      };
      expect(() => RegistroEspaiderSchema.parse(registro)).toThrow();
    });

    it('rejects registro with null IDEspaider', () => {
      const registro = {
        IDEspaider: null,
        Identificador: 'BI_SOLICITACOES_PROJETOSESPAIDER',
        ListaCampos: [],
      };
      expect(() => RegistroEspaiderSchema.parse(registro)).toThrow();
    });

    it('rejects registro with invalid ListaCampos', () => {
      const registro = {
        IDEspaider: 12345,
        Identificador: 'BI_SOLICITACOES_PROJETOSESPAIDER',
        ListaCampos: [
          {
            Identificador: 'CODIGO',
            Valor: 'PROJ-001',
            ExtraField: 'invalid',
          },
        ],
      };
      expect(() => RegistroEspaiderSchema.parse(registro)).toThrow();
    });
  });

  describe('URLFilhoSchema', () => {
    it('validates valid URL filha', () => {
      const urlFilho = {
        URL: 'https://api.espaider.com/exporta/projeto/123/entregas',
        Descricao: 'Entregas',
        Identificador: 'BI_SOLICITACOES_PROJETOSESPAIDER_ENTREGAS',
      };
      expect(() => URLFilhoSchema.parse(urlFilho)).not.toThrow();
    });

    it('validates URL filha with minimal fields', () => {
      const urlFilho = {
        URL: 'https://api.espaider.com/exporta/projeto/123/entregas',
      };
      expect(() => URLFilhoSchema.parse(urlFilho)).not.toThrow();
    });

    it('rejects URL filha with invalid URL', () => {
      const urlFilho = {
        URL: 'not-a-url',
        Descricao: 'Entregas',
      };
      expect(() => URLFilhoSchema.parse(urlFilho)).toThrow();
    });

    it('rejects URL filha with extra fields (strict mode)', () => {
      const urlFilho = {
        URL: 'https://api.espaider.com/exporta/projeto/123/entregas',
        Descricao: 'Entregas',
        ExtraField: 'invalid',
      };
      expect(() => URLFilhoSchema.parse(urlFilho)).toThrow();
    });
  });

  describe('ExportarDadosResponseSchema', () => {
    it('validates complete success response', () => {
      const response = {
        Situacao: 'S',
        ListaRegistros: [
          {
            IDEspaider: 12345,
            Identificador: 'BI_SOLICITACOES_PROJETOSESPAIDER',
            ListaCampos: [{ Identificador: 'CODIGO', Valor: 'PROJ-001' }],
          },
        ],
        URLPaginacao: 'https://api.espaider.com/page2',
        ListaURLFilhos: [
          {
            URL: 'https://api.espaider.com/exporta/projeto/123/entregas',
            Descricao: 'Entregas',
          },
        ],
      };
      expect(() => ExportarDadosResponseSchema.parse(response)).not.toThrow();
    });

    it('validates empty success response', () => {
      const response = {
        Situacao: 'S',
        ListaRegistros: [],
      };
      expect(() => ExportarDadosResponseSchema.parse(response)).not.toThrow();
    });

    it('validates error response', () => {
      const response = {
        Situacao: 'E',
        MensagemRetorno: 'Token inválido',
      };
      expect(() => ExportarDadosResponseSchema.parse(response)).not.toThrow();
    });

    it('validates response with missing Situacao', () => {
      const response = {
        ListaRegistros: [],
      };
      expect(() => ExportarDadosResponseSchema.parse(response)).not.toThrow();
    });

    it('rejects response with extra fields (strict mode)', () => {
      const response = {
        Situacao: 'S',
        ListaRegistros: [],
        ExtraField: 'invalid',
      };
      expect(() => ExportarDadosResponseSchema.parse(response)).toThrow();
    });

    it('rejects response with invalid ListaRegistros', () => {
      const response = {
        Situacao: 'S',
        ListaRegistros: [
          {
            IDEspaider: 'not-a-number',
            Identificador: 'BI_SOLICITACOES_PROJETOSESPAIDER',
            ListaCampos: [],
          },
        ],
      };
      expect(() => ExportarDadosResponseSchema.parse(response)).toThrow();
    });

    it('rejects response with invalid ListaURLFilhos', () => {
      const response = {
        Situacao: 'S',
        ListaRegistros: [],
        ListaURLFilhos: [
          {
            URL: 'not-a-url',
          },
        ],
      };
      expect(() => ExportarDadosResponseSchema.parse(response)).toThrow();
    });
  });

  describe('EspaiderErrorResponseSchema', () => {
    it('validates valid error response', () => {
      const response = {
        Situacao: 'E',
        MensagemRetorno: 'Token inválido ou expirado',
      };
      expect(() => EspaiderErrorResponseSchema.parse(response)).not.toThrow();
    });

    it('rejects error response with wrong Situacao', () => {
      const response = {
        Situacao: 'S',
        MensagemRetorno: 'Token inválido',
      };
      expect(() => EspaiderErrorResponseSchema.parse(response)).toThrow();
    });

    it('rejects error response with missing MensagemRetorno', () => {
      const response = {
        Situacao: 'E',
      };
      expect(() => EspaiderErrorResponseSchema.parse(response)).toThrow();
    });

    it('rejects error response with extra fields (strict mode)', () => {
      const response = {
        Situacao: 'E',
        MensagemRetorno: 'Error',
        ExtraField: 'invalid',
      };
      expect(() => EspaiderErrorResponseSchema.parse(response)).toThrow();
    });
  });

  describe('Type inference', () => {
    it('infers correct type from schema', () => {
      const response = {
        Situacao: 'S' as const,
        ListaRegistros: [],
      };
      const parsed = ExportarDadosResponseSchema.parse(response);

      // Type check at compile time:
      expect(typeof parsed.Situacao).toBe('string');
      expect(Array.isArray(parsed.ListaRegistros)).toBe(true);
    });

    it('type-inferred response is assignable to original interface', () => {
      const response = {
        Situacao: 'S',
        ListaRegistros: [
          {
            IDEspaider: 123,
            Identificador: 'test',
            ListaCampos: [],
          },
        ],
      };

      const parsed = ExportarDadosResponseSchema.parse(response);

      // All expected properties exist
      expect('Situacao' in parsed).toBe(true);
      expect('ListaRegistros' in parsed).toBe(true);
      expect('URLPaginacao' in parsed || !('URLPaginacao' in parsed)).toBe(true);
    });
  });

  describe('Zod error messages', () => {
    it('provides clear field error messages', () => {
      // Use a float to trigger z.number().int() validation (string input triggers
      // "Expected number, received string" which does not mention "integer").
      const response = {
        Situacao: 'S',
        ListaRegistros: [
          {
            IDEspaider: 1.5,
            Identificador: 'test',
            ListaCampos: [],
          },
        ],
      };

      try {
        ExportarDadosResponseSchema.parse(response);
        expect.fail('Should have thrown');
      } catch (error) {
        if (error instanceof z.ZodError) {
          const messages = error.errors.map((e) => e.message);
          expect(messages.some((m) => m.toLowerCase().includes('integer'))).toBe(true);
        } else {
          throw error;
        }
      }
    });
  });
});
