'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';
import type {
  OrgArea,
  OrgNucleus,
  OrgProcess,
  OrgRoutine,
  OrgActivity,
  OrgSystem,
  OrgSystemResource,
  OrgSupplier,
  OrgService,
  OrgDocument,
} from '@/types/organization';
import type { SearchResult, SearchFilters, EntityType } from '@/lib/organization/search';
import { rankSearchMatch, applyFilters, paginateResults } from '@/lib/organization/search';

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

type AreaPayload = Omit<OrgArea, 'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'nuclei_count'>;
type NucleusPayload = Omit<OrgNucleus, 'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'area'>;
type ProcessPayload = Omit<
  OrgProcess,
  'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'area' | 'nucleus'
>;
type RoutinePayload = Omit<
  OrgRoutine,
  'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'process'
>;
type ActivityPayload = Omit<
  OrgActivity,
  'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'routine'
>;
type SystemPayload = Omit<OrgSystem, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>;
type SystemResourcePayload = Omit<
  OrgSystemResource,
  'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'system'
>;
type SupplierPayload = Omit<OrgSupplier, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>;
type ServicePayload = Omit<OrgService, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>;
type OrgDocumentPayload = Omit<
  OrgDocument,
  'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'process'
>;

/** Serialize payload for Supabase - arrays/objects passed as-is (Supabase handles JSONB) */
function toDbPayload<T extends Record<string, unknown>>(payload: T): Record<string, unknown> {
  return { ...payload };
}

// --- Areas ---

export async function createAreaAction(payload: AreaPayload): Promise<OrgActionResult<OrgArea>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const data = {
    ...toDbPayload(payload),
    tenant_id: ctx.tenantId,
  };

  const { data: created, error } = await ctx.supabase
    .from('org_areas')
    .insert([data])
    .select()
    .single();

  if (error) return { success: false, message: `Erro ao criar área: ${error.message}` };
  revalidatePath('/organizacao/areas');
  revalidatePath('/organizacao/empresa');
  return { success: true, message: `Área "${created.name}" criada!`, data: created as OrgArea };
}

export async function updateAreaAction(
  id: string,
  updates: Partial<AreaPayload>,
): Promise<OrgActionResult<OrgArea>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data: updated, error } = await ctx.supabase
    .from('org_areas')
    .update(toDbPayload(updates as Record<string, unknown>))
    .eq('id', id)
    .select()
    .single();

  if (error) return { success: false, message: `Erro ao atualizar área: ${error.message}` };
  revalidatePath('/organizacao/areas');
  return { success: true, message: 'Área atualizada!', data: updated as OrgArea };
}

export async function deleteAreaAction(id: string): Promise<OrgActionResult> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data: existing } = await ctx.supabase
    .from('org_areas')
    .select('name')
    .eq('id', id)
    .single();
  const { error } = await ctx.supabase.from('org_areas').delete().eq('id', id);

  if (error) return { success: false, message: `Erro ao excluir área: ${error.message}` };
  revalidatePath('/organizacao/areas');
  return { success: true, message: `Área "${existing?.name ?? 'N/A'}" excluída!` };
}

// --- Nuclei ---

export async function createNucleusAction(
  payload: NucleusPayload,
): Promise<OrgActionResult<OrgNucleus>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const data = {
    ...toDbPayload(payload),
    tenant_id: ctx.tenantId,
  };

  const { data: created, error } = await ctx.supabase
    .from('org_nuclei')
    .insert([data])
    .select()
    .single();

  if (error) return { success: false, message: `Erro ao criar núcleo: ${error.message}` };
  revalidatePath('/organizacao/areas');
  revalidatePath('/organizacao/nucleos');
  revalidatePath('/organizacao/processos');
  revalidatePath('/organizacao/empresa');
  return {
    success: true,
    message: `Núcleo "${created.name}" criado!`,
    data: created as OrgNucleus,
  };
}

export async function updateNucleusAction(
  id: string,
  updates: Partial<NucleusPayload>,
): Promise<OrgActionResult<OrgNucleus>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data: updated, error } = await ctx.supabase
    .from('org_nuclei')
    .update(toDbPayload(updates as Record<string, unknown>))
    .eq('id', id)
    .select()
    .single();

  if (error) return { success: false, message: `Erro ao atualizar núcleo: ${error.message}` };
  revalidatePath('/organizacao/areas');
  revalidatePath('/organizacao/nucleos');
  revalidatePath('/organizacao/processos');
  return { success: true, message: 'Núcleo atualizado!', data: updated as OrgNucleus };
}

export async function deleteNucleusAction(id: string): Promise<OrgActionResult> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data: existing } = await ctx.supabase
    .from('org_nuclei')
    .select('name')
    .eq('id', id)
    .single();
  const { error } = await ctx.supabase.from('org_nuclei').delete().eq('id', id);

  if (error) return { success: false, message: `Erro ao excluir núcleo: ${error.message}` };
  revalidatePath('/organizacao/areas');
  revalidatePath('/organizacao/nucleos');
  revalidatePath('/organizacao/processos');
  return { success: true, message: `Núcleo "${existing?.name ?? 'N/A'}" excluído!` };
}

// --- Processes ---

export async function createProcessAction(
  payload: ProcessPayload,
): Promise<OrgActionResult<OrgProcess>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const data = {
    ...toDbPayload(payload),
    tenant_id: ctx.tenantId,
  };

  const { data: created, error } = await ctx.supabase
    .from('org_processes')
    .insert([data])
    .select()
    .single();

  if (error) return { success: false, message: `Erro ao criar processo: ${error.message}` };
  revalidatePath('/organizacao/processos');
  return {
    success: true,
    message: `Processo "${created.name}" criado!`,
    data: created as OrgProcess,
  };
}

export async function updateProcessAction(
  id: string,
  updates: Partial<ProcessPayload>,
): Promise<OrgActionResult<OrgProcess>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data: updated, error } = await ctx.supabase
    .from('org_processes')
    .update(toDbPayload(updates as Record<string, unknown>))
    .eq('id', id)
    .select()
    .single();

  if (error) return { success: false, message: `Erro ao atualizar processo: ${error.message}` };
  revalidatePath('/organizacao/processos');
  return { success: true, message: 'Processo atualizado!', data: updated as OrgProcess };
}

export async function deleteProcessAction(id: string): Promise<OrgActionResult> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data: existing } = await ctx.supabase
    .from('org_processes')
    .select('name')
    .eq('id', id)
    .single();
  const { error } = await ctx.supabase.from('org_processes').delete().eq('id', id);

  if (error) return { success: false, message: `Erro ao excluir processo: ${error.message}` };
  revalidatePath('/organizacao/processos');
  return { success: true, message: `Processo "${existing?.name ?? 'N/A'}" excluído!` };
}

// --- Routines ---

export async function createRoutineAction(
  payload: RoutinePayload,
): Promise<OrgActionResult<OrgRoutine>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const data = {
    ...toDbPayload(payload),
    tenant_id: ctx.tenantId,
  };

  const { data: created, error } = await ctx.supabase
    .from('org_routines')
    .insert([data])
    .select()
    .single();

  if (error) return { success: false, message: `Erro ao criar rotina: ${error.message}` };
  revalidatePath('/organizacao/processos');
  revalidatePath('/organizacao/rotinas');
  return {
    success: true,
    message: `Rotina "${created.name}" criada!`,
    data: created as OrgRoutine,
  };
}

export async function updateRoutineAction(
  id: string,
  updates: Partial<RoutinePayload>,
): Promise<OrgActionResult<OrgRoutine>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data: updated, error } = await ctx.supabase
    .from('org_routines')
    .update(toDbPayload(updates as Record<string, unknown>))
    .eq('id', id)
    .select()
    .single();

  if (error) return { success: false, message: `Erro ao atualizar rotina: ${error.message}` };
  revalidatePath('/organizacao/processos');
  revalidatePath('/organizacao/rotinas');
  return { success: true, message: 'Rotina atualizada!', data: updated as OrgRoutine };
}

export async function deleteRoutineAction(id: string): Promise<OrgActionResult> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data: existing } = await ctx.supabase
    .from('org_routines')
    .select('name')
    .eq('id', id)
    .single();
  const { error } = await ctx.supabase.from('org_routines').delete().eq('id', id);

  if (error) return { success: false, message: `Erro ao excluir rotina: ${error.message}` };
  revalidatePath('/organizacao/processos');
  revalidatePath('/organizacao/rotinas');
  return { success: true, message: `Rotina "${existing?.name ?? 'N/A'}" excluída!` };
}

// --- Activities ---

export async function createActivityAction(
  payload: ActivityPayload,
): Promise<OrgActionResult<OrgActivity>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const data = {
    ...toDbPayload(payload),
    tenant_id: ctx.tenantId,
  };

  const { data: created, error } = await ctx.supabase
    .from('org_activities')
    .insert([data])
    .select()
    .single();

  if (error) return { success: false, message: `Erro ao criar atividade: ${error.message}` };
  revalidatePath('/organizacao/processos');
  return {
    success: true,
    message: `Atividade "${created.name}" criada!`,
    data: created as OrgActivity,
  };
}

export async function updateActivityAction(
  id: string,
  updates: Partial<ActivityPayload>,
): Promise<OrgActionResult<OrgActivity>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data: updated, error } = await ctx.supabase
    .from('org_activities')
    .update(toDbPayload(updates as Record<string, unknown>))
    .eq('id', id)
    .select()
    .single();

  if (error) return { success: false, message: `Erro ao atualizar atividade: ${error.message}` };
  revalidatePath('/organizacao/processos');
  return { success: true, message: 'Atividade atualizada!', data: updated as OrgActivity };
}

export async function deleteActivityAction(id: string): Promise<OrgActionResult> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data: existing } = await ctx.supabase
    .from('org_activities')
    .select('name')
    .eq('id', id)
    .single();
  const { error } = await ctx.supabase.from('org_activities').delete().eq('id', id);

  if (error) return { success: false, message: `Erro ao excluir atividade: ${error.message}` };
  revalidatePath('/organizacao/processos');
  return { success: true, message: `Atividade "${existing?.name ?? 'N/A'}" excluída!` };
}

// --- Systems ---

export async function createSystemAction(
  payload: SystemPayload,
): Promise<OrgActionResult<OrgSystem>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const data = { ...payload, tenant_id: ctx.tenantId };

  const { data: created, error } = await ctx.supabase
    .from('org_systems')
    .insert([data])
    .select()
    .single();

  if (error) return { success: false, message: `Erro ao criar sistema: ${error.message}` };
  revalidatePath('/organizacao/recursos');
  revalidatePath('/organizacao/empresa');
  return {
    success: true,
    message: `Sistema "${created.name}" criado!`,
    data: created as OrgSystem,
  };
}

export async function updateSystemAction(
  id: string,
  updates: Partial<SystemPayload>,
): Promise<OrgActionResult<OrgSystem>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data: updated, error } = await ctx.supabase
    .from('org_systems')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return { success: false, message: `Erro ao atualizar sistema: ${error.message}` };
  revalidatePath('/organizacao/recursos');
  revalidatePath('/organizacao/empresa');
  return { success: true, message: 'Sistema atualizado!', data: updated as OrgSystem };
}

export async function deleteSystemAction(id: string): Promise<OrgActionResult> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data: existing } = await ctx.supabase
    .from('org_systems')
    .select('name')
    .eq('id', id)
    .single();
  const { error } = await ctx.supabase.from('org_systems').delete().eq('id', id);

  if (error) return { success: false, message: `Erro ao excluir sistema: ${error.message}` };
  revalidatePath('/organizacao/recursos');
  revalidatePath('/organizacao/empresa');
  return { success: true, message: `Sistema "${existing?.name ?? 'N/A'}" excluído!` };
}

// --- System Resources ---

export async function createSystemResourceAction(
  payload: SystemResourcePayload,
): Promise<OrgActionResult<OrgSystemResource>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const data = { ...payload, tenant_id: ctx.tenantId };

  const { data: created, error } = await ctx.supabase
    .from('org_system_resources')
    .insert([data])
    .select()
    .single();

  if (error) return { success: false, message: `Erro ao criar recurso: ${error.message}` };
  revalidatePath('/organizacao/recursos');
  revalidatePath('/organizacao/empresa');
  return {
    success: true,
    message: `Recurso "${created.name}" criado!`,
    data: created as OrgSystemResource,
  };
}

export async function updateSystemResourceAction(
  id: string,
  updates: Partial<SystemResourcePayload>,
): Promise<OrgActionResult<OrgSystemResource>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data: updated, error } = await ctx.supabase
    .from('org_system_resources')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return { success: false, message: `Erro ao atualizar recurso: ${error.message}` };
  revalidatePath('/organizacao/recursos');
  revalidatePath('/organizacao/empresa');
  return { success: true, message: 'Recurso atualizado!', data: updated as OrgSystemResource };
}

export async function deleteSystemResourceAction(id: string): Promise<OrgActionResult> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data: existing } = await ctx.supabase
    .from('org_system_resources')
    .select('name')
    .eq('id', id)
    .single();
  const { error } = await ctx.supabase.from('org_system_resources').delete().eq('id', id);

  if (error) return { success: false, message: `Erro ao excluir recurso: ${error.message}` };
  revalidatePath('/organizacao/recursos');
  revalidatePath('/organizacao/empresa');
  return { success: true, message: `Recurso "${existing?.name ?? 'N/A'}" excluído!` };
}

// --- Suppliers ---

export async function createSupplierAction(
  payload: SupplierPayload,
): Promise<OrgActionResult<OrgSupplier>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const data = { ...payload, tenant_id: ctx.tenantId };

  const { data: created, error } = await ctx.supabase
    .from('org_suppliers')
    .insert([data])
    .select()
    .single();

  if (error) return { success: false, message: `Erro ao criar fornecedor: ${error.message}` };
  revalidatePath('/organizacao/recursos');
  revalidatePath('/organizacao/empresa');
  return {
    success: true,
    message: `Fornecedor "${created.name}" criado!`,
    data: created as OrgSupplier,
  };
}

export async function updateSupplierAction(
  id: string,
  updates: Partial<SupplierPayload>,
): Promise<OrgActionResult<OrgSupplier>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data: updated, error } = await ctx.supabase
    .from('org_suppliers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return { success: false, message: `Erro ao atualizar fornecedor: ${error.message}` };
  revalidatePath('/organizacao/recursos');
  revalidatePath('/organizacao/empresa');
  return { success: true, message: 'Fornecedor atualizado!', data: updated as OrgSupplier };
}

export async function deleteSupplierAction(id: string): Promise<OrgActionResult> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data: existing } = await ctx.supabase
    .from('org_suppliers')
    .select('name')
    .eq('id', id)
    .single();
  const { error } = await ctx.supabase.from('org_suppliers').delete().eq('id', id);

  if (error) return { success: false, message: `Erro ao excluir fornecedor: ${error.message}` };
  revalidatePath('/organizacao/recursos');
  revalidatePath('/organizacao/empresa');
  return { success: true, message: `Fornecedor "${existing?.name ?? 'N/A'}" excluído!` };
}

// --- Services ---

export async function createServiceAction(
  payload: ServicePayload,
): Promise<OrgActionResult<OrgService>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const data = { ...payload, tenant_id: ctx.tenantId };

  const { data: created, error } = await ctx.supabase
    .from('org_services')
    .insert([data])
    .select()
    .single();

  if (error) return { success: false, message: `Erro ao criar serviço: ${error.message}` };
  revalidatePath('/organizacao/recursos');
  revalidatePath('/organizacao/empresa');
  return {
    success: true,
    message: `Serviço "${created.name}" criado!`,
    data: created as OrgService,
  };
}

export async function updateServiceAction(
  id: string,
  updates: Partial<ServicePayload>,
): Promise<OrgActionResult<OrgService>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data: updated, error } = await ctx.supabase
    .from('org_services')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return { success: false, message: `Erro ao atualizar serviço: ${error.message}` };
  revalidatePath('/organizacao/recursos');
  revalidatePath('/organizacao/empresa');
  return { success: true, message: 'Serviço atualizado!', data: updated as OrgService };
}

export async function deleteServiceAction(id: string): Promise<OrgActionResult> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data: existing } = await ctx.supabase
    .from('org_services')
    .select('name')
    .eq('id', id)
    .single();
  const { error } = await ctx.supabase.from('org_services').delete().eq('id', id);

  if (error) return { success: false, message: `Erro ao excluir serviço: ${error.message}` };
  revalidatePath('/organizacao/recursos');
  revalidatePath('/organizacao/empresa');
  return { success: true, message: `Serviço "${existing?.name ?? 'N/A'}" excluído!` };
}

// --- Org Documents ---

export async function createOrgDocumentAction(
  payload: OrgDocumentPayload,
): Promise<OrgActionResult<OrgDocument>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const data = { ...payload, tenant_id: ctx.tenantId };

  const { data: created, error } = await ctx.supabase
    .from('org_documents')
    .insert([data])
    .select()
    .single();

  if (error) return { success: false, message: `Erro ao criar documento: ${error.message}` };
  revalidatePath('/organizacao/recursos');
  revalidatePath('/organizacao/empresa');
  return {
    success: true,
    message: `Documento "${created.name}" criado!`,
    data: created as OrgDocument,
  };
}

export async function updateOrgDocumentAction(
  id: string,
  updates: Partial<OrgDocumentPayload>,
): Promise<OrgActionResult<OrgDocument>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data: updated, error } = await ctx.supabase
    .from('org_documents')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return { success: false, message: `Erro ao atualizar documento: ${error.message}` };
  revalidatePath('/organizacao/recursos');
  revalidatePath('/organizacao/empresa');
  return { success: true, message: 'Documento atualizado!', data: updated as OrgDocument };
}

export async function deleteOrgDocumentAction(id: string): Promise<OrgActionResult> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data: existing } = await ctx.supabase
    .from('org_documents')
    .select('name')
    .eq('id', id)
    .single();
  const { error } = await ctx.supabase.from('org_documents').delete().eq('id', id);

  if (error) return { success: false, message: `Erro ao excluir documento: ${error.message}` };
  revalidatePath('/organizacao/recursos');
  revalidatePath('/organizacao/empresa');
  return { success: true, message: `Documento "${existing?.name ?? 'N/A'}" excluído!` };
}

// --- Process ↔ System (org_process_systems) ---

export async function addProcessSystemAction(
  processId: string,
  systemId: string,
): Promise<OrgActionResult> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { error } = await ctx.supabase.from('org_process_systems').insert({
    process_id: processId,
    system_id: systemId,
  });

  if (error) return { success: false, message: `Erro ao vincular sistema: ${error.message}` };
  revalidatePath('/organizacao/empresa');
  revalidatePath('/organizacao/processos');
  return { success: true, message: 'Sistema vinculado ao processo!' };
}

export async function removeProcessSystemAction(
  processId: string,
  systemId: string,
): Promise<OrgActionResult> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { error } = await ctx.supabase
    .from('org_process_systems')
    .delete()
    .eq('process_id', processId)
    .eq('system_id', systemId);

  if (error) return { success: false, message: `Erro ao desvincular sistema: ${error.message}` };
  revalidatePath('/organizacao/empresa');
  revalidatePath('/organizacao/processos');
  return { success: true, message: 'Sistema desvinculado do processo!' };
}

// --- Activity ↔ Document (org_activity_documents) ---

export async function addActivityDocumentAction(
  activityId: string,
  orgDocumentId: string,
): Promise<OrgActionResult> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { error } = await ctx.supabase.from('org_activity_documents').insert({
    activity_id: activityId,
    org_document_id: orgDocumentId,
  });

  if (error) return { success: false, message: `Erro ao vincular documento: ${error.message}` };
  revalidatePath('/organizacao/processos');
  return { success: true, message: 'Documento vinculado à atividade!' };
}

export async function removeActivityDocumentAction(
  activityId: string,
  orgDocumentId: string,
): Promise<OrgActionResult> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { error } = await ctx.supabase
    .from('org_activity_documents')
    .delete()
    .eq('activity_id', activityId)
    .eq('org_document_id', orgDocumentId);

  if (error) return { success: false, message: `Erro ao desvincular documento: ${error.message}` };
  revalidatePath('/organizacao/processos');
  return { success: true, message: 'Documento desvinculado da atividade!' };
}

// --- AI Bootstrap Engine ---

const ESCRITORIO_JURIDICO_AREAS = [
  {
    name: 'Recuperação de Crédito',
    description: 'Área de recuperação de crédito',
    objective: 'Gestão de cobranças e recuperação',
  },
  { name: 'Trabalhista', description: 'Área trabalhista', objective: 'Processos trabalhistas' },
  {
    name: 'Contencioso Cível',
    description: 'Área contenciosa cível',
    objective: 'Litígios cíveis',
  },
  { name: 'Consultivo', description: 'Área consultiva', objective: 'Assessoria jurídica' },
  { name: 'Legal Operations', description: 'Operações jurídicas', objective: 'Gestão operacional' },
  {
    name: 'Experiência do Cliente',
    description: 'Experiência do cliente',
    objective: 'Atendimento e satisfação',
  },
  { name: 'Comercial', description: 'Área comercial', objective: 'Vendas e negócios' },
  { name: 'Financeiro', description: 'Área financeira', objective: 'Gestão financeira' },
  { name: 'Administrativo', description: 'Área administrativa', objective: 'Administração geral' },
  {
    name: 'Inovação e Tecnologia',
    description: 'Inovação e TI',
    objective: 'Tecnologia e inovação',
  },
];

// Query functions for hierarchical navigation
export async function getRoutinesByProcess(processId: string): Promise<OrgRoutine[]> {
  'use server';
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) return [];

  const { data, error } = await supabase
    .from('org_routines')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .eq('process_id', processId);

  if (error) {
    console.error('Erro ao carregar rotinas:', error);
    return [];
  }

  return data || [];
}

export async function getActivitiesByRoutine(routineId: string): Promise<OrgActivity[]> {
  'use server';
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) return [];

  const { data, error } = await supabase
    .from('org_activities')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .eq('routine_id', routineId);

  if (error) {
    console.error('Erro ao carregar atividades:', error);
    return [];
  }

  return data || [];
}

export async function runBootstrapAction(
  companyTypeSlug: string,
): Promise<OrgActionResult<{ areasCreated: number }>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  if (companyTypeSlug !== 'escritorio_juridico') {
    return {
      success: false,
      message: `Tipo de empresa "${companyTypeSlug}" ainda não suportado. Use "escritorio_juridico".`,
    };
  }

  const { data: existing } = await ctx.supabase
    .from('org_areas')
    .select('id')
    .eq('tenant_id', ctx.tenantId)
    .limit(1);

  if (existing && existing.length > 0) {
    return {
      success: false,
      message:
        'Já existem áreas cadastradas. O bootstrap só pode ser executado em organização vazia.',
    };
  }

  const areasToInsert = ESCRITORIO_JURIDICO_AREAS.map((a) => ({
    tenant_id: ctx.tenantId,
    name: a.name,
    description: a.description,
    objective: a.objective,
    responsible_roles: [],
    documentation: {},
  }));

  const { data: created, error } = await ctx.supabase
    .from('org_areas')
    .insert(areasToInsert)
    .select('id');

  if (error) {
    return { success: false, message: `Erro ao gerar estrutura: ${error.message}` };
  }

  revalidatePath('/organizacao/areas');
  revalidatePath('/organizacao/processos');
  return {
    success: true,
    message: `${created?.length ?? 0} áreas criadas com sucesso!`,
    data: { areasCreated: created?.length ?? 0 },
  };
}

// --- EPIC 11: Story 11.7 - Responsible Roles Actions ---

/**
 * Update all responsible roles for an activity (replace mode)
 * Story 11.7: Implement Server Actions for Responsible Roles
 */
export async function updateActivityResponsibleRolesAction(
  activityId: string,
  roles: string[]
): Promise<OrgActionResult<OrgActivity>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data, error } = await ctx.supabase
    .from('org_activities')
    .update({
      responsible_roles: roles,
      updated_at: new Date().toISOString(),
    })
    .eq('id', activityId)
    .eq('tenant_id', ctx.tenantId)
    .select()
    .single();

  if (error) return { success: false, message: `Erro ao atualizar funções responsáveis: ${error.message}` };

  // TODO: Audit logging - logAuditEvent()
  revalidatePath('/organizacao');
  return { success: true, message: 'Funções responsáveis atualizadas!', data: data as OrgActivity };
}

/**
 * Add single role to activity (append mode)
 * Story 11.7: Implement Server Actions for Responsible Roles
 */
export async function addActivityResponsibleRoleAction(
  activityId: string,
  role: string
): Promise<OrgActionResult<OrgActivity>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  // Fetch current roles
  const { data: activity, error: fetchError } = await ctx.supabase
    .from('org_activities')
    .select('responsible_roles')
    .eq('id', activityId)
    .eq('tenant_id', ctx.tenantId)
    .single();

  if (fetchError) return { success: false, message: 'Atividade não encontrada' };

  const currentRoles = activity?.responsible_roles || [];
  if (currentRoles.includes(role)) {
    return { success: false, message: 'Função já adicionada' };
  }

  const newRoles = [...currentRoles, role];
  return updateActivityResponsibleRolesAction(activityId, newRoles);
}

/**
 * Remove single role from activity
 * Story 11.7: Implement Server Actions for Responsible Roles
 */
export async function removeActivityResponsibleRoleAction(
  activityId: string,
  role: string
): Promise<OrgActionResult<OrgActivity>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  // Fetch current roles
  const { data: activity, error: fetchError } = await ctx.supabase
    .from('org_activities')
    .select('responsible_roles')
    .eq('id', activityId)
    .eq('tenant_id', ctx.tenantId)
    .single();

  if (fetchError) return { success: false, message: 'Atividade não encontrada' };

  const currentRoles = activity?.responsible_roles || [];
  const newRoles = currentRoles.filter((r: string) => r !== role);

  return updateActivityResponsibleRolesAction(activityId, newRoles);
}

/**
 * Fetch current responsible roles for activity (read-only)
 * Story 11.7: Implement Server Actions for Responsible Roles
 */
export async function getActivityResponsibleRolesAction(
  activityId: string
): Promise<OrgActionResult<string[]>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data, error } = await ctx.supabase
    .from('org_activities')
    .select('responsible_roles')
    .eq('id', activityId)
    .eq('tenant_id', ctx.tenantId)
    .single();

  if (error) return { success: false, message: 'Atividade não encontrada' };
  return { success: true, message: 'Funções recuperadas com sucesso', data: data?.responsible_roles || [] };
}

// --- EPIC 11: Story 11.8 - Activity-System Actions ---

/**
 * Add system to activity (insert into org_activity_systems junction)
 * Story 11.8: Activity-System Relationship UI
 */
export async function addActivitySystemAction(
  activityId: string,
  systemId: string,
  usageContext?: string
): Promise<OrgActionResult> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { error } = await ctx.supabase.from('org_activity_systems').insert({
    activity_id: activityId,
    system_id: systemId,
    tenant_id: ctx.tenantId,
    usage_context: usageContext || null,
  });

  if (error) return { success: false, message: `Erro ao adicionar sistema: ${error.message}` };

  // TODO: Audit logging
  revalidatePath('/organizacao');
  return { success: true, message: 'Sistema adicionado à atividade!' };
}

/**
 * Remove system from activity (delete from org_activity_systems junction)
 * Story 11.8: Activity-System Relationship UI
 */
export async function removeActivitySystemAction(
  activityId: string,
  systemId: string
): Promise<OrgActionResult> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { error } = await ctx.supabase
    .from('org_activity_systems')
    .delete()
    .eq('activity_id', activityId)
    .eq('system_id', systemId)
    .eq('tenant_id', ctx.tenantId);

  if (error) return { success: false, message: `Erro ao remover sistema: ${error.message}` };

  // TODO: Audit logging
  revalidatePath('/organizacao');
  return { success: true, message: 'Sistema removido da atividade!' };
}

/**
 * Get all systems linked to an activity
 * Story 11.8: Activity-System Relationship UI
 */
export async function getActivitySystemsAction(
  activityId: string
): Promise<OrgActionResult<any[]>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data, error } = await ctx.supabase
    .from('org_activity_systems')
    .select(
      `
      system_id,
      usage_context,
      org_systems:system_id (id, name)
    `
    )
    .eq('activity_id', activityId)
    .eq('tenant_id', ctx.tenantId);

  if (error) return { success: false, message: `Erro ao buscar sistemas: ${error.message}` };
  return { success: true, message: 'Sistemas recuperados com sucesso', data: data || [] };
}

// --- EPIC 11: Story 11.9 - Process Metrics Actions ---

/**
 * Get SLA definitions for a process
 * Story 11.9: Process Metrics & SLAs Display
 */
export async function getProcessSLAsAction(
  processId: string
): Promise<OrgActionResult<any[]>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data, error } = await ctx.supabase
    .from('org_process_slas')
    .select('*')
    .eq('process_id', processId)
    .eq('tenant_id', ctx.tenantId);

  if (error) return { success: false, message: `Erro ao buscar SLAs: ${error.message}` };
  return { success: true, message: 'SLAs recuperadas com sucesso', data: data || [] };
}

/**
 * Get metrics for a process in a period
 * Story 11.9: Process Metrics & SLAs Display
 */
export async function getProcessMetricsAction(
  processId: string,
  periodStart: string,
  periodEnd: string
): Promise<OrgActionResult<any[]>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data, error } = await ctx.supabase
    .from('org_process_metrics')
    .select('*')
    .eq('process_id', processId)
    .eq('tenant_id', ctx.tenantId)
    .gte('period_start', periodStart)
    .lte('period_end', periodEnd)
    .order('period_start', { ascending: false });

  if (error) return { success: false, message: `Erro ao buscar métricas: ${error.message}` };
  return { success: true, message: 'Métricas recuperadas com sucesso', data: data || [] };
}

// --- EPIC 11: Story 13.1 - SLA Management (Create/Edit/Delete) ---

/**
 * Create a new process SLA
 * Story 13.1 Phase 3: SLA Management
 */
export async function createProcessSlaAction(
  processId: string,
  metricName: string,
  targetDurationDays: number,
  warningThresholdPct: number,
  criticalThresholdPct: number,
  description?: string
): Promise<OrgActionResult<any>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  // Validation
  if (targetDurationDays <= 0) {
    return { success: false, message: 'Duração alvo deve ser maior que 0' };
  }
  if (warningThresholdPct < 0 || warningThresholdPct > 100) {
    return { success: false, message: 'Threshold de aviso deve estar entre 0 e 100' };
  }
  if (criticalThresholdPct < 0 || criticalThresholdPct > 100) {
    return { success: false, message: 'Threshold crítico deve estar entre 0 e 100' };
  }
  if (warningThresholdPct >= criticalThresholdPct) {
    return { success: false, message: 'Threshold de aviso deve ser menor que crítico' };
  }

  const data = {
    process_id: processId,
    metric_name: metricName,
    target_duration_days: targetDurationDays,
    warning_threshold_pct: warningThresholdPct,
    critical_threshold_pct: criticalThresholdPct,
    description: description || null,
    tenant_id: ctx.tenantId,
  };

  const { data: created, error } = await ctx.supabase
    .from('org_process_slas')
    .insert([data])
    .select()
    .single();

  if (error) return { success: false, message: `Erro ao criar SLA: ${error.message}` };
  revalidatePath('/organizacao/processos');
  return { success: true, message: 'SLA criado com sucesso!', data: created };
}

/**
 * Update an existing process SLA
 * Story 13.1 Phase 3: SLA Management
 */
export async function updateProcessSlaAction(
  slaId: string,
  updates: {
    metricName?: string;
    targetDurationDays?: number;
    warningThresholdPct?: number;
    criticalThresholdPct?: number;
    description?: string;
  }
): Promise<OrgActionResult<any>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  // Validation
  if (updates.targetDurationDays !== undefined && updates.targetDurationDays <= 0) {
    return { success: false, message: 'Duração alvo deve ser maior que 0' };
  }
  if (updates.warningThresholdPct !== undefined && (updates.warningThresholdPct < 0 || updates.warningThresholdPct > 100)) {
    return { success: false, message: 'Threshold de aviso deve estar entre 0 e 100' };
  }
  if (updates.criticalThresholdPct !== undefined && (updates.criticalThresholdPct < 0 || updates.criticalThresholdPct > 100)) {
    return { success: false, message: 'Threshold crítico deve estar entre 0 e 100' };
  }

  // Build update payload (convert camelCase to snake_case)
  const payload: Record<string, any> = {};
  if (updates.metricName !== undefined) payload.metric_name = updates.metricName;
  if (updates.targetDurationDays !== undefined) payload.target_duration_days = updates.targetDurationDays;
  if (updates.warningThresholdPct !== undefined) payload.warning_threshold_pct = updates.warningThresholdPct;
  if (updates.criticalThresholdPct !== undefined) payload.critical_threshold_pct = updates.criticalThresholdPct;
  if (updates.description !== undefined) payload.description = updates.description;

  const { data: updated, error } = await ctx.supabase
    .from('org_process_slas')
    .update(payload)
    .eq('id', slaId)
    .eq('tenant_id', ctx.tenantId)
    .select()
    .single();

  if (error) return { success: false, message: `Erro ao atualizar SLA: ${error.message}` };
  revalidatePath('/organizacao/processos');
  return { success: true, message: 'SLA atualizado com sucesso!', data: updated };
}

/**
 * Delete a process SLA
 * Story 13.1 Phase 3: SLA Management
 */
export async function deleteProcessSlaAction(slaId: string): Promise<OrgActionResult> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data: existing } = await ctx.supabase
    .from('org_process_slas')
    .select('metric_name')
    .eq('id', slaId)
    .single();

  const { error } = await ctx.supabase
    .from('org_process_slas')
    .delete()
    .eq('id', slaId)
    .eq('tenant_id', ctx.tenantId);

  if (error) return { success: false, message: `Erro ao excluir SLA: ${error.message}` };
  revalidatePath('/organizacao/processos');
  return { success: true, message: `SLA "${existing?.metric_name ?? 'N/A'}" excluído com sucesso!` };
}

// --- EPIC 11: Story 11.10 - Advanced Search & Filter ---

/**
 * Advanced search across all organizational entities
 * Story 11.10: Advanced Search & Filter for Organizations
 *
 * Searches:
 * - Areas, Nuclei, Processes, Routines, Activities
 * - Systems, Suppliers, Services, Documents
 *
 * Fields:
 * - name (exact, prefix, fuzzy match)
 * - description, objective, documentation
 */
export async function searchOrganizationAction(
  query: string,
  filters?: SearchFilters
): Promise<OrgActionResult<SearchResult[]>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  if (!query.trim()) {
    return { success: true, message: 'Query vazia', data: [] };
  }

  const q = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  try {
    // Search Areas
    const { data: areas } = await ctx.supabase
      .from('org_areas')
      .select('id, name, description, objective, documentation')
      .eq('tenant_id', ctx.tenantId);

    if (areas) {
      for (const area of areas) {
        const score = rankSearchMatch(
          q,
          area.name,
          area.description,
          area.objective,
          area.documentation?.overview
        );
        if (score > 0) {
          results.push({
            id: area.id,
            type: 'area',
            name: area.name,
            breadcrumb: area.name,
            score,
          });
        }
      }
    }

    // Search Nuclei
    const { data: nuclei } = await ctx.supabase
      .from('org_nuclei')
      .select('id, name, description, objective, documentation, area_id')
      .eq('tenant_id', ctx.tenantId);

    if (nuclei) {
      for (const n of nuclei) {
        const score = rankSearchMatch(
          q,
          n.name,
          n.description,
          n.objective,
          n.documentation?.overview
        );
        if (score > 0) {
          const area = areas?.find((a) => a.id === n.area_id);
          const breadcrumb = area
            ? `${area.name} / ${n.name}`
            : n.name;

          results.push({
            id: n.id,
            type: 'nucleus',
            name: n.name,
            breadcrumb,
            score,
          });
        }
      }
    }

    // Search Processes
    const { data: processes } = await ctx.supabase
      .from('org_processes')
      .select('id, name, description, objective, documentation, area_id, nucleus_id')
      .eq('tenant_id', ctx.tenantId);

    if (processes) {
      for (const p of processes) {
        const score = rankSearchMatch(
          q,
          p.name,
          p.description,
          p.objective,
          p.documentation?.overview
        );
        if (score > 0) {
          let breadcrumb = p.name;
          const area = areas?.find((a) => a.id === p.area_id);
          const nucleus = nuclei?.find((n) => n.id === p.nucleus_id);

          if (area && nucleus) {
            breadcrumb = `${area.name} / ${nucleus.name} / ${p.name}`;
          } else if (area) {
            breadcrumb = `${area.name} / ${p.name}`;
          } else if (nucleus) {
            breadcrumb = `${nucleus.name} / ${p.name}`;
          }

          results.push({
            id: p.id,
            type: 'process',
            name: p.name,
            breadcrumb,
            score,
          });
        }
      }
    }

    // Search Routines
    const { data: routines } = await ctx.supabase
      .from('org_routines')
      .select('id, name, description, objective, documentation, process_id')
      .eq('tenant_id', ctx.tenantId);

    if (routines) {
      for (const r of routines) {
        const score = rankSearchMatch(
          q,
          r.name,
          r.description,
          r.objective,
          r.documentation?.overview
        );
        if (score > 0) {
          const process = processes?.find((p) => p.id === r.process_id);
          const breadcrumb = process
            ? `${process.name} / ${r.name}`
            : r.name;

          results.push({
            id: r.id,
            type: 'routine',
            name: r.name,
            breadcrumb,
            score,
          });
        }
      }
    }

    // Search Activities
    const { data: activities } = await ctx.supabase
      .from('org_activities')
      .select('id, name, description, objective, documentation, routine_id')
      .eq('tenant_id', ctx.tenantId);

    if (activities) {
      for (const a of activities) {
        const score = rankSearchMatch(
          q,
          a.name,
          a.description,
          a.objective,
          a.documentation?.overview
        );
        if (score > 0) {
          const routine = routines?.find((r) => r.id === a.routine_id);
          const breadcrumb = routine
            ? `${routine.name} / ${a.name}`
            : a.name;

          results.push({
            id: a.id,
            type: 'activity',
            name: a.name,
            breadcrumb,
            score,
          });
        }
      }
    }

    // Search Systems
    const { data: systems } = await ctx.supabase
      .from('org_systems')
      .select('id, name, description, purpose')
      .eq('tenant_id', ctx.tenantId);

    if (systems) {
      for (const s of systems) {
        const score = rankSearchMatch(q, s.name, s.description, s.purpose);
        if (score > 0) {
          results.push({
            id: s.id,
            type: 'system',
            name: s.name,
            breadcrumb: s.name,
            score,
          });
        }
      }
    }

    // Search Suppliers
    const { data: suppliers } = await ctx.supabase
      .from('org_suppliers')
      .select('id, name, description')
      .eq('tenant_id', ctx.tenantId);

    if (suppliers) {
      for (const s of suppliers) {
        const score = rankSearchMatch(q, s.name, s.description);
        if (score > 0) {
          results.push({
            id: s.id,
            type: 'supplier',
            name: s.name,
            breadcrumb: s.name,
            score,
          });
        }
      }
    }

    // Search Services
    const { data: services } = await ctx.supabase
      .from('org_services')
      .select('id, name, description')
      .eq('tenant_id', ctx.tenantId);

    if (services) {
      for (const s of services) {
        const score = rankSearchMatch(q, s.name, s.description);
        if (score > 0) {
          results.push({
            id: s.id,
            type: 'service',
            name: s.name,
            breadcrumb: s.name,
            score,
          });
        }
      }
    }

    // Search Documents
    const { data: documents } = await ctx.supabase
      .from('org_documents')
      .select('id, name, description, associated_process_id')
      .eq('tenant_id', ctx.tenantId);

    if (documents) {
      for (const d of documents) {
        const score = rankSearchMatch(q, d.name, d.description);
        if (score > 0) {
          const process = processes?.find(
            (p) => p.id === d.associated_process_id
          );
          const breadcrumb = process
            ? `${process.name} / ${d.name}`
            : d.name;

          results.push({
            id: d.id,
            type: 'document',
            name: d.name,
            breadcrumb,
            score,
          });
        }
      }
    }

    // Apply filters
    let filtered = applyFilters(results, filters || {});

    // Sort by score descending
    filtered.sort((a, b) => b.score - a.score);

    // Paginate (20 per page)
    const paginated = paginateResults(filtered, 0, 20);

    return {
      success: true,
      message: `${filtered.length} resultado(s) encontrado(s)`,
      data: paginated.results,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    return { success: false, message: `Erro na busca: ${msg}` };
  }
}
