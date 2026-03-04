'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

// ─── Types ───

export type DocumentCategory = 'manual' | 'regra_negocio' | 'arquitetura' | 'guia';

export interface DocumentRecord {
    id: string;
    tenant_id: string;
    title: string;
    slug: string;
    content_md: string;
    category: DocumentCategory;
    author_id: string | null;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

export interface ActionResult<T = undefined> {
    success: boolean;
    message: string;
    data?: T;
}

const VALID_CATEGORIES: DocumentCategory[] = ['manual', 'regra_negocio', 'arquitetura', 'guia'];
const CONTENT_MAX_LENGTH = 500_000;

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

type AuthContextError = { ok: false; error: string };
type AuthContextSuccess = {
    ok: true;
    supabase: Awaited<ReturnType<typeof createClient>>;
    user: NonNullable<Awaited<ReturnType<Awaited<ReturnType<typeof createClient>>['auth']['getUser']>>['data']['user']>;
    profile: { tenant_id: string; role: string };
};
type AuthContext = AuthContextError | AuthContextSuccess;

async function getAuthContext(): Promise<AuthContext> {
    const supabase = await createClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return { ok: false, error: 'Usuário não autenticado. Faça login novamente.' };
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_id, role')
        .eq('id', user.id)
        .single();

    if (profileError || !profile) {
        return { ok: false, error: 'Perfil não encontrado. Contate o administrador.' };
    }

    return { ok: true, supabase, user, profile };
}

// ─── List Documents ───

export async function listDocumentsAction(filters?: {
    category?: DocumentCategory;
    search?: string;
    publishedOnly?: boolean;
}): Promise<ActionResult<DocumentRecord[]>> {
    const ctx = await getAuthContext();
    if (!ctx.ok) return { success: false, message: ctx.error };

    const { supabase, profile } = ctx;

    let query = supabase
        .from('documents')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('updated_at', { ascending: false });

    if (filters?.category) {
        query = query.eq('category', filters.category);
    }

    if (filters?.publishedOnly) {
        query = query.eq('is_published', true);
    }

    if (filters?.search?.trim()) {
        query = query.ilike('title', `%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('[listDocumentsAction] error:', error);
        return { success: false, message: `Erro ao listar documentos: ${error.message}` };
    }

    return { success: true, data: data || [], message: `${data?.length || 0} documentos.` };
}

// ─── Get Document by Slug ───

export async function getDocumentBySlugAction(
    slug: string,
): Promise<ActionResult<DocumentRecord>> {
    const ctx = await getAuthContext();
    if (!ctx.ok) return { success: false, message: ctx.error };

    const { supabase, profile } = ctx;

    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .eq('slug', slug)
        .single();

    if (error || !data) {
        return { success: false, message: 'Documento não encontrado.' };
    }

    return { success: true, data, message: 'Documento carregado.' };
}

// ─── Create Document ───

export async function createDocumentAction(input: {
    title: string;
    content_md: string;
    category: DocumentCategory;
    is_published?: boolean;
}): Promise<ActionResult<DocumentRecord>> {
    const ctx = await getAuthContext();
    if (!ctx.ok) return { success: false, message: ctx.error };

    const { supabase, user, profile } = ctx;

    if (!['admin', 'manager'].includes(profile.role)) {
        return { success: false, message: 'Sem permissão. Apenas admin/manager podem criar documentos.' };
    }

    if (!input.title || input.title.trim().length < 3) {
        return { success: false, message: 'Título deve ter ao menos 3 caracteres.' };
    }

    if (!VALID_CATEGORIES.includes(input.category)) {
        return { success: false, message: `Categoria inválida: ${input.category}` };
    }

    if (input.content_md && input.content_md.length > CONTENT_MAX_LENGTH) {
        return { success: false, message: `Conteúdo excede o limite de ${CONTENT_MAX_LENGTH / 1000}k caracteres.` };
    }

    const slug = slugify(input.title);

    const { data, error } = await supabase
        .from('documents')
        .insert({
            tenant_id: profile.tenant_id,
            title: input.title.trim(),
            slug,
            content_md: input.content_md || '',
            category: input.category,
            author_id: user.id,
            is_published: input.is_published ?? false,
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            return { success: false, message: `Já existe um documento com o slug "${slug}".` };
        }
        console.error('[createDocumentAction] error:', error);
        return { success: false, message: `Erro ao criar documento: ${error.message}` };
    }

    revalidatePath('/documentacao');
    return { success: true, data, message: 'Documento criado com sucesso.' };
}

// ─── Update Document ───

export async function updateDocumentAction(
    documentId: string,
    input: {
        title?: string;
        content_md?: string;
        category?: DocumentCategory;
        is_published?: boolean;
    },
): Promise<ActionResult<DocumentRecord>> {
    const ctx = await getAuthContext();
    if (!ctx.ok) return { success: false, message: ctx.error };

    const { supabase, profile } = ctx;

    if (!['admin', 'manager'].includes(profile.role)) {
        return { success: false, message: 'Sem permissão. Apenas admin/manager podem editar documentos.' };
    }

    if (input.title !== undefined && input.title.trim().length < 3) {
        return { success: false, message: 'Título deve ter ao menos 3 caracteres.' };
    }

    if (input.category && !VALID_CATEGORIES.includes(input.category)) {
        return { success: false, message: `Categoria inválida: ${input.category}` };
    }

    if (input.content_md && input.content_md.length > CONTENT_MAX_LENGTH) {
        return { success: false, message: `Conteúdo excede o limite de ${CONTENT_MAX_LENGTH / 1000}k caracteres.` };
    }

    const updatePayload: Record<string, unknown> = {};
    if (input.title !== undefined) {
        updatePayload.title = input.title.trim();
        updatePayload.slug = slugify(input.title);
    }
    if (input.content_md !== undefined) updatePayload.content_md = input.content_md;
    if (input.category !== undefined) updatePayload.category = input.category;
    if (input.is_published !== undefined) updatePayload.is_published = input.is_published;

    const { data, error } = await supabase
        .from('documents')
        .update(updatePayload)
        .eq('id', documentId)
        .eq('tenant_id', profile.tenant_id)
        .select()
        .single();

    if (error) {
        console.error('[updateDocumentAction] error:', error);
        return { success: false, message: `Erro ao atualizar: ${error.message}` };
    }

    revalidatePath('/documentacao');
    return { success: true, data, message: 'Documento atualizado.' };
}

// ─── Delete Document ───

export async function deleteDocumentAction(
    documentId: string,
): Promise<ActionResult> {
    const ctx = await getAuthContext();
    if (!ctx.ok) return { success: false, message: ctx.error };

    const { supabase, profile } = ctx;

    if (profile.role !== 'admin') {
        return { success: false, message: 'Sem permissão. Apenas admin pode excluir documentos.' };
    }

    const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        .eq('tenant_id', profile.tenant_id);

    if (error) {
        console.error('[deleteDocumentAction] error:', error);
        return { success: false, message: `Erro ao excluir: ${error.message}` };
    }

    revalidatePath('/documentacao');
    return { success: true, message: 'Documento excluído.' };
}
