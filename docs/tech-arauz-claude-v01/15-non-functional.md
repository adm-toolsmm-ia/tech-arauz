---
doc-id: CLAUDE-V01-15
title: Requisitos Não-Funcionais
scope: Performance, SLAs, observabilidade, retenção, responsividade
version: 0.1.0
status: draft
last-updated: 2026-02-05
confidence: Média
depends-on: [03-architecture, 07-dashboard-kpis, 17-prd-seed]
---

# Requisitos Não-Funcionais

> Fonte: `[ref: docs/brief/brief_atual.md]` (RNF-01 a RNF-05)

Relacionado: [[03-architecture]] (stack), [[07-dashboard-kpis]] (stale times), [[17-prd-seed]] (requisitos)

---

## RNF-01: Performance

| Métrica | Target | Status |
|---|---|---|
| Latência P95 dashboard | < 2 segundos | Implementado (via staleTime caching) |
| First Contentful Paint | < 1.5 segundos | Lazy loading + Vite code splitting |
| Time to Interactive | < 3 segundos | — |
| Tempo de sync (100 projetos) | < 30 segundos | Depende da API Espaider |

**Mecanismos implementados**:
- TanStack Query cache com staleTime (30s a 5min conforme hook) — ver [[07-dashboard-kpis]]
- Lazy loading de todas as páginas via React.lazy — ver [[14-frontend-patterns]]
- Vite code splitting automático
- Supabase SDK com connection pooling

**Riscos de performance**:
- `useSolicitacoesPorDia` faz N queries (1 por dia, até 30) — ver [[07-dashboard-kpis]] Q-KPI-002
- Sync de projetos com muitos filhos pode levar minutos — depende do volume
- Sem indexação customizada além dos defaults

---

## RNF-02: Disponibilidade

| Métrica | Target | Status |
|---|---|---|
| Uptime do portal | 99% | Depende do Vercel + Supabase |
| Uptime da API Espaider | Não controlado | Monitorado via KPI-014 |

**Dependências externas**:
- Vercel: 99.99% SLA (plano Pro)
- Supabase: 99.9% SLA (plano Pro), free tier sem SLA
- API Espaider: Sem SLA definido

---

## RNF-03: Segurança

| Métrica | Target | Status |
|---|---|---|
| RLS ativo em todas tabelas | 100% | A verificar (ver [[12-security-rbac]] Q-SEC-003) |
| Tokens nunca expostos em logs | 100% | Implementado (URL sanitization) |
| Headers de segurança | OWASP | HSTS, X-Frame-Options DENY, XSS Protection |

Ver detalhes em [[12-security-rbac]]

---

## RNF-04: Responsividade

| Métrica | Target | Status |
|---|---|---|
| Mobile-first | Breakpoints sm/md/lg | Implementado via Tailwind |
| Breakpoint sm | 640px | Sidebar colapsa |
| Breakpoint md | 768px | Grid 2 colunas |
| Breakpoint lg | 1024px | Grid 3 colunas |

---

## RNF-05: Observabilidade

### Logging

| Camada | Ferramenta | Nível | Ref |
|---|---|---|---|
| Frontend | `shared/lib/logger.ts` | info, warn, error | Console + estruturado |
| Edge Functions | JSON estruturado com `run_id` | Etapas (stages), métricas | [ref: sync-espaider/index.ts] |
| Database | `logs_execucao` + `logs` | Por execução | [[04-database-schema]] |

### Métricas

| Métrica | Fonte | Uso |
|---|---|---|
| `shared/lib/metrics.ts` | Frontend | Tracking de eventos (page views, actions) |
| `shared/lib/version.ts` | Frontend | Versão do app (para debug) |
| `logs_execucao.duracao_ms` | Database | Tempo de execução de syncs |
| `logs_execucao.registros_*` | Database | Contadores de processamento |

### Monitoramento

| O que | Como | Status |
|---|---|---|
| Uptime das APIs | KPI-014 via useIntegrationStatus | Implementado |
| Erros de sync | KPI-013 via useTechDashboardStats | Implementado |
| Health geral | Dashboard Tecnologia | Implementado |
| APM / Tracing | — | Não implementado |
| Error tracking (Sentry) | — | Não implementado |

---

## RNF-06: Retenção de Dados

| Dado | Política | Status |
|---|---|---|
| Projetos importados | Indefinida (mantém tudo) | Sem purge |
| Logs de execução | Indefinida | **Sem purge — ver [[16-risks-gaps]] Q-003** |
| Documentações | Indefinida (mantém tudo) | Sem purge |
| Sessões de auth | Conforme Supabase (auto-cleanup) | Gerenciado |

> [!warning] Sem política de retenção
> A tabela `logs_execucao` não tem TTL nem rotina de purge. Com syncs diárias gerando ~5 registros por dia, em 1 ano teremos ~1800 registros (baixo risco), mas com syncs frequentes o número cresce.

---

## RNF-07: Volumetria Esperada

| Dado | Volume estimado | Crescimento |
|---|---|---|
| Projetos | < 500 | ~10/mês |
| Solicitações | < 2000 | ~50/mês |
| Entregas/Cronogramas/Requisitos | < 5000 total | Proporcional aos projetos |
| APIs configuradas | < 10 | Raro |
| Logs de execução | ~5-20/dia | Depende de cron |
| Usuários | 5-15 | Equipe TI + gestores |

---

## RNF-08: Custos Estimados

| Serviço | Plano Atual | Trigger de Upgrade | Custo Pro |
| --- | --- | --- | --- |
| **Supabase** | Free | 500MB DB, 1GB storage, 2M edge invocations/mês | ~$25/mês |
| **Vercel** | Free | Bandwidth > 100GB, custom domain SSL, analytics | ~$20/mês |
| **Domínio** | — | Se custom domain | ~$5/mês |
| **Total estimado Pro** | — | — | **~$50/mês** |

**Regra de negócio**: Para o MVP com volumetria estimada (< 500 projetos, < 2000 solicitações, < 15 usuários), o free tier é suficiente. Monitorar limites mensalmente.

---

## RNF-09: Backup e Recovery

| Métrica | Free Tier | Pro Tier |
| --- | --- | --- |
| **RPO** (Recovery Point Objective) | 24h (backups diários) | 1 min (PITR — Point-in-Time Recovery) |
| **RTO** (Recovery Time Objective) | 1h (restore manual) | 15 min (restore via dashboard) |
| **Retenção de backups** | 7 dias | 30 dias |

**Regra de negócio**: Perda máxima aceitável de dados para o MVP é de 24h. Se dados críticos forem inseridos manualmente (não sync), considerar upgrade para Pro com PITR.

---

## Decisões Pendentes

> [!question] Q-NF-001: APM e Error Tracking
> Implementar Sentry, Datadog ou Langfuse para monitoramento de erros e performance do frontend? O custo justifica para o tamanho atual da equipe?

> [!question] Q-NF-002: CDN e otimização de assets
> Vercel já serve com CDN e cache imutável para /assets/. Suficiente ou considerar CloudFront?

> [!question] Q-NF-003: Backup do banco
> Supabase free tier tem backups automáticos? Política de recovery (RPO/RTO)?
