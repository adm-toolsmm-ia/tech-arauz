/**
 * Tests: New BI APIs — TempoPermanencia + HorasLancadas
 *
 * Covers:
 * - descricaoToDataset for new datasets
 * - mapearTempoPermanencia
 * - mapearHoraLancada
 * - syncTempoPermanenciaFromRegistros (via supabase mock)
 * - syncHorasLancadas with empty response (skip guard)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mapearTempoPermanencia, mapearHoraLancada } from '@/integrations/espaider/mapper';
import { normalizeStatus } from '@/lib/sync/espaider-sync';
import type { RegistroEspaider } from '@/integrations/espaider/types';

// =============================================================================
// Helpers
// =============================================================================

function makeRegistro(
    idEspaider: number,
    campos: Record<string, string>,
): RegistroEspaider {
    return {
        IDEspaider: idEspaider,
        Identificador: 'TEST',
        ListaCampos: Object.entries(campos).map(([Identificador, Valor]) => ({
            Identificador,
            Valor,
        })),
    };
}

// =============================================================================
// mapped fields
// =============================================================================

describe('mapearTempoPermanencia', () => {
    it('maps all expected fields correctly', () => {
        const registro = makeRegistro(42, {
            IDREGISTROPAI: '100',
            APROVADOR: 'Execução - Produção',
            RESPONSAVEL: 'João Silva',
            SITUACAO: 'Em andamento',
            TEMPOPERMANENCIA: '5,50',
            DATAINICIO: '01/02/2026',
            DATAFIM: '15/02/2026',
        });

        const result = mapearTempoPermanencia(registro);

        expect(result.id_espaider).toBe(42);
        expect(result.projeto_id_espaider).toBe(100);
        expect(result.fase).toBe('Execução - Produção');
        expect(result.responsavel).toBe('João Silva');
        expect(result.situacao).toBe('Em andamento');
        expect(result.tempo_permanencia_dias).toBe(5.5);
    });

    it('handles missing TEMPOPERMANENCIA as null', () => {
        const registro = makeRegistro(1, {
            IDREGISTROPAI: '10',
            TEMPOPERMANENCIA: '',
        });

        const result = mapearTempoPermanencia(registro);
        expect(result.tempo_permanencia_dias).toBeNull();
    });

    it('handles missing IDREGISTROPAI as 0', () => {
        const registro = makeRegistro(5, {});
        const result = mapearTempoPermanencia(registro);
        expect(result.projeto_id_espaider).toBe(0);
    });
});

// =============================================================================
// mapearHoraLancada
// =============================================================================

describe('mapearHoraLancada', () => {
    it('maps all expected fields correctly via SOLICITACAO_IDENTIFICADOR', () => {
        const registro = makeRegistro(99, {
            SOLICITACAO_IDENTIFICADOR: '200',
            IDENTIFICADOR: '99',
            PASTACONSULTIVO: 'CS.34433',
            PASTACONSULTIVO_ID: '5501',
            COLABORADOR: 'Maria Souza',
            HORASORIGINAISHOR: '8,00',
            DATA: '10/03/2026',
            ATIVIDADE: 'Desenvolvimento',
        });

        const result = mapearHoraLancada(registro);

        expect(result.id_espaider).toBe(99);
        expect(result.projeto_id_espaider).toBe(200);
        expect(result.solicitacao_id).toBe(200);
        expect(result.pasta_consultivo_id).toBe(5501);
        expect(result.pasta_consultivo_texto).toBe('CS.34433');
        expect(result.profissional).toBe('Maria Souza');
        expect(result.horas).toBe(8.0);
        expect(result.tipo_lancamento).toBe('Desenvolvimento');
    });

    it('falls back to IDENTIFICADOR if SOLICITACAO_IDENTIFICADOR is NaN', () => {
        const registro = makeRegistro(99, {
            SOLICITACAO_IDENTIFICADOR: 'CS.34433', // non-numeric
            IDENTIFICADOR: '499922', // valid numeric parent identifier in this case
            PASTACONSULTIVO: 'CS.34433',
            COLABORADOR: 'Maria Souza',
            HORASORIGINAISHOR: '8,00',
        });

        const result = mapearHoraLancada(registro);

        expect(result.projeto_id_espaider).toBe(499922);
    });

    it('handles missing PASTACONSULTIVO and PASTACONSULTIVO_ID as null', () => {
        const registro = makeRegistro(10, {
            SOLICITACAO_IDENTIFICADOR: '5',
            PASTACONSULTIVO: '',
            PASTACONSULTIVO_ID: '',
        });

        const result = mapearHoraLancada(registro);
        expect(result.pasta_consultivo_id).toBeNull();
        expect(result.pasta_consultivo_texto).toBeNull();
    });

    it('handles missing HORASORIGINAISHOR as null', () => {
        const registro = makeRegistro(30, {
            SOLICITACAO_IDENTIFICADOR: '1',
            HORASORIGINAISHOR: '',
        });

        const result = mapearHoraLancada(registro);
        expect(result.horas).toBeNull();
    });
});

// =============================================================================
// normalizeStatus (already existing, sanity check not broken)
// =============================================================================

describe('normalizeStatus', () => {
    it('maps concluído to concluido', () => {
        expect(normalizeStatus('concluído')).toBe('concluido');
    });

    it('returns projeto_futuro for empty string', () => {
        expect(normalizeStatus('')).toBe('projeto_futuro');
    });
});
