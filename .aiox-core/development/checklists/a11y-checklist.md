# Checklist de Acessibilidade — Tech Arauz

> Standard: WCAG 2.1 AA | Versão: 1.0 | Story: 2.8

---

## Setup Técnico (automatizado)

- [x] `eslint-plugin-jsx-a11y` configurado em modo `error` no `.eslintrc.json`
- [x] `@axe-core/react` instalado e ativo em dev mode via `AxeProvider`
- [x] `npm run a11y:check` disponível (`next lint --max-warnings=0`)
- [x] `focus-visible` global com `ring-2 ring-ring ring-offset-2` em `globals.css`
- [x] `lang="pt-BR"` no `<html>` root (`layout.tsx`)

---

## Checklist por Categoria

### 1. Elementos Interativos

- [x] Todo `div`/`span` clicável tem `role="button"`, `tabIndex={0}` e `onKeyDown`
- [x] Todo `tr` clicável tem `role="button"`, `tabIndex={0}` e `onKeyDown`
- [x] Divs de `stopPropagation` sem interação própria têm `role="presentation"`
- [x] Nenhum `<a href="#">` — substituído por `<button type="button">`
- [ ] Botões icon-only têm `aria-label` descritivo (verificar globalmente)

### 2. Focus States

- [x] `:focus-visible` global definido com ring visível
- [x] Shadcn/Radix primitivos incluem focus states nativo
- [x] Cards clicáveis têm `focus-visible:ring-2 focus-visible:ring-ring`
- [ ] Verificar itens de lista de projeto em ProjectListView

### 3. ARIA e Semântica

- [x] `aria-live="polite"` no dashboard (status de filtro KPI)
- [x] Headings com conteúdo explícito (`CardTitle` — `children` obrigatório)
- [x] `aria-label` em Checkbox de seleção em massa (`"Selecionar tudo"`)
- [ ] Ícones de ação icon-only (Trash2, Edit) — verificar se todos têm `title` prop

### 4. Contraste (verificação manual)

- [ ] Primary (#0f4d3a / verde petróleo) sobre background branco — verificar ratio
- [ ] Accent (#ff6633 / laranja) sobre background branco — verificar ratio
- [ ] Texto muted-foreground (#6b7280) sobre background — verificar ratio
- [ ] Dark mode: todas as variantes de cor verificadas

### 5. Teclado — Fluxos Críticos

- [ ] Login: Tab entre campos + Enter submete
- [ ] Dashboard: KPI cards navegáveis + Enter abre drilldown
- [ ] Projetos: FilterBar + KanbanBoard + cockpit acessíveis
- [ ] Cronogramas: Calendário navegável por teclado
- [ ] Integrações: LogViewer expande/colapsa por Enter

### 6. Screen Reader

- [ ] Toast (Sonner) tem `role="status"` + `aria-live="polite"` nativo
- [ ] Modais (Dialog Radix) têm `aria-labelledby` e `aria-describedby` nativo
- [ ] Sidebar: itens de navegação com texto descritivo

---

## Comandos de Verificação

```bash
# ESLint a11y completo (zero warnings)
npm run a11y:check

# axe-core em dev mode (automático no browser)
npm run dev  # violações aparecem no console

# TypeScript
npm run typecheck
```

---

## Histórico

| Data       | Versão | Mudança                      | Autor      |
| ---------- | ------ | ---------------------------- | ---------- |
| 2026-02-27 | 1.0    | Checklist criado — Story 2.8 | Dex (@dev) |
