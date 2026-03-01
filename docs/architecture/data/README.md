# Dados e schema — Tech Arauz

Pasta canônica para documentação de **arquitetura de dados** e artefatos consumidos por engenharia de AI (AIOS, agentes, LLMs).

## Conteúdo

- **`schema.prisma`** — Export do schema do banco Supabase/PostgreSQL em formato Prisma.
  - Extraído via MCP Supabase (`list_tables`).
  - O projeto usa Supabase em runtime (não Prisma); o arquivo serve como referência de modelo de dados para documentação, relatórios e contexto de agentes/LLMs.

## Uso

- **Arquitetura / AIOS:** Use esta pasta como fonte de verdade para estrutura de dados em docs de arquitetura e em prompts de agentes.
- **Relatório de contexto IA (construção de agentes no front):** `docs/reports/portal-tech-ai-agents-context.md` — consolida schema, configurações, rotinas de agentes e uso de IA no portal; use como contexto para prompts e engenharia de agentes.

## Atualização

Para reextrair o schema a partir do banco:

1. Usar MCP Supabase: `list_tables` com schema `public`.
2. Regenerar `schema.prisma` a partir do JSON (mapeamento PostgreSQL → Prisma).
3. Atualizar data no cabeçalho de `schema.prisma`.
