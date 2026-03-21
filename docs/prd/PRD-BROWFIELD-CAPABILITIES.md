# PRD Brownfield — Capability Map (Estado Real)

```yaml
---
doc_id: "prd-brownfield-capabilities"
git_ref: "5d1978cf7170b79a6bc06a95204063a121e45f04"
generated_at: "2026-03-21T00:00:00Z"
evidence_manifest:
  - "docs/reference/PROJECT-CURRENT-STATE.md"
  - "docs/stories/EPIC-INDEX.md"
  - "src/app/**/page.tsx"
  - "src/app/api/**/route.ts"
  - "configs/project.yaml"
known_gaps: []
---
```

---

## Capacidades por Módulo (rotas verificadas em src/app)

| Rota | Módulo | Implementação |
|------|--------|---------------|
| `/` | Landing | `src/app/page.tsx` |
| `/login` | Auth | `src/app/login/page.tsx` |
| `/logout` | Auth | `src/app/logout/page.tsx` |
| `/dashboard` | Dashboard | `src/app/dashboard/page.tsx` |
| `/dashboard/projetos` | Dashboard Projetos | `src/app/dashboard/projetos/page.tsx` |
| `/dashboard/operacao` | Dashboard Operação | `src/app/dashboard/operacao/page.tsx` |
| `/dashboard/operacoes` | Dashboard Operações | `src/app/dashboard/operacoes/page.tsx` |
| `/projetos` | Projetos | `src/app/projetos/page.tsx` |
| `/cronogramas` | Cronogramas | `src/app/cronogramas/page.tsx` |
| `/agentes` | Agentes AI | `src/app/agentes/page.tsx` |
| `/agentes/[id]` | Agente Detalhe | `src/app/agentes/[id]/page.tsx` |
| `/agentes/[id]/chat` | Chat Agente | `src/app/agentes/[id]/chat/page.tsx` |
| `/chatbot` | Chatbot Global | `src/app/chatbot/page.tsx` |
| `/conversas` | Conversas | `src/app/conversas/page.tsx` |
| `/integracoes` | Integrações Espaider | `src/app/integracoes/page.tsx` |
| `/organizacao` | Organização | `src/app/organizacao/page.tsx` |
| `/organizacao/areas` | Áreas | `src/app/organizacao/areas/page.tsx` |
| `/organizacao/areas/[areaId]/nucleos` | Núcleos | `src/app/organizacao/areas/[areaId]/nucleos/page.tsx` |
| `/organizacao/nucleos` | Núcleos (listagem) | `src/app/organizacao/nucleos/page.tsx` |
| `/organizacao/processos` | Processos | `src/app/organizacao/processos/page.tsx` |
| `/organizacao/processos/[processId]/rotinas` | Rotinas | `src/app/organizacao/processos/[processId]/rotinas/page.tsx` |
| `/organizacao/processos/[processId]/rotinas/[routineId]/atividades` | Atividades | `src/app/organizacao/processos/.../atividades/page.tsx` |
| `/organizacao/recursos` | Recursos | `src/app/organizacao/recursos/page.tsx` |
| `/organizacao/empresa` | Empresa | `src/app/organizacao/empresa/page.tsx` |
| `/organizacao/setup` | Setup Organização | `src/app/organizacao/setup/page.tsx` |
| `/documentacao` | Documentação | `src/app/documentacao/page.tsx` |
| `/cadastros/usuarios` | Usuários | `src/app/cadastros/usuarios/page.tsx` |
| `/auxiliares/modelos-ia` | Modelos IA | `src/app/auxiliares/modelos-ia/page.tsx` |
| `/auxiliares/modelos-ia/governanca` | Governança Modelos | `src/app/auxiliares/modelos-ia/governanca/page.tsx` |
| `/auxiliares/lm-providers` | LM Providers | `src/app/auxiliares/lm-providers/page.tsx` |
| `/auxiliares/agent-types` | Agent Types | `src/app/auxiliares/agent-types/page.tsx` |

---

## API Routes (src/app/api/**/route.ts)

| Path | Handler |
|------|---------|
| /api/agents | route.ts |
| /api/agents/[id] | route.ts |
| /api/agents/[id]/chat | route.ts |
| /api/agents/[id]/metrics | route.ts |
| /api/agents/[id]/sessions | route.ts |
| /api/agents/[id]/traces | route.ts |
| /api/agents/budget | route.ts |
| /api/agents/templates | route.ts |
| /api/agents/types | route.ts |
| /api/integracoes | route.ts |
| /api/integracoes/setup | route.ts |
| /api/integracoes/sync | route.ts |
| /api/integracoes/test | route.ts |
| /api/integracoes/logs | route.ts |
| /api/integracoes/logs/summary | route.ts |
| /api/search/suggestions | route.ts |
| /api/sessions | route.ts |
| /api/admin/sync-status | route.ts |
| /api/admin/apply-migration-056 | route.ts |
| /api/lm-models/bulk-update | route.ts |

---

## Estado de EPICs (PROJECT-CURRENT-STATE.md)

- **EPIC 7:** ✅ COMPLETE (v0.2.2)
- **EPIC 9:** ✅ COMPLETE (v0.2.3)
- **EPIC 10:** ✅ COMPLETE (v0.2.3+)
- **EPIC 8.6:** ✅ COMPLETE (v0.2.3)
- **EPIC 5, 6, 8:** ❌ ARCHIVED
- **EPIC 11:** 🟢 READY FOR EXECUTION (14 stories)

---

## Design System (configs/project.yaml)

- AppSidebar, DashboardHeader
- KPICard, KanbanBoard, ViewToggle, SplitView

---

**Last Updated:** 2026-03-21
**Source:** [engineering/COMPOSER-DOCUMENTATION-PACK.md](../engineering/COMPOSER-DOCUMENTATION-PACK.md) §5.4
