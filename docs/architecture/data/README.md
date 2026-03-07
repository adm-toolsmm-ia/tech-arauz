# Dados e schema — Tech Arauz

Pasta canônica para documentação de **arquitetura de dados** e artefatos consumidos por engenharia de AI (AIOX, agentes, LLMs).

## Conteúdo

- **`schema.prisma`** — Export do schema do banco Supabase/PostgreSQL em formato Prisma.
  - Extraído via MCP Supabase (`list_tables`).
  - O projeto usa Supabase em runtime (não Prisma); o arquivo serve como referência de modelo de dados para documentação, relatórios e contexto de agentes/LLMs.

## Uso

- **Arquitetura / AIOX:** Use esta pasta como fonte de verdade para estrutura de dados em docs de arquitetura e em prompts de agentes AIOX.
- **Contexto IA:** Referência de schema para construção de prompts de agentes (@dev, @architect, @analyst) que necessitam contexto de modelo de dados. Veja `frontend-spec.md` e `system-architecture.md` para contexto de engenharia de agentes.

## Atualização

Para reextrair o schema a partir do banco:

1. Usar MCP Supabase: `list_tables` com schema `public`.
2. Regenerar `schema.prisma` a partir do JSON (mapeamento PostgreSQL → Prisma).
3. Atualizar data no cabeçalho de `schema.prisma`.
