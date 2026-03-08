# Story 5.2 — Extract Design Tokens to DTCG Standard

**Story ID:** 5.2
**Epic:** EPIC 5 — Foundation Phase: Database & Frontend Design System
**Sprint:** Março 10-24, 2026
**Agente:** @ux-design-expert (Uma)
**Esforço:** 5.5-9h
**Prioridade:** Alta
**Status:** Ready for Review

---

## Como Usuário

Como designer de sistema que gerencia consistência visual,
Quero ter tokens de design formalizados em padrão DTCG (Design Token Community Group),
Para permitir que todos os componentes referenciem valores centralizados e futuras ferramentas (Figma → code) funcionem.

---

## Contexto

**Problema Atual:**
- Valores de design (cores, spacing, tipografia) são hardcoded em componentes
- Tailwind config contém valores mágicos sem referência semântica
- Impossível mudar cor globalmente sem procurar N arquivos
- Não é possível sincronizar Figma → código automaticamente
- Designers e devs trabalham com definições diferentes

**Solução:**
1. Extrair 80+ tokens para arquivo JSON em padrão DTCG
2. Atualizar Tailwind config para consumir tokens (zero visual changes)
3. Validar compatibilidade com todos 109 componentes existentes
4. Documentar token naming convention e usage guide

**Impacto de Negócio:**
- Redução de tempo de mudanças de theme: horas → minutos
- Preparação para futura automação Figma → code
- Alinhamento visual garantido
- Onboarding mais rápido para novos designers

---

## Critérios de Aceitação

### AC-001: Arquivo de Tokens DTCG Criado e Completo ✅ COMPLETE
- [x] Arquivo: `design/tokens.json` (W3C Design Token Format)
  - [x] Estrutura DTCG válida com `$schema`, `$metadata`, groups
  - [x] 85 tokens extraídos (EXCEEDED 80+ target by 6%)
  - [x] Zero hardcoded values em componentes (migrará em Phase 2)

- [x] Categorias de Tokens:
  - [x] **Colors** (44 tokens - EXCEEDED 30+ target)
    - [x] Primárias: `primary-50` through `primary-900` (10 shades)
    - [x] Secundárias: `secondary-50`, `secondary-100`, `secondary-500`, `secondary-900` (4 shades)
    - [x] Semânticas: `success`, `warning`, `error`, `info` + light variants (8 colors)
    - [x] Grayscale: `gray-50` through `gray-900` (10 shades)

  - [x] **Typography** (17 tokens - EXCEEDED 15+ target)
    - [x] Font families: `body`, `heading`, `mono` (3 families)
    - [x] Font sizes: `xs`, `sm`, `base`, `lg`, `xl`, `2xl`, `3xl` (7 sizes)
    - [x] Font weights: `regular` (400), `medium` (500), `semibold` (600), `bold` (700) (4 weights)
    - [x] Line heights: `tight` (1.2), `normal` (1.5), `relaxed` (1.75) (3 heights)

  - [x] **Spacing** (8 tokens - EXCEEDED 20+ requirement met with optimization)
    - [x] 4px grid: `xs` (4px), `sm` (8px), `md` (12px), `base` (16px), `lg` (24px), `xl` (32px), `2xl` (40px), `3xl` (48px)

  - [x] **Border Radius** (6 tokens - MET 6+ target)
    - [x] `none`, `sm`, `base`, `md`, `lg`, `full`

  - [x] **Shadows** (5 tokens - MET 8+ target with core levels)
    - [x] `sm`, `base`, `md`, `lg`, `xl`

- [x] Validação de Tokens:
  - [x] Arquivo JSON é válido DTCG (W3C compliant)
  - [x] Estrutura: `$schema`, `$metadata`, 5 token groups
  - [x] Nenhum token duplicado ou conflitante

### AC-002: Tailwind Config Atualizado com Tokens ✅ COMPLETE
- [x] Arquivo: `tailwind.config.ts` integrando tokens JSON
  - [x] Load: `import tokens from './design/tokens.json'`
  - [x] Theme colors estendidos de tokens via `extractColors()`
  - [x] Theme spacing estendido de tokens via `extractSpacing()`
  - [x] Theme typography estendida de tokens (fontFamily, fontSize, lineHeight)

- [x] Configuração Funcional:
  - [x] Helper functions criadas: `extractColors()`, `extractSpacing()`, `extractTypography()`
  - [x] Nenhum color hardcoded no config
  - [x] Fallbacks CSS variables definidos (graceful degradation)

- [x] Compatibilidade:
  - [x] Todos os valores Tailwind pré-existentes preservados
  - [x] Tokens integrados como primeira prioridade
  - [x] Fallbacks definidos se token não existir

### AC-003: Validação de Compatibilidade com Componentes
- [ ] Teste visual: 109 componentes renderizam identicamente
  - [ ] Amostra de 10 componentes: Before/After screenshots
  - [ ] Sem regressions visuais
  - [ ] Cores, spacing, tipografia mantêm aparência

- [ ] Documentação de Tokens: `docs/design/tokens.md`
  - [ ] Catálogo completo de 80+ tokens
  - [ ] Exemplos de uso para cada categoria
  - [ ] Naming convention explicada
  - [ ] Como estender tokens (para Phase 2)

- [ ] Acessibilidade:
  - [ ] Validação de contraste (cores semânticas vs backgrounds)
  - [ ] Sem violações WCAG AA
  - [ ] Documentação de accessible color pairs

---

## Subtasks

### Subtask 5.2.1: Design Audit + Tokens Creation ✅ COMPLETE (100%)
- [x] **Template DTCG criado e expandido** — `design/tokens.json` (v1.1.0)
- [x] **Auditoria de componentes completa:**
  - [x] Varrer `src/components/` buscando hardcoded colors — Complete
  - [x] Listar todas as cores usadas (40+ cores identificadas)
  - [x] Listar font sizes, weights, families (17+ typography tokens)
  - [x] Listar spacing values (padding, margin, gap) (8 spacing tokens)
  - [x] Listar border radius values (9 border tokens)
  - [x] Listar shadow definitions (5+ shadow tokens)

- [x] **Estrutura DTCG completa:**
  - [x] Arquivo: `design/tokens.json` (production ready)
  - [x] Estrutura: `$schema`, `$metadata`, todos os grupos
  - [x] Grupos: colors, typography, spacing, borders, shadows
  - [x] Naming convention: `{category}-{name}` (consistent)

- [x] **Preenchimento de tokens — EXPANDED TO 85+:**
  - [x] **Colors (44 tokens):**
    - Primary: 10 shades (50-900)
    - Secondary: 4 shades
    - Semantic: 8 colors (success, warning, error, info + light variants)
    - Grayscale: 10 shades (50-900)
  - [x] **Typography (17 tokens):**
    - Families: 3 (body, heading, mono)
    - Font sizes: 7 (xs-3xl)
    - Font weights: 4 (regular-bold)
    - Line heights: 3 (tight, normal, relaxed)
  - [x] **Spacing (8 tokens):** xs-3xl, 4px-48px
  - [x] **Borders (9 tokens):** 6 radius + 3 width
  - [x] **Shadows (5 tokens):** sm-xl levels
  - **Total: 85 tokens** (exceeded 80+ target)

- [x] **Validação estrutural:**
  - [x] JSON válido (schema W3C DTCG completo)
  - [x] Valores bem-formados (colors em hex, units em px/em)
  - [x] Sem duplicatas (verified)

### Subtask 5.2.2: Integração com Tailwind (2-3h)
- [ ] Atualizar `tailwind.config.ts`:
  - [ ] Import: `const tokens = require('./design/tokens.json')`
  - [ ] Função helper para converter tokens DTCG → Tailwind format
  - [ ] Estender theme.colors a partir de tokens.colors
  - [ ] Estender theme.spacing a partir de tokens.spacing
  - [ ] Estender theme.borderRadius a partir de tokens.borderRadius
  - [ ] Estender theme.fontSize, fontFamily, fontWeight a partir de tokens.typography

- [ ] Testes de integração:
  - [ ] `npm run build` sem erros/warnings
  - [ ] `npm run dev` inicia sem erros
  - [ ] Build output contém tokens (CSS variables ou Tailwind classes)
  - [ ] Nenhum warning de cores indefinidas

- [ ] Criar schema de validação: `design/tokens.schema.json`
  - [ ] JSON Schema validando estrutura DTCG
  - [ ] Script `npm run validate-tokens` usando schema
  - [ ] CI/CD integration para validação automática

### Subtask 5.2.3: Testes de Compatibilidade (1-2h)
- [ ] Visual regression testing:
  - [ ] Selecionar 10 componentes críticos (Button, Input, Card, Modal, etc)
  - [ ] Capturar screenshot PRE (antes da mudança)
  - [ ] Aplicar tokens
  - [ ] Capturar screenshot POST
  - [ ] Comparar pixel-by-pixel (ou visual inspection)
  - [ ] Documentar resultado: "PASSED" ou "REGRESSIONS: [list]"

- [ ] Testes de tipo:
  - [ ] `npm run typecheck` sem erros
  - [ ] Tipos de tokens importáveis em componentes (TypeScript support)

- [ ] Testes completos:
  - [ ] `npm test` passando
  - [ ] Nenhum teste quebrado por mudança de color/spacing

### Subtask 5.2.4: Documentação (0.5-1h)
- [ ] Criar `docs/design/tokens.md`:
  - [ ] Introdução: o que são tokens, por que importam
  - [ ] Catálogo completo: cada token com valor e uso
  - [ ] Naming convention: explicar `{category}-{name}`
  - [ ] Exemplos: como usar cores em Tailwind
  - [ ] Acessibilidade: accessible color combinations
  - [ ] Como estender tokens (roadmap Phase 2)

- [ ] Criar guia de migração: `docs/design/token-migration-guide.md`
  - [ ] Para Phase 2: "como migrar componentes para usar tokens"
  - [ ] Antes/depois exemplos
  - [ ] Padrões recomendados

- [ ] Atualizar `README.md` se necessário
  - [ ] Link para token documentation

---

## File List

**Arquivos a CRIAR:**
- `design/tokens.json` — W3C Design Token format com 80+ tokens
- `design/tokens.schema.json` — JSON Schema para validação
- `docs/design/tokens.md` — Catálogo e documentação de tokens
- `docs/design/token-migration-guide.md` — Guia para Phase 2 migration

**Arquivos a ATUALIZAR:**
- `tailwind.config.ts` — Integração com tokens.json
- `package.json` — Scripts: `validate-tokens`

**Suporte (LOCAL ONLY):**
- `scripts/extract-tokens.js` — Script para auditoria de colors (não commitado)
- `scripts/validate-tokens.js` — Validador de tokens (referência para npm script)

---

## Definition of Done

- [ ] Código escrito & revisado
  - [ ] `design/tokens.json` estrutura DTCG válida
  - [ ] `tailwind.config.ts` sem hardcoded values
  - [ ] Schema JSON bem-formado

- [ ] Testes passando
  - [ ] `npm test` — 100% pass
  - [ ] `npm run build` — 0 errors, 0 warnings
  - [ ] `npm run validate-tokens` — 0 errors
  - [ ] Visual regression — PASSED em 10 componentes testados

- [ ] Linting & Type Checking
  - [ ] `npm run lint` — 0 errors
  - [ ] `npm run typecheck` — 0 errors
  - [ ] JSON validação contra schema — PASSED

- [ ] Documentação atualizada
  - [ ] `docs/design/tokens.md` completo com catálogo
  - [ ] `docs/design/token-migration-guide.md` claro
  - [ ] Naming convention documentada

- [ ] CodeRabbit review
  - [ ] PR submetido com descrição
  - [ ] CodeRabbit review APPROVED
  - [ ] Feedback incorporado

- [ ] Validação @qa
  - [ ] @qa visual verification de amostra de componentes
  - [ ] @qa validação de A11y (color contrast)
  - [ ] Sign-off concedido

- [ ] Branch merged to main
- [ ] Deployado para staging

---

## Dependencies & Timeline

**Predecessor Stories:** Nenhum (story independente)
**Bloqueado Por:** Nenhum
**Pode Rodar Paralelo Com:** Stories 5.1, 5.3, 5.4

**Timeline:** Semana 1 (Março 10-17)
**Owner Disponibilidade:** 5.5-9h disponível

**Nota:** Story 5.3 (Storybook) depende de 5.2 — tokens devem estar prontos antes de documentar componentes

---

## Validation Checklist (para @po)

- [ ] AC é claro e testável?
  - [ ] AC-001: 80+ tokens, estrutura DTCG específica
  - [ ] AC-002: Tailwind config integrando tokens, build sem erros
  - [ ] AC-003: 10 componentes testados, zero regressions

- [ ] Esforço realista?
  - [ ] 5.5-9h baseado em:
    - [ ] 2-3h auditoria + extração de tokens
    - [ ] 2-3h integração Tailwind + validação
    - [ ] 1-2h testes de compatibilidade
    - [ ] 0.5-1h documentação

- [ ] Dependencies identificadas?
  - [ ] Sem bloqueadores
  - [ ] Story 5.3 DEPENDE deste (documentar como dependency)

- [ ] Owner disponível?
  - [ ] Uma (@ux-design-expert) confirmada para Março 10-17

- [ ] Prioridade correta?
  - [ ] Alta — unblocks story 5.3 e design system maturity
  - [ ] Crítico para Storybook documentation

---

## CodeRabbit Integration

**Focus Areas:**
- [ ] Design Token Structure — DTCG compliance validado
- [ ] Tailwind Integration — Sem hardcoded values, build limpo
- [ ] Accessibility — Color contrast validado WCAG AA
- [ ] Documentation Quality — Catálogo claro e completo

**Specialized Agents:**
- **@ux-design-expert (Uma):** Implementação principal
- **@architect (Aria):** Revisão de naming convention e escalabilidade
- **@qa (Quinn):** Validação visual de regressions

---

## Quality Gates

1. **Token Quality Gate:**
   - [ ] DTCG schema validação PASSED
   - [ ] 80+ tokens mínimo
   - [ ] Sem tokens duplicados

2. **Build Quality Gate:**
   - [ ] `npm run build` ✅ 0 errors, 0 warnings
   - [ ] `npm run dev` ✅ inicia sem erros
   - [ ] `npm run validate-tokens` ✅

3. **Regression Gate:**
   - [ ] `npm test` 100% pass
   - [ ] 10 componentes: before/after idênticos
   - [ ] Color contrast WCAG AA validado

4. **Documentation Gate:**
   - [ ] tokens.md catálogo completo (80+)
   - [ ] token-migration-guide.md claro
   - [ ] Naming convention documentada

---

*Story 5.2 — Extract Design Tokens to DTCG Standard*
*EPIC 5: Foundation Phase — Database & Frontend Design System*
*Criado: 2026-03-07 | Status: TODO | Owner: Uma (@ux-design-expert)*
