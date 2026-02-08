---
doc-id: CLAUDE-V01-19
title: Recomendações e Delta Proto→Produto
scope: O que manter, descartar e revisar na transição do protótipo para produto
version: 0.1.0
status: draft
last-updated: 2026-02-05
confidence: Média
depends-on: [03-architecture, 16-risks-gaps, 17-prd-seed]
---

# Recomendações e Delta Proto→Produto

Relacionado: [[03-architecture]] (decisões técnicas), [[16-risks-gaps]] (riscos), [[17-prd-seed]] (escopo), [[18-roadmap-wbs]] (roadmap)

---

## MANTER (Boas decisões do protótipo)

### Feature-based folder structure
- **Por quê**: Boa coesão, cada módulo é autocontido, fácil de navegar
- **Ref**: [[14-frontend-patterns]]

### Supabase como backend
- **Por quê**: PostgreSQL + Auth + RLS + Edge Functions + Realtime em um serviço
- **Benefício**: Custo previsível, serverless, sem gerenciar infra
- **Atenção**: Monitorar limites do free tier — ver [[16-risks-gaps]] RISK-008

### TanStack Query para server state
- **Por quê**: Cache inteligente, staleTime, invalidation cascade, devtools
- **Benefício**: Reduz complexidade de state management
- **Padrão**: Query keys factory está bem implementada

### Shadcn/ui + Tailwind
- **Por quê**: Componentes acessíveis (Radix), customizáveis, design system consistente
- **Benefício**: DX excelente, facilidade de manutenção

### Sync pipeline com aliases e retry
- **Por quê**: A API Espaider tem campos com nomes variantes; aliases cobrem isso
- **Benefício**: Resiliência contra variações na API
- **Atenção**: Documentar aliases novos conforme descobertos

### RLS para segurança
- **Por quê**: Segurança at-database-level, independente do frontend
- **Benefício**: Mesmo que o frontend tenha bug, dados ficam protegidos
- **Ref**: [[12-security-rbac]]

### UPSERT com deduplicação
- **Por quê**: Garante idempotência nas sincronizações
- **Benefício**: Pode executar sync múltiplas vezes sem efeitos colaterais

---

## DESCARTAR (Decisões a revisar/remover)

### QueryParam authentication (prioritário)
- **Problema**: Autenticação via `?Token=xxx` na URL expõe o token em logs de servidor, histórico do browser e proxies
- **Recomendação**: Migrar todas as APIs para Bearer token ou ApiKey header
- **Impacto**: Alterar configuração de APIs existentes que usam QueryParam
- **Ref**: [[05-espaider-integration]], [[12-security-rbac]]

### Status duplicado em projetos
- **Problema**: Campo `status_projeto` (texto) E `projetos_status` (tabela com FK) coexistem
- **Recomendação**: Usar apenas a FK `status_id` via `projetos_status` e deprecar `status_projeto` textual
- **Impacto**: Alterar sync para só usar lookup; migrar dados existentes
- **Ref**: [[04-database-schema]] Q-DB-001

### noImplicitAny: false
- **Problema**: TypeScript em modo permissivo permite `any` implícito, reduzindo type safety
- **Recomendação**: Habilitar gradualmente, módulo por módulo
- **Impacto**: Algumas correções de tipos necessárias
- **Ref**: [[03-architecture]] Q-ARCH-001

---

## REVISAR (Avaliar antes de decidir)

### RLS coverage
- **Questão**: Todas as tabelas têm políticas RLS ativas?
- **Ação**: Executar `scripts/audit-rls.ts`
- **Risco**: Tabelas sem RLS são acessíveis por qualquer authenticated user
- **Ref**: [[12-security-rbac]] Q-SEC-003

### Entidades duplicadas (entregas vs entregas_projeto)
- **Questão**: Entregas, Cronogramas e Requisitos existem em 2 variantes (filhas de solicitações e filhas de projetos)
- **Opções**:
  1. Unificar com campo discriminador (`parent_type: 'projeto' | 'solicitacao'`)
  2. Manter separadas (domínios diferentes)
- **Impacto de unificação**: Migrações, queries, hooks, componentes afetados
- **Ref**: [[11-domain-entities-events]] Q-ENT-003

### Log retention
- **Questão**: Sem política de retenção para logs_execucao
- **Opções**:
  1. TTL com pg_cron (delete WHERE iniciado_em < NOW() - '90 days')
  2. Particionamento por mês
  3. Mover logs antigos para cold storage
- **Ref**: [[15-non-functional]], [[16-risks-gaps]] Q-003

### Alert channels
- **Questão**: Alertas são apenas visuais (toast + badge). Suficiente?
- **Opções**:
  1. Manter visual-only para MVP
  2. Adicionar email via Supabase Edge Function + Resend/SendGrid
  3. Adicionar Slack webhook
- **Ref**: [[08-alerts-policies]] Q-AL-002

### Test coverage
- **Questão**: Meta de 70% definida no brief, cobertura atual é mínima
- **Opções**:
  1. Priorizar testes de integração (hooks de dashboard, sync pipeline)
  2. Priorizar testes de componentes (Kanban, formulários)
  3. Priorizar testes E2E (fluxos críticos F-001, F-006)
- **Ref**: [[17-prd-seed]] Q-PRD-004

### Performance de queries N+1
- **Questão**: Hooks de dashboard fazem múltiplas queries individuais
- **Opções**:
  1. Criar RPC (stored procedures) no Supabase para queries agregadas
  2. Criar views materialized para KPIs
  3. Aceitar como está (volume baixo, staleTime mitiga)
- **Ref**: [[07-dashboard-kpis]] Q-KPI-002

---

## Recomendações de Alto Nível

### 1. Boundaries de domínio
Definir claramente o que é "Projeto" vs "Solicitação" no contexto do portal. Atualmente coexistem como entidades separadas com filhos similares. Ver [[02-glossary]] Q-GLOSS-001.

### 2. Observabilidade
Adicionar error tracking (Sentry) e APM antes de escalar o número de usuários. O custo é baixo e o benefício em debugging é alto. Ver [[15-non-functional]] Q-NF-001.

### 3. Event-driven future
Preparar para event-driven architecture:
- Supabase Realtime para push de atualizações
- Database triggers para audit trail
- Webhooks para integração com Slack/Teams

### 4. Automação de testes
Configurar CI/CD com Vitest no GitHub Actions. Bloquear merge se testes falharem. Ver [[18-roadmap-wbs]].

### 5. Documentação viva
Manter este docset atualizado conforme o sistema evolui. Usar [[00-INDEX]] como ponto de entrada para qualquer sessão de desenvolvimento.

---

## Decisões Pendentes

> [!question] Q-DELTA-001: Prioridade de ações de descartar
> QueryParam auth e status duplicado — qual resolver primeiro?

> [!question] Q-DELTA-002: Timeline para strict mode
> Habilitar noImplicitAny no MVP ou deixar para pós-MVP?
