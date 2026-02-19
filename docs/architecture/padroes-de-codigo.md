# Padrões de Código — Tech Arauz

> Versão PT-BR de `docs/framework/coding-standards.md` (fallback AIOS).
> Para detalhes completos, consulte [coding-standards.md](../framework/coding-standards.md).

## Regras Fundamentais

1. **Imports absolutos** com `@/` (nunca relativos)
2. **RLS obrigatório** em todas as tabelas com `USING (true) WITH CHECK (true)`
3. **Validar dados externos** (Espaider) para null/undefined
4. **Named exports** (não default)
5. **Tailwind utility-first** + `cn()` helper para estilização
6. **Server Actions** para mutations em `src/app/actions/`
7. **Commits convencionais**: `feat:`, `fix:`, `docs:` com referência a Story ID

## Padrões de Banco de Dados

- PK: `id UUID DEFAULT gen_random_uuid()`
- Referência Espaider: `espaider_id INTEGER`
- UPSERT: `UNIQUE(tenant_id, espaider_id)`
- Rastreabilidade: `espaider_raw JSONB`
- Migrations: `supabase/migrations/NNN_descricao.sql`
