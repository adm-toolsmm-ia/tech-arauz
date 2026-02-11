/**
 * Mapper para converter ListaCampos do Espaider em objetos tipados
 * @see BR-003: Mapeamento de Campos Espaider
 */

import type {
    RegistroEspaider,
    CampoEspaider,
    ProjetoMapeado,
    EntregaMapeada,
    CronogramaMapeado,
    RequisitoMapeado,
} from './types';

// =============================================================================
// Helpers
// =============================================================================

/**
 * Extrai valor de um campo pelo identificador
 */
function getCampoValor(
    campos: CampoEspaider[],
    identificador: string
): string {
    const campo = campos.find((c) => c.Identificador === identificador);
    const v = campo?.Valor;
    return v != null ? String(v) : '';
}

/**
 * Converte string de data do Espaider para Date.
 * Suporta formatos:
 *   - DD/MM/YYYY (ex: 31/12/2026)
 *   - DD/MM/YYYY - HH:MM:SS (ex: 12/06/2025 - 14:21:16)
 *   - YYYY-MM-DD
 *   - ISO 8601
 */
function parseData(valor: string): Date | null {
    if (!valor || valor.trim() === '') {
        return null;
    }

    // Tenta formato DD/MM/YYYY ou DD/MM/YYYY - HH:MM:SS
    const brMatch = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (brMatch) {
        const [, dia, mes, ano] = brMatch;
        return new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    }

    // Tenta formato ISO ou YYYY-MM-DD
    const date = new Date(valor);
    return isNaN(date.getTime()) ? null : date;
}

/**
 * Extrai campos extras não mapeados
 */
function getExtras(
    campos: CampoEspaider[],
    camposMapeados: string[]
): Record<string, string> {
    const extras: Record<string, string> = {};

    for (const campo of campos) {
        if (!camposMapeados.includes(campo.Identificador)) {
            extras[campo.Identificador] = campo.Valor != null ? String(campo.Valor) : '';
        }
    }

    return extras;
}

// =============================================================================
// Mappers
// =============================================================================

/**
 * Campos mapeados para Projetos
 * @see BR-003
 */
const CAMPOS_PROJETO = [
    'CODIGO',
    'NOME',
    'TRMESPAIDER',
    'STATUSPROJETO',
    'RESPONSAVELPROJETO',
    'PRIORIDADE',
    'PRAZOFINAL',
    'DATAMOVIMENTACAO',
    'TIPOASSUNTO',
];

/**
 * Mapeia registro Espaider para ProjetoMapeado
 */
export function mapearProjeto(registro: RegistroEspaider): ProjetoMapeado {
    const campos = registro.ListaCampos;

    return {
        id_espaider: registro.IDEspaider,
        codigo: getCampoValor(campos, 'CODIGO') || getCampoValor(campos, 'TRMESPAIDER'),
        titulo: getCampoValor(campos, 'NOME'),
        status: getCampoValor(campos, 'STATUSPROJETO'),
        responsavel: getCampoValor(campos, 'RESPONSAVELPROJETO'),
        prioridade: getCampoValor(campos, 'PRIORIDADE'),
        prazo_final: parseData(getCampoValor(campos, 'PRAZOFINAL')),
        updated_at: parseData(getCampoValor(campos, 'DATAMOVIMENTACAO')),
        categoria: getCampoValor(campos, 'TIPOASSUNTO'),
        extras: getExtras(campos, CAMPOS_PROJETO),
    };
}

/**
 * Campos mapeados para Entregas (nomes reais da API Espaider)
 * @see src/integrations/espaider/references/response - Entregas de Projetos.json
 */
const CAMPOS_ENTREGA = [
    'IDREGISTROPAI',
    'ENTREGA',
    'IDENTIFICADOR',
    'DATAINICIO',
    'DATACONCLUSAO',
    'PRIORIDADE',
    'ORDEM',
    'DETALHAMENTO',
];

/**
 * Mapeia registro Espaider para EntregaMapeada
 */
export function mapearEntrega(registro: RegistroEspaider): EntregaMapeada {
    const campos = registro.ListaCampos;

    return {
        id_espaider: registro.IDEspaider,
        projeto_id_espaider: parseInt(getCampoValor(campos, 'IDREGISTROPAI') || '0', 10),
        titulo: getCampoValor(campos, 'ENTREGA'),
        status: getCampoValor(campos, 'PRIORIDADE') || 'Pendente',
        data_prevista: parseData(getCampoValor(campos, 'DATAINICIO')),
        data_realizada: parseData(getCampoValor(campos, 'DATACONCLUSAO')),
        extras: getExtras(campos, CAMPOS_ENTREGA),
    };
}

/**
 * Campos mapeados para Cronogramas (nomes reais da API Espaider)
 * @see src/integrations/espaider/references/response - Cronogramas de Projetos.json
 */
const CAMPOS_CRONOGRAMA = [
    'IDREGISTROPAI',
    'ATIVIDADE',
    'RESPONSAVEL',
    'DATAINICIO',
    'DATACONCLUSAO',
    'DATAPRAZO',
    'STATUS',
    'FASEATIVIDADE',
    'ITEM',
    'IDENTIFICADOR',
];

/**
 * Mapeia registro Espaider para CronogramaMapeado
 */
export function mapearCronograma(registro: RegistroEspaider): CronogramaMapeado {
    const campos = registro.ListaCampos;

    return {
        id_espaider: registro.IDEspaider,
        projeto_id_espaider: parseInt(getCampoValor(campos, 'IDREGISTROPAI') || '0', 10),
        atividade: getCampoValor(campos, 'ATIVIDADE') || getCampoValor(campos, 'FASEATIVIDADE'),
        responsavel: getCampoValor(campos, 'RESPONSAVEL'),
        data_inicio: parseData(getCampoValor(campos, 'DATAINICIO')),
        data_fim: parseData(getCampoValor(campos, 'DATACONCLUSAO') || getCampoValor(campos, 'DATAPRAZO')),
        status: getCampoValor(campos, 'STATUS') || 'Pendente',
        extras: getExtras(campos, CAMPOS_CRONOGRAMA),
    };
}

/**
 * Campos mapeados para Requisitos (nomes reais da API Espaider)
 * @see src/integrations/espaider/references/response - Requisitos de Projetos.json
 */
const CAMPOS_REQUISITO = [
    'IDREGISTROPAI',
    'IDENTIFICADOR',
    'REQUISITO',
    'STATUSREQUISITO',
    'PRIORIDADE',
    'ORIGEMREQUISITO',
    'IMPACTO',
    'IDENTIFICADOR_ENTREGA',
    'ENTREGA',
    'DETALHAMENTOREQUISITO',
    'DATACONCLUSAO',
];

/**
 * Mapeia registro Espaider para RequisitoMapeado
 */
export function mapearRequisito(registro: RegistroEspaider): RequisitoMapeado {
    const campos = registro.ListaCampos;

    return {
        id_espaider: registro.IDEspaider,
        projeto_id_espaider: parseInt(getCampoValor(campos, 'IDREGISTROPAI') || '0', 10),
        codigo: getCampoValor(campos, 'IDENTIFICADOR'),
        descricao: getCampoValor(campos, 'REQUISITO'),
        tipo: getCampoValor(campos, 'ORIGEMREQUISITO'),
        prioridade: getCampoValor(campos, 'PRIORIDADE'),
        status: getCampoValor(campos, 'STATUSREQUISITO') || 'Aberto',
        extras: getExtras(campos, CAMPOS_REQUISITO),
    };
}

/**
 * Mapeia lista de registros baseado no dataset
 */
export function mapearRegistros<T>(
    registros: RegistroEspaider[],
    mapper: (registro: RegistroEspaider) => T
): T[] {
    return registros.map(mapper);
}
