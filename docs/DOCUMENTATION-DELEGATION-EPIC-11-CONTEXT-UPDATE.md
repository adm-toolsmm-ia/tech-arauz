# Delegação Oficial de Atualização de Documentações — EPIC 11 Context Sync
**Status:** 📋 EXECUTION PLAN (AIOX 10/10 Standard)
**Data:** 2026-03-16
**Orquestrador:** Orion (@aiox-master)
**Objetivo:** Sincronizar 10 documentações desatualizadas com estrutura ATUAL do código (v0.2.4)

---

## 📌 BRIEFING PARA TODA EQUIPE

### Objetivo Geral
Atualizar documentações técnicas para refletir **estrutura real do projeto v0.2.4**, baseado em:
- ✅ Código-fonte (frontend, backend, migrations)
- ✅ Padrões implementados (não planejados)
- ✅ Estrutura EPIC 11 (14 stories, 16 tabelas org_*)

### Restrições (NON-NEGOTIABLE)
- ❌ **ZERO invenção** — Tudo deve ser traçável ao código
- ❌ **Sem sugestões de melhoria** — Apenas documentar o que existe
- ❌ **Sem especulação** — Se não está no código, não documenta
- ✅ **Análise profunda** — Ler migrations, queries, components, server actions
- ✅ **Exemplos reais** — Copiar de código existente
- ✅ **Cross-referências** — Linkar com ORGANIZATION-SCHEMA.md, SOFTWARE-ARCHITECTURE.md, etc.

### Prazo
- **Fase 1 (Análise):** 2026-03-16 (1 dia)
- **Fase 2 (Documentação):** 2026-03-17 (1 dia, paralelo)
- **Fase 3 (Quality Gate):** 2026-03-18 (1 dia)
- **Merge Target:** 2026-03-18 EOD

### Garantia de Qualidade
- **AIOX Score Target:** 10/10 (completeness, accuracy, rastreabilidade)
- **Critério de Sucesso:** Zero feedback @qa, primeira passagem
- **Revisor Central:** @qa (Quinn) — gate definitivo

---

## 👥 DELEGAÇÃO POR AGENTE

### 1️⃣ @architect (Aria) — LEAD: 2 Documentações

#### Documentação 1.1: `AIOX-WORKFLOW-MAP.md`
**Status:** ⚠️ Desatualizado (sem data, predates EPIC 11)
**Objetivo:** Mapear 4 workflows com foco em EPIC 11 novidades
**Escopo:**
- Story Development Cycle (SDC) — 4 phases (Aria + Morgan co-lead Phase descriptions)
- QA Loop — verdicts e escalations
- Spec Pipeline — 6 phases com complexity scoring
- Brownfield Discovery — 10 phases (historical reference)

**Análise Necessária:**
```
Ler código de:
  - docs/stories/EPIC-11-Organizational-Enrichment-BPM-Mastery.md (master spec)
  - docs/stories/EPIC-11.1-*.md até EPIC-11.14-*.md (14 stories exemplo)
  - docs/governance/STORY-LIFECYCLE-GATES.md (gates detalhados)
  - .aiox-core/data/workflow-chains.yaml (workflow definitions, se existir)
```

**Entregáveis:**
- [ ] Seção: "SDC — Story Development Cycle (EPIC 11 Aligned)"
  - Phase 1: Create (@sm)
  - Phase 2: Validate (@po) — 10-point checklist
  - Phase 3: Implement (@dev) — 5 sub-phases
  - Phase 4: QA Gate (@qa) — 7-point checklist
- [ ] Seção: "QA Loop — Iterative Review with Verdicts"
  - Verdicts: APPROVE | REJECT | BLOCKED | WAIVED
  - Max iterations: 5
  - Escalation triggers (tempo + max iterations)
- [ ] Seção: "Spec Pipeline — 6 Phases"
  - Gather → Assess → Research → Write → Critique → Plan
  - Complexity scoring (3 classes: SIMPLE, STANDARD, COMPLEX)
- [ ] Seção: "Brownfield Discovery — 10 Phases" (reference, já documentado)

**Exemplo Concreto (COPIAR DO CÓDIGO):**
```markdown
### Story Development Cycle — Phase 3: Implement

**Agent:** @dev
**Inputs:** Validated story (from Phase 2)
**Task:** `dev-develop-story.md`
**Modes:** Interactive | YOLO | Pre-Flight
**CodeRabbit:** Self-healing max 2 iterations
**Output:** Story marked InReview, ready for Phase 4

**Exemplo Real (EPIC 11.1):**
- Story 11.1: Add responsible_roles to Activities
- @dev implements:
  - Migration 066: ALTER TABLE org_activities ADD COLUMN responsible_roles JSONB
  - Server action: updateActivityResponsibleRoles()
  - Component: ResponsibleRolesInput (tagging with autocomplete)
  - Tests: 12+ unit/integration tests
- CodeRabbit validates: lint + typecheck + tests pass
- Marks InReview → @qa gate
```

**Validação:**
- [ ] Nenhuma invenção (todos exemplos existem em docs/stories/)
- [ ] Links funcionam (cross-check com STORY-LIFECYCLE-GATES.md)
- [ ] Fases são executáveis (não abstratas)

**Checklist de Conclusão:**
- [ ] Seções completadas
- [ ] 3+ exemplos reais copiados
- [ ] Links internos validados
- [ ] Pronto para @qa review

---

#### Documentação 1.2: `module-standards.md`
**Status:** ⚠️ Desatualizado (genérico, falta v0.2.4 patterns)
**Objetivo:** Documentar padrões de modulo ATUAL (server actions, cockpit360, responsible_roles)
**Escopo:**

**Análise Necessária:**
```
Ler código de:
  - src/app/organizacoes/ (novo modulo EPIC 11, hierarchical)
  - src/app/atividades/ (activity-level features)
  - src/components/cockpit360/ (UI component pattern)
  - src/server/actions/ (42 server actions — ver exemplo de 2-3)
  - SOFTWARE-ARCHITECTURE.md (já atualizado, baseline)
```

**Entregáveis:**
- [ ] Seção: "EPIC 11 Module Pattern — Hierarchical Organization"
  ```
  src/app/organizacoes/
    ├── page.tsx (list + bulk operations)
    ├── [id]/
    │   ├── page.tsx (area detail + cockpit360)
    │   └── nucleos/
    │       ├── [nucleoId]/
    │       │   ├── page.tsx (nucleus detail)
    │       │   └── processos/
    │       │       ├── [processoId]/
    │       │       │   ├── page.tsx (process detail + SLAs)
    │       │       │   └── rotinas/
    │       │       │       └── [rotinaId]/
    │       │       │           └── atividades/
    │       │       │               └── [atividadeId]/
    │       │       │                   └── page.tsx (activity detail)
    ├── components/
    │   ├── AreaCockpit360.tsx
    │   ├── NucleusCockpit360.tsx
    │   ├── ProcessCockpit360.tsx
    │   ├── ActivityCockpit360.tsx
    │   └── ResponsibleRolesInput.tsx
    ├── actions.ts (server actions: get*, create*, update*, delete*, bulk*)
    └── schema.ts (types, validation)
  ```
- [ ] Seção: "Server Action Pattern (42 Total)"
  ```
  Pattern: export async function updateOrganizationalEntity() {
    - Input: tenantId (via auth), entityId, changes
    - Validation: RLS check, type validation
    - Mutation: Supabase update
    - Return: { success, data, error }
  }

  Exemplo (COPIAR):
  // src/server/actions/org/updateActivityResponsibleRoles.ts
  "use server"
  export async function updateActivityResponsibleRoles(
    activityId: string,
    roles: string[]
  ) {
    const { data, error } = await supabase
      .from("org_activities")
      .update({ responsible_roles: roles })
      .eq("id", activityId)
      .select()

    return { success: !error, data, error }
  }
  ```
- [ ] Seção: "Cockpit360 Component Pattern"
  - Real-time metrics display (org_process_metrics)
  - Hierarchical navigation (Areas → Nuclei → Processes → Routines → Activities)
  - Responsible roles visualization (JSONB rendering)
  - SLA compliance indicator (color-coded)
- [ ] Seção: "Responsible Roles JSONB Pattern"
  - Storage: JSONB array of role strings
  - Query: `WHERE responsible_roles @> '["diretor"]'` (Postgres JSONB contains)
  - UI: Multi-tag input with autocomplete from org_role_definitions
  - Validation: Roles must exist in org_role_definitions

**Exemplo Real:**
```typescript
// Migration 066: Add responsible_roles to org_activities
ALTER TABLE public.org_activities
ADD COLUMN responsible_roles JSONB DEFAULT '[]' NOT NULL;

// Component usage
<ResponsibleRolesInput
  value={["analista_senior", "coordenador"]}
  onChange={(roles) => updateActivityResponsibleRoles(activityId, roles)}
  availableRoles={roleDefinitions}
/>
```

**Validação:**
- [ ] Padrão existe em código (não inventado)
- [ ] Exemplo compilável (syntax correto)
- [ ] Cross-reference com ORGANIZATION-SCHEMA.md (org_role_definitions, responsible_roles columns)

**Checklist de Conclusão:**
- [ ] Seções completadas
- [ ] 5+ exemplos de código reais
- [ ] Nenhuma invenção de padrão
- [ ] Pronto para @qa review

---

### 2️⃣ @data-engineer (Dara) — LEAD: 1.5 Documentações

#### Documentação 2.1: `DEPENDENCY-MANAGEMENT.md`
**Status:** ⚠️ Desatualizado (falta pgvector, embeddings libs)
**Objetivo:** Documentar dependências ATUAIS, com foco EPIC 11 (pgvector, embeddings)
**Escopo:**

**Análise Necessária:**
```
Ler código de:
  - package.json (versões reais)
  - npm ls (tree de dependências)
  - migrations/070_create_activity_templates_and_process_versions.sql
  - ORGANIZATION-SCHEMA.md (org_knowledge_entries com pgvector(1536))
```

**Entregáveis:**
- [ ] Seção: "EPIC 11 New Dependencies"
  ```
  pgvector@0.x.x — PostgreSQL vector type
  - Purpose: Semantic search on org_knowledge_entries
  - Dimension: 1536 (OpenAI embeddings)
  - Similarity metric: cosine
  - Npm: none (server-side, Postgres extension)

  openai@^4.x.x — OpenAI API client
  - Purpose: Generate embeddings for org_knowledge_entries
  - Usage: embeddings endpoint
  - Environment: OPENAI_API_KEY required
  ```
- [ ] Seção: "Dependency Update Strategy"
  - Critical: security patches (npm audit fix)
  - Major: quarterly (after testing)
  - Minor: monthly (dev only)
  - Patch: as-needed
- [ ] Seção: "Vulnerability Management"
  - npm audit run before each PR
  - npm audit fix for <7.0 vulnerabilities
  - Manual review for >7.0 (approval required)

**Versões Corretas (LEIA DE package.json):**
```json
{
  "dependencies": {
    "next": "^14.x.x",
    "react": "^18.x.x",
    "typescript": "^5.x.x",
    "@supabase/supabase-js": "^2.x.x",
    "@tanstack/react-query": "^5.x.x",
    "tailwindcss": "^3.x.x",
    "openai": "^4.x.x"  // EPIC 11 — embeddings
  }
}
```

**Validação:**
- [ ] Versões correspondem a package.json atual
- [ ] pgvector listado (server-side lib)
- [ ] Nenhuma invenção de dependency

**Checklist de Conclusão:**
- [ ] Seções completadas
- [ ] package.json versões validadas
- [ ] Pronto para @qa review

---

#### Documentação 2.2: `build-deploy-gates.md` (CO-LEAD com @devops)
**Status:** ⚠️ Desatualizado (falta pgvector validation gates)
**Objetivo:** Documentar gates de build/deploy com validações EPIC 11
**Escopo:**
- @data-engineer: pgvector indexes + RLS policies gates
- @devops: deployment + migration gates

**Análise Necessária (Dara):**
```
Ler código de:
  - migrations/066-070/ (pgvector setup, RLS policies)
  - ORGANIZATION-SCHEMA.md (16 org_* tables com RLS)
  - Database validation queries
```

**Entregáveis (Dara):**
- [ ] Seção: "Pre-Deploy Gate: pgvector Index Validation"
  ```
  Gate Name: pgvector-indexes-exist
  Trigger: Pre-deploy to production
  Validation:
    - org_knowledge_entries.embedding has ivfflat index ✓
    - Index dimension = 1536 ✓
    - Similarity metric = cosine ✓
  Failure Action: Block deploy, run CREATE INDEX manually
  ```
- [ ] Seção: "Pre-Deploy Gate: RLS Policy Validation"
  ```
  Gate Name: rls-policies-valid
  Trigger: Pre-deploy
  Validation:
    - All 16 org_* tables have SELECT/INSERT/UPDATE/DELETE RLS policies ✓
    - Policies use tenant_id = auth.jwt()->>'tenant_id' ✓
    - No tables missing RLS ✓
  Test: pgTAP rls-validation tests pass
  ```
- [ ] Seção: "Migration Order Validation"
  ```
  Gate: migrations-sequential
  Validate:
    - Migration 066 (responsive_roles) runs before 067 ✓
    - Migration 068 (SLAs) runs before 069 (roles) ✓
    - No skipped migrations ✓
  Order: 066 → 067 → 068 → 069 → 070 (MUST)
  ```

**Validation Query (EXEMPLO):**
```sql
-- Validate pgvector indexes
SELECT indexname FROM pg_indexes
WHERE tablename = 'org_knowledge_entries'
AND indexname LIKE '%embedding%';
-- Expected: 1 row (ivfflat index on embedding column)

-- Validate RLS policies exist
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public' AND tablename LIKE 'org_%'
GROUP BY tablename;
-- Expected: 16 rows, each with 4+ policies (SELECT, INSERT, UPDATE, DELETE)
```

**Checklist de Conclusão:**
- [ ] Gates implementáveis (existem queries)
- [ ] Validações traçáveis ao código
- [ ] Pronto para @devops co-lead + @qa review

---

### 3️⃣ @dev (Dex) — LEAD: 2 Documentações

#### Documentação 3.1: `AI-AGENT-ARCHITECTURE.md`
**Status:** ⚠️ Desatualizado (falta contexto de embeddings EPIC 11)
**Objetivo:** Adicionar seção de AI context engineering (embeddings, semantic search, role injection)
**Escopo:**

**Análise Necessária:**
```
Ler código de:
  - docs/guides/AI-CONTEXT-ENGINEERING.md (já completa)
  - src/server/actions/search/ (semantic search implementation)
  - migrations/068_create_process_slas_and_metrics.sql (metrics for context)
  - Exemplos de prompt engineering com role context
```

**Entregáveis:**
- [ ] Seção: "AI Context Engineering (EPIC 11)"
  - **Role Context Injection:** Injetar responsible_roles em prompts
    ```
    Exemplo: Agent prompt injected:
    "You are an analyst role [analista_senior, coordenador].
    Your responsible_roles allow you to:
    - View: all activities in assigned routines
    - Create: new activities in assigned nucleus
    - Approve: completions in assigned process"
    ```
  - **Metrics Transformer:** Convert org_process_metrics → context
    ```
    Metric → Prompt:
    "Process compliance: 87% (target 95%)
     Last 30 days: 5 breaches
     Average cycle time: 3.2 days (SLA: 2 days)"
    ```
  - **Knowledge Base Retrieval:** Use pgvector similarity search
    ```
    Prompt injection:
    "Relevant knowledge entries (semantic search):
    1. [Title] (similarity: 0.89)
    2. [Title] (similarity: 0.87)"
    ```

- [ ] Seção: "Agent Personas (Updated for EPIC 11)"
  - @dev (Dex) — now uses AI context for responsible_roles validation
  - @architect (Aria) — now uses metrics for performance budgeting
  - @qa (Quinn) — now validates embeddings quality
  - Outros 7 agentes — unchanged

- [ ] Seção: "Prompt Engineering Patterns"
  - Pattern 1: Role-based constraints
  - Pattern 2: Metrics-aware decisions
  - Pattern 3: Knowledge-enhanced reasoning

**Exemplo Real (COPIAR):**
```
Server Action: updateActivityWithContext()

const context = await buildAIContext(activityId)
// Returns:
// {
//   role: ["analista_senior"],
//   metrics: { compliance_pct: 87, avg_cycle_time: 3.2 },
//   knowledge: [ { title: "best_practice", similarity: 0.89 } ]
// }

const prompt = `
You are a ${context.role[0]}.
Activity metrics: ${JSON.stringify(context.metrics)}
Relevant knowledge: ${context.knowledge.map(k => k.title).join(", ")}

Update the activity considering above context.
`
```

**Validação:**
- [ ] Contexto vem de código real (AI-CONTEXT-ENGINEERING.md é fonte)
- [ ] Exemplos compiláveis
- [ ] Pronto para agent prompts (não especulação)

**Checklist de Conclusão:**
- [ ] Seções completadas
- [ ] 3+ exemplos reais integrados
- [ ] Cross-reference com AI-CONTEXT-ENGINEERING.md
- [ ] Pronto para @qa review

---

#### Documentação 3.2: `OPERATIONAL-RUNBOOK.md`
**Status:** ⚠️ Desatualizado (falta SLA monitoring procedures EPIC 11.3)
**Objetivo:** Adicionar procedures para monitorar org_process_slas e alertar breaches
**Escopo:**

**Análise Necessária:**
```
Ler código de:
  - migrations/068_create_process_slas_and_metrics.sql (schema)
  - ORGANIZATION-SCHEMA.md (org_process_slas, org_process_metrics tables)
  - Server actions para consultar metrics
  - Dashboard queries para alerting
```

**Entregáveis:**
- [ ] Seção: "Process SLA Monitoring"
  ```
  Procedure 1: Daily SLA Health Check
  1. Query: SELECT * FROM org_process_metrics
              WHERE metric_date = TODAY()
              AND compliance_pct < target_compliance
  2. Alert: Send to @devops if breach found
  3. Action: Create incident in monitoring system

  Query Exemplo:
  SELECT
    p.name,
    m.metric_date,
    m.compliance_pct,
    s.target_quality_percentage,
    (m.compliance_pct - s.target_quality_percentage) as variance
  FROM org_process_metrics m
  JOIN org_processes p ON m.process_id = p.id
  JOIN org_process_slas s ON p.id = s.process_id
  WHERE m.metric_date = CURRENT_DATE
  AND m.compliance_pct < s.target_quality_percentage
  ORDER BY variance DESC;
  ```

- [ ] Seção: "Threshold-Based Alerting"
  ```
  Alert 1: WARNING (80% SLA consumed)
  - Trigger: completion_time > 0.8 * target_duration_days
  - Action: Email to process owner

  Alert 2: CRITICAL (95% SLA consumed)
  - Trigger: completion_time > 0.95 * target_duration_days
  - Action: Page @devops, create incident

  Alert 3: BREACH
  - Trigger: completion_time > target_duration_days
  - Action: Escalate to @pm, post incident review required
  ```

- [ ] Seção: "Error Recovery — RLS Policy Violations"
  ```
  Scenario: Unauthorized access to org_process_metrics

  Error: "permission denied for schema public"
  Root Cause: RLS policy on org_process_slas doesn't match tenant_id

  Recovery:
  1. Verify RLS policy:
     SELECT * FROM pg_policies
     WHERE tablename = 'org_process_slas'

  2. If missing, apply:
     CREATE POLICY rls_org_process_slas ON org_process_slas
     USING (tenant_id = auth.jwt()->>'tenant_id')

  3. Test: Run RLS validation tests
     npm run test -- rls-validation.test.ts
  ```

- [ ] Seção: "Escalation Contacts"
  - @devops: Deploy issues, database connectivity
  - @data-engineer: Schema validation, RLS policies
  - @pm: SLA breach business decisions

**Validação:**
- [ ] Queries são válidas (traçáveis ao schema)
- [ ] Procedures são executáveis (não abstratas)
- [ ] Pronto para operações reais

**Checklist de Conclusão:**
- [ ] Seções completadas
- [ ] 3+ queries reais validadas
- [ ] Error recovery scenarios cobertos
- [ ] Pronto para @qa review

---

### 4️⃣ @qa (Quinn) — LEAD: 1 + REVIEWER Central

#### Documentação 4.1: `QUALITY-GATES-FRAMEWORK.md`
**Status:** ⚠️ Desatualizado (falta pgvector validation gates)
**Objetivo:** Adicionar quality gates para embeddings (EPIC 11.11 — AI Context Engineering)
**Escopo:**

**Análise Necessária:**
```
Ler código de:
  - migrations/070 (org_activity_templates, org_process_versions)
  - ORGANIZATION-SCHEMA.md (org_knowledge_entries com pgvector(1536))
  - Test files para pgvector (jest tests)
  - AI-CONTEXT-ENGINEERING.md (embedding requirements)
```

**Entregáveis:**
- [ ] Seção: "Pre-Push Gate: Embedding Validation"
  ```
  Gate: embedding-dimension-check
  Rule: All org_knowledge_entries.embedding must be dimension 1536
  Test:
    INSERT INTO org_knowledge_entries (embedding)
    VALUES ('${generate_vector(1536)}')
    -- Must succeed

    INSERT INTO org_knowledge_entries (embedding)
    VALUES ('${generate_vector(1024)}')
    -- Must fail

  Implementation: Postgres CHECK constraint
  ALTER TABLE org_knowledge_entries
  ADD CONSTRAINT embedding_dimension_check
  CHECK (octet_length(embedding::text) = expected_bytes);
  ```

- [ ] Seção: "Pre-PR Gate: Semantic Search Quality"
  ```
  Gate: semantic-search-accuracy
  Rule: Vector similarity must be > 0.7 for relevant docs
  Test:
    INSERT INTO org_knowledge_entries (title, content, embedding)
    VALUES ('Responsible Roles Pattern', 'content...', embedding_1536);

    SELECT * FROM org_knowledge_entries
    WHERE embedding <-> embedding_1536 < 0.3  -- Top 3 most similar
    ORDER BY similarity
    LIMIT 3;

    Assert: Top result is "Responsible Roles Pattern"
    Assert: Similarity score > 0.7
  ```

- [ ] Seção: "Pre-Deploy Gate: pgvector Index Health"
  ```
  Gate: pgvector-index-performance
  Rule: IVFFLAT index must exist on org_knowledge_entries.embedding
  Query:
    SELECT indexname, indextype
    FROM pg_indexes
    WHERE tablename = 'org_knowledge_entries'
    AND indexname LIKE '%embedding%';

    Assert: 1 row returned
    Assert: indextype contains 'ivfflat'
  ```

- [ ] Seção: "Process Metrics Validation"
  ```
  Gate: metrics-aggregation-correctness
  Rule: org_process_metrics calculations must be correct
  Validation:
    - compliance_pct = (completed_on_time / total) * 100
    - avg_duration_days = SUM(duration_days) / count
    - on_time_percentage consistent with SLA
  Test: Run aggregation for last 7 days, verify calculations
  ```

**Validation Test Pattern:**
```typescript
// jest test for embeddings
describe("pgvector quality gates", () => {
  test("embedding dimension must be 1536", async () => {
    const embedding = generate1536DVector();
    const { data, error } = await supabase
      .from("org_knowledge_entries")
      .insert({ embedding })
      .select();
    expect(error).toBeNull();
  });

  test("semantic search accuracy > 0.7", async () => {
    const query_embedding = generate1536DVector();
    const { data } = await supabase.rpc(
      "search_knowledge_entries",
      { query_vec: query_embedding, similarity_threshold: 0.7 }
    );
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].similarity).toBeGreaterThan(0.7);
  });
});
```

**Checklist de Conclusão:**
- [ ] Gates implementáveis (traçáveis ao código)
- [ ] Test patterns validados
- [ ] Pronto para CI/CD integration
- [ ] Pronto para @qa review (auto-review de sí mesmo ✓)

---

#### Documentação 4.REVIEWER: Central Quality Gate Review
**Role:** @qa (Quinn) — Revisor de TODAS as 10 documentações
**Responsabilidade:** Gate definitivo de qualidade

**Checklist de Revisão @qa:**
```
Para CADA documentação (10 total):

[ ] RASTREABILIDADE
    - Nenhuma invenção (tudo traceback ao código)
    - Exemplos copiados de código real (não sintetizados)
    - Cross-references validadas (links funcionam)

[ ] EXATIDÃO
    - Versões matches package.json
    - Padrões existem em codebase
    - Schemas matches ORGANIZATION-SCHEMA.md

[ ] COMPLETUDE
    - Seções todas presentes
    - Exemplos suficientes (3-5 por doc)
    - Formatação WCAG AA compliant

[ ] EXECUTABILIDADE
    - Code examples compiláveis
    - Queries executáveis
    - Procedures não abstratas

[ ] QUALIDADE AIOX 10/10
    - Documentação de contexto perfeita
    - Rastreabilidade 100%
    - Pronto para injeção em prompts
```

**Processo de Revisão:**
1. Ler documentação completa
2. Executar checklist (4 seções)
3. Se algum item FALHA: comentar específico, devolver para agente responsável
4. Se todos PASSAM: aprovar e marcar READY FOR MERGE

**Output:**
- ✅ APPROVED — Ready to merge
- ❌ FEEDBACK — Devolver com issues específicas

---

### 5️⃣ @ux-design-expert (Uma) — LEAD: 1 Documentação

#### Documentação 5.1: `dashboards.md`
**Status:** ❌ Obsoleto (sem data, não menciona cockpit360)
**Objetivo:** Documentar Cockpit360 component patterns + real-time metrics visualization (EPIC 9 + 11)
**Escopo:**

**Análise Necessária:**
```
Ler código de:
  - src/components/cockpit360/ (AreaCockpit360, ProcessCockpit360, etc.)
  - src/app/organizacoes/[id]/page.tsx (usage example)
  - docs/guides/ACCESSIBLE-COLORS.md (color palette for dashboards)
  - docs/architecture/DATA-FLOW-DIAGRAMS.md (metrics flow)
  - docs/accessibility/WCAG-AA-AUDIT-2026-03-07.md (100% compliance baseline)
```

**Entregáveis:**
- [ ] Seção: "Cockpit360 Component Architecture"
  ```
  Definition: Real-time hierarchical dashboard for organizational visibility

  Hierarchy:
  1. AreaCockpit360
     - Shows: All nuclei in area + metrics
     - Metrics: Total processes, avg compliance, SLA breaches
     - Interaction: Click nucleus → NucleusCockpit360

  2. NucleusCockpit360
     - Shows: All processes in nucleus + metrics
     - Metrics: Process count, avg cycle time, alerts
     - Interaction: Click process → ProcessCockpit360

  3. ProcessCockpit360
     - Shows: All routines + SLA status
     - Metrics: SLA compliance %, target vs actual cycle time
     - Alerts: Red if compliance < target
     - Interaction: Click routine → ActivityCockpit360

  4. ActivityCockpit360
     - Shows: Activity details + responsible roles
     - Metrics: Execution time, quality score
     - Responsible Roles: Rendered as tags (color-coded by role type)
     - Actions: Edit responsible_roles, view history
  ```

- [ ] Seção: "Real-Time Metrics Display"
  ```
  Data Source: org_process_metrics (updated daily)

  Metrics Displayed:
  1. Compliance %
     - Calculation: (on_time_instances / total_instances) * 100
     - Display: Numeric % + progress bar (color: >=95% green, <80% red)
     - SLA Link: Shows target_quality_percentage as overlay

  2. Cycle Time
     - Calculation: avg_duration_days from metrics
     - Display: "3.2 days (SLA: 2 days)" + variance
     - Alert: Red background if > SLA target

  3. Breaches
     - Count: instances where completion_time > SLA target_duration
     - Display: Number + trend (up/down arrow)
     - Action: Click → see list of breached instances

  Refresh: Auto-update every 5 minutes (React Query polling)
  ```

- [ ] Seção: "Responsible Roles Visualization"
  ```
  Component: ResponsibleRolesDisplay (read-only) in cockpit360

  Rendering:
  - Each role rendered as pill/badge
  - Color: By role category (management=blue, specialist=purple, operational=green)
  - Example: ["diretor", "gerente", "coordenador"]
    → [Director] [Manager] [Coordinator] (color-coded)

  Interaction: Hover → tooltip with role description from org_role_definitions

  CSS: Uses ACCESSIBLE-COLORS palette (WCAG AA contrast > 4.5:1)
  ```

- [ ] Seção: "Accessibility Requirements"
  ```
  WCAG AA 2.1 Level AA Compliance:

  Color Contrast:
  - All text must have 4.5:1 contrast ratio minimum
  - Metrics labels: use accessible-colors.md palette

  Keyboard Navigation:
  - Tab through cockpit sections
  - Enter to expand/collapse
  - Arrow keys to navigate hierarchy levels

  Screen Reader:
  - Metrics labeled with aria-label (e.g., "Compliance 87 percent")
  - Role descriptions in aria-describedby
  - Status messages (breaches) announced with role="alert"

  Color Blindness:
  - Don't rely on color alone (use icons + color)
  - Red: Use ⚠️ icon + "Alert" text
  - Green: Use ✓ icon + "Compliant" text
  ```

- [ ] Seção: "Query Optimization"
  ```
  Dashboard Load Pattern:
  1. User navigates to AreaCockpit360
  2. Server action: getAreaWithMetrics(areaId)
     - Queries: org_areas (1 row)
     - Queries: org_nuclei (N rows, indexed on area_id)
     - Queries: org_process_metrics for all processes (batched)
  3. Response time target: <500ms p95
  4. Caching: React Query stale-while-revalidate (5 min TTL)
  ```

**Code Example (COPIAR):**
```tsx
// src/components/cockpit360/AreaCockpit360.tsx
export async function AreaCockpit360({ areaId }) {
  const area = await getArea(areaId);
  const nuclei = await getNucleiInArea(areaId);
  const metrics = await getMetricsForArea(areaId);

  return (
    <div className="cockpit-360">
      <header>
        <h1>{area.name}</h1>
        <div className="metrics">
          <MetricCard
            label="Processes"
            value={metrics.process_count}
          />
          <MetricCard
            label="Avg Compliance"
            value={`${metrics.avg_compliance_pct}%`}
            status={metrics.avg_compliance_pct >= 95 ? "good" : "warning"}
          />
        </div>
      </header>

      <section className="nuclei-grid">
        {nuclei.map(nucleus => (
          <NucleusCockpit360Card key={nucleus.id} nucleus={nucleus} />
        ))}
      </section>
    </div>
  );
}
```

**Validación:**
- [ ] Components existem em código (não inventadas)
- [ ] Patterns traçáveis a EPIC 9 stories
- [ ] Accessibility checks validados contra WCAG audit
- [ ] Ejemplos reales de código

**Checklist de Conclusión:**
- [ ] Seções completadas
- [ ] 2+ exemplos de código reales
- [ ] Accessibility requirements documentados
- [ ] Cross-reference com WCAG-AA-AUDIT-2026-03-07.md
- [ ] Pronto para @qa review

---

### 6️⃣ @devops (Gage) — LEAD: 1 Documentação (CO-LEAD with @data-engineer on gates)

#### Documentación 6.1: `build-deploy-gates.md` (CO-LEAD with @data-engineer)
**Status:** ⚠️ Desatualizado (falta pgvector validation, migration order)
**Objetivo:** Documentar deployment gates con validaciones EPIC 11
**Scopo:**
- @devops (Gage): CI/CD, migration execution, rollback procedures
- @data-engineer (Dara): pgvector indexes, RLS policies (vease Sección 2.2 arriba)

**Análisis Necesario (Gage):**
```
Leer código de:
  - .github/workflows/ (CI/CD config actual)
  - vercel.json (deployment config)
  - supabase/migrations/ (migration execution order)
  - docs/engineering/DEPLOYMENT-GUIDE.md (baseline procedural)
```

**Entregables (Gage):**
- [ ] Sección: "CI/CD Pipeline Gates"
  ```
  Gate 1: Pre-Push (Local)
  - npm run lint ✓
  - npm run typecheck ✓
  - npm run test ✓
  - npm audit (no critical vulns) ✓

  Gate 2: Pre-PR (GitHub Actions)
  - CodeRabbit auto-review ✓
  - All checks pass ✓
  - Test coverage > 85% ✓
  - Build succeeds ✓

  Gate 3: Pre-Deploy (Vercel + Supabase)
  - Branch = main ✓
  - All PRs merged ✓
  - Staging deployment successful ✓
  - Smoke tests pass ✓
  ```

- [ ] Sección: "Migration Execution Gates"
  ```
  Pre-Deployment Migration Validation:

  1. Check migration sequence:
     - Must run in order: 066 → 067 → 068 → 069 → 070
     - No skipped migrations allowed
     - Idempotency check: migrations can re-run safely

  2. Backup before migration:
     - pg_dump production database
     - Store backup in S3 with timestamp

  3. Run migrations:
     - supabase migration up
     - Verify all migrations applied (check schema_migrations table)

  4. Post-migration validation:
     - RLS policies exist (validation gate by Dara)
     - pgvector indexes exist (validation gate by Dara)
     - Org_* tables populated (if seed required)

  5. Smoke tests:
     - GET /api/health ✓
     - Query org_areas ✓
     - Query org_process_metrics ✓
  ```

- [ ] Sección: "Rollback Procedures"
  ```
  Scenario 1: Migration fails
  Action:
    1. supabase migration down
    2. Restore from backup (pg_restore)
    3. Investigate migration 06X issue
    4. Fix and re-run

  Scenario 2: Deployment to Vercel fails
  Action:
    1. Revert to previous commit
    2. Vercel auto-redeploys from main
    3. Investigate issue
    4. Push fix and re-merge PR

  Scenario 3: RLS policy missing (data access denied)
  Action:
    1. Apply RLS policy (Dara script)
    2. Run RLS validation tests
    3. Restart API servers
    4. Verify access restored
  ```

- [ ] Sección: "Deployment Checklist"
  ```
  Pre-Deployment (T-2 hours):
  - [ ] All PRs approved by @qa
  - [ ] Staging tests pass
  - [ ] Backup created
  - [ ] Rollback plan documented
  - [ ] Team notified

  Deployment (T=0):
  - [ ] Merge PR to main
  - [ ] Vercel build starts
  - [ ] Run migrations (Supabase)
  - [ ] Validate RLS + pgvector (Dara checks)
  - [ ] Smoke tests pass
  - [ ] Monitor 30 min (error rates, latency)

  Post-Deployment (T+30 min):
  - [ ] Production metrics normal
  - [ ] No RLS/access errors
  - [ ] Process metrics updated (if applicable)
  - [ ] Team notified (complete)
  ```

**Validation:**
- [ ] Procedures are executable (not abstract)
- [ ] Checklist matches actual deployment process
- [ ] Rollback procedures tested (or at least documented)

**Checklist de Conclusión:**
- [ ] Seções completadas
- [ ] 2+ exemplos de procedimento real
- [ ] Rollback coverage incluido
- [ ] Coordinar con Dara (@data-engineer) en validation gates
- [ ] Pronto para @qa review

---

### 7️⃣ @pm (Morgan) — CO-LEAD: 1 Documentación (with @architect)

#### Documentación 7.1: `AIOX-WORKFLOW-MAP.md` (CO-LEAD with @architect)
**Status:** ⚠️ Desatualizado (falta EPIC 11 workflow context)
**Objetivo:** Documentar 4 workflows con énfasis en Story Lifecycle (SDC) — co-ownership con Aria
**Scopo (Morgan):**
- Workflow orchestration (SDC phases, decisions, phase gates)
- Epic flow (como @pm ejecuta EPIC 11)
- Story lifecycle gates (que validar en cada phase)

**Análisis Necesario (Morgan):**
```
Leer código de:
  - docs/stories/EPIC-11-Organizational-Enrichment-BPM-Mastery.md
  - docs/governance/STORY-LIFECYCLE-GATES.md (10-point + 5-point + 7-point checklists)
  - docs/stories/ (14 EPIC 11 stories como ejemplos)
  - .aiox-core/data/workflow-chains.yaml (si existe, workflow definitions)
```

**Entregables (Morgan):**
- [ ] Sección: "SDC — Story Development Cycle (EPIC 11 Aligned)"
  ```
  Orchestration Role: @pm (Morgan) executes overall flow

  Phase 1: Create (@sm leads)
  Input: PRD or EPIC spec (EPIC-11-Organizational-Enrichment-BPM-Mastery.md)
  Task: @sm *draft → create-next-story
  Output: Story in Draft status
  Gate: @po validates 10-point checklist (is it a valid story?)
  Example: Story 11.1 "Add responsible_roles to activities"
    - Acceptance Criteria defined ✓
    - File list scoped ✓
    - Estimate provided ✓
    - Dependencies identified ✓
    ... (8 more checks)

  Phase 2: Validate (@po leads)
  Input: Story from Phase 1
  Task: @po *validate-story-draft → 10-point checklist
  Verdict: GO (>=7 points) | NO-GO (requires fixes)
  If GO: Mark Story Ready, proceed to Phase 3
  If NO-GO: Return to @sm with specific feedback

  Phase 3: Implement (@dev leads)
  Input: Validated story
  Task: @dev implements story (code + tests)
  Modes: Interactive / YOLO / Pre-Flight
  CodeRabbit: Max 2 self-healing iterations
  Output: Story marked InReview, ready for Phase 4
  Duration: Varies (1-5 days per story complexity)

  Phase 4: QA Gate (@qa leads)
  Input: Story from @dev (InReview)
  Task: @qa *qa-gate → 7-point checklist
    - Test coverage >=85% ✓
    - Lint pass ✓
    - TypeScript strict ✓
    - WCAG AA compliance ✓
    - RLS validation ✓
    - Code review (CodeRabbit) ✓
    - Documentation complete ✓
  Verdict: PASS | CONCERNS | FAIL | WAIVED
  If PASS: Story → Done, ready to merge
  If CONCERNS: Minor issues, can waive with risk acceptance
  If FAIL: Return to @dev for fixes
  ```

- [ ] Sección: "Epic Orchestration — EPIC 11 Example"
  ```
  @pm (Morgan) orchestrates 14-story EPIC:

  Day 1: Kick-off
  - Review EPIC-11-Organizational-Enrichment-BPM-Mastery.md (master spec)
  - Create 14 stories (Phase 1 × 14)
  - Assign to @sm for drafting

  Days 2-7: Parallel Development
  - Stories 11.1-11.5 (Phase 1-4): simultaneous
  - Example: 11.1 (responsible_roles) + 11.2 (activity_systems) + 11.3 (SLAs) in parallel
  - @pm monitors blockers, manages dependencies

  Week 2: Integration + QA
  - All stories in Phase 4 (QA Gate)
  - @qa validates (7-point checklist per story)
  - Fixes for FAIL verdicts

  Week 3: Release
  - All stories PASS QA gate
  - Merge to main
  - Deploy to production
  - Monitor metrics

  Ceremony (Morgan's role):
  - Daily standup: Block identification + risk escalation
  - End-of-day: @pm *status → show overall progress
  - Release ceremony: Signoff when all phases complete
  ```

- [ ] Sección: "QA Loop — Iterative Review (if needed)"
  ```
  When: Story fails QA gate (verdict = FAIL)

  Loop Process:
  1. @qa provides verdict + specific feedback
  2. @dev fixes issues (max 5 iterations allowed)
  3. @qa re-reviews

  Verdicts in Loop:
  - APPROVE → Story Done, exit loop
  - REJECT → @dev fixes, re-review
  - BLOCKED → Escalate to @pm (dependency issue)

  Escalation Triggers:
  - Max iterations reached (5)
  - Verdict = BLOCKED (unresolvable)
  - Time exceeded (story >3 sprints)

  Example: Story 11.7 (bulk operations) has FAIL verdict
  - Issue: CSV import validation missing edge cases
  - @dev fixes: Add 3 more test cases for edge cases
  - @qa re-reviews: APPROVE ✓
  ```

**Coordination with Aria:**
- Aria documents: "4 workflows overview, decision gates, complexity scoring"
- Morgan documents: "Orchestration role, epic execution, phase dependencies"
- Shared sections: SDC description (4 phases), gates definitions

**Validation:**
- [ ] Workflows traceable to actual code (docs/stories/ examples)
- [ ] Gates match STORY-LIFECYCLE-GATES.md
- [ ] Orchestration realistic (based on EPIC 11 actual execution)

**Checklist de Conclusión:**
- [ ] Seções completadas
- [ ] Coordinar con Aria para evitar duplicación
- [ ] 3+ ejemplos de EPIC 11 stories reales
- [ ] Pronto para @qa review

---

## 🎯 EXECUTION TIMELINE

```
2026-03-16 (DAY 1) — ANALYSIS PHASE
├─ 09:00 Task 1.1: Code Analysis Setup (Aria + Dara)
│         Output: docs/.DOCUMENTATION-UPDATE-ANALYSIS.md
├─ 10:00 Task 1.2: Dependency Verification (All agents)
│         Output: Verified versions list
└─ 17:00 Phase 1 COMPLETE → Ready for Phase 2

2026-03-17 (DAY 2) — DOCUMENTATION PHASE (PARALLEL)
├─ @architect (Aria):
│  ├─ AIOX-WORKFLOW-MAP.md (3h)
│  └─ module-standards.md (2h)
│
├─ @data-engineer (Dara):
│  ├─ DEPENDENCY-MANAGEMENT.md (2.5h)
│  └─ build-deploy-gates.md co-lead (1.5h)
│
├─ @dev (Dex):
│  ├─ AI-AGENT-ARCHITECTURE.md (2h)
│  └─ OPERATIONAL-RUNBOOK.md (2h)
│
├─ @qa (Quinn):
│  └─ QUALITY-GATES-FRAMEWORK.md (2h)
│
├─ @ux-design-expert (Uma):
│  └─ dashboards.md (2.5h)
│
├─ @devops (Gage):
│  └─ build-deploy-gates.md lead (2h)
│
└─ @pm (Morgan):
   └─ AIOX-WORKFLOW-MAP.md co-lead (2h)

TOTAL PARALLEL: 16.5 hours, 2-3 agent-days

2026-03-18 (DAY 3) — QUALITY GATE PHASE
├─ @qa (Quinn): Central Review
│  ├─ Review all 10 documentation (4h)
│  ├─ Rastreability checklist per doc
│  ├─ Exactitud verification
│  └─ Output: ✅ APPROVED or ❌ FEEDBACK
│
└─ 17:00 Ready to MERGE all docs
```

---

## ✅ VALIDATION CHECKLIST (per @qa, Quinn)

### Rastreability (MANDATORY)
- [ ] Every example traceable to code file + line number
- [ ] No invented patterns or features
- [ ] All queries tested executable
- [ ] All padrón examples compilables

### Exactitud (MANDATORY)
- [ ] Versions match package.json
- [ ] Schemas match ORGANIZATION-SCHEMA.md
- [ ] Procedures match actual implementation
- [ ] No conflicts with existing docs

### Completude
- [ ] All sections present
- [ ] 3-5 examples per doc minimum
- [ ] Cross-references validated
- [ ] No gaps in coverage

### Executability
- [ ] Code is runnable (not pseudo-code)
- [ ] Queries are valid SQL
- [ ] Procedures are step-by-step (not abstract)
- [ ] Tools/commands are installed

### AIOX 10/10 Engineering
- [ ] Documentación de contexto perfecta
- [ ] Zero ambiguity
- [ ] Pronto para injeção en prompts
- [ ] First-pass quality (no feedback needed)

---

## 📌 SUCCESS CRITERIA

**Documentations Ready When:**
1. ✅ All 10 docs updated with EPIC 11 content
2. ✅ Zero invenção (100% traçable to code)
3. ✅ @qa signs off (all checklist items PASS)
4. ✅ Cross-references validated
5. ✅ Ready for production merge

**FAIL Criteria:**
- ❌ Any invented patterns or features
- ❌ Outdated versioning (not matching package.json)
- ❌ Broken cross-references
- ❌ @qa gives FEEDBACK (requires rework)

---

## 📋 HANDOFF PROTOCOL

**After each agent completes documentation:**
1. Self-check against agent-specific checklist
2. Commit to git branch: `docs/update-<docname>`
3. Submit for @qa review
4. @qa validates (4-8h turnaround)
5. If approved: PR ready
6. If feedback: Fix + re-submit

---

## 🎯 SUCCESS METRIC

**AIOX 10/10 Standard:**
- Documentation completeness: 10/10 ✓
- Code alignment: 10/10 ✓
- Rastreability: 10/10 ✓
- Executability: 10/10 ✓
- Context engineering: 10/10 ✓

**Target:** ZERO feedback from @qa on first pass

---

**Document Owner:** Orion (@aiox-master)
**Status:** 🟢 READY FOR EXECUTION
**Next Step:** Distribute to agents + begin Phase 1 (Analysis)

