# FASE 4 — Kanban 10/10 Executável
## Refatorar Cards para UX/UI Ótima (Sem Truncamento)

**Data Início**: 2026-02-21  
**Fase**: 4/7  
**Executor**: @dev + @ux-design-expert  
**Duração Estimada**: 6-8 horas  

---

## 1. OBJETIVO

Redesenhar `ProjectKanbanCard` para eliminar truncamento visual de informações, melhorar hierarquia de dados e proporcionar leitura macro em < 5 segundos, mantendo todos os dados sem scroll no card.

---

## 2. PROBLEMA IDENTIFICADO

### Antes (Estado Atual)
- ❌ Cards com texto cortado (`line-clamp-2`, `line-clamp-1`)
- ❌ Informações comprimidas em linhas únicas
- ❌ Muitos campos secundários ocupando espaço primário
- ❌ Poluição visual (Complexidade Técnica, Detalhamento em destaque)
- ❌ Hierarquia fraca entre dados críticos vs. secundários

### Após (Objetivo)
- ✅ Todos os dados visíveis sem truncamento
- ✅ Hierarquia clara: crítico → importante → secundário
- ✅ Espaço bem aproveitado verticalmente
- ✅ Leitura rápida de status e prazos
- ✅ Campos secundários em tooltip/cockpit

---

## 3. ESPECIFICAÇÃO DE REDESENHO

### 3.1 Estrutura do Card Redesenhado

```
┌─────────────────────────────────────┐
│ █ [BARRA COLORIDA]                  │
├─────────────────────────────────────┤
│ 📌 TÍTULO DO PROJETO (#ESPxxxxx)    │  ← Hierarquia 1 (sempre visível)
├─────────────────────────────────────┤
│ [⭐ Especial] [🔴 Atrasado] [⏰ 7d] │  ← Alertas em linha
├─────────────────────────────────────┤
│ 👤 Responsável: João da Silva       │  ← Nome completo (sem truncamento)
│ 🏢 Área: Tecnologia                 │  ← Completo
├─────────────────────────────────────┤
│ 📅 Prazo Final: 15 de Março de 2026 │  ← Grande, com cor se atrasado
├─────────────────────────────────────┤
│ 🔗 Fase: Em Desenvolvimento         │  ← Nome legível
│ ⏱️ Próximo: 10 de Março (Aprovação) │  ← Se disponível
├─────────────────────────────────────┤
│ STATUS BADGE [Em Desenvolvimento]   │  ← Footer
└─────────────────────────────────────┘
```

### 3.2 Campos a MANTER (Visíveis no Card)

| Campo | Visualização | Hierarquia |
|-------|--------------|-----------|
| project_name + espaider_code | Título bold + código pequeno | **CRÍTICA** |
| importancia_especial | Badge "Especial" (amarelo) | **ALTA** |
| isOverdue | Badge "Atrasado" (vermelho) | **ALTA** |
| isWithin7Days | Badge "Prazo" (âmbar) | **ALTA** |
| responsible | Nome completo, sem truncamento | **ALTA** |
| area | Nome completo, sem truncamento | **ALTA** |
| end_date | Grande, com cor destacada se atrasado | **ALTA** |
| fase_atual | Nome legível | **MÉDIA** |
| prazo_aprovador / prazo_cronograma | "Próximo: [data]" | **MÉDIA** |
| status | Badge de status no footer | **ALTA** |

### 3.3 Campos a REMOVER (Mover para Cockpit/Tooltip)

| Campo | Ação | Motivo |
|-------|------|--------|
| complexidade_tecnica | → Cockpit (visão 360°) | Informação secundária, melhor em contexto |
| objetivo / justificativa | → Cockpit (detalhes) | Detalhamento, não resumo |
| tipo_chamado / tipo_assunto | → Cockpit | Contexto técnico |
| solicitante | → Cockpit | Informação secundária |

### 3.4 Mudanças de Layout

**Dimensões do Card**:
- Altura: Aumentar de 200px para ~280px para acomodar dados sem `line-clamp`
- Largura: Manter 300px (padrão Kanban)
- Padding: 12px (expandir de 10px)

**Espaçamento**:
- Seções com `border-top` e `pt-1.5` mantidas
- Gap entre linhas: 3px → 4px (respiração melhor)
- Texto: Tamanho mínimo 10px para responsabilidade

**Tipografia**:
- Título: `font-semibold text-sm` (aumentar visual)
- Código: `font-mono text-[10px]` mantido
- Dados principais: `text-xs` (não `text-[10px]`)
- Dados secundários: `text-[9px]`

---

## 4. MUDANÇAS CONCRETAS

### 4.1 Em `src/components/project/ProjectKanbanCard.tsx`

#### Remover `line-clamp` do título
```typescript
// ANTES:
<h4 className="... line-clamp-2 ...">

// DEPOIS:
<h4 className="text-sm font-semibold leading-normal">
```

#### Remover `line-clamp` do detalhamento (ou mover para tooltip)
```typescript
// ANTES:
<p className="line-clamp-1 text-[9px] ...">

// DEPOIS (se manter):
<p className="text-[9px] text-muted-foreground">
```

#### Refatorar responsável e área para nome completo
```typescript
// Usar TextWithTooltip APENAS se nome > 35 chars
// Senão, mostrar completo sem ellipsis

function TextWithTooltip({
  text,
  className,
  maxLength = 35,  // Aumentar de 30
}: {...})
```

#### Aumentar altura do card via CSS
```typescript
// Container pai do KanbanBoard
// Adicionar: 
className="... grid-rows-[auto]" 
// ou deixar automático
```

#### Remover Complexidade Técnica do card principal
```typescript
// Comentar/remover:
{project.complexidade_tecnica && (
  <div className="flex items-center gap-1.5 text-[9px]">
    <span className="text-muted-foreground">Complexidade:</span>
    <ImpactBadge value={project.complexidade_tecnica} />
  </div>
)}

// Mover para Cockpit (FASE 5)
```

#### Reorganizar ordem de campos (Hierarquia)

**Ordem ideal**:
1. Título + Código
2. Alertas (Especial, Atrasado, Prazo)
3. Responsável + Área
4. **Prazo Final** (aumentar destaque visual)
5. Fase Atual + Próximo Prazo
6. Status (footer)

---

## 5. CRITÉRIOS DE ACEITE

- ✅ Nenhum `line-clamp` além de 2 linhas para título
- ✅ Responsável visível sem truncamento (até 35 chars, tooltip se > 35)
- ✅ Área visível sem truncamento
- ✅ Prazo final destacado em tamanho maior
- ✅ Sem scroll horizontal no card
- ✅ Card lido em < 5 segundos (macro view)
- ✅ Responsividade OK em tablets
- ✅ `npm run lint` passa
- ✅ `npm run typecheck` passa
- ✅ `npm run build` passa
- ✅ Sem breaking changes em dados

---

## 6. PLANO DE VALIDAÇÃO

### UX
- [ ] Abrir Kanban com 10+ projetos
- [ ] Verificar que nenhum card trunca informações
- [ ] Confirmar que títulos de 2 linhas são legíveis
- [ ] Validar que responsável/área completos

### A11y
- [ ] Tooltips ainda funcionam em nomes > 35 chars
- [ ] Tab navigation OK
- [ ] Contraste de cores mantido (WCAG AA)

### Performance
- [ ] Scroll do kanban suave
- [ ] Sem layout thrashing (medições com DevTools)
- [ ] Cards renderizam em < 50ms

---

## 7. ENTREGÁVEIS FASE 4

- ✅ Arquivo modificado: `ProjectKanbanCard.tsx`
- ✅ Documento: Esta especificação + resultado
- ✅ Testes: Validação visual com 10+ projetos
- ✅ Testes técnicos: lint, typecheck, build passando
- ✅ Evidência: Screenshot antes/depois

---

## 8. PRÓXIMO PASSO

**Fase 5**: Cockpit + Lista Tática
- Reorganizar SplitView para blocos de decisão
- Adicionar campos removidos da FASE 4 (Complexidade, Objetivo, etc.)
- Criar modo lista para visualização tabular

---
