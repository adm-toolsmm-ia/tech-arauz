# Árvore de Origem — Tech Arauz

> Versão PT-BR de `docs/framework/source-tree.md` (fallback AIOS).
> Para detalhes completos, consulte [source-tree.md](../framework/source-tree.md).

## Estrutura Principal

```
src/
├── app/                    # Páginas Next.js (App Router)
│   ├── actions/            #   Server Actions
│   ├── api/integracoes/    #   APIs de sync Espaider
│   ├── projetos/           #   Grid de projetos + filtros
│   ├── cronogramas/        #   Calendário mês/semana
│   ├── dashboard/          #   KPIs + gráficos interativos
│   └── integracoes/        #   Painel admin Espaider
│
├── components/
│   ├── ui/                 #   Shadcn/ui primitivos
│   ├── project/            #   ProjectCockpit (visão 360°)
│   ├── charts/             #   Gráficos (Recharts)
│   ├── filters/            #   Filtros avançados
│   └── layout/             #   Sidebar modular
│
├── integrations/espaider/  # Cliente WCF + mapper 135+ campos
├── lib/sync/               # Sync hierárquico Espaider → Supabase
└── lib/transformers/       # DB → UI (projetos, entregas, cronogramas)
```

## Pastas de Configuração

```
.agent/          # Antigravity Kit (personas & contexto técnico)
.aios-core/      # Synkra AIOS (processo & execução)
.ai/             # Decision logs (ADR)
.context/        # Regras de negócio e specs
docs/            # Documentação AIOS (framework, architecture, stories)
supabase/        # Migrations (001-020)
```
