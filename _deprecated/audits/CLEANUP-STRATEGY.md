# AIOX Brownfield Discovery — Estratégia de Limpeza de Docs

**Data:** 2026-03-07
**Executor:** Aria (Architect) — AIOX Brownfield Discovery Workflow
**Status:** ✅ EXECUÇÃO EM PROGRESSO

---

## 📋 Protocolo de Proteção AIOX

Todos os arquivos que serão arquivados foram **VALIDADOS** contra:

✅ **FASES 1-9 PROTEGIDAS (Mar 6-7):**
- `docs/architecture/system-architecture.md` (FASE 1)
- `supabase/docs/DB-AUDIT.md` + `SCHEMA.md` (FASE 2)
- `docs/frontend/frontend-spec.md` (FASE 3)
- `docs/prd/technical-debt-assessment.md` (FASE 8)
- `docs/reviews/db-specialist-review.md` (FASE 5)
- `docs/reviews/ux-specialist-review.md` (FASE 6)
- `docs/qa/fase7-quality-gate.md` (FASE 7)
- `docs/reports/TECHNICAL-DEBT-REPORT.md` (FASE 9)
- `docs/architecture/BROWNFIELD-DISCOVERY-AUDIT.md` (QA)

✅ **STORIES ATIVAS PROTEGIDAS (Mar 2026):**
- `docs/stories/story-*.md` (série 1, 2, 3, 4, 8)
- `docs/stories/4.1-migration-*.md` (trabalho em progresso)
- `docs/stories/7.* (Mar 1+ completados)

---

## 🔴 ARQUIVOS A ARQUIVAR (Identificados como OLD CYCLES)

### **Categoria 1: Épicos Antigos (Pre-Brownfield)**
| Arquivo | Data | Razão |
|---------|------|-------|
| `docs/stories/epic-4-ai-features-chat-360.md` | Mar 1 | Pré-brownfield, supercedido por stories 4.* |
| `docs/stories/epic-5-auxiliares-ia-alignment.md` | Mar 1 | Pré-brownfield, supercedido por stories 5.* |
| `docs/stories/epic-technical-debt.md` | Feb 28 | Refs @aios-master (deprecated), supercedido por FASES 1-9 |
| `docs/stories/epic-ux-10-10.md` | Feb 27 | Antigo, supercedido por story-series-2.* |

### **Categoria 2: Documentos Architecture Pre-Brownfield**
Nenhum adicional identificado (all architecture docs foram auditados e atualizados em FASE 1).

### **Categoria 3: Stories Incompletas / Antigos**
Verificação em andamento — nenhuma story-* será removida a menos que seja claramente "old epic" com número < 1000.

---

## ✅ VALIDAÇÃO ANTES DE ARQUIVAR

Cada arquivo será validado contra:
1. ✅ Não é FASE 1-9?
2. ✅ Não é story-* ativo (Mar)?
3. ✅ Não é referenciado por arquivos atualizados?
4. ✅ Data < 2026-03-06 OU refs a componentes deprecated (AIOS)?

**Todos os 4 épicos acima passou em validação.**

---

## 📂 Estrutura Final Esperada

```
docs/
├── architecture/           [PROTEGIDO - FASES 1-9]
│   ├── system-architecture.md (FASE 1) ✅
│   ├── BROWNFIELD-DISCOVERY-AUDIT.md (QA) ✅
│   ├── adr/                [PROTEGIDO]
│   └── (outros padrões)
├── frontend/               [PROTEGIDO - FASE 3]
│   └── frontend-spec.md ✅
├── prd/                    [PROTEGIDO - FASES 4,8]
│   ├── technical-debt-assessment.md (FASE 8) ✅
│   └── technical-debt-DRAFT.md (histórico FASE 4)
├── reviews/                [PROTEGIDO - FASES 5,6]
│   ├── db-specialist-review.md (FASE 5) ✅
│   └── ux-specialist-review.md (FASE 6) ✅
├── qa/                     [PROTEGIDO - FASE 7]
│   └── fase7-quality-gate.md ✅
├── reports/                [PROTEGIDO - FASE 9]
│   └── TECHNICAL-DEBT-REPORT.md ✅
├── stories/                [PROTEGIDO - Active stories only]
│   ├── story-*.md (1, 2, 3, 4, 8) ✅
│   ├── 4.1-*.md, 5.*.md, etc. (working) ✅
│   └── [epic-4, epic-5, epic-td, epic-ux → ARQUIVAR]
└── CLEANUP-STRATEGY.md     [Este arquivo]

_deprecated/
├── docs-feb-27/            [JÁ MOVIDO]
│   ├── design-system.md
│   ├── PLANO-ACAO-10-10.md
│   ├── portal-tech-ai-agents-context.md
│   └── portal-tech-ai-evolution-masterplan.md
├── stories-old-cycles/     [PENDENTE]
│   ├── epic-4-ai-features-chat-360.md
│   ├── epic-5-auxiliares-ia-alignment.md
│   ├── epic-technical-debt.md
│   └── epic-ux-10-10.md
└── README.md               [Com data, razão, referência a FASES 1-9]
```

---

## 🚀 Execução Programada

1. **Criar `_deprecated/stories-old-cycles/`** ✅
2. **Mover 4 épicos antigos** → `_deprecated/stories-old-cycles/`
3. **Validar que docs/ contém:**
   - ✅ FASES 1-9 + outputs (PROTEGIDO)
   - ✅ Stories 1.*, 2.*, 3.*, 4.*, 8.* (PROTEGIDO)
   - ✅ Architecture/Design/Patterns atualizados
   - ❌ Nenhum arquivo Feb 26-28 ou early-Mar-1-5
4. **Criar README em `_deprecated/`** com explicação
5. **Documentar resultado final** em memory/MEMORY.md

---

## ⚡ Garantias de Segurança

✅ **NENHUM arquivo criado/atualizado por AIOX será removido**
✅ **NENHUM story ativo (Mar) será removido**
✅ **NENHUMA documentação de architecture atual será removida**
✅ **Todos os épicos antigos (4, 5, TD, UX-10-10) têm stories modernas que as substituem**

---

**Status:** Pronto para executar cleanup final
**Próximo passo:** Mover 4 épicos antigos → `_deprecated/stories-old-cycles/`

