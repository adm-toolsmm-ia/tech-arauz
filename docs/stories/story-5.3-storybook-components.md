# Story 5.3 — Setup Storybook with Component Documentation

**Story ID:** 5.3
**Epic:** EPIC 5 — Foundation Phase: Database & Frontend Design System
**Sprint:** Março 17-31, 2026
**Agente:** @ux-design-expert (Uma)
**Esforço:** 7-8h
**Prioridade:** Alta
**Status:** TODO

---

## Como Usuário

Como desenvolvedor novo ou designer,
Quero ter um Storybook centralizado com 20+ componentes documentados com props, variantes e acessibilidade,
Para aprender rapidamente como usar componentes existentes e não reinventar roda.

---

## Contexto

**Problema Atual:**
- 109 componentes existem mas não têm documentação centralizada
- Novos devs precisam procurar código ou perguntar a alguém
- Sem exemplos de variantes (sizes, colors, states)
- Sem guia de acessibilidade por componente
- Não há forma de ver componentes interativos em isolamento

**Solução:**
1. Setup Storybook 7.x com configuração Next.js 14
2. Documentar 20 componentes core (atoms, molecules, organisms)
3. Incluir controles interativos para testar props
4. Integrar addons de acessibilidade
5. Deploy para CI pipeline (viewable em PRs)

**Impacto de Negócio:**
- Onboarding reduzido: 2 semanas → 1 semana
- Redução de bugs: padrões claros
- Documentação sempre atualizada (co-located com componentes)
- Designers podem validar implementações

---

## Critérios de Aceitação

### AC-001: Storybook 7.x Setup Completo
- [ ] Instalação & Configuração:
  - [ ] Package: `@storybook/react@7.x` instalado (via `npm install`)
  - [ ] Build configurado para Next.js 14 (`@storybook/nextjs`)
  - [ ] Config file: `.storybook/main.ts` criado com:
    - [ ] Framework: `nextjs`
    - [ ] Stories glob: `../src/components/**/*.stories.tsx`
    - [ ] Addons: a11y, controls, docs, actions

  - [ ] Preview file: `.storybook/preview.tsx` criado com:
    - [ ] Global styles imported
    - [ ] Tailwind configurado
    - [ ] Design tokens aplicados (decoradores)
    - [ ] Theme escuro/claro disponível

  - [ ] Manager configuration: `.storybook/manager.ts` (opcional)
    - [ ] Theme customizado (se desejado)

- [ ] Launch Funcional:
  - [ ] Comando: `npm run storybook` inicia server
  - [ ] Server roda em: `http://localhost:6006`
  - [ ] Interface Storybook aparece sem erros
  - [ ] Sidebar carrega (vazio inicialmente)
  - [ ] Addon panel abaixo funciona

- [ ] Build Storybook:
  - [ ] Comando: `npm run build:storybook` funciona
  - [ ] Output em: `storybook-static/`
  - [ ] Pronto para deploy (estático)

### AC-002: 20+ Componentes Documentados
- [ ] **Atoms** (6 componentes):
  - [ ] `Button.stories.tsx` — Variantes: primary, secondary, danger; sizes: sm, md, lg; states: disabled, loading
  - [ ] `Input.stories.tsx` — Variantes: text, password, email; sizes: sm, md; states: disabled, error, filled
  - [ ] `Badge.stories.tsx` — Variantes: success, warning, error, info; sizes: sm, md
  - [ ] `Label.stories.tsx` — Variantes: required, optional, disabled
  - [ ] `Icon.stories.tsx` — Catálogo de ícones (SVG); mostra todos os ícones disponíveis
  - [ ] `Tooltip.stories.tsx` — Posicionamento: top, right, bottom, left; content variado

- [ ] **Molecules** (6 componentes):
  - [ ] `FormField.stories.tsx` — Com label, input, error message; validações
  - [ ] `Card.stories.tsx` — Com/sem header, footer, padding variado; interactive
  - [ ] `Modal.stories.tsx` — Sizes: sm, md, lg; com/sem footer; close behavior
  - [ ] `Dropdown.stories.tsx` — Diferentes opções; disabled items; search (se aplicável)
  - [ ] `DatePicker.stories.tsx` — Estados: default, selected, range; disabled dates
  - [ ] `SearchBox.stories.tsx` — Com/sem icon; com/sem suggestions; loading state

- [ ] **Organisms** (6 componentes):
  - [ ] `Table.stories.tsx` — Com/sem sorting; pagination; row selection (se aplicável); empty state
  - [ ] `Chart.stories.tsx` — Tipos: Line, Bar, Pie; data variado; labels
  - [ ] `Sidebar.stories.tsx` — Collapsed/expanded; menu items; active state
  - [ ] `Header.stories.tsx` — Completo com logo, nav, user menu
  - [ ] `Footer.stories.tsx` — Links, copyright, social icons
  - [ ] `Form.stories.tsx` — Exemplo completo: login, signup com validações

- [ ] **Templates** (2 componentes):
  - [ ] `LoginPage.stories.tsx` — Layout completo de login
  - [ ] `DashboardPage.stories.tsx` — Layout com sidebar, header, content area

- [ ] **Cada Story Inclui:**
  - [ ] **Basic Usage:** Story `export const Default`
  - [ ] **Props/Controls:** `argTypes` para testar interativamente
  - [ ] **Variants:** Stories adicionais (sizes, colors, states)
  - [ ] **Acessibilidade:** Notas em tabela abaixo da story
    - [ ] Roles (button, dialog, etc)
    - [ ] ARIA attributes (aria-label, aria-disabled)
    - [ ] Keyboard support (if applicable)
  - [ ] **Example Data:** Props realistas para visualização

### AC-003: Integrações de Addons Completas
- [ ] **Accessibility Addon** (`@storybook/addon-a11y`):
  - [ ] Instalado e configurado
  - [ ] Aparece em panel inferior
  - [ ] Executa axe-core checks em cada story
  - [ ] Mostra violations (se houver, documentadas)
  - [ ] Keyboard navigation testável

- [ ] **Controls Addon:**
  - [ ] Instalado e configurado
  - [ ] Mostra inputs para cada prop
  - [ ] Permite testar variantes interativamente
  - [ ] Tipos validados (select, text, number, boolean)

- [ ] **Docs Addon:**
  - [ ] Markdown documentation renderizada
  - [ ] Props table automática (introspection)
  - [ ] Source code visível (opcionalmente)

- [ ] **Actions Addon:**
  - [ ] Click/submit events logados
  - [ ] Callback functions mockadas

- [ ] **Backgrounds Addon** (opcional):
  - [ ] Teste componentes em diferentes backgrounds
  - [ ] Light/dark backgrounds

### AC-004: Documentação Completa
- [ ] README: `.storybook/README.md`
  - [ ] Como setup Storybook localmente
  - [ ] Como rodar: `npm run storybook`
  - [ ] Como buildar: `npm run build:storybook`
  - [ ] Addons disponíveis e como usá-los

- [ ] Contribution Guide: `docs/design/storybook-contribution-guide.md`
  - [ ] Template de nova story
  - [ ] Naming convention (`ComponentName.stories.tsx`)
  - [ ] Estrutura básica (title, component, argTypes, export)
  - [ ] Exemplos de good practices
  - [ ] Como adicionar acessibilidade docs

- [ ] Design System Docs: `docs/design/storybook-guide.md`
  - [ ] O que é Storybook e por que importa
  - [ ] Como navegar
  - [ ] Como usar controles
  - [ ] Onde encontrar componentes
  - [ ] Como contribuir novos componentes

- [ ] CI/CD docs (deployment):
  - [ ] Como Storybook é publicado em PRs
  - [ ] Link para Storybook publicado

---

## Subtasks

### Subtask 5.3.1: Storybook Scaffold (1-2h)
- [ ] Instalação de dependências:
  - [ ] `npm install @storybook/react@7.x @storybook/nextjs`
  - [ ] `npm install -D @storybook/addon-a11y @storybook/addon-controls @storybook/addon-docs @storybook/addon-actions`
  - [ ] Executar: `npx sb init` (se primeira vez)

- [ ] Criar estrutura de diretórios:
  - [ ] Diretório: `.storybook/` (criar se não existir)
  - [ ] Arquivo: `.storybook/main.ts` (configuração)
  - [ ] Arquivo: `.storybook/preview.tsx` (preview global)
  - [ ] Arquivo: `.storybook/manager.ts` (opcional)

- [ ] Configurar `.storybook/main.ts`:
  ```typescript
  import type { StorybookConfig } from '@storybook/nextjs';

  const config: StorybookConfig = {
    framework: '@storybook/nextjs',
    stories: ['../src/components/**/*.stories.tsx'],
    addons: [
      '@storybook/addon-a11y',
      '@storybook/addon-controls',
      '@storybook/addon-docs',
      '@storybook/addon-actions',
    ],
  };

  export default config;
  ```

- [ ] Configurar `.storybook/preview.tsx`:
  - [ ] Import de tailwind globals
  - [ ] Import de design tokens (se já existir)
  - [ ] Decoradores para layout/theme
  - [ ] Global CSS/TailwindCSS configurado

- [ ] Validar launch:
  - [ ] `npm run storybook` inicia sem erros
  - [ ] Browser abre em `http://localhost:6006`
  - [ ] Interface carrega (sem stories ainda)

### Subtask 5.3.2: Component Stories (4-5h)
- [ ] Selecionar 20 componentes core:
  - [ ] Auditar `src/components/` (listar átomos, moléculas, organismos)
  - [ ] Priorizar: componentes mais usados / críticos
  - [ ] Confirmar lista com @architect ou UX lead

- [ ] Para CADA componente, criar `.stories.tsx`:
  - [ ] Estrutura básica:
    ```typescript
    import type { Meta, StoryObj } from '@storybook/react';
    import { ComponentName } from './ComponentName';

    const meta = {
      title: 'Components/Atoms/ComponentName', // Categoria no sidebar
      component: ComponentName,
      argTypes: { /* prop definitions */ },
    } satisfies Meta<typeof ComponentName>;

    export default meta;
    type Story = StoryObj<typeof meta>;

    export const Default: Story = {
      args: { /* default props */ },
    };

    export const Variant1: Story = {
      args: { /* variant props */ },
    };
    ```

  - [ ] Adicionar Controls (argTypes):
    - [ ] Para cada prop (size, color, disabled, etc)
    - [ ] Tipos corretos (select, text, boolean, number)
    - [ ] Valores padrão

  - [ ] Criar variantes (export multiple stories):
    - [ ] Sizes (sm, md, lg)
    - [ ] Colors (primary, secondary, danger)
    - [ ] States (default, hover, disabled, loading)
    - [ ] No texto, com tooltip, com icon

  - [ ] Acessibilidade (jsDoc comment):
    ```typescript
    /**
     * Button component.
     *
     * **Accessibility:**
     * - Role: button
     * - Keyboard: Spacebar/Enter to activate
     * - Screen readers: aria-label supported
     */
    ```

- [ ] Total: 20 arquivos `.stories.tsx` criados
  - [ ] 6 atoms, 6 molecules, 6 organisms, 2 templates
  - [ ] ~250 linhas por arquivo (template + variantes)

### Subtask 5.3.3: Addon Integration (1h)
- [ ] Validar cada addon na UI:
  - [ ] Accessibility: Painel inferior mostra violations/checks
  - [ ] Controls: Inputs para props aparecem no painel
  - [ ] Docs: Tab "Docs" funciona (mostra props table)
  - [ ] Actions: Click events logados no painel

- [ ] Configurar opções de addon:
  - [ ] A11y: Modo "all" (todos checks) vs "violations" (só erros)
  - [ ] Theme selector (light/dark mode toggle)
  - [ ] Backgrounds for component testing

- [ ] Testar em browser:
  - [ ] Todas as stories renderizam sem erros
  - [ ] Controles são responsivos (mudar prop → re-render)
  - [ ] Acessibilidade checks rodam (mesmo com violations)

### Subtask 5.3.4: Documentação (1h)
- [ ] Criar `.storybook/README.md`:
  - [ ] Título, descrição
  - [ ] Como rodar: `npm run storybook`
  - [ ] Como buildar: `npm run build:storybook`
  - [ ] Estrutura de arquivos (main.ts, preview.tsx, etc)
  - [ ] Addons e o que fazem
  - [ ] Links para Storybook docs

- [ ] Criar `docs/design/storybook-contribution-guide.md`:
  - [ ] Template básico para nova story
  - [ ] Exemplo prático (copiar Button.stories.tsx)
  - [ ] Naming conventions
  - [ ] Como adicionar props com Controls
  - [ ] Como documentar acessibilidade
  - [ ] Checklist antes de PR

- [ ] Criar `docs/design/storybook-guide.md`:
  - [ ] User-facing guide (não técnico)
  - [ ] Como navegar sidebar
  - [ ] Como usar controles
  - [ ] Como testar com addons
  - [ ] Screenshots de exemplo

- [ ] Atualizar `package.json` scripts:
  - [ ] `npm run storybook` — `storybook dev -p 6006`
  - [ ] `npm run build:storybook` — `storybook build`

---

## File List

**Arquivos a CRIAR:**
- `.storybook/main.ts` — Configuração Storybook
- `.storybook/preview.tsx` — Preview global + tailwind setup
- `.storybook/README.md` — Documentação de setup
- `src/components/**/*.stories.tsx` (20 arquivos) — Stories para 20 componentes
- `docs/design/storybook-guide.md` — User guide
- `docs/design/storybook-contribution-guide.md` — Developer guide

**Arquivos a ATUALIZAR:**
- `package.json` — Scripts para Storybook + devDependencies
- `.gitignore` — Adicionar `storybook-static/`

**Suporte (LOCAL ONLY):**
- `scripts/list-components.js` — Script para listar componentes (não commitado)

---

## Definition of Done

- [ ] Código escrito & revisado
  - [ ] `.storybook/` config válida
  - [ ] 20 `.stories.tsx` bem-estruturados
  - [ ] TypeScript sem erros

- [ ] Testes passando
  - [ ] `npm run storybook` inicia
  - [ ] Todas 20+ stories renderizam
  - [ ] Controles funcionam
  - [ ] Addons aparecem no panel
  - [ ] Build: `npm run build:storybook` ✅

- [ ] Linting & Type Checking
  - [ ] `npm run lint` — 0 errors
  - [ ] `npm run typecheck` — 0 errors
  - [ ] TSX files válido

- [ ] Documentação atualizada
  - [ ] `.storybook/README.md` completo
  - [ ] `storybook-guide.md` claro
  - [ ] `storybook-contribution-guide.md` com exemplos
  - [ ] `package.json` scripts corretos

- [ ] CodeRabbit review
  - [ ] PR submetido com descrição
  - [ ] CodeRabbit review APPROVED
  - [ ] Feedback incorporado

- [ ] Validação @qa
  - [ ] @qa visual verification de todas 20 stories
  - [ ] @qa testa controles interativos
  - [ ] @qa testa addons (a11y, docs)
  - [ ] Sign-off concedido

- [ ] Branch merged to main
- [ ] Deployado para staging (Storybook publicado)

---

## Dependencies & Timeline

**Predecessor Stories:** Story 5.2 (Design Tokens — precisa estar pronto)
**BLOQUEADO POR:** Story 5.2 (Design Tokens devem estar prontos antes de começar Storybook)
**Pode Rodar Paralelo Com:** Story 5.4

**Timeline:** Semana 2-3 (Março 17-31, 2026)
- ⚠️ **CRÍTICO:** Story 5.2 deve terminar até 17 de março (fim Semana 1) para que Story 5.3 comece dia 17. Se Story 5.2 atrasar, Story 5.3 fica bloqueada.
- Semana 2: Scaffold (1-2h) + Stories (4-5h) = ~6h
- Semana 3: Addons (1h) + Docs (1h) + Polish = ~2h

**Owner Disponibilidade:** 7-8h total
**Dependency:** Story 5.2 DEVE estar DONE antes de começar (tokens em place)

---

## Validation Checklist (para @po)

- [ ] AC é claro e testável?
  - [ ] AC-001: Storybook launch específico, localhost:6006
  - [ ] AC-002: 20 componentes listados, cada um com AC detalhado
  - [ ] AC-003: Addons específicos listados
  - [ ] AC-004: 3 docs específicos

- [ ] Esforço realista?
  - [ ] 7-8h baseado em:
    - [ ] 1-2h scaffold + config
    - [ ] 4-5h escrever 20 stories (~15 min cada)
    - [ ] 1h addons + validação
    - [ ] 1h documentação

- [ ] Dependencies identificadas?
  - [ ] DEPENDE de Story 5.2 (tokens necessários)
  - [ ] Bloqueador formalmente marcado

- [ ] Owner disponível?
  - [ ] Uma (@ux-design-expert) confirmada para Março 17-31

- [ ] Prioridade correta?
  - [ ] Alta — fundamentação para onboarding
  - [ ] Melhora significativa de DX (developer experience)

---

## CodeRabbit Integration

**Focus Areas:**
- [ ] Storybook Configuration — main.ts, preview.tsx corretos
- [ ] Story Structure — Padrão consistente, argTypes bem-definidos
- [ ] TypeScript — Tipos corretos em Meta, argTypes, stories
- [ ] Accessibility — A11y documentation em jsDoc
- [ ] Documentation Quality — README e guides claros

**Specialized Agents:**
- **@ux-design-expert (Uma):** Implementação principal
- **@architect (Aria):** Revisão de component architecture
- **@qa (Quinn):** Validação visual de todas 20 stories

---

## Quality Gates

1. **Storybook Quality Gate:**
   - [ ] `npm run storybook` inicia ✅
   - [ ] Todas 20+ stories renderizam ✅
   - [ ] Build: `npm run build:storybook` ✅

2. **Story Quality Gate:**
   - [ ] Cada story tem Default + 2+ variantes
   - [ ] ArgTypes definem todos os props
   - [ ] Acessibilidade docs presentes (jsDoc)
   - [ ] Sem console errors/warnings

3. **Addon Quality Gate:**
   - [ ] A11y addon roda (violations listadas)
   - [ ] Controls funcionam (change prop → re-render)
   - [ ] Docs tab mostra props table
   - [ ] Actions logam eventos

4. **Documentation Gate:**
   - [ ] `.storybook/README.md` claro
   - [ ] `storybook-contribution-guide.md` com template
   - [ ] `storybook-guide.md` user-friendly

---

*Story 5.3 — Setup Storybook with Component Documentation*
*EPIC 5: Foundation Phase — Database & Frontend Design System*
*Criado: 2026-03-07 | Status: TODO | Owner: Uma (@ux-design-expert)*
*Depende de: Story 5.2 (Design Tokens)*

---

✅ **APROVADA — COM CLARIFICAÇÃO DE DEPENDENCY IMPLEMENTADA**
- Dependencies explicitamente marcadas: BLOQUEADO POR Story 5.2
- Timeline crítico adicionado: Story 5.2 deve terminar até 17 de março
- Paralelismo corrigido: Remover Story 5.1, manter apenas Story 5.4
- Pronto para desenvolvimento conforme cronograma
