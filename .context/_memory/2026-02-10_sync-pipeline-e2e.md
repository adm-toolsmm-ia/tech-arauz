# Sync Pipeline E2E — Lições Aprendidas

**Data**: 2026-02-10
**Escopo**: Pipeline de sincronização Espaider end-to-end

## Decisões Tomadas

1. **`skipValidation` no `loadConfig()`**: Quando parâmetros vêm do banco (via `espaider_apis`), a validação de env vars é desnecessária. O param `skipValidation` evita falhas quando env vars não estão configuradas mas os valores vêm do DB.

2. **Fallback `PREENCHER_TOKEN`**: O seed (migration 004) usa placeholder `PREENCHER_TOKEN`. Em vez de atualizar o seed, o `espaider-sync.ts` faz fallback para `process.env.ESPAIDER_TOKEN` quando detecta o placeholder.

3. **UX Collapsible**: URL Base e Token são configuração avançada — a maioria dos usuários não precisa alterar. Escondidos em `<Collapsible>` com valores default do `.env`.

4. **tsconfig exclude docs**: O wildcard `**/*.ts` no include captava scripts de `docs/base-conhecimento/` com dependências extras (`js-yaml`). Adicionado `docs` ao exclude.

## Armadilhas Encontradas

- **Redirect loop**: middleware.ts + `integracoes/page.tsx` ambos faziam redirect para /login, criando loop
- **`badge` property TS error**: `menuConfig` array sem type annotation fazia TS não encontrar `badge` em items sem a propriedade
- **Webpack processando docs/**: Build do Next.js incluía scripts de documentação no bundle

## Padrões a Reutilizar

- Server Component (auth + fetch) → Client Component (UI)
- Fallback de credenciais: DB → env var → erro
- Circuit breaker com auto-reset em 30s
- Token masking com `maskToken()` em todos os logs
- Contract tests com mock data para validar tipos
