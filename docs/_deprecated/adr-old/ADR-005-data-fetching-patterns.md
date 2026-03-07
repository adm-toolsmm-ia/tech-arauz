# ADR-005 — Data Fetching Patterns Formais [ARCHIVED]

**Data:** 2026-02-28
**Status:** Archived — Will be superseded by updated ADR post-AIOX Phase 2
**Última atualização:** 2026-03-07
**Autor:** Aria (architect)
**Epic:** UX-EPIC-01 / Story 2.11

---

## Contexto

O portal Tech Arauz cresceu de forma incremental com multiplos contribuidores (humanos e agentes AI). Isso resultou em inconsistencia no padrao de data fetching: alguns modulos usam Server Components, outros usam API Routes, outros Client Services com Zustand — sem regra clara de quando usar cada um.

Com a formalizacao da domain logic (Story 2.6) e a decomposicao de componentes (Stories 2.4 e 2.5), chegou o momento de documentar formalmente as regras arquiteturais de data fetching para:
- Guiar novos modulos
- Servir de referencia para agentes AI
- Eliminar duvidas de "como buscar dados aqui?"

---

## Decisao

Adotamos **quatro padroes formais** de data fetching, cada um adequado a um tipo especifico de operacao:

| Padrao | Caso de Uso |
|--------|-------------|
| **Server Component** | Leitura para SSR — sem interacao |
| **Server Action** | Mutations e CRUD autenticado |
| **API Route** | Proxy para servicos externos |
| **Client Service** | Estado real-time ou dual source (caso excepcional) |

---

## Consequencias

### Positivas
- Clareza para novos desenvolvimentos e agentes AI
- Reducao de codigo duplicado (Client Services desnecessarios)
- Performance melhorada (Server Components > Client fetch)
- Seguranca melhorada (segredos nunca chegam ao browser via Server Actions/API Routes)
- Testabilidade: Server Actions sao facilmente mockadas (ver Story 2.9)

### Negativas / Riscos
- Alguns modulos auxiliares ainda usam Client Services onde Server Actions seriam suficientes — migracao futura necessaria
- Restricao de Client Services pode causar resistencia em features que "parecem" precisar de real-time mas nao precisam

### Excecoes Aceitas
- Modulo Agentes: Client Service (Zustand) justificado por dual source (Supabase configs + AI service runtime state)

---

## Alternativas Consideradas

### Alternativa 1 — Tudo via API Routes
**Rejeitada.** API Routes adicionam overhead desnecessario para dados simples de banco. Server Components sao mais eficientes para SSR.

### Alternativa 2 — Tudo via TanStack Query no cliente
**Rejeitada.** Perde os beneficios de SSR (SEO, performance inicial, seguranca). Adequado apenas para real-time onde Server Components nao servem.

### Alternativa 3 — Manter status quo sem documentar
**Rejeitada.** A falta de regras claras gera inconsistencia progressiva conforme novos modulos sao criados por agentes AI e desenvolvedores.

---

## Documentos Relacionados

- [data-fetching-patterns.md](../data-fetching-patterns.md) — Regras detalhadas e mapeamento de modulos
- [module-standards.md](../module-standards.md) — Standards de engenharia de modulos (secao 8)
- Story 2.6 — Domain logic extraction
- Story 2.9 — Server Actions com testes (valida testabilidade do padrao)
