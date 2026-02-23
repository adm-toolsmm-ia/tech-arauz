# Deploy Handoff — Filtros 10/10

> **Para**: @devops (ou quem fizer o push)  
> **Data**: 2026-02-23  
> **Escopo**: Filtros rápidos e atalhos em Projetos e Cronogramas

---

## Comandos para deploy

```powershell
# 1. Garantir que está na branch desejada (ex: main)
git status
git branch

# 2. Adicionar todas as alterações
git add -A

# 3. Commit (Conventional)
git commit -m "feat(filters): filtros rápidos e atalhos em Projetos e Cronogramas

- FilterBar integrado em projects-content e cronogramas-content
- Hooks useProjetosFilters e useCronogramasFilters modernizados
- filter-definitions para projetos e cronogramas
- Persistência localStorage, quick filters com popover
- Remoção SearchAndFilterBar e AdvancedFilters; GlobalSearch deprecado
- Testes filter-utils e useFilterState (104 testes)
- Docs: ADR-003, filter-architecture, data-context
Ref: .context/13-ENTREGA-FINAL.md"

# 4. Push (autoridade @devops)
git push origin main
```

Se usar **branch + PR**:

```powershell
git checkout -b feat/filters-projetos-cronogramas
git add -A
git commit -m "feat(filters): filtros rápidos e atalhos em Projetos e Cronogramas"
git push origin feat/filters-projetos-cronogramas
# Depois: abrir PR no GitHub e merge (ou @devops faz merge)
```

---

## CI (GitHub Actions)

- **Workflow**: `.github/workflows/ci.yml`
- **Trigger**: push em `main` ou pull_request para `main`
- **Steps**: checkout → npm ci → lint → format:check → test → build
- **Pré-requisito**: lint, typecheck, test e build devem passar localmente antes do push

---

## Rollback (se necessário)

```powershell
git revert HEAD --no-edit
git push origin main
```

---

## Checklist pré-push

- [x] Lint: `npm run lint` → OK
- [x] Typecheck: `npm run typecheck` → OK
- [x] Testes: `npm test -- --run` → 104/104
- [ ] Format: `npm run format:check` → (corrigir se falhar)
- [ ] Build: `npm run build` → (validar localmente)

---

**Handoff por**: @dev  
**Deploy por**: @devops
