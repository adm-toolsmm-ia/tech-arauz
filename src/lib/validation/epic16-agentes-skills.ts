/**
 * EPIC 16 — validação estruturada (frontend) para gestão 360º de agentes, squads e skills.
 * Alinhado ao padrão Zod de `agentsValidator.ts` e às regras de produto (ADR-015 / squad só com agentes).
 */

import { z } from 'zod';

import type { ProjectSkillCategory, ProjectSkillKind, ProjectSkillStatus } from '@/types/skills';

/** Slug canônico: minúsculas, números e hífens (paridade com `isValidSlug` em agentsValidator). */
export const epic16EntitySlugSchema = z
  .string()
  .trim()
  .min(1, 'Slug é obrigatório')
  .max(100, 'Slug deve ter no máximo 100 caracteres')
  .regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífens');

export const epic16EntityNameSchema = z
  .string()
  .trim()
  .min(1, 'Nome é obrigatório')
  .max(200, 'Nome deve ter no máximo 200 caracteres');

const descriptionSchema = z
  .string()
  .max(10_000, 'Descrição muito longa')
  .optional()
  .default('');

function zodErrorToFieldMap(error: z.ZodError): Record<string, string> {
  const map: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.length ? issue.path.join('.') : '_root';
    if (!map[path]) map[path] = issue.message;
  }
  return map;
}

export function parseOutputSchemaJson(text: string): { ok: true; value: Record<string, unknown> } | { ok: false; message: string } {
  const t = text.trim();
  if (!t) return { ok: true, value: {} };
  try {
    const parsed: unknown = JSON.parse(t);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false, message: 'O schema de saída deve ser um objeto JSON' };
    }
    return { ok: true, value: parsed as Record<string, unknown> };
  } catch {
    return { ok: false, message: 'JSON inválido no schema de saída' };
  }
}

const agentEntityBaseSchema = z.object({
  name: epic16EntityNameSchema,
  slug: epic16EntitySlugSchema,
  description: z.string().max(10_000).optional().default(''),
  entityKind: z.enum(['agent', 'squad']),
  status: z.enum(['draft', 'published', 'deprecated']),
  modelTemperature: z.number().min(0, 'Temperatura entre 0 e 2').max(2, 'Temperatura entre 0 e 2'),
  modelMaxTokens: z
    .number()
    .int('Max tokens deve ser inteiro')
    .min(1, 'Max tokens deve ser pelo menos 1')
    .max(200_000, 'Max tokens acima do limite suportado'),
  outputSchemaText: z.string().default(''),
  squadMemberIds: z.array(z.string().min(1)).default([]),
  /** IDs de agentes individuais elegíveis como membros (exclui o próprio squad). */
  eligibleMemberAgentIds: z.array(z.string().min(1)).default([]),
  /**
   * Quando true (padrão), squad publicado exige ≥1 membro.
   * Desligar em telas que não carregam composição do squad (ex.: edição full-page legada).
   */
  requirePublishedSquadHasMembers: z.boolean().default(true),
});

const agentEntity360Schema = agentEntityBaseSchema.superRefine((data, ctx) => {
  const parsed = parseOutputSchemaJson(data.outputSchemaText);
  if (!parsed.ok) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: parsed.message, path: ['outputSchema'] });
  }

  if (data.entityKind !== 'squad') return;

  const invalid = data.squadMemberIds.filter((id) => !data.eligibleMemberAgentIds.includes(id));
  if (invalid.length > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Membros do squad devem ser agentes individuais listados como elegíveis',
      path: ['squadMembers'],
    });
  }

  if (
    data.requirePublishedSquadHasMembers &&
    data.status === 'published' &&
    data.squadMemberIds.length < 1
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Squad publicado precisa de pelo menos um membro',
      path: ['squadMembers'],
    });
  }
});

/** Entrada do validador (campos com `.default()` no schema são opcionais aqui). */
export type AgentEntity360Input = z.input<typeof agentEntityBaseSchema>;

export function validateAgentEntity360(input: AgentEntity360Input): {
  ok: boolean;
  fieldErrors: Record<string, string>;
  outputSchema?: Record<string, unknown>;
} {
  const result = agentEntity360Schema.safeParse(input);
  if (!result.success) {
    return { ok: false, fieldErrors: zodErrorToFieldMap(result.error) };
  }
  const parsedSchema = parseOutputSchemaJson(result.data.outputSchemaText);
  if (!parsedSchema.ok) {
    return { ok: false, fieldErrors: { outputSchema: parsedSchema.message } };
  }
  return { ok: true, fieldErrors: {}, outputSchema: parsedSchema.value };
}

const createAgentSchema = z.object({
  name: epic16EntityNameSchema,
  slug: epic16EntitySlugSchema,
  entity_kind: z.enum(['agent', 'squad']),
  model_temperature: z.number().min(0).max(2),
  model_max_tokens: z.number().int().min(1).max(4000),
});

export type CreateAgent360Input = z.infer<typeof createAgentSchema>;

export function validateCreateAgentOrSquad360(input: CreateAgent360Input): {
  ok: boolean;
  fieldErrors: Record<string, string>;
} {
  const result = createAgentSchema.safeParse(input);
  if (!result.success) {
    return { ok: false, fieldErrors: zodErrorToFieldMap(result.error) };
  }
  return { ok: true, fieldErrors: {} };
}

const projectSkillCategories = z.enum([
  'documentation',
  'extraction',
  'research',
  'governance',
  'delivery',
  'communication',
  'technical',
  'custom',
]);

const projectSkillKinds = z.enum([
  'web_scrape',
  'document_extract',
  'synthesis',
  'monitoring',
  'template',
  'risk',
  'compliance',
  'custom',
]);

const projectSkillStatuses = z.enum(['draft', 'published', 'archived']);

const sourceUrlLineSchema = z
  .string()
  .trim()
  .min(1)
  .refine(
    (u) => {
      try {
        const parsed = new URL(u);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'URL inválida (use http ou https)' },
  );

const projectSkillDraftSchema = z.object({
  name: epic16EntityNameSchema,
  slug: epic16EntitySlugSchema,
  description: z.string().max(10_000).optional().default(''),
  category: projectSkillCategories,
  skillType: projectSkillKinds,
  status: projectSkillStatuses,
  instructionBody: z.string().max(500_000).optional().default(''),
  sourceUrlLines: z.array(z.string()).default([]),
  tags: z.array(z.string().max(80)).max(50).default([]),
});

const projectSkill360Schema = projectSkillDraftSchema.superRefine((data, ctx) => {
  for (const line of data.sourceUrlLines) {
    const t = line.trim();
    if (!t) continue;
    const r = sourceUrlLineSchema.safeParse(t);
    if (!r.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: r.error.issues[0]?.message ?? 'URL inválida',
        path: ['sourceUrls'],
      });
      return;
    }
  }
});

export interface ProjectSkill360FormInput {
  name: string;
  slug: string;
  description: string;
  category: ProjectSkillCategory;
  skillType: ProjectSkillKind;
  status: ProjectSkillStatus;
  instructionBody: string;
  /** Linhas brutas do textarea (podem conter vazias). */
  sourceUrlsRaw: string;
  tagsRaw: string;
}

export function validateProjectSkill360(input: ProjectSkill360FormInput): {
  ok: boolean;
  fieldErrors: Record<string, string>;
  payload?: {
    name: string;
    slug: string;
    description: string | undefined;
    category: ProjectSkillCategory;
    skill_type: ProjectSkillKind;
    status: ProjectSkillStatus;
    instruction_body: string;
    source_urls: string[];
    tags: string[];
  };
} {
  const sourceUrlLines = input.sourceUrlsRaw.split('\n');
  const tags = input.tagsRaw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const parsed = projectSkill360Schema.safeParse({
    name: input.name,
    slug: input.slug,
    description: input.description,
    category: input.category,
    skillType: input.skillType,
    status: input.status,
    instructionBody: input.instructionBody,
    sourceUrlLines,
    tags,
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: zodErrorToFieldMap(parsed.error) };
  }

  const urls = parsed.data.sourceUrlLines.map((l) => l.trim()).filter(Boolean);

  return {
    ok: true,
    fieldErrors: {},
    payload: {
      name: parsed.data.name.trim(),
      slug: parsed.data.slug.trim(),
      description: parsed.data.description.trim() || undefined,
      category: parsed.data.category as ProjectSkillCategory,
      skill_type: parsed.data.skillType as ProjectSkillKind,
      status: parsed.data.status,
      instruction_body: parsed.data.instructionBody,
      source_urls: urls,
      tags: parsed.data.tags,
    },
  };
}

export function validateSkillDocumentAttach(title: string): { ok: boolean; message?: string } {
  const s = title.trim();
  if (!s) return { ok: false, message: 'Título do documento é obrigatório' };
  if (s.length > 500) return { ok: false, message: 'Título muito longo (máx. 500 caracteres)' };
  return { ok: true };
}
