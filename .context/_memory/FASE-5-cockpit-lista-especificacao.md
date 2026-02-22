# FASE 5 — Visão 360° + Lista Tática Executável
## Reorganizar Cockpit e Criar Modo Lista

**Data Início**: 2026-02-21  
**Fase**: 5/7  
**Executor**: @dev + @po  
**Duração Estimada**: 4-5 horas  

---

## 1. OBJETIVO

Criar dois novos modos de visualização complementares ao Kanban:
1. **Visão 360° melhorada** (SplitView/Cockpit) com blocos de decisão
2. **Modo Lista Tática** com filtros rápidos para visualização tabular

---

## 2. PROBLEMA IDENTIFICADO

### Estado Atual
- Cockpit é painel lateral que replica muita info do Kanban
- Sem modo lista alternativo
- Não há bloco de contexto/histórico
- Campos removidos da FASE 4 (Complexidade, Objetivo) não têm lugar

### Objetivo
- Visão 360° com blocos temáticos (Dados, Contexto, Histórico, Ações)
- Modo lista para visualização tabular completa
- Local para dados estratégicos/secundários
- Toggle entre Kanban ↔ Lista

---

## 3. ESPECIFICAÇÃO: VISÃO 360° (Cockpit Refatorado)

### 3.1 Estrutura em Blocos

```
┌──────────────────────────────────────────────┐
│ [X] FECHAR                                   │
├──────────────────────────────────────────────┤
│ 📌 TÍTULO + CÓDIGO ESPAIDER                  │ (Header)
├──────────────────────────────────────────────┤
│ BLOCO 1: DADOS CRÍTICOS                      │
│ ├ Status: Badge                              │
│ ├ Prazo: 15 de Março (DESTAQUE)              │
│ ├ Fase: Em Desenvolvimento                   │
│ └ Responsável: João (LINK)                   │
├──────────────────────────────────────────────┤
│ BLOCO 2: CONTEXTO ESTRATÉGICO                │
│ ├ Área: Tecnologia                           │
│ ├ Complexidade: Alta                         │
│ ├ Impacto Estratégico: Alto                  │
│ ├ Impacto Operacional: Crítico               │
│ └ Importância Especial: ⭐ SIM               │
├──────────────────────────────────────────────┤
│ BLOCO 3: DETALHAMENTO                        │
│ ├ Objetivo: [Descrição longa aqui]           │
│ └ Justificativa: [Contexto aqui]             │
├──────────────────────────────────────────────┤
│ BLOCO 4: TIMELINE / HISTÓRICO                │
│ ├ Criado: 01/02/2026                         │
│ ├ Atualizado: 20/02/2026                     │
│ ├ Próximo Prazo: 10/03 (Aprovação)           │
│ └ Movimentação: 20/02 às 14:30               │
├──────────────────────────────────────────────┤
│ BLOCO 5: AÇÕES RÁPIDAS                       │
│ ├ [Editar]  [Clonar]  [Arquivar]             │
│ └ [Mais opções...]                           │
└──────────────────────────────────────────────┘
```

### 3.2 Blocos Detalhados

#### Bloco 1: DADOS CRÍTICOS
```
┌─ Status ─────────────────────────────┐
│ [Em Desenvolvimento] Badge            │
├─ Prazos ─────────────────────────────┤
│ Prazo Final: 15 de Março de 2026      │
│ Próximo Prazo: 10 de Março (Aprovador)│
├─ Fase ───────────────────────────────┤
│ Fase Atual: Em Desenvolvimento        │
├─ Responsável ────────────────────────┤
│ 👤 João da Silva (clicável → filtro)  │
└───────────────────────────────────────┘
```

#### Bloco 2: CONTEXTO ESTRATÉGICO
```
┌─ Área ────────────────────────────────┐
│ Tecnologia / Infraestrutura            │
├─ Complexidade Técnica ────────────────┤
│ [Alta] (badge)                         │
├─ Impactos ───────────────────────────┤
│ Estratégico: Alto                      │
│ Operacional: Crítico                   │
├─ Importância ────────────────────────┤
│ ⭐ Importância Especial: SIM            │
└────────────────────────────────────────┘
```

#### Bloco 3: DETALHAMENTO
```
┌─ Objetivo ────────────────────────────┐
│ Implementar novo sistema de autenticação│
│ com suporte para OAuth2 e MFA.          │
│ Objetivo da empresa é melhorar...      │
│ [... texto longo, totalmente visível]  │
├─ Justificativa ──────────────────────┤
│ Necessário para atender compliance      │
│ regulatória ISO 27001. Justificativa...│
│ [... contexto completo]                │
└────────────────────────────────────────┘
```

#### Bloco 4: TIMELINE
```
┌─ Histórico de Datas ──────────────────┐
│ Criado: 01 de Fevereiro de 2026        │
│ Atualizado: 20 de Fevereiro de 2026    │
│ Próximo Prazo: 10 de Março (Aprovação) │
│ Última Movimentação: 20/02 às 14:30    │
└────────────────────────────────────────┘
```

#### Bloco 5: AÇÕES RÁPIDAS
```
┌─ Opções ──────────────────────────────┐
│ [Editar] [Clonar] [Arquivar] [...]     │
└────────────────────────────────────────┘
```

---

## 4. ESPECIFICAÇÃO: MODO LISTA TÁTICA

### 4.1 Estrutura

```
┌─────────────────────────────────────────────────────────────────────┐
│ [KANBAN VIEW] [LIST VIEW]  ← Toggle Tabs                            │
├─────────────────────────────────────────────────────────────────────┤
│ Filtros Rápidos + Presets (mesmos de FASE 3)                        │
├─────────────────────────────────────────────────────────────────────┤
│ Código | Projeto | Status | Área | Responsável | Prazo | Fase | ... │
├─────────────────────────────────────────────────────────────────────┤
│ ESP001 | Projeto A | Em Desenvolvimento | TI | João | 15/03 | Dev   │
│ ESP002 | Projeto B | Em Aprovação      | Ops| Maria| 20/03 | Testes│
│ ESP003 | Projeto C | Em Risco ⚠️        | TI | João | 05/03 | Dev   │
│ ...    | ...       | ...               | ...|  ...  | ...   | ...   │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Colunas da Tabela

| Coluna | Tipo | Selecionável? | Ordenável? | Filtrável? |
|--------|------|---------------|-----------|-----------|
| Código Espaider | `string` | Texto com link | ✅ | ✅ |
| Projeto | `string` | Texto (clicável → Cockpit) | ✅ | ✅ |
| Status | `badge` | Badge colida | ✅ | ✅ (quick filter) |
| Área | `string` | Texto | ✅ | ✅ (avançado) |
| Responsável | `string` | Nome com link | ✅ | ✅ (avançado) |
| Prazo Final | `date` | Data formatada | ✅ | ✅ (custom) |
| Fase Atual | `string` | Texto | ✅ | ✅ (avançado) |
| Alertas | `badges` | Especial, Atrasado, 7d | ❌ | ❌ |

### 4.3 Recurso: Expandir Linha (Opcional)

```
ESP001 | Projeto A | ... | [v]
  └─ Expandir mostra: Objetivo, Justificativa, Histórico em formato compacto
```

---

## 5. ARQUIVOS A MODIFICAR/CRIAR

| Arquivo | Ação | Escopo |
|---------|------|--------|
| `src/components/views/SplitView.tsx` | MODIFICAR | Refatorar Cockpit em blocos |
| `src/components/project/ProjectCockpit.tsx` | CRIAR NOVO | Extrair lógica se necessário |
| `src/components/views/ProjectListView.tsx` | CRIAR NOVO | Modo lista com tabela |
| `src/app/projetos/projects-content.tsx` | MODIFICAR | Toggle entre Kanban ↔ Lista |

---

## 6. CRITÉRIOS DE ACEITE

### Cockpit/Visão 360°
- ✅ 5 blocos temáticos (Críticos, Contexto, Detalhamento, Timeline, Ações)
- ✅ Todos os campos da `Project` interface representados
- ✅ Objetivo/Justificativa completos (sem truncamento)
- ✅ Complexidade técnica visível
- ✅ Impactos (estratégico/operacional) visíveis
- ✅ Timeline com datas completas

### Modo Lista
- ✅ 8+ colunas com dados principais
- ✅ Ordenação por coluna
- ✅ Filtros rápidos aplicam-se também à lista
- ✅ Clique em projeto abre Cockpit
- ✅ Responsividade em tablets (scroll horizontal OK)
- ✅ Sem performance issues com 100+ projetos

### Técnico
- ✅ `npm run lint` passa
- ✅ `npm run typecheck` passa
- ✅ `npm run build` passa
- ✅ Zero breaking changes

---

## 7. PLANO DE VALIDAÇÃO

### UX
- [ ] Abrir Cockpit, confirmar que 5 blocos são claros
- [ ] Verificar que Objetivo/Justificativa não truncam
- [ ] Mudar para modo Lista, confirmar que colunas têm dados
- [ ] Filtrar projetos e validar que filtros se aplicam a ambos (Kanban + Lista)
- [ ] Clique em projeto na Lista abre Cockpit

### A11y
- [ ] Navegação por Tab funciona em tabela
- [ ] Botões "Editar", "Clonar", etc. acessíveis

### Performance
- [ ] Scroll da tabela suave com 100+ projetos
- [ ] Sem memory leaks ao trocar de view

---

## 8. ENTREGÁVEIS FASE 5

- ✅ Arquivo modificado: `src/components/views/SplitView.tsx` (Cockpit refatorado)
- ✅ Arquivo novo: `src/components/views/ProjectListView.tsx` (Modo Lista)
- ✅ Arquivo modificado: `src/app/projetos/projects-content.tsx` (Toggle Kanban/Lista)
- ✅ Documentação: Esta especificação + resultado
- ✅ Testes: Validação visual com 20+ projetos
- ✅ Testes técnicos: lint, typecheck, build passando

---

## 9. PRÓXIMO PASSO

**Fase 6**: Hardening de Qualidade (QA + Security)
- Testes de regressão em Kanban, Lista, Cockpit
- Validação WCAG AA completa
- Security review dos filtros + data exposure
- Performance profiling com DevTools

---
