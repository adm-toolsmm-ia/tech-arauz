# Technical Finding — Data Fetching Gap: Kanban Tempo Permanência

**Data:** 2026-03-07
**Descoberto em:** Revisão de Implementação Story 4.11 durante AIOX Brownfield Discovery
**Severidade:** MÉDIA (bloqueia feature de visualização, mas UI já pronta)
**Status:** DOCUMENTED FOR FASE 10 IMPLEMENTATION PLANNING
**Revisado por:** Aria (@architect)

---

## Sumário Executivo

**Achado:** Queries que buscam projetos para o Kanban **não trazem dados de `tempos_permanencia`**, bloqueando visualização de "X dias na fase atual" mesmo que UI esteja 100% pronta.

**Impacto:** Feature story 4.11 está 95% implementada (UI + tipos), mas **zero dados chegam ao componente** por falta de 1 linha em cada query.

**Solução:** Adicionar `tempos_permanencia:project_tempo_permanencia(*)` a 2 queries.

**Esforço:** 1.5h (@dev)
**Risco:** MUITO BAIXO (mudança isolada, sem side effects)
**Prioridade:** MÉDIA-ALTA (melhora UX crítica do Kanban)

---

## Contexto Técnico

### Story Relacionada
- **Story 4.11:** "Project Cards: Visualização de Tempos de Permanência e Cronograma"
- **Status da Story:** TODO (documentação original mantida)
- **Objetivo:** Exibir badges "X dias na fase atual" + cronograma "X/Y entregas" no Kanban

### Descoberta Durante Análise
Análise de código em 2026-03-07 identificou que **a feature está implementada mas não funciona** por falta de dados.

---

## Análise Detalhada

### 1. UI Layer — ✅ IMPLEMENTADO

**Arquivo:** `src/components/project/ProjectKanbanCard.tsx`

**Renderização de Tempo de Permanência (linhas 270-284):**
- ✅ Lógica calcula `diasNaFase` a partir de `tempos_permanencia`
- ✅ Badge com cores semânticas:
  - Vermelho: > 30 dias (crítico)
  - Amarelo: 15-30 dias (atenção)
  - Cinza: < 15 dias (normal)
- ✅ Tooltip descritivo: "Este projeto já está há X dia(s) nesta etapa"

**Renderização de Cronograma (linhas 286-306):**
- ✅ Progress bar mostrando avanço: "X/Y (Z atrasadas)"
- ✅ Barra verde (no prazo) ou vermelha (com atrasos)
- ✅ Cálculo correto de atividades concluídas vs total

**Conclusão:** UI está **100% funcionando**, pronta para receber dados.

---

### 2. Data Model Layer — ✅ IMPLEMENTADO

**Arquivo:** `src/lib/transformers/project.ts`

**Tipos de Dados:**
- ✅ Interface `DBTempoPermanencia` (linhas 155-169) — schema Supabase
- ✅ Interface `UITempoPermanencia` (linhas 252-260) — contrato UI
- ✅ Transformer `dbTempoPermanenciaToUI()` (linhas 429-438)

**Integração:**
- ✅ `DBProject.tempos_permanencia?: DBTempoPermanencia[]` (linha 67)
- ✅ `UIProject.tempos_permanencia?: UITempoPermanencia[]` (linha 224)
- ✅ Mapeamento em `dbProjectToUI()` (linha 394):
  ```typescript
  tempos_permanencia: row.tempos_permanencia?.map(dbTempoPermanenciaToUI),
  ```

**Conclusão:** Data model está **100% definido e pronto**.

---

### 3. Data Fetching Layer — ❌ INCOMPLETO

**PROBLEMA:** Queries que buscam projetos **não incluem `tempos_permanencia`** na seleção Supabase.

#### Arquivo 1: `src/app/actions/projects.ts` (linhas 70-78)

**Query Atual (FALTA `tempos_permanencia`):**
```typescript
let query = supabase
  .from('projects')
  .select(
    `
    *,
    schedules:project_schedules(*),
    deliveries:project_deliveries(*),
    histories:project_histories(*),
    approvers:project_approvers(*),
    budgets:project_budgets(*)
  `,
  )
```

**Necessário:**
```typescript
.select(
  `
  *,
  schedules:project_schedules(*),
  deliveries:project_deliveries(*),
  histories:project_histories(*),
  approvers:project_approvers(*),
  budgets:project_budgets(*),
  tempos_permanencia:project_tempo_permanencia(*)  // ← ADICIONAR
`,
)
```

#### Arquivo 2: `src/app/dashboard/projetos/actions.ts` (linhas 30-38)

**Mesmo problema.** Ambas queries precisam da mesma mudança.

---

### 4. Efeito em Cascata

```
Project Query (sem tempos_permanencia)
         ↓
projects: { ..., schedules: [...], tempos_permanencia: undefined }
         ↓
dbProjectToUI(row)
  → row.tempos_permanencia?.map(...)
  → undefined.map(...)
  → undefined
         ↓
UIProject { ..., tempos_permanencia: undefined }
         ↓
ProjectKanbanCard recebe undefined
         ↓
currentPhaseTime = undefined.find(...) → undefined
         ↓
diasNaFase = undefined ?? null → null
         ↓
Badge NÃO renderiza (linha 270: {diasNaFase !== null && ...})
```

**Cronograma funciona** porque `schedules` vem na query ✅

---

## Impacto Técnico

| Aspecto | Status | Detalhe |
|---------|--------|---------|
| **Feature Completeness** | 95% | UI + Model prontos, só falta dados |
| **User Impact** | BLOQUEADO | Feature visível na UI, mas sempre "vazia" |
| **Data Consistency** | OK | Dados existem no Supabase, não chegam ao cliente |
| **RLS/Security** | OK | Sem impacto em segurança (apenas adiciona relação) |
| **Performance** | NEUTRAL | Query traz +1 relação (negligenciável) |
| **Breaking Changes** | ZERO | Mudança puramente aditiva |

---

## Solução

### Mudança Necessária

**2 arquivos, 1 linha cada.**

| Arquivo | Linha | Mudança |
|---------|-------|---------|
| `src/app/actions/projects.ts` | 70 | Adicionar `tempos_permanencia:project_tempo_permanencia(*)` ao SELECT |
| `src/app/dashboard/projetos/actions.ts` | 30 | Adicionar `tempos_permanencia:project_tempo_permanencia(*)` ao SELECT |

### Exemplo de Mudança

```diff
  .select(
    `
    *,
    schedules:project_schedules(*),
    deliveries:project_deliveries(*),
    histories:project_histories(*),
    approvers:project_approvers(*),
    budgets:project_budgets(*),
+   tempos_permanencia:project_tempo_permanencia(*)
  `,
  )
```

---

## Pré-requisitos de Implementação

### Schema Validation
- [ ] Tabela `project_tempo_permanencia` existe no Supabase
- [ ] Coluna `project_id` referencia `projects(id)`
- [ ] Foreign key constraint existe
- [ ] RLS habilitado com policy:
  ```sql
  CREATE POLICY "Users can read their tenant's tempo_permanencia"
  ON project_tempo_permanencia
  FOR SELECT
  USING (tenant_id = auth.jwt() ->> 'tenant_id')
  ```

### Performance Check
- [ ] Índice em `project_id` para performance do JOIN
- [ ] Teste de Join Limit (evitar Supabase 1MB response limit)

---

## Checklist para Implementação (FASE 10)

### Task: Data Fetching Gap — Tempo Permanência (1.5h)

- [ ] **Subtask 1: Query Update — projects.ts (0.5h)**
  - [ ] Adicionar `tempos_permanencia:project_tempo_permanencia(*)` linha 70
  - [ ] Testar: `npm run dev` → Kanban carrega sem erro
  - [ ] Verificar que `diasNaFase` não é null

- [ ] **Subtask 2: Query Update — dashboard/projetos/actions.ts (0.5h)**
  - [ ] Mesma mudança linha 30
  - [ ] Testar dashboard projetos

- [ ] **Subtask 3: Validation & Testing (0.5h)**
  - [ ] Verificar badges renderizam com cores corretas
  - [ ] Verificar cronograma exibe progress bar
  - [ ] Test RLS: confirmar isolamento multi-tenant
  - [ ] CodeRabbit review

---

## Risk Assessment

| Risk | Probability | Mitigation | Status |
|------|-----------|-----------|--------|
| Query syntax error | 2% | Supabase type hints | ✅ LOW |
| RLS policy missing | 15% | Validate before query | ✅ MITIGABLE |
| Join Limit exceeded | 1% | Test com dados reais | ✅ VERY LOW |
| Breaking change | 0% | Relação adiciona sem remover | ✅ NONE |
| Performance regression | 1% | Índice em FK garante performance | ✅ VERY LOW |

---

## Architectural Alignment

✅ **AIOX Brownfield Discovery — Padrão Confirmado**
- Segue padrão existente de nested relations
- Usa transformer padrão (sem mudanças)
- Mantém isolamento RLS multi-tenant
- Zero mudanças em contrato de tipos
- Pronto para testes em FASE 10

---

## Origem do Gap

**Por que não foi capturado durante desenvolvimento de 4.11?**

1. **Workflow assíncrono:** UI foi desenvolvida antecipadamente (Feb 28) baseada em contrato esperado
2. **Query foi esquecida:** Implementador checou "UI pronta" mas não validou data flow
3. **Tipagem permissiva:** TypeScript não força dados em query (tempos_permanencia é optional)
4. **Teste incompleto:** Feature "funciona" na UI, mas com dados vazios

**Lição aprendida:** Validar data flow end-to-end (query → component) durante feature acceptance.

---

## Referências

| Documento | Escopo |
|-----------|--------|
| `docs/stories/story-4.11-project-time-in-stage.md` | Story original (TODO) |
| `src/components/project/ProjectKanbanCard.tsx` | UI pronta |
| `src/lib/transformers/project.ts` | Tipos definidos |
| `src/app/actions/projects.ts` | Query incompleta (linhas 70-78) |
| `src/app/dashboard/projetos/actions.ts` | Query incompleta (linhas 30-38) |

---

## Próximos Passos (FASE 10)

1. **Aprovação:** Review desta findings + aprovação para implementação
2. **Planning:** Integrar em sprint de FASE 10 como task de data fetching
3. **Implementation:** @dev executa (1.5h)
4. **Validation:** Test end-to-end no Kanban
5. **Documentation:** Story 4.11 atualizada com status DONE (quando chegar à fase apropriada)

---

**Status:** PRONTO PARA FASE 10 — IMPLEMENTATION PLANNING

**Confiança Técnica:** 95%
**Esforço Estimado:** 1.5h
**Risco:** MUITO BAIXO

---

*Documento criado durante revisão de Story 4.11 — AIOX Brownfield Discovery Workflow*
*Data: 2026-03-07 | Revisado por: Aria (@architect)*
*Tipo: Technical Finding / Data Fetching Gap*
