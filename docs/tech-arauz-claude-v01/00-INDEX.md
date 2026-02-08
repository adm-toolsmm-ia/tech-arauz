---
doc-id: CLAUDE-V01-00
title: Índice e Roteador de Contexto
scope: Ponto de entrada para navegação do docset
version: 0.1.0
status: draft
last-updated: 2026-02-05
confidence: Alta
---

# Tech Arauz — Docset Claude v01

> **Portal Tech Arauz** — Sistema de Gestão 360° de TI, Inovação e Projetos para o escritório Araúz.
> Protótipo analisado: branch `main`, commit `1a05757` (2026-02-05).

## Como usar este docset

Este conjunto de documentos foi projetado para ser consumido pelo Claude AI como base de contexto para implementação do MVP v01. Cada arquivo é autocontido e referencia outros via `[[wikilinks]]` para navegação no Obsidian.

**Regra de ouro**: Leia este INDEX primeiro. Ele funciona como roteador — aponta qual doc carregar para cada tipo de tarefa.

## Roteador de Contexto

| Se você precisa... | Leia |
|---|---|
| Entender o que é o projeto e seu escopo | [[01-vision-scope]] |
| Saber o significado de um termo do domínio | [[02-glossary]] |
| Entender a stack técnica e padrões | [[03-architecture]] |
| Consultar tabelas, colunas, FKs do banco | [[04-database-schema]] |
| Entender a integração com Espaider | [[05-espaider-integration]] |
| Ver módulos, rotas e capacidades | [[06-feature-map]] |
| Consultar KPIs, fórmulas e queries | [[07-dashboard-kpis]] |
| Entender regras de alerta | [[08-alerts-policies]] |
| Ver catálogo de rotinas/jobs | [[09-routines-catalog]] |
| Entender fluxos fim-a-fim | [[10-flows]] |
| Consultar entidades e eventos de domínio | [[11-domain-entities-events]] |
| Entender auth, RLS, papéis | [[12-security-rbac]] |
| Consultar cron jobs e agendamentos | [[13-jobs-scheduling]] |
| Entender padrões de frontend | [[14-frontend-patterns]] |
| Requisitos não-funcionais (SLA, perf) | [[15-non-functional]] |
| Riscos e perguntas em aberto | [[16-risks-gaps]] |
| PRD com requisitos MoSCoW | [[17-prd-seed]] |
| Roadmap e marcos do projeto | [[18-roadmap-wbs]] |
| Recomendações proto→produto | [[19-delta-recommendations]] |
| Relatório executivo (cliente e CTO) | [[20-executive-report]] |

## Mapa de IDs

Cada item documentado possui um ID estável e grep-ável:

| Prefixo | Tipo | Exemplo | Onde encontrar |
|---|---|---|---|
| `R-###` | Rotina/Job | R-001 | [[09-routines-catalog]] |
| `F-###` | Fluxo ponta-a-ponta | F-001 | [[10-flows]] |
| `KPI-###` | Indicador de desempenho | KPI-001 | [[07-dashboard-kpis]] |
| `INT-###` | Endpoint/Integração | INT-001 | [[05-espaider-integration]] |
| `EV-###` | Evento de domínio | EV-001 | [[11-domain-entities-events]] |
| `AL-###` | Regra de alerta | AL-001 | [[08-alerts-policies]] |
| `POL-###` | Política transversal | POL-001 | [[12-security-rbac]] |
| `Q-###` | Pergunta em aberto | Q-001 | [[16-risks-gaps]] |
| `RF-###` | Requisito funcional | RF-01 | [[17-prd-seed]] |
| `RNF-###` | Requisito não-funcional | RNF-01 | [[15-non-functional]] |
| `ADR-###` | Decisão técnica (pendente revisão) | ADR-001 | [[01-vision-scope]] |

## Convenções

- **Referências de código**: `[ref: caminho/arquivo.ts:linhas]`
- **Confiança**: Alta (evidência direta no código), Média (inferido), Baixa (suposição)
- **Wikilinks**: `[[nome-do-doc]]` para navegação Obsidian e grafo
- **Decisões pendentes**: marcadas com `> [!question]` callout
- **Lacunas**: marcadas com `> [!warning]` callout

## Ordem de Leitura Sugerida

1. [[01-vision-scope]] — Contexto geral
2. [[03-architecture]] — Stack e padrões
3. [[04-database-schema]] — Modelo de dados
4. [[06-feature-map]] — Módulos e capacidades
5. [[05-espaider-integration]] — Integração principal
6. [[07-dashboard-kpis]] — KPIs e métricas
7. [[17-prd-seed]] — Requisitos detalhados

## Grafo de Relacionamentos

```
                    ┌──────────────────┐
                    │  00-INDEX (você)  │
                    └────────┬─────────┘
           ┌─────────────────┼─────────────────┐
           ▼                 ▼                  ▼
   ┌───────────────┐ ┌──────────────┐ ┌────────────────┐
   │01-vision-scope│ │03-architecture│ │17-prd-seed     │
   └───────┬───────┘ └──────┬───────┘ └────────┬───────┘
           │                │                   │
           ▼                ▼                   ▼
   ┌───────────────┐ ┌──────────────┐ ┌────────────────┐
   │02-glossary    │ │04-db-schema  │ │18-roadmap-wbs  │
   └───────────────┘ └──────┬───────┘ └────────────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
   ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐
   │05-espaider   │ │06-feature-map│ │11-entities-events│
   └──────┬───────┘ └──────┬───────┘ └──────────────────┘
          │                │
    ┌─────┼─────┐    ┌─────┼─────┐
    ▼     ▼     ▼    ▼     ▼     ▼
  09-rot 13-jobs    07-kpi 08-al 14-fe
  10-flow           12-sec 15-nf 16-risk
```
