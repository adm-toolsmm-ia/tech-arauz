# PRD — Portal Tech Arauz

> Product Requirements Document do Portal Tech Arauz.
> Para PRDs detalhados por epic, consulte `docs/prd/`.

**Produto**: Portal Tech Arauz
**Versão**: 0.1.0
**Owner**: Gabriel Cristofolini (CTO)
**Status**: In Development

## Visão

Portal SaaS de gestão 360° de TI que centraliza dados do ERP Espaider e fornece dashboards interativos para acompanhamento de projetos, entregas, cronogramas e integrações.

## Problema

O escritório Araúz não tem visibilidade centralizada dos projetos de TI. Dados vivem espalhados no ERP Espaider sem dashboards ou alertas. Gestores não conseguem acompanhar progresso, prazos e bloqueios em tempo real.

## Módulos

### Módulo 1: Gestão 360° de Projetos
- Dashboard interativo com KPIs e gráficos
- ProjectCockpit com visão completa (6 tabs)
- Filtros avançados e busca
- Cronogramas com calendário mês/semana
- Sincronização automática Espaider → Supabase

### Módulo 2: Gestão de Agentes AI (futuro)
- Documentação e visualização de workflows AI
- Integração LangSmith/LangChain/LangGraph

## Personas

- **Gabriel (CTO)**: Precisa de visão estratégica dos projetos
- **Gestores de TI**: Precisam acompanhar entregas e prazos
- **Equipe técnica**: Precisa de detalhes de projetos específicos

## Requisitos Funcionais

Consulte `.context/02-rules/requirements.md` para lista completa (RF-001 a RF-202).

## Requisitos Não-Funcionais

- Performance: < 3s para carregamento inicial
- Segurança: RLS em todas as tabelas (ADR-001)
- Disponibilidade: Vercel (99.9% SLA)
- Multi-tenant: Preparado (tenant `arauz` como single-tenant inicial)
