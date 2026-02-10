# Tech Arauz - Roadmap de Desenvolvimento

> **Versão**: 1.0  
> **Atualizado**: 2026-02-08  
> **Status**: Em desenvolvimento MVP

Este documento serve como guia para o desenvolvimento contínuo do SaaS Tech Arauz.

---

## Visão Geral do Projeto

**Tech Arauz** é um Portal SaaS de Gestão de TI que combina:

1. **Módulo 1: Gestão 360° de Projetos** — Sincroniza e centraliza dados do ERP Espaider
2. **Módulo 2: Gestão de Agentes AI** — Documenta e visualiza workflows (LangSmith/LangChain/LangGraph)

---

## Stack Técnica

| Camada | Tecnologia | Documentação |
| ------ | ---------- | ------------ |
| Frontend | Next.js 14 (App Router) | `.context/03-specs/adr/ADR-001` |
| UI | shadcn/ui + Tailwind CSS | `.context/03-specs/component-patterns.md` |
| Auth | Supabase Auth | `.context/03-specs/adr/ADR-001` |
| Database | Supabase (PostgreSQL + RLS) | `supabase/README.md` |
| Integração | Client Espaider (TypeScript) | `.context/03-specs/adr/ADR-002` |
| AI Service | Python + FastAPI + LangChain | `services/ai/` |

---

## Arquitetura de Contexto

```
LEITURA OBRIGATÓRIA (nesta ordem):
1. .context/00-MASTER.md         → Ponto de entrada, navegação
2. .context/IMPLEMENTATIONS.md   → O que já foi feito
3. .context/03-specs/adr/        → Decisões de arquitetura
4. .context/03-specs/tokens_brand.json      → Design tokens
5. .context/03-specs/component-patterns.md  → Padrões de componentes
```

---

## Funcionalidades por Prioridade

### PRIORIDADE 1: Core MVP (Em progresso)

| Feature | Descrição | Status | Arquivo |
| ------- | --------- | ------ | ------- |
| Login/Auth | Autenticação Supabase | Funcional | `src/app/login/` |
| Dashboard | KPIs + projetos recentes | Funcional | `src/app/dashboard/` |
| Projetos Kanban | Visualização por status | Funcional | `src/app/projetos/` |
| Projetos Lista | Visualização em tabela | Funcional | `src/app/projetos/` |
| Visão 360° | Detalhes do projeto | Funcional | `SplitView` |
| Sync Espaider | Importar projetos (hierárquico + logs) | **Refatorado** | `src/lib/sync/espaider-sync.ts` |

### PRIORIDADE 2: Enriquecimento

| Feature | Descrição | Status |
| ------- | --------- | ------ |
| Filtros avançados | Filtro por status funcional | Completo |
| Drag-and-drop | Mover projetos entre colunas Kanban | Completo |
| Gráficos | Pipeline + Tendência no Dashboard | Completo |
| Notificações | Alertas de projetos atrasados | Pendente |
| Dark mode | Toggle tema | Funcional |

### PRIORIDADE 3: Módulo Agentes AI

| Feature | Descrição | Status |
| ------- | --------- | ------ |
| Instrumentação AI | Tracing, custos, budgets, logs (LangSmith) | Completo |
| Listagem agentes | Visualizar agentes (UI) | Completo |
| Detalhes execução | Traces e métricas (UI) | Completo |
| Dashboard AI | KPIs + Budget Gauge (UI) | Completo |
| API Routes proxy | Next.js -> Python service | Completo |

> **Nota**: O módulo de Agentes AI está funcional com dados mock.
> Para dados reais, conectar o serviço Python ao LangSmith API e LLM real.
> Ver [`docs/observability.md`](../docs/observability.md) para detalhes da instrumentação.

---

## Padrões de Código

### Estrutura de Página

```tsx
// app/[modulo]/page.tsx (Server Component)
export default async function Page() {
  // 1. Verificar auth
  // 2. Buscar dados no Supabase
  // 3. Renderizar ClientComponent
  return <ClientContent data={data} />;
}

// app/[modulo]/[modulo]-content.tsx (Client Component)
'use client';
export function ModuloContent({ data }) {
  // 1. DashboardHeader
  // 2. KPIs (KPICard)
  // 3. Filtros (ViewToggle, Search, etc)
  // 4. Conteúdo (KanbanBoard ou Lista)
  // 5. SplitView para detalhes
}
```

### Componentes de UI

Sempre usar componentes de `src/components/ui/` baseados em shadcn/ui:

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// etc.
```

### Componentes de Layout

```tsx
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
```

### Componentes de Dashboard

```tsx
import { KPICard } from '@/components/dashboard/KPICard';
```

### Componentes de Views

```tsx
import { KanbanBoard, projectStatusColumns } from '@/components/views/KanbanBoard';
import { ViewToggle } from '@/components/views/ViewToggle';
import { SplitView } from '@/components/views/SplitView';
```

---

## Cores de Status de Projeto

Sempre usar as classes definidas em `tokens_brand.json`:

```typescript
const statusStyles = {
  projeto_futuro: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  em_aprovacao: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  em_desenvolvimento: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  em_homologacao: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  concluido: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  cancelado: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  suspenso: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
};
```

---

## Integração Espaider — Fluxo de Sincronização

### Cadastro de APIs (`/integracoes`)

1. Acessar **Integrações** no menu lateral
2. Clicar **Nova API** → preencher Nome, Tipo e Identificador
3. URL Base e Token são herdados do `.env.local` se deixados vazios (seção "Configuração avançada")
4. O seed (migration 004) já cadastra 4 APIs com `PREENCHER_TOKEN` — o sistema faz fallback para o token do env automaticamente

### Fluxo de Sync

```
Projects (BI_SOLICITACOES_SUPORTEESPAIDER)
  ├── Deliveries (BI_..._ENTREGAS)
  ├── Schedules (BI_..._CRONOGRAMAS)
  └── Requirements (BI_..._REQUISITOS)
```

**Ordem**: Projetos PRIMEIRO (parents), depois filhos. O sync é sequencial para garantir FKs.

**Trigger**: Botão "Sincronizar Espaider" em `/projetos` (Server Action) ou "Sincronizar Todas" em `/integracoes` (API Route).

### Fluxo Técnico

```
1. loadApiConfigs() → Lê espaider_apis do banco
2. Fallback: PREENCHER_TOKEN → process.env.ESPAIDER_TOKEN
3. exportarDados() → POST inicial + GET paginação (URLPaginacao)
4. mapearRegistros() → Transforma para tipos internos
5. supabase.upsert() → onConflict: tenant_id,espaider_id
6. logSyncResult() → Grava em sync_logs
7. updateApiSyncStatus() → Atualiza last_sync_at no card
```

### Troubleshooting

| Problema | Causa | Solução |
|----------|-------|---------|
| "Missing env vars" | `ESPAIDER_BASE_URL` ou `ESPAIDER_TOKEN` ausentes no `.env.local` | Verificar `.env.local` |
| Circuit breaker open | 5+ falhas consecutivas na API | Aguardar 30s (auto-reset) ou corrigir a API |
| RLS blocking upsert | Anon key sem permissão de INSERT/UPDATE | Criar `service.ts` com `SUPABASE_SERVICE_ROLE_KEY` |
| Orphan deliveries | Projeto pai não encontrado no banco | Rodar sync de Projetos antes de filhos |
| Token PREENCHER_TOKEN | Seed não atualizado | O fallback no `espaider-sync.ts` resolve automaticamente |
| Hydration Error | Badge dentro de p | Corrigido em `integracoes-content.tsx` (div wrapper) |

---

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Testes
npm run test

# Lint
npm run lint

# Supabase (via MCP workflow)
/supabase status
/supabase migrate
/supabase query "SELECT * FROM projects LIMIT 5"
```

---

## Arquivos de Configuração

| Arquivo | Propósito |
| ------- | --------- |
| `tailwind.config.ts` | Cores, fontes, animações Tailwind |
| `src/app/globals.css` | Variáveis CSS do design system |
| `.env.local` | Variáveis de ambiente |
| `package.json` | Dependências e scripts |
| `next.config.mjs` | Configuração Next.js |
| `tsconfig.json` | Configuração TypeScript |

---

## Checklist para Novas Features

- [ ] Verificar se existe ADR para a decisão
- [ ] Usar componentes existentes de `src/components/`
- [ ] Seguir padrões de `component-patterns.md`
- [ ] Usar cores do `tokens_brand.json`
- [ ] Implementar dark mode (usar variáveis CSS)
- [ ] Testar responsividade (mobile-first)
- [ ] Atualizar `IMPLEMENTATIONS.md` ao concluir

---

## Contato

**Tenant**: Araúz & Advogados  
**Responsável**: Gabriel Cristofolini (CTO)  
**Email**: gabriel@arauz.com.br
