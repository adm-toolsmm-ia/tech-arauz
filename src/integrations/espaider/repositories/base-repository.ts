/**
 * Base repository implementation with common upsert logic
 * @see Story 15.5 - Repository Implementation
 */

import { createClient } from '@supabase/supabase-js';
import type { IRepository } from './types';

/**
 * Abstract base class for all repository implementations
 * Provides common upsert logic via Supabase
 */
export abstract class BaseRepository<T> implements IRepository<T> {
  protected tableName: string;
  protected supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Template method: subclasses define how to map domain object to DB row
   */
  protected abstract toDatabaseRow(item: T, tenantId: string): Record<string, any>;

  /**
   * Template method: subclasses define how to map DB row back to domain object
   */
  protected abstract toDomainObject(row: Record<string, any>): T;

  /**
   * Upsert implementation using Supabase upsert with conflict strategy
   * Handles batch upserts with (tenant_id, espaider_id) conflict resolution
   */
  async upsert(items: T[], tenantId: string): Promise<{ created: number; updated: number; errors: number }> {
    if (items.length === 0) {
      return { created: 0, updated: 0, errors: 0 };
    }

    const rows = items.map((item) => this.toDatabaseRow(item, tenantId));

    const { data, error } = await this.supabase
      .from(this.tableName)
      .upsert(rows, {
        onConflict: 'tenant_id,espaider_id',
        ignoreDuplicates: false,
      })
      .select('id,created_at,updated_at');

    if (error) {
      console.error(`Upsert error in ${this.tableName}:`, error);
      return { created: 0, updated: 0, errors: items.length };
    }

    // Count: assume first insert has created_at === updated_at, others are updates
    // This is a heuristic — better to track via trigger
    const created = data?.filter((row) => row.created_at === row.updated_at).length || 0;
    const updated = (data?.length || 0) - created;

    return { created, updated, errors: 0 };
  }

  /**
   * Find single item by Espaider ID
   */
  async findByEspaiderId(espaiderId: number, tenantId: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('espaider_id', espaiderId)
      .maybeSingle();

    if (error) {
      console.error(`Error finding by espaider_id in ${this.tableName}:`, error);
      return null;
    }

    return data ? this.toDomainObject(data) : null;
  }

  /**
   * Find all items for tenant
   */
  async findAll(tenantId: string): Promise<T[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('tenant_id', tenantId);

    if (error) {
      console.error(`Error finding all in ${this.tableName}:`, error);
      return [];
    }

    return (data || []).map((row) => this.toDomainObject(row));
  }

  /**
   * Helper: find with custom where clause
   */
  protected async findWhere(
    tenantId: string,
    column: string,
    operator: 'eq' | 'in' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like',
    value: any,
  ): Promise<T[]> {
    let query = this.supabase.from(this.tableName).select('*').eq('tenant_id', tenantId);

    switch (operator) {
      case 'eq':
        query = query.eq(column, value);
        break;
      case 'in':
        query = query.in(column, value);
        break;
      case 'neq':
        query = query.neq(column, value);
        break;
      case 'gt':
        query = query.gt(column, value);
        break;
      case 'gte':
        query = query.gte(column, value);
        break;
      case 'lt':
        query = query.lt(column, value);
        break;
      case 'lte':
        query = query.lte(column, value);
        break;
      case 'like':
        query = query.ilike(column, value);
        break;
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Error in findWhere on ${this.tableName}:`, error);
      return [];
    }

    return (data || []).map((row) => this.toDomainObject(row));
  }
}
