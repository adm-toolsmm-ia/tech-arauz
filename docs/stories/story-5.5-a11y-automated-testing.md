# Story 5.5 — A11y Automated Testing & Manual Audit

**Story ID:** 5.5
**Epic:** EPIC 5 — Foundation Phase: Database & Frontend Design System
**Sprint:** Março 24-31, 2026
**Agente:** @ux-design-expert (Uma)
**Esforço:** 6-8h
**Prioridade:** Média-Alta
**Status:** TODO

---

## Como Usuário

Como product manager que precisa cumprir WCAG AA compliance,
Quero ter testes automatizados de acessibilidade (jest-axe) + auditoria manual (NVDA),
Para garantir que plataforma é acessível a usuários com deficiência e atende regulamentações.

---

## Contexto

**Problema Atual:**
- Nenhum teste automatizado de acessibilidade
- Componentes podem ter violations (ARIA attributes, color contrast)
- Usuários com deficiência não podem navegar efetivamente
- Sem baseline de compliance WCAG AA

**Solução:**
1. Integrar jest-axe para testes automatizados em CI
2. 20+ testes de acessibilidade para componentes core
3. Auditoria manual com NVDA (screen reader Windows)
4. Validação de color contrast em todas as cores
5. Documentar findings e plano de remediação para Phase 2

**Impacto de Negócio:**
- Compliance com WCAG AA (regulamentação)
- Inclusividade: acesso a usuários com deficiência visual, motor, cognitiva
- Redução de risco legal (LGPD, Lei de Acessibilidade BR)
- Melhoria geral de UX (a11y beneficia todos)

---

## Critérios de Aceitação

### AC-001: jest-axe Integration Completa
- [ ] Package Installation:
  - [ ] `jest-axe` instalado: `npm install -D jest-axe`
  - [ ] Setup file: `jest.setup.ts` configurado com axe imports
  - [ ] Test files: `src/components/**/*.a11y.test.tsx` (20+ arquivos)

- [ ] Test Implementation:
  - [ ] 20+ componentes têm testes de acessibilidade
  - [ ] Cada test:
    - [ ] Renderiza componente
    - [ ] Chama `axe(container)`
    - [ ] Asserta `expect(results).toHaveNoViolations()`
    - [ ] Documenta violation se esperado (com reason)

  - [ ] Exemplo test:
    ```typescript
    import { axe, toHaveNoViolations } from 'jest-axe';
    import { render, screen } from '@testing-library/react';
    import { Button } from './Button';

    expect.extend(toHaveNoViolations);

    describe('Button A11y', () => {
      it('should have no accessibility violations', async () => {
        const { container } = render(
          <Button aria-label="Click me">Action</Button>
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });
    });
    ```

- [ ] CI Integration:
  - [ ] Command: `npm test -- --testPathPattern=a11y`
  - [ ] Roda em GitHub Actions
  - [ ] Bloqueia merge se violações encontradas
  - [ ] Report em PR comment

- [ ] Coverage Validation:
  - [ ] 20+ componentes core têm testes
  - [ ] Todos testes passam (0 violations)
  - [ ] Violations esperadas documentadas (com reason)

### AC-002: WCAG AA Manual Audit Completo
- [ ] **NVDA Testing** (Screen Reader — Windows):
  - [ ] Ferramenta: NVDA (free, open source)
  - [ ] 5+ páginas testadas:
    - [ ] Login page
    - [ ] Dashboard
    - [ ] Project list
    - [ ] Project detail
    - [ ] Form submission

  - [ ] Navegação testada:
    - [ ] Tab order: lógico e intuitivo
    - [ ] Focus management: visível e previsível
    - [ ] Headings: hierarquia correta (h1, h2, h3)
    - [ ] Links: texto descritivo (não "click here")
    - [ ] Form fields: labels associadas, error messages
    - [ ] Buttons: acessíveis com Enter/Space
    - [ ] Modal/dialog: focus trap, close accessible

  - [ ] Report: `docs/accessibility/nvda-audit-2026-03-07.md`
    - [ ] Página por página
    - [ ] Violations encontradas (se houver)
    - [ ] Sugestões de fix

- [ ] **Color Contrast Validation:**
  - [ ] Ferramenta: WebAIM Contrast Checker ou jest-axe
  - [ ] Validação de todos os color tokens:
    - [ ] Text colors vs backgrounds
    - [ ] Link colors vs backgrounds
    - [ ] Disabled state colors (devem ser visíveis)
    - [ ] Semantic colors (success, warning, error, info)

  - [ ] Targets:
    - [ ] Normal text: 4.5:1 ratio (WCAG AA)
    - [ ] Large text (18pt+): 3:1 ratio
    - [ ] UI components: 3:1 ratio

  - [ ] Report: Matriz de color combinations validadas
    - [ ] Todas as combinações em `design/tokens.json`
    - [ ] Status: ✅ WCAG AA ou ❌ NEEDS FIX
    - [ ] Refactoring plan se violações

- [ ] **Keyboard Navigation:**
  - [ ] Teste sem mouse:
    - [ ] Tab para navegar
    - [ ] Enter/Space para ativar botões
    - [ ] Arrow keys para dropdowns/menus
    - [ ] Escape para fechar modals

  - [ ] Itens testados:
    - [ ] 5 páginas principais
    - [ ] Todos os componentes interativos
    - [ ] Forms com validação
    - [ ] Dropdowns e modals

  - [ ] Status: Tudo navegável via keyboard

- [ ] **WCAG AA Audit Report:**
  - [ ] Arquivo: `docs/accessibility/wcag-aa-audit-2026-03-07.md`
    - [ ] Sumário executivo: status geral
    - [ ] Critérios WCAG AA testados (subset)
    - [ ] Findings: violations encontradas
    - [ ] Remediação: plano para Phase 2
    - [ ] Screenshots de problemas (se houver)

### AC-003: Documentação de Acessibilidade
- [ ] Developer Guide: `docs/accessibility/component-a11y-guide.md`
  - [ ] **Introdução:** O que é WCAG, por que importa
  - [ ] **Componentes Acessíveis:**
    - [ ] Button: role, aria-label, keyboard support
    - [ ] Input: label association, type, aria-required
    - [ ] Modal: focus trap, close accessible, role=dialog
    - [ ] Dropdown: role=listbox, keyboard (arrow keys)
    - [ ] Form: fieldset, legend, error association
    - [ ] Link: href, descriptive text
    - [ ] Image: alt text ou aria-hidden se decorativo

  - [ ] **Padrões Recomendados:**
    - [ ] Sempre: `<label htmlFor="id">` para inputs
    - [ ] Sempre: descriptive link text (não "click here")
    - [ ] Sempre: color não é o único indicador
    - [ ] Sempre: sufficient color contrast
    - [ ] Sempre: keyboard accessible (tab, enter, arrow keys)

  - [ ] **Common Mistakes:**
    - [ ] Missing labels em inputs
    - [ ] divs como buttons (sem role/tabindex)
    - [ ] Color-only status indicators
    - [ ] Auto-playing audio/video
    - [ ] Flashing content (>3Hz)

  - [ ] **Testing Checklist:**
    - [ ] Can I navigate with keyboard only?
    - [ ] Are all colors contrasting sufficiently?
    - [ ] Does content make sense without CSS?
    - [ ] Do images have alt text?
    - [ ] Are form errors descriptive?

- [ ] **Color Palette Documentation:**
  - [ ] Arquivo: `docs/accessibility/accessible-colors.md`
    - [ ] Tabela de color combinations validadas
    - [ ] Quais combinações são safe (WCAG AA)
    - [ ] Quais precisam evitar
    - [ ] Exemplos visuais

- [ ] **Known Issues & Roadmap:**
  - [ ] Arquivo: `docs/accessibility/roadmap.md`
    - [ ] Issues encontrados em auditoria
    - [ ] Severidade (critical, major, minor)
    - [ ] Plano de fix (Phase 2+)
    - [ ] Dependencies (ex: "fix após refactor de theme")

---

## Subtasks

### Subtask 5.5.1: jest-axe Setup (2-2.5h)
- [ ] Instalação:
  - [ ] `npm install -D jest-axe`
  - [ ] Verificar que jest configurado (package.json)

- [ ] Setup em `jest.setup.ts`:
  - [ ] Import jest-axe
  - [ ] Extend expect com `toHaveNoViolations()`
  - [ ] Configure axe (optional): rules, checks

- [ ] Criar testes para 20 componentes:
  - [ ] Estrutura padrão:
    ```typescript
    import { axe } from 'jest-axe';

    describe('ComponentName A11y', () => {
      it('should have no a11y violations', async () => {
        const { container } = render(<Component />);
        expect(await axe(container)).toHaveNoViolations();
      });

      it('should be keyboard navigable', () => {
        render(<Component />);
        // Tab, navigate, assert focus
      });
    });
    ```

  - [ ] Para cada componente:
    - [ ] 1-2 testes de axe (default + variant)
    - [ ] 1 teste de keyboard navigation (se aplicável)
    - [ ] Total: 2-3 testes por componente

  - [ ] Componentes: Button, Input, Modal, Dropdown, Form, Link, Card, Table, etc.

- [ ] Integração em CI:
  - [ ] Script em `package.json`: `npm run test:a11y` = `jest --testPathPattern=a11y`
  - [ ] Adicionar a `.github/workflows/test.yml` (ou criar workflow novo)
  - [ ] Roda em cada PR

- [ ] Validação:
  - [ ] `npm run test:a11y` executa
  - [ ] 20+ testes passam
  - [ ] Nenhuma violation encontrada (ou documentada)

### Subtask 5.5.2: Manual WCAG Audit (2.5-3h)
- [ ] Setup NVDA:
  - [ ] Download NVDA (free, GitHub releases)
  - [ ] Instalar no Windows
  - [ ] Configurar language pt-BR (se disponível)
  - [ ] Start dev server: `npm run dev`

- [ ] Testar 5 páginas principais:
  - [ ] Page 1: Login
    - [ ] Renderiza sem erros
    - [ ] Formulário acessível (labels, inputs)
    - [ ] Submit button acessível
    - [ ] Error messages anunciadas

  - [ ] Page 2: Dashboard
    - [ ] Header navigável
    - [ ] Charts têm alt text/descriptions
    - [ ] Tables têm headers (th)
    - [ ] Cards lidos corretamente

  - [ ] Page 3: Project List
    - [ ] Projeto cards navigáveis
    - [ ] Links descritivos
    - [ ] Pagination acessível
    - [ ] Sorting/filtering acessível

  - [ ] Page 4: Project Detail
    - [ ] Tabs navegáveis (arrow keys)
    - [ ] Modal acessível (se houver)
    - [ ] Form fields com labels
    - [ ] Status indicators (não só cores)

  - [ ] Page 5: Form Submission
    - [ ] Todos inputs com labels
    - [ ] Validation messages associadas
    - [ ] Success/error messages
    - [ ] Focus após envio

- [ ] Documentar findings:
  - [ ] Para cada página:
    - [ ] ✅ OK / ⚠️ ISSUE / ❌ CRITICAL
    - [ ] Descrição do problema
    - [ ] Impacto (ex: "usuários cegos não conseguem enviar formulário")
    - [ ] Suggestão de fix

- [ ] Color Contrast Validation:
  - [ ] Ferramenta: WCAG Color Contrast Checker (online ou plugin)
  - [ ] Testar todas as cores em tokens:
    - [ ] Text colors vs backgrounds
    - [ ] Interactive elements vs backgrounds
    - [ ] Disabled states vs backgrounds
    - [ ] Semantic colors (success, warning, error, info)

  - [ ] Criar tabela de validação:
    | Color | Background | Ratio | WCAG AA | Status |
    |-------|-----------|-------|--------|--------|
    | primary-700 | white | 7.5:1 | ✅ | OK |
    | gray-500 | white | 5.2:1 | ✅ | OK |
    | disabled-fg | white | 2.1:1 | ❌ | NEEDS FIX |

  - [ ] Marcar todas com status
  - [ ] Violações planejadas para Phase 2

- [ ] Keyboard Navigation Test:
  - [ ] Sem mouse, só Tab/Enter/Arrow/Escape
  - [ ] 5 páginas navegáveis completamente
  - [ ] Documentar qualquer issue (ex: "Tab salta elemento", "Focus não visível")

- [ ] Criar report: `docs/accessibility/wcag-aa-audit-2026-03-07.md`

### Subtask 5.5.3: Documentation & Remediation Plan (1-2.5h)
- [ ] Criar `docs/accessibility/component-a11y-guide.md`:
  - [ ] Seções: Intro, Button, Input, Modal, Form, Dropdown, Link, Common Mistakes, Checklist
  - [ ] Cada componente: role, aria attributes, keyboard support
  - [ ] Exemplos de bom vs ruim
  - [ ] Links para WAI-ARIA patterns

- [ ] Criar `docs/accessibility/accessible-colors.md`:
  - [ ] Tabela de color combinations
  - [ ] Visual samples de cada combinação
  - [ ] Status (safe, needs caution, avoid)
  - [ ] Alternativas para problemas

- [ ] Criar `docs/accessibility/roadmap.md`:
  - [ ] Issues encontrados em ordem de severidade
  - [ ] Timeline estimada para Phase 2
  - [ ] Dependencies (ex: "fix após design token refactor")
  - [ ] Owner sugerido para cada fix

- [ ] Atualizar `package.json`:
  - [ ] Script: `test:a11y` — `jest --testPathPattern=a11y`

- [ ] Atualizar `README.md` (se necessário):
  - [ ] Seção "Accessibility" mencionando status WCAG AA
  - [ ] Link para `component-a11y-guide.md`

---

## File List

**Arquivos a CRIAR:**
- `src/components/**/*.a11y.test.tsx` (20 files) — jest-axe tests para 20 componentes
- `jest.setup.ts` — Configuração de jest-axe (ou update se existir)
- `.github/workflows/test-a11y.yml` — GitHub Actions para a11y tests
- `docs/accessibility/wcag-aa-audit-2026-03-07.md` — Manual audit report
- `docs/accessibility/component-a11y-guide.md` — Developer guide
- `docs/accessibility/accessible-colors.md` — Color palette validation
- `docs/accessibility/roadmap.md` — Known issues & fix plan

**Arquivos a ATUALIZAR:**
- `package.json` — Script `test:a11y` + jest-axe dependency
- `.github/workflows/test.yml` (ou criar novo test-a11y.yml)

**Suporte (LOCAL ONLY):**
- `scripts/a11y-report.js` — Script para gerar report de violations (não commitado)

---

## Definition of Done

- [ ] Código escrito & revisado
  - [ ] jest-axe setup correto
  - [ ] 20+ `.a11y.test.tsx` bem-estruturados
  - [ ] TypeScript sem erros

- [ ] Testes passando
  - [ ] `npm run test:a11y` executa
  - [ ] 20+ testes passam (0 violations)
  - [ ] Roda em <30 segundos (performance)
  - [ ] CI workflow dispara em PR

- [ ] Auditoria Manual Completa
  - [ ] NVDA testing: 5 páginas testadas
  - [ ] Color contrast: todos tokens validados
  - [ ] Keyboard navigation: 5 páginas navegáveis
  - [ ] Report documentado

- [ ] Linting & Type Checking
  - [ ] `npm run lint` — 0 errors
  - [ ] `npm run typecheck` — 0 errors
  - [ ] TSX files válido

- [ ] Documentação atualizada
  - [ ] `wcag-aa-audit-2026-03-07.md` completo
  - [ ] `component-a11y-guide.md` claro com exemplos
  - [ ] `accessible-colors.md` com validação visual
  - [ ] `roadmap.md` com plano Phase 2
  - [ ] `package.json` scripts corretos

- [ ] CodeRabbit review
  - [ ] PR submetido com descrição
  - [ ] CodeRabbit review APPROVED
  - [ ] Feedback incorporado

- [ ] Validação @qa
  - [ ] @qa roda jest-axe tests
  - [ ] @qa valida CI workflow dispara em PR
  - [ ] @qa verifica NVDA audit com próprio screen reader (se possível)
  - [ ] Sign-off concedido

- [ ] Branch merged to main
- [ ] Deployado para staging

---

## Dependencies & Timeline

**Predecessor Stories:** Story 5.2 (Design Tokens — cores e tipografia em place)
**Bloqueado Por:** Story 5.2 (cores necessárias para teste de contraste)
**Pode Rodar Paralelo Com:** Stories 5.1, 5.4

**Timeline:** Semana 3 (Março 24-31, 2026)
**Owner Disponibilidade:** 6-8h
**Note:** NVDA testing requer Windows; macOS/Linux pode usar aXe DevTools ou WebAIM alternativas

---

## Validation Checklist (para @po)

- [ ] AC é claro e testável?
  - [ ] AC-001: jest-axe integrado, 20+ testes, CI/CD
  - [ ] AC-002: NVDA testing 5 páginas, color contrast validado, keyboard navigation
  - [ ] AC-003: 3 docs específicos, roadmap claro

- [ ] Esforço realista?
  - [ ] 6-8h baseado em:
    - [ ] 2-2.5h jest-axe setup + testes
    - [ ] 2.5-3h auditoria manual (NVDA, contraste, keyboard)
    - [ ] 1-2.5h documentação

- [ ] Dependencies identificadas?
  - [ ] DEPENDE de Story 5.2 (cores necessárias)
  - [ ] Bloqueador formalmente marcado

- [ ] Owner disponível?
  - [ ] Uma (@ux-design-expert) confirmada para Março 24-31

- [ ] Prioridade correta?
  - [ ] Média-Alta — compliance + inclusividade crítica
  - [ ] LGPD/Lei de Acessibilidade BR exigem WCAG AA

---

## CodeRabbit Integration

**Focus Areas:**
- [ ] jest-axe Test Quality — Coverage de 20+ componentes
- [ ] A11y Best Practices — ARIA attributes, keyboard support, semantic HTML
- [ ] Color Contrast Validation — WCAG AA compliance
- [ ] Documentation Quality — Guide claro, patterns explicados

**Specialized Agents:**
- **@ux-design-expert (Uma):** Implementação principal
- **@architect (Aria):** Revisão de WCAG patterns, accessibility architecture
- **@qa (Quinn):** Validação de testes, manual audit verification

---

## Quality Gates

1. **jest-axe Quality Gate:**
   - [ ] 20+ testes implementados ✅
   - [ ] Todos testes PASSAM (0 violations) ✅
   - [ ] Suite roda em <30s ✅
   - [ ] CI workflow dispara em PR ✅

2. **Manual Audit Quality Gate:**
   - [ ] NVDA: 5 páginas testadas ✅
   - [ ] Keyboard: navegável sem mouse ✅
   - [ ] Color contrast: todos tokens validados ✅
   - [ ] Report documentado com findings ✅

3. **WCAG AA Compliance Gate:**
   - [ ] Text contrast >= 4.5:1 ✅
   - [ ] Large text >= 3:1 ✅
   - [ ] Interactive elements accessible ✅
   - [ ] Keyboard navigation funcional ✅

4. **Documentation Gate:**
   - [ ] component-a11y-guide.md completo ✅
   - [ ] accessible-colors.md com validação ✅
   - [ ] roadmap.md com plano Phase 2 ✅
   - [ ] Exemplos de good/bad practices ✅

---

*Story 5.5 — A11y Automated Testing & Manual Audit*
*EPIC 5: Foundation Phase — Database & Frontend Design System*
*Criado: 2026-03-07 | Status: TODO | Owner: Uma (@ux-design-expert)*
*Depende de: Story 5.2 (Design Tokens)*
