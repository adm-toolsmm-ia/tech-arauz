# System Architecture - Tech Arauz (As-Is)

Data da analise: 2026-02-26

## 1. Visao geral

Tech Arauz e uma aplicacao web em Next.js (App Router) com backend principal em Supabase e um servico AI separado em Python/FastAPI.  
O produto combina:

- Gestao de projetos (dashboard, projetos, cronogramas, integracoes)
- Integracao com ERP Espaider para sincronizacao de dados
- Modulo de agentes AI (via proxy para servico FastAPI)
- Base multi-tenant com controle por `tenant_id` e RLS

Arquitetura macro:

```text
[Browser]
   |
   v
[Next.js 14 App Router]
   |--- Server Components + Server Actions --> [Supabase]
   |--- API Routes (/api/agents/*) ----------> [AI Service FastAPI :8000]
   |--- API Routes (/api/integracoes/*) -----> [Supabase + Integracao Espaider]
   |
   v
[Tailwind + shadcn/ui + React Query]
```

## 2. Stack tecnica observada

### Frontend e BFF (Next.js)

- Next.js `^14.2.0` + React `^18.3.0`
- TypeScript strict
- TailwindCSS + shadcn/ui (Radix primitives)
- React Query para estado assicrono no cliente
- Server Components + Server Actions + API Routes

### Backend de dados

- Supabase (PostgreSQL + Auth + RLS)
- 38 migrations SQL em `supabase/migrations/`
- Transform layer DB -> UI em `src/lib/transformers/project.ts`

### Integracoes

- ERP Espaider via `src/integrations/espaider/*`
  - retry
  - backoff exponencial
  - circuit breaker
  - mapeamento de datasets (Projetos, Entregas, Cronogramas, Requisitos + filhos)

### AI Service (separado)

- FastAPI + LangChain/LangGraph + LangSmith
- Endpoints v2 autenticados por JWT para CRUD de agentes
- Endpoints legados/mock para traces e budget

## 3. Estrutura logica do codigo

### Camada de apresentacao

- Rotas em `src/app/*` (ex.: `dashboard`, `projetos`, `integracoes`, `agentes`)
- Padrao recorrente: `page.tsx` (server) + `*-content.tsx` (client)
- Componentes compartilhados em `src/components/*`

### Camada de aplicacao

- Server Actions em `src/app/actions/*`
- Servicos front em `src/services/*` e hooks em `src/hooks/*`
- Filtros e utilitarios em `src/lib/*`

### Camada de integracao

- `src/lib/sync/espaider-sync.ts` orquestra ingestao completa
- API Routes para integracao:
  - `src/app/api/integracoes/*`
  - `src/app/api/agents/*` (proxy para FastAPI)

### Camada de dados

- Supabase como fonte principal
- Tabelas principais: `projects` + tabelas filhas (schedules, deliveries, histories, approvers, budgets)
- Tabelas de integracao/logs: `espaider_apis`, `integration_log_entries`, `sync_logs`

## 4. Fluxos principais

### 4.1 Login e sessao

1. Usuario autentica via Supabase Auth (`/login`)
2. Paginas server-side consultam `supabase.auth.getUser()`
3. Sem usuario -> redirect para `/login`

### 4.2 Dashboard / Projetos

1. Server Component consulta `projects` com relacionamentos
2. Dados sao transformados DB -> UI
3. Client component aplica filtros, KPIs e interacoes (kanban/lista/split)

### 4.3 Sync Espaider

1. Usuario admin chama `/api/integracoes/sync`
2. Route cria service client (bypass RLS controlado)
3. `executeSyncAll()` busca datasets no Espaider
4. Mapeia e faz upsert em Supabase
5. Escreve logs/sumarios de execucao

### 4.4 Gestao de agentes AI

1. Front chama `/api/agents/*` no Next.js
2. API route valida usuario e repassa JWT para FastAPI (`/api/agents/v2/*`)
3. FastAPI usa `tenant_id` do token para isolamento de dados

## 5. Pontos fortes

- Separacao clara entre web app e AI service
- Estrategia multi-tenant aplicada com `tenant_id` + RLS
- Integracao Espaider com resiliencia (retry, timeout, circuit breaker)
- Uso de headers de seguranca no Next.js
- Base de migrations extensa e historico versionado

## 6. Debitos tecnicos identificados (nivel sistema)

1. **Drift de arquitetura declarada vs implementada**  
   `configs/project.yaml` declara `api_layer: trpc`, mas a implementacao real usa API Routes + Server Actions.  
   Impacto: confusao arquitetural e onboarding mais lento.

2. **Autenticacao parcial no AI service**  
   Endpoints `/traces` e `/budget` no FastAPI nao exigem JWT (somente os endpoints `/agents/v2/*` exigem).  
   Impacto: superficie de exposicao se o servico ficar acessivel fora da rede interna.

3. **Fallback inseguro de segredo JWT**  
   `SUPABASE_JWT_SECRET` no FastAPI possui default hardcoded (`super-secret-jwt-token-change-me`).  
   Impacto: risco de seguranca se ambiente subir sem segredo real.

4. **Constantes tenant hardcoded**  
   Rotas de integracao usam `TENANT_ARAUZ_ID` fixo como fallback.  
   Impacto: reduz portabilidade multi-tenant e aumenta risco de escrita no tenant errado.

5. **Alta complexidade em modulos centrais**  
   Arquivos muito grandes (ex.: `espaider-sync.ts` ~1841 linhas, `projects-content.tsx` ~1219 linhas).  
   Impacto: manutencao, testes e evolucao mais custosos.

6. **Duplicacao de logica de dominio no frontend**  
   Calculos como `getOverdueData` aparecem em mais de uma tela (dashboard/projetos).  
   Impacto: inconsistencias e regressao por mudancas paralelas.

7. **Cobertura de testes desigual**
   - `services/ai/tests` praticamente vazio
   - testes JS em `tests/*` usam estilo Jest e nao entram no `vitest.include`
   - fluxo critico de sync/endpoints ainda sem cobertura robusta
   Impacto: risco maior em refactors e releases.

8. **CI nao executa typecheck explicito**
   Workflow atual roda lint, format, test e build, mas nao roda `npm run typecheck`.  
   Impacto: possivel escape de erro de tipo sem bloqueio direto.

## 7. Riscos arquiteturais

- Dependencia operacional do AI service local (`http://localhost:8000`) para features de agentes
- Acoplamento entre regras de negocio e componentes de UI extensos
- Mistura de estrategias de acesso a dados (Server Actions, API Routes e servicos client-side)
- Maturidade de testes inferior a criticidade dos fluxos de sincronizacao e seguranca

## 8. Recomendacoes imediatas (quick wins)

1. Remover defaults inseguros e exigir `SUPABASE_JWT_SECRET` em ambiente AI.
2. Proteger `/traces` e `/budget` com a mesma dependencia JWT de `/agents/v2/*`.
3. Extrair regras compartilhadas (`getOverdueData`, KPIs, filtros) para `src/lib/domain/*`.
4. Adicionar `npm run typecheck` no CI.
5. Iniciar refactor incremental do `espaider-sync.ts` em modulos por dataset.

## 9. Padrao de engenharia para novos modulos

Foi definido um padrao formal de arquitetura e design para novos modulos/tabelas, com baseline no modulo `projetos`.

- Documento normativo: `docs/architecture/module-standards.md`
- Escopo: tabela (RLS/multi-tenant), pagina server, client content, filtros, Kanban, lista, SplitView e dialogs CRUD
- Objetivo: reduzir divergencias de UX/arquitetura entre modulos, especialmente em `auxiliares/*`

Este padrao passa a ser gate de entrega para novas stories de modulo/feature.

## 10. Governanca de seguranca e observabilidade

Documentos operacionais adicionados para governanca continua:

- Matriz de autorizacao DB x API: `docs/architecture/authorization-matrix.md`
- Politica de retencao de logs: `docs/architecture/log-retention-policy.md`

## 11. Proximos passos para o workflow brownfield-discovery

Com a Fase 1 concluida, os proximos artefatos esperados no workflow sao:

- Fase 2 (data-engineer): `supabase/docs/SCHEMA.md`
- Fase 2 (data-engineer): `supabase/docs/DB-AUDIT.md`
- Fase 3 (ux-design-expert): `docs/frontend/frontend-spec.md`
