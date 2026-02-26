# Technical Debt Assessment - DRAFT

Data: 2026-02-26  
Status: DRAFT para revisao dos especialistas

## 1. Debitos de sistema (arquitetura/app)

| ID | Debito | Area | Impacto | Esforco (h) | Prioridade preliminar |
|---|---|---|---|---:|---|
| SYS-01 | Drift entre arquitetura declarada (`trpc`) e implementacao real (API routes + server actions) | Arquitetura | Alto | 12 | Alta |
| SYS-02 | Endpoints AI `/traces` e `/budget` sem JWT obrigatorio | Seguranca | Critico | 8 | Critica |
| SYS-03 | Default inseguro para `SUPABASE_JWT_SECRET` no AI service | Seguranca | Critico | 4 | Critica |
| SYS-04 | Tenant hardcoded em rotas/migrations operacionais | Multi-tenant | Alto | 16 | Alta |
| SYS-05 | Componentes centrais extensos (alto acoplamento e baixa modularidade) | Frontend | Alto | 40 | Alta |
| SYS-06 | Cobertura de testes desigual e sem baseline para fluxos criticos | Qualidade | Alto | 32 | Alta |
| SYS-07 | CI sem etapa explicita de `typecheck` | DevEx/Qualidade | Medio | 4 | Media |

## 2. Debitos de database

| ID | Debito | Area | Impacto | Esforco (h) | Prioridade preliminar |
|---|---|---|---|---:|---|
| DB-01 | Historico de migrations RLS com regressao previa em tabelas filhas/logs | Seguranca | Critico | 20 | Critica |
| DB-02 | Token sensivel salvo em `espaider_apis.token` | Seguranca/Compliance | Alto | 12 | Alta |
| DB-03 | Hardcode de tenant em scripts/migrations de dados | Multi-tenant | Alto | 10 | Alta |
| DB-04 | Possivel inconsistencias de dominio em campos textuais livres (status/fase/prioridade) | Integridade | Medio | 24 | Media |
| DB-05 | Ausencia de politica formal de retencao para logs (`integration_log_entries`, `sync_logs`) | Operacao | Medio | 12 | Media |

## 3. Debitos de frontend/UX

| ID | Debito | Area | Impacto | Esforco (h) | Prioridade preliminar |
|---|---|---|---|---:|---|
| UX-01 | Duplicacao de regras de negocio (atraso/prioridade) em multiplas telas | Consistencia | Alto | 16 | Alta |
| UX-02 | Falta de padrao central de acessibilidade (teclado/foco/aria-live) | A11y | Alto | 20 | Alta |
| UX-03 | Camada de dados heterogenea por modulo (server action/API/service) | Arquitetura UX | Medio | 18 | Media |
| UX-04 | Ausencia de jornadas documentadas por persona | Produto | Medio | 10 | Media |

## 4. Matriz preliminar de priorizacao

| ID | Risco | Impacto negocio | Esforco | Janela sugerida |
|---|---|---|---|---|
| SYS-02 | Alto | Alto | Baixo | Sprint 1 |
| SYS-03 | Alto | Alto | Baixo | Sprint 1 |
| DB-01 | Alto | Alto | Medio | Sprint 1 |
| DB-02 | Alto | Alto | Medio | Sprint 1 |
| SYS-04 | Medio/Alto | Alto | Medio | Sprint 2 |
| SYS-05 | Medio | Alto | Alto | Sprint 2-3 |
| SYS-06 | Medio | Alto | Alto | Sprint 2-3 |
| UX-01 | Medio | Medio/Alto | Medio | Sprint 2 |
| UX-02 | Medio | Medio | Medio | Sprint 2-3 |
| DB-05 | Medio | Medio | Medio | Sprint 3 |

## 5. Perguntas para especialistas

### Para @data-engineer
1. Quais tabelas devem receber auditoria adicional de RLS alem das ja remediadas?
2. Recomendacao de criptografia/secret handling para `espaider_apis.token` sem quebrar operacao?
3. Melhor estrategia para validacao automatica de RLS no CI?
4. Quais enums/check constraints devem ser priorizados primeiro para reduzir inconsistencia?

### Para @ux-design-expert
1. Quais fluxos de maior risco UX devem ser priorizados (dashboard, projetos, integracoes, agentes)?
2. Qual baseline minimo de acessibilidade para liberar producao em modulo critico?
3. Proposta de padrao visual/interaction para feedback de operacoes async (sync, salvar, erros)?
4. Como quebrar componentes grandes sem perder consistencia visual?

## 6. Proximo passo do workflow

- Revisoes especializadas:
  - `docs/reviews/db-specialist-review.md`
  - `docs/reviews/ux-specialist-review.md`
  - `docs/reviews/qa-review.md`

