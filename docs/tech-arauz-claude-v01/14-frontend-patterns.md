---
doc-id: CLAUDE-V01-14
title: Padrões de Frontend
scope: Estrutura de features, hooks, componentes reutilizáveis, state management
version: 0.1.0
status: draft
last-updated: 2026-02-05
confidence: Alta
depends-on: [03-architecture, 06-feature-map]
---

# Padrões de Frontend

> Fontes: `[ref: src/]`, `[ref: src/shared/]`, `[ref: src/app/]`

Relacionado: [[03-architecture]] (stack técnico), [[06-feature-map]] (módulos e rotas)

---

## Estrutura Feature-Based

```
src/
├── app/                    # Configuração da aplicação
│   ├── App.tsx            # Componente raiz (QueryClientProvider + Router)
│   ├── main.tsx           # Entry point (ReactDOM.createRoot)
│   ├── providers.tsx      # Providers wrapper
│   └── routes.tsx         # Definição de rotas
│
├── contexts/              # Contextos globais
│   └── AuthContext.tsx    # Autenticação (ver [[12-security-rbac]])
│
├── features/              # Módulos de domínio
│   └── {module}/
│       ├── components/    # Componentes específicos do módulo
│       ├── hooks/         # Custom hooks (queries, mutations)
│       ├── pages/         # Componentes de página (lazy-loaded)
│       ├── schemas/       # Zod schemas de validação
│       └── types/         # TypeScript types/interfaces
│
├── shared/                # Código compartilhado
│   ├── components/
│   │   ├── layout/        # Header, Sidebar, MainLayout
│   │   └── ui/            # Shadcn/ui (40+ componentes Radix)
│   ├── hooks/             # Hooks globais
│   └── lib/               # Utilitários (logger, metrics, utils)
│
└── integrations/
    └── supabase/
        ├── client.ts      # Instância do Supabase client
        └── types.ts       # Types gerados (ver [[04-database-schema]])
```

**Regra**: Cada feature é autocontida. Componentes de uma feature não importam de outra. Código compartilhado vai em `shared/`.

---

## Padrão de Query Keys (TanStack Query)

Cada módulo define uma factory de query keys para consistência e invalidação:

```typescript
// Exemplo: projetos
export const projetosKeys = {
  all: ['projetos'] as const,
  list: () => [...projetosKeys.all, 'list'] as const,
  detail: (id: string) => [...projetosKeys.all, 'detail', id] as const,
  status: () => [...projetosKeys.all, 'status'] as const,
  etapas: () => [...projetosKeys.all, 'etapas'] as const,
};

// Dashboard
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: (period?: string) => [...dashboardKeys.all, 'stats', period] as const,
  charts: (period?: string) => [...dashboardKeys.all, 'charts', period] as const,
};
```

**Invalidação em cascata**: `invalidateQueries(['projetos'])` invalida list, details, status e etapas.

[ref: src/features/projetos/hooks/useProjetos.ts]
[ref: src/features/dashboard/hooks/useDashboardStats.ts:4-8]

---

## Padrão de Hooks (Query + Mutation)

### Query Hook
```typescript
export function useProjetos() {
  return useQuery({
    queryKey: projetosKeys.list(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projetos')
        .select(`*, projetos_status(*), projetos_etapas_kanban(*)`)
        .order('data_movimentacao', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 2, // 2 min
  });
}
```

### Mutation Hook
```typescript
export function useUpdateProjetoEtapa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, etapa_kanban_id }) => {
      const { error } = await supabase
        .from('projetos').update({ etapa_kanban_id }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projetosKeys.all });
    },
  });
}
```

**Padrão**: Mutations sempre invalidam queries relacionadas via `invalidateQueries`.

---

## Componentes Reutilizáveis (`shared/components/`)

| Componente | Propósito | Uso |
|---|---|---|
| **DataTable** | Tabela genérica com ordenação, busca, paginação | Solicitações lista, Logs |
| **FormDialog** | Dialog modal com formulário (React Hook Form + Zod) | CRUD de APIs, Tabelas aux. |
| **ConfirmDialog** | Dialog de confirmação (excluir, ação destrutiva) | Delete API, etc. |
| **StatusBadge** | Badge colorido para status/prioridade | Kanban cards, detalhes |
| **EmptyState** | Estado vazio com ícone e mensagem | Listas sem dados |
| **ErrorState** | Estado de erro com retry | Falha de fetch |
| **LoadingState** | Spinner de carregamento | Lazy loading |

[ref: src/shared/components/]

---

## Shadcn/ui Components (`shared/components/ui/`)

40+ componentes Radix primitives via Shadcn/ui. Instalados e configurados com:
- **Estilo**: Default theme
- **CSS**: Tailwind CSS com variáveis HSL customizadas
- **Dark mode**: class-based via `next-themes`

Componentes-chave usados:
- `Sheet` (detalhes laterais), `Tabs` (abas), `Card` (cards), `Badge` (status)
- `Dialog` (modais), `Form` (formulários), `Input`, `Select`, `Button`
- `Table` (tabelas), `DropdownMenu`, `Tooltip`, `Toast` (Sonner)

[ref: src/shared/components/ui/]

---

## Padrão de Layout

```
MainLayout
├── Header (logo, navegação, theme toggle, user menu)
├── Sidebar (navegação por módulo, collapsible)
└── Outlet (conteúdo da rota via React Router)
```

- **Responsividade**: Mobile-first. Sidebar colapsa em mobile.
- **Theme**: Light/Dark via `next-themes` (class-based)

[ref: src/shared/components/layout/]

---

## Lazy Loading de Páginas

Todas as páginas são carregadas via `React.lazy()` com `Suspense`:

```typescript
const Dashboard = lazy(() => import("@/features/dashboard/pages/Dashboard"));
// ...
<Suspense fallback={<PageLoader />}>
  <Routes>...</Routes>
</Suspense>
```

O `PageLoader` exibe um spinner centralizado durante o carregamento.

[ref: src/app/routes.tsx:12-34]

---

## Padrão de Formulários

```
React Hook Form + Zod Schema → FormDialog
```

1. Define Zod schema com validações
2. Usa `useForm` com `zodResolver`
3. Renderiza campos via componentes `Form` do Shadcn
4. Submit chama mutation hook
5. Feedback via toast (Sonner)

[ref: src/features/solicitacoes/schemas/]

---

## Toast Notifications (Sonner)

- **Sucesso**: Toast verde para operações concluídas
- **Erro**: Toast vermelho com mensagem de erro
- **Info**: Toast neutro para informações
- **Localização**: Posição padrão do Sonner (bottom-right)

---

## Cores e Status

### Status de Projetos
| Status | Cor Tailwind |
|---|---|
| Projeto futuro | blue |
| Em aprovação | amber |
| Em desenvolvimento | purple |
| Em homologação | cyan |
| Concluído | green |
| Cancelado | red |
| Suspenso | gray |

### Prioridades
| Prioridade | Cor |
|---|---|
| Urgente | red |
| Alta | orange |
| Normal | blue |
| Baixa | gray |

[ref: src/features/projetos/components/ProjetoDetailSheet.tsx]

---

## Padrão de Supabase Client

```typescript
import { supabase } from '@/integrations/supabase/client';

// Queries usam .from().select().filter()
// Mutations usam .from().insert/update/delete()
// Edge functions usam supabase.functions.invoke('function-name', { body })
```

[ref: src/integrations/supabase/client.ts]

---

## Testes

- **Framework**: Vitest 3.2.4
- **Localização**: Arquivos `.test.ts/tsx` ao lado do código
- **Setup**: `src/test/setup.ts`
- **Helpers**: `src/test/utils.tsx`
- **Cobertura**: Mínima (TODO — ver [[16-risks-gaps]] Q-008)

---

## Decisões Pendentes

> [!question] Q-FE-001: State management global
> Atualmente não há state manager global (Redux, Zustand). O TanStack Query cobre server state e o React Context cobre auth. Suficiente para o MVP? Se features offline ou state complexo forem necessários, avaliar Zustand.

> [!question] Q-FE-002: Internacionalização
> O sistema está todo em PT-BR. Se futuramente precisar de i18n, a arquitetura suporta? Strings estão hardcoded nos componentes.
