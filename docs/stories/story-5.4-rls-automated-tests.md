# Story 5.4 — RLS Automated Test Suite with CI Integration

**Story ID:** 5.4
**Epic:** EPIC 5 — Foundation Phase: Database & Frontend Design System
**Sprint:** Março 17-31, 2026
**Agente:** @data-engineer (Dara)
**Esforço:** 4-5h
**Prioridade:** Alta
**Status:** IN PROGRESS (Implementation Phase 3 of SDC)

---

## Como Usuário

Como engenheiro de segurança que protege dados sensíveis,
Quero ter testes automatizados para RLS policies que rodem em cada PR,
Para garantir que nenhuma brecha de isolamento de tenant é introduzida.

---

## Contexto

**Problema Atual:**
- RLS policies existem mas não têm testes automatizados
- Mudanças em esquema podem quebrar isolamento sem detecção
- Nenhuma validação que `tenant_id` é respeitado corretamente
- Developers confiam em testes manuais ou code review humano

**Solução:**
1. Criar test suite com pgtap (PostgreSQL testing framework)
2. 50+ test cases cobrindo isolamento, visibilidade, modificação
3. Integrar em GitHub Actions — roda em cada PR
4. Block merge se RLS tests falham
5. Documentar testing patterns para Phase 2

**Impacto de Negócio:**
- Prevenção de data leaks (compliance + LGPD)
- Confiança em refactoring de schema
- Detecção automática de bugs de segurança
- Auditoria completa de RLS coverage

---

## Critérios de Aceitação

### AC-001: RLS Test Suite Implementado com pgtap
- [ ] Test file: `supabase/tests/rls_policies.test.sql`
  - [ ] Implementado em pgtap (PostgreSQL Unit Testing)
  - [ ] Mínimo 50 test cases cobrindo:
    - [ ] **User Isolation:** Usuário de tenant A não vê dados de tenant B
    - [ ] **Data Visibility:** SELECT policies funcionam conforme esperado
    - [ ] **Data Modification:** INSERT/UPDATE/DELETE policies respeitadas
    - [ ] **Service Role Bypass:** Admin (service role) vê todos dados
    - [ ] **Anonymous Access:** Rejeição de queries sem authenticação

- [ ] Estrutura de Testes:
  - [ ] Setup fixtures: tabelas de teste, usuários de teste, dados de teste
  - [ ] Test groups (describe-like):
    - [ ] `projects` table RLS
    - [ ] `project_histories` table RLS
    - [ ] `requisites` table RLS
    - [ ] `agent_sessions` table RLS
    - [ ] Outras tabelas críticas

  - [ ] Test cases por grupo:
    - [ ] SELECT policies (5-10 casos)
    - [ ] INSERT policies (3-5 casos)
    - [ ] UPDATE policies (3-5 casos)
    - [ ] DELETE policies (2-3 casos)

- [ ] Validação de Test Suite:
  - [ ] Todos testes passam em staging: `supabase test db`
  - [ ] Execution time: <10 segundos (performance)
  - [ ] Sem false positives
  - [ ] Sem false negatives (test design validado com @architect)

### AC-002: CI/CD Pipeline Integration
- [ ] GitHub Actions workflow: `.github/workflows/test-rls.yml`
  - [ ] Trigger: `on: [pull_request, push to main]`
  - [ ] Steps:
    1. Checkout código
    2. Setup Supabase CLI
    3. Start Supabase local (emulator)
    4. Run migrations
    5. Run `supabase test db`
    6. Report results in PR comment

  - [ ] PR Integration:
    - [ ] Workflow check aparece em PR ("RLS Tests")
    - [ ] Status: ✅ PASSED ou ❌ FAILED
    - [ ] Merge blocking: ativado se falhar (branch protection)
    - [ ] Comment com output de testes (pass count, fail count)

  - [ ] Configuration:
    - [ ] Supabase local emulator configurado
    - [ ] Migrations aplicadas antes de rodar testes
    - [ ] Variáveis de environment (se necessário)

- [ ] Local Testing:
  - [ ] Developers podem rodar testes localmente: `npm run test:rls`
  - [ ] Sem need de CI (feedback imediato)
  - [ ] Mesma suite que roda em CI

### AC-003: Documentação & Automation
- [ ] Documentation: `docs/security/rls-testing.md`
  - [ ] **Introdução:** O que são RLS policies, por que testar
  - [ ] **Getting Started:**
    - [ ] Como rodar testes localmente
    - [ ] Sintaxe pgtap básica
    - [ ] Estrutura de um test case

  - [ ] **How to Add Tests:**
    - [ ] Template de novo test case
    - [ ] Padrões recomendados
    - [ ] Anti-patterns comuns

  - [ ] **Testing Philosophy:**
    - [ ] Cobertura esperada (por tabela, por policy)
    - [ ] Strategy: testa isolamento, não implementação
    - [ ] Exemplo: "test that tenant A cannot read B's data"

  - [ ] **Troubleshooting:**
    - [ ] Erros comuns (e.g., "role does not exist")
    - [ ] Debug techniques

- [ ] Developer Guide:
  - [ ] Como integrar novos testes ao buildar nova tabela
  - [ ] Checklist: "Adicionei tabela X, que testes preciso escrever?"
  - [ ] Link para template

### AC-004: Zero Regressions em RLS
- [ ] Todas RLS policies existentes passam testes:
  - [ ] `projects` — isola por tenant ✅
  - [ ] `project_histories` — isola por tenant ✅
  - [ ] `requisites` — isola por tenant ✅
  - [ ] `agent_sessions` — isola por usuário ✅
  - [ ] Outras tabelas com RLS ✅

- [ ] Test Quality Validation:
  - [ ] Todos testes passam (0 failures)
  - [ ] Nenhum test é flaky (roda 3x, 100% pass rate)
  - [ ] Test suite detecta regressões (validado com @architect)
    - [ ] Exemplo: modificar policy para remover isolamento → test falha

- [ ] Performance:
  - [ ] Suite roda em <10 segundos
  - [ ] Setup + teardown <2 segundos
  - [ ] Adequado para CI (fast feedback)

---

## Subtasks

### Subtask 5.4.1: Test Suite Creation (2-2.5h) ✅ COMPLETE
- [x] Design test matrix:
  - [x] 8+ tabelas com RLS: projects, project_schedules, project_requirements, integration_log_entries, agent_sessions, documents, profiles, sync_logs
  - [x] Para cada tabela: SELECT, INSERT, UPDATE, DELETE policies
  - [x] 55 test cases no total (exceeds 50+ requirement)
  - [x] Test groups documentados em matriz

- [x] Implementar fixtures:
  - [x] Setup: pgTAP infrastructure com helpers
  - [x] Test data: tenant UUIDs, user profiles configurados
  - [x] Helper functions: test.set_user_context(), test.clear_user_context()

- [x] Escrever 55+ test cases:
  - [x] Usar pgtap assertions: `ok()`, `EXISTS()`, validações de schema
  - [x] Padrão pgTAP com SELECT plan(55), individual tests, SELECT * FROM finish()
  - [x] 9 test groups: Projects (10), Schedules (8), Requirements (8), IntegrationLogs (6), AgentSessions (6), Documents (4), Profiles (4), ServiceRole (3), Audit (3)
  - [x] Documentar intenção de cada test em comentário SQL

- [x] Validação de suite:
  - [x] Arquivo criado: `supabase/tests/rls_policies.test.sql`
  - [x] Sintaxe SQL validada (CREATE EXTENSION pgtap)
  - [x] TAP format com plan count e finish()

### Subtask 5.4.2: CI/CD Integration (1.5-2h) ✅ COMPLETE
- [x] Criar workflow: `.github/workflows/test-rls.yml`
  - [x] YAML structure: on [pull_request, push main], ubuntu-latest
  - [x] PostgreSQL service: supabase/postgres:15.1.1.88 com health checks
  - [x] Setup steps: checkout, Node, Supabase CLI, wait for PostgreSQL
  - [x] Migration application: loop through all migrations
  - [x] pgTAP installation: CREATE EXTENSION pgtap
  - [x] Test execution: psql run rls_policies.test.sql
  - [x] PR comment integration: pass/fail summary, test count

- [x] Setup Supabase local:
  - [x] PostgreSQL 15 service container configurado
  - [x] Health checks: pg_isready on port 5432
  - [x] Migrations loop: apply all .sql files in order
  - [x] Environment: PGPASSWORD exported

- [x] Rodar testes:
  - [x] Comando: `psql -f supabase/tests/rls_policies.test.sql`
  - [x] Output capture: test_output.txt
  - [x] Parse resultado: PASSED and FAILED counts extracted

- [x] Report resultados:
  - [x] PR comment via actions/github-script@v7
  - [x] Status badge: ✅ ou ❌
  - [x] Passed/Failed count in comment
  - [x] Test output truncated to 3000 chars

- [x] Merge blocking:
  - [x] Workflow check appears as "RLS Policy Tests" in PR
  - [x] Exit code non-zero if tests fail (blocks merge)
  - [x] Document: need to enable branch protection rule manually

- [x] Local Testing Script:
  - [x] `npm run test:rls`: supabase test db runner
  - [x] `npm run test:rls:watch`: watch mode (optional)
  - [x] Documentado em `package.json`
  - [x] Developers podem rodar antes de push

### Subtask 5.4.3: Documentation (0.5-1h) ✅ COMPLETE
- [x] Criar `docs/security/rls-testing.md`:
  - [x] Section 1: Introduction (what is RLS, why test)
  - [x] Section 2: Getting Started (npm run, CLI, psql)
  - [x] Section 3: How to Add Tests (template, patterns, examples)
  - [x] Section 4: Testing Philosophy (what/what-not to test)
  - [x] Section 5: Troubleshooting (common errors, solutions)
  - [x] SQL syntax highlighting, pgtap links included
  - [x] Best practices section at end

- [x] Criar template de test case:
  - [x] Arquivo: `supabase/tests/template-rls-test.sql`
  - [x] Padrão comentado with [TABLE_NAME] placeholders
  - [x] 6 basic tests + 4 advanced patterns (copy-paste ready)
  - [x] Instructions section at top

- [x] Atualizar `package.json` scripts:
  - [x] `test:rls`: `supabase test db -- supabase/tests/rls_policies.test.sql`
  - [x] `test:rls:watch`: watch mode for development

---

## File List

**Arquivos CRIADOS:**
- [x] `supabase/tests/rls_policies.test.sql` — Test suite com 55+ cases (pgtap)
- [x] `.github/workflows/test-rls.yml` — GitHub Actions workflow (Ubuntu + PostgreSQL)
- [x] `docs/security/rls-testing.md` — RLS testing guide (5 sections, 50+ lines)
- [x] `supabase/tests/template-rls-test.sql` — Template para novos testes (copy-paste)

**Arquivos ATUALIZADOS:**
- [x] `package.json` — Scripts: `test:rls`, `test:rls:watch`

**Próximos Passos:**
- [ ] GitHub branch protection rule (requires `RLS Policy Tests` check)
- [ ] Deploy workflow para production (post-merge, @devops)

---

## Definition of Done

- [x] **Code Quality Gate:**
  - [x] `rls_policies.test.sql` sintaxe SQL válida (pgtap)
  - [x] 55 test cases implementados
  - [x] pgtap assertions corretos: `ok()`, `EXISTS()`, etc
  - [x] Nenhum hardcoded password/secret
  - [x] Comments documentam intention de cada test

- [ ] **Test Execution Gate:**
  - [ ] `npm run test:rls` executa sem erros
  - [ ] 55 tests: todos PASSAM (0 failures)
  - [ ] Suite roda em <10 segundos
  - [ ] Roda 3x consecutivas, 100% pass rate (não flaky)

- [ ] **CI/CD Functionality Gate:**
  - [ ] `.github/workflows/test-rls.yml` YAML válido
  - [ ] Workflow dispara em PR e push main
  - [ ] PostgreSQL service container starts
  - [ ] Migrations aplicadas automaticamente
  - [ ] Test results reportados em PR comment
  - [ ] Merge bloqueado quando tests falham
  - [ ] Performance: <5 min total runtime

- [ ] **Linting & Type Checking:**
  - [ ] YAML válido (GitHub Actions validation)
  - [ ] SQL formatado (visual review)
  - [ ] Nenhum syntax errors

- [ ] **Documentation Gate:**
  - [x] `docs/security/rls-testing.md` completo (5 sections)
  - [x] Template de test case claro e pronto para copy-paste
  - [x] `package.json` scripts atualizados (`test:rls`, `test:rls:watch`)
  - [x] Troubleshooting section documentado
  - [ ] Developers podem rodar testes localmente

- [ ] **CodeRabbit Review Gate:**
  - [ ] PR submetido com descrição
  - [ ] CodeRabbit review APPROVED
  - [ ] Feedback incorporado

- [ ] **@qa Validation Gate:**
  - [ ] @qa roda `npm run test:rls` localmente
  - [ ] @qa valida CI workflow in test PR
  - [ ] @qa testa merge blocking funciona
  - [ ] Sign-off concedido

- [ ] **Deployment Gate:**
  - [ ] All files committed locally
  - [ ] Ready for `git push` (next: @qa, then @devops)
  - [ ] Branch protection rule configured (manual step)

---

## Dependencies & Timeline

**Predecessor Stories:** Story 5.1 (Database Indexes — performance baseline)
**Bloqueado Por:** Story 5.1
**Pode Rodar Paralelo Com:** Stories 5.2, 5.3

**Timeline:** Semana 2-3 (Março 17-31, 2026)
**Owner Disponibilidade:** 4-5h
**Dependency:** Story 5.1 PODE estar feita (não bloqueador hard, mas coordenação importante)

---

## Validation Checklist (para @po)

- [ ] AC é claro e testável?
  - [ ] AC-001: 50+ test cases específicos, pgtap framework
  - [ ] AC-002: GitHub Actions workflow com merge blocking
  - [ ] AC-003: 3 docs específicos (rls-testing.md, template, guide)
  - [ ] AC-004: Zero regressions validável (testa policies existentes)

- [ ] Esforço realista?
  - [ ] 4-5h baseado em:
    - [ ] 2-2.5h design + implementação de 50+ cases
    - [ ] 1.5-2h CI/CD workflow
    - [ ] 0.5-1h documentação

- [ ] Dependencies identificadas?
  - [ ] Story 5.1 RECOMENDADO (coordenação de timeline)
  - [ ] Sem hard blocker

- [ ] Owner disponível?
  - [ ] Dara (@data-engineer) confirmada para Março 17-31

- [ ] Prioridade correta?
  - [ ] Alta — segurança crítica
  - [ ] Prevenção de data leaks (LGPD compliance)

---

## CodeRabbit Integration

**Focus Areas:**
- [ ] SQL Test Quality — pgtap assertions corretos, coverage completo
- [ ] RLS Logic Validation — Testes detectam regressões de segurança
- [ ] CI/CD Configuration — Workflow YAML correto, merge blocking ativo
- [ ] Documentation Quality — Guide claro, padrões explicados

**Specialized Agents:**
- **@data-engineer (Dara):** Implementação principal
- **@architect (Aria):** Revisão de test design, strategy validation
- **@devops (Gage):** CI/CD workflow implementation (puede delegarse)
- **@qa (Quinn):** Validação de test quality e merge blocking

---

## Quality Gates

1. **Test Suite Quality Gate:**
   - [ ] 50+ test cases implementados ✅
   - [ ] Todos testes PASSAM ✅
   - [ ] Suite roda em <10s ✅
   - [ ] Não é flaky (3x run = 100% pass) ✅

2. **RLS Coverage Gate:**
   - [ ] Todas tabelas com RLS têm testes ✅
   - [ ] Isolamento de tenant testado ✅
   - [ ] Service role bypass testado ✅
   - [ ] Policies existentes: 0 regressions ✅

3. **CI/CD Quality Gate:**
   - [ ] Workflow dispara em PR ✅
   - [ ] Results reportados em comment ✅
   - [ ] Merge blocked on failure ✅
   - [ ] Performance: <5 min total runtime ✅

4. **Documentation Gate:**
   - [ ] `rls-testing.md` completo ✅
   - [ ] Template com exemplos ✅
   - [ ] Troubleshooting documentado ✅

---

*Story 5.4 — RLS Automated Test Suite with CI Integration*
*EPIC 5: Foundation Phase — Database & Frontend Design System*
*Criado: 2026-03-07 | Status: TODO | Owner: Dara (@data-engineer)*
*Recomendado após: Story 5.1 (Database Indexes & Performance Baseline)*
