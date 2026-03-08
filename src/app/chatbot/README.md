# Chatbot Module — Story 7.4 Phase 1

## Overview

The Chatbot module provides a conversational interface for users to interact with AI agents.

**Status:** Phase 1 Foundation (Story 7.4 Phase 1) ✅
**Timeline:** Weeks 3-5 of EPIC 7 roadmap
**Owner:** @dev (Dex)

## Architecture

### File Structure

```
src/app/chatbot/
├── layout.tsx                  # Route layout
├── page.tsx                    # Main page component
├── actions.ts                  # Server actions
├── README.md                   # This file
├── components/
│   ├── chatbot-content.tsx    # Main orchestrator
│   ├── agent-selector.tsx     # Agent selection dropdown
│   └── chat-interface.tsx     # Message display & input
└── hooks/
    └── useChat.ts             # Chat state management
```

### Components

#### 1. **ChatbotContent** (Orchestrator)
- Manages overall chat state
- Handles agent selection
- Coordinates between AgentSelector and ChatInterface
- **Location:** `components/chatbot-content.tsx`

#### 2. **AgentSelector** (Selection Component)
- Fetches available global chatbot agents
- Filters: `is_global_chatbot = true` AND `status = 'published'`
- Creates new session on agent selection
- **Location:** `components/agent-selector.tsx`

#### 3. **ChatInterface** (Chat Component)
- Displays chat messages with timestamps
- User input with Ctrl+Enter to send
- Copy-to-clipboard functionality
- Auto-scroll to latest message
- Loading states
- **Location:** `components/chat-interface.tsx`

#### 4. **useChat Hook** (State Management)
- Session creation/fetching
- Message management
- Error handling
- **Location:** `hooks/useChat.ts`

### Server Actions

Located in `src/app/chatbot/actions.ts`:

- **`getChatbotAgents()`** — Fetch all global chatbot agents
- **`createChatSession(agentId)`** — Create new chat session
- **`getChatSession(sessionId)`** — Fetch session with messages
- **`addChatMessage(sessionId, role, content)`** — Add message to session

All actions include:
- Authentication validation
- Tenant isolation via RLS
- Error handling

### Database Schema

Created via migration `064_chatbot_sessions.sql`:

**chat_sessions table:**
```sql
id, agent_id, tenant_id, user_id, title, created_at, updated_at
```

**chat_messages table:**
```sql
id, session_id, role, content, metadata, created_at
```

**RLS Policies:**
- Users can only see/edit their own sessions
- Tenant isolation enforced automatically
- Cascade deletes for data cleanup

## Features

### ✅ Implemented (Phase 1)

- [x] `/chatbot/` route structure
- [x] Agent selector with real data fetching
- [x] Chat interface with message display
- [x] User input with Ctrl+Enter submit
- [x] Session persistence (database)
- [x] Message history storage
- [x] Responsive design (mobile-friendly)
- [x] Accessibility (ARIA labels, keyboard nav)
- [x] Dark mode support
- [x] Copy-to-clipboard for messages
- [x] Auto-expand textarea
- [x] Error handling and loading states

### ⏳ Planned (Phase 2)

- [ ] Agent response generation via API
- [ ] Streaming message display
- [ ] Chat history sidebar
- [ ] Session search/filter
- [ ] Delete chat functionality
- [ ] Export chat to PDF/CSV
- [ ] Mobile drawer UI
- [ ] Real-time message updates
- [ ] Message editing
- [ ] Markdown rendering in messages
- [ ] Code syntax highlighting

## Usage

### Basic Usage

1. Navigate to `/chatbot/`
2. Select an agent from the left sidebar
3. New session is created automatically
4. Type message and press `Ctrl+Enter` to send
5. Session is persisted in database

### For Developers

#### Using the useChat Hook

```typescript
import { useChat } from '@/app/chatbot/hooks/useChat';

function MyComponent() {
  const { session, messages, createSession, sendMessage, error } = useChat();

  const handleSelectAgent = async (agentId: string) => {
    await createSession(agentId);
  };

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };

  return (
    // Your component JSX
  );
}
```

#### Server Actions

```typescript
import { getChatbotAgents, addChatMessage } from '@/app/chatbot/actions';

// Fetch agents
const agents = await getChatbotAgents();

// Add message
const message = await addChatMessage(sessionId, 'user', 'Hello!');
```

## Security

- **Authentication:** All actions require authenticated user
- **Tenant Isolation:** RLS policies enforce multi-tenant data isolation
- **Session Ownership:** Users can only access their own sessions
- **Message Validation:** Content length and type validation (Phase 2)
- **Rate Limiting:** API rate limiting recommended (Phase 2)

## Performance Considerations

### Optimizations Implemented

- Lazy loading of agent list
- Efficient pagination ready
- Auto-scroll with debouncing
- Message batching (Phase 2)
- Query indexes on frequently filtered columns

### Recommended Optimizations (Phase 2)

- Message virtualization for long histories
- Redis caching for agent metadata
- WebSocket for real-time updates
- Message compression for large payloads

## Testing

### Manual Testing Checklist

- [ ] Route `/chatbot/` loads
- [ ] Agent dropdown shows published agents
- [ ] Selecting agent creates session
- [ ] Typing message enables send button
- [ ] Ctrl+Enter sends message
- [ ] Message appears in chat history
- [ ] Timestamps display correctly
- [ ] Copy button works
- [ ] Mobile layout responsive
- [ ] Error handling works
- [ ] Loading states display

### Automated Testing (Phase 2)

- Unit tests for useChat hook
- Component snapshot tests
- Server action error handling tests
- RLS policy verification tests
- E2E tests for full flow

## Migration: 064_chatbot_sessions.sql

This migration creates the chatbot tables:

```bash
supabase migration up 064
```

## Next Steps (Phase 2)

1. **Agent API Integration**
   - Implement `/api/agents/{id}/chat` endpoint
   - Stream response handling
   - Error recovery

2. **Enhanced UI**
   - Chat history sidebar
   - Session management
   - Rich message formatting

3. **Advanced Features**
   - Voice input/output
   - Message reactions
   - Session sharing
   - Export functionality

## Debugging

### Common Issues

**Issue:** Agent list is empty
- **Check:** Are there published agents with `is_global_chatbot = true`?
- **Solution:** Create agents in admin panel and publish them

**Issue:** Session creation fails
- **Check:** Is user authenticated?
- **Solution:** Verify auth status and tenant assignment

**Issue:** Messages not persisting
- **Check:** Is migration 064 applied?
- **Solution:** Run `supabase migration up 064`

## Resources

- [Agent Types](/types/agents.ts)
- [Server Actions](/app/chatbot/actions.ts)
- [Database Schema](/migrations/064_chatbot_sessions.sql)
- [Story 7.4 Requirements](/docs/stories/epic-7-quick-wins-strategic-initiatives.md)

## Contributors

- **Phase 1:** Dex (@dev)
- **Phase 2:** TBD

## Completion Status

**Phase 1: 90%** (Story 7.4.1 - 7.4.3 complete, 7.4.4 testing pending)

- [x] Route creation (Subtask 7.4.1)
- [x] Agent selector (Subtask 7.4.2)
- [x] Chat interface (Subtask 7.4.3)
- [ ] Testing & validation (Subtask 7.4.4)
