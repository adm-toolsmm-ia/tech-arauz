# Catálogo de Padrões de Componentes

> **Camada**: 2 - Especificações  
> **Última atualização**: 2026-02-10  
> **Referência**: ADR-003, `docs/prototipo-referencia/`

---

## Propósito

Este documento cataloga os padrões de componentes adotados para o Tech Arauz, baseados no protótipo de referência. Cada componente inclui:
- Propósito e uso
- Props/Interface
- Exemplo de código
- Arquivo de referência

---

## 1. Componentes de Layout

### 1.1 AppSidebar

**Propósito**: Navegação principal lateral colapsável.

**Características**:
- Grupos de menu organizados por seção
- Ícones do Lucide React
- Estado ativo com destaque visual
- Colapsável em mobile/desktop
- Logo no topo

**Interface**:
```typescript
// Não recebe props - usa contexto interno
// Configuração via menuItems array
const menuItems = [
  {
    group: "Dashboards",
    items: [
      { title: "Projetos", url: "/dashboard", icon: LayoutDashboard },
    ],
  },
  // ...
];
```

**Referência**: `docs/prototipo-referencia/src/components/AppSidebar.tsx`

---

### 1.2 DashboardHeader

**Propósito**: Header de página com título, subtítulo e ações.

**Interface**:
```typescript
interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}
```

**Características**:
- Sticky no topo
- SidebarTrigger para toggle mobile
- Toggle de Dark Mode
- Área para ações futuras (notificações, user menu)

**Referência**: `docs/prototipo-referencia/src/components/DashboardHeader.tsx`

---

### 1.3 MainLayout

**Propósito**: Wrapper de layout com sidebar + header + content.

**Estrutura**:
```
MainLayout
├── SidebarProvider
│   ├── AppSidebar
│   └── Content Area
│       ├── DashboardHeader
│       └── Page Content (children/outlet)
```

---

## 2. Componentes de Dashboard

### 2.1 KPICard

**Propósito**: Card de métrica com destaque visual.

**Interface**:
```typescript
interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  subtitle?: string;
}
```

**Exemplo**:
```tsx
<KPICard
  title="Projetos Ativos"
  value={42}
  icon={FolderOpen}
  trend={{ value: "+12% este mês", positive: true }}
/>
```

**Referência**: `docs/prototipo-referencia/src/components/KPICard.tsx`

---

### 2.2 QuickActions

**Propósito**: FAB (Floating Action Button) para ações rápidas.

**Características**:
- Fixed no canto inferior direito
- DropdownMenu ao clicar
- Ações contextuais por página

**Referência**: `docs/prototipo-referencia/src/components/QuickActions.tsx`

---

## 3. Componentes de Visualização

### 3.1 ViewToggle

**Propósito**: Alternância entre visualização Kanban e Lista.

**Interface**:
```typescript
interface ViewToggleProps {
  view: "kanban" | "list";
  onViewChange: (view: "kanban" | "list") => void;
}
```

**Referência**: `docs/prototipo-referencia/src/components/ViewToggle.tsx`

---

### 3.2 KanbanBoard

**Propósito**: Board drag-and-drop com colunas dinâmicas.

**Interface**:
```typescript
interface KanbanItem {
  id: string | number;
  title: string;
  subtitle?: string;
  value?: string;
  priority?: string;
  status: string;
}

interface Column {
  id: string;
  title: string;
  color: string;
}

interface KanbanBoardProps {
  columns: Column[];
  items: KanbanItem[];
  onItemClick?: (item: KanbanItem) => void;
  onStatusChange?: (itemId: string | number, newStatus: string) => void;
  renderItemContent?: (item: KanbanItem) => React.ReactNode;
}
```

**Dependências**:
- `@dnd-kit/core`
- `@dnd-kit/sortable`

**Referência**: `docs/prototipo-referencia/src/components/KanbanBoard.tsx`

---

### 3.3 SplitView (Visão 360°)

**Propósito**: Painel lateral deslizante para detalhes de entidade.

**Interface**:
```typescript
interface SplitViewProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'wide';
  healthStatus?: 'verde' | 'amarelo' | 'vermelho';
}
```
- `wide`: largura responsiva `min(90vw, 1120px)` para visão 360° com mais espaço.

**Características**:
- Overlay com backdrop blur
- Slide-in animation da direita
- ScrollArea para conteúdo longo
- Botão de fechar no header

**Uso típico**:
```tsx
<SplitView 
  isOpen={!!selectedItem} 
  onClose={() => setSelectedItem(null)} 
  title="Visão 360° - Projeto"
>
  <Tabs defaultValue="resumo">
    <TabsList>
      <TabsTrigger value="resumo">Resumo</TabsTrigger>
      <TabsTrigger value="cronogramas">Cronogramas</TabsTrigger>
      <TabsTrigger value="entregas">Entregas</TabsTrigger>
    </TabsList>
    {/* Tab contents */}
  </Tabs>
</SplitView>
```

**Referência**: `docs/prototipo-referencia/src/components/SplitView.tsx`

---

### 3.4 ProjectNotesEditor (Anotações do Projeto)

**Propósito**: Editor de texto rico para anotações por projeto na Visão 360°, com persistência em `projects.notes_html`.

**Interface**:
```typescript
interface ProjectNotesEditorProps {
  projectId: string;
  initialContent: string | null;
  onSave?: () => void;
}
```

**Características**:
- TipTap (StarterKit + Placeholder + Link); toolbar: negrito, itálico, título, listas, link
- Botão "Salvar anotações" chama Server Action `updateProjectNotesAction`
- Empty state com placeholder e mensagem amigável
- Toast (Sonner) para sucesso/erro

**Uso**: Aba "Anotações" no `ProjectCockpit`; dados via `project.notes_html` e persistência via `src/app/actions/projects.ts` (`updateProjectNotesAction`).

**Referência**: `src/components/project/ProjectNotesEditor.tsx`

---

### 3.5 Cards Padronizados (Auxiliares — Fornecedores, Modelos, Tipos de Agentes, Agentes)

**Propósito**: Componentes de card reutilizáveis com padrão visual consistente (barra lateral colorida, seções, rodapé com badges) para cadastros auxiliares e agentes. Cada card é clicável para abrir SplitView com detalhes 360°.

**Padrão Visual** (baseado em ProjectKanbanCard):
- **Barra lateral colorida** (esquerda, 4px) com cor específica do contexto (fornecedor, modelo, etc.)
- **Seções** hierárquicas:
  - SEÇÃO 1: Header (título/nome + slug/identificador + descrição)
  - SEÇÃO 2: Contexto específico (endpoint, modelo padrão, contexto, etc.)
  - SEÇÃO 3: Informações adicionais (docs, temperatura, etc.)
  - SEÇÃO 4: Rodapé (status badges + ações — editar, deletar, copiar)
- **Separadores**: `border-t border-border/30 pt-1` entre seções
- **Ações**: Botões com `onClick={(e) => { e.stopPropagation(); ... }}` para evitar propag ação do clique ao card clicável

**Componentes Implementados**:

#### ProviderCard (`src/components/lm-providers/ProviderCard.tsx`)
```typescript
interface ProviderCardProps {
  provider: LmProvider;
  isSelected?: boolean;
  onSelect?: (provider: LmProvider) => void;
  onEdit?: (provider: LmProvider) => void;
  onDelete?: (e: React.MouseEvent, provider: LmProvider) => void;
}
```
- Barra lateral: cor `provider.color_hex`
- Seções: Nome/Slug, Endpoint da API, Status + Ações
- Uso: Listagem em `/auxiliares/lm-providers`

#### ModelCard (`src/components/lm-models/ModelCard.tsx`)
```typescript
interface ModelCardProps {
  model: LmModel;
  provider?: LmProvider;
  isSelected?: boolean;
  onSelect?: (model: LmModel) => void;
  onDelete?: (e: React.MouseEvent, model: LmModel) => void;
  onCopy?: (model: LmModel) => void;
}
```
- Barra lateral: cor do `provider.color_hex`
- Seções: Nome/Model ID, Fornecedor + Contexto, Docs, Status + Ações
- Uso: Listagem em `/auxiliares/modelos-ia`

#### AgentTypeCard (`src/components/agent-types/AgentTypeCard.tsx`)
```typescript
interface AgentTypeCardProps {
  agentType: AgentType;
  provider?: LmProvider;
  model?: LmModel;
  isSelected?: boolean;
  onSelect?: (agentType: AgentType) => void;
  onEdit?: (agentType: AgentType) => void;
  onDelete?: (e: React.MouseEvent, agentType: AgentType) => void;
}
```
- Barra lateral: cor `agentType.color_hex`
- Seções: Nome/Slug, Modelo Padrão (com fornecedor), Temperatura, Status + Ações
- Uso: Listagem em `/auxiliares/agent-types`

#### AgentCardStandard (`src/components/agents/AgentCardStandard.tsx`)
```typescript
interface AgentCardProps {
  agent: UIAgent;
  isSelected?: boolean;
  onSelect?: (agent: UIAgent) => void;
  onEdit?: (agent: UIAgent) => void;
  onDelete?: (e: React.MouseEvent, agent: UIAgent) => void;
}
```
- Barra lateral: azul primário (fixo para agentes)
- Seções: Nome/Slug, Tipo + Versão, Modelo + Temperatura, Status + Ações
- Status: Draft (cinza), Published (verde), Deprecated (vermelho)
- Uso: Listagem em `/agentes`

**Integração em Listas**:
```tsx
// Exemplo de uso em listagem
<div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {filteredItems.map((item) => (
    <ItemCard
      key={item.id}
      item={item}
      isSelected={selectedItem?.id === item.id}
      onSelect={setSelectedItem}
      onDelete={(e, item) => {
        e.stopPropagation();
        handleDelete(item);
      }}
    />
  ))}
</div>
```

---

## 4. Padrões de Página

### 4.1 Página de Listagem (Projetos, Clientes, etc.)

**Estrutura**:
```
Page
├── DashboardHeader
├── KPIs Row (4 cards)
├── Filters Bar
│   ├── ViewToggle
│   ├── Search Input
│   ├── Filter Selects
│   └── Action Button (Novo)
├── Content Area
│   ├── Kanban View (quando view === "kanban")
│   └── List View (quando view === "list")
└── SplitView (quando item selecionado)
```

**Estado**:
```typescript
const [view, setView] = useState<"kanban" | "list">("kanban");
const [searchTerm, setSearchTerm] = useState("");
const [statusFilter, setStatusFilter] = useState("all");
const [selectedItem, setSelectedItem] = useState<Item | null>(null);
```

---

### 4.2 Dashboard

**Estrutura**:
```
Dashboard
├── DashboardHeader
├── KPIs Row (4 principais)
├── Alerts Card (opcional)
├── Charts Row
│   ├── Chart 1 (ex: Pipeline Funnel)
│   └── Chart 2 (ex: Por Responsável)
└── Additional Charts/Tables
```

---

## 5. Padrões de Feedback

### 5.1 Toast Notifications

**Biblioteca**: Sonner

**Uso**:
```typescript
import { toast } from "sonner";

// Sucesso
toast.success("Projeto atualizado com sucesso");

// Erro
toast.error("Erro ao sincronizar");

// Info
toast.info("Sincronização em andamento...");
```

---

### 5.2 Empty State

**Estrutura**:
```tsx
<div className="px-6 py-12 text-center">
  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
    <IconComponent className="w-8 h-8 text-gray-400" />
  </div>
  <h3 className="text-lg font-medium text-gray-900 mb-1">
    Nenhum item encontrado
  </h3>
  <p className="text-gray-500">
    Descrição de como resolver ou próximos passos.
  </p>
</div>
```

---

### 5.3 Loading State

**Opções**:
1. Skeleton (para cards/listas)
2. Spinner centralizado (para páginas)
3. Progress bar (para operações longas)

---

## 6. Padrões de Cor por Status

### Status de Projetos

| Status | Classes Tailwind |
|--------|------------------|
| Projeto futuro | `bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300` |
| Em aprovação | `bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300` |
| Em desenvolvimento | `bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300` |
| Em homologação | `bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300` |
| Concluído | `bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300` |
| Cancelado | `bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300` |
| Suspenso | `bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300` |

### Prioridades

| Prioridade | Classes Tailwind |
|------------|------------------|
| Urgente | `bg-destructive text-destructive-foreground` |
| Alta | `bg-warning text-warning-foreground` |
| Normal | `bg-primary text-primary-foreground` |
| Baixa | `bg-muted text-muted-foreground` |

---

## 7. Responsividade

### Breakpoints

| Breakpoint | Largura | Comportamento |
|------------|---------|---------------|
| Mobile | < 768px | Sidebar oculta, layout single-column |
| Tablet | 768px - 1024px | Sidebar colapsada, 2 colunas |
| Desktop | > 1024px | Sidebar expandida, layout completo |

### Kanban Responsivo

- **Mobile**: 1 coluna visível, scroll horizontal
- **Tablet**: 2 colunas
- **Desktop**: 4 colunas

---

## 8. Localização dos Componentes

```
src/
├── components/
│   ├── layout/
│   │   ├── AppSidebar.tsx
│   │   ├── DashboardHeader.tsx
│   │   └── MainLayout.tsx
│   ├── dashboard/
│   │   ├── KPICard.tsx
│   │   └── QuickActions.tsx
│   ├── views/
│   │   ├── SplitView.tsx
│   │   ├── KanbanBoard.tsx
│   │   └── ViewToggle.tsx
│   ├── project/
│   │   ├── ProjectCockpit.tsx        # Visão 360° com abas (Detalhes, Anotações, etc.)
│   │   ├── ProjectNotesEditor.tsx   # Editor TipTap para anotações do projeto
│   │   └── index.ts
│   ├── charts/
│   │   ├── ProjectPipelineChart.tsx   # Barras horizontais - projetos por status
│   │   ├── ProjectTrendChart.tsx      # Linhas - tendência mensal (criados/concluídos)
│   │   ├── StatusDistributionChart.tsx # Donut - distribuição percentual
│   │   └── index.ts
│   ├── agents/
│   │   ├── AgentCard.tsx              # Card com info do agente + métricas
│   │   ├── TraceTimeline.tsx          # Timeline visual dos steps de execução
│   │   ├── TraceList.tsx              # Lista paginada de execuções
│   │   ├── BudgetGauge.tsx            # Indicador de consumo de budget
│   │   ├── AgentKPIs.tsx              # KPIs resumidos de agentes
│   │   └── index.ts
│   └── ui/
│       └── (shadcn components)
```

---

## 9. Componentes de Gráficos (charts/)

### 9.1 ProjectPipelineChart

**Propósito**: Visualizar distribuição de projetos por status em barras horizontais.

**Características**:
- Usa Recharts BarChart (layout vertical)
- Cores seguem `tokens_brand.json` por status
- Tooltip customizado
- Animação de entrada
- Responsivo via ResponsiveContainer
- Helper `buildPipelineData()` transforma dados

### 9.2 ProjectTrendChart

**Propósito**: Visualizar tendência mensal de criação e conclusão de projetos.

**Características**:
- Recharts LineChart com 2 linhas (criados / concluídos)
- Últimos 6 meses
- Helper `buildTrendData()` agrega por mês

### 9.3 StatusDistributionChart

**Propósito**: Visualizar distribuição percentual por status em donut chart.

**Características**:
- Recharts PieChart com `innerRadius` (donut)
- Legenda customizada
- Helper `buildDistributionData()` calcula percentuais

---

## 10. Componentes de Agentes (agents/)

### 10.1 AgentCard

**Propósito**: Card com informações resumidas de um agente AI.

**Características**:
- Ícone, nome, versão, descrição
- Badges de status (ativo/inativo/desenvolvimento) e tipo (automação/análise/etc)
- Grid de métricas: execuções, taxa de sucesso, latência, custo
- Última execução com tempo relativo
- Clicável para navegar ao detalhe

### 10.2 TraceTimeline

**Propósito**: Timeline visual dos steps de uma execução de agente.

**Características**:
- Ícones por status (check/x/skip/clock)
- Conectores entre steps
- Animação stagger (fade-in sequencial)
- Duração de cada step

### 10.3 TraceList

**Propósito**: Lista paginada de execuções/traces.

**Características**:
- Status visual (concluído/falhou/executando)
- Preview de input/output
- Métricas inline (agente, data, duração, tokens, custo)
- Link externo para LangSmith

### 10.4 BudgetGauge

**Propósito**: Indicador visual de consumo de budget de IA.

**Características**:
- Barra de progresso com gradiente semântico (verde → amarelo → vermelho)
- Valor gasto, limite mensal, percentual, restante
- Transição animada da barra

### 10.5 AgentKPIs

**Propósito**: KPIs agregados de todos os agentes.

**Características**:
- Reutiliza `KPICard` do dashboard
- 4 métricas: Total Agentes, Execuções, Taxa de Sucesso, Custo Total

---

## 11. Referências

- **Protótipo completo**: `docs/prototipo-referencia/`
- **ADR Design System**: `.context/03-specs/adr/2026-02-ADR-003-design-system.md`
- **Tokens de Design**: `.context/03-specs/tokens_brand.json`
- **shadcn/ui docs**: https://ui.shadcn.com/
