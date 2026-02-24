# System Architecture - Tech Arauz

## Stack Tecnológico

| Dependência | Versão | Propósito |
|-------------|--------|----------|
| **Next.js** | ^14.2.0 | Framework React com App Router |
| **React** | ^18.3.0 | UI Library |
| **TypeScript** | ^5.5.0 | Type safety |
| **Supabase** | ^2.45.0 | Database + Auth |
| **TanStack Query** | ^5.50.0 | Data fetching |
| **Tailwind CSS** | ^3.4.0 | Utility-first CSS |
| **Shadcn/ui** | Latest | Component library |
| **Recharts** | ^2.12.0 | Charts |
| **DnD Kit** | ^6.3.1 | Drag-and-drop |
| **Tiptap** | ^3.19.0 | Rich text editor |

## Estrutura

```
src/
├── app/              # 15+ páginas
├── components/       # 80+ componentes
├── hooks/           # 12+ custom hooks
├── lib/             # Utilities
└── integrations/    # Espaider API
```

## Padrões

- ✅ Absolute imports (@/)
- ✅ Named exports
- ✅ TypeScript strict (parcial)
- ✅ Tailwind + cn()
- ✅ RLS policies

## Débitos Críticos

1. TypeScript strict mode desabilitado
2. Cobertura testes ~5%
3. Sem E2E tests

## Recomendações Prioritárias

1. Aumentar cobertura testes (5% → 60%+)
2. Implementar E2E pipeline
3. Criar Storybook
4. Setup Sentry
5. Refatorar filters
