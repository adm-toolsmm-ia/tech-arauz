# Tech Arauz — Plano de Limpeza Agressiva (PRÉ-MAR-06 REMOVAL)

**Executado:** 2026-03-07 22:00 UTC
**Executor:** Orion (aiox-master)
**Objetivo:** **REMOVER COMPLETAMENTE** todo arquivo PRÉ-MAR-06 de docs/

---

## 🔴 ACHADOS CRÍTICOS — Arquivos PRÉ-Mar-06 Still in docs/

### Grupo 1: Architecture (Feb 26-28) — **REMOVE COMPLETELY**

| File | Data Original | Status | Action |
|------|---------------|--------|--------|
| `architecture/adr/ADR-005-data-fetching-patterns.md` | 2026-03-01 (borderline) | ❌ CONFLITA | REMOVE |
| `architecture/alert-system-implementation-plan.md` | 2026-03-06 header MAS "Data da revisao: 2026-02-26" | ❌ STALE | REMOVE |
| `architecture/data-fetching-patterns.md` | "Data da revisao: 2026-02-26" | ❌ STALE | REMOVE |
| `architecture/log-retention-policy.md` | "Data da analise: 2026-02-26" | ❌ STALE | REMOVE |
| `architecture/module-standards.md` | "Data da analise: 2026-02-26" | ❌ STALE | REMOVE |
| `architecture/dashboards.md` | Unknown (suspeito) | 🔍 VERIFY | CHECK |

### Grupo 2: UX/Personas (Feb 27) — **REMOVE COMPLETELY**

| File | Data Original | Impact | Action |
|------|---------------|--------|--------|
| `ux/personas.md` | 2026-02-27 | ❌ PRÉ-BROWNFIELD, pode estar obsoleto | REMOVE |

### Grupo 3: ADRs (Feb 28 - Mar 1) — **CONDITIONAL REMOVE**

| File | Data Original | Status | Decision |
|------|---------------|--------|----------|
| `architecture/adr/ADR-005` | 2026-03-01 (1 dia antes FASE 5) | Borderline | **REMOVE** (pré-validação) |
| `architecture/adr/ADR-009` | 2026-03-01 (dentro período) | CRÍTICO | KEEP (RLS essential) |

---

## 📋 IMPACTO EM CONTEXTO DE IA

### Problema: Por que esses arquivos impactam?

1. **`module-standards.md` (Feb 26)** — Padrões de engenharia podem estar desatualizados
   - Análise pré-FASE 5-6 (especialistas reviews)
   - Pode conflitar com padrões finalizados em FASE 8
   - **Impacto AI:** Agents recebem padrões antigos como source of truth

2. **`alert-system-implementation-plan.md` (Feb 26 analysis)** — Plano desatualizado
   - "Status: DOCUMENTED FOR FUTURE IMPLEMENTATION"
   - Pode conflitar com prioridades FASE 8 (180-300h roadmap)
   - **Impacto AI:** AI pode pensar que alertas são prioridade quando não estão em Phase 1-3

3. **`data-fetching-patterns.md` (Feb 26)** — Padrões PRÉ-validação
   - Análise pré-FASE 7 (quality gate)
   - **Duplica** conteúdo com ADR-005 (confusão)
   - **Impacto AI:** AI recebe 2 sources de padrões com potencial conflito

4. **`log-retention-policy.md` (Feb 26)** — Policy desatualizada
   - Análise pré-FASE 8 (final assessment)
   - Pode estar obsoleta à luz de decisões finais
   - **Impacto AI:** Pode direcionar implementação errada

5. **`ux/personas.md` (Feb 27)** — Personas PRÉ-BROWNFIELD
   - Criada ANTES de FASES 5-6 (especialistas validarem UX)
   - Pode estar desalinhada com realidade atual
   - **Impacto AI:** AI baseia decisões de UX em personas antigas

### Verdict

**Todos esses arquivos causam RUÍDO DE CONTEXTO porque**:
- ✗ Pré-datam a validação por especialistas (FASES 5-9)
- ✗ Podem conflitar com decisões finalizadas
- ✗ Causam duplicação/confusão de source of truth
- ✗ Impactam negativa engenharia de AI

---

## 🎯 PLANO DE LIMPEZA AGRESSIVA

### **Fase 1: REMOVE (Não Stub!) — Arquivos PRÉ-MAR-06**

#### A. Architecture — PRÉ-FEB-26 ou Análise FEB-26

```bash
# REMOVE COMPLETELY (mover para _deprecated/ com conteúdo intacto)
REMOVE: docs/architecture/adr/ADR-005-data-fetching-patterns.md (Mar 1, pré-validação)
REMOVE: docs/architecture/alert-system-implementation-plan.md (Feb 26 analysis)
REMOVE: docs/architecture/data-fetching-patterns.md (Feb 26 analysis)
REMOVE: docs/architecture/log-retention-policy.md (Feb 26 analysis)
REMOVE: docs/architecture/module-standards.md (Feb 26 analysis)
```

#### B. UX/Personas — PRÉ-BROWNFIELD

```bash
REMOVE: docs/ux/personas.md (Feb 27, pré-FASE 5-6)
```

#### C. Stories — Antigas (não usadas em desenvolvimento ativo)

**Verificar quais stories não estão marcadas como "development em andamento" e remover:**
- Histórias de épicos antigos que já foram substitu ídas por stories.* versão nova
- Histórias que não têm data de Mar 2026 de continuação

---

### **Fase 2: KEEP (Com Validação)**

| File | Date | Reason |
|------|------|--------|
| `ADR-009` | Mar 1 | RLS CRÍTICO, dentro período Brownfield |
| `authorization-matrix.md` | Mar 7 | CURRENT |
| `secret-rotation.md` | Mar 6 | CURRENT |
| FASES 1-9 docs | Mar 6-7 | CRÍTICO PROTECTED |

---

## 🚨 AÇÃO IMEDIATA

### Arquivos a REMOVER AGORA

**Passo 1: Fazer backup em _deprecated/**
- Copiar conteúdo completo dos arquivos em `_deprecated/{categoria}/`
- Manter histórico intacto para referência se necessário

**Passo 2: Remover de docs/**
- Deletar completamente dos paths originais
- Zero stubs (não mais stubs!)

**Passo 3: Verificar dependencies**
- Se alguma story/doc atual referencia esses, UPDATE LINKS para FASES 1-9 equivalentes

**Passo 4: AI Context Cleanup**
- Remove aliases/references no contexto que pode apontar para esses arquivos

---

## 📊 Impacto Esperado Após Limpeza

**ANTES:** ~102 arquivos, 10-15% ruído (arquivos antigos conflitando)
**DEPOIS:** ~95 arquivos, 0% ruído (APENAS Mar 6+ documentação)

**AI Context Melhoria:**
- ✅ Remove sinais conflitantes (Feb vs Mar padrões)
- ✅ Remove decisões desvalidadas (pré-especialistas)
- ✅ Remove duplicação (alert-system + phase roadmap)
- ✅ Remove personas desatualizadas
- ✅ Força agentes a usar FASES 1-9 como source of truth

---

## 🎊 Recomendação Final

**EXECUTE AGGRESSIVE CLEANUP AGORA:**
1. Remove 6-7 arquivos PRÉ-MAR-06 completamente
2. Mova conteúdo para _deprecated/ com full history
3. Update any references para documentação atualizada
4. Resultado: docs/ 100% FASES 1-9 aligned, 0% legacy noise

**Confiança:** 95% que isso é necessário para clean AI context

---

**Prepared by:** Orion (aiox-master)
**Date:** 2026-03-07 22:00 UTC
**Status:** READY FOR EXECUTION
