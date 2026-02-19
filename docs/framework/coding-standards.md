# Coding Standards — Tech Arauz

> Padrões de código do projeto Portal Tech Arauz.

## TypeScript

- **Strict mode**: OFF (exceção documentada — migração incremental planejada)
- **Target**: ES2017+
- **Module resolution**: Bundler (Next.js)

## Imports

- SEMPRE usar imports absolutos com alias `@/`
- NUNCA usar paths relativos (`../../../`)
- Exceção: imports dentro do mesmo módulo/feature

```typescript
// Correto
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'

// Incorreto
import { Button } from '../../../components/ui/button'
```

## Componentes React

- **UI primitivos**: Shadcn/ui (Radix + Tailwind)
- **Padrão de exportação**: Named exports (não default)
- **Estilização**: Tailwind CSS utility-first + `cn()` helper
- **Estado global**: Zustand (stores em `src/hooks/`)
- **Fetching**: TanStack Query para server state
- **Server Actions**: `src/app/actions/` para mutations

## Supabase / RLS

- SEMPRE definir RLS policies ao criar tabelas
- SEMPRE incluir `USING (true) WITH CHECK (true)` em policies `FOR ALL`
- Usar `get_user_tenant_id()` e `get_user_role()` nas policies
- Migrations em `supabase/migrations/` com numeração sequencial (001, 002, ...)

## Convenções de Commits

```
feat: implementar nova feature [Story X.Y]
fix: corrigir bug específico [Story X.Y]
docs: atualizar documentação
chore: manutenção, dependências
refactor: refatoração sem mudança de comportamento
```

## Validação de Dados

- SEMPRE validar dados externos (API Espaider) para null/undefined
- Usar Zod para validação de schemas em boundaries
- Logs de integração em tabela `integration_log_entries`

## Naming Conventions

- **Arquivos**: kebab-case (`project-cockpit.tsx`)
- **Componentes**: PascalCase (`ProjectCockpit`)
- **Funções**: camelCase (`syncProjectsFromEspaider`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Tabelas DB**: snake_case (`integration_log_entries`)
