/**
 * Catálogo de skills de projeto (tabela project_skills) — contexto para gestão / TI.
 */

export type ProjectSkillCategory =
  | 'documentation'
  | 'extraction'
  | 'research'
  | 'governance'
  | 'delivery'
  | 'communication'
  | 'technical'
  | 'custom';

export type ProjectSkillKind =
  | 'web_scrape'
  | 'document_extract'
  | 'synthesis'
  | 'monitoring'
  | 'template'
  | 'risk'
  | 'compliance'
  | 'custom';

export type ProjectSkillStatus = 'draft' | 'published' | 'archived';

export interface DBProjectSkill {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  skill_type: string;
  instruction_body: string;
  source_urls: string[];
  context_metadata: Record<string, unknown>;
  tags: string[];
  status: ProjectSkillStatus;
  owners: string[];
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface UIProjectSkill {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ProjectSkillCategory;
  skillType: ProjectSkillKind;
  instructionBody: string;
  sourceUrls: string[];
  contextMetadata: Record<string, unknown>;
  tags: string[];
  status: ProjectSkillStatus;
  owners: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DBSkillDocument {
  id: string;
  tenant_id: string;
  skill_id: string;
  title: string;
  content: string;
  source_label: string | null;
  mime_type: string | null;
  sort_order: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface UISkillDocument {
  id: string;
  skillId: string;
  title: string;
  content: string;
  sourceLabel: string | null;
  sortOrder: number;
}

export interface CreateProjectSkillInput {
  name: string;
  slug: string;
  description?: string;
  category: ProjectSkillCategory;
  skill_type: ProjectSkillKind;
  instruction_body: string;
  source_urls?: string[];
  tags?: string[];
  status?: ProjectSkillStatus;
  owners?: string[];
}

export interface UpdateProjectSkillInput extends Partial<CreateProjectSkillInput> {}

export interface CreateSkillDocumentInput {
  skill_id: string;
  title: string;
  content: string;
  source_label?: string;
  mime_type?: string;
  sort_order?: number;
}
