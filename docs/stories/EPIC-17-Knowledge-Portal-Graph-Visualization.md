# EPIC 17 — Portal de Conhecimento & Visualização em Grafo

**Status:** 🚀 **IN EXECUTION** (Story 17.1 implementation)
**Framework:** AIOX Story Development Cycle v1.0
**Timeline:** 4 weeks (2026-03-21 — 2026-04-18)
**Team:** Dex (@dev) + Uma (@ux-design-expert) + Aria (@architect)
**Effort:** ~120 hours (4 stories × 30h avg)
**QA Target:** 95/100+ (visual + functional + accessibility)

---

## 📖 Overview

Transform Tech Arauz into a **client-facing Knowledge Portal** with Obsidian-like graph visualization. Users can discover documentation through beautiful UI, explore interconnected entities (areas, processes, activities, systems), and chat with AI about documents.

### Value Proposition
- 📚 **Documentation Discovery**: Magazine-style knowledge hub (`/conhecimento`) vs admin-only CRUD
- 🧠 **Graph Visualization**: Force-directed graph (like Obsidian) showing org knowledge structure
- 🤖 **AI-Powered**: Ask AI about documents with auto-injected context
- 🔗 **Knowledge Navigation**: Click through docs → entities → processes → systems

---

## 📋 Stories

### Story 17.1: Graph Data API + Database Schema Extensions
**Owner:** Dex (@dev) + Dara (@data-engineer)
**Effort:** 12h
**Status:** 🚀 IN PROGRESS (implementation started)
**Branch:** `feat/epic17-graph-api`

**Acceptance Criteria:**
- [ ] Migration 075: `documents` table enhancements (reading_time, tags, summary, search_vector, view_count, cover_image_url)
- [ ] Migration 076: `document_entity_links` table created with RLS policies
- [ ] Migration 076: `get_knowledge_graph()` PostgreSQL function (aggregates all nodes + links)
- [ ] `GET /api/knowledge/graph` — returns `{ nodes, links, generatedAt }`
- [ ] `GET /api/knowledge/documents` — paginated with filters (category, search, tags, cursor)
- [ ] `POST /api/knowledge/documents/[id]/view` — idempotent view count increment
- [ ] `GET /api/knowledge/documents/[id]/related` — returns related docs via graph traversal
- [ ] `src/types/knowledge-graph.ts` — TypeScript types for all graph entities
- [ ] All routes: 401 if unauthenticated, 200 with tenant-scoped data
- [ ] RLS fully applied to all new tables
- [ ] Unit tests for graph node/link validation

**Checkpoint 1 Validation (Admin):**
1. `GET /api/knowledge/graph` in browser → JSON with nodes and links visible
2. Check `/api/knowledge/documents?category=manual&limit=5` → paginated list
3. Increment view count via POST, verify in DB
4. Test RLS: two tenant accounts cannot see each other's data

**Deployed:** ✅ Vercel preview
**QA Score:** Pending

---

### Story 17.2: Knowledge Hub Portal (`/conhecimento`)
**Owner:** Dex (@dev) + Uma (@ux-design-expert)
**Effort:** 25h
**Status:** 📋 PENDING (blocked by 17.1)
**Branch:** `feat/epic17-knowledge-hub`

**Acceptance Criteria:**
- [ ] Route `/conhecimento` accessible to authenticated users
- [ ] Hero section: featured doc + search input + stats
- [ ] Category grid: 4 cards (manual, regra_negocio, arquitetura, guia) with doc count
- [ ] Document list with reading time, tags, summary excerpt
- [ ] Document reader at `/conhecimento/[slug]` with full markdown
- [ ] Breadcrumb navigation (Home > Category > Title)
- [ ] Related documents section (bottom of reader)
- [ ] View count incremented on reader open
- [ ] Full-text search (debounced 300ms)
- [ ] Dark mode support
- [ ] Responsive: 320px+ mobile
- [ ] Sidebar entry: "Base de Conhecimento" under Operação group

**Checkpoint 2 Validation (Admin):**
1. Navigate `/conhecimento` → hero and categories visible
2. Click a document → reader with markdown rendered
3. Breadcrumb click → navigation works
4. Dark mode toggle → layout adapts
5. Search input → real-time filtering

**Deployed:** Vercel preview
**QA Score:** Pending

---

### Story 17.3: Knowledge Graph Visualization (The Brain)
**Owner:** Dex (@dev) + Uma (@ux-design-expert)
**Effort:** 28h
**Status:** 📋 PENDING (blocked by 17.1, requires Story 17.2)
**Branch:** `feat/epic17-knowledge-graph`
**Library:** `react-force-graph` (via npm install)

**Acceptance Criteria:**
- [ ] Route `/conhecimento/grafo` renders force-directed graph
- [ ] 7 node types with distinct colors (document/process/area/activity/system/nucleus/routine)
- [ ] Edge animations: particle flow on links
- [ ] Click node → detail panel slides from right
- [ ] Zoom (scroll) + pan (drag) working
- [ ] Search input filters nodes (highlights matches)
- [ ] Type filter toggles (show/hide layers)
- [ ] Dark mode support
- [ ] Legend visible (type → color)
- [ ] Skeleton loader while fetching
- [ ] "Go to page" button navigates to entity
- [ ] Node count shown: "X nós, Y conexões"

**Color Scheme:**
- Document: `#3b82f6` (blue)
- Process: `#22c55e` (green)
- Area: `#f97316` (orange)
- Activity: `#14b8a6` (teal)
- System: `#a855f7` (purple)
- Nucleus: `#eab308` (yellow)
- Routine: `#6b7280` (gray)

**Checkpoint 3 Validation (Admin):**
1. Navigate `/conhecimento/grafo` → grafo carrega com nós coloridos
2. Click nó → detail panel desliza com informações
3. Busca "Processo" → nós correspondentes destacados
4. Toggle de tipo off → camada desaparece
5. Dark mode: canvas background acompanha tema
6. Zoom e pan funcionam suavemente

**Deployed:** Vercel preview
**QA Score:** Pending

---

### Story 17.4: Document-Graph Integration + AI Features
**Owner:** Dex (@dev) + Uma (@ux-design-expert)
**Effort:** 30h
**Status:** 📋 PENDING (blocked by 17.3)
**Branch:** `feat/epic17-ai-integration`

**Acceptance Criteria:**
- [ ] "Ask AI" button on document reader opens chat sheet
- [ ] Chat pre-seeded with document context (system injection)
- [ ] AI responses streamed via `/api/agents/{id}/chat`
- [ ] "Related entities" section shows graph-linked items
- [ ] Admin in `/documentacao` edit: tags field + entity link manager
- [ ] "View in Graph" button → `/conhecimento/grafo?highlight={id}`
- [ ] Document nodes clickable in graph → navigate to reader
- [ ] One-click summary generation (admin action)
- [ ] `reading_time_minutes` displayed everywhere
- [ ] Document view count shown in UI

**Checkpoint 4 Validation (Admin):**
1. Open doc in `/conhecimento/[slug]` → "Ask AI" button visible
2. Click → chat sheet opens → send question → AI responds with document context
3. "Entidades relacionadas" section shows links (if any)
4. "Ver no Grafo" → navegates with doc node centered
5. Admin `/documentacao` edit → tags field + entity link manager visible

**Deployed:** Vercel preview (final)
**QA Score:** Pending

---

## 🏗️ Architecture

### Database Layer (Migrations 075-076)
- Enhance `documents` table: reading_time, tags[], summary, view_count, cover_image_url, search_vector (FTS)
- Create `document_entity_links` table: document ↔ org entity relationships with RLS
- PostgreSQL function `get_knowledge_graph()`: aggregates all nodes + links in single JSON payload

### API Layer (`/api/knowledge/*`)
- `GET /api/knowledge/graph` — full graph data (cached 60s)
- `GET /api/knowledge/documents` — paginated list with filters
- `POST /api/knowledge/documents/[id]/view` — view count increment
- `GET /api/knowledge/documents/[id]/related` — related via graph or category

### UI Layer (`/conhecimento/*`)
- `/conhecimento` — hub homepage (hero + categories + list)
- `/conhecimento/[slug]` — document reader (markdown + meta + related)
- `/conhecimento/grafo` — force-directed graph visualization

### Components
- `KnowledgeHeroSection`, `KnowledgeCategoryGrid`, `KnowledgeDocumentCard`
- `ForceGraphCanvas` (dynamic import, `ssr: false`)
- `AskAIDocumentChat`, `DocumentGraphLinks`, `DocumentEntityLinkManager`

---

## 📦 Dependencies

**New npm package:**
```bash
npm install react-force-graph
```

**Existing reused:**
- `react-markdown`, `remark-gfm`, `rehype-highlight` (from docs)
- `shadcn/ui` (Sheet, Breadcrumb, Button, Input, etc.)
- `TanStack Query` (data fetching)
- `lucide-react` (icons)

---

## ✅ Validation Checklist (Admin)

### Per Story Deployment
Each story deployed to Vercel with specific validation steps:

**Story 17.1 (API + DB)**
- [ ] API endpoint health check
- [ ] RLS isolation verified
- [ ] Graph data shape correct

**Story 17.2 (Hub Portal)**
- [ ] UI renders without errors
- [ ] Navigation works
- [ ] Markdown rendering correct

**Story 17.3 (Graph Visual)**
- [ ] Graph renders
- [ ] Interactions smooth
- [ ] Performance acceptable

**Story 17.4 (AI + Integration)**
- [ ] AI chat functional
- [ ] All links work
- [ ] Admin features visible

---

## 📚 Supporting Documentation

- **ADR-006** (TBD): Graph visualization architecture decision
- **GUIDE: Knowledge Portal** (TBD): User guide for readers
- **GUIDE: Knowledge Admin** (TBD): Admin guide for tagging/linking documents

---

## 🚀 Deployment

**Target:** Continuous deployment to Vercel via GitHub Actions
**Branch:** `main` (after all PRs merged)
**Preview:** Each story = separate preview URL for validation

---

**Next:** Story 17.1 implementation started →
