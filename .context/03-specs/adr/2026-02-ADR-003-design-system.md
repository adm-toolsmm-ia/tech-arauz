# ADR-003: Design System e Padrões UX/UI

> **Status**: Accepted
> **Data**: 2026-02-08
> **Decisores**: Gabriel Cristofolini (CTO)
> **Categoria**: Frontend / UX/UI

---

## Contexto

O Tech Arauz precisa de uma interface moderna, consistente e profissional. Durante a fase inicial de desenvolvimento, foi criada uma UI funcional mas básica.

Existe um **protótipo de referência** (`docs/prototipo-referencia/`) desenvolvido no Lovable para um CRM médico que apresenta excelentes padrões de UX/UI que podem ser adaptados para o Tech Arauz.

### Requisitos Identificados

1. **Consistência Visual** - Design system unificado
2. **Produtividade** - Componentes reutilizáveis
3. **Experiência do Usuário** - Padrões modernos (Kanban, Visão 360°, Dark Mode)
4. **Responsividade** - Mobile-first
5. **Acessibilidade** - WCAG 2.1 Level AA

---

## Decisão

**Adotar os padrões de UX/UI do protótipo de referência**, adaptando a identidade visual para o Tech Arauz.

### Componentes Selecionados do Protótipo

| Componente | Propósito | Arquivo de Referência |
|------------|-----------|----------------------|
| AppSidebar | Navegação lateral colapsável | `docs/prototipo-referencia/src/components/AppSidebar.tsx` |
| DashboardHeader | Header com título, subtítulo e dark mode | `docs/prototipo-referencia/src/components/DashboardHeader.tsx` |
| KPICard | Card de métricas com ícone e trend | `docs/prototipo-referencia/src/components/KPICard.tsx` |
| SplitView | Painel lateral deslizante (Visão 360°) | `docs/prototipo-referencia/src/components/SplitView.tsx` |
| KanbanBoard | Board drag-and-drop | `docs/prototipo-referencia/src/components/KanbanBoard.tsx` |
| ViewToggle | Alternância Kanban/Lista | `docs/prototipo-referencia/src/components/ViewToggle.tsx` |
| QuickActions | FAB de ações rápidas | `docs/prototipo-referencia/src/components/QuickActions.tsx` |
| Charts | BarChart, PieChart, LineChart | `docs/prototipo-referencia/src/components/charts/` |

### Paleta de Cores Tech Arauz

Adaptação da paleta Turquoise do protótipo para identidade Azul Corporativa:

```css
/* Tech Arauz - Design Tokens */
:root {
  /* Primary: Blue Arauz */
  --primary: 221 83% 53%;
  --primary-foreground: 210 40% 98%;

  /* Accent: Light Blue */
  --accent: 217 91% 60%;
  --accent-foreground: 222 47% 11%;

  /* Sidebar: Dark Blue */
  --sidebar-background: 222 47% 11%;
  --sidebar-foreground: 210 40% 98%;

  /* Status Colors (mantidas do protótipo) */
  --success: 142 71% 45%;
  --warning: 38 92% 50%;
  --destructive: 0 84% 60%;
}
```

### Padrões de UX Adotados

1. **Layout Master-Detail**
   - Sidebar colapsável à esquerda
   - Header sticky com contexto da página
   - Área de conteúdo flexível

2. **Visão 360°**
   - Painel deslizante da direita (SplitView)
   - Tabs para diferentes aspectos da entidade
   - Ações contextuais na aba dedicada

3. **Dual View Pattern**
   - Toggle entre visualização Kanban e Lista
   - Estado persistido na sessão

4. **Feedback Visual**
   - Toasts via Sonner (bottom-right)
   - Badges semânticos com cores de status
   - Empty states ilustrados
   - Loading states com skeletons

5. **Dark Mode**
   - Variáveis CSS com suporte completo
   - Toggle no header
   - Preferência salva no localStorage

---

## Consequências

### Positivas

- **Consistência**: Design system documentado e padronizado
- **Velocidade**: Componentes prontos para reutilização
- **Qualidade**: Padrões de UX já validados no protótipo
- **Manutenibilidade**: Código organizado por componentes

### Negativas

- **Curva de Aprendizado**: Time precisa conhecer os novos padrões
- **Dependências Adicionais**: dnd-kit, recharts, sonner

### Riscos

- **Divergência**: Manter sincronismo entre protótipo e implementação
- **Mitigation**: Documentar padrões em `component-patterns.md`

---

## Alternativas Consideradas

### 1. Manter UI Atual
- **Prós**: Menos trabalho imediato
- **Contras**: UX básica, inconsistente
- **Veredicto**: Rejeitada - não atende expectativas de qualidade

### 2. Criar Design System do Zero
- **Prós**: 100% customizado
- **Contras**: Alto custo de desenvolvimento
- **Veredicto**: Rejeitada - protótipo já oferece base sólida

### 3. Usar Template Comercial
- **Prós**: Completo e pronto
- **Contras**: Custo de licença, customização limitada
- **Veredicto**: Rejeitada - protótipo próprio é mais flexível

---

## Implementação

### Fase 1: Design System Foundation
- Variáveis CSS (globals.css)
- Tailwind config (cores, shadows, tipografia)
- Fontes (Inter + DM Sans)

### Fase 2: Componentes de Layout
- AppSidebar
- DashboardHeader
- MainLayout

### Fase 3: Componentes de Dashboard

- **KPICard** - Cards de métricas
- **FilterBar** - Barra de filtros unificada (controlled component)
  - **Arquitetura**: Componente presentation que delegahooks hooks de estado ao módulo parent
  - **Quick Filters**: Popover com aplicação direta (Opção A - implementada em 1.2)
  - **Advanced Filters**: Sheet lateral com formulário completo
  - **View Mode**: Toggle entre Kanban/Lista
  - **Search**: Barra de busca integrada
  - **Persistência**: Via `useFilterState` com localStorage (chave: `filters-{moduleId}`)
  - **URL Sync**: Via `useFilterUrlSync` para compartilhamento (futuro)
  - **Design**: shadcn/ui (Select, Popover, Sheet, Input, Badge, Switch)
- **QuickActions** - FAB de ações rápidas

### Fase 4: Componentes de Visualização
- SplitView
- KanbanBoard
- ViewToggle

### Fase 5: Página de Projetos
- Integração de todos os componentes
- Visão 360° de projetos

---

## Estratégia de Persistência de Filtros (v1.0)

### localStorage vs URL Query Parameters

#### localStorage (Padrão em v1.0)
- **Uso**: Persistência de preferências do usuário por sessão
- **Chave**: `filters-{moduleId}` (ex: `filters-projetos`)
- **Escopo**: Por módulo e por navegador
- **Vida útil**: Session atual + próximas sessões
- **Vantagem**: Sem poluição de URL, estado implícito
- **Limitação**: Não compartilhável entre abas/usuários

**Implementação**:
```typescript
persistence: { 
  enabled: true, 
  storageKey: 'filters-projetos' 
}
```

#### URL Query Parameters (v1.1+)
- **Uso**: Sincronização entre abas, compartilhamento de filtros
- **Exemplo**: `?status=active&priority=high&view=kanban`
- **Hook**: `useFilterUrlSync` (em desenvolvimento)
- **Vantagem**: Compartilhável, bookmark-able, histórico
- **Limitação**: URL fica poluída com muitos filtros

**Implementação Futura**:
```typescript
// Quando URL Sync for implementada
const { filters } = useFilterUrlSync({
  definitions,
  debounceMs: 500,
});
```

---

## Referências

- Protótipo de referência: `docs/prototipo-referencia/`
- shadcn/ui: https://ui.shadcn.com/
- Radix UI: https://www.radix-ui.com/
- dnd-kit: https://dndkit.com/
- Recharts: https://recharts.org/

---

## Rastreabilidade

| Requisito | Status |
|-----------|--------|
| RF-004: Visualização de Projetos | Suporta Kanban + Lista |
| RF-005: Detalhes de Projeto | Suporta via SplitView 360° |
| RF-009: Dashboards com KPIs | Suporta via KPICard + Charts |
| RF-012: Kanban de Projetos | Suporta via KanbanBoard |
