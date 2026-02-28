# Tech Arauz — Design System

Data: 2026-02-27
Versao: 1.0
Base: Auditoria de `tailwind.config.ts` (158 linhas) + `globals.css` (421 linhas)

---

## 1. Cores

### 1.1 Paleta Base (CSS Variables)

Todas as cores usam formato HSL sem `hsl()` wrapper, aplicadas via `hsl(var(--token))`.

| Token | Light HSL | Dark HSL | Uso |
|-------|-----------|----------|-----|
| `--background` | `0 0% 98%` | `220 13% 10%` | Fundo principal |
| `--foreground` | `220 13% 18%` | `0 0% 95%` | Texto principal |
| `--card` | `0 0% 100%` | `220 13% 12%` | Fundo de cards |
| `--card-foreground` | `220 13% 18%` | `0 0% 95%` | Texto em cards |
| `--popover` | `0 0% 100%` | `220 13% 12%` | Fundo de popovers |
| `--popover-foreground` | `220 13% 18%` | `0 0% 95%` | Texto em popovers |
| `--primary` | `167 69% 18%` | `167 55% 25%` | Cor principal (verde petroleo Arauz) |
| `--primary-foreground` | `0 0% 100%` | `0 0% 100%` | Texto sobre primary |
| `--secondary` | `220 13% 95%` | `220 13% 18%` | Fundo secundario |
| `--secondary-foreground` | `220 13% 18%` | `0 0% 95%` | Texto sobre secondary |
| `--muted` | `220 13% 95%` | `220 13% 18%` | Fundo muted/desabilitado |
| `--muted-foreground` | `220 9% 46%` | `220 9% 60%` | Texto muted |
| `--accent` | `14 100% 60%` | `14 100% 60%` | Cor de destaque (laranja Arauz) |
| `--accent-foreground` | `0 0% 100%` | `0 0% 100%` | Texto sobre accent |
| `--border` | `220 13% 90%` | `220 13% 20%` | Bordas |
| `--input` | `220 13% 90%` | `220 13% 20%` | Bordas de inputs |
| `--ring` | `167 69% 18%` | `167 69% 18%` | Ring de focus |
| `--radius` | `0.75rem` | `0.75rem` | Border radius base |

### 1.2 Cores Funcionais (Semanticas)

| Token | Light HSL | Dark HSL | Uso |
|-------|-----------|----------|-----|
| `--destructive` | `0 84% 60%` | `0 63% 45%` | Erro, delete, perigo |
| `--success` | `142 71% 45%` | `142 71% 35%` | Sucesso, completo |
| `--warning` | `38 92% 50%` | `38 92% 45%` | Aviso, atencao |
| `--info` | `199 89% 48%` | `199 89% 48%` | Informacao |

### 1.3 Paleta de Status

Usada em badges de status de projetos/tickets.

| Token | HSL | Uso |
|-------|-----|-----|
| `--status-novo` | `220 9% 46%` | Registro novo/pendente |
| `--status-em-atendimento` | `38 92% 50%` | Em progresso |
| `--status-aguardando` | `25 95% 53%` | Aguardando resposta |
| `--status-resolvido` | `142 71% 45%` | Concluido |
| `--status-cancelado` | `220 9% 50%` | Cancelado |

**Uso em Tailwind:** `bg-status-novo`, `text-status-resolvido`, etc.

### 1.4 Paleta de Prioridade

| Token | HSL | Uso |
|-------|-----|-----|
| `--priority-alta` | `0 84% 60%` | Prioridade alta (vermelho) |
| `--priority-normal` | `38 92% 50%` | Prioridade normal (amarelo) |
| `--priority-baixa` | `142 71% 45%` | Prioridade baixa (verde) |

**Uso em Tailwind:** `bg-priority-alta`, `text-priority-normal`, etc.

### 1.5 Paleta de Tipo

| Token | HSL | Uso |
|-------|-----|-----|
| `--type-erro` | `0 84% 60%` | Tipo erro |
| `--type-duvida` | `220 9% 46%` | Tipo duvida |
| `--type-suporte` | `167 69% 18%` | Tipo suporte |
| `--type-ajuste` | `220 9% 46%` | Tipo ajuste |
| `--type-melhoria` | `167 55% 25%` | Tipo melhoria |

### 1.6 Paleta de Charts

| Token | Light HSL | Dark HSL | Referencia |
|-------|-----------|----------|------------|
| `--chart-1` | `167 69% 18%` | `167 55% 25%` | Primary |
| `--chart-2` | `14 100% 60%` | `14 100% 60%` | Accent |
| `--chart-3` | `142 71% 45%` | `142 71% 35%` | Success |
| `--chart-4` | `38 92% 50%` | `38 92% 45%` | Warning |
| `--chart-5` | `199 89% 48%` | `199 89% 48%` | Info |

**Uso em Recharts:** `fill="hsl(var(--chart-1))"` ou via Tailwind `fill-chart-1`.

### 1.7 Paleta de Sidebar

| Token | Light HSL | Dark HSL |
|-------|-----------|----------|
| `--sidebar-background` | `167 69% 15%` | `167 69% 8%` |
| `--sidebar-foreground` | `0 0% 95%` | `0 0% 95%` |
| `--sidebar-primary` | `14 100% 60%` | `14 100% 60%` |
| `--sidebar-accent` | `167 55% 20%` | `167 55% 15%` |
| `--sidebar-border` | `167 50% 20%` | `167 50% 15%` |
| `--sidebar-ring` | `14 100% 60%` | `14 100% 60%` |
| `--sidebar-muted` | `167 30% 60%` | `167 30% 50%` |

---

## 2. Tipografia

### 2.1 Font Families

| Token | Fonts | Uso |
|-------|-------|-----|
| `font-sans` | Inter, system-ui, sans-serif | Texto body, UI geral |
| `font-display` | DM Sans, Inter, system-ui | Titulos, headings, destaques |

**Configuracao:** Ambas carregadas no `layout.tsx` via `next/font/google`.

### 2.2 Font Features

```css
font-feature-settings: 'rlig' 1, 'calt' 1;
```

Habilita ligaduras e alternativas contextuais para melhor legibilidade.

### 2.3 Convencoes de Uso

| Contexto | Classe Tailwind | Exemplo |
|----------|----------------|---------|
| Body text | `text-sm` ou `text-base` | Paragrafos, labels |
| KPI value | `text-2xl font-bold` | Numeros grandes |
| Card title | `text-lg font-semibold` | Titulos de cards |
| Page heading | `font-display text-2xl font-bold` | Heading de modulo |
| Badge/tag | `text-xs font-medium` | Status badges |
| Muted text | `text-sm text-muted-foreground` | Descricoes, timestamps |

---

## 3. Espacamento

### 3.1 Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `rounded-lg` | `var(--radius)` = `0.75rem` | Cards, dialogs |
| `rounded-md` | `calc(var(--radius) - 2px)` | Buttons, inputs |
| `rounded-sm` | `calc(var(--radius) - 4px)` | Badges, tags |
| `rounded-full` | `9999px` | Avatares, indicadores |
| `rounded-xl` | Tailwind default | KPI cards, paineis |

### 3.2 Padding Padrao por Componente

| Componente | Padding | Referencia |
|-----------|---------|------------|
| KPI Card | `p-6` | `.kpi-card` em globals.css |
| Ticket Card | `p-4` | `.ticket-card` em globals.css |
| Sync Status Card | `p-6` | `.sync-status-card` em globals.css |
| Nav Item | `px-3 py-2.5` | `.sidebar-nav-item` em globals.css |
| Badge | `px-2.5 py-0.5` | `.badge-status` em globals.css |
| Priority Indicator | `px-2 py-0.5` | `.priority-indicator` em globals.css |

---

## 4. Sombras

| Token | Valor | Uso |
|-------|-------|-----|
| `shadow-soft` | `0 2px 8px rgba(0,0,0,0.06)` | Hover sutil |
| `shadow-card` | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)` | Cards em repouso |
| `shadow-card-hover` | `0 8px 30px rgba(0,0,0,0.12)` | Cards em hover |
| `shadow-medium` | `0 4px 16px rgba(0,0,0,0.08)` | Elevacao media |
| `shadow-elevated` | `0 12px 40px rgba(0,0,0,0.12)` | Dialogs, sheets |
| `shadow-inner-glow` | `inset 0 1px 0 rgba(255,255,255,0.1)` | Efeito interno sutil |

**CSS Variables (shadows):**

| Token CSS | Uso |
|-----------|-----|
| `--shadow-soft` | Sombra leve geral |
| `--shadow-medium` | Sombra media |
| `--shadow-strong` | Sombra para elevacao forte |

---

## 5. Animacoes

### 5.1 Tailwind Config Animations

| Nome | Duracao | Easing | Uso |
|------|---------|--------|-----|
| `accordion-down` | 0.2s | ease-out | Abrir accordion/collapsible |
| `accordion-up` | 0.2s | ease-out | Fechar accordion/collapsible |
| `collapsible-down` | 0.2s | ease-out | Sidebar submenus abrir |
| `collapsible-up` | 0.2s | ease-out | Sidebar submenus fechar |
| `scale-in` | 0.2s | ease-out | Entrada com scale |
| `slide-in-left` | 0.2s | ease-out | Entrada da esquerda |

### 5.2 CSS Utility Animations

| Classe | Duracao | Uso |
|--------|---------|-----|
| `.animate-slide-in-right` | 0.3s | Entrada da direita (SplitView) |
| `.animate-slide-out-right` | 0.3s | Saida pela direita |
| `.animate-fade-in` | 0.3s | Fade com translate Y |
| `.animate-scale-in` | 0.2s | Scale + opacity |
| `.animate-slide-in-left` | 0.2s | Entrada da esquerda |
| `.animate-pulse-soft` | 2s infinite | Pulsacao suave (loading) |
| `.animate-shimmer` | 2s infinite | Shimmer skeleton |
| `.animate-spin-slow` | 2s infinite | Spin lento (sync icon) |
| `.animate-collapsible-down` | 0.2s | Collapsible open |
| `.animate-collapsible-up` | 0.2s | Collapsible close |

### 5.3 Transicao Global

```css
html { transition: background-color 0.3s ease, color 0.3s ease; }
```

Garante transicao suave na troca de tema light/dark.

---

## 6. Componentes Base (shadcn/ui)

25 primitivos em `src/components/ui/`:

### 6.1 Quando Usar Cada Componente

| Componente | Quando Usar | Quando NAO Usar |
|-----------|-------------|-----------------|
| **Button** | Acoes primarias/secundarias | Links de navegacao (use `Link`) |
| **Card** | Agrupar conteudo relacionado | Containers de layout (use `div`) |
| **Dialog** | Confirmacoes, formularios modais | Informacao side-by-side (use `Sheet`) |
| **Sheet** | Painel lateral, filtros avancados | Confirmacoes rapidas (use `Dialog`) |
| **Toast** (Sonner) | Feedback global (sucesso, erro) | Validacao de form inline |
| **Badge** | Status, tags, contadores | Botoes clicaveis (use `Button`) |
| **Skeleton** | Loading state de conteudo | Spinners genericos |
| **Tabs** | Multiplas views do mesmo dado | Navegacao principal (use sidebar) |
| **Table** | Dados tabulares com ordenacao | Listas simples (use cards) |
| **Select** | Escolha de opcao unica | Multipla selecao (use checkboxes) |
| **Input** | Entrada de texto simples | Texto longo (use `Textarea`) |
| **Textarea** | Texto multi-linha | Input simples (use `Input`) |
| **Checkbox** | Selecao multipla, toggles | Escolha unica (use `Select` ou `Switch`) |
| **Switch** | Toggle on/off binario | Mais de 2 opcoes |
| **Popover** | Informacao contextual flutuante | Formularios complexos (use `Dialog`) |
| **Tooltip** | Dica rapida em hover | Conteudo interativo |
| **Calendar** | Selecao de data | Selecao de range (combinar com Popover) |
| **Command** | Busca com autocomplete | Input simples de texto |
| **Dropdown Menu** | Menu contextual de acoes | Navegacao principal |
| **Progress** | Barra de progresso | Percentual como texto |
| **Scroll Area** | Container com scroll customizado | Pagina inteira |
| **Separator** | Divisor visual entre secoes | Margem/padding (use classes) |
| **Sidebar** | Navegacao principal do app | Menu contextual (use `Dropdown`) |
| **Label** | Label de input de formulario | Texto descritivo (use `p`) |
| **Collapsible** | Secoes expansiveis | Tabs (use `Tabs`) |

### 6.2 Componentes Custom

| Componente | Path | Uso |
|-----------|------|-----|
| `Skeletons` | `src/components/ui/skeletons.tsx` | KPI skeleton, Kanban card skeleton, Table row skeleton |
| `KPICard` | `src/components/dashboard/KPICard.tsx` | Card de KPI no topo de modulos |
| `FilterBar` | `src/components/filters/FilterBar.tsx` | Barra de filtros padrao |
| `SplitView` | `src/components/views/SplitView.tsx` | Painel lateral de detalhes |
| `KanbanBoard` | `src/components/views/KanbanBoard.tsx` | Board kanban com DnD |
| `ProjectListView` | `src/components/views/ProjectListView.tsx` | Grid de projetos |
| `DashboardHeader` | `src/components/layout/DashboardHeader.tsx` | Header global sticky |
| `ErrorBoundary` | `src/components/error/ErrorBoundary.tsx` | Captura de erros com fallback |
| `ErrorFallback` | `src/components/error/ErrorFallback.tsx` | UI de erro com retry |

---

## 7. Layout Blueprint

Referencia: `docs/architecture/module-standards.md`

### 7.1 Estrutura Padrao de Modulo

```
+-------------------------------------------------------+
| DashboardHeader (sticky top)                          |
|  [Titulo do Modulo]           [Theme] [Notifications] |
+-------------------------------------------------------+
| KPI Bar                                               |
|  [KPI 1] [KPI 2] [KPI 3] [KPI 4]                    |
+-------------------------------------------------------+
| FilterBar                                             |
|  [Search] [Quick Filters] [Advanced] [View Toggle]   |
+-------------------------------------------------------+
|                                                       |
| Main Content Area                                     |
|  +------------------+  +---------------------------+  |
|  | Kanban / Lista   |  | SplitView (detail panel)  |  |
|  | / Grid           |  |                           |  |
|  |                  |  | *Cockpit component        |  |
|  +------------------+  +---------------------------+  |
|                                                       |
+-------------------------------------------------------+
```

### 7.2 Posicionamento de Elementos

| Elemento | Posicao | Notas |
|----------|---------|-------|
| Header | Sticky top | Sempre visivel |
| KPIs | Linha 1 abaixo do header | Grid responsivo 2-4 colunas |
| FilterBar | Linha 2 | Busca + filtros + view toggle |
| CTA primaria | Topo direita da area | "Novo Projeto", "Novo Agente" |
| Conteudo | Area principal | Kanban, Lista ou Grid |
| SplitView | Lateral direita | Abre sobre o conteudo |

---

## 8. Microinteracoes

### 8.1 Loading States

| Contexto | Componente | Duracao |
|----------|-----------|---------|
| Pagina inicial | `Skeleton` (KPI, Table, Kanban) | Ate dados chegarem |
| Sync Espaider | `animate-spin-slow` no icone | Durante sync |
| Operacao async | `animate-pulse-soft` | Ate completar |
| Shimmer | `.animate-shimmer` em skeletons | Ate dados |

### 8.2 Success States

| Contexto | Feedback | Duracao |
|----------|----------|---------|
| CRUD completo | `toast.success("Mensagem")` via Sonner | 4s auto-dismiss |
| Sync concluido | Toast + badge de contagem | 4s |
| Status alterado | Badge atualiza + subtle animation | Imediato |

### 8.3 Error States

| Contexto | Feedback | Acao |
|----------|----------|------|
| Render error | `ErrorBoundary` + `ErrorFallback` | Retry button + home |
| API error | `toast.error("Mensagem")` via Sonner | Auto-dismiss 4s |
| Page error | `src/app/error.tsx` | Reset + home |
| 404 | `src/app/not-found.tsx` | Link para home |
| Form validation | Inline message nos campos | Highlight do campo |

### 8.4 Empty States

| Contexto | Exibicao | Recomendacao |
|----------|---------|-------------|
| Lista sem resultados | Mensagem + icone + CTA | "Nenhum resultado. Ajuste os filtros." |
| Modulo vazio | Ilustracao + CTA primaria | "Crie seu primeiro projeto" |
| Filtro sem match | Mensagem + reset button | "Limpar filtros" |

### 8.5 Hover / Transitions

| Elemento | Efeito | Classe |
|----------|--------|--------|
| Card | `shadow-sm → shadow-md` | `transition-all duration-200 hover:shadow-md` |
| Ticket Card | Border primary glow | `hover:border-primary/30 hover:shadow-md` |
| Nav item | Background accent | `hover:bg-sidebar-accent` |
| Button | Opacity/color shift | Padrao shadcn/ui |

---

## 9. Dark Mode

### 9.1 Estrategia

**Seletor unico:** `.dark` class no `<html>` (via Tailwind `darkMode: ['class']`)

**Mecanismo:** `DarkModeProvider` aplica/remove a classe `.dark` + atributo `data-theme` no `<html>`.

**Transicao:** `background-color 0.3s ease, color 0.3s ease` no `<html>`.

### 9.2 Regras para Novos Tokens

1. Sempre definir variante light em `:root` E variante dark em `.dark`
2. Usar HSL sem wrapper: `--token: H S% L%`
3. Consumir via Tailwind: `bg-[hsl(var(--token))]` ou registrar em `tailwind.config.ts`
4. Testar contraste AA (>= 4.5:1) em ambos os temas

### 9.3 Arquivos Relevantes

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/app/globals.css` | Definicao de todos os tokens (light + dark) |
| `tailwind.config.ts` | Mapeamento de tokens para classes Tailwind |
| `src/components/providers/DarkModeProvider.tsx` | Toggle de tema |
| `src/hooks/useDarkMode.ts` | Hook para acesso ao tema |

---

## 10. Scrollbar

Custom scrollbar para consistencia visual:

```css
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { @apply bg-muted/30; }
::-webkit-scrollbar-thumb { @apply rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/40; }
```

---

## 11. Focus States

```css
:focus-visible {
  @apply outline-none ring-2 ring-ring ring-offset-2 ring-offset-background;
}
```

Ring usa `--ring` (verde petroleo) com offset para visibilidade em ambos os temas.

---

## 12. Component Classes (globals.css)

Classes utilitarias registradas em `@layer components`:

| Classe | Uso | Padding | Extras |
|--------|-----|---------|--------|
| `.kpi-card` | Cards de KPI | `p-6` | `rounded-xl border shadow-sm hover:shadow-md` |
| `.kanban-column` | Colunas kanban | - | `min-h-[500px] rounded-lg bg-muted/30` |
| `.kanban-column-header` | Header de coluna | `px-4 py-3` | `sticky top-0 z-10 bg-muted/50` |
| `.ticket-card` | Cards de item | `p-4` | `cursor-pointer hover:border-primary/30` |
| `.badge-status` | Badge de status | `px-2.5 py-0.5` | `rounded-full text-xs font-medium` |
| `.priority-indicator` | Badge de prioridade | `px-2 py-0.5` | `rounded-full text-xs font-medium gap-1` |
| `.sidebar-nav-item` | Item de navegacao | `px-3 py-2.5` | Hover + active states |
| `.sync-status-card` | Card de sync | `p-6` | `rounded-xl border overflow-hidden` |

---

## 13. Feedback Patterns (Story 2.10)

### 13.1 Regra de Canal

| Tipo de Evento | Canal | Componente/Hook |
|----------------|-------|-----------------|
| Eventos globais (sync completo, save sucesso) | Toast | `useAsyncFeedback({ feedbackMode: 'toast' })` |
| Erros locais (campo, validação, row-level) | Inline | `useAsyncFeedback({ feedbackMode: 'inline' })` |
| Ambos | Toast + Inline | `useAsyncFeedback({ feedbackMode: 'both' })` |

### 13.2 useAsyncFeedback

Hook que estende `useAsyncOperation` com canal de feedback estruturado.

```typescript
// Evento global (padrão): toast
const { execute, isLoading } = useAsyncFeedback({
  feedbackMode: 'toast',
  operationLabel: 'salvar projeto',
  successToast: 'Projeto salvo com sucesso!',
});

// Feedback local: inline message
const { execute, inlineMessage, inlineType, clearInline } = useAsyncFeedback({
  feedbackMode: 'inline',
  operationLabel: 'validar campo',
});
```

**Retorno adicional vs useAsyncOperation:**
- `inlineMessage: string | null` — mensagem de feedback local
- `inlineType: 'error' | 'success' | 'info' | null` — tipo do feedback
- `clearInline()` — limpa a mensagem inline

### 13.3 Loading State Padrão (skeleton → content → toast)

Sequência obrigatória para operações de sync/CRUD:

1. `status === 'loading'` → exibir skeleton (`SkeletonKPI`, `SkeletonTableRow`, etc.)
2. `status === 'success'` → exibir conteúdo + toast de resultado
3. `status === 'error'` → exibir mensagem com contexto: "Erro ao {operationLabel}: {message}"

### 13.4 EmptyState Component

Componente padronizado para estados vazios em todas as telas de listagem.

```tsx
// Sem dados: com CTA
<EmptyState
  title="Nenhum projeto cadastrado"
  description="Crie o primeiro projeto para começar."
  actionLabel="Criar Projeto"
  onAction={() => setIsCreateDialogOpen(true)}
/>

// Filtro sem resultado: sem CTA de criação
<EmptyState
  title="Nenhum resultado encontrado"
  description="Tente ajustar ou limpar os filtros aplicados."
/>
```

**Props disponíveis:** `title`, `description`, `icon` (LucideIcon), `actionLabel`, `onAction`, `secondaryLabel`, `onSecondary`, `className`

### 13.5 Mensagens de Erro com Contexto

Padrão: `"Erro ao {verbo} {substantivo}: {mensagem técnica}"`

```
✅ "Erro ao salvar projeto: Conexão recusada"
❌ "Erro ao salvar"
❌ "Algo deu errado"
```

---

*Documento gerado por Dex (dev) em 2026-02-27*
*Atualizado em 2026-02-28: Seção 13 Feedback Patterns (Story 2.10)*
*Base: tailwind.config.ts + globals.css + module-standards.md*
