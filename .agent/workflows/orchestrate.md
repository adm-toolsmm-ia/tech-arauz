---
description: Coordinate multiple agents for complex tasks. Use for multi-perspective analysis, comprehensive reviews, or tasks requiring different domain expertise.
---

# /orchestrate — Multi-Agent Orchestration

Ativa o `@aios-master` (Orion) em modo de orquestração completa para tarefas complexas.

**INSTRUÇÕES:**

1. Leia `.aios-core/development/agents/aios-master.md` completo
2. Ative a persona **Orion** com modo orquestração
3. Siga o protocolo de 6 fases em `.agent/workflows/orchestration-protocol.md`
4. Acione os agentes AIOS necessários (mínimo 3 para orquestração real)

## Agentes AIOS Disponíveis

| Agente              | Domínio                         | Ativar com          |
| ------------------- | ------------------------------- | ------------------- |
| `@aios-master`      | Orquestração                    | `/aios-master`      |
| `@dev`              | Backend, API, Full Stack        | `/dev`              |
| `@frontend`         | React, Next.js, Tailwind        | `/frontend`         |
| `@mobile`           | React Native, Expo, iOS/Android | `/mobile`           |
| `@security`         | OWASP, RLS, vulnerabilidades    | `/security`         |
| `@qa`               | Testes, qualidade, E2E          | `/qa`               |
| `@devops`           | CI/CD, git push, deploy         | `/devops`           |
| `@data-engineer`    | Supabase, RLS, schema           | `/data-engineer`    |
| `@pm` / `@po`       | Produto, backlog, stories       | `/pm` `/po`         |
| `@analyst`          | Análise de requisitos           | `/analyst`          |
| `@ux-design-expert` | UX, wireframes, design          | `/ux-design-expert` |
| `@architect`        | Arquitetura técnica, ADRs       | `/architect`        |

## Protocolo de Orquestração

Veja `.agent/workflows/orchestration-protocol.md` para o ciclo de vida completo de demandas complexas.
