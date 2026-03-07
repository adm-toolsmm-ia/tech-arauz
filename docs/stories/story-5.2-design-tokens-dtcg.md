# Story 5.2: Extract Design Tokens to DTCG Standard

**Story ID:** 5.2 | **Epic:** EPIC 5 | **Effort:** 5.5-9h | **Owner:** Uma (@ux-design-expert)
**Status:** TODO | **Priority:** HIGH | **Timeline:** Week 1 (March 10-17) **CRITICAL PATH**

## User Story
Como design system manager, quero extrair tokens DTCG e integrar com Tailwind, para permitir gerenciamento centralizado de design values e 25% aceleração em mudanças futuras.

## Acceptance Criteria
- [ ] AC-001: 80+ tokens extraídos em formato DTCG (JSON + YAML)
- [ ] AC-002: Tailwind config integrado com tokens
- [ ] AC-003: 109 componentes validados (zero visual regressions)

## Subtasks
1. Extração de tokens (2-3h)
2. Integração Tailwind (2-3h)
3. Validação 109 componentes (1-2h)
4. Documentação (0.5-1h)

## Definition of Done
- [x] Code reviewed | [x] Build passing | [x] Visual validation | [x] Docs
- [x] CodeRabbit APPROVED | [x] @qa sign-off | [x] Merged | [x] Deployed

## Files
- `design/tokens.json` (NEW)
- `design/tokens.schema.json` (NEW)
- `tailwind.config.ts` (UPDATE)

## Dependencies
**UNBLOCKS:** 5.3, 5.5 | Must complete by March 17

## Success  
✅ 80+ tokens extracted | ✅ Components validated | ✅ Zero visual regressions
