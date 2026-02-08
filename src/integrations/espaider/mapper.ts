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
    return campo?.Valor ?? '';
}

/**
 * Converte string de data do Espaider para Date
 * Suporta formatos: DD/MM/YYYY, YYYY-MM-DD, ISO
 */
function parseData(valor: string): Date | null {
    if (!valor || valor.trim() === '') {
        return null;
    }

    // Tenta formato DD/MM/YYYY
    const brMatch = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
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
            extras[campo.Identificador] = campo.Valor;
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
 * Campos mapeados para Entregas
 */
const CAMPOS_ENTREGA = [
    'NOME',
    'STATUS',
    'DATAPREVISTA',
    'DATAREALIZADA',
    'PROJETOID',
];

/**
 * Mapeia registro Espaider para EntregaMapeada
 */
export function mapearEntrega(registro: RegistroEspaider): EntregaMapeada {
    const campos = registro.ListaCampos;

    return {
        id_espaider: registro.IDEspaider,
        projeto_id_espaider: parseInt(getCampoValor(campos, 'PROJETOID') || '0', 10),
        titulo: getCampoValor(campos, 'NOME'),
        status: getCampoValor(campos, 'STATUS'),
        data_prevista: parseData(getCampoValor(campos, 'DATAPREVISTA')),
        data_realizada: parseData(getCampoValor(campos, 'DATAREALIZADA')),
        extras: getExtras(campos, CAMPOS_ENTREGA),
    };
}

/**
 * Campos mapeados para Cronogramas
 */
const CAMPOS_CRONOGRAMA = [
    'ATIVIDADE',
    'RESPONSAVEL',
    'DATAINICIO',
    'DATAFIM',
    'STATUS',
    'PROJETOID',
];

/**
 * Mapeia registro Espaider para CronogramaMapeado
 */
export function mapearCronograma(registro: RegistroEspaider): CronogramaMapeado {
    const campos = registro.ListaCampos;

    return {
        id_espaider: registro.IDEspaider,
        projeto_id_espaider: parseInt(getCampoValor(campos, 'PROJETOID') || '0', 10),
        atividade: getCampoValor(campos, 'ATIVIDADE'),
        responsavel: getCampoValor(campos, 'RESPONSAVEL'),
        data_inicio: parseData(getCampoValor(campos, 'DATAINICIO')),
        data_fim: parseData(getCampoValor(campos, 'DATAFIM')),
        status: getCampoValor(campos, 'STATUS'),
        extras: getExtras(campos, CAMPOS_CRONOGRAMA),
    };
}

/**
 * Campos mapeados para Requisitos
 */
const CAMPOS_REQUISITO = [
    'CODIGO',
    'DESCRICAO',
    'TIPO',
    'PRIORIDADE',
    'STATUS',
    'PROJETOID',
];

/**
 * Mapeia registro Espaider para RequisitoMapeado
 */
export function mapearRequisito(registro: RegistroEspaider): RequisitoMapeado {
    const campos = registro.ListaCampos;

    return {
        id_espaider: registro.IDEspaider,
        projeto_id_espaider: parseInt(getCampoValor(campos, 'PROJETOID') || '0', 10),
        codigo: getCampoValor(campos, 'CODIGO'),
        descricao: getCampoValor(campos, 'DESCRICAO'),
        tipo: getCampoValor(campos, 'TIPO'),
        prioridade: getCampoValor(campos, 'PRIORIDADE'),
        status: getCampoValor(campos, 'STATUS'),
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
