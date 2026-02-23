# 🎯 PLANO FINAL: Filtros Rápidos & Atalhos 10/10 - Execução AIOS

> **Objetivo Final**: Filtros rápidos e atalhos funcionais em Projetos e Cronogramas (SEM ERROS)  
> **Data**: 2026-02-23 | **Status**: Ready for Orchestration  
> **Envolvimento**: Equipe AIOS Completa

---

## 👥 DELEGAÇÃO POR AGENTE AIOS

### 🎯 @aios-master (Orquestrador)
**Responsabilidade**: Coordenar execução, gates, aprovações

- [ ] Validar este plano com @architect
- [ ] Coordenar paralelização de tasks
- [ ] Gate de qualidade antes de merge
- [ ] Aprovação final

---

### 👨‍💻 @dev (Implementação - PRINCIPAL)
**Responsabilidade**: Integrar FilterBar em pages + quality gates

**Tasks**:
- [ ] **Dev-1** (20 min): Integrar FilterBar em `projects-content.tsx`
  - Adicionar imports
  - Chamar `useProjetosFilters` hook
  - Renderizar `<FilterBar>`
  - Trocar dados para `filteredData`

- [ ] **Dev-2** (20 min): Integrar FilterBar em `cronogramas-content.tsx`
  - Mesma estrutura que Projetos
  - Validar tipos

- [ ] **Dev-3** (15 min): Quality gates
  - `npm run lint`
  - `npm run typecheck`
  - Validação manual: abrir browser, testar filtros

**Reference**: `.context/11-CODE-READY-SNIPPETS.md` (copy-paste ready)

---

### 🏗️ @architect (Validação Arquitetural)
**Responsabilidade**: Revisar alinhamento com ADRs + aprovação final

- [ ] **Arch-1** (10 min): Revisar se implementação segue ADR-003
  - FilterBar como controlled component ✓
  - Persistência localStorage ✓
  - Design system alinhado ✓

- [ ] **Arch-2** (5 min): Validar se não há technical debt
  - Imports corretos
  - Tipos alinhados
  - Sem código duplicado

- [ ] **Arch-3** (Gate): Aprovação técnica antes de merge

---

### 🧪 @qa (Testes + Validação)
**Responsabilidade**: Testes funcionais e validação E2E

- [ ] **QA-1** (15 min): Rodar quality gates
  - Lint ✓
  - Typecheck ✓
  - Testes unitários (104 devem passar)

- [ ] **QA-2** (20 min): Testes manuais no browser
  - Abrir `/projetos` → FilterBar renderiza?
  - Clicar quick filter → funciona?
  - Pesquisa funciona?
  - Filtros persistem (localStorage)?
  - View mode alterna (kanban/list)?
  - Dados filtram corretamente?

- [ ] **QA-3** (15 min): Testes em `/cronogramas`
  - Mesmos testes que Projetos

- [ ] **QA-4** (5 min): Validação de erros console
  - F12 → Console: ZERO erros

- [ ] **QA-Gate**: Checklist completo antes de produção

---

### 📊 @data-engineer (Validação de Dados)
**Responsabilidade**: Validar dados corretos + mapeamento schema

- [ ] **Data-1** (10 min): Validar dados em `/projetos`
  - Status values corretos (da BD)?
  - Priority values corretos?
  - Responsáveis carregam dinamicamente?
  - Categoria carrega?

- [ ] **Data-2** (10 min): Validar dados em `/cronogramas`
  - Project_id carrega (com project titles)?
  - Schedule status corretos?
  - Responsáveis carregam?

- [ ] **Data-3** (Gate): Validação de integridade antes de produção

---

### 🎨 @frontend (UI/UX Review)
**Responsabilidade**: Revisar UI, acessibilidade, design

- [ ] **Frontend-1** (10 min): UI Review
  - FilterBar renderiza corretamente?
  - Popover funciona em quick filters?
  - Design tokens aplicados?
  - Responsivo?

- [ ] **Frontend-2** (5 min): Acessibilidade
  - Labels corretos?
  - ARIA attributes?
  - Keyboard navigation?

- [ ] **Frontend-3** (Gate): Aprovação visual/UX

---

### 📈 @devops (Delivery & Merge)
**Responsabilidade**: Merge final + validação em staging

- [ ] **DevOps-1** (10 min): Validar branch status
  - Todos commits OK?
  - CI/CD passa?

- [ ] **DevOps-2** (5 min): Merge para main
  - `git push origin`

- [ ] **DevOps-3** (Gate): Confirmar deploy

---

## 🔄 FLUXO DE EXECUÇÃO (Paralelizável)

### Fase 1: Implementação (Paralelo)
```
@dev
├─ Dev-1: Integrar Projetos     [20 min]
├─ Dev-2: Integrar Cronogramas  [20 min]
└─ Dev-3: Quality gates         [15 min]
            ↓
```

### Fase 2: Validação (Paralelo)
```
@architect      @qa          @data-engineer    @frontend
├─ Arch-1,2,3   ├─ QA-1     ├─ Data-1,2,3     ├─ Frontend-1,2,3
│ [15 min]      ├─ QA-2,3,4 │ [20 min]        │ [15 min]
│               │ [50 min]   │                 │
└──────────────┴─────────────┴─────────────────┴──────────────
                         ↓ TODOS DEVEM PASSAR
```

### Fase 3: Delivery
```
@aios-master: GATE FINAL (5 min)
    ↓ APROVADO?
    ├─ SIM → @devops: Merge (5 min)
    └─ NÃO → @dev: Correções
```

---

## 📋 CHECKLIST FINAL (AIOS Gate)

### ✅ Código
- [ ] Lint: 0 errors
- [ ] Typecheck: 0 errors
- [ ] Testes: 104/104 passing
- [ ] Sem console errors

### ✅ Funcionalidade
- [ ] FilterBar renderiza em `/projetos`
- [ ] FilterBar renderiza em `/cronogramas`
- [ ] Quick filters funcionam (popover)
- [ ] Advanced filters funcionam (sheet)
- [ ] Pesquisa funciona
- [ ] View mode alterna
- [ ] Dados filtram corretamente
- [ ] Persistência localStorage funciona

### ✅ Qualidade
- [ ] ADR-003 alinhado
- [ ] Design tokens aplicados
- [ ] Acessibilidade OK
- [ ] Data integridade OK
- [ ] UI responsivo

### ✅ Documentação
- [ ] Story atualizada
- [ ] Contexto consolidado
- [ ] README se necessário

---

## ⏱️ ESTIMATIVA DE TEMPO

| Fase | Responsável | Tempo | Total |
|------|-------------|-------|-------|
| **Implementação** | @dev | 55 min | 55 min |
| **Validação** | @architect + @qa + @data + @frontend | 50 min (paralelo) | 50 min |
| **Gate Final** | @aios-master + @devops | 10 min | 10 min |
| **TOTAL** | Equipe AIOS | - | **~115 min** |

**Status Esperado**: Filtros 100% funcionais em ~2 horas ⏰

---

## 📍 ARQUIVOS A MODIFICAR

| Arquivo | Tipo | Por Quem | Tempo |
|---------|------|---------|-------|
| `projects-content.tsx` | Integração | @dev | 20 min |
| `cronogramas-content.tsx` | Integração | @dev | 20 min |
| Quality gates | Validação | @qa | 50 min |
| Aprovações | Gate | @architect + @devops | 15 min |

---

## 🚀 COMO COMEÇAR

### Passo 1: Comunicar Equipe
```
@aios-master: Iniciando Fase 3 (Integração Final)
@dev: Começar Dev-1 (Projetos)
@qa: Preparar ambiente de teste
@architect: Fazer review de ADR-003
@data-engineer: Validar dados
@frontend: Revisar UI
```

### Passo 2: @dev Executa
Use `.context/11-CODE-READY-SNIPPETS.md` para copy-paste

### Passo 3: Validação Paralela
Todos validam simultaneamente

### Passo 4: Gate Final
@aios-master aprova + @devops merge

---

## 📞 COMUNICAÇÃO ENTRE AGENTES

**Slack/Discord esperado**:

```
@dev: "Integração em projects-content.tsx ✅"
@dev: "Integração em cronogramas-content.tsx ✅"
@dev: "Quality gates rodando..."
  → @qa: "Começando testes"
  → @architect: "Reviewando arquitetura"
  → @data-engineer: "Validando dados"
  → @frontend: "Reviewando UI"
@dev: "Lint ✅ Typecheck ✅"
@qa: "Testes manuais ✅"
@architect: "Aprovado: ADR-003 alinhado ✅"
@data-engineer: "Dados validados ✅"
@frontend: "UI aprovada ✅"
@aios-master: "Gate final: APROVADO ✅"
@devops: "Merge completo ✅"
```

---

## 🎯 ENTREGA FINAL

**O que o usuário receberá**:
- ✅ Filtros rápidos funcionando em Projetos
- ✅ Filtros rápidos funcionando em Cronogramas
- ✅ Atalhos (quick filters com popover)
- ✅ Zero erros ao acessar páginas
- ✅ Persistência localStorage
- ✅ Quality gates 100% passing
- ✅ Documentação consolidada
- ✅ Story completa

---

## 📊 DEFINIÇÃO DE PRONTO (Definition of Done)

```
✅ CÓDIGO
   ├─ npm run lint         → 0 errors
   ├─ npm run typecheck    → 0 errors
   ├─ npm test             → 104/104 passing
   └─ F12 console          → 0 errors

✅ FUNCIONALIDADE
   ├─ /projetos carrega sem erro
   ├─ /cronogramas carrega sem erro
   ├─ Filtros aplicam dados
   ├─ localStorage persiste
   └─ View modes funcionam

✅ QUALIDADE
   ├─ ADR-003 alinhado
   ├─ Design system OK
   ├─ Acessibilidade OK
   └─ UX aprovada

✅ DOCUMENTAÇÃO
   ├─ Story atualizada
   ├─ Contexto consolidado
   └─ Deploy notes

✅ APROVAÇÃO AIOS
   └─ Todos agentes: APPROVED ✓
```

---

**Status**: 🚀 **PRONTO PARA ORQUESTRAÇÃO**

**Próximo passo**: @aios-master coordena execução ou @dev começa?

---

**Mantido por**: @aios-master | **Equipe**: AIOS Completa | **Data**: 2026-02-23
