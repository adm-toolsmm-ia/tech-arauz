/**
 * Catálogo project_skills + skill_documents (Supabase client, RLS por tenant).
 */

import { createClient } from '@/lib/supabase/client';
import type {
  CreateProjectSkillInput,
  CreateSkillDocumentInput,
  DBProjectSkill,
  DBSkillDocument,
  UpdateProjectSkillInput,
} from '@/types/skills';

const supabase = createClient();

async function requireUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  return user;
}

export class SkillSupabaseService {
  static async listSkills(): Promise<DBProjectSkill[]> {
    await requireUser();
    const { data, error } = await supabase
      .from('project_skills')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw new Error(`Falha ao listar skills: ${error.message}`);
    return (data || []) as DBProjectSkill[];
  }

  static async createSkill(payload: CreateProjectSkillInput): Promise<DBProjectSkill> {
    const user = await requireUser();
    const row = {
      name: payload.name,
      slug: payload.slug,
      description: payload.description ?? null,
      category: payload.category,
      skill_type: payload.skill_type,
      instruction_body: payload.instruction_body,
      source_urls: payload.source_urls ?? [],
      tags: payload.tags ?? [],
      status: payload.status ?? 'draft',
      owners: payload.owners?.length ? payload.owners : [user.email || user.id],
      created_by: user.id,
      updated_by: user.id,
    };

    const { data, error } = await supabase.from('project_skills').insert([row]).select().single();

    if (error) throw new Error(`Falha ao criar skill: ${error.message}`);
    return data as DBProjectSkill;
  }

  static async updateSkill(id: string, payload: UpdateProjectSkillInput): Promise<DBProjectSkill> {
    const user = await requireUser();
    const { data, error } = await supabase
      .from('project_skills')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Falha ao atualizar skill: ${error.message}`);
    return data as DBProjectSkill;
  }

  static async deleteSkill(id: string): Promise<void> {
    await requireUser();
    const { error } = await supabase.from('project_skills').delete().eq('id', id);
    if (error) throw new Error(`Falha ao remover skill: ${error.message}`);
  }

  static async listDocuments(skillId: string): Promise<DBSkillDocument[]> {
    await requireUser();
    const { data, error } = await supabase
      .from('skill_documents')
      .select('*')
      .eq('skill_id', skillId)
      .order('sort_order', { ascending: true });

    if (error) throw new Error(`Falha ao listar documentos: ${error.message}`);
    return (data || []) as DBSkillDocument[];
  }

  static async createDocument(payload: CreateSkillDocumentInput): Promise<DBSkillDocument> {
    const user = await requireUser();

    const { data: skill, error: sErr } = await supabase
      .from('project_skills')
      .select('tenant_id')
      .eq('id', payload.skill_id)
      .single();

    if (sErr || !skill) throw new Error('Skill não encontrada');

    const row = {
      tenant_id: skill.tenant_id,
      skill_id: payload.skill_id,
      title: payload.title,
      content: payload.content,
      source_label: payload.source_label ?? null,
      mime_type: payload.mime_type ?? null,
      sort_order: payload.sort_order ?? 0,
      created_by: user.id,
      updated_by: user.id,
    };

    const { data, error } = await supabase.from('skill_documents').insert([row]).select().single();

    if (error) throw new Error(`Falha ao criar documento: ${error.message}`);
    return data as DBSkillDocument;
  }

  static async deleteDocument(id: string): Promise<void> {
    await requireUser();
    const { error } = await supabase.from('skill_documents').delete().eq('id', id);
    if (error) throw new Error(`Falha ao remover documento: ${error.message}`);
  }
}
