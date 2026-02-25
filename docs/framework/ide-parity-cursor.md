# IDE Parity — Claude ↔ Cursor

> Cursor é 100% derivado (sincronizado) da AIOS. Fonte de verdade: `.aios-core/`.

## Mapeamento de Regras

| Claude (`.claude/rules/`) | Cursor (`.cursor/rules/`) |
|---------------------------|---------------------------|
| agent-authority.md | agent-authority.mdc |
| devops-execution-safety.md | devops-execution-safety.mdc |
| workflow-execution.md | workflow-execution.mdc |
| story-lifecycle.md | story-lifecycle.mdc |
| mcp-usage.md | mcp-usage.mdc |
| — | project.mdc (Tech Arauz + AIOS core) |
| — | supabase.mdc (Supabase-specific) |

## Gerado vs Manual

### Gerado (`npm run sync:ide`)

- `.cursor/rules/agents/*.md` — agentes AIOS
- Fonte: `.aios-core/development/agents/`
- **Não editar manualmente**. Alterar em `.aios-core/` e rodar `npm run sync:ide`.

### Manual

- `project.mdc` — regras globais Tech Arauz
- `agent-authority.mdc`, `workflow-execution.mdc`, `story-lifecycle.mdc`, `mcp-usage.mdc` — governança AIOS
- `supabase.mdc` — regras Supabase
- `rules.md` — regras gerais AIOS (raiz `.cursor/`)

## Comandos de Sync e Validação

| Comando | O que faz |
|---------|-----------|
| `npm run sync:ide` | Sincroniza agentes de `.aios-core/development/agents/` para todas as IDEs (Cursor, Claude Code, Codex, etc.) |
| `npm run sync:ide:check` | Valida drift (falha em CI se houver divergência) |

## Quando Atualizar

1. Ao modificar agentes em `.aios-core/development/agents/` → rodar `npm run sync:ide`
2. Ao adicionar regras de governança no Claude → portar para Cursor (criar/atualizar `.mdc`)
3. Antes de PR → rodar `npm run sync:ide:check`
