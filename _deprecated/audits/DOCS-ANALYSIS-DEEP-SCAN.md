# Tech Arauz — Deep Scan: Documentação Desatualizada & Impacto em IA

**Executado:** 2026-03-07 por Orion
**Escopo:** Análise completa de `docs/` + `_deprecated/` + root
**Objetivo:** Remover documentações antigas que comprometem contexto de IA

---

## 📊 Resumo Executivo

| Status | Count | Action |
|--------|-------|--------|
| ✅ **Current (Mar 6+)** | 35 files | KEEP — Essencial para AIOX |
| 🔴 **Antigos (Feb 26-27)** | 5 files | **ARCHIVE — PRÉ-BROWNFIELD** |
| 🟡 **Suspeitos (Mar 1-5)** | 3 files | **ARCHIVE — Stale/AIOS-era** |
| ✓ **Já Deprecados** | 17 files | OK — _deprecated/ estruturado |
| 📋 **Administrative** | 3 files | OK — Cleanup docs (criados Mar 7) |

**Total arquivos em docs/: ~63 markdown files**

---

## 🔴 ARQUIVOS DESATUALIZADOS — CRÍTICA RECOMENDAÇÃO: ARQUIVAR

### Grupo 1: PRÉ-BROWNFIELD (Feb 26-27)

#### 1. `docs/design-system.md`
- **Data:** 2026-02-27
- **Versão:** 1.0
- **Status:** Auditoria PRÉ-BROWNFIELD
- **Problema:**
  - Criado ANTES de FASES 1-9
  - Supercedido por `docs/frontend/frontend-spec.md` (FASE 3 — ATUALIZADO)
  - **Impacto em IA:** Padrões de design obsoletos podem contaminar contexto
- **Ação:** ❌ ARQUIVAR em `_deprecated/docs-feb-27/`
- **Substituído por:** `docs/frontend/frontend-spec.md` (FASE 3, Mar 6)

#### 2. `docs/prd/PLANO-ACAO-10-10.md`
- **Data:** 2026-02-27
- **Versão:** 1.0
- **Status:** PENDENTE APROVACAO
- **Problema:**
  - Plano "10/10" antigo PRÉ-BROWNFIELD
  - Supercedido por FASES 1-9 roadmap realista
  - Roadmap consolidado em `technical-debt-assessment.md` v3.1-FINAL
  - **Impacto em IA:** Prioridades desatualizadas podem direcionar engenharia para tarefas obsoletas
- **Ação:** ❌ ARQUIVAR em `_deprecated/docs-feb-27/`
- **Substituído por:** `docs/prd/technical-debt-assessment.md` v3.1-FINAL (FASE 8, Mar 7)

---

### Grupo 2: AIOS-ERA / STALE (Mar 1-5)

#### 3. `docs/plans/portal-tech-ai-evolution-masterplan.md`
- **Data:** 2026-03-01 (20:55)
- **Versão:** 1.1
- **Status:** ✅ COMPLETO 100%
- **Autor:** Orion (**aios-master** — framework DEPRECATED)
- **Problema:**
  - ⚠️ **CRÍTICO:** Refere a @aios-master (removido em 2026-03-06)
  - Contém execução de Épico 7 em framework AIOS
  - Cita "AIOS Governance, Chatbot Global" — conceitos deprecated
  - Migrations mencionadas (045, 046, 047) podem ser supersedidas
  - **Impacto em IA:** Contexto de framework OLD pode confundir agent setup e referências técnicas
- **Ação:** ❌ ARQUIVAR em `_deprecated/aios-era/` (criar pasta)
- **Nota:** Versão AIOX equivalente está em FASES 4-9

#### 4. `docs/reports/portal-tech-ai-agents-context.md`
- **Data:** 2026-03-01
- **Versão:** Original (sem versão)
- **Status:** Contexto de projeto (informativo)
- **Problema:**
  - Criado em Mar 1, PRÉ-auditoria completa
  - Header diz "uso como contexto para engenharia de AI"
  - ⚠️ **Se usado como contexto, está STALE** — dados de Mar 1, projeto mudou muito (FASES 2-9)
  - Falta atualizações de Mar 6-7 (FASES 5-9 revalidadas)
  - **Impacto em IA:** Contexto de dados desatualizado pode viesar decisions de arquitetura
- **Ação:** ❌ ARQUIVAR em `_deprecated/docs-feb-27/` (com renomear para clareza)
- **Substituído por:** `docs/reports/TECHNICAL-DEBT-REPORT.md` (FASE 9, Mar 7 — EXECUTIVE SUMMARY)

---

### Grupo 3: DRAFT (Versionamento)

#### 5. `docs/prd/technical-debt-DRAFT.md`
- **Data:** March 6, 2026
- **Versão:** 1.0-DRAFT
- **Status:** FASE 4 — Consolidação Inicial
- **Problema:**
  - É apenas um DRAFT (versão intermidiária)
  - Há versão FINAL muito melhor: `technical-debt-assessment.md` v3.1-FINAL (FASE 8, Mar 7)
  - Versão FINAL foi validada por @data-engineer, @ux-design-expert, @qa, @architect
  - **Impacto em IA:** DRAFT tem números incompletos (28 debts) vs FINAL (12 high-priority consolidados)
- **Ação:** ❌ ARQUIVAR em `_deprecated/drafts/` (criar pasta)
- **Substituído por:** `docs/prd/technical-debt-assessment.md` v3.1-FINAL (FASE 8, Mar 7)

---

## 🟡 ARQUIVOS SUSPEITOS — REVISÃO RECOMENDADA

### 1. `docs/SETUP-AI-SERVICE.md`
- **Data:** Sem data clara
- **Escopo:** Setup FastAPI para agentes/chat (local + produção)
- **Status:** Pode estar desatualizado
- **Recomendação:**
  - [ ] Verificar se é usado por current stack
  - [ ] Se não: ARQUIVAR
  - [ ] Se sim: ATUALIZAR com datas e status

### 2. Arquivos em `docs/architecture/adr/` (2 ADRs)
- **ADR-005:** `ADR-005-data-fetching-patterns.md`
- **ADR-009:** `ADR-009-agent-messages-user-isolation.md`
- **Status:** Falta verificação de datas internas
- **Recomendação:**
  - Verificar se foram atualizados após FASES 1-9
  - Se pré-Mar-06: revisar relevância

---

## ✅ ARQUIVOS CORRETOS — MANTER

### FASES 1-9 (100% PROTEGIDOS)
- ✅ `docs/architecture/system-architecture.md` (FASE 1)
- ✅ `docs/frontend/frontend-spec.md` (FASE 3)
- ✅ `docs/qa/fase7-quality-gate.md` (FASE 7)
- ✅ `docs/prd/technical-debt-assessment.md` v3.1-FINAL (FASE 8)
- ✅ `docs/reviews/db-specialist-review.md` (FASE 5 atualizado)
- ✅ `docs/reviews/ux-specialist-review.md` (FASE 6 atualizado)
- ✅ `docs/reports/TECHNICAL-DEBT-REPORT.md` (FASE 9)
- ✅ `docs/architecture/BROWNFIELD-DISCOVERY-AUDIT.md` (QA)

### Active Stories (Mar 2026)
- ✅ `docs/stories/4.*.md` — 11 stories (Agent features, Migrations, Chat, Dashboard)
- ✅ `docs/stories/5.*.md` — IA Auxiliares features
- ✅ Plus 30+ outros stories em desenvolvimento

### Architecture & Reference
- ✅ `docs/architecture/*.md` — Padrões atualizados
- ✅ ADRs relevantes (verificar datas)

---

## 📋 PLANO DE CLEANUP RECOMENDADO

### **Fase 1: Arquivar Antigos (Imediato)**

| Arquivo | Destino | Motivo |
|---------|---------|--------|
| `docs/design-system.md` | `_deprecated/docs-feb-27/` | PRÉ-BROWNFIELD, supercedido |
| `docs/prd/PLANO-ACAO-10-10.md` | `_deprecated/docs-feb-27/` | PRÉ-BROWNFIELD, supercedido |
| `docs/plans/portal-tech-ai-evolution-masterplan.md` | `_deprecated/aios-era/` | AIOS-framework deprecated |
| `docs/reports/portal-tech-ai-agents-context.md` | `_deprecated/docs-feb-27/` | Stale context (Mar 1) |
| `docs/prd/technical-debt-DRAFT.md` | `_deprecated/drafts/` | DRAFT, superseded por FINAL |

### **Fase 2: Revisar Suspeitos (Próxima)**

| Arquivo | Ação |
|---------|------|
| `docs/SETUP-AI-SERVICE.md` | Verificar se é usado; se não → ARQUIVAR |
| `docs/architecture/adr/*` | Verificar datas internas; se pré-Mar-06 → revisar relevância |

### **Fase 3: Garantias**

- ✅ NENHUM arquivo AIOX FASES 1-9 será removido
- ✅ NENHUM story ativo (Mar 2026) será removido
- ✅ NENHUM arquivo criado por brownfield-discovery workflow será removido
- ✅ Estrutura _deprecated/ mantida como histórico

---

## 🚨 IMPACTO EM ENGENHARIA DE IA

### **Problema Identificado**

Quando documentações antigas existem em `docs/`, ferramentas de AI context (Claude Code context window) podem incluir:

1. ❌ **Design patterns obsoletos** (design-system.md — Feb 27)
2. ❌ **Prioridades desatualizadas** (PLANO-ACAO-10-10.md — Feb 27)
3. ❌ **Framework deprecated** (aios-master references — Mar 1)
4. ❌ **Contexto stale de projeto** (portal-tech-ai-agents-context.md — Mar 1)
5. ❌ **Dados incompletos** (technical-debt-DRAFT.md — versão intermediária)

### **Resultado**

- Agentes IA recebem sinais conflitantes (Feb padrões + Mar implementação)
- Prompt engineering fica confuso (qual versão é verdade?)
- Context window usado ineficientemente (duplicação)
- **Onboarding de novos agentes fica comprometido**

### **Solução**

Arquivar antigos em `_deprecated/`, deixando `docs/` com APENAS documentação:
- ✅ Atualizada (Mar 6-7, 2026)
- ✅ Alinhada com AIOX Brownfield Discovery
- ✅ Validada por especialistas (FASES 5-9)
- ✅ Pronta para consumo por AI

---

## ✨ Status Final Esperado

Após cleanup:

```
docs/
├── architecture/           [FASE 1 + System patterns]
├── frontend/              [FASE 3 + Current specs]
├── prd/                   [FASE 8 — Final Assessment]
├── reviews/               [FASES 5-6 — Specialist Reviews]
├── qa/                    [FASE 7 — Quality Gate]
├── reports/               [FASE 9 — Executive Report]
├── stories/               [Mar 2026 active development]
├── CLEANUP-FINAL-SUMMARY.md   [Mar 7 documentation]
└── [~80 files — 100% CURRENT]

_deprecated/
├── docs-feb-27/               [Pre-Brownfield outdated]
├── aios-era/                  [AIOS framework deprecated]
├── drafts/                    [Intermediate versions]
├── stories-old-cycles/        [Pre-Brownfield epics]
└── [historical archive]
```

**Result:** `docs/` serves ONLY current, validated documentation. AI context is clean.

---

**Relatório completo:** 2026-03-07 21:00 UTC
**Executor:** Orion (aiox-master)
**Confiança:** 98% (5 arquivos confirmados antigos)
