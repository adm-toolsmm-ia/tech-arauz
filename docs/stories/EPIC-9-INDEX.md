# EPIC 9 — Org Management UX: Navegação Hierárquica Contextual

**Status:** Draft (aguardando validação @po)
**Total Effort:** ~59h estimadas
**Sprint Timeline:** Sprint 3 (23h) → Sprint 4 (30h) → Sprint 5 (6h)
**Equipe:** @dev (Dex) + @ux-design-expert (Uma) + @architect (Aria)
**Objetivo:** Implementar navegação hierárquica sem sair da página — Area → Nucleus → Process → Routine → Activity, tudo via painéis empilhados.

---

## 📋 Stories — Ordem de Execução

| # | Story | Sprint | Effort | Status | Bloqueadores | Bloqueada por |
|---|-------|--------|--------|--------|--------------|---------------|
| 9.1 | Componentes Compartilhados | 3 | 4h | Draft | Nenhum | Nenhum |
| 9.2 | ContextPanel Infraestrutura | 3 | 6h | Draft | 9.1 | Nenhum |
| 9.3 | AreaCockpit Núcleos Inline | 3 | 8h | Draft | 9.1, 9.2 | Nenhum |
| 9.7 | Entity Card Redesign | 3 | 5h | Draft | 9.1 | Nenhum (paralela) |
| 9.4 | ProcessCockpit + Routine | 4 | 10h | Draft | 9.1, 9.2, 9.3 | 9.3 |
| 9.5 | ActivityCockpit Deepest | 4 | 8h | Draft | 9.1, 9.2, 9.4 | 9.4 |
| 9.6 | OrgEntityFormSheet | 4 | 12h | Draft | 9.1, 9.3, 9.4, 9.5 | 9.5 |
| 9.8 | AI Context Engineering | 5 | 6h | Draft | 9.5 | 9.5 |

**Total Sprint 3:** 9.1 + 9.2 + 9.3 + 9.7 = 23h
**Total Sprint 4:** 9.4 + 9.5 + 9.6 = 30h
**Total Sprint 5:** 9.8 = 6h
**Total EPIC:** 59h

---

## 🎯 Arquitetura — Stacked Context Panels

```
┌─────────────────────────────────────┐
│        MAIN CONTENT (Areas)         │ ← z-0
├─────────────────────────────────────┤
│  SplitView: AreaCockpit360  (z-50)  │ ← Click Area
├─────────────────────────────────────┤
│    ContextPanel(1): Nucleus (z-60)  │ ← Click Nucleus
├─────────────────────────────────────┤
│    ContextPanel(2): Process (z-70)  │ ← Click Process
├─────────────────────────────────────┤
│    ContextPanel(3): Routine (z-80)  │ ← Click Routine
├─────────────────────────────────────┤
│  Sheet: Activity (z-90)             │ ← Click Activity
└─────────────────────────────────────┘
```

**Regra:** Escape fecha apenas painel mais profundo. Breadcrumb permite saltar para qualquer nível.

---

## 📊 Dependências Visuais

```
┌─────────────────────────────────────────────┐
│ Story 9.1: Shared Components (4h)           │
│  ├─ InfoField.tsx                           │
│  ├─ RolesDisplay.tsx                        │
│  ├─ OrgEntityCard.tsx                       │
│  ├─ InputOutputList.tsx                     │
│  ├─ DocumentationAccordion.tsx              │
│  └─ index.ts barrel export                  │
└─────────────────────────────────────────────┘
                    ↓ (dep)
        ┌───────────┴───────────┐
        ↓                       ↓
   ┌─────────────┐      ┌──────────────┐
   │ 9.2:        │      │ 9.7:         │
   │ ContextPanel│      │ Card Redesign│
   │ (6h)        │      │ (5h)         │
   └─────────────┘      └──────────────┘
        ↓ (dep)                │
        ↓                      └─ paralela, no bloqueador
   ┌─────────────────────────────┐
   │ Story 9.3: AreaCockpit      │
   │ Núcleos Inline (8h)         │
   │  ├─ AreaCockpit360 refator  │
   │  ├─ NucleusCockpit360 novo  │
   │  └─ areas-content refactor  │
   └─────────────────────────────┘
                ↓ (dep)
   ┌─────────────────────────────┐
   │ Story 9.4: Process/Routine  │
   │ Hierarquia Completa (10h)   │
   │  ├─ ProcessCockpit360       │
   │  ├─ RoutineCockpit360 novo  │
   │  └─ processos-content       │
   └─────────────────────────────┘
                ↓ (dep)
   ┌─────────────────────────────┐
   │ Story 9.5: ActivityCockpit  │
   │ Nível Mais Profundo (8h)    │
   │  ├─ ActivityCockpit360 novo │
   │  ├─ InputOutputList refator │
   │  ├─ DocumentationAccordion  │
   │  └─ atividades-content      │
   └─────────────────────────────┘
        ↓ (dep)           ↓ (dep)
   ┌─────────────┐   ┌───────────────┐
   │ 9.6:        │   │ 9.8:          │
   │ FormSheet   │   │ AI Context    │
   │ (12h)       │   │ (6h)          │
   └─────────────┘   └───────────────┘
```

---

## 🔑 Key Features por Story

### **Story 9.1 — Shared Components** ⭐ Fundação
- `InfoField` — Label + Value com layout consistente
- `RolesDisplay` — Badges com Popover para excesso
- `OrgEntityCard` — Card genérico clicável
- `InputOutputList` — Cards com ícones direcionais
- `DocumentationAccordion` — JSONB → Accordion Shadcn
- **Impacto:** Zero duplicação em 3 cockpits

### **Story 9.2 — ContextPanel** ⭐ Infraestrutura
- Sheet sem backdrop escuro (mantém contexto visual)
- Z-index automático baseado em `depth` prop
- Breadcrumb navegável (pula para qualquer nível)
- Escape fecha apenas painel mais profundo
- **Impacto:** Padrão reutilizável para N níveis

### **Story 9.3 — AreaCockpit Inline** ⭐ Quick Win
- Elimina Link navigation de "Ver Núcleos"
- Núcleos como lista clicável inline
- Botão "+ Novo Núcleo" → FormSheet
- **Impacto:** Problema core resolvido — prova de conceito

### **Story 9.4 — Process/Routine Hierarchy** 📈 Scale
- Estende padrão de 9.3 para Process → Routine
- ProcessCockpit refatorado (remove Link "Ver Rotinas")
- RoutineCockpit360 novo com 3 tabs
- Area → Nucleus → Process → Routine sem sair da página
- **Impacto:** Hierarquia completa até Rotina

### **Story 9.5 — ActivityCockpit** 🎨 UX Rica
- ActivityCockpit360 com 4 tabs (Info, BPM, Docs, Doc)
- Complexity badges coloridas (low=green, medium=yellow, high=red)
- InputOutputList com variants (risk, impact)
- DocumentationAccordion com destaque para `regra` (AlertCircle)
- Steps numeradas, prazo com Clock ícone
- **Impacto:** Hierarquia completa + dados ricos visualizados

### **Story 9.6 — FormSheet** 🔧 CRUD
- OrgEntityFormSheet unifica formulários de criação/edição
- Tabs por entidade (Área: Info/Doc; Processo: Info/BPM/Doc; etc)
- Dirty state detection com AlertDialog
- Server Actions integradas (sem modificação)
- Validação com field_errors inline
- **Impacto:** CRUD rico + consistent UX

### **Story 9.7 — Card Redesign** 🎨 Visual
- AreasCardView: nuclei_count, roles badges, description preview
- NucleosCardView: área pai badge, processes_count
- ProcessCard novo: inputs/outputs indicators
- Hover state com shadow-md, responsive grid
- **Impacto:** Cards ricos exibem contexto

### **Story 9.8 — AI Context** 🤖 Preparação
- `toAIContext()` transformer — OrgProcess/Routine/Activity → OrgAIContext plano
- Zero server calls — transformação local
- Steps como array (fácil tokenização para AI)
- Rules field marcado para ênfase
- DocumentationAccordion destaque para `regra`
- **Impacto:** Pronto para EPIC 7.4 (Chatbot AI)

---

## 🗂️ Arquivos Críticos

### Criados (Novos)
- `src/components/organization/shared/InfoField.tsx`
- `src/components/organization/shared/RolesDisplay.tsx`
- `src/components/organization/shared/OrgEntityCard.tsx`
- `src/components/organization/shared/InputOutputList.tsx`
- `src/components/organization/shared/DocumentationAccordion.tsx`
- `src/components/organization/shared/index.ts`
- `src/components/views/ContextPanel.tsx`
- `src/components/organization/RoutineCockpit360.tsx`
- `src/components/organization/ActivityCockpit360.tsx`
- `src/components/organization/OrgEntityFormSheet.tsx`
- `src/components/organization/ProcessCard.tsx`
- `src/lib/transformers/organization.ts`

### Refatorados (Modificação)
- `src/components/organization/AreaCockpit360.tsx`
- `src/components/organization/NucleusCockpit360.tsx`
- `src/components/organization/ProcessCockpit360.tsx`
- `src/components/views/SplitView.tsx`
- `src/app/organizacao/areas/areas-content.tsx`
- `src/app/organizacao/areas/components/AreasCardView.tsx`
- `src/app/organizacao/nucleos/nucleos-content.tsx`
- `src/app/organizacao/nucleos/components/NucleosCardView.tsx`
- `src/app/organizacao/processos/processos-content.tsx`
- `src/app/organizacao/processos/[processId]/rotinas/[routineId]/atividades/atividades-content.tsx`
- `src/types/organization.ts` (adicionar OrgAIContext interface)

### Referência (NÃO MODIFICAR)
- `src/app/actions/organization.ts`

---

## ✅ Checklist de Validação (Story-Level)

### Story 9.1 ✓
- [ ] Cockpits importam shared sem quebras
- [ ] Build passa
- [ ] TypeCheck passa

### Story 9.2 ✓
- [ ] SplitView + ContextPanel coexistem
- [ ] Escape fecha painel mais profundo
- [ ] Breadcrumb navegável funciona
- [ ] Z-index correto (z-50 + depth * 10)

### Story 9.3 ✓
- [ ] Area → Nucleus inline navegação
- [ ] FormSheet abre para novo Núcleo
- [ ] Rota `/areas/[areaId]/nucleos` still works

### Story 9.4 ✓
- [ ] Process → Routine navegação
- [ ] Rota `/processos/[id]/rotinas` still works
- [ ] Breadcrumb fecha painéis corretamente

### Story 9.5 ✓
- [ ] Activity Sheet abre
- [ ] Complexity badges coloridas
- [ ] Campo `regra` com AlertCircle
- [ ] Steps numeradas

### Story 9.6 ✓
- [ ] FormSheet abre com entity/mode correto
- [ ] Dirty state detecta mudanças
- [ ] Server Actions executam
- [ ] Validação funciona (field_errors)

### Story 9.7 ✓
- [ ] Cards renderizam ricos
- [ ] Hover state funciona
- [ ] Grid responsivo em mobile/tablet/desktop

### Story 9.8 ✓
- [ ] `toAIContext(process)` retorna objeto plano
- [ ] Steps em array (não nested)
- [ ] Rules field populado
- [ ] DocumentationAccordion destaque para regra

---

## 🎬 Próximos Passos

1. **Validação com @po** — `*validate-story-draft` cada story
2. **Sprint Planning** — agendar 3 sprints com @dev (Dex)
3. **Deep Dive Technical** — @architect (Aria) revisa ADRs 9-13
4. **EPIC 7.4 Prep** — story 9.8 feedback para Chatbot AI team

---

## 📚 Referências

- **ADR-009:** ContextPanel sem backdrop escuro
- **ADR-010:** Estado de painéis local ao content
- **ADR-011:** Fetch on demand para sub-entidades (depth >= 2)
- **ADR-012:** Server Actions não modificadas
- **ADR-013:** toAIContext() transformer puro

---

**Criado por:** River (Scrum Master)
**Data:** 2026-03-14
**Status:** Draft — Aguardando validação @po *validate-story-draft

