---
doc-id: CLAUDE-V01-18
title: Roadmap e WBS
scope: Fases do projeto, marcos, work breakdown structure
version: 0.1.0
status: draft
last-updated: 2026-02-05
confidence: Média
depends-on: [17-prd-seed, 01-vision-scope]
---

# Roadmap e WBS

> Fonte: `[ref: docs/brief/brief_atual.md]` (seção 9)

Relacionado: [[17-prd-seed]] (requisitos), [[01-vision-scope]] (escopo), [[16-risks-gaps]] (riscos que podem afetar o roadmap)

---

## Fases do Projeto

| Fase | Status | Entregáveis |
|---|---|---|
| **Discovery** | Concluída (2026-01-18) | Brief aprovado, backlog inicial |
| **Phase 1: Foundation** | Concluída (2026-01-18) | Estrutura do projeto, config, auth |
| **Phase 2: Core Features** | Concluída (2026-01-18) | Componentes base, layout, navegação |
| **Phase 3: Database & Types** | Concluída (2026-01-19) | Migrações, types gerados, RLS |
| **Phase 4: Migração de Páginas** | Concluída (2026-01-19) | 7 páginas migradas de mock para Supabase |
| **Phase 5: Edge Functions** | Concluída (2026-01-19) | sync-espaider, test-api, sync-solicitacoes |
| **Phase 5.1: pg_cron** | Concluída (2026-01-19) | Agendamento de jobs |
| **Phase 5.2: QA & Polish** | Concluída (2026-01-20) | Testes básicos, polish de UI |
| **Phase 6: Launch** | **Pendente** | Deploy em staging, validação, go-live |

---

## Marcos

| Marco | Descrição | Status | Data |
|---|---|---|---|
| **M0** | Protótipo Lovable concluído (referência) | Concluído | 2026-01-18 |
| **M1** | Brief e backlog aprovados | Concluído | 2026-01-18 |
| **M1.5** | Foundation + Core Features | Concluído | 2026-01-18 |
| **M2** | MVP funcional em staging | **Pendente** | — |
| **M3** | Go-live para equipe de TI | **Pendente** | — |

---

## WBS — Phase 6: Launch (Pendente)

### 6.1 Preparação
- [ ] Validar todas as rotas funcionando
- [ ] Verificar RLS coverage (executar `scripts/audit-rls.ts`) — ver [[12-security-rbac]] Q-SEC-003
- [ ] Revisar variáveis de ambiente para produção
- [ ] Configurar domínio customizado no Vercel (se aplicável)

### 6.2 Dados
- [ ] Executar sync inicial com dados reais do Espaider
- [ ] Validar mapeamento de campos — ver [[05-espaider-integration]]
- [ ] Verificar status normalization com dados reais
- [ ] Ativar pelo menos 1 job de sync automático — ver [[13-jobs-scheduling]]

### 6.3 Testes
- [ ] Testar login com usuários reais (@arauz.com.br)
- [ ] Testar RBAC: admin vs user vs viewer
- [ ] Testar sync manual e verificar dados no portal
- [ ] Testar dashboards com dados reais (KPIs fazem sentido?)
- [ ] Testar responsividade mobile
- [ ] Executar testes automatizados (`npm run test`)

### 6.4 Deploy
- [ ] Build de produção (`npm run build`)
- [ ] Deploy para staging (Vercel preview)
- [ ] Validação pelo CTO
- [ ] Deploy para produção
- [ ] Monitorar primeiras 24h

### 6.5 Onboarding
- [ ] Criar contas para equipe TI
- [ ] Atribuir roles (admin para CTO, user para equipe)
- [ ] Documentar acesso e funcionalidades básicas
- [ ] Sessão de apresentação para equipe

### 6.6 Migração de Dados

- [ ] Executar primeiro sync completo com dados reais do Espaider (todas as APIs)
- [ ] Validar integridade: contagem de registros Espaider vs Portal (projetos, solicitações, filhos)
- [ ] Reconciliar campos e status: verificar que normalização produziu resultados corretos
- [ ] Validar KPIs com dados reais (valores fazem sentido para o negócio?)
- [ ] Verificar filhos órfãos no log e resolver manualmente
- [ ] Sign-off do CTO antes de go-live

---

## WBS — Pós-MVP (Proposto)

### Beta
- [ ] Coleta de feedback da equipe TI
- [ ] Ajustes de UX baseados no uso real
- [ ] Implementar alertas visuais com thresholds (RF-15) — ver [[08-alerts-policies]]
- [ ] Aumentar cobertura de testes para 40%+
- [ ] Implementar purge de logs (R-013)

### v1.1
- [ ] Alertas por email (AL-005, AL-006) — ver [[08-alerts-policies]]
- [ ] Drag-and-drop completo no Kanban (RF-14)
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Implementar satisfação real (substituir hardcoded 4.5)

### v2.0
- [ ] Agentes AI (lawtech, pesquisa)
- [ ] Multi-tenancy
- [ ] Write-back para Espaider
- [ ] Dashboard customizável por usuário

---

## Entregáveis Já Concluídos (Referência)

> Documentação do que foi entregue em cada phase, para rastreabilidade.

- **Phase 1-2**: Estrutura feature-based, auth, layout, shadcn/ui, componentes reutilizáveis
- **Phase 3**: 11 migrações SQL, types gerados, RLS policies
- **Phase 4**: Dashboard Geral/Gestão/Tecnologia, Tarefas, Logs, Docs, Automações, Tabelas Aux.
- **Phase 5**: Edge Functions (sync-espaider, test-api, sync-solicitacoes, create-user)
- **Phase 5.1**: pg_cron, tarefas_sincronizacao
- **Phase 5.2**: Testes com Vitest, polish de UI, projetos com Kanban

[ref: docs/brief/brief_atual.md:235-254]

---

## Decisões Pendentes

> [!question] Q-ROAD-001: Deadline do MVP
> Brief diz "Sem prazo definido (priorização por valor)". Definir data-alvo para M2 (staging) e M3 (go-live)?

> [!question] Q-ROAD-002: Critério de go-live
> Quais requisitos Must devem estar 100% validados para go-live? Testes de 70% cobertura são blocker?

> [!question] Q-ROAD-003: Ambiente de staging
> Existe ambiente de staging separado ou go-live direto em produção?
