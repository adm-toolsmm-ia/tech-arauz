# Story 5.4 — RLS Automated Test Suite with CI Integration

**Story ID:** 5.4
**Epic:** EPIC 5 — Foundation Phase: Database & Frontend Design System
**Sprint:** Março 17-31, 2026
**Agente:** @data-engineer (Dara)
**Esforço:** 4-5h
**Prioridade:** Alta
**Status:** TODO

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

### Subtask 5.4.1: Test Suite Creation (2-2.5h)
- [ ] Design test matrix:
  - [ ] Listar todas as tabelas com RLS (projetos, históricos, requisitos, sessões, etc)
  - [ ] Para cada tabela, listar policies (SELECT, INSERT, UPDATE, DELETE)
  - [ ] Para cada policy, definir test cases (isolation, visibility, modification)
  - [ ] Document em matriz (tabela, policy, test cases)

- [ ] Implementar fixtures:
  - [ ] Setup: criar tenants, usuários, dados de teste
  - [ ] Teardown: limpar dados pós-testes
  - [ ] Helpers: funções pgtap para assertions comuns
    ```sql
    CREATE OR REPLACE FUNCTION assert_user_isolation(
      tenant_id_a UUID, tenant_id_b UUID, table_name TEXT
    ) AS $$
    BEGIN
      -- Set session var for tenant A
      PERFORM set_config('tenant_id', tenant_id_a::text, true);
      -- Assert cannot see B's data
      ASSERT NOT EXISTS(SELECT 1 FROM table_name WHERE tenant_id = tenant_id_b);
    END;
    $$ LANGUAGE plpgsql;
    ```

- [ ] Escrever 50+ test cases:
  - [ ] Usar pgtap assertions: `ok()`, `is()`, `throws_ok()`, etc
  - [ ] Padrão para cada test:
    ```sql
    SELECT plan(N); -- N = number of tests

    SELECT is(
      (SELECT COUNT(*) FROM projects WHERE tenant_id = 'tenant-b'::uuid),
      0::bigint,
      'User from tenant A cannot see tenant B projects'
    );

    SELECT throws_ok(
      'INSERT INTO projects (tenant_id, ...) VALUES ($1, ...)',
      'new row violates row-level security policy',
      'User cannot insert data for different tenant'
    );

    SELECT * FROM finish();
    ```

  - [ ] Categorizar testes em grupos (SELECT, INSERT, UPDATE, DELETE)
  - [ ] Documentar intenção de cada test em comentário SQL

- [ ] Validação de suite:
  - [ ] Rodar localmente (Supabase CLI)
  - [ ] Todos testes passam
  - [ ] Timing <10 segundos
  - [ ] Output legível (TAP format)

### Subtask 5.4.2: CI/CD Integration (1.5-2h)
- [ ] Criar workflow: `.github/workflows/test-rls.yml`
  - [ ] YAML structure:
    ```yaml
    name: RLS Policy Tests
    on: [pull_request, push: {branches: [main]}]
    jobs:
      test:
        runs-on: ubuntu-latest
        services:
          postgres:
            image: supabase/postgres:latest
            ...
        steps:
          - uses: actions/checkout@v3
          - uses: supabase/setup-cli@v1
          - run: supabase start
          - run: npm run db:migrate
          - run: npm run test:rls
          - uses: actions/github-script@v6
            if: always()
            with:
              script: |
                // Post comment com results
    ```

  - [ ] Setup Supabase local:
    - [ ] Docker containers para postgres
    - [ ] Migrations aplicadas (via `supabase db push`)
    - [ ] Environment vars configuradas

  - [ ] Rodar testes:
    - [ ] Comando: `supabase test db -- supabase/tests/rls_policies.test.sql`
    - [ ] Capturar output
    - [ ] Parse resultado (passed/failed count)

  - [ ] Report resultados:
    - [ ] PR comment com summary
    - [ ] Exemplo: "✅ RLS Tests: 52/52 passed"
    - [ ] Link para full output (se falhar)

  - [ ] Merge blocking:
    - [ ] Branch protection rule: require "test-rls" check
    - [ ] Não permite merge se test falha

- [ ] Local Testing Script:
  - [ ] `npm run test:rls` disponível
  - [ ] Documentado em `package.json`
  - [ ] Developers podem rodar antes de push

- [ ] Validação:
  - [ ] Trigger PR test com test code
  - [ ] Verificar que workflow roda
  - [ ] Verificar que resultado aparece em PR
  - [ ] Verificar que merge é bloqueado se falha

### Subtask 5.4.3: Documentation (0.5-1h)
- [ ] Criar `docs/security/rls-testing.md`:
  - [ ] Sections: Intro, Getting Started, How to Add, Philosophy, Troubleshooting
  - [ ] Código highlight (SQL)
  - [ ] Links para pgtap docs

- [ ] Criar template de test case:
  - [ ] Arquivo: `supabase/tests/template-rls-test.sql`
  - [ ] Padrão comentado
  - [ ] Pronto para copy-paste

- [ ] Atualizar `package.json` scripts:
  - [ ] `test:rls` — roda suite localmente

- [ ] Atualizar `README.md` (se necessário):
  - [ ] Seção "Testing" menciona RLS tests
  - [ ] Link para docs

---

## File List

**Arquivos a CRIAR:**
- `supabase/tests/rls_policies.test.sql` — Test suite com 50+ cases
- `.github/workflows/test-rls.yml` — GitHub Actions workflow
- `docs/security/rls-testing.md` — RLS testing guide
- `supabase/tests/template-rls-test.sql` — Template para novos testes

**Arquivos a ATUALIZAR:**
- `package.json` — Script `test:rls`
- `.github/workflows/` — Adicionar teste como merge blocker (branch protection)

**Suporte (LOCAL ONLY):**
- `scripts/validate-rls.sh` — Helper para rodar testes localmente (não commitado)

---

## Definition of Done

- [ ] Código escrito & revisado
  - [ ] `rls_policies.test.sql` sintaxe SQL válida
  - [ ] pgtap assertions corretos
  - [ ] Nenhum hardcoded password/secret

- [ ] Testes passando
  - [ ] `npm run test:rls` executa
  - [ ] 50+ tests: todos PASSAM (0 failures)
  - [ ] Suite roda em <10 segundos
  - [ ] Roda 3x, 100% pass rate (não flaky)

- [ ] CI/CD Funcionando
  - [ ] `.github/workflows/test-rls.yml` dispara em PR
  - [ ] Workflow roda e reporta resultados
  - [ ] Merge blocked quando test falha
  - [ ] PR comment mostra summary

- [ ] Linting & Type Checking
  - [ ] SQL formatado (se ferramenta disponível)
  - [ ] YAML válido (workflow)
  - [ ] Bash scripts (se houver) validados

- [ ] Documentação atualizada
  - [ ] `rls-testing.md` completo com exemplos
  - [ ] Template de test case claro
  - [ ] `package.json` scripts atualizados
  - [ ] Troubleshooting documentado

- [ ] CodeRabbit review
  - [ ] PR submetido com descrição
  - [ ] CodeRabbit review APPROVED
  - [ ] Feedback incorporado

- [ ] Validação @qa
  - [ ] @qa roda testes localmente
  - [ ] @qa valida CI workflow dispara em PR
  - [ ] @qa testa merge blocking funciona
  - [ ] Sign-off concedido

- [ ] Branch merged to main
- [ ] Deployado para staging

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
