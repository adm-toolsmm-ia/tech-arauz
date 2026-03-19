/**
 * Zod validation schemas for Espaider API
 * Runtime validation for API contracts with type-safe inference
 * @see Story 15.1 - Zod Schemas API Validation
 */

import { z } from 'zod';

// ============================================================================
// Request Schemas
// ============================================================================

/**
 * Schema para requisição ExportaDados
 * Campos dinâmicos permitidos para BlocoFiltros
 */
export const ExportarDadosRequestSchema = z
  .object({
    Token: z.string().min(1, 'Token é obrigatório'),
    Identificador: z.string().min(1, 'Identificador é obrigatório'),
    NumPagina: z.number().int().positive().optional().default(1),
    QuantRegistrosPorPagina: z.number().int().positive().optional().default(100),
    Key: z.string().optional(),
  })
  .strict()
  .catchall(z.unknown()); // Permite BlocoFiltros dinâmicos

export type ExportarDadosRequest = z.infer<typeof ExportarDadosRequestSchema>;

// ============================================================================
// Response Schemas
// ============================================================================

/**
 * Schema para um campo individual da resposta Espaider
 */
export const CampoEspaiderSchema = z
  .object({
    Identificador: z.string().min(1, 'Identificador do campo é obrigatório'),
    Valor: z.string().nullable(),
  })
  .strict();

export type CampoEspaider = z.infer<typeof CampoEspaiderSchema>;

/**
 * Schema para um registro individual da resposta Espaider
 */
export const RegistroEspaiderSchema = z
  .object({
    IDEspaider: z.number().int().positive('IDEspaider deve ser um inteiro positivo'),
    Identificador: z.string().min(1, 'Identificador do registro é obrigatório'),
    ListaCampos: z.array(CampoEspaiderSchema),
  })
  .strict();

export type RegistroEspaider = z.infer<typeof RegistroEspaiderSchema>;

/**
 * Schema para URL de interface filha (pagination + child interfaces)
 */
export const URLFilhoSchema = z
  .object({
    URL: z.string().url('URL deve ser válida'),
    Descricao: z.string().optional(),
    Identificador: z.string().optional(),
  })
  .strict();

export type URLFilho = z.infer<typeof URLFilhoSchema>;

/**
 * Schema principal para resposta da API Espaider
 * Situacao: 'S' = Sucesso, 'E' = Erro
 */
export const ExportarDadosResponseSchema = z
  .object({
    Situacao: z.enum(['S', 'E']).optional(),
    ListaRegistros: z.array(RegistroEspaiderSchema).optional().default([]),
    URLPaginacao: z.string().optional(),
    ListaURLFilhos: z.array(URLFilhoSchema).optional(),
    MensagemRetorno: z.string().optional(),
  })
  .strict();

export type ExportarDadosResponse = z.infer<typeof ExportarDadosResponseSchema>;

// ============================================================================
// Error Response Schema
// ============================================================================

/**
 * Schema para resposta de erro do Espaider
 */
export const EspaiderErrorResponseSchema = z
  .object({
    Situacao: z.literal('E'),
    MensagemRetorno: z.string().min(1, 'Mensagem de erro é obrigatória'),
  })
  .strict();

export type EspaiderErrorResponse = z.infer<typeof EspaiderErrorResponseSchema>;

// ============================================================================
// List Structure Schemas (para validação de estruturas específicas)
// ============================================================================

/**
 * Schema para a estrutura ListaRegistros
 */
export const EstruturaListaRegistrosSchema = z.array(RegistroEspaiderSchema);

export type EstruturaListaRegistros = z.infer<typeof EstruturaListaRegistrosSchema>;

/**
 * Schema para a estrutura URLPaginacao
 */
export const EstruturaURLPaginacaoSchema = z.string().url('URLPaginacao deve ser uma URL válida');

export type EstruturaURLPaginacao = z.infer<typeof EstruturaURLPaginacaoSchema>;
