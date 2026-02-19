# Source Tree — Tech Arauz

> Mapa da estrutura de pastas do projeto.

```
tech-arauz/
├── .agent/                          # Antigravity Kit (personas & contexto)
│   ├── agents/                      #   20 agentes especializados
│   ├── skills/                      #   36+ skills modulares
│   ├── workflows/                   #   11 workflows (slash commands)
│   ├── memory/                      #   Logs de implementações
│   └── ARCHITECTURE.md              #   Mapa do sistema de agentes
│
├── .aios-core/                      # Synkra AIOS (processo & execução)
│   ├── cli/                         #   CLI toolkit
│   ├── core/                        #   Core algorithms
│   ├── development/                 #   Tasks (198+), templates, workflows
│   ├── manifests/                   #   Registry de agentes/tasks/workers
│   └── constitution.md              #   Governança (6 princípios)
│
├── .ai/                             # Decision logs (ADR format)
├── .context/                        # Regras de negócio e specs
│   ├── 00-MASTER.md                 #   Ponto de entrada
│   ├── 01-foundation/               #   Visão e glossário
│   ├── 02-rules/                    #   Business rules, requirements, routines
│   ├── 03-specs/                    #   ADRs, tokens, component patterns
│   └── IMPLEMENTATIONS.md           #   Changelog de implementações
│
├── docs/                            # Documentação AIOS
│   ├── framework/                   #   Standards, tech-stack, source-tree
│   ├── architecture/                #   Arquitetura (PT-BR fallback)
│   └── stories/                     #   Stories de desenvolvimento
│
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── actions/                 #   Server Actions (mutations)
│   │   ├── api/                     #   Route Handlers (REST)
│   │   │   ├── integracoes/         #     Sync, logs, setup Espaider
│   │   │   └── agents/              #     API de agentes AI
│   │   ├── projetos/                #   Página de projetos (grid + filters)
│   │   ├── cronogramas/             #   Página de cronogramas (calendário)
│   │   ├── dashboard/               #   Dashboard (KPIs + gráficos)
│   │   ├── integracoes/             #   Painel de integrações Espaider
│   │   ├── cadastros/               #   CRUD de usuários
│   │   └── login/                   #   Auth pages
│   │
│   ├── components/
│   │   ├── ui/                      #   Shadcn/ui primitivos
│   │   ├── layout/                  #   Sidebar, header, sidebar-config
│   │   ├── project/                 #   ProjectCockpit (visão 360°)
│   │   ├── charts/                  #   Gráficos (Pipeline, Donut, Trend)
│   │   ├── dashboard/               #   KPI cards
│   │   ├── filters/                 #   ProjectFilters
│   │   ├── views/                   #   SplitView
│   │   ├── integracoes/             #   LogViewer
│   │   └── agents/                  #   Componentes de agentes AI
│   │
│   ├── hooks/                       # Custom hooks + Zustand stores
│   │
│   ├── integrations/
│   │   └── espaider/                # Cliente Espaider
│   │       ├── client.ts            #   exportarDados + buscarFilhos
│   │       ├── types.ts             #   URLFilho, RegistroEspaider
│   │       └── mapper.ts            #   135+ field aliases
│   │
│   └── lib/
│       ├── supabase/                #   Clients (server/browser)
│       ├── sync/                    #   espaider-sync.ts (hierarchical sync)
│       ├── transformers/            #   project.ts (DB → UI)
│       └── mocks/                   #   Mock data
│
├── supabase/
│   └── migrations/                  # 20 migrations (001-020)
│
├── CLAUDE.md                        # Instruções para Claude Code
└── package.json                     # Dependencies
```
