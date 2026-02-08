# ADR-001: Stack Técnica do Tech Arauz

> **Status**: Aceito  
> **Data**: 2026-02-07  
> **Decisores**: Gabriel Cristofolini (CTO/PO)  
> **Tags**: arquitetura, frontend, backend, banco-de-dados

---

## Contexto

O Tech Arauz é um SaaS de gestão de TI com dois módulos principais:
1. **Gestão de Projetos** — integração com ERP Espaider (Prioridade 1)
2. **Gestão de Agentes AI** — LangSmith/LangChain/LangGraph (Prioridade 2)

Precisamos definir a stack técnica que suporte:
- Single-tenant inicial, preparado para multi-tenant
- 100-300 projetos/ano, 5-10 usuários simultâneos
- Orçamento de ~US$300/mês para infraestrutura
- Time: 1 dev fullstack principal (30-35h/sem)

---

## Decisão

### Frontend/BFF

| Componente | Escolha | Justificativa |
|------------|---------|---------------|
| **Framework** | Next.js (App Router) | SSR, RSC, rotas API, DX excelente |
| **Linguagem** | TypeScript | Type-safety, autocompletion |
| **API Layer** | tRPC + REST fallback | E2E typesafe, REST para integrações externas |
| **UI Library** | Tailwind CSS + shadcn/ui | Componentes acessíveis, design system pronto |

### Backend/Banco

| Componente | Escolha | Justificativa |
|------------|---------|---------------|
| **Plataforma** | Supabase | Postgres + Auth + Storage + RLS em um só lugar |
| **Banco** | PostgreSQL | RLS para multi-tenant, JSON para dados Espaider |
| **Auth** | Supabase Auth | JWT, sessões, RBAC nativo |
| **Storage** | Supabase Storage | Anexos de projetos, configs |

### Serviço AI (Separado)

| Componente | Escolha | Justificativa |
|------------|---------|---------------|
| **Runtime** | Python + FastAPI | Ecossistema AI maduro |
| **Orquestração** | LangGraph | Grafos de agentes, estado persistente |
| **Agentes/Skills** | LangChain | Abstração de LLMs, tools, chains |
| **Observabilidade** | LangSmith | Tracing, datasets, evaluators, QA |

### Observabilidade Web

| Componente | Escolha | Justificativa |
|------------|---------|---------------|
| **Analytics** | Vercel Analytics | Integrado, Core Web Vitals |
| **Erros** | Sentry | Stack traces, breadcrumbs, alertas |

### Hospedagem

| Componente | Escolha | Custo Estimado |
|------------|---------|----------------|
| **Web** | Vercel (Pro) | ~$20/mês |
| **DB/Auth** | Supabase (Pro) | ~$25/mês |
| **Sentry** | Team | ~$26/mês |
| **LangSmith** | Team/Free | ~$0-39/mês |
| **Total** | | ~$70-110/mês |

---

## Alternativas Consideradas

### Next.js vs Remix vs SvelteKit
- **Remix**: Excelente, mas menos adoção e componentes prontos
- **SvelteKit**: Performance melhor, mas ecossistema menor
- **Escolha Next.js**: Maior ecossistema, integração Vercel, shadcn/ui

### Supabase vs Firebase vs PlanetScale
- **Firebase**: NoSQL, menos flexível para queries complexas
- **PlanetScale**: Sem RLS nativo, custo maior
- **Escolha Supabase**: Postgres + RLS + Auth integrado, custo menor

### Python vs Node.js para Serviço AI
- **Node.js**: Possível com langchain.js, mas ecossistema menor
- **Escolha Python**: Langraph/Langchain nativos, libs de ML maduras

---

## Consequências

### Positivas
- Stack coesa com excelente DX (TypeScript E2E)
- Custo inicial baixo (~$100/mês)
- Escalabilidade clara (Vercel + Supabase Pro)
- Separação clara: Web (TypeScript) vs AI (Python)

### Negativas
- Dois runtimes (Node + Python) aumentam complexidade de deploy
- Lock-in parcial em Vercel e Supabase
- LangSmith pode ter custo crescente com volume

### Mitigações
- Containerizar serviço AI para portabilidade
- Abstrair Supabase client para possível migração
- Monitorar custos LangSmith, fallback para Langfuse se necessário

---

## SLOs Iniciais

| Métrica | Target | Medição |
|---------|--------|---------|
| `latency_p95_ms` | ≤ 4000ms | Vercel Analytics |
| `error_rate_max` | ≤ 2% | Sentry |
| `eval_pass_rate_min` (dev) | ≥ 80% | LangSmith |
| `uptime` | ≥ 99.5% | UptimeRobot |

---

## Referências

- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase](https://supabase.com/docs)
- [LangGraph](https://langchain-ai.github.io/langgraph/)
- [shadcn/ui](https://ui.shadcn.com)
