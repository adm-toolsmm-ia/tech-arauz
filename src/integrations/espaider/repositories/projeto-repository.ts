/**
 * Projeto Repository Implementation
 * Handles persistence for Projetos (Projects) dataset
 * @see Story 15.5 - Repository Implementation
 */

import type { ProjetoMapeado } from '../types';
import { BaseRepository } from './base-repository';
import type { IProjetoRepository } from './types';

export class ProjetoRepository extends BaseRepository<ProjetoMapeado> implements IProjetoRepository {
  constructor() {
    super('espaider_projetos');
  }

  protected toDatabaseRow(item: ProjetoMapeado, tenantId: string): Record<string, any> {
    return {
      tenant_id: tenantId,
      espaider_id: item.id_espaider,
      codigo: item.codigo,
      titulo: item.titulo,
      status: item.status,
      responsavel: item.responsavel,
      prioridade: item.prioridade,
      prazo_final: item.prazo_final,
      updated_at: item.updated_at,
      categoria: item.categoria,
      situacao_atual: item.situacao_atual,
      status_field: item.status_field,
      fase_atual: item.fase_atual,
      prazo_fase: item.prazo_fase,
      cronograma_atual: item.cronograma_atual,
      prazo_cronograma: item.prazo_cronograma,
      area: item.area,
      pasta_consultivo: item.pasta_consultivo,
      solucao_aplicada: item.solucao_aplicada,
      data_movimentacao: item.data_movimentacao,
      data_encerramento: item.data_encerramento,
      data_inicio_aprovacao: item.data_inicio_aprovacao,
      trm_espaider: item.trm_espaider,
      tipo_chamado: item.tipo_chamado,
      tipo_assunto: item.tipo_assunto,
      solicitante: item.solicitante,
      objetivo: item.objetivo,
      motivo_importancia_especial: item.motivo_importancia_especial,
      mensagem_movimentacao: item.mensagem_movimentacao,
      justificativa: item.justificativa,
      importancia_especial: item.importancia_especial,
      impacto_operacional: item.impacto_operacional,
      impacto_estrategico: item.impacto_estrategico,
      escopo: item.escopo,
      complexidade_tecnica: item.complexidade_tecnica,
      extras: item.extras || {},
    };
  }

  protected toDomainObject(row: Record<string, any>): ProjetoMapeado {
    return {
      id_espaider: row.espaider_id,
      codigo: row.codigo,
      titulo: row.titulo,
      status: row.status,
      responsavel: row.responsavel,
      prioridade: row.prioridade,
      prazo_final: row.prazo_final ? new Date(row.prazo_final) : null,
      updated_at: row.updated_at ? new Date(row.updated_at) : null,
      categoria: row.categoria,
      situacao_atual: row.situacao_atual,
      status_field: row.status_field,
      fase_atual: row.fase_atual,
      prazo_fase: row.prazo_fase ? new Date(row.prazo_fase) : null,
      cronograma_atual: row.cronograma_atual,
      prazo_cronograma: row.prazo_cronograma ? new Date(row.prazo_cronograma) : null,
      area: row.area,
      pasta_consultivo: row.pasta_consultivo,
      solucao_aplicada: row.solucao_aplicada,
      data_movimentacao: row.data_movimentacao ? new Date(row.data_movimentacao) : null,
      data_encerramento: row.data_encerramento ? new Date(row.data_encerramento) : null,
      data_inicio_aprovacao: row.data_inicio_aprovacao ? new Date(row.data_inicio_aprovacao) : null,
      trm_espaider: row.trm_espaider,
      tipo_chamado: row.tipo_chamado,
      tipo_assunto: row.tipo_assunto,
      solicitante: row.solicitante,
      objetivo: row.objetivo,
      motivo_importancia_especial: row.motivo_importancia_especial,
      mensagem_movimentacao: row.mensagem_movimentacao,
      justificativa: row.justificativa,
      importancia_especial: row.importancia_especial,
      impacto_operacional: row.impacto_operacional,
      impacto_estrategico: row.impacto_estrategico,
      escopo: row.escopo,
      complexidade_tecnica: row.complexidade_tecnica,
      extras: row.extras || {},
    };
  }

  async findByCodeAndTenant(codigo: string, tenantId: string): Promise<ProjetoMapeado | null> {
    const results = await this.findWhere(tenantId, 'codigo', 'eq', codigo);
    return results[0] || null;
  }

  async findByStatus(status: string, tenantId: string): Promise<ProjetoMapeado[]> {
    return this.findWhere(tenantId, 'status', 'eq', status);
  }
}
