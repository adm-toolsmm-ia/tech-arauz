'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface UpdateStatusResult {
  success: boolean;
  message: string;
}

export interface UpdateNotesResult {
  success: boolean;
  message: string;
}

export interface FetchProjectsWithFiltersResult {
  success: boolean;
  data?: Array<Record<string, unknown>>;
  message: string;
}

const NOTES_HTML_MAX_LENGTH = 100_000;

/**
 * Server Action: Fetch projects with optional server-side filtering.
 * Useful for large datasets where client-side filtering would be slow.
 *
 * Supports filtering by:
 * - status (array of values)
 * - priority (array of values)
 * - search (project name or espaider code, partial match)
 */
export async function fetchProjectsWithFiltersAction(
  filters?: {
    status?: string[];
    priority?: string[];
    search?: string;
  },
): Promise<FetchProjectsWithFiltersResult> {
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      message: 'Usuário não autenticado. Faça login novamente.',
    };
  }

  // Get tenant_id from profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return {
      success: false,
      message: 'Perfil não encontrado. Contate o administrador.',
    };
  }

  // Start building query
  let query = supabase
    .from('projects')
    .select(`
      *,
      schedules:project_schedules(*),
      deliveries:project_deliveries(*),
      histories:project_histories(*),
      approvers:project_approvers(*),
      budgets:project_budgets(*)
    `)
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: false });

  // Apply status filter
  if (filters?.status && filters.status.length > 0) {
    query = query.in('status', filters.status);
  }

  // Apply priority filter
  if (filters?.priority && filters.priority.length > 0) {
    query = query.in('priority', filters.priority);
  }

  // Apply search filter (partial match on name or espaider_code)
  if (filters?.search && filters.search.trim().length > 0) {
    const searchTerm = `%${filters.search}%`;
    query = query.or(`project_name.ilike.${searchTerm},espaider_code.ilike.${searchTerm}`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[fetchProjectsWithFiltersAction] error:', error);
    return {
      success: false,
      message: `Erro ao buscar projetos: ${error.message}`,
    };
  }

  return {
    success: true,
    data: data || [],
    message: `${data?.length || 0} projetos encontrados.`,
  };
}

/**
 * Server Action: update a project's status (e.g. from Kanban drag-and-drop).
 *
 * 1. Validates the authenticated user
 * 2. Checks role (blocks viewer)
 * 3. Updates the project status in the database
 * 4. Revalidates cached pages
 */
export async function updateProjectStatusAction(
  projectId: string,
  newStatus: string,
): Promise<UpdateStatusResult> {
  const supabase = await createClient();

  // 1. Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      message: 'Usuário não autenticado. Faça login novamente.',
    };
  }

  // 2. Get tenant_id and role from profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return {
      success: false,
      message: 'Perfil não encontrado. Contate o administrador.',
    };
  }

  // 3. Only admin and user roles can update status
  if (profile.role === 'viewer') {
    return {
      success: false,
      message: 'Sem permissão para alterar status. Role "viewer" é somente leitura.',
    };
  }

  // 4. Validate status value
  const validStatuses = [
    'projeto_futuro',
    'em_aprovacao',
    'em_desenvolvimento',
    'em_homologacao',
    'concluido',
    'cancelado',
    'suspenso',
  ];

  if (!validStatuses.includes(newStatus)) {
    return {
      success: false,
      message: `Status inválido: "${newStatus}". Valores aceitos: ${validStatuses.join(', ')}`,
    };
  }

  // 5. Update in database (RLS ensures tenant isolation)
  const { error: updateError } = await supabase
    .from('projects')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', projectId)
    .eq('tenant_id', profile.tenant_id);

  if (updateError) {
    console.error('[updateProjectStatusAction] error:', updateError);
    return {
      success: false,
      message: `Erro ao atualizar status: ${updateError.message}`,
    };
  }

  // 6. Revalidate pages
  revalidatePath('/projetos');
  revalidatePath('/dashboard');

  return {
    success: true,
    message: 'Status atualizado com sucesso.',
  };
}

/**
 * Server Action: update a project's notes (rich-text HTML from TipTap).
 *
 * 1. Validates the authenticated user
 * 2. Checks role (blocks viewer)
 * 3. Validates projectId (UUID) and notesHtml length
 * 4. Updates projects.notes_html in the database
 * 5. Revalidates cached pages
 */
export async function updateProjectNotesAction(
  projectId: string,
  notesHtml: string | null,
): Promise<UpdateNotesResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      message: 'Usuário não autenticado. Faça login novamente.',
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return {
      success: false,
      message: 'Perfil não encontrado. Contate o administrador.',
    };
  }

  if (profile.role === 'viewer') {
    return {
      success: false,
      message: 'Sem permissão para alterar anotações. Role "viewer" é somente leitura.',
    };
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!projectId || !uuidRegex.test(projectId)) {
    return {
      success: false,
      message: 'ID do projeto inválido.',
    };
  }

  const content = notesHtml ?? '';
  if (content.length > NOTES_HTML_MAX_LENGTH) {
    return {
      success: false,
      message: `Anotações excedem o limite de ${(NOTES_HTML_MAX_LENGTH / 1000).toFixed(0)} mil caracteres.`,
    };
  }

  const { error: updateError } = await supabase
    .from('projects')
    .update({ notes_html: content || null, updated_at: new Date().toISOString() })
    .eq('id', projectId)
    .eq('tenant_id', profile.tenant_id);

  if (updateError) {
    console.error('[updateProjectNotesAction] error:', updateError);
    return {
      success: false,
      message: `Erro ao salvar anotações: ${updateError.message}`,
    };
  }

  revalidatePath('/projetos');
  revalidatePath('/dashboard');

  return {
    success: true,
    message: 'Anotações salvas com sucesso.',
  };
}
