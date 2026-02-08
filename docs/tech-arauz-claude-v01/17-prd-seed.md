---
doc-id: CLAUDE-V01-17
title: PRD Seed — Requisitos do Produto
scope: Problema, escopo, requisitos MoSCoW, critérios de aceite, métricas
version: 0.1.0
status: draft
last-updated: 2026-02-05
confidence: Alta
depends-on: [01-vision-scope, 07-dashboard-kpis, 16-risks-gaps]
---

# PRD Seed — Product Requirements Document

> Fonte: `[ref: docs/brief/brief_atual.md]` (brief aprovado pelo CTO)

Relacionado: [[01-vision-scope]] (contexto), [[07-dashboard-kpis]] (métricas implementadas), [[16-risks-gaps]] (riscos), [[18-roadmap-wbs]] (cronograma)

---

## 1. Problema

O escritório Araúz utiliza o ERP Espaider como sistema central, mas a gestão de TI, inovação e projetos internos carece de:
- **Visibilidade consolidada**: Solicitações registradas no Espaider sem dashboard dedicado
- **Métricas**: Sem KPIs de atendimento (tempo de resolução, SLA, taxa de conclusão)
- **Centralização**: Documentação técnica dispersa
- **Controle de acesso**: Sem granularidade adequada por perfil

**Impacto mensurável**:

| Métrica | Situação Atual | Meta MVP |
|---|---|---|
| Tempo para visualizar demandas abertas | Manual (consulta ERP) | < 5 segundos (dashboard) |
| Visibilidade de backlog | Baixa | Alta (dashboards em tempo real) |
| Documentação centralizada | Dispersa | 100% no portal |

---

## 2. Objetivo

Entregar um portal web moderno para gestão 360° de demandas de TI, sincronizado com o Espaider, com dashboards analíticos, gestão de projetos/solicitações e controle de acesso por perfil.

**Objetivos medíveis** (ver [[07-dashboard-kpis]] para implementação):
- 100% das solicitações do Espaider visíveis no dashboard
- Equipe TI (5+ usuários) ativa no portal
- 10+ documentações técnicas criadas em 30 dias pós-MVP

---

## 3. Escopo MVP

### 3.1 Incluído (In Scope)

| Módulo | Funcionalidades | Ref |
|---|---|---|
| **Dashboards** | Geral, Gestão, Tecnologia; 16 KPIs; gráficos de evolução | [[07-dashboard-kpis]] |
| **Projetos** | Kanban, Lista, filtros, detalhe com entregas/cronogramas/requisitos | [[06-feature-map]] |
| **Solicitações** | Kanban, Lista, filtros, detalhes, timeline | [[06-feature-map]] |
| **Sync Espaider** | Importação automática e manual de projetos | [[05-espaider-integration]] |
| **APIs** | Configuração de integrações (admin) | [[06-feature-map]] |
| **Agendamentos** | Cron jobs para sync periódica | [[13-jobs-scheduling]] |
| **Logs** | Histórico de execuções com detalhes | [[06-feature-map]] |
| **Documentações** | CRUD com editor Markdown | [[06-feature-map]] |
| **Tabelas Auxiliares** | CRUD de status, tipos, prioridades | [[06-feature-map]] |
| **Auth** | Login, logout, RBAC (admin/user/viewer) | [[12-security-rbac]] |

### 3.2 Excluído (Out of Scope)

- Integração com sistemas além do Espaider (fase futura)
- App mobile nativo
- Módulo financeiro/faturamento
- Multi-tenancy (fase futura)
- Write-back para o Espaider (somente leitura)
- Agentes AI (lawtech, pesquisa) — fase futura
- Alertas por email/Slack (apenas visual no MVP)

---

## 4. Personas

| Persona | Papel | Necessidades principais |
|---|---|---|
| **Gabriel** (CTO/PO) | Product Owner, decisões técnicas | Visão 360° de todos os projetos, métricas de SLA, alertas |
| **Equipe TI** | Usuários operacionais | Visualizar solicitações, filtrar por status, acompanhar entregas |
| **Gestores de Área** | Consumidores de dashboards | Métricas de atendimento, comparativos mensais, relatórios |

---

## 5. Requisitos Funcionais (MoSCoW)

### Must Have

| ID | Requisito | Critério de Aceite | Status |
|---|---|---|---|
| RF-01 | Autenticação com Supabase Auth | Login/logout funcionando, sessão persistida, email @arauz.com.br | Implementado |
| RF-02 | Dashboard com KPIs de solicitações | Exibir total abertos, em atendimento, resolvidos, aguardando (ver [[07-dashboard-kpis]] KPI-001 a KPI-007) | Implementado |
| RF-03 | Visão Kanban de solicitações | Colunas por status, filtros, cards com info relevante | Implementado |
| RF-04 | Visão Lista de solicitações | Tabela com ordenação, busca, filtros por status/prioridade/tipo | Implementado |
| RF-05 | Detalhes de solicitação/projeto | Sheet lateral com abas (Detalhes, Entregas, Cronograma, Requisitos) | Implementado |
| RF-06 | Configuração de APIs (admin) | CRUD de integrações, token mascarado, teste de conexão | Implementado |
| RF-07 | Sincronização com Espaider | Importação manual e automática de projetos e filhos | Implementado |
| RF-08 | Dashboard Tecnologia | APIs ativas, sincronizações, erros 24h, uptime (ver [[07-dashboard-kpis]] KPI-011 a KPI-014) | Implementado |

### Should Have

| ID | Requisito | Critério de Aceite | Status |
|---|---|---|---|
| RF-09 | CRUD de documentações | Criar, editar, visualizar, excluir docs com Markdown | Implementado |
| RF-10 | Logs de execução | Tabela expansível, sanitização por role | Implementado |
| RF-11 | Gestão de automações (admin) | Ativar/desativar, executar manualmente | Implementado |
| RF-12 | Dashboard Gestão | SLA, taxa resolução, comparativo mensal (ver [[07-dashboard-kpis]] KPI-008 a KPI-016) | Implementado |

### Could Have

| ID | Requisito | Critério de Aceite | Status |
|---|---|---|---|
| RF-13 | Tabelas auxiliares configuráveis | CRUD de status, tipos, prioridades, etc. | Implementado |
| RF-14 | Drag-and-drop no Kanban de projetos | Mover projetos entre etapas via drag | Parcial |
| RF-15 | Alertas visuais em KPI cards | Highlight quando métricas ultrapassam thresholds | Não iniciado |

### Won't Have (MVP)

| ID | Requisito | Motivo |
|---|---|---|
| RF-16 | Alertas por email/Slack | Infraestrutura extra, fase futura |
| RF-17 | Write-back para Espaider | API de escrita não disponível/verificada |
| RF-18 | Agentes AI (lawtech, pesquisa) | Complexidade, fase futura |
| RF-19 | Multi-tenancy | Single-tenant suficiente para MVP |
| RF-20 | Relatórios exportáveis (PDF/Excel) | Fase futura |

---

## 6. Requisitos Não-Funcionais

| ID | Requisito | Métrica | Target | Ref |
|---|---|---|---|---|
| RNF-01 | Performance | Latência P95 dashboard | < 2 segundos | [[15-non-functional]] |
| RNF-02 | Disponibilidade | Uptime | 99% (staging) | [[15-non-functional]] |
| RNF-03 | Segurança | RLS ativo em todas tabelas | 100% | [[12-security-rbac]] |
| RNF-04 | Segurança | Tokens nunca expostos em logs | 100% | [[12-security-rbac]] |
| RNF-05 | UX | Responsividade | Mobile-first, sm/md/lg | [[14-frontend-patterns]] |

---

## 7. Métricas de Sucesso

| KPI | Baseline | Meta | Prazo |
|---|---|---|---|
| Solicitações visíveis no dashboard | 0 | 100% sync | MVP |
| Documentações criadas | 0 | 10+ | MVP + 30 dias |
| Usuários ativos | 0 | Equipe TI (5+) | MVP |
| Tempo consulta dashboard | Manual (min) | < 5 seg | MVP |

---

## 8. Dependências Externas

| Dependência | Tipo | Status | Risco |
|---|---|---|---|
| API Espaider | Externa | Disponível | Indisponibilidade temporária (ver [[16-risks-gaps]] RISK-001) |
| Supabase project | Técnica | Configurado | Limites de free tier |
| Vercel deploy | Técnica | Configurado | — |

---

## 9. Assunções

- A API do Espaider continuará disponível no formato atual (WCF/REST)
- O volume de projetos é < 10.000 registros (cabe no free tier do Supabase)
- Usuários têm navegador moderno (Chrome, Edge, Firefox últimas 2 versões)
- Single-tenant é suficiente para o MVP (somente escritório Araúz)

---

## 10. Estratégia de Validação

### Critérios de Aceite por Módulo

| Módulo | Critério | Prioridade de Teste |
| --- | --- | --- |
| **Sync Espaider** (F-001) | Importa projetos e filhos corretamente, UPSERT idempotente, retry funciona | P0 — Crítico |
| **Dashboard KPIs** (KPI-001 a KPI-016) | Valores calculados corretamente com dados reais, staleTime funciona | P0 — Crítico |
| **Auth/Login** (F-006) | Login com @arauz.com.br, sessão persistida, logout funciona | P0 — Crítico |
| **Kanban Projetos** | Drag-and-drop atualiza etapa, cards exibem dados corretos | P1 — Importante |
| **CRUD APIs** (F-003) | Criar, editar, testar conexão, token mascarado na UI | P1 — Importante |
| **Documentações** | CRUD com Markdown funciona, preview correto | P2 — Desejável |
| **Tabelas Auxiliares** | CRUD de status, tipos, prioridades sem erros | P2 — Desejável |

### Metas de Cobertura

| Milestone | Cobertura | Foco |
| --- | --- | --- |
| **Go-live (M2)** | 40% | Sync pipeline, KPIs, auth |
| **Beta (v1.0)** | 55% | + Formulários, Kanban, CRUD |
| **v1.1** | 70% | + Edge cases, responsividade, E2E |

### Testes E2E Prioritários

1. **F-001**: Sync completa Espaider → portal → dashboards atualizados
2. **F-006**: Login → navegação → logout → sessão expirada
3. **F-002**: Kanban load → drag card → verify status change
4. **F-003**: Criar API → testar conexão → executar sync

---

## Decisões Pendentes

> [!question] Q-PRD-001: Frequência ideal de sincronização
> Definir com o CTO se sync diária é suficiente ou se precisa de maior frequência. Ver [[16-risks-gaps]] Q-001.

> [!question] Q-PRD-002: Campos adicionais do Espaider
> Mapear campos extras que podem ser úteis mas ainda não são importados. Ver [[05-espaider-integration]] Q-ESP-004.

> [!question] Q-PRD-003: Política de retenção de logs
> Definir por quanto tempo manter logs de execução. Ver [[16-risks-gaps]] Q-003.

> [!question] Q-PRD-004: Cobertura de testes
> Brief define meta de 70% de cobertura. Atual é mínima. Priorizar no roadmap? Ver [[18-roadmap-wbs]].
