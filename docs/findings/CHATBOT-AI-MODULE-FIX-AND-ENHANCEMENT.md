# Technical Finding — CHATBOT AI Module: Bug Fix & Chat History Enhancement

**Data:** 2026-03-07
**Descoberto em:** Revisão de módulos durante AIOX Brownfield Discovery
**Tipo:** Bug Fix + Feature Enhancement
**Severidade:** ALTA (módulo quebrado, impacta UX executiva)
**Status:** DOCUMENTED FOR FASE 10 IMPLEMENTATION PLANNING
**Revisado por:** Aria (@architect)

---

## Sumário Executivo

**Problema:** Módulo "CHATBOT AI" acessível pelo sidebar está quebrado (erro não identificado).

**Oportunidade:**
1. Corrigir o módulo quebrado
2. Implementar sistema de **Chat History** (como Claude web)
3. Permitir **parametrização de agentes** via frontend
4. Reutilizar infraestrutura existente de chat em `/agentes/[id]/chat/`

**Referência:** Usar "Chat com Assistente Projetos" como padrão (já funciona).

**Solução:**
- Criar rota `/chatbot/` que funcione como chat global com histórico
- Mostrar sidebar com histórico de conversas (like Claude web)
- Seletor de agentes/assistentes parametrizáveis
- Reutilizar ChatContent + API de sessions/messages

**Impacto:** Enable uso de AI assistants como ferramenta central, não isolada por agente.

**Esforço Estimado:** 30-40h
**Risco:** BAIXO (reutiliza código existente, novo módulo)
**Prioridade:** ALTA (UX executiva)

---

## Análise Técnica

### 1. Estado Atual — CHATBOT AI (Incompleto, não Quebrado) ✅ Funciona

**Descoberta Real:**
- ✅ Sidebar link EXISTE: `src/components/layout/sidebar-config.ts` (linha 48)
- ✅ Rota EXISTE e FUNCIONA: `/conversas`
- ✅ Arquivo page.tsx EXISTE: `src/app/conversas/page.tsx`
- ✅ Componente EXISTE: `src/app/conversas/conversas-content.tsx`

**O que Funciona:**
- ✅ Página `/conversas` carrega corretamente
- ✅ Exibe "Histórico de Conversas" em tabela
- ✅ Lista todas as agent_sessions do usuário
- ✅ Mostra: Agent/IA, data início, última atualização, contagem de mensagens
- ✅ Links para chatting (botão "Visualizar" → `/agentes/[id]/chat/`)

**O Problema Real (UX Incompleto):**
- ❌ `/conversas` é SÓ uma tabela (sem interface de chat)
- ❌ Sem "New Chat" entry point direto
- ❌ Sem Agent Selector dentro do chat
- ❌ Sem Chat History Sidebar (tipo Claude web)
- ❌ Requer 2 cliques para realmente chattar (conversas → link → chat)
- ❌ Não é experiência unificada de chat

---

### 2. Working Reference — "Chat com Assistente Projetos" = `/agentes/[id]/chat/` ✅

**Identidade & Localização:**
- **Rota:** `/agentes/[id]/chat/`
- **Server Component:** `src/app/agentes/[id]/chat/page.tsx`
- **Client Component:** `src/app/agentes/[id]/chat/chat-content.tsx`
- **Nome Dinâmico:** Header exibe "Chat com {agent.name}"
  - Quando agente chamado "Assistente Projetos" → "Chat com Assistente Projetos"

**Como Funciona (Fluxo):**
1. Usuário acessa `/agentes` → lista de agentes
2. Clica em agent → abre `/agentes/[id]`
3. Clica em aba "Chat" → redireciona para `/agentes/[id]/chat/`
4. ChatContent carrega:
   - Busca última session (GET `/api/agents/{id}/sessions`)
   - Carrega messages de session (GET `/api/agents/{id}/sessions/{sessionId}/messages`)
   - Renderiza interface de chat com input box

**O que É Bem Feito:**
- ✅ Session management funciona
- ✅ Messages display com tokens/cost info
- ✅ Permite criar novo chat
- ✅ UI responsiva com ChatBubble component
- ✅ Server-side data fetch + client interaction

**O que NÃO Tem:**
- ❌ Agent selector (pra trocar agente sem sair do chat)
- ❌ History sidebar (lista de chats recentes)
- ❌ Global access (precisa navegar via /agentes primeiro)

---

## Especificação da Solução

### Nova Rota: `/chatbot/`

**Layout:**
```
┌─────────────────────────────────────────┐
│          CHATBOT AI - Assistentes        │
├──────────────┬──────────────────────────┤
│  Histórico   │   Chat Ativo             │
│              │                          │
│ • Nova Chat  │  [Agent Selector] ▼      │
│              │                          │
│ • Chat 1     │  ┌──────────────────┐   │
│   (3 msg)    │  │ Mensagens aqui   │   │
│              │  │                  │   │
│ • Chat 2     │  │                  │   │
│   (5 msg)    │  └──────────────────┘   │
│              │                          │
│ • Chat 3     │  [Input message...]      │
│   (1 msg)    │  [Send Button]           │
│              │                          │
│ (scroll)     │                          │
│              │                          │
└──────────────┴──────────────────────────┘
```

**Componentes Principais:**
1. **Sidebar Esquerda: Chat History**
   - Lista de chats recentes (como Claude web)
   - Clique carrega conversa anterior
   - Botão "New Chat"
   - Deletar chat (trash icon)

2. **Main Area: Chat Interface**
   - **Agent Selector** (dropdown)
     - Lista de agentes published com `usageType = 'chatbot'` e `is_global_chatbot = true`
     - Permite trocar agente mid-conversation (cria novo session)
   - **Messages Display** (como atual ChatContent)
   - **Input Box** (texto + send button)

3. **API Calls:**
   - `GET /api/agents/{agentId}/sessions` — carregar histórico
   - `GET /api/agents/{agentId}/sessions/{sessionId}/messages` — carregar messages
   - `POST /api/agents/{agentId}/chat` — enviar message
   - `DELETE /api/agents/{agentId}/sessions/{sessionId}` — deletar chat (novo endpoint)

---

### Data Model Requirements

**Existing Tables Used:**
- ✅ `agents` — lista de agentes (`usageType`, `is_global_chatbot`, `status`)
- ✅ `agent_sessions` — sessions (via AI service API)
- ✅ `agent_messages` — messages (via AI service API)

**New Fields (agent table):**
- ✅ `is_global_chatbot` — flag para mostrar em seletor global (já existe)
- ✅ `usage_type` — 'chatbot' ou 'workflow' (já existe)

---

### File Structure (Proposed)

```
src/app/chatbot/
├── page.tsx (server component)
├── layout.tsx
└── components/
    ├── chatbot-content.tsx (client, orquestrador)
    ├── chat-history-sidebar.tsx (client, lista de chats)
    ├── agent-selector.tsx (client, dropdown de agentes)
    └── chat-messages-area.tsx (reutiliza ChatContent logic)

src/components/chat/
├── chat-content.tsx (existing, pode ser refatorado)
└── chat-input.tsx (existing)
```

---

## RLS & Security

### ✅ Multi-Tenant Isolation
- Agentes filtrados por `tenant_id`
- Sessions isoladas por user + tenant
- Messages isoladas por session

### ⚠️ Agent Selection Permission
- Apenas agentes com `is_global_chatbot = true` aparecem no seletor
- Validar no backend: user pode acessar este agente?
- (Reutilizar lógica existente de `/agentes/[id]/chat/`)

### ⚠️ Session Creation
- Novo session criado quando:
  - "New Chat" clicado
  - Agente mudado mid-conversation
- Validar: user autorizado para este agente?

---

## Implementation Phases (FASE 10)

### Phase 1: Fix CHATBOT AI (1-2 semanas)
- [ ] Investigar por que rota atual está quebrada
- [ ] Criar rota `/chatbot/` funcional (página simples)
- [ ] Implementar Agent Selector (dropdown)
- [ ] Integrar com chat API existente

**Esforço:** 15h

### Phase 2: Chat History Sidebar (1-2 semanas)
- [ ] Fetch sessions list (GET `/api/agents/{id}/sessions`)
- [ ] Componente ChatHistorySidebar
- [ ] Click para carregar session anterior
- [ ] "New Chat" button
- [ ] Delete session (novo endpoint)

**Esforço:** 15h

### Phase 3: Polish & Testing (1 semana)
- [ ] UX refinement (Claude web style)
- [ ] Performance optimization (session list pagination)
- [ ] Error handling
- [ ] A/B testing com stakeholders

**Esforço:** 10h

**Total:** 40h | **Timeline:** 3-4 semanas

---

## Implementation Checklist (FASE 10)

### Before Implementation
- [ ] Investigar erro atual do CHATBOT AI (qual é exatamente?)
- [ ] Confirmar rota que sidebar tenta acessar
- [ ] Validar estrutura de `is_global_chatbot` e `usage_type`
- [ ] Confirm AI Service API endpoints disponíveis

### Phase 1: Fix & Setup
- [ ] Criar `/chatbot/page.tsx` funcional
- [ ] Implementar agent selector dropdown
- [ ] Fetch inicial de agentes published

### Phase 2: History & Sessions
- [ ] Fetch sessions list (UI + API validation)
- [ ] ChatHistorySidebar component
- [ ] Click para carregar session anterior
- [ ] Delete session endpoint

### Phase 3: Polish
- [ ] UX refinement (layout, styling)
- [ ] Error handling (session load failed, etc)
- [ ] Mobile responsiveness
- [ ] Keyboard navigation (accessibility)

### Testing
- [ ] Multi-agent switching (criar new session)
- [ ] Session persistence (reload → mantém histórico)
- [ ] RLS validation (user pode ver sessão de outro?)
- [ ] Performance: 50+ sessions (lazy load?)

---

## Questions for FASE 10 Planning

1. **Qual é o erro do CHATBOT AI atual?**
   - 404 Not Found?
   - Component error?
   - Missing route?

2. **"Chat com Assistente Projetos" é a referência?**
   - Qual a localização?
   - Como funciona seu histórico?
   - Reutilizar componentes?

3. **Agent Selection:**
   - Filtro: apenas `is_global_chatbot = true`?
   - Ou todos os published agents?
   - Com filtro por tipo (chatbot vs workflow)?

4. **Session Management:**
   - Pode deletar sessions?
   - Limite de histórico (ex: últimos 30 dias)?
   - Paginar sessions se muitas?

5. **Mobile:**
   - Sidebar colapsível em mobile?
   - Drawer para histórico?

---

## 3. Arquitetura Completa de Chat (Descoberta do Agent)

### Fluxo de Dados

```
ChatContent (client)
  ↓ (POST)
/api/agents/{id}/chat
  ↓ (Proxy to AI Service at localhost:8000)
AI_SERVICE_URL/api/agents/{id}/chat
  ↓ (Returns)
{
  session_id: string,
  message_id: string,
  answer: string,
  tokens_used: number,
  cost_usd: number,
  duration_ms: number,
  fallback?: boolean
}
```

### Endpoints de API

| Endpoint | Method | Propósito |
|----------|--------|----------|
| `/api/agents/{id}/chat` | POST | Enviar mensagem ao agente |
| `/api/agents/{id}/sessions` | GET, POST | Listar ou criar sessions |
| `/api/agents/{id}/sessions/{sessionId}/messages` | GET | Carregar messages de session |
| `/api/agents/{id}/traces` | GET | Carregar execution traces |
| `/api/agents/{id}/metrics` | GET | Carregar métricas do agente |

### Estrutura de Session (agent_sessions table)

```
- id (UUID)
- user_id (who initiated)
- agent_id (which agent)
- started_at (timestamp)
- ended_at (timestamp or null)
- status ('active' | 'paused' | 'closed')
- message_count (integer)
- created_at, updated_at
```

### Componentes Específicos

| Componente | Path | Função |
|-----------|------|--------|
| **ChatContent** | `src/app/agentes/[id]/chat/chat-content.tsx` | Client-side chat UI |
| **ConversasContent** | `src/app/conversas/conversas-content.tsx` | Session history table |
| **ChatBubble** | `src/components/agents/ChatBubble.tsx` | Message display |
| **ProjectCockpit** | `src/components/project/ProjectCockpit.tsx` | Project detail tabs |

---

## Referências Completas (Absolute Paths)

| Item | Localização | Escopo |
|------|-------------|--------|
| **Sidebar Config** | `src/components/layout/sidebar-config.ts` (linha 48) | "Chatbot AI" link → `/conversas` |
| **Conversation History Page** | `src/app/conversas/page.tsx` | Server component |
| **Conversation History UI** | `src/app/conversas/conversas-content.tsx` | Session history table |
| **Agent Chat Page** | `src/app/agentes/[id]/chat/page.tsx` | Working reference (server) |
| **Chat UI Component** | `src/app/agentes/[id]/chat/chat-content.tsx` | Working reference (client) |
| **Chat Message Component** | `src/components/agents/ChatBubble.tsx` | Message display |
| **Chat API Route** | `src/app/api/agents/[id]/chat/route.ts` | Backend chat endpoint |
| **Project Detail View** | `src/components/project/ProjectCockpit.tsx` | ProjectCockpit tabs |
| **This Finding** | `docs/findings/CHATBOT-AI-MODULE-FIX-AND-ENHANCEMENT.md` | Enhancement specification |

---

## Realidade vs Expectativa

### Descoberta Crítica (Agent Investigation)
- ✅ **NÃO está QUEBRADO** — está funcionando
- ✅ `/conversas` carrega sem erros
- ✅ Lista histórico de conversas corretamente
- ❌ Mas é **INCOMPLETO** em UX (só tabela, sem chat)
- ❌ Requer navegação complexa (2+ cliques para chattar)

### Por que Parece "Quebrado"
1. Experiência não é unificada (como Claude web)
2. "New Chat" entry point confuso
3. Sem agent selector no chat
4. Sem history sidebar inline

---

## Next Steps (FASE 10)

1. **Investigation:** Descobrir exatamente por que CHATBOT AI está quebrado
2. **Reference Review:** Entender "Chat com Assistente Projetos" como padrão
3. **Planning:** Quebrar em 3 phases com timeline
4. **Implementation:** Executar em paralelo se possível
5. **Testing:** Validar multi-agent, sessions, RLS

---

**Status:** PRONTO PARA FASE 10 — INVESTIGATION + IMPLEMENTATION PLANNING

**Complexidade:** MÉDIA (reutiliza código existente, novo módulo)
**Esforço:** 40h
**Risco:** BAIXO
**Impacto:** ALTO (ferramenta executiva central)

---

*Documento criado durante revisão de módulos durante AIOX Brownfield Discovery*
*Data: 2026-03-07 | Revisado por: Aria (@architect)*
*Tipo: Bug Fix + Feature Enhancement (Chat History)*
