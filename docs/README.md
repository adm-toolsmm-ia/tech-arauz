# Tech Arauz — Documentação

Bem-vindo à documentação do **Tech Arauz**, um portal de gestão 360° para TI, Inovação e Projetos.

---

## 📋 Índice de Conteúdo

### 🏗️ [Architecture](./architecture/)
Decisões arquiteturais, ADRs (Architectural Decision Records), padrões técnicos e documentação de sistemas.

- `system-architecture.md` — Arquitetura geral do sistema (AIOX FASE 1)
- `module-standards.md` — Padrões obrigatórios para novos módulos e páginas
- `dashboards.md` — Documentação de dashboards e KPIs
- `adr/` — Architectural Decision Records (ADR-001 a ADR-008)

### 🎨 [Frontend](./frontend/)
Especificações de UI/UX, design system, componentes e padrões visuais (AIOX FASE 3).

- `frontend-spec.md` — Especificação completa do frontend

### 📚 [Stories](./stories/)
Histórias de desenvolvimento (stories) organizadas por épico.

- `story-1.*.md` — Foundation, Hardening, Observability
- `story-2.*.md` — Design System, Components, Data Layer, etc.
- `story-3.*.md` — Cronogramas e Ajustes
- `story-4.*.md` — Agent Features, Chat, Dashboard
- E mais...

### 📊 [PRD](./prd/)
Product Requirement Documents e especificações de produtos.

- `technical-debt-assessment.md` — Avaliação de débito técnico (AIOX FASE 8)

### 📈 [Reports](./reports/)
Relatórios executivos, análises e sumários.

- `TECHNICAL-DEBT-REPORT.md` — Relatório de débito técnico (AIOX FASE 9)

### 🔍 [Reviews](./reviews/)
Revisões especializadas de diferentes aspectos técnicos.

- `db-specialist-review.md` — Revisão de especialista em banco de dados (AIOX FASE 5)
- `ux-specialist-review.md` — Revisão de especialista em UX (AIOX FASE 6)

### 🧪 [QA](./qa/)
Documentação de qualidade, testes e validação.

- `fase7-quality-gate.md` — Quality Gate da AIOX Fase 7

### 📖 [Guides](./guides/)
Guias práticos para desenvolvedores e operadores.

- `setup-ai-service.md` — Setup do serviço AI (FastAPI)

### 🔗 [Data](./data/)
Documentação relacionada a banco de dados, schemas e integração de dados.

- `README.md` — Índice de documentação de dados

---

## 🎯 Framework & Workflow

Este projeto utiliza **AIOX** — Synkra's AI-Orchestrated System for Full Stack Development.

### Fases Concluídas (AIOX Brownfield Discovery)

| Fase | Título | Status | Documento |
|------|--------|--------|-----------|
| 1 | System Architecture | ✅ Complete | `architecture/system-architecture.md` |
| 2 | Database Specialist Review | ✅ Complete | `reviews/db-specialist-review.md` |
| 3 | Frontend Specification | ✅ Complete | `frontend/frontend-spec.md` |
| 4 | DB Specialist Detailed Review | ✅ Complete | `reviews/db-specialist-review.md` |
| 5 | DB Specialist Review | ✅ Complete | `reviews/db-specialist-review.md` |
| 6 | UX Specialist Review | ✅ Complete | `reviews/ux-specialist-review.md` |
| 7 | QA Quality Gate | ✅ Complete | `qa/fase7-quality-gate.md` |
| 8 | Technical Debt Assessment | ✅ Complete | `prd/technical-debt-assessment.md` |
| 9 | Executive Report | ✅ Complete | `reports/TECHNICAL-DEBT-REPORT.md` |
| 10 | Implementation Planning | ⏳ Pending | — |

---

## 🔐 Key Principles

- **Multi-tenant Architecture** — Isolamento por `tenant_id` em todas as tabelas
- **RLS First** — Row-Level Security com Supabase
- **API-Driven** — Server Components, Server Actions, API Routes
- **Component-Based** — Arquitetura modular com componentes compartilhados
- **TypeScript** — Type-safe development

---

## 🗂️ Estrutura de Pastas

```
docs/
├── README.md (você está aqui)
├── architecture/
│   ├── adr/
│   ├── system-architecture.md
│   ├── module-standards.md
│   └── dashboards.md
├── frontend/
│   └── frontend-spec.md
├── stories/
│   ├── story-1.*.md
│   ├── story-2.*.md
│   ├── story-3.*.md
│   └── ...
├── prd/
│   └── technical-debt-assessment.md
├── reports/
│   └── TECHNICAL-DEBT-REPORT.md
├── reviews/
│   ├── db-specialist-review.md
│   └── ux-specialist-review.md
├── qa/
│   └── fase7-quality-gate.md
├── guides/
│   └── setup-ai-service.md
└── data/
    └── README.md
```

---

## 📌 Documentos Descontinuados

Documentação archived e não mais utilizada foi movida para `_deprecated/` na raiz do projeto:

- **`_deprecated/docs-feb-27/`** — Documentação pré-Brownfield (Fevereiro 2026)
- **`_deprecated/adr-old/`** — ADRs antigos (serão substituídos por novos)
- **`_deprecated/audits/`** — Relatórios de auditoria e cleanup (metadocumentação)

---

## 🎓 Como Usar Esta Documentação

1. **Novo no projeto?** → Leia `architecture/system-architecture.md`
2. **Desenvolvendo novo módulo?** → Consulte `architecture/module-standards.md`
3. **Dúvidas sobre frontend?** → Veja `frontend/frontend-spec.md`
4. **Configurando AI Service?** → Siga `guides/setup-ai-service.md`
5. **Procurando uma story?** → Navegue `stories/`

---

## 📞 Contato & Suporte

Para dúvidas sobre documentação:
- Verificar issues relacionadas no GitHub
- Contatar o time de arquitetura (@architect)
- Consultar o framework AIOX em `.aiox-core/`

---

**Última atualização:** 2026-03-07
**Framework:** AIOX (Synkra AI-Orchestrated System)
**Stack:** Next.js 14 + TypeScript + Supabase + TanStack Query
