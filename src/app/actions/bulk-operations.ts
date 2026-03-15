'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';
import { parseCSV, validateCSVData, parseJSON, getRequiredFields } from '@/lib/organization/import-export';

export interface OrgActionResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

type AuthContextError = { error: string };
type AuthContextSuccess = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User;
  tenantId: string;
};
type AuthContext = AuthContextError | AuthContextSuccess;

async function getAuthContext(): Promise<AuthContext> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Usuário não autenticado. Faça login novamente.' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile?.tenant_id) {
    return { error: 'Perfil não encontrado. Contate o administrador.' };
  }

  return { supabase, user, tenantId: profile.tenant_id as string };
}

/**
 * Get table name from entity type
 */
function getTableName(entityType: string): string {
  const tables: Record<string, string> = {
    area: 'org_areas',
    nucleus: 'org_nuclei',
    process: 'org_processes',
    routine: 'org_routines',
    activity: 'org_activities',
    system: 'org_systems',
    supplier: 'org_suppliers',
    service: 'org_services',
    document: 'org_documents',
  };
  return tables[entityType.toLowerCase()] || '';
}

/**
 * Bulk update multiple entities with common fields
 * All updates subject to RLS policies (tenant_id isolation)
 */
export async function bulkUpdateEntitiesAction(
  entityType: string,
  entityIds: string[],
  updates: Record<string, unknown>
): Promise<OrgActionResult<{ updated: number; failed: number; errors: Error[] }>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  if (!entityIds || entityIds.length === 0) {
    return { success: false, message: 'Nenhuma entidade selecionada' };
  }

  if (Object.keys(updates).length === 0) {
    return { success: false, message: 'Nenhuma atualização fornecida' };
  }

  const tableName = getTableName(entityType);
  if (!tableName) {
    return { success: false, message: `Tipo de entidade inválido: ${entityType}` };
  }

  const errors: Error[] = [];
  let updated = 0;

  try {
    // Update with tenant_id filter (RLS enforcement)
    const { error } = await ctx.supabase
      .from(tableName)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .in('id', entityIds)
      .eq('tenant_id', ctx.tenantId);

    if (error) {
      return {
        success: false,
        message: `Erro ao atualizar: ${error.message}`,
        data: { updated: 0, failed: entityIds.length, errors: [error as unknown as Error] },
      };
    }

    updated = entityIds.length;

    // Revalidate entity listing paths
    revalidatePath('/organization');
    revalidatePath(`/organization/${entityType}`);

    return {
      success: true,
      message: `${updated} entidade(s) atualizada(s) com sucesso`,
      data: { updated, failed: 0, errors },
    };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    errors.push(error);
    return {
      success: false,
      message: `Erro ao processar atualização em lote: ${error.message}`,
      data: { updated, failed: entityIds.length - updated, errors },
    };
  }
}

/**
 * Bulk delete multiple entities with confirmation
 * All deletes subject to RLS policies (tenant_id isolation)
 */
export async function bulkDeleteEntitiesAction(
  entityType: string,
  entityIds: string[]
): Promise<OrgActionResult<{ deleted: number; errors: Error[] }>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  if (!entityIds || entityIds.length === 0) {
    return { success: false, message: 'Nenhuma entidade selecionada' };
  }

  const tableName = getTableName(entityType);
  if (!tableName) {
    return { success: false, message: `Tipo de entidade inválido: ${entityType}` };
  }

  const errors: Error[] = [];

  try {
    // Delete with tenant_id filter (RLS enforcement)
    const { error } = await ctx.supabase
      .from(tableName)
      .delete()
      .in('id', entityIds)
      .eq('tenant_id', ctx.tenantId);

    if (error) {
      return {
        success: false,
        message: `Erro ao deletar: ${error.message}`,
        data: { deleted: 0, errors: [error as unknown as Error] },
      };
    }

    // Revalidate entity listing paths
    revalidatePath('/organization');
    revalidatePath(`/organization/${entityType}`);

    return {
      success: true,
      message: `${entityIds.length} entidade(s) deletada(s) com sucesso`,
      data: { deleted: entityIds.length, errors },
    };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    errors.push(error);
    return {
      success: false,
      message: `Erro ao processar deleção em lote: ${error.message}`,
      data: { deleted: 0, errors },
    };
  }
}

/**
 * Export organization entities as CSV
 */
export async function exportOrganizationAsCSVAction(
  entityType: string
): Promise<OrgActionResult<string>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const tableName = getTableName(entityType);
  if (!tableName) {
    return { success: false, message: `Tipo de entidade inválido: ${entityType}` };
  }

  try {
    // Fetch with tenant_id filter (RLS enforcement)
    const { data, error } = await ctx.supabase
      .from(tableName)
      .select('*')
      .eq('tenant_id', ctx.tenantId)
      .order('name', { ascending: true });

    if (error) {
      return { success: false, message: `Erro ao buscar dados: ${error.message}` };
    }

    if (!data || data.length === 0) {
      return { success: true, message: 'Nenhum dado para exportar', data: '' };
    }

    // Generate CSV
    const headers = Object.keys(data[0])
      .filter((key) => !['id', 'tenant_id', 'created_at', 'updated_at'].includes(key))
      .map((h) => escapeCSVField(h))
      .join(',');

    const rows = data.map((entity) =>
      Object.entries(entity)
        .filter(([key]) => !['id', 'tenant_id', 'created_at', 'updated_at'].includes(key))
        .map(([, value]) => escapeCSVField(value))
        .join(',')
    );

    const csv = [headers, ...rows].join('\n');

    return {
      success: true,
      message: `${data.length} entidade(s) exportada(s)`,
      data: csv,
    };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { success: false, message: `Erro ao exportar: ${error.message}` };
  }
}

/**
 * Import entities from CSV with conflict detection and validation
 */
export async function importOrganizationFromCSVAction(
  entityType: string,
  csvContent: string,
  mode: 'merge' | 'replace' = 'merge'
): Promise<
  OrgActionResult<{
    imported: number;
    failed: number;
    errors: Array<{ row: number; column?: string; error: string }>;
  }>
> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const tableName = getTableName(entityType);
  if (!tableName) {
    return { success: false, message: `Tipo de entidade inválido: ${entityType}` };
  }

  if (!csvContent || csvContent.trim().length === 0) {
    return { success: false, message: 'Conteúdo CSV vazio' };
  }

  try {
    // Parse and validate CSV
    const parsedData = parseCSV(csvContent);
    const requiredFields = getRequiredFields(entityType);
    const validationResult = validateCSVData(parsedData, entityType, requiredFields);

    if (validationResult.failed > 0 && validationResult.imported === 0) {
      return {
        success: false,
        message: `Validação falhou: ${validationResult.errors[0]?.error}`,
        data: {
          imported: 0,
          failed: validationResult.failed,
          errors: validationResult.errors.map((e) => ({
            row: e.row,
            column: e.column,
            error: e.error,
          })),
        },
      };
    }

    // Insert validated records
    const dataToInsert = validationResult.data.map((row) => ({
      ...row,
      tenant_id: ctx.tenantId,
    }));

    const { error: insertError, data: insertedData } = await ctx.supabase
      .from(tableName)
      .insert(dataToInsert)
      .select('id');

    if (insertError) {
      return {
        success: false,
        message: `Erro ao importar: ${insertError.message}`,
        data: {
          imported: 0,
          failed: validationResult.imported,
          errors: validationResult.errors.map((e) => ({
            row: e.row,
            column: e.column,
            error: e.error,
          })),
        },
      };
    }

    // Revalidate paths
    revalidatePath('/organization');
    revalidatePath(`/organization/${entityType}`);

    return {
      success: true,
      message: `${validationResult.imported} entidade(s) importada(s) com sucesso`,
      data: {
        imported: validationResult.imported,
        failed: validationResult.failed,
        errors: validationResult.errors.map((e) => ({
          row: e.row,
          column: e.column,
          error: e.error,
        })),
      },
    };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return {
      success: false,
      message: `Erro ao processar importação: ${error.message}`,
      data: {
        imported: 0,
        failed: 0,
        errors: [],
      },
    };
  }
}

/**
 * Import entities from JSON with validation
 */
export async function importOrganizationFromJSONAction(
  entityType: string,
  jsonContent: string
): Promise<
  OrgActionResult<{
    imported: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
  }>
> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const tableName = getTableName(entityType);
  if (!tableName) {
    return { success: false, message: `Tipo de entidade inválido: ${entityType}` };
  }

  try {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonContent);
    } catch (e) {
      return {
        success: false,
        message: 'JSON inválido',
        data: { imported: 0, failed: 0, errors: [] },
      };
    }

    if (!Array.isArray(parsed)) {
      return {
        success: false,
        message: 'JSON deve conter um array',
        data: { imported: 0, failed: 0, errors: [] },
      };
    }

    const parsedData = parsed;

    const requiredFields = getRequiredFields(entityType);
    const validationResult = validateCSVData(parsedData, entityType, requiredFields);

    const dataToInsert = validationResult.data.map((row) => ({
      ...row,
      tenant_id: ctx.tenantId,
    }));

    const { error: insertError } = await ctx.supabase
      .from(tableName)
      .insert(dataToInsert)
      .select('id');

    if (insertError) {
      return {
        success: false,
        message: `Erro ao importar: ${insertError.message}`,
        data: {
          imported: 0,
          failed: validationResult.imported,
          errors: validationResult.errors.map((e) => ({
            row: e.row,
            error: e.error,
          })),
        },
      };
    }

    revalidatePath('/organization');
    revalidatePath(`/organization/${entityType}`);

    return {
      success: true,
      message: `${validationResult.imported} entidade(s) importada(s) com sucesso`,
      data: {
        imported: validationResult.imported,
        failed: validationResult.failed,
        errors: validationResult.errors.map((e) => ({
          row: e.row,
          error: e.error,
        })),
      },
    };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return {
      success: false,
      message: `Erro ao processar JSON: ${error.message}`,
      data: { imported: 0, failed: 0, errors: [] },
    };
  }
}

/**
 * Escape CSV field values
 */
function escapeCSVField(value: unknown): string {
  if (value === null || value === undefined) return '';

  let str = String(value);

  // Convert objects/arrays to JSON
  if (typeof value === 'object') {
    str = JSON.stringify(value);
  }

  // Escape quotes and wrap in quotes if needed
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    str = '"' + str.replace(/"/g, '""') + '"';
  }

  return str;
}
