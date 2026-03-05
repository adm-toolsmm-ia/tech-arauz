/**
 * Tipos para integração com API Espaider
 * @see ADR-002: Auth Espaider
 */

// =============================================================================
// Tipos de Requisição
// =============================================================================

/**
 * Datasets disponíveis para exportação
 */
export type EspaiderDataset =
  | 'Projetos'
  | 'Entregas'
  | 'Cronogramas'
  | 'Requisitos'
  | 'Historicos'
  | 'Orcamentos'
  | 'Aprovadores'
  | 'TempoPermanencia'
  | 'HorasLancadas';

/**
 * Parâmetros para a função exportarDados
 */
export interface ExportarDadosParams {
  /** Identificador real da API Espaider (ex: BI_SOLICITACOES_SUPORTEESPAIDER) */
  identificador: string;
  /** URL base da API (opcional — usa env se não fornecido) */
  baseUrl?: string;
  /** Token de autenticação (opcional — usa env se não fornecido) */
  token?: string;
  /** Filtros opcionais para a consulta (BlocoFiltros) */
  filtros?: Record<string, string>;
}

// =============================================================================
// Tipos de Resposta da API
// =============================================================================

/**
 * Estrutura de um campo retornado pela API
 */
export interface CampoEspaider {
  /** Nome/identificador do campo */
  Identificador: string;
  /** Valor do campo (string ou null quando vazio na API) */
  Valor: string | null;
}

/**
 * Estrutura de um registro retornado pela API
 */
export interface RegistroEspaider {
  /** ID único do registro no Espaider */
  IDEspaider: number;
  /** Dataset de origem */
  Identificador: string;
  /** Lista de campos do registro */
  ListaCampos: CampoEspaider[];
}

/**
 * URL de interface filha retornada pela API principal
 */
export interface URLFilho {
  /** URL completa para GET dos registros filhos */
  URL: string;
  /** Descrição da interface (ex: "Entregas", "Cronogramas", "Requisitos") - OPCIONAL na API real */
  Descricao?: string;
  /** Identificador da interface (ex: "BI_SOLICITACOES_PROJETOSESPAIDER_HISTORICOS") - Campo real retornado pela API */
  Identificador?: string;
}

/**
 * Resposta completa da API ExportaDados
 */
export interface ExportarDadosResponse {
  /** "S" = sucesso, "E" = erro */
  Situacao?: string;
  /** Mensagem de erro (quando Situacao = "E") */
  MensagemRetorno?: string;
  /** Lista de registros retornados */
  ListaRegistros: RegistroEspaider[];
  /** URL para próxima página (GET). Vazio quando não há mais páginas */
  URLPaginacao?: string;
  /** URLs das interfaces filhas (cronogramas, entregas, requisitos) */
  ListaURLFilhos?: URLFilho[];
}

// =============================================================================
// Tipos Mapeados (após transformação)
// =============================================================================

/**
 * Projeto mapeado para uso interno
 * @see BR-003: Mapeamento de Campos Espaider
 */
export interface ProjetoMapeado {
  id_espaider: number;
  codigo: string;
  titulo: string;
  status: string;
  responsavel: string;
  prioridade: string;
  prazo_final: Date | null;
  updated_at: Date | null;
  categoria: string;
  // === Novos campos (Migration 009) ===
  /** Situação atual do projeto - SITUACAOATUAL */
  situacao_atual: string;
  /** Status do projeto (campo STATUS) */
  status_field: string;
  /** Fase atual do projeto - APROVADORATUAL - usado para agrupar Kanban */
  fase_atual: string;
  /** Prazo da fase atual - PRAZOAPROVADOR */
  prazo_fase: Date | null;
  /** Atividade atual do cronograma - CRONOGRAMAATUAL */
  cronograma_atual: string;
  /** Prazo do cronograma atual - PRAZOCRONOGRAMAATUAL */
  prazo_cronograma: Date | null;
  /** Area do projeto - ASSUNTOAREA */
  area: string;
  /** Pasta consultivo - PASTACONSULTIVO */
  pasta_consultivo: string;
  /** Ambiente da solucao aplicada - SOLUCAOAPLICADAEM */
  solucao_aplicada: string;
  /** Data da ultima movimentacao - DATAMOVIMENTACAO */
  data_movimentacao: Date | null;
  /** Data de encerramento - ENCERRADOEM */
  data_encerramento: Date | null;
  /** Data inicio aprovacao - DATAINICIOAPROVACAO */
  data_inicio_aprovacao: Date | null;

  // === Novos campos (Migration 014 - Visão 360) ===
  /** Número do ticket externo - TRMESPAIDER */
  trm_espaider: string;
  /** Tipo de chamado - TIPOCHAMADO */
  tipo_chamado: string;
  /** Tipo de assunto - TIPOASSUNTO */
  tipo_assunto: string;
  /** Solicitante - SOLICITANTE */
  solicitante: string;
  /** Objetivo - OBJETIVO */
  objetivo: string;
  /** Motivo importância especial - MOTIVO_IMPORTANCIAESPECIAL */
  motivo_importancia_especial: string;
  /** Mensagem de movimentação - MENSAGEM_MOVIMENTACAO */
  mensagem_movimentacao: string;
  /** Justificativa - JUSTIFICATIVA */
  justificativa: string;
  /** Importância especial - IMPORTANCIAESPECIAL (Sim -> true) */
  importancia_especial: boolean;
  /** Impacto operacional - IMPACTOOPERACIONAL */
  impacto_operacional: string;
  /** Impacto estratégico - IMPACTOESTRATEGICO */
  impacto_estrategico: string;
  /** Escopo - ESCOPO */
  escopo: string;
  /** Complexidade técnica - COMPLEXIDADETECNICA */
  complexidade_tecnica: string;

  /** Campos extras não mapeados */
  extras: Record<string, string>;
}

/**
 * Entrega mapeada para uso interno
 */
export interface EntregaMapeada {
  id_espaider: number;
  projeto_id_espaider: number;
  titulo: string;
  status: string;
  data_prevista: Date | null;
  data_realizada: Date | null;
  // === Novos campos (Migration 011) ===
  /** Ordem/sequencia da entrega - ORDEM */
  ordem: string;
  /** Detalhamento da entrega - DETALHAMENTO */
  detalhamento: string;
  /** Prioridade da entrega - PRIORIDADE (separado de status!) */
  prioridade: string;
  /** Campos extras não mapeados */
  extras: Record<string, string>;
}

/**
 * Cronograma mapeado para uso interno
 */
export interface CronogramaMapeado {
  id_espaider: number;
  projeto_id_espaider: number;
  atividade: string;
  responsavel: string;
  data_inicio: Date | null;
  data_fim: Date | null;
  status: string;
  // === Novos campos (Migration 010) ===
  /** Fase da atividade - FASEATIVIDADE */
  fase_atividade: string;
  /** Indica se atividade esta atrasada - ATRASADO (Sim/Nao) */
  atrasado: boolean;
  /** Setor responsavel - SETORRESPONSAVEL */
  setor_responsavel: string;
  /** Numero do item - ITEM */
  item: string;
  /** Detalhamento da atividade - DETALHAMENTO */
  detalhamento: string;
  /** Data prazo original - DATAPRAZO */
  data_prazo: Date | null;
  /** Novo prazo renegociado - DATANOVOPRAZO */
  data_novo_prazo: Date | null;
  /** Data de alerta do prazo - DATAALERTAPRAZO */
  data_alerta_prazo: Date | null;
  /** Prazo confirmado - PRAZOCONFIRMADO */
  prazo_confirmado: boolean;
  /** Campos extras não mapeados */
  extras: Record<string, string>;
}

/**
 * Requisito mapeado para uso interno
 */
export interface RequisitoMapeado {
  id_espaider: number;
  projeto_id_espaider: number;
  codigo: string;
  descricao: string;
  tipo: string;
  prioridade: string;
  status: string;
  // === Novos campos (Migration 012) ===
  /** Nivel de impacto - IMPACTO */
  impacto: string;
  /** Detalhamento do requisito - DETALHAMENTOREQUISITO */
  detalhamento: string;
  /** ID Espaider da entrega vinculada - IDENTIFICADOR_ENTREGA */
  entrega_id_espaider: number;
  /** Nome da entrega vinculada - ENTREGA */
  entrega_nome: string;
  /** Data de conclusao - DATACONCLUSAO */
  data_conclusao: Date | null;
  /** Campos extras não mapeados */
  extras: Record<string, string>;
}

/**
 * Histórico mapeado (Novo)
 */
export interface HistoricoMapeado {
  id_espaider: number;
  projeto_id_espaider: number; // IDREGISTROPAI
  tipo: string; // TIPOHISTORICO
  responsavel_para: string; // RESPONSAVEL_PARA
  responsavel_de: string; // RESPONSAVEL_DE
  passo_para: string; // PASSO_PARA
  passo_de: string; // PASSO_DE
  numero_tramite: number; // NUMEROTRAMITE
  mensagem: string; // MENSAGEM
  data: Date | null; // DATA_DE
  espaider_raw?: RegistroEspaider; // JSON bruto da API
}

/**
 * Orçamento mapeado (Novo)
 */
export interface OrcamentoMapeado {
  id_espaider: number;
  projeto_id_espaider: number; // IDREGISTROPAI
  valor: number; // VALOR
  fornecedor: string; // FORNECEDOR
  data_cotacao: Date | null; // DATACOTACAO
  moeda?: string; // MOEDA
  espaider_raw?: RegistroEspaider; // JSON bruto da API
}

/**
 * Aprovador mapeado (Novo)
 */
export interface AprovadorMapeado {
  id_espaider: number;
  projeto_id_espaider: number; // IDREGISTROPAI
  tipo: string; // TIPO
  responsavel: string; // RESPONSAVEL
  pontos_atencao: string; // PONTOSATENCAO
  espaider_raw?: RegistroEspaider; // JSON bruto da API
}

/**
 * Tempo de Permanência por fase mapeado (interface filha de Projetos)
 * API: BI_SOLICITACOES_PROJETOSESPAIDER_TEMPOSPERMANENCIA
 */
export interface TempoPermanenciaMapeado {
  id_espaider: number;
  projeto_id_espaider: number;  // IDREGISTROPAI
  fase: string;                 // FASE
  responsavel: string;          // RESPONSAVEL
  situacao: string;             // SITUACAO
  tempo_permanencia_dias: number | null; // TEMPOPERMANENCIA (numérico)
  data_inicio: Date | null;     // DATAINICIO
  data_fim: Date | null;        // DATAFIM
  espaider_raw?: RegistroEspaider;
}

/**
 * Hora lançada por profissional mapeada
 * API: BI_SOLICITACOES_PROJETOSESPAIDER_HORASLANCADAS
 */
export interface HoraLancadaMapeada {
  id_espaider: number;
  projeto_id_espaider: number;   // ID da solicitação (FK para projects)
  solicitacao_id: number;        // IDSOLICITACAO
  pasta_consultivo_id: number | null; // PASTACONSULTIVO_ID
  profissional: string;          // PROFISSIONAL
  horas: number | null;          // HORAS
  data_lancamento: Date | null;  // DATALANCAMENTO
  tipo_lancamento: string;       // TIPOLANCAMENTO
  espaider_raw?: RegistroEspaider;
}

// =============================================================================
// Tipos de Erro
// =============================================================================

/**
 * Tipos de erro da integração Espaider
 */
export type EspaiderErrorType =
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'AUTH_ERROR'
  | 'RATE_LIMIT'
  | 'INVALID_RESPONSE'
  | 'CIRCUIT_OPEN'
  | 'UNKNOWN';

/**
 * Erro estruturado da integração
 */
export interface EspaiderError {
  type: EspaiderErrorType;
  message: string;
  statusCode?: number;
  retryable: boolean;
  requestId: string;
}

// =============================================================================
// Tipos de Configuração
// =============================================================================

/**
 * Configuração do client Espaider
 */
export interface EspaiderConfig {
  baseUrl: string;
  token: string;
  key?: string;
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
 * Métricas de uma sincronização
 */
export interface SyncMetrics {
  requestId: string;
  dataset: EspaiderDataset;
  startedAt: Date;
  completedAt: Date;
  durationMs: number;
  totalRecords: number;
  newRecords: number;
  updatedRecords: number;
  errors: number;
  retries: number;
}

// =============================================================================
// Sync Log Entry (structured logs for frontend visibility)
// =============================================================================

export type SyncLogLevel = 'info' | 'warn' | 'error' | 'success';

export interface SyncLogEntry {
  timestamp: string;
  level: SyncLogLevel;
  dataset: EspaiderDataset | 'Geral';
  message: string;
  details?: Record<string, unknown>;
}
