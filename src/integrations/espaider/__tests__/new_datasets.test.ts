/**
 * Testes de contrato para os novos datasets (Históricos, Orçamentos, Aprovadores)
 * Integration: Espaider
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    mapearHistorico,
    mapearOrcamento,
    mapearAprovador,
    type RegistroEspaider,
} from '../index';

// =============================================================================
// Mocks
// =============================================================================

const mockHistoricoRegistro: RegistroEspaider = {
    IDEspaider: 483651,
    Identificador: 'BI_SOLICITACOES_PROJETOSESPAIDER_HISTORICOS',
    ListaCampos: [
        { Identificador: 'IDREGISTROPAI', Valor: '116727' },
        { Identificador: 'TIPOHISTORICO', Valor: 'Requisição criada' },
        { Identificador: 'RESPONSAVEL_PARA', Valor: 'Gabriel' },
        { Identificador: 'RESPONSAVEL_DE', Valor: 'Sistema' },
        { Identificador: 'NUMEROTRAMITE', Valor: '1' },
        { Identificador: 'MENSAGEM', Valor: 'Criado via API' },
        { Identificador: 'DATA_DE', Valor: '10/08/2020 - 17:12:33' },
    ],
    ListaURLFilhos: [],
    MensagemRetorno: null,
    Situacao: 'S',
    URLPaginacao: '',
};

const mockOrcamentoRegistro: RegistroEspaider = {
    IDEspaider: 123,
    Identificador: 'BI_SOLICITACOES_PROJETOSESPAIDER_ORCAMENTOS',
    ListaCampos: [
        { Identificador: 'IDREGISTROPAI', Valor: '116727' },
        { Identificador: 'VALOR', Valor: '4.033,94' },
        { Identificador: 'FORNECEDOR', Valor: 'Tech Corp' },
        { Identificador: 'DATACOTACAO', Valor: '15/05/2026' },
    ],
    ListaURLFilhos: [],
    MensagemRetorno: null,
    Situacao: 'S',
    URLPaginacao: '',
};

const mockAprovadorRegistro: RegistroEspaider = {
    IDEspaider: 180,
    Identificador: 'BI_SOLICITACOES_PROJETOSESPAIDER_APROVADORES',
    ListaCampos: [
        { Identificador: 'IDREGISTROPAI', Valor: '266986' },
        { Identificador: 'TIPO', Valor: 'Aprovar definição/validação' },
        { Identificador: 'RESPONSAVEL', Valor: 'Juliane Pereira' },
        { Identificador: 'PONTOSATENCAO', Valor: 'Verificar custos' },
    ],
    ListaURLFilhos: [],
    MensagemRetorno: null,
    Situacao: 'S',
    URLPaginacao: '',
};

// =============================================================================
// Testes
// =============================================================================

describe('Mapper - Históricos', () => {
    it('deve mapear campos corretamente', () => {
        const result = mapearHistorico(mockHistoricoRegistro);

        expect(result.id_espaider).toBe(483651);
        expect(result.projeto_id_espaider).toBe(116727);
        expect(result.tipo).toBe('Requisição criada');
        expect(result.responsavel_para).toBe('Gabriel');
        expect(result.responsavel_de).toBe('Sistema');
        expect(result.numero_tramite).toBe(1);
        expect(result.mensagem).toBe('Criado via API');
    });

    it('deve parsear data e hora corretamente', () => {
        const result = mapearHistorico(mockHistoricoRegistro);

        expect(result.data).toBeInstanceOf(Date);
        // 10/08/2020 - 17:12:33
        expect(result.data?.getFullYear()).toBe(2020);
        expect(result.data?.getDate()).toBe(10);
        expect(result.data?.getMonth()).toBe(7); // Agosto = 7
    });
});

describe('Mapper - Orçamentos', () => {
    it('deve mapear campos corretamente', () => {
        const result = mapearOrcamento(mockOrcamentoRegistro);

        expect(result.id_espaider).toBe(123);
        expect(result.projeto_id_espaider).toBe(116727);
        expect(result.fornecedor).toBe('Tech Corp');
    });

    it('deve parsear valor monetário corretamente', () => {
        // "4.033,94" -> 4033.94
        const result = mapearOrcamento(mockOrcamentoRegistro);
        expect(result.valor).toBe(4033.94);
    });

    it('deve parsear data de cotação', () => {
        const result = mapearOrcamento(mockOrcamentoRegistro);
        expect(result.data_cotacao).toBeInstanceOf(Date);
        expect(result.data_cotacao?.getFullYear()).toBe(2026);
    });
});

describe('Mapper - Aprovadores', () => {
    it('deve mapear campos corretamente', () => {
        const result = mapearAprovador(mockAprovadorRegistro);

        expect(result.id_espaider).toBe(180);
        expect(result.projeto_id_espaider).toBe(266986);
        expect(result.tipo).toBe('Aprovar definição/validação');
        expect(result.responsavel).toBe('Juliane Pereira');
        expect(result.pontos_atencao).toBe('Verificar custos');
    });
});
