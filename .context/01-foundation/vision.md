# Visão do Produto

> **Camada**: 0 - Fundação  
> **Última atualização**: 2026-02-07

---

## Resumo Executivo

O **Portal Tech Arauz** é um SaaS de gestão de TI que combina:

1. **Gestão 360° de Projetos** — Centraliza dados do ERP Espaider em uma interface moderna
2. **Gestão de Agentes AI** — Documenta e visualiza workflows de agentes (LangSmith/LangChain/LangGraph)

### Problema

| Situação Atual | Meta |
|----------------|------|
| Tempo para consultar demandas: minutos | < 5 segundos |
| Visibilidade do backlog: Baixa | Alta (tempo real) |
| Documentação de agentes: Dispersa | 100% centralizada |
| Workflows de AI: Não rastreados | Monitorados via LangSmith |

### Valor Entregue

1. **Visibilidade 360°**: Dashboards com KPIs em tempo real
2. **Gestão visual**: Kanban para projetos e solicitações
3. **Integração automática**: Sync unidirecional Espaider → Portal
4. **Gestão de Agentes**: Monitorar, criar e editar workflows AI
5. **Controle de acesso**: RBAC com 3 níveis (admin, user, viewer)

---

## Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────────┐
│                    TECH ARAUZ (SaaS)                        │
├─────────────────────────────────────────────────────────────┤
│  MÓDULO 1: Gestão de Projetos    │  MÓDULO 2: Gestão de    │
│  ─────────────────────────────   │  Agentes AI             │
│  • Importação Espaider (API)     │  • LangSmith Integration│
│  • Visualização de Projetos      │  • LangChain Workflows  │
│  • Cronogramas, Entregas, Reqs   │  • LangGraph Visualizer │
│  • Dashboards e KPIs             │  • Documentação de Runs │
├─────────────────────────────────────────────────────────────┤
│                    INFRAESTRUTURA                           │
│  • Multi-tenant Ready (tenant: arauz)                       │
│  • Controle de Usuários (RBAC)                              │
│  • Tabelas Auxiliares                                       │
│  • Logs e Monitoramento                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Personas

| Persona | Papel | Necessidades Primárias |
|---------|-------|------------------------|
| Gabriel (CTO/PO) | Product Owner | Visão 360° de projetos, métricas de SLA, workflows de agentes |
| Equipe TI | Operadores | Visualizar solicitações, acompanhar entregas, ver logs de agentes |
| Gestores de Área | Consumidores | Métricas de atendimento, comparativos mensais |

---

## Escopo MVP

### Fase 1: Gestão de Projetos (Prioridade 1)

| Funcionalidade | Status |
|----------------|--------|
| Importação de Projetos via API Espaider | ✅ Implementado (RF-002, Etapa 22) |
| Visualização de Projetos (dados de capa) | ✅ Implementado (RF-004, Etapas 6+14) |
| Cadastros filhos: Cronogramas, Entregas, Requisitos | ✅ Implementado (RF-003, Migrations 019-020) |
| Dashboards e KPIs | ✅ Implementado (RF-009, STORY-001: 8 KPIs + 3 gráficos) |
| Controle de Tabelas Auxiliares | ✅ Implementado (RF-006, Etapas 14-15) |
| Controle de Usuários (RBAC) | ✅ Implementado (RF-007, Etapa 13) |
| Logs e Monitoramento | ✅ Implementado (RF-008, Migration 006 + LogViewer) |

### Fase 2: Gestão de Agentes AI (Prioridade 2)

| Funcionalidade | Status |
|----------------|--------|
| Integração com LangSmith (monitoring) | 📋 Planejado - Fase 2 (RF-101) |
| Visualização de workflows LangChain | 📋 Planejado - Fase 2 (RF-103) |
| Visualização de grafos LangGraph | 📋 Planejado - Fase 2 (RF-105) |
| Criação/edição de workflows | 📋 Planejado - Fase 2 (RF-107) |
| Documentação de agentes existentes | 📋 Planejado - Fase 2 (RF-104) |

### ❌ Excluído do MVP

- App mobile nativo
- Módulo financeiro
- Multi-tenancy completo (preparado, mas não implementado)
- Write-back para Espaider
- Alertas por email/Slack
- Relatórios exportáveis (PDF/Excel)

---

## Decisões de Arquitetura

| Decisão | Escolha | Justificativa |
|---------|---------|---------------|
| Tenant | Single-tenant (arauz) | MVP focado, mas estrutura preparada para multi-tenant |
| Direção de dados | Unidirecional (Espaider → Portal) | Read-only, sem write-back no MVP |
| Stack AI | LangSmith + LangChain + LangGraph | Padrão de mercado para agentes AI |

---

## Referências

- [Documentação original](../docs/tech-arauz-claude-v01/01-vision-scope.md)
- [API Espaider - Exemplos](../docs/espaider-apiprojetos/)
