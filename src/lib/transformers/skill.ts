import type {
  DBProjectSkill,
  DBSkillDocument,
  ProjectSkillCategory,
  ProjectSkillKind,
  ProjectSkillStatus,
  UIProjectSkill,
  UISkillDocument,
} from '@/types/skills';

function asCategory(v: string): ProjectSkillCategory {
  const allowed: ProjectSkillCategory[] = [
    'documentation',
    'extraction',
    'research',
    'governance',
    'delivery',
    'communication',
    'technical',
    'custom',
  ];
  return (allowed.includes(v as ProjectSkillCategory) ? v : 'custom') as ProjectSkillCategory;
}

function asSkillType(v: string): ProjectSkillKind {
  const allowed: ProjectSkillKind[] = [
    'web_scrape',
    'document_extract',
    'synthesis',
    'monitoring',
    'template',
    'risk',
    'compliance',
    'custom',
  ];
  return (allowed.includes(v as ProjectSkillKind) ? v : 'custom') as ProjectSkillKind;
}

function asStatus(v: string): ProjectSkillStatus {
  return v === 'published' || v === 'archived' || v === 'draft' ? v : 'draft';
}

export function dbProjectSkillToUI(row: DBProjectSkill): UIProjectSkill {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    category: asCategory(row.category),
    skillType: asSkillType(row.skill_type),
    instructionBody: row.instruction_body || '',
    sourceUrls: row.source_urls || [],
    contextMetadata: (row.context_metadata || {}) as Record<string, unknown>,
    tags: row.tags || [],
    status: asStatus(row.status),
    owners: row.owners || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function dbSkillDocumentToUI(row: DBSkillDocument): UISkillDocument {
  return {
    id: row.id,
    skillId: row.skill_id,
    title: row.title,
    content: row.content || '',
    sourceLabel: row.source_label,
    sortOrder: row.sort_order ?? 0,
  };
}
