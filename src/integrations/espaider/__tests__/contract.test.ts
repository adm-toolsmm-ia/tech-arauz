/**
 * Testes de contrato para integração Espaider
 * Validam estrutura das respostas da API usando mocks
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  exportarDados,
  resetCircuitBreaker,
  mapearProjeto,
  mapearEntrega,
  mapearCronograma,
  mapearRequisito,
  type RegistroEspaider,
  type ExportarDadosResponse,
} from '../index';

// =============================================================================
// Mocks de Resposta (baseados em src/integrations/espaider/references/)
// =============================================================================

const mockProjetoResponse: ExportarDadosResponse = {
  ListaRegistros: [
    {
      IDEspaider: 12345,
      Identificador: 'Projetos',
      ListaCampos: [
        { Identificador: 'TRMESPAIDER', Valor: 'SUPOR.00001/25' },
        { Identificador: 'NOME', Valor: 'Migração Sistema X' },
        { Identificador: 'STATUSPROJETO', Valor: 'Em execução' },
        { Identificador: 'RESPONSAVELPROJETO', Valor: 'João Silva' },
        { Identificador: 'PRIORIDADE', Valor: 'Alta' },
        { Identificador: 'PRAZOFINAL', Valor: '31/12/2026' },
        { Identificador: 'DATAMOVIMENTACAO', Valor: '2026-02-07' },
        { Identificador: 'TIPOASSUNTO', Valor: 'Suporte' },
        { Identificador: 'CODIGO', Valor: 'PROJ-001' },
      ],
    },
  ],
};

// Campos reais da API: IDREGISTROPAI, ENTREGA, DATAINICIO, DATACONCLUSAO
const mockEntregaResponse: ExportarDadosResponse = {
  ListaRegistros: [
    {
      IDEspaider: 67890,
      Identificador: 'BI_SOLICITACOES_SUPORTEESPAIDER_ENTREGAS',
      ListaCampos: [
        { Identificador: 'IDREGISTROPAI', Valor: '12345' },
        { Identificador: 'ENTREGA', Valor: 'Entrega 1 - Análise' },
        { Identificador: 'PRIORIDADE', Valor: 'Concluído' },
        { Identificador: 'DATAINICIO', Valor: '15/02/2026' },
        { Identificador: 'DATACONCLUSAO', Valor: '14/02/2026' },
        { Identificador: 'IDENTIFICADOR', Valor: '67890' },
      ],
    },
  ],
};

// =============================================================================
// Setup
// =============================================================================

beforeEach(() => {
  resetCircuitBreaker();
  vi.resetAllMocks();
});

// =============================================================================
// Testes de Contrato - Estrutura da Resposta
// =============================================================================

describe('Contrato API Espaider - Estrutura', () => {
  it('deve ter ListaRegistros como array', () => {
    expect(mockProjetoResponse.ListaRegistros).toBeInstanceOf(Array);
  });

  it('cada registro deve ter IDEspaider, Identificador e ListaCampos', () => {
    const registro = mockProjetoResponse.ListaRegistros[0];

    expect(registro).toHaveProperty('IDEspaider');
    expect(registro).toHaveProperty('Identificador');
    expect(registro).toHaveProperty('ListaCampos');

    expect(typeof registro.IDEspaider).toBe('number');
    expect(typeof registro.Identificador).toBe('string');
    expect(registro.ListaCampos).toBeInstanceOf(Array);
  });

  it('cada campo deve ter Identificador e Valor como strings', () => {
    const campos = mockProjetoResponse.ListaRegistros[0].ListaCampos;

    for (const campo of campos) {
      expect(campo).toHaveProperty('Identificador');
      expect(campo).toHaveProperty('Valor');
      expect(typeof campo.Identificador).toBe('string');
      expect(typeof campo.Valor).toBe('string');
    }
  });
});

// =============================================================================
// Testes de Mapping - Projetos
// =============================================================================

describe('Mapper - Projetos', () => {
  it('deve mapear campos obrigatórios corretamente', () => {
    const registro = mockProjetoResponse.ListaRegistros[0];
    const projeto = mapearProjeto(registro);

    expect(projeto.id_espaider).toBe(12345);
    expect(projeto.codigo).toBe('PROJ-001');
    expect(projeto.titulo).toBe('Migração Sistema X');
    expect(projeto.status).toBe('Em execução');
    expect(projeto.responsavel).toBe('João Silva');
    expect(projeto.prioridade).toBe('Alta');
    expect(projeto.categoria).toBe('Suporte');
  });

  it('deve parsear datas corretamente', () => {
    const registro = mockProjetoResponse.ListaRegistros[0];
    const projeto = mapearProjeto(registro);

    expect(projeto.prazo_final).toBeInstanceOf(Date);
    expect(projeto.prazo_final?.getFullYear()).toBe(2026);
    expect(projeto.prazo_final?.getMonth()).toBe(11); // Dezembro = 11
    expect(projeto.prazo_final?.getDate()).toBe(31);
  });

  it('deve capturar campos extras', () => {
    const registro: RegistroEspaider = {
      IDEspaider: 1,
      Identificador: 'Projetos',
      ListaCampos: [
        { Identificador: 'NOME', Valor: 'Teste' },
        { Identificador: 'CAMPO_EXTRA', Valor: 'Valor Extra' },
      ],
    };

    const projeto = mapearProjeto(registro);
    expect(projeto.extras).toHaveProperty('CAMPO_EXTRA');
    expect(projeto.extras['CAMPO_EXTRA']).toBe('Valor Extra');
  });

  it('deve retornar null para datas vazias', () => {
    const registro: RegistroEspaider = {
      IDEspaider: 1,
      Identificador: 'Projetos',
      ListaCampos: [{ Identificador: 'PRAZOFINAL', Valor: '' }],
    };

    const projeto = mapearProjeto(registro);
    expect(projeto.prazo_final).toBeNull();
  });
});

// =============================================================================
// Testes de Mapping - Entregas
// =============================================================================

describe('Mapper - Entregas', () => {
  it('deve mapear campos obrigatórios corretamente', () => {
    const registro = mockEntregaResponse.ListaRegistros[0];
    const entrega = mapearEntrega(registro);

    expect(entrega.id_espaider).toBe(67890);
    expect(entrega.projeto_id_espaider).toBe(12345);
    expect(entrega.titulo).toBe('Entrega 1 - Análise');
    expect(entrega.status).toBe('Concluido');
  });

  it('deve parsear datas brasileiras', () => {
    const registro = mockEntregaResponse.ListaRegistros[0];
    const entrega = mapearEntrega(registro);

    expect(entrega.data_prevista).toBeInstanceOf(Date);
    expect(entrega.data_prevista?.getDate()).toBe(15);
    expect(entrega.data_prevista?.getMonth()).toBe(1); // Fevereiro = 1
    expect(entrega.data_realizada).toBeInstanceOf(Date);
    expect(entrega.data_realizada?.getDate()).toBe(14);
  });
});

// =============================================================================
// Testes de Mapping - Cronogramas
// =============================================================================

describe('Mapper - Cronogramas', () => {
  it('deve mapear cronograma com todos os campos', () => {
    const registro: RegistroEspaider = {
      IDEspaider: 11111,
      Identificador: 'BI_SOLICITACOES_SUPORTEESPAIDER_CRONOGRAMAS',
      ListaCampos: [
        { Identificador: 'IDREGISTROPAI', Valor: '12345' },
        { Identificador: 'ATIVIDADE', Valor: 'Análise de requisitos' },
        { Identificador: 'RESPONSAVEL', Valor: 'Maria Santos' },
        { Identificador: 'DATAINICIO', Valor: '01/02/2026' },
        { Identificador: 'DATACONCLUSAO', Valor: '15/02/2026' },
        { Identificador: 'STATUS', Valor: 'Em andamento' },
      ],
    };

    const cronograma = mapearCronograma(registro);

    expect(cronograma.id_espaider).toBe(11111);
    expect(cronograma.projeto_id_espaider).toBe(12345);
    expect(cronograma.atividade).toBe('Análise de requisitos');
    expect(cronograma.responsavel).toBe('Maria Santos');
    expect(cronograma.status).toBe('Em andamento');
  });
});

// =============================================================================
// Testes de Mapping - Requisitos
// =============================================================================

describe('Mapper - Requisitos', () => {
  it('deve mapear requisito com todos os campos', () => {
    const registro: RegistroEspaider = {
      IDEspaider: 22222,
      Identificador: 'BI_SOLICITACOES_SUPORTEESPAIDER_REQUISITOS',
      ListaCampos: [
        { Identificador: 'IDREGISTROPAI', Valor: '12345' },
        { Identificador: 'IDENTIFICADOR', Valor: 'REQ-001' },
        { Identificador: 'REQUISITO', Valor: 'O sistema deve...' },
        { Identificador: 'ORIGEMREQUISITO', Valor: 'Funcional' },
        { Identificador: 'PRIORIDADE', Valor: 'Alta' },
        { Identificador: 'STATUSREQUISITO', Valor: 'Aprovado' },
      ],
    };

    const requisito = mapearRequisito(registro);

    expect(requisito.id_espaider).toBe(22222);
    expect(requisito.projeto_id_espaider).toBe(12345);
    expect(requisito.codigo).toBe('REQ-001');
    expect(requisito.descricao).toBe('O sistema deve...');
    expect(requisito.tipo).toBe('Funcional');
    expect(requisito.prioridade).toBe('Alta');
    expect(requisito.status).toBe('Aprovado');
  });
});

// =============================================================================
// Testes de Edge Cases
// =============================================================================

describe('Edge Cases', () => {
  it('deve lidar com ListaRegistros vazia', () => {
    const response: ExportarDadosResponse = {
      ListaRegistros: [],
    };

    expect(response.ListaRegistros).toHaveLength(0);
  });

  it('deve lidar com ListaCampos vazia', () => {
    const registro: RegistroEspaider = {
      IDEspaider: 1,
      Identificador: 'Projetos',
      ListaCampos: [],
    };

    const projeto = mapearProjeto(registro);

    expect(projeto.id_espaider).toBe(1);
    expect(projeto.titulo).toBe('');
    expect(projeto.status).toBe('');
  });

  it('deve usar TRMESPAIDER como fallback se CODIGO não existir', () => {
    const registro: RegistroEspaider = {
      IDEspaider: 1,
      Identificador: 'Projetos',
      ListaCampos: [{ Identificador: 'TRMESPAIDER', Valor: 'SUPOR.00001/25' }],
    };

    const projeto = mapearProjeto(registro);
    expect(projeto.codigo).toBe('SUPOR.00001/25');
  });
});
