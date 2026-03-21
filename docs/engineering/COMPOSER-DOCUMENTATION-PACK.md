# COMPOSER DOCUMENTATION PACK — Tech Arauz AIOX 10/10

**Purpose:** Playbook de engenharia de contexto e prompts reutilizáveis para o Composer gerar/atualizar documentação do Tech Arauz com zero invenção.

**Framework:** Synkra AIOS/AIOX
**Effective Date:** 2026-03-21
**Owner:** Orion (@aiox-master)

---

## Referências Obrigatórias (leia antes de qualquer sessão)

- [docs/guides/CONTEXT-ENGINEERING-RULES.md](../guides/CONTEXT-ENGINEERING-RULES.md) — RULE 1: Code First
- [configs/project.yaml](../../configs/project.yaml) — Fonte de verdade de stack e convenções
- [docs/architecture/module-standards.md](../architecture/module-standards.md) — Padrão de módulos
- [docs/architecture/build-deploy-gates.md](../architecture/build-deploy-gates.md) — Quality gates

---

## 1. GLOBAL CONTRACT (copiar para system/instructions do Composer)

**Contrato obrigatório para toda geração de documentação:**

1. **Só afirmações com evidência:** Cada secção factual deve listar ficheiros ou símbolos citados (path + trecho ou identificador: tabela SQL, route handler, nome de RPC). Sem evidência → escrever literalmente `NAO_VERIFICADO_NO_REPO` + descrever o que falta inspecionar.

2. **Proibições explícitas:** Não inventar endpoints, tabelas, env vars, versões de pacote, métricas de cobertura, nem "roadmap como se fosse shipped".

3. **Hierarquia de verdade (ordem):** Código em `src/` e `supabase/` → `package.json` / lock → `configs/project.yaml` → migrações → documentação existente em `docs/` (comparar datas e cruzar com código).

4. **Saída estruturada:** Cada documento gerado deve ter cabeçalho YAML ou tabela fixa com: `doc_id`, `git_ref` (commit ou tag), `generated_at`, `evidence_manifest` (lista de paths lidos), `known_gaps`.

5. **Markdown do projeto:** Respeitar regras do adapter: cabeçalho seguido de linha em branco antes de listas/parágrafos (MD022/MD032). Ver [.cursor/rules/project.mdc](../../.cursor/rules/project.mdc).

6. **Alinhamento AIOX:** Documentar que alterações grandes passam por story/checklist quando aplicável. Referenciar gates em `configs/project.yaml` (`coding_standards.quality_gates`) e [docs/architecture/build-deploy-gates.md](../architecture/build-deploy-gates.md).

---

## 2. TEMPLATE DE EVIDENCE MANIFEST (cabeçalho por documento)

```yaml
---
doc_id: "<nome-canónico-do-documento>"
git_ref: "<commit-hash-ou-tag-ex: v0.2.4>"
generated_at: "<ISO8601>"
evidence_manifest:
  - "<path/relativo/ao/repo>"
  - "<outro-path>"
known_gaps:
  - "<item-acionável-se-relevante>"
---
```

**Regra:** Se não leu um ficheiro, não o inclua em `evidence_manifest`. Em `known_gaps`, liste o que falta ler para fechar lacunas.

---

## 3. CHECKLIST DE VERIFICAÇÃO OBRIGATÓRIA (por documento)

Antes de considerar um documento fechado:

- [ ] Todos os endpoints/tabelas/módulos mencionados aparecem no `evidence_manifest`?
- [ ] Alguma frase "de produto" tem link para implementação (path)?
- [ ] Há secção `known_gaps` com itens acionáveis (o que ler a seguir) ou está vazia se nada faltar?
- [ ] Remover números mágicos não medidos (ex.: "92% coverage") salvo citação a ficheiro de relatório em `docs/` ou output de comando colado na evidência?
- [ ] Nenhuma afirmação sem evidência no repo (substituir por `NAO_VERIFICADO_NO_REPO` se necessário)?

---

## 4. PACOTE DE CONTEXTO MÍNIMO (anexos recomendados por sessão)

| Papel | Paths típicos |
|-------|---------------|
| Stack e convenções | `configs/project.yaml`, `package.json` |
| Rotas e superfície UX | `src/app/**/page.tsx` (amostragem + grep por `export default`) |
| API / routes | `src/app/api/**`, `src/server/**`, grep `route.ts` |
| Dados | `supabase/migrations/*.sql`, `docs/architecture/data/schema.prisma`, `src/types` ou `src/lib/supabase` |
| Segurança tenant | `docs/adr/ADR-001-RLS-STRATEGY.md`, `docs/architecture/ADR-REGISTRY.md` |
| Integração Espaider | `docs/architecture/ESPAIDER-INTEGRATION.md` + código após grep |
| Estado do produto | `docs/reference/PROJECT-CURRENT-STATE.md`, `docs/stories/EPIC-INDEX.md` — validar contra rotas no código |

---

## 5. PROMPTS POR ARTEFACTO

### 5.1 Snapshot de versão (configs + package)

**Objective:** Documentar versões reais de dependências e configuração do projeto, fixando `git_ref`. Nada inventado.

**Hard constraints:** Global Contract 1, 2, 4. Nunca fixar contagens de migrations — derivar por listagem.

**Discovery commands (PowerShell):**

```powershell
git rev-parse HEAD ; git describe --tags --always 2>$null ; Get-Content package.json | Select-String '"version"|"next"|"react"|"@tanstack"' ; Get-ChildItem supabase/migrations -Filter *.sql | Measure-Object | Select-Object -ExpandProperty Count
```

**Output outline:**

1. `doc_id`, `git_ref`, `generated_at`, `evidence_manifest`, `known_gaps`
2. Versões (package.json): Next, React, TanStack Query, Zod, etc. — citar path
3. Configuração (configs/project.yaml): stack, integrações — citar path
4. Contagem de migrations: número derivado, path `supabase/migrations/`

---

### 5.2 Modelo de dados atual (DATABASE-SCHEMA ou equivalente)

**Objective:** Vista "estado final" do schema a partir de `schema.prisma` + CREATE TABLE/ALTER nas migrações. Sem narrar cada migração. RLS apenas com o que estiver em SQL ou ADRs.

**Hard constraints:** Global Contract completo. `docs/architecture/data/schema.prisma` é documental — comparar com migrações quando houver dúvida e registrar em `known_gaps`.

**Discovery commands (PowerShell):**

```powershell
Get-ChildItem supabase/migrations -Filter *.sql | Sort-Object Name | ForEach-Object { $_.Name } ; Select-String -Path "supabase/migrations/*.sql" -Pattern "CREATE TABLE|ALTER TABLE" -List | ForEach-Object { $_.Path }
```

**Output outline:**

1. Cabeçalho com evidence_manifest
2. Tenancy & Auth: tenants, profiles
3. Projects Core: projects, child tables (schedules, deliveries, etc.)
4. Organization Knowledge Graph: org_*, responsible_roles
5. AI & Agents: agents, lm_providers, chatbot_sessions
6. Integration & Logging
7. Índices e performance (só o que estiver em migrations)
8. RLS (resumo por ADR-001 ou policies explícitas)
9. known_gaps

---

### 5.3 Arquitetura e fluxos (ARCHITECTURE-OVERVIEW)

**Objective:** Camadas do sistema, frontend/backend, fluxos de dados. Cruzar `src/app`, module-standards, integrações reais (Espaider, Supabase).

**Hard constraints:** Global Contract. Não fixar números de componentes/endpoints — derivar por grep ou listagem.

**Discovery commands (PowerShell):**

```powershell
Get-ChildItem src/app -Recurse -Filter "page.tsx" | Select-Object -ExpandProperty FullName ; Get-ChildItem src/app/api -Recurse -Filter "route.ts" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName ; rg "export (async )?function" src/server --files-with-matches 2>$null
```

**Output outline:**

1. Cabeçalho com evidence_manifest
2. System layers (diagrama ASCII)
3. Frontend: rotas, padrão page + *-content, components
4. Backend: server actions, API routes (listar paths)
5. Data flow: Read/Write/Sync
6. Key patterns: ADR-001, ADR-002, ADR-004
7. known_gaps

---

### 5.4 PRD / Capability map brownfield

**Objective:** PRD com capacidades demonstráveis — link para rota, componente ou API. O que estiver só em épicos antigos → marcar como legado até verificar no código.

**Hard constraints:** Global Contract. Só incluir feature se houver path no `evidence_manifest`.

**Discovery commands (PowerShell):**

```powershell
Get-ChildItem src/app -Directory -Depth 1 | Where-Object { $_.Name -notmatch "^\(" } | Select-Object -ExpandProperty Name ; Get-Content docs/reference/PROJECT-CURRENT-STATE.md -Head 80 ; Get-Content docs/stories/EPIC-INDEX.md -Head 60
```

**Output outline:**

1. Cabeçalho com evidence_manifest
2. Capacidades por módulo/rota (link path para cada)
3. Legado/não verificado (lista explícita com `NAO_VERIFICADO_NO_REPO`)
4. known_gaps

---

### 5.5 Operações (setup, deploy, test)

**Objective:** Scripts `npm run` do package.json, supabase/README.md, variáveis em .env.example. Sem secrets.

**Hard constraints:** Global Contract.

**Discovery commands (PowerShell):**

```powershell
Get-Content package.json | Select-String '"scripts"' -Context 0,50 ; Get-Content .env.example -ErrorAction SilentlyContinue ; Get-Content supabase/README.md -Head 100
```

**Output outline:**

1. Cabeçalho com evidence_manifest
2. npm scripts (copiar do package.json)
3. Env vars (nomes apenas, de .env.example)
4. Supabase: migrations, local dev
5. Build/deploy: referência a build-deploy-gates.md
6. known_gaps

---

### 5.6 Índice mestre (docs/README.md)

**Objective:** Atualizar docs/README.md para refletir paths reais. Estrutura AIOX: `reference/`, `prd/`, `adr/`, `guides/`, `engineering/`, `architecture/`. Apontar para este pack.

**Hard constraints:** Global Contract. Nenhum link para ficheiro inexistente.

**Discovery commands (PowerShell):**

```powershell
Get-ChildItem docs -Recurse -File -Filter "*.md" | Select-Object -ExpandProperty FullName | ForEach-Object { $_.Replace((Get-Location).Path + "\", "") }
```

**Output outline:**

1. Estrutura real de docs/ (árvore ou lista)
2. Links para documentos existentes
3. Link para docs/engineering/COMPOSER-DOCUMENTATION-PACK.md
4. Estrutura AIOX: reference/, prd/, adr/, guides/, engineering/, architecture/

---

## 6. ORDEM DE PRODUÇÃO (dependências)

1. Snapshot de versão
2. Modelo de dados atual
3. Arquitetura e fluxos
4. PRD / capability map brownfield
5. Operações
6. Índice mestre

Cada artefacto deve ser produzido em sessão Composer separada, com `git_ref` fixado no início da sessão.

---

## 7. GOVERNANÇA AIOX

- Tratar cada onda de documentação como entrega verificável.
- ADR: novas decisões só entram se inferíveis do código + migrações; senão, status `Proposed` e evidências — ou não criar.
- Revisão humana: checklist contra [docs/guides/CONTEXT-ENGINEERING-RULES.md](../guides/CONTEXT-ENGINEERING-RULES.md) RULE 1 e RULE 2 (pós-deploy / pós-merge).

---

**Last Updated:** 2026-03-21
