# Documentação Brownfield Discovery — Arquivada

**Data do arquivamento:** 2026-02-26

Estes arquivos são saídas de uma execução **anterior** do workflow `brownfield-discovery`. Foram movidos para `_deprecated/` para permitir que o workflow seja executado do zero, como se fosse a primeira vez.

**Regra AIOS:** Agentes e IDEs não devem carregar ou usar arquivos em `_deprecated/` como contexto ou documento a ser analisado.

## Conteúdo arquivado

- `supabase-docs/SCHEMA.md` — Schema de banco (Fase 2)
- `supabase-docs/DB-AUDIT.md` — Auditoria e RLS (Fase 2)

## Como usar

Não use. Para nova descoberta, execute o workflow do início:

```
*workflow brownfield-discovery
```

Os artefatos serão gerados novamente em `docs/` e `supabase/docs/`.
