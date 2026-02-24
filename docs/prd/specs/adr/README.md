# Arquitetura - Decisões (ADRs)

> **Camada**: 2 - Especificações
> **Última atualização**: 2026-02-20

## Propósito

Este diretório contém as **Decisões Arquiteturais Registradas (ADRs)** que definem escolhas técnicas estratégicas do Tech Arauz. ADRs documentam o contexto, a decisão tomada e as consequências de cada escolha importante.

---

## ADRs Foundation (Decisões Iniciais)

ADRs originais definidos durante o planejamento MVP (2026-02-07 a 2026-02-08).

### 1. [ADR-001: Stack Tecnológica](./2026-02-ADR-001-stack-tecnica.md)

**Status**: ✅ Confirmado
**Data**: 2026-02-07

Define a stack de tecnologia do projeto:
- **Backend**: Supabase (PostgreSQL + RLS + Auth)
- **Frontend**: Next.js 14 + TypeScript + Shadcn/ui
- **State Management**: TanStack Query
- **Deploy**: Vercel
- **ERP**: Espaider (WCF API, unidirecional)

---

### 2. [ADR-002: Autenticação e Integração Espaider](./2026-02-ADR-002-auth-espaider.md)

**Status**: ✅ Confirmado
**Data**: 2026-02-07

Define como conectar ao Espaider:
- **API**: `BI_SOLICITACOES_SUPORTEESPAIDER`
- **Autenticação**: Querystring com `Token` + `Key`
- **Formato**: JSON via converter
- **Pattern**: Fluxo hierárquico via `ListaURLFilhos` e `IDREGISTROPAI`

---

### 3. [ADR-003: Design System e UX/UI](./2026-02-ADR-003-design-system.md)

**Status**: ✅ Confirmado
**Data**: 2026-02-08

Define padrões visuais e de UX:
- **Design System**: shadcn/ui + Tailwind CSS
- **Componentes**: AppSidebar, SplitView, KanbanBoard, Charts
- **Padrões**: Master-detail, Visão 360°, Dual view (Kanban/Lista)
- **Dark Mode**: Suporte completo via CSS variables
- **Fontes**: Inter + DM Sans

---

## ADRs Runtime (Padrões de Implementação)

ADRs adicionais descobertos/documentados durante implementação (2026-02-10 a 2026-02-20).

> 📍 **Localização**: [`.ai/` directory](../../.ai/)
> 📋 **Índice completo**: [`.ai/decision-logs-index.md`](../../.ai/decision-logs-index.md)

| ADR | Título | Escopo | Status |
|---|---|---|---|
| [ADR-001](../../.ai/ADR-001-rls-all-tables.md) | RLS em Todas as Tabelas | Supabase Security Pattern | ✅ Aplicado |
| [ADR-002](../../.ai/ADR-002-token-fallback.md) | Token Fallback para Env Vars | Espaider Credentials Management | ✅ Aplicado |
| [ADR-003](../../.ai/ADR-003-upsert-pattern.md) | UPSERT Pattern via (tenant_id, espaider_id) | Sync Idempotência | ✅ Aplicado |
| [ADR-004](../../.ai/ADR-004-uuid-pk-pattern.md) | UUID Primary Key Pattern | Database Design | ✅ Aplicado |

---

## Navegação

### Por Categoria

**Infraestrutura & Backend**
- [ADR-001: Stack Tecnológica](./2026-02-ADR-001-stack-tecnica.md)
- [ADR-002: Autenticação Espaider](./2026-02-ADR-002-auth-espaider.md)
- [`.ai/ADR-001`: RLS Policies](../../.ai/ADR-001-rls-all-tables.md)
- [`.ai/ADR-003`: UPSERT Pattern](../../.ai/ADR-003-upsert-pattern.md)
- [`.ai/ADR-004`: UUID PK Pattern](../../.ai/ADR-004-uuid-pk-pattern.md)

**Frontend & UX**
- [ADR-003: Design System](./2026-02-ADR-003-design-system.md)

**Segurança & Credenciais**
- [`.ai/ADR-002`: Token Fallback](../../.ai/ADR-002-token-fallback.md)

---

## Referências Cruzadas

### De `.context/03-specs/adr/` para `.ai/`

**ADR-001 (Stack)** menciona:
- Supabase + PostgreSQL → implementado com padrões em `.ai/ADR-001` (RLS), `.ai/ADR-003` (UPSERT), `.ai/ADR-004` (UUID)

**ADR-002 (Espaider)** menciona:
- Credenciais (Token+Key) → detalhado em `.ai/ADR-002` (Token Fallback)

**ADR-003 (Design System)** é independente:
- Referência: `docs/prototipo-referencia/` para componentes

### De `.ai/` para `.context/03-specs/adr/`

**`.ai/ADR-001` (RLS)** implementa:
- Decisão de segurança em `ADR-001: Stack Tecnológica` (Supabase)

**`.ai/ADR-002` (Token Fallback)** implementa:
- Padrão de autenticação em `ADR-002: Autenticação Espaider`

**`.ai/ADR-003` (UPSERT)** suporta:
- Sincronização unidirecional mencionada em `ADR-002: Autenticação Espaider`

---

## Rastreabilidade

| ADR | RF Relacionado | Implementação |
|---|---|---|
| ADR-001 Stack | RF-002, RF-003 | Migrations 001-020 |
| ADR-002 Espaider | RF-002, RF-003 | `src/integrations/espaider/` |
| ADR-003 Design | RF-004, RF-009 | `src/components/`, `globals.css` |
| `.ai/ADR-001` RLS | RF-007 (RBAC) | Policies em todas as tabelas |
| `.ai/ADR-002` Token | RF-002 (Espaider Config) | `espaider-sync.ts` |
| `.ai/ADR-003` UPSERT | RF-002, RF-003 (Sync) | Unique constraints em todas as child tables |
| `.ai/ADR-004` UUID | RF-006 (Tabelas) | Schema: `id UUID PRIMARY KEY` |

---

## Template para Novos ADRs

Ao criar novas ADRs, use o template em `.ai/` como referência:

```markdown
# ADR-XXX: [Título]

**Status**: Proposed | Accepted | Deprecated | Superseded by ADR-YYY
**Data**: YYYY-MM-DD
**Autores**: [Nomes]

## Problema
...

## Decisão
...

## Consequências
...

## Alternativas Consideradas
...
```

---

## Histórico

| Data | Evento |
|---|---|
| 2026-02-07 | Criados ADR-001, ADR-002 |
| 2026-02-08 | Criado ADR-003 (Design System) |
| 2026-02-10 a 2026-02-20 | Descobertos e documentados 4 ADRs em `.ai/` |
| 2026-02-20 | Criado README.md para unificar os dois sistemas de ADR |

---

## Contribuição

Ao contribuir para o Tech Arauz:

1. **Leia os ADRs** antes de implementar features importantes
2. **Respeite as decisões** já tomadas (especialmente RLS, UPSERT, UUID patterns)
3. **Crie nova ADR** se quiser mudar uma decisão existente
4. **Documente decisões** novas em `.ai/` durante implementação
5. **Cross-reference** entre `.context/` e `.ai/` quando relevante
