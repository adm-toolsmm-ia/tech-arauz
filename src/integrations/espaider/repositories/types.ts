/**
 * Repository pattern interfaces for Espaider data persistence
 * Enables abstraction over data source (Supabase, etc)
 * @see Story 15.4 - IRepository Interface DDD
 */

/**
 * Generic repository interface for type-safe data operations
 * All specific repositories extend this with dataset-specific methods
 */
export interface IRepository<T> {
  /**
   * Upsert (insert or update) multiple items
   * Uses conflict on (tenant_id, espaider_id) to handle updates
   * @param items - Array of items to upsert
   * @param tenantId - Tenant context for RLS
   * @returns Object with counts: { created, updated, errors }
   */
  upsert(
    items: T[],
    tenantId: string,
  ): Promise<{ created: number; updated: number; errors: number }>;

  /**
   * Find item by Espaider ID
   * @param espaiderId - ID from Espaider API (IDEspaider field)
   * @param tenantId - Tenant context for RLS
   * @returns Item or null if not found
   */
  findByEspaiderId(espaiderId: number, tenantId: string): Promise<T | null>;

  /**
   * Find all items for tenant
   * @param tenantId - Tenant context for RLS
   * @returns Array of all items for tenant
   */
  findAll(tenantId: string): Promise<T[]>;
}

/**
 * Repository for Projetos dataset
 */
export interface IProjetoRepository extends IRepository<any> {
  findByCodeAndTenant(codigo: string, tenantId: string): Promise<any | null>;
  findByStatus(status: string, tenantId: string): Promise<any[]>;
}

/**
 * Repository for Entregas (Deliveries) dataset
 */
export interface IEntregaRepository extends IRepository<any> {
  findByProjetoId(projetoEspaiderId: number, tenantId: string): Promise<any[]>;
  findByStatus(status: string, tenantId: string): Promise<any[]>;
}

/**
 * Repository for Cronogramas (Schedules) dataset
 */
export interface ICronogramaRepository extends IRepository<any> {
  findByProjetoId(projetoEspaiderId: number, tenantId: string): Promise<any[]>;
  findByResponsavel(responsavel: string, tenantId: string): Promise<any[]>;
}

/**
 * Repository for Requisitos (Requirements) dataset
 */
export interface IRequisitoRepository extends IRepository<any> {
  findByProjetoId(projetoEspaiderId: number, tenantId: string): Promise<any[]>;
  findByStatus(status: string, tenantId: string): Promise<any[]>;
}

/**
 * Repository for Historicos (History) dataset
 */
export interface IHistoricoRepository extends IRepository<any> {
  findByProjetoId(projetoEspaiderId: number, tenantId: string): Promise<any[]>;
  findByTipo(tipo: string, tenantId: string): Promise<any[]>;
}

/**
 * Repository for Orcamentos (Budgets) dataset
 */
export interface IOrcamentoRepository extends IRepository<any> {
  findByProjetoId(projetoEspaiderId: number, tenantId: string): Promise<any[]>;
  findByFornecedor(fornecedor: string, tenantId: string): Promise<any[]>;
}

/**
 * Repository for Aprovadores (Approvers) dataset
 */
export interface IAprovadorRepository extends IRepository<any> {
  findByProjetoId(projetoEspaiderId: number, tenantId: string): Promise<any[]>;
  findByResponsavel(responsavel: string, tenantId: string): Promise<any[]>;
}

/**
 * Repository for TempoPermanencia dataset
 */
export interface ITempoPermanenciaRepository extends IRepository<any> {
  findByProjetoId(projetoEspaiderId: number, tenantId: string): Promise<any[]>;
  findByFase(fase: string, tenantId: string): Promise<any[]>;
}

/**
 * Repository for HorasLancadas dataset
 */
export interface IHorasLancadasRepository extends IRepository<any> {
  findByProjetoId(projetoEspaiderId: number, tenantId: string): Promise<any[]>;
  findByProfissional(profissional: string, tenantId: string): Promise<any[]>;
}

/**
 * Collection of all repositories for dependency injection
 */
export interface IRepositories {
  projeto: IProjetoRepository;
  entrega: IEntregaRepository;
  cronograma: ICronogramaRepository;
  requisito: IRequisitoRepository;
  historico: IHistoricoRepository;
  orcamento: IOrcamentoRepository;
  aprovador: IAprovadorRepository;
  tempoPermanencia: ITempoPermanenciaRepository;
  horasLancadas: IHorasLancadasRepository;
}
