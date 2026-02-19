# Memory Log: Integração AIOS Core

**Data**: 2026-02-19
**Tipo**: Integração de Framework
**Impacto**: Alto (governança do projeto)

## Contexto

O projeto Tech Arauz já operava com o sistema Antigravity Kit (`.agent/`) com 20 agentes, 36 skills e 11 workflows. O framework Synkra AIOS v4.2.13 foi instalado via `npx aios-core install` para adicionar processo formal (stories, PRD, quality gates).

## Decisões

### Hierarquia dos Sistemas
- **AIOS (.aios-core/)** = Sistema Principal → Processo & Execução (stories, PRD, quality gates, tasks DB/DevOps)
- **Antigravity (.agent/)** = Contexto Técnico → Personas especializadas, skills Espaider/RLS, memória histórica

### Mapeamento de Agentes
| Tarefa | Sistema |
|--------|---------|
| Planejamento (PRD/Stories) | AIOS (`@pm` + `@sm`) |
| Banco de dados | AIOS (`@data-engineer`) |
| Frontend/UI | Antigravity (`frontend-specialist`) |
| Espaider | Antigravity (`backend-specialist`) |
| Security/RLS | Ambos |
| Git/Deploy | AIOS (`@devops`) |
| Debugging | Antigravity (`debugger`) |

### CLAUDE.md Unificado
- O `CLAUDE.md` raiz foi reescrito com AIOS como sistema principal
- O `.claude/CLAUDE.md` (instalado pelo AIOS) permanece como suplemento
- Ambos são carregados pelo Claude Code automaticamente

## Arquivos Criados

### docs/framework/ (AIOS expects)
- `docs/framework/coding-standards.md` — Padrões de código do projeto
- `docs/framework/tech-stack.md` — Stack tecnológica completa
- `docs/framework/source-tree.md` — Mapa de pastas do projeto

### docs/architecture/ (AIOS PT-BR fallback)
- `docs/architecture/pilha-tecnologica.md`
- `docs/architecture/padroes-de-codigo.md`
- `docs/architecture/arvore-de-origem.md`

### .ai/ (Decision Logs)
- `.ai/decision-logs-index.md` — Índice de ADRs
- `.ai/ADR-001-rls-all-tables.md` — RLS em todas as tabelas
- `.ai/ADR-002-token-fallback.md` — Token fallback
- `.ai/ADR-003-upsert-pattern.md` — UPSERT composite UNIQUE
- `.ai/ADR-004-uuid-pk-pattern.md` — UUID PK pattern

### docs/stories/ (Retroativas)
- `docs/stories/STORY-001-dashboard-interativo.md` — 8 KPIs + gráficos (Done)
- `docs/stories/STORY-002-project-cockpit-360.md` — Cockpit 6 tabs (Done)
- `docs/stories/STORY-003-fix-sync-histories-approvers.md` — Migrations 019-020 (Done)
- `docs/stories/STORY-004-notas-projeto.md` — Notes editor (In Progress)

### Modificados
- `CLAUDE.md` — Reescrito com hierarquia AIOS > Antigravity

## Lições Aprendidas

1. **Dois sistemas coexistem bem** quando têm responsabilidades claras (processo vs contexto)
2. **AIOS exige `docs/framework/`** com 3 arquivos específicos para funcionar plenamente
3. **AIOS + Antigravity são complementares**: AIOS não conhece Espaider/RLS; Antigravity não tem stories formais
4. **ADRs retroativos** são valiosos para documentar decisões já tomadas no formato que AIOS espera
5. **Stories retroativas** dão rastreabilidade ao trabalho passado para o `@sm` gerenciar backlog

## Deploy

**Commit**: c7c9f74
**Mensagem**: feat: integrar AIOS Core com Antigravity Kit [STORY-AIOS-INTEGRATION]
**Pushed**: 2026-02-19 (GitHub main branch)
**URL**: https://github.com/adm-toolsmm-ia/tech-arauz/commit/c7c9f74

**1174 arquivos criados/alterados**, incluindo:
- Estrutura completa AIOS (docs/framework, docs/architecture, .ai/, docs/stories/, docs/prd/)
- Framework AIOS completo (.aios-core/, .claude/commands/, .claude/rules/)
- Agentes integrados e configurações de IDE (.cursor/, .codex/, .gemini/)
- Memory logs de implementações anteriores
