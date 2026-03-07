# Story 5.2 — Extract Design Tokens to DTCG Standard

**Story ID:** 5.2
**Epic:** EPIC 5 — Foundation Phase: Database & Frontend Design System
**Sprint:** Março 10-24, 2026
**Agente:** @ux-design-expert (Uma)
**Esforço:** 5.5-9h
**Prioridade:** Alta
**Status:** TODO

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

### AC-001: Arquivo de Tokens DTCG Criado e Completo
- [ ] Arquivo: `design/tokens.json` (W3C Design Token Format)
  - [ ] Estrutura DTCG válida com `$schema`, `$metadata`, groups
  - [ ] Mínimo 80 tokens extraídos
  - [ ] Zero hardcoded values em componentes (migrará em Phase 2)

- [ ] Categorias de Tokens:
  - [ ] **Colors** (30+ tokens)
    - [ ] Primárias: `primary-50`, `primary-100`, ..., `primary-900`
    - [ ] Secundárias: `secondary-50`, `secondary-100`, ..., `secondary-900`
    - [ ] Semânticas: `success`, `warning`, `error`, `info`
    - [ ] Grayscale: `gray-50`, `gray-100`, ..., `gray-900`

  - [ ] **Typography** (15+ tokens)
    - [ ] Font families: `fontFamily-primary`, `fontFamily-mono`
    - [ ] Font sizes: `fontSize-xs`, `fontSize-sm`, `fontSize-base`, ..., `fontSize-4xl`
    - [ ] Font weights: `fontWeight-normal`, `fontWeight-semibold`, `fontWeight-bold`
    - [ ] Line heights: `lineHeight-tight`, `lineHeight-normal`, `lineHeight-relaxed`

  - [ ] **Spacing/Sizing** (20+ tokens)
    - [ ] 8px grid: `spacing-0.5`, `spacing-1`, `spacing-2`, ..., `spacing-16`
    - [ ] Sizes: `size-xs`, `size-sm`, `size-md`, `size-lg`, `size-xl`

  - [ ] **Border Radius** (6+ tokens)
    - [ ] `borderRadius-none`, `borderRadius-sm`, `borderRadius-md`, `borderRadius-lg`, `borderRadius-full`

  - [ ] **Shadows** (8+ tokens)
    - [ ] `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`
    - [ ] Variações (cor, blur, spread)

- [ ] Validação de Tokens:
  - [ ] `npm run validate-tokens` (script criado)
  - [ ] Arquivo valida contra `tokens.schema.json`
  - [ ] Nenhum token duplicado ou conflitante

### AC-002: Tailwind Config Atualizado com Tokens
- [ ] Arquivo: `tailwind.config.ts` integrando tokens JSON
  - [ ] Load: `const tokens = require('./design/tokens.json')`
  - [ ] Theme colors estendidos de tokens
  - [ ] Theme spacing estendido de tokens
  - [ ] Theme typography estendida de tokens

- [ ] Configuração Funcional:
  - [ ] Build sem warnings: `npm run build` ✅
  - [ ] Dev server inicia: `npm run dev` ✅
  - [ ] Nenhum color hardcoded no config
  - [ ] Testes: `npm test` passam

- [ ] Compatibilidade:
  - [ ] Todos os valores Tailwind pré-existentes mapeados para tokens
  - [ ] Nenhum valor "mágico" permanece no config
  - [ ] Fallbacks definidos se token não existir (graceful degradation)

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

### Subtask 5.2.1: Extração de Tokens (2-3h)
- [ ] Auditoria de componentes:
  - [ ] Varrer `src/components/` buscando hardcoded colors
  - [ ] Listar todas as cores usadas (deduplicate)
  - [ ] Listar font sizes, weights, families
  - [ ] Listar spacing values (padding, margin, gap)
  - [ ] Listar border radius values
  - [ ] Listar shadow definitions

- [ ] Criar estrutura DTCG:
  - [ ] Novo arquivo: `design/tokens.json`
  - [ ] Estrutura base com `$schema`, `$metadata`
  - [ ] Grupos: colors, typography, spacing, borderRadius, shadows
  - [ ] Naming convention: `{category}-{name}`

- [ ] Preencher tokens:
  - [ ] Colors (30+): preencher rgba/hex valores
  - [ ] Typography (15+): font families, sizes, weights
  - [ ] Spacing (20+): 8px grid (0.5 → 16 = 0 → 64px)
  - [ ] Border Radius (6+): valores padrão
  - [ ] Shadows (8+): box-shadow values

- [ ] Validação estrutural:
  - [ ] JSON válido (sem syntax errors)
  - [ ] Valores bem-formados (colors em hex/rgb, numbers em units)
  - [ ] Sem duplicatas

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
