---
doc-id: CLAUDE-V01-01
title: Visão e Escopo do Produto
scope: Contexto de negócio, problema, valor, personas, decisões arquiteturais
version: 0.1.0
status: draft
last-updated: 2026-02-05
confidence: Alta
depends-on: [17-prd-seed, 02-glossary]
---

# Visão e Escopo do Produto

> Fonte: `[ref: docs/brief/brief_atual.md]`

Relacionado: [[02-glossary]] (termos do domínio), [[17-prd-seed]] (requisitos detalhados), [[03-architecture]] (decisões técnicas), [[18-roadmap-wbs]] (cronograma)

---

## Resumo Executivo

**Portal Tech Arauz** é um sistema de gestão 360° de TI, inovação e projetos para o escritório de advocacia Araúz. O portal importa dados do ERP Espaider e oferece dashboards analíticos, gestão visual de projetos e solicitações, e controle de acesso por perfil.

**Código do projeto**: TECH-ARAUZ-MVP
**Tenant**: arauz (single-tenant)
**Owner**: CTO (Gabriel Cristofolini)
**Data de início**: 2026-01-18

---

## Problema

O escritório utiliza o ERP Espaider como sistema central, mas:
- Solicitações são registradas no Espaider sem visibilidade consolidada para a equipe de TI
- Não há dashboards para acompanhamento de métricas e KPIs de atendimento
- Documentação técnica está dispersa
- Falta controle granular de acesso e auditoria

**Impacto**:
- Tempo para consultar demandas: minutos (consulta manual no ERP) → meta: < 5 segundos
- Visibilidade do backlog: Baixa → meta: Alta (tempo real)
- Documentação: Dispersa → meta: 100% centralizada

---

## Valor Entregue

1. **Visibilidade 360°**: Dashboards com KPIs em tempo real — ver [[07-dashboard-kpis]]
2. **Gestão visual**: Kanban e listas para projetos e solicitações — ver [[06-feature-map]]
3. **Integração automática**: Sync com Espaider elimina entrada manual — ver [[05-espaider-integration]]
4. **Controle de acesso**: RBAC com 3 níveis (admin, user, viewer) — ver [[12-security-rbac]]
5. **Centralização**: Documentação técnica e logs em um só lugar

---

## Personas

| Persona | Papel | Necessidades | Dashboards |
|---|---|---|---|
| **Gabriel (CTO/PO)** | Product Owner, decisões técnicas | Visão 360° de todos os projetos, métricas de SLA, alertas | Geral, Gestão, Tecnologia |
| **Equipe TI** | Operadores | Visualizar solicitações, filtrar, acompanhar entregas | Geral |
| **Gestores de Área** | Consumidores de dashboards | Métricas de atendimento, comparativos mensais | Gestão |

---

## Decisões Técnicas Herdadas do Protótipo (Pendentes de Revisão Formal)

> O protótipo foi desenvolvido no **Lovable** (ferramenta de prototipagem com limitações). As decisões abaixo foram herdadas automaticamente e **não foram formalmente avaliadas**. ADRs formais serão definidos em sessão separada com base nas documentações de regra de negócio deste docset.

### ADR-001: Supabase RLS para Controle de Acesso

- **Origem**: Protótipo Lovable (2026-01-18)
- **Contexto**: Uso de Row-Level Security nativo do PostgreSQL via Supabase. Políticas RLS em todas as tabelas.
- **A analisar**: Cobertura real das policies, granularidade por role, performance em escala, auditoria de tabelas sem RLS
- **Status**: Pendente de revisão formal
- **Ref**: [[12-security-rbac]]

### ADR-002: View apis_safe para Mascaramento de Tokens

- **Origem**: Protótipo Lovable (2026-01-22)
- **Contexto**: View que mascara tokens com `substring(token, 1, 4) || '****'`. Frontend usa apis_safe, edge functions usam apis diretamente.
- **A analisar**: Suficiência do mascaramento, alternativa com pgcrypto ou Vault, impacto se view for bypassada
- **Status**: Pendente de revisão formal
- **Ref**: [[12-security-rbac]]

### ADR-003: Sanitização de Logs por Role

- **Origem**: Protótipo Lovable (2026-01-22)
- **Contexto**: View logs_execucao_safe esconde detalhes e mensagem_erro para não-admins.
- **A analisar**: Quais campos são realmente sensíveis, se admins precisam de mais granularidade, retenção de logs
- **Status**: Pendente de revisão formal
- **Ref**: [[12-security-rbac]]

### ADR-004: Feature-Based Folder Structure

- **Origem**: Protótipo Lovable (2026-01-18)
- **Contexto**: Código organizado por feature (`src/features/{module}/`), cada módulo autocontido.
- **A analisar**: Validar que features não importam entre si, shared/ está bem delimitado, convenções de nomes
- **Status**: Pendente de revisão formal
- **Ref**: [[14-frontend-patterns]]

### ADR-005: Arquitetura de Sincronização Espaider

- **Origem**: Protótipo Lovable (2026-01-19)
- **Contexto**: Edge Function com UPSERT, 135+ aliases, paginação e retry com backoff exponencial.
- **A analisar**: Resiliência sob falha parcial, tratamento de registros órfãos, performance com volume real, monitoramento
- **Status**: Pendente de revisão formal
- **Ref**: [[05-espaider-integration]]

---

## Escopo MVP

### Incluído
- Dashboards (Geral, Gestão, Tecnologia) com 16 KPIs
- Gestão de projetos (Kanban, Lista, Detalhes com filhos)
- Gestão de solicitações
- Sincronização Espaider (manual + agendada)
- Configuração de APIs (admin)
- Documentações (CRUD Markdown)
- Logs de execução
- Tabelas auxiliares configuráveis
- Auth com RBAC

### Excluído
- Integração com sistemas além do Espaider
- App mobile nativo
- Módulo financeiro
- Multi-tenancy
- Write-back para Espaider
- Agentes AI (lawtech)
- Alertas por email/Slack
- Relatórios exportáveis (PDF/Excel)

Ver detalhes em [[17-prd-seed]]

---

## Decisões Pendentes

> [!question] Q-VIS-001: Priorização pós-MVP
> Qual módulo é prioritário após o MVP: agentes AI, multi-tenancy, ou exportação de relatórios?

> [!question] Q-VIS-002: Agentes futuros
> O brief menciona "agente de pesquisas lawtech" como futuro. Definir pontos de extensão no MVP para facilitar essa integração.
