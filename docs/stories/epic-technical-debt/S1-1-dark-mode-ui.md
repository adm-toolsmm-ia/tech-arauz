# S1-1: Dark Mode UI — Adicionar Toggle e Tema Escuro

**Epic:** epic-technical-debt
**Story ID:** S1-1
**Status:** Ready
**Complexity:** 8/25 (SIMPLE)
**Story Points:** 8
**Effort:** 8h
**Owner:** @dev
**Priority:** P0 (user-facing, quick win)
**Validated By:** @po (Pax)
**Validation Date:** 2026-02-22
**Validation Score:** 10/10
**Verdict:** GO

---

## User Story

Como usuário do Tech Arauz,
Quero poder alternar entre tema claro e escuro,
Para reduzir fadiga visual em ambiente com pouca luz.

---

## Acceptance Criteria

- [ ] AC-1: Sidebar tem botão toggle (ícone sol/lua)
- [ ] AC-2: Click no toggle muda cor de fundo, texto, componentes
- [ ] AC-3: CSS variables aplicadas a todos componentes principais
- [ ] AC-4: Preferência salva em localStorage → persiste após refresh
- [ ] AC-5: Tema dark uses WCAG AA (contrast ≥4.5:1)
- [ ] AC-6: Sem layout breaks em mobile/tablet
- [ ] AC-7: Animação suave de transição (0.3s)
- [ ] AC-8: Funciona em todas 5 main pages

---

## Scope

### IN
- Sidebar toggle switch
- CSS variables para dark theme
- localStorage integration
- 5 principais pages (dashboard, projetos, cronogramas, entregas, integracoes)

### OUT
- Mobile app dark mode
- Auto-detect sistema (prefers-color-scheme)
- Dark mode para componentes 3rd-party

---

## Dependencies

- Nenhum (primeira story)

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Tailwind dark: prefix conflicts | MEDIUM | MEDIUM | Test all utilities early |
| localStorage não funciona | LOW | HIGH | Fallback para cookie |
| Layout shifts | HIGH | MEDIUM | Use CSS vars, no hard colors |

---

## Definition of Done

- [ ] Dark mode toggle aparece no Sidebar
- [ ] CSS variables definidas para: background, text, borders, shadows
- [ ] localStorage salva/restaura preferência
- [ ] Testes passando (unit + integration)
- [ ] Linting/TypeScript: 0 errors
- [ ] Reviewed por @dev (peer)
- [ ] WCAG AA validated
- [ ] Documentação atualizada
- [ ] Commit message: `feat: add dark mode UI with theme persistence [S1-1]`

---

## File List

(will be populated by @dev)

---

## Dev Notes

(will be populated by @dev)

---

## Change Log

- **2026-02-22** | Created | Status: Draft
- **2026-02-22** | Validated | Status: Draft → Ready | 10-point checklist passed (10/10), @po approval, cleared for development
