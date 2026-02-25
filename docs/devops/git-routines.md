# Rotinas para enviar arquivos locais ao GitHub

Rotinas padronizadas para commit local, push e criação de PR. Governança: **git push e gh pr** são **EXCLUSIVOS @devops** (agent-authority.mdc).

---

## Resumo das rotinas

| Rotina | Comando | Quem | O que faz |
|--------|---------|------|-----------|
| **Commit local** | `npm run sync:commit -- "mensagem"` | @dev | add . + commit (sem push) |
| **Push** | `npm run sync:push` | @devops | pull --rebase + push |
| **Sync completo** | `npm run sync "mensagem"` | @devops | add + commit + pull + push |
| **Criar PR** | `npm run sync:pr -- "Título" "Corpo"` | @devops | gh pr create (após push) |

---

## 1. Commit local (sem enviar)

**Quem:** @dev (qualquer agente pode commitar localmente).

**Comando:**

```powershell
npm run sync:commit -- "feat(auth): add login"
```

Ou direto:

```powershell
powershell -ExecutionPolicy Bypass -File ./scripts/git-commit.ps1 "feat(scope): description"
```

**Convenção de mensagem (project.mdc):**

- Formato: `type(scope): description`
- Tipos: feat, fix, docs, refactor, test, chore, ci
- Idioma: inglês para commits

**Exemplos:**

- `feat(dashboard): add KPI cards`
- `fix(api): handle null in sync`
- `docs(devops): add git routines`

---

## 2. Enviar ao GitHub (push)

**Quem:** **@devops** (único autorizado a fazer push — agent-authority.mdc).

**Pré-requisito:** Commits já feitos localmente (ex.: `npm run sync:commit`).

**Comando:**

```powershell
npm run sync:push
```

O script faz:

1. `git pull origin <branch> --rebase`
2. `git push origin <branch>`

**Branch nova (primeira vez no remoto):** Se a branch ainda não existir em `origin`, o `pull` falha. Nesse caso:

```powershell
git push -u origin <nome-da-branch>
```

---

## 3. Sync completo (add + commit + pull + push)

**Quem:** @devops (inclui push).

**Comando:**

```powershell
npm run sync "feat(scope): description"
```

Ou sem mensagem (usa default `chore: sync project updates`):

```powershell
npm run sync
```

Equivale a: add . → commit → pull --rebase → push.

---

## 4. Criar PR (após push)

**Quem:** @devops (gh pr create é exclusivo @devops).

**Pré-requisito:** gh CLI instalado e autenticado (`gh auth status`); branch já enviada (`npm run sync:push`).

**Comando:**

```powershell
npm run sync:pr -- "Título do PR" "Corpo opcional"
```

Exemplo:

```powershell
npm run sync:pr -- "feat(dashboard): KPI cards" "Adiciona cards de métricas na home."
```

---

## Fluxo recomendado

1. **@dev** — Desenvolve e commita localmente:
   ```powershell
   npm run sync:commit -- "feat(scope): description"
   ```
2. **@devops** — Envia ao GitHub e, se quiser, abre PR:
   ```powershell
   npm run sync:push
   npm run sync:pr -- "Título" "Corpo"
   ```

Ou em um passo (sync completo, @devops):

```powershell
npm run sync "feat(scope): description"
```

---

## Scripts (scripts/)

| Script | Uso |
|--------|-----|
| `git-commit.ps1` | add + commit (mensagem por argumento) |
| `git-push.ps1` | pull --rebase + push |
| `git-pr.ps1` | gh pr create (título obrigatório, corpo opcional) |
| `sync.ps1` | add + commit + pull + push (sync completo) |

---

## Quality gates (antes de push)

Conforme project.mdc, antes de concluir tarefa ou PR:

```powershell
npm run lint
npm run typecheck
npm test
npm run sync:ide:check
```

---

*Última atualização: 2026-02-24.*
