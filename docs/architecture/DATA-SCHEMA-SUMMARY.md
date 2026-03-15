# Tech Arauz — Data Schema Summary v0.2.4

**Status:** ✅ ATUALIZADO (2026-03-16)
**Versão do Projeto:** v0.2.4 (EPIC 11 — 100% Completo)
**Documentação Canônica:** `docs/architecture/data/schema.prisma`

---

## 📊 Visão Geral da Arquitetura de Dados

O Tech Arauz é um sistema 360° de gerenciamento de IT/Inovação/Projetos com suporte a **IA Orchestrada** e **Business Process Management (BPM)**.

### Stack de Dados
- **Database:** PostgreSQL (Supabase)
- **ORM de Documentação:** Prisma Schema Language (referência)
- **Segurança:** Row-Level Security (RLS) em 100% das tabelas
- **Tenant Model:** Multi-tenant com isolamento por tenant_id

---

## 🏗️ Camadas de Dados

### Camada 1: Core (13 tabelas)
Estrutura fundamental de tenants, usuários e integração com ERP.

| Modelo | Descrição | Padrão RLS |
|--------|-----------|-----------|
| `Tenant` | Organizações (clientes) | N/A (raiz) |
| `Profile` | Usuários e perfis | tenant_id |
| `Project` | Projetos Espaider | tenant_id |
| `ProjectSchedule` | Cronogramas | tenant_id |
| `ProjectDelivery` | Entregas | tenant_id |
| `ProjectRequirement` | Requisitos | tenant_id |
| `ProjectHistory` | Histórico de movimentações | tenant_id |
| `ProjectApprover` | Aprovadores | tenant_id |
| `ProjectBudget` | Orçamentos | tenant_id |
| `EspaiderApi` | Credenciais de integração | tenant_id |
| `SyncLog` | Log de sincronizações | tenant_id |
| `IntegrationLogEntry` | Detalhes de integrações | tenant_id |

**Características:**
- Sincronização bidirecional com Espaider (ERP legacy)
- Rastreamento completo de histórico de mudanças
- Auditoria de integrações com logs granulares

---

### Camada 2: IA Agents & LLM Catalog (30 tabelas)
Orquestração de agentes AI com multi-provider LLM.

#### Tabelas de Configuração
| Modelo | Descrição |
|--------|-----------|
| `Agent` | Definições de agentes AI |
| `AgentType` | Categorias/tipos de agentes |
| `AgentTemplate` | Templates reutilizáveis |
| `AgentVersion` | Versionamento de agentes |
| `AgentVariable` | Variáveis de configuração |

#### Tabelas de Execução
| Modelo | Descrição |
|--------|-----------|
| `AgentRun` | Execuções de agentes |
| `AgentSession` | Sessões de conversa |
| `AgentMessage` | Mensagens em sessões |
| `AgentRunStep` | Passos de execução detalhados |

#### Tabelas de Monitoring & Governance
| Modelo | Descrição |
|--------|-----------|
| `AgentBudget` | Limites de custo mensais |
| `AgentUsageDaily` | Métricas diárias de uso |
| `AgentDeployment` | Deployments por ambiente |
| `AgentFeedback` | Feedback de usuários |

#### Tabelas de LLM Management
| Modelo | Descrição |
|--------|-----------|
| `LmProvider` | Provedores (OpenAI, Anthropic, Google, Azure) |
| `LmModel` | Catálogo de modelos |
| `LmProviderAccount` | Contas com credenciais encriptadas |
| `ModelGovernanceReview` | Aprovações por modelo |
| `ModelCostMonitoring` | Tracking de custos por período |
| `ModelIncident` | Incidentes e outages |
| `ModelFallbackPolicy` | Fallback chains (ex.: GPT-4 → Sonnet → Haiku) |
| `ModelChangeLog` | Audit trail de mudanças em modelos |

#### Tabelas de Integração
| Modelo | Descrição |
|--------|-----------|
| `Tool` | Ferramentas disponíveis |
| `AgentToolBinding` | Agent ↔ Tool relationships |
| `ContextProvider` | Provedores de contexto (SQL, API, KB) |
| `AgentContextBinding` | Agent ↔ Context relationships |

**Características:**
- Multi-provider LLM com fallback policies
- Cost tracking e budgeting por agent/model
- Versionamento de configurações com rollback
- Feedback loop para melhorias contínuas

---

### Camada 3: Organizational Knowledge Graph — EPIC 10 (12 tabelas)
Modelagem de estrutura organizacional, recursos, processos e conhecimento.

#### Hierarquia Organizacional (5 níveis)
```
Organization (tenant)
├─ Areas (grandes domínios)
│  ├─ Nuclei (especializações)
│  │  ├─ Processes (fluxos operacionais)
│  │  │  ├─ Routines (conjuntos de atividades)
│  │  │  │  └─ Activities (unidades executáveis)
```

| Modelo | Descrição | Relações |
|--------|-----------|----------|
| `OrgArea` | Grandes domínios (ex.: Legal, Financeiro) | 1:N nuclei, 1:N processes |
| `OrgNucleus` | Especializações dentro de áreas | 1:N processes, 1:N routines |
| `OrgProcess` | Fluxos operacionais (ex.: Gestão de Contencioso) | 1:N routines, 1:N activities (via routines) |
| `OrgRoutine` | Conjuntos recorrentes de atividades | 1:N activities |
| `OrgActivity` | Unidades operacionais executadas | N:M systems (via OrgActivitySystem) |

#### Recursos & Sistemas (3 tabelas)
| Modelo | Descrição |
|--------|-----------|
| `OrgSystem` | Softwares utilizados (SAP, Salesforce, etc.) |
| `OrgSystemResource` | Funcionalidades específicas dentro de sistemas |
| `OrgActivitySystem` | **Junction:** Activity ↔ System mappings |

#### Suprimentos & Serviços (2 tabelas)
| Modelo | Descrição |
|--------|-----------|
| `OrgSupplier` | Empresas externas/correspondentes |
| `OrgService` | Serviços fornecidos internamente |

#### Documentação & Knowledge (2 tabelas)
| Modelo | Descrição |
|--------|-----------|
| `OrgDocument` | Procedures, POPs, policies |
| `OrgKnowledgeEntry` | Knowledge base com embeddings pgvector(1536) |

#### Bulk Operations (1 tabela)
| Modelo | Descrição |
|--------|-----------|
| `BulkOperationLog` | Audit trail de import/export operations |

**Características:**
- RLS 100% compliance (tenant_id isolation)
- JSONB fields para flexibilidade: responsible_roles, inputs, outputs, risks, impacts
- GIN indexes para busca rápida em JSONB
- Embeddings pgvector para AI context retrieval

---

### Camada 4: Organizational Enrichment — EPIC 11 (7 tabelas)
Extensões para SLAs, governança de roles, templates e versionamento.

#### SLAs & Metrics (2 tabelas)
| Modelo | Descrição | Padrão |
|--------|-----------|---------|
| `OrgProcessSla` | SLA definitions (target cycle time, quality %) | 1:N por processo |
| `OrgProcessMetric` | Métricas agregadas por período | Histórico de performance |

**Uso:** Dashboards de KPIs, anomaly alerts, compliance tracking

#### Governança de Roles (2 tabelas)
| Modelo | Descrição |
|--------|-----------|
| `OrgRoleDefinition` | 9 roles padrão: Diretor, Gerente, Especialista, Analista, Operacional, etc. |
| `OrgRolePermission` | RBAC matrix: role ↔ resource_type ↔ action ↔ scope |

**Uso:** Fine-grained access control, audit trail de permissões

#### Templating & Versioning (2 tabelas)
| Modelo | Descrição |
|--------|-----------|
| `OrgActivityTemplate` | Templates reutilizáveis para criar activities rapidamente |
| `OrgProcessVersion` | Audit trail imutável de mudanças em processes (append-only) |

**Uso:** Reusability, reproducibility, rollback capabilities

**Características:**
- Integração completa com EPIC 10 hierarchy
- Métricas para AI context engineering
- Version control para processos (snapshots imutáveis)
- 17 role types com granularidade de permissões

---

## 📈 Estatísticas de Schema

| Aspecto | Contagem |
|---------|----------|
| **Tabelas Totais** | 62 |
| Core | 12 |
| IA Agents & LLM | 30 |
| Organizational (EPIC 10) | 12 |
| Organizational (EPIC 11) | 7 |
| Enums | 2 |
| **Campos com Tenant RLS** | 62 (100%) |
| **JSONB Columns (flexibilidade)** | 22 |
| **GIN Indexes (busca rápida)** | 15+ |
| **Unique Constraints** | 40+ |

---

## 🔒 Segurança de Dados

### Row-Level Security (RLS)
- **100% de cobertura:** Todas as 62 tabelas protegidas
- **Padrão:** `tenant_id = auth.jwt()->>'tenant_id'`
- **Cascata:** ON DELETE CASCADE preserva integridade

### Encriptação
- `LmProviderAccount.apiKeyEncrypted` — Chaves de API encriptadas em repouso
- `OrgRolePermission.conditions` — Suporte para regras complexas (JSONB)

### Auditoria
- `ModelChangeLog` — Track de todas as mudanças em modelos
- `BulkOperationLog` — Audit trail de operações em massa
- `IntegrationLogEntry` — Log granular de integrações

---

## 🎯 Padrões de Acesso

### Busca por Tenant
```sql
SELECT * FROM org_activities WHERE tenant_id = $1;
```

### Busca Semântica (AI Context)
```sql
SELECT * FROM org_knowledge_entries
WHERE tenant_id = $1
ORDER BY embedding <-> $2 LIMIT 10;  -- pgvector similarity
```

### Aggregations (Dashboards)
```sql
SELECT process_id, metric_date, compliance_pct
FROM org_process_metrics
WHERE tenant_id = $1 AND metric_date >= NOW() - INTERVAL '30 days'
ORDER BY metric_date DESC;
```

### RBAC Lookups
```sql
SELECT * FROM org_role_permissions
WHERE tenant_id = $1 AND role_id = $2 AND resource_type = $3;
```

---

## 📚 Referências Relacionadas

| Documento | Escopo |
|-----------|--------|
| `ORGANIZATION-SCHEMA.md` | Detalhes completos de EPIC 10+11 |
| `AI-AGENT-ARCHITECTURE.md` | Design de agentes e LLM orchestration |
| `DATABASE-ARCHITECTURE.md` | Padrões de DB (RLS, migrations, scaling) |
| `.adrRegistry.md` | ADR-001 (RLS), ADR-002 (Token fallback), ADR-004 (Folder structure), ADR-005 (Org architecture) |

---

## 🚀 Próximas Evoluções

### Planejado para v0.3.x
- [ ] Sharding por tenant para escalabilidade horizontal
- [ ] Replicação read-only para analytics
- [ ] Materialized views para dashboards complexos
- [ ] Event streaming (Kafka) para audit trail em tempo real

### Considerações de Performance
- Índices em `tenant_id`, `created_at`, `updated_at` em todas as tabelas
- GIN indexes em JSONB para `responsible_roles`, `inputs/outputs`, `risks/impacts`
- Particionamento por `metric_date` para tabelas de séries temporais

---

**Documento Gerado:** 2026-03-16
**Versão:** v0.2.4 (EPIC 11 Completo)
**Status:** ✅ Sincronizado com schema.prisma

