'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface TenantInfo {
  id: string;
  slug: string;
  name: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Tenant360Counts {
  areas: number;
  processes: number;
  systems: number;
  suppliers: number;
  services: number;
  documents: number;
}

export interface Tenant360Result {
  tenant: TenantInfo | null;
  counts: Tenant360Counts;
  error?: string;
}

async function getAuthContext(): Promise<
  | { error: string }
  | { supabase: Awaited<ReturnType<typeof createClient>>; tenantId: string }
> {
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

  return { supabase, tenantId: profile.tenant_id as string };
}

export async function getTenant360Action(): Promise<Tenant360Result> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { tenant: null, counts: { areas: 0, processes: 0, systems: 0, suppliers: 0, services: 0, documents: 0 }, error: ctx.error };

  const { supabase, tenantId } = ctx;

  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id, slug, name, settings, created_at, updated_at')
    .eq('id', tenantId)
    .single();

  if (tenantError || !tenant) {
    return {
      tenant: null,
      counts: { areas: 0, processes: 0, systems: 0, suppliers: 0, services: 0, documents: 0 },
      error: tenantError?.message ?? 'Tenant não encontrado.',
    };
  }

  const [areasRes, processesRes, systemsRes, suppliersRes, servicesRes, documentsRes] =
    await Promise.all([
      supabase.from('org_areas').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabase.from('org_processes').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabase.from('org_systems').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabase.from('org_suppliers').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabase.from('org_services').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabase.from('org_documents').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    ]);

  const counts: Tenant360Counts = {
    areas: areasRes.count ?? 0,
    processes: processesRes.count ?? 0,
    systems: systemsRes.count ?? 0,
    suppliers: suppliersRes.count ?? 0,
    services: servicesRes.count ?? 0,
    documents: documentsRes.count ?? 0,
  };

  return {
    tenant: tenant as TenantInfo,
    counts,
  };
}

export interface UpdateTenantPayload {
  name?: string;
  settings?: Record<string, unknown>;
}

export async function updateTenantAction(
  id: string,
  payload: UpdateTenantPayload,
): Promise<{ success: boolean; message: string; data?: TenantInfo }> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  if (ctx.tenantId !== id) {
    return { success: false, message: 'Sem permissão para atualizar este tenant.' };
  }

  const { data: authData } = await ctx.supabase.auth.getUser();
  const { data: profile } = await ctx.supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user?.id)
    .single();

  if (profile?.role !== 'admin') {
    return { success: false, message: 'Apenas administradores podem editar a empresa.' };
  }

  const { data, error } = await ctx.supabase
    .from('tenants')
    .update({
      ...(payload.name !== undefined && { name: payload.name }),
      ...(payload.settings !== undefined && { settings: payload.settings }),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return { success: false, message: `Erro ao atualizar: ${error.message}` };

  revalidatePath('/organizacao/empresa');
  revalidatePath('/organizacao');
  return { success: true, message: 'Empresa atualizada!', data: data as TenantInfo };
}
