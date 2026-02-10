# Tech Arauz - Context Master

> **Ponto de entrada único para definição do projeto**
> Última atualização: 2026-02-08

---

## O que é este projeto?

**Portal Tech Arauz** é um SaaS de gestão de TI que combina:

1. **Gestão 360° de Projetos** — Centraliza dados do ERP Espaider
2. **Gestão de Agentes AI** — Documenta e visualiza workflows (LangSmith/LangChain/LangGraph)

**Tenant**: `arauz` (single-tenant, preparado para multi-tenant)
**Owner**: Gabriel Cristofolini (CTO)

---

## Estrutura de Contexto

```
.context/
├── 00-MASTER.md              ← Você está aqui
├── IMPLEMENTATIONS.md        # O que já foi implementado
├── DEVELOPMENT_ROADMAP.md    # Guia de desenvolvimento
├── 01-foundation/            # CAMADA 0: Visão e vocabulário
│   ├── vision.md             # Visão do produto (2 módulos)
│   └── glossary.md           # Termos do domínio + AI
├── 02-rules/                 # CAMADA 1: Regras de negócio
│   ├── business-rules.md     # Regras do sistema (BR-001 a BR-202)
│   ├── requirements.md       # Requisitos funcionais (RF-001 a RF-202)
│   └── routines.md           # Rotinas e processos (RT-001 a RT-202)
├── 03-specs/                 # CAMADA 2: Especificações
│   ├── adr/                  # ADRs (decisões de arquitetura)
│   ├── tokens_brand.json     # Design tokens
│   ├── component-patterns.md # Padrões de componentes
│   └── backlog_mvp.json      # Backlog MVP
└── _memory/                  # Histórico de planejamento
```

---

## 🗺️ Navegação por Camada

### CAMADA 0 - Fundação

| Documento | Conteúdo |
|-----------|----------|
| [vision.md](./01-foundation/vision.md) | Problema, valor, personas, escopo MVP (2 módulos) |
| [glossary.md](./01-foundation/glossary.md) | Termos: Negócio, Espaider, Agentes AI, Técnicos |

### CAMADA 1 - Regras de Negócio

| Documento | Conteúdo |
|-----------|----------|
| [business-rules.md](./02-rules/business-rules.md) | Regras de Projetos (BR-001-006) + Agentes (BR-101-104) + Infra (BR-201-202) |
| [requirements.md](./02-rules/requirements.md) | Requisitos: Projetos (RF-001-013) + Agentes (RF-101-108) + Infra (RF-201-202) |
| [routines.md](./02-rules/routines.md) | Rotinas: Projetos (RT-001-003) + Agentes (RT-101-103) + Infra (RT-201-202) |

### CAMADA 2 - Especificações

| Documento | Conteúdo |
|-----------|----------|
| [ADR-001](./03-specs/adr/2026-02-ADR-001-stack-tecnica.md) | Stack técnica: Next.js + Supabase + Python/FastAPI |
| [ADR-002](./03-specs/adr/2026-02-ADR-002-auth-espaider.md) | Auth Espaider: Token/Key, retry, circuit breaker |
| [ADR-003](./03-specs/adr/2026-02-ADR-003-design-system.md) | Design System e UX/UI baseado no protótipo de referência |
| [backlog_mvp.json](./03-specs/backlog_mvp.json) | 2 sprints, 10 stories, 52 story points |
| [tokens_brand.json](./03-specs/tokens_brand.json) | Design tokens HSL (cores, tipografia, sombras) |
| [component-patterns.md](./03-specs/component-patterns.md) | Catálogo de componentes UX/UI |

### Configurações

| Arquivo | Conteúdo |
|---------|----------|
| [project.yaml](../configs/project.yaml) | Config centralizada: SLOs, budget, integrações, LGPD |

---

## ⚡ Regra de Ouro

1. **Sempre leia este arquivo primeiro**
2. **Navegue para a camada relevante** via links acima
3. **Foco em regras de negócio** — decisões técnicas serão definidas depois
4. **Não assuma** — se algo não está documentado, pergunte

---

## Inventário de Documentos

| Camada | Documentos | Status |
|--------|------------|--------|
| 0 - Fundação | 2 | Completo |
| 1 - Regras | 3 | Completo |
| 2 - Specs | 5 | Completo (3 ADRs + tokens + padrões) |

**Total de artefatos de negócio documentados:**

### Módulo 1: Gestão de Projetos
- 6 Regras de Negócio (BR-001 a BR-006)
- 13 Requisitos Funcionais (RF-001 a RF-013)
- 3 Rotinas de Processo (RT-001 a RT-003)

### Módulo 2: Gestão de Agentes AI
- 4 Regras de Negócio (BR-101 a BR-104)
- 8 Requisitos Funcionais (RF-101 a RF-108)
- 3 Rotinas de Processo (RT-101 a RT-103)

### Infraestrutura
- 2 Regras de Negócio (BR-201 a BR-202)
- 2 Requisitos Funcionais (RF-201 a RF-202)
- 2 Rotinas de Processo (RT-201 a RT-202)

---

## Priorização do MVP

| Fase | Módulo | Prioridade |
|------|--------|------------|
| 1 | Gestão de Projetos (Espaider) | Alta |
| 2 | Gestão de Agentes AI (LangSmith) | Média |

---

## Documentos Operacionais

| Documento | Propósito | Quando Usar |
|-----------|-----------|-------------|
| [IMPLEMENTATIONS.md](./IMPLEMENTATIONS.md) | Status do que foi implementado | Para entender o estado atual |
| [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) | Guia de desenvolvimento | Para implementar novas features |
| [docs/observability.md](../docs/observability.md) | Tracing, custos, budgets, logs AI | Para configurar/operar observabilidade do servico AI |

---

## Design System

O Design System do Tech Arauz é baseado no protótipo de referência em `docs/prototipo-referencia/`, documentado no [ADR-003](./03-specs/adr/2026-02-ADR-003-design-system.md).

### Componentes Principais

| Componente | Propósito | Localização |
|------------|-----------|-------------|
| AppSidebar | Navegação lateral colapsável | `src/components/layout/` |
| DashboardHeader | Header de página + dark mode | `src/components/layout/` |
| KPICard | Cards de métricas | `src/components/dashboard/` |
| SplitView | Visão 360° lateral | `src/components/views/` |
| KanbanBoard | Board drag-and-drop | `src/components/views/` |
| ViewToggle | Toggle Kanban/Lista | `src/components/views/` |

### Tokens de Design

- **Arquivo**: `tokens_brand.json`
- **Padrão**: CSS Variables HSL
- **Temas**: Light + Dark
- **Fontes**: Inter (corpo), DM Sans (display)

### Dependências de UI

```json
{
  "@dnd-kit/core": "^6.x",
  "@dnd-kit/sortable": "^8.x",
  "recharts": "^2.x",
  "sonner": "^1.x"
}
```

Para detalhes completos, veja [component-patterns.md](./03-specs/component-patterns.md).
