---
doc-id: CLAUDE-V01-16
title: Riscos, Lacunas e Perguntas Abertas
scope: Consolidação de todos os riscos e perguntas identificados no docset
version: 0.1.0
status: draft
last-updated: 2026-02-05
confidence: Alta
depends-on: [todos os outros documentos]
---

# Riscos, Lacunas e Perguntas Abertas

> Este documento consolida TODOS os riscos (RISK-###) e perguntas abertas (Q-###) identificados no docset. Cada item referencia o doc de origem.

Relacionado: Todos os documentos do docset (referências cruzadas abaixo)

---

## Riscos

### RISK-001: Indisponibilidade da API Espaider
- **Probabilidade**: Média
- **Impacto**: Alto (dados não são atualizados)
- **Mitigação atual**: Retry 3x com backoff, circuit breaker, cache local (dados já importados permanecem)
- **Mitigação adicional**: Implementar AL-006 (alerta de 48h sem sync) — ver [[08-alerts-policies]]
- **Ref**: [[05-espaider-integration]], [[17-prd-seed]]

### RISK-002: Scope Creep
- **Probabilidade**: Alta
- **Impacto**: Médio (atraso no MVP)
- **Mitigação**: Backlog fechado, priorização MoSCoW, escopo excluído documentado
- **Ref**: [[17-prd-seed]]

### RISK-003: Falta de Testes Automatizados
- **Probabilidade**: Alta
- **Impacto**: Médio (regressões, bugs em produção)
- **Mitigação**: Vitest configurado, cobertura mínima existente, meta de 70%
- **Status**: Cobertura atual muito baixa
- **Ref**: [[17-prd-seed]], [[14-frontend-patterns]]

### RISK-004: Tokens em Plaintext
- **Probabilidade**: Baixa (acesso restrito via RLS)
- **Impacto**: Alto (exposição de credenciais)
- **Mitigação atual**: RLS restringe tabela `apis` a admin/service, view `apis_safe` mascara
- **Mitigação adicional**: pgcrypto ou Supabase Vault
- **Ref**: [[12-security-rbac]] Q-SEC-002, [[04-database-schema]] Q-DB-003

### RISK-005: Crescimento da Tabela de Logs
- **Probabilidade**: Média (com syncs frequentes)
- **Impacto**: Baixo (PostgreSQL lida bem, mas pode impactar queries)
- **Mitigação**: Implementar rotina de purge (R-013 proposta)
- **Ref**: [[09-routines-catalog]] Q-ROT-001, [[15-non-functional]]

### RISK-006: Race Condition em Sync Concorrente
- **Probabilidade**: Baixa (raro manual + cron coincidirem)
- **Impacto**: Baixo (UPSERT garante idempotência, mas logs podem duplicar)
- **Mitigação**: Advisory lock proposto
- **Ref**: [[13-jobs-scheduling]]

### RISK-007: Mudança na API Espaider
- **Probabilidade**: Baixa-Média
- **Impacto**: Alto (sync quebra)
- **Mitigação**: 135+ aliases cobrem variantes conhecidas, mas campos novos/renomeados podem falhar silenciosamente
- **Ref**: [[05-espaider-integration]] Q-ESP-002

### RISK-008: Supabase Free Tier Limits
- **Probabilidade**: Média (com crescimento)
- **Impacto**: Médio (degradação ou bloqueio)
- **Mitigação**: Volumetria estimada dentro dos limites para MVP
- **Ref**: [[03-architecture]] Q-ARCH-002

---

## Perguntas Abertas (Consolidado)

### Operacional

| ID | Pergunta | Origem | Responsável | Prioridade |
|---|---|---|---|---|
| **Q-001** | Frequência ideal de sincronização com Espaider? (diária, 12h, 4h?) | [[13-jobs-scheduling]] | CTO | Alta |
| **Q-002** | Mapear campos adicionais do Espaider para importação | [[05-espaider-integration]] | CTO/TI | Média |
| **Q-003** | Política de retenção de logs (TTL, purge) | [[15-non-functional]] | CTO | Média |

### Produto

| ID | Pergunta | Origem | Responsável | Prioridade |
|---|---|---|---|---|
| **Q-004** | Unificar `status` e `projetos_status` ou manter separados? | [[04-database-schema]] | Eng. Software | Média |
| **Q-005** | Criação manual de projetos (sem Espaider) é necessária? | [[10-flows]] | CTO | Média |
| **Q-006** | Implementar campo de satisfação (substituir hardcoded 4.5)? | [[07-dashboard-kpis]] | CTO | Baixa |
| **Q-007** | Priorização pós-MVP: agentes AI, multi-tenancy, ou exportação? | [[01-vision-scope]] | CTO | Média |

### Técnico

| ID | Pergunta | Origem | Responsável | Prioridade |
|---|---|---|---|---|
| **Q-008** | Meta de cobertura de testes: 70% é realista? Priorizar quais módulos? | [[17-prd-seed]] | Eng. Software | Média |
| **Q-009** | Habilitar TypeScript strict mode gradualmente? | [[03-architecture]] | Eng. Software | Baixa |
| **Q-010** | Implementar criptografia para `apis.token`? | [[12-security-rbac]] | Eng. Software | Média |

### Integração

| ID | Pergunta | Origem | Responsável | Prioridade |
|---|---|---|---|---|
| **Q-011** | Rate limiting da API Espaider existe? Quais os limites? | [[05-espaider-integration]] | TI Espaider | Alta |
| **Q-012** | Versionamento da API Espaider? Como lidar com breaking changes? | [[05-espaider-integration]] | TI Espaider | Média |
| **Q-013** | Write-back para Espaider será necessário no futuro? | [[05-espaider-integration]] | CTO | Baixa |

### Infraestrutura

| ID | Pergunta | Origem | Responsável | Prioridade |
|---|---|---|---|---|
| **Q-014** | Plano de upgrade do Supabase (free → Pro)? | [[03-architecture]] | CTO | Média |
| **Q-015** | Backup e recovery do banco (RPO/RTO)? | [[15-non-functional]] | CTO | Média |
| **Q-016** | APM/Error tracking (Sentry) justifica para equipe atual? | [[15-non-functional]] | CTO | Baixa |

---

## Lacunas Identificadas

| ID | Lacuna | Impacto | Doc origem |
|---|---|---|---|
| LAC-001 | Sem alertas ativos (email/Slack) | Problemas passam despercebidos fora do portal | [[08-alerts-policies]] |
| LAC-002 | Sem audit trail de mudanças | Não se sabe quem alterou o quê | [[12-security-rbac]] |
| LAC-003 | Sem purge de logs | Tabela cresce indefinidamente | [[15-non-functional]] |
| LAC-004 | KPI satisfação hardcoded (4.5) | Métrica sem valor real | [[07-dashboard-kpis]] |
| LAC-005 | Sem reconciliação de dados deletados | Dados removidos do Espaider ficam no portal | [[09-routines-catalog]] |
| LAC-006 | Sem lock de concorrência em sync | Race condition possível | [[13-jobs-scheduling]] |
| LAC-007 | Entidades duplicadas (entregas vs entregas_projeto) | Complexidade desnecessária? | [[11-domain-entities-events]] |
| LAC-008 | Sem política de senhas | Segurança básica de auth | [[12-security-rbac]] |

---

## Tabela Mestre de Perguntas (Todas do Docset)

> Consolidação de TODAS as ~40 perguntas identificadas nos documentos, para priorização em sessão com o CTO.

| ID | Pergunta | Doc Origem | Tipo | Prioridade |
| --- | --- | --- | --- | --- |
| Q-VIS-001 | Priorização pós-MVP: agentes AI, multi-tenancy, ou exportação? | [[01-vision-scope]] | Negócio | Média |
| Q-VIS-002 | Pontos de extensão para agentes lawtech no MVP? | [[01-vision-scope]] | Técnico | Baixa |
| Q-GLOSS-001 | Unificação de termos Solicitação vs Projeto no Espaider | [[02-glossary]] | Negócio | Média |
| Q-ARCH-001 | Habilitar TypeScript strict mode gradualmente? | [[03-architecture]] | Técnico | Baixa |
| Q-ARCH-002 | Plano de upgrade Supabase free → Pro? | [[03-architecture]] | Infra | Média |
| Q-DB-001 | Unificar `status` e `projetos_status` ou manter separados? | [[04-database-schema]] | Técnico | Média |
| Q-ESP-001 | Frequência ideal de sincronização? (diária, 12h, 4h?) | [[05-espaider-integration]] | Negócio | Alta |
| Q-ESP-002 | Como lidar com mudanças/versionamento da API Espaider? | [[05-espaider-integration]] | Técnico | Média |
| Q-ESP-003 | Rate limiting da API Espaider existe? Quais limites? | [[05-espaider-integration]] | Integração | Alta |
| Q-ESP-004 | Mapear campos adicionais do Espaider para importação? | [[05-espaider-integration]] | Negócio | Média |
| Q-KPI-001 | KPI-006 vs KPI-008 usam campos diferentes — intencional? | [[07-dashboard-kpis]] | Negócio | Alta |
| Q-KPI-002 | Performance de queries N+1 no dashboard — otimizar? | [[07-dashboard-kpis]] | Técnico | Média |
| Q-KPI-003 | Thresholds de alerta devem ser configuráveis? | [[07-dashboard-kpis]] | Negócio | Média |
| Q-KPI-004 | Unificar base de cálculo de tempo de resolução? | [[07-dashboard-kpis]] | Negócio | Alta |
| Q-AL-001 | Thresholds configuráveis via tabela? | [[08-alerts-policies]] | Negócio | Média |
| Q-AL-002 | Prioridade de implementação email/Slack? | [[08-alerts-policies]] | Negócio | Baixa |
| Q-AL-003 | Usar Supabase Realtime para push de alertas? | [[08-alerts-policies]] | Técnico | Baixa |
| Q-ROT-001 | Política de purge de logs antigos? | [[09-routines-catalog]] | Negócio | Média |
| Q-ROT-002 | Circuit breaker está sendo usado na sync? | [[09-routines-catalog]] | Técnico | Baixa |
| Q-ROT-003 | Reconciliação de dados deletados no Espaider? | [[09-routines-catalog]] | Negócio | Média |
| Q-ROT-004 | Soft-delete de projetos removidos do Espaider? | [[09-routines-catalog]] | Negócio | Média |
| Q-FL-001 | Criação manual de projetos é necessária? | [[10-flows]] | Negócio | Média |
| Q-FL-002 | Validação de API antes de ativação obrigatória? | [[10-flows]] | Negócio | Média |
| Q-ENT-001 | Implementar event bus formal? | [[11-domain-entities-events]] | Técnico | Baixa |
| Q-ENT-002 | Audit trail de mudanças em projetos? | [[11-domain-entities-events]] | Negócio | Média |
| Q-ENT-003 | Unificar entidades duplicadas (entregas vs entregas_projeto)? | [[11-domain-entities-events]] | Técnico | Média |
| Q-ENT-004 | Transições de estado devem ser validadas (máquina de estados)? | [[11-domain-entities-events]] | Negócio | Média |
| Q-SEC-001 | Audit trail formal com trigger genérico? | [[12-security-rbac]] | Técnico | Média |
| Q-SEC-002 | Criptografia de tokens (pgcrypto/Vault)? | [[12-security-rbac]] | Técnico | Média |
| Q-SEC-003 | Executar RLS coverage audit? | [[12-security-rbac]] | Técnico | Alta |
| Q-SEC-004 | Ativar política de senhas no Supabase Auth? | [[12-security-rbac]] | Técnico | Baixa |
| Q-JOB-001 | Frequência de sync definida? | [[13-jobs-scheduling]] | Negócio | Alta |
| Q-JOB-002 | Advisory lock para sync concorrente? | [[13-jobs-scheduling]] | Técnico | Baixa |
| Q-FE-001 | State management global necessário (Zustand)? | [[14-frontend-patterns]] | Técnico | Baixa |
| Q-FE-002 | Internacionalização (i18n) futura? | [[14-frontend-patterns]] | Negócio | Baixa |
| Q-NF-001 | APM/Error tracking (Sentry) justifica? | [[15-non-functional]] | Infra | Baixa |
| Q-NF-002 | CDN adicional além do Vercel? | [[15-non-functional]] | Infra | Baixa |
| Q-NF-003 | Política de backup RPO/RTO? | [[15-non-functional]] | Infra | Média |
| Q-PRD-001 | Frequência de sync para o negócio? | [[17-prd-seed]] | Negócio | Alta |
| Q-PRD-002 | Campos adicionais do Espaider? | [[17-prd-seed]] | Negócio | Média |
| Q-PRD-003 | Política de retenção de logs? | [[17-prd-seed]] | Negócio | Média |
| Q-PRD-004 | Meta de 70% testes é realista? Priorizar quais módulos? | [[17-prd-seed]] | Técnico | Média |
| Q-ROAD-001 | Deadline do MVP (M2, M3)? | [[18-roadmap-wbs]] | Negócio | Alta |
| Q-ROAD-002 | Critério de go-live? | [[18-roadmap-wbs]] | Negócio | Alta |
| Q-ROAD-003 | Ambiente de staging separado? | [[18-roadmap-wbs]] | Infra | Média |
| Q-DELTA-001 | Prioridade: QueryParam auth ou status duplicado? | [[19-delta-recommendations]] | Técnico | Média |
| Q-DELTA-002 | Timeline para strict mode? | [[19-delta-recommendations]] | Técnico | Baixa |

### Resumo por Tipo

| Tipo | Quantidade | Prioridade Alta |
| --- | --- | --- |
| Negócio | 23 | 6 |
| Técnico | 18 | 2 |
| Infra | 5 | 0 |
| Integração | 1 | 1 |
| **Total** | **47** | **9** |

---

## Próximos Passos Recomendados

1. **Workshop de alinhamento**: Responder Q-001 a Q-007 com o CTO
2. **Amostras de payloads reais**: Capturar exemplos de resposta da API Espaider para validar mapeamentos
3. **Revisão de KPIs**: Confirmar que os 16 KPIs documentados cobrem as necessidades de gestão
4. **Teste de throttling**: Verificar limites de taxa da API Espaider (Q-011)
5. **RLS audit**: Executar `scripts/audit-rls.ts` para validar cobertura
6. **Definir política de retenção** (Q-003) e implementar R-013 (purge)
