# Technical Debt Assessment - FINAL

Data: 2026-02-26  
Versao: 1.0  
Gate QA: APPROVED

## Executive Summary

- Total de debitos consolidados: **18**
- Criticos: **4**
- Altos: **9**
- Medios: **5**
- Esforco estimado: **~274 horas**

## 1. Inventario consolidado

### 1.1 Sistema (validado por architect)

| ID | Debito | Severidade | Horas | Prioridade |
|---|---|---|---:|---|
| SYS-01 | Drift arquitetura declarada x implementada | Alta | 12 | Alta |
| SYS-02 | Endpoints AI sem JWT obrigatorio | Critica | 8 | Critica |
| SYS-03 | Default inseguro de JWT secret | Critica | 4 | Critica |
| SYS-04 | Tenant hardcoded em runtime/rotas | Alta | 16 | Alta |
| SYS-05 | Componentes frontend grandes/acoplados | Alta | 40 | Alta |
| SYS-06 | Cobertura de testes desigual | Alta | 32 | Alta |
| SYS-07 | CI sem `typecheck` dedicado | Media | 4 | Media |

### 1.2 Database (validado por data-engineer)

| ID | Debito | Severidade | Horas | Prioridade |
|---|---|---|---:|---|
| DB-01 | Historico de regressao RLS em child tables/logs | Critica | 20 | Critica |
| DB-02 | Segredo persistido em texto (`espaider_apis.token`) | Alta | 12 | Alta |
| DB-03 | Hardcode de tenant em scripts/migrations | Alta | 10 | Alta |
| DB-04 | Campos de dominio sem padrao forte | Media | 24 | Media |
| DB-05 | Retencao de logs nao formalizada | Media | 12 | Media |
| DB-06 | Sem monitoramento de crescimento/bloat de logs | Media | 8 | Media |
| DB-07 | Sem baseline de restore/recovery drill | Alta | 14 | Alta |

### 1.3 Frontend/UX (validado por ux-design-expert)

| ID | Debito | Severidade | Horas | Prioridade |
|---|---|---|---:|---|
| UX-01 | Regras duplicadas entre telas | Alta | 16 | Alta |
| UX-02 | Baseline de acessibilidade ausente | Alta | 20 | Alta |
| UX-03 | Camada de dados heterogenea | Media | 18 | Media |
| UX-04 | Jornadas por persona nao formalizadas | Media | 10 | Media |
| UX-05 | Componentes extensos dificultam evolucao UX | Alta | 24 | Alta |
| UX-06 | Feedback async sem padrao unico | Media | 10 | Media |

## 2. Matriz final de priorizacao

## Onda 1 - Critico imediato (Sprint 1)
- SYS-02, SYS-03, DB-01, DB-02
- Objetivo: eliminar risco de seguranca/isolamento

## Onda 2 - Alta prioridade estrutural (Sprint 2)
- SYS-04, SYS-06, DB-03, DB-07, UX-01
- Objetivo: estabilizar fundacao de multi-tenant e qualidade

## Onda 3 - Qualidade de entrega e UX (Sprint 3)
- SYS-05, UX-02, UX-05, UX-06, SYS-07
- Objetivo: reduzir custo de manutencao e regressao

## Onda 4 - Governanca de dados/operacao (Sprint 4)
- DB-04, DB-05, DB-06, UX-03, UX-04
- Objetivo: consolidar padroes de longo prazo

## 3. Dependencias de execucao

1. Hardening de seguranca antecede refatoracao ampla.
2. Testes de autorizacao e RLS devem estar ativos antes de mudancas de schema sensivel.
3. Extracao de regras de dominio precede modularizacao de UI para evitar retrabalho.

## 4. Riscos e mitigacoes (QA consolidado)

| Risco | Mitigacao |
|---|---|
| Regressao de isolamento tenant | Testes SQL RLS no CI + revisao obrigatoria de policy |
| Interrupcao de sync por mudanca de secrets | Rollout em duas fases com fallback |
| Quebra funcional em refatoracao UI | Testes de regressao por fluxo critico |
| Dificuldade de observacao de incidentes | Logs estruturados + alertas |

## 5. Criterios de sucesso

1. Nenhum endpoint critico exposto sem autenticacao/autorizacao.
2. RLS validado automaticamente em pipeline.
3. Fluxos criticos (dashboard/projetos/sync) cobertos por testes de regressao.
4. Componentes principais modularizados com reducao de complexidade.
5. Operacao de sync com segredo protegido e trilha de auditoria clara.

## 6. Proximos passos

1. Aprovar backlog priorizado.
2. Criar epic de execucao.
3. Quebrar em stories com AC e testes por onda.

