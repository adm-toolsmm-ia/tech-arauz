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
type ProcessPayload = Omit<OrgProcess, 'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'area' | 'nucleus'>;
type RoutinePayload = Omit<OrgRoutine, 'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'process'>;
type ActivityPayload = Omit<OrgActivity, 'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'routine'>;
type SystemPayload = Omit<OrgSystem, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>;
type SystemResourcePayload = Omit<OrgSystemResource, 'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'system'>;
type SupplierPayload = Omit<OrgSupplier, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>;
type ServicePayload = Omit<OrgService, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>;
type OrgDocumentPayload = Omit<OrgDocument, 'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'process'>;

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
  return { success: true, message: `Área "${created.name}" criada!`, data: created as OrgArea };
}

export async function updateAreaAction(id: string, updates: Partial<AreaPayload>): Promise<OrgActionResult<OrgArea>> {
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

  const { data: existing } = await ctx.supabase.from('org_areas').select('name').eq('id', id).single();
  const { error } = await ctx.supabase.from('org_areas').delete().eq('id', id);

  if (error) return { success: false, message: `Erro ao excluir área: ${error.message}` };
  revalidatePath('/organizacao/areas');
  return { success: true, message: `Área "${existing?.name ?? 'N/A'}" excluída!` };
}

// --- Nuclei ---

export async function createNucleusAction(payload: NucleusPayload): Promise<OrgActionResult<OrgNucleus>> {
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
  return { success: true, message: `Núcleo "${created.name}" criado!`, data: created as OrgNucleus };
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

  const { data: existing } = await ctx.supabase.from('org_nuclei').select('name').eq('id', id).single();
  const { error } = await ctx.supabase.from('org_nuclei').delete().eq('id', id);

  if (error) return { success: false, message: `Erro ao excluir núcleo: ${error.message}` };
  revalidatePath('/organizacao/areas');
  revalidatePath('/organizacao/nucleos');
  revalidatePath('/organizacao/processos');
  return { success: true, message: `Núcleo "${existing?.name ?? 'N/A'}" excluído!` };
}

// --- Processes ---

export async function createProcessAction(payload: ProcessPayload): Promise<OrgActionResult<OrgProcess>> {
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
  return { success: true, message: `Processo "${created.name}" criado!`, data: created as OrgProcess };
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

  const { data: existing } = await ctx.supabase.from('org_processes').select('name').eq('id', id).single();
  const { error } = await ctx.supabase.from('org_processes').delete().eq('id', id);

  if (error) return { success: false, message: `Erro ao excluir processo: ${error.message}` };
  revalidatePath('/organizacao/processos');
  return { success: true, message: `Processo "${existing?.name ?? 'N/A'}" excluído!` };
}

// --- Routines ---

export async function createRoutineAction(payload: RoutinePayload): Promise<OrgActionResult<OrgRoutine>> {
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
  return { success: true, message: `Rotina "${created.name}" criada!`, data: created as OrgRoutine };
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

  const { data: existing } = await ctx.supabase.from('org_routines').select('name').eq('id', id).single();
  const { error } = await ctx.supabase.from('org_routines').delete().eq('id', id);

  if (error) return { success: false, message: `Erro ao excluir rotina: ${error.message}` };
  revalidatePath('/organizacao/processos');
  revalidatePath('/organizacao/rotinas');
  return { success: true, message: `Rotina "${existing?.name ?? 'N/A'}" excluída!` };
}

// --- Activities ---

export async function createActivityAction(payload: ActivityPayload): Promise<OrgActionResult<OrgActivity>> {
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
  return { success: true, message: `Atividade "${created.name}" criada!`, data: created as OrgActivity };
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

  const { data: existing } = await ctx.supabase.from('org_activities').select('name').eq('id', id).single();
  const { error } = await ctx.supabase.from('org_activities').delete().eq('id', id);

  if (error) return { success: false, message: `Erro ao excluir atividade: ${error.message}` };
  revalidatePath('/organizacao/processos');
  return { success: true, message: `Atividade "${existing?.name ?? 'N/A'}" excluída!` };
}

// --- Systems ---

export async function createSystemAction(payload: SystemPayload): Promise<OrgActionResult<OrgSystem>> {
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
  return { success: true, message: `Sistema "${created.name}" criado!`, data: created as OrgSystem };
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
  return { success: true, message: 'Sistema atualizado!', data: updated as OrgSystem };
}

export async function deleteSystemAction(id: string): Promise<OrgActionResult> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data: existing } = await ctx.supabase.from('org_systems').select('name').eq('id', id).single();
  const { error } = await ctx.supabase.from('org_systems').delete().eq('id', id);

  if (error) return { success: false, message: `Erro ao excluir sistema: ${error.message}` };
  revalidatePath('/organizacao/recursos');
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
  return { success: true, message: `Recurso "${created.name}" criado!`, data: created as OrgSystemResource };
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
  return { success: true, message: `Recurso "${existing?.name ?? 'N/A'}" excluído!` };
}

// --- Suppliers ---

export async function createSupplierAction(payload: SupplierPayload): Promise<OrgActionResult<OrgSupplier>> {
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
  return { success: true, message: `Fornecedor "${created.name}" criado!`, data: created as OrgSupplier };
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
  return { success: true, message: 'Fornecedor atualizado!', data: updated as OrgSupplier };
}

export async function deleteSupplierAction(id: string): Promise<OrgActionResult> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data: existing } = await ctx.supabase.from('org_suppliers').select('name').eq('id', id).single();
  const { error } = await ctx.supabase.from('org_suppliers').delete().eq('id', id);

  if (error) return { success: false, message: `Erro ao excluir fornecedor: ${error.message}` };
  revalidatePath('/organizacao/recursos');
  return { success: true, message: `Fornecedor "${existing?.name ?? 'N/A'}" excluído!` };
}

// --- Services ---

export async function createServiceAction(payload: ServicePayload): Promise<OrgActionResult<OrgService>> {
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
  return { success: true, message: `Serviço "${created.name}" criado!`, data: created as OrgService };
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
  return { success: true, message: 'Serviço atualizado!', data: updated as OrgService };
}

export async function deleteServiceAction(id: string): Promise<OrgActionResult> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data: existing } = await ctx.supabase.from('org_services').select('name').eq('id', id).single();
  const { error } = await ctx.supabase.from('org_services').delete().eq('id', id);

  if (error) return { success: false, message: `Erro ao excluir serviço: ${error.message}` };
  revalidatePath('/organizacao/recursos');
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
  return { success: true, message: `Documento "${created.name}" criado!`, data: created as OrgDocument };
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
  return { success: true, message: 'Documento atualizado!', data: updated as OrgDocument };
}

export async function deleteOrgDocumentAction(id: string): Promise<OrgActionResult> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { data: existing } = await ctx.supabase.from('org_documents').select('name').eq('id', id).single();
  const { error } = await ctx.supabase.from('org_documents').delete().eq('id', id);

  if (error) return { success: false, message: `Erro ao excluir documento: ${error.message}` };
  revalidatePath('/organizacao/recursos');
  return { success: true, message: `Documento "${existing?.name ?? 'N/A'}" excluído!` };
}

// --- AI Bootstrap Engine ---

const ESCRITORIO_JURIDICO_AREAS = [
  { name: 'Recuperação de Crédito', description: 'Área de recuperação de crédito', objective: 'Gestão de cobranças e recuperação' },
  { name: 'Trabalhista', description: 'Área trabalhista', objective: 'Processos trabalhistas' },
  { name: 'Contencioso Cível', description: 'Área contenciosa cível', objective: 'Litígios cíveis' },
  { name: 'Consultivo', description: 'Área consultiva', objective: 'Assessoria jurídica' },
  { name: 'Legal Operations', description: 'Operações jurídicas', objective: 'Gestão operacional' },
  { name: 'Experiência do Cliente', description: 'Experiência do cliente', objective: 'Atendimento e satisfação' },
  { name: 'Comercial', description: 'Área comercial', objective: 'Vendas e negócios' },
  { name: 'Financeiro', description: 'Área financeira', objective: 'Gestão financeira' },
  { name: 'Administrativo', description: 'Área administrativa', objective: 'Administração geral' },
  { name: 'Inovação e Tecnologia', description: 'Inovação e TI', objective: 'Tecnologia e inovação' },
];

export async function runBootstrapAction(companyTypeSlug: string): Promise<OrgActionResult<{ areasCreated: number }>> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  if (companyTypeSlug !== 'escritorio_juridico') {
    return { success: false, message: `Tipo de empresa "${companyTypeSlug}" ainda não suportado. Use "escritorio_juridico".` };
  }

  const { data: existing } = await ctx.supabase
    .from('org_areas')
    .select('id')
    .eq('tenant_id', ctx.tenantId)
    .limit(1);

  if (existing && existing.length > 0) {
    return { success: false, message: 'Já existem áreas cadastradas. O bootstrap só pode ser executado em organização vazia.' };
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
