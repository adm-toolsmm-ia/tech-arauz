import { describe, expect, it } from 'vitest';

import {
  parseOutputSchemaJson,
  validateAgentEntity360,
  validateCreateAgentOrSquad360,
  validateProjectSkill360,
  validateSkillDocumentAttach,
} from '../epic16-agentes-skills';

describe('epic16-agentes-skills', () => {
  it('parseOutputSchemaJson accepts empty object text', () => {
    expect(parseOutputSchemaJson('')).toEqual({ ok: true, value: {} });
    expect(parseOutputSchemaJson('  {}  ')).toEqual({ ok: true, value: {} });
  });

  it('parseOutputSchemaJson rejects arrays', () => {
    expect(parseOutputSchemaJson('[1]').ok).toBe(false);
  });

  it('validateAgentEntity360 blocks published squad without members', () => {
    const r = validateAgentEntity360({
      name: 'S',
      slug: 's',
      description: '',
      entityKind: 'squad',
      status: 'published',
      modelTemperature: 0.7,
      modelMaxTokens: 1000,
      outputSchemaText: '{}',
      squadMemberIds: [],
      eligibleMemberAgentIds: ['a1'],
      requirePublishedSquadHasMembers: true,
    });
    expect(r.ok).toBe(false);
    expect(r.fieldErrors.squadMembers).toBeTruthy();
  });

  it('validateAgentEntity360 rejects invalid member ids for squad', () => {
    const r = validateAgentEntity360({
      name: 'S',
      slug: 'squad-x',
      description: '',
      entityKind: 'squad',
      status: 'draft',
      modelTemperature: 0.7,
      modelMaxTokens: 1000,
      outputSchemaText: '{}',
      squadMemberIds: ['evil'],
      eligibleMemberAgentIds: ['good'],
      requirePublishedSquadHasMembers: true,
    });
    expect(r.ok).toBe(false);
    expect(r.fieldErrors.squadMembers).toBeTruthy();
  });

  it('validateCreateAgentOrSquad360 enforces slug pattern', () => {
    const r = validateCreateAgentOrSquad360({
      name: 'A',
      slug: 'Bad_Slug',
      entity_kind: 'agent',
      model_temperature: 0.5,
      model_max_tokens: 1000,
    });
    expect(r.ok).toBe(false);
    expect(r.fieldErrors.slug).toBeTruthy();
  });

  it('validateProjectSkill360 validates http URLs', () => {
    const r = validateProjectSkill360({
      name: 'Skill',
      slug: 'skill',
      description: '',
      category: 'documentation',
      skillType: 'custom',
      status: 'draft',
      instructionBody: '',
      sourceUrlsRaw: 'not-a-url',
      tagsRaw: '',
    });
    expect(r.ok).toBe(false);
    expect(r.fieldErrors.sourceUrls).toBeTruthy();
  });

  it('validateSkillDocumentAttach requires title', () => {
    expect(validateSkillDocumentAttach('   ').ok).toBe(false);
    expect(validateSkillDocumentAttach('Ok').ok).toBe(true);
  });
});
