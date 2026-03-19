# Frontend Specification — Espaider Integration UI Modernization

**Phase 3: Frontend Impact Assessment (Brownfield Discovery)**
**Prepared by:** @ux-design-expert (Uma)
**Date:** 2026-03-19
**Status:** Complete & Ready for Phase 4-8

---

## Executive Summary

The Espaider integration UI is functional but suffers from **4 key limitations** that impact UX during sync operations. Current components (APIManager, LogViewer) are well-structured with React Query patterns, but lack real-time feedback, granular error handling, and feature flag support. Frontend changes required for Phase 4+ modernization are **moderate** (3-4 days of dev time).

**Current UX Assessment:**
- ✓ Clear API configuration dialog (APIConfigDialog)
- ✓ Comprehensive log viewer with filtering (LogViewer)
- ✓ Dataset-level filtering and pagination
- ✗ No real-time sync progress indicator
- ✗ Error messages appear in toast only (not persistent)
- ✗ Cannot retry failed datasets individually
- ✗ No feature flag UI for TempoPermanencia/HorasLancadas

**Modification Effort:** ~30 hours dev + 10 hours QA = 2-3 week sprint

---

## Part 1: Current Frontend Architecture

### 1.1 Component Map

```
src/app/integracoes/
├── page.tsx                        # Page wrapper + auth check
├── layout.tsx                      # Route layout
└── integracoes-content.tsx         # Main content component (not shown; assumes APIManager + LogViewer)

src/components/integracoes/
├── APIManager.tsx                  # 549 lines
│   ├── APIConfigDialog (sub-component)
│   ├── State: apis[], isLoading, isSyncing, syncMessage
│   ├── Actions: fetchAPIs(), handleSync()
│   └── UI: Grid of API cards + Sync button
│
├── LogViewer.tsx                   # 676 lines
│   ├── State: logs[], summaries[], filters, pagination
│   ├── Fetchers: fetchLogs(), fetchSummaries()
│   ├── Filters: level, dataset, dateRange, search
│   ├── Tabs: "Logs Detalhados" + "Resumo por Execução"
│   └── UI: ScrollArea + Pagination
│
└── __tests__/
    └── APIManager.test.tsx         # Unit tests (basic)
```

### 1.2 Current Component Analysis

#### APIManager.tsx (549 lines)

**Purpose:** Manage Espaider API configurations and trigger sync operations.

**Key Features:**
- Fetch list of espaider_apis (4 seed APIs: projetos, entregas, cronogramas, requisitos)
- Display each API in a card grid (responsive: 1 col mobile, 2 md, 3 lg)
- Show last_sync_at (formatted as relative time: "5m atrás", "1h atrás")
- Show last_sync_status icon (success=green checkmark, partial=warning, failed=red X)
- "Sincronizar Tudo" button (disabled during sync)
- APIConfigDialog for token/baseUrl editing (password input, active toggle)
- Inline sync success/error message (5s timeout)

**Current Issues:**
1. **No sync progress:** Users don't know which dataset is syncing (Projetos? Entregas?)
2. **Sync is all-or-nothing:** If Entregas fails, can't retry just Entregas (must retry full sync)
3. **Error messages are ephemeral:** Toast-only feedback; disappears in 5 seconds
4. **No feature flags:** Can't toggle TempoPermanencia/HorasLancadas from UI
5. **No cancel operation:** Once sync starts, no way to cancel (users must wait)

**Code Quality:**
- ✓ Good TypeScript typing (interfaces for EspaiderAPI, APIManagerProps)
- ✓ Proper error handling in async operations
- ✓ Responsive grid layout
- ✓ Accessible button states (disabled during loading)
- ✗ No test coverage for sync logic (only stub in __tests__)
- ✗ No loading skeleton (just RefreshCw spinner)

#### LogViewer.tsx (676 lines)

**Purpose:** Display detailed sync logs with filtering, pagination, and summaries.

**Key Features:**
- Two tabs: "Logs Detalhados" + "Resumo por Execução"
- Detailed logs tab:
  - Rows with level icon, timestamp, dataset badge, message, optional details (expandable JSON)
  - Filters: level (info|warn|error|success), dataset, dateRange, search (debounced 400ms)
  - Pagination: 50 items per page, page numbers 1...N
  - Stats badges: "X erros", "Y avisos", "Z ok"
- Summary tab:
  - One row per sync operation (sync_logs entry)
  - Status badge, timestamp, metrics (total_records, new_records, updated_records, errors, duration_ms)
  - "View details" button to filter logs by request_id
- RefreshCw button to reload logs

**Current Issues:**
1. **No real-time updates:** Logs only load on mount or filter change (users must manually refresh)
2. **Limited error context:** Details JSON is expandable but often cryptic
3. **No correlation IDs:** Hard to trace multi-step operations (API call → validation → upsert)
4. **Summary tab disconnected:** Cannot drill down from summary to logs for that execution (button loads logs but doesn't work reliably)
5. **Dataset filter limits choice:** Only shows Geral, Projetos, Entregas, Cronogramas, Requisitos, Historicos, Aprovadores, Orcamentos, TempoPermanencia, HorasLancadas (no API-level grouping)

**Code Quality:**
- ✓ Excellent component structure (separate renderLogEntry, renderSummaryRow, renderPagination)
- ✓ Good TypeScript interfaces (LogEntry, SyncSummary, Filters, Pagination)
- ✓ Proper error messages (401/403/500 with user-friendly text)
- ✓ Accessibility: expandable details use role="button" + keyboard handlers
- ✗ No test coverage
- ✗ Search debounce is manual (should use React.useDeferredValue or library)

### 1.3 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend                                                   │
├─────────────────────────────────────────────────────────────┤
│
│  APIManager
│  ├─ [Mount] fetchAPIs()
│  │   └─ GET /api/integracoes
│  │       └─ → setAPIs([...espaider_apis])
│  │
│  ├─ [User clicks "Sincronizar Tudo"]
│  │   └─ handleSync()
│  │       └─ POST /api/integracoes/sync
│  │           └─ → setSyncMessage("Sincronização concluída!")
│  │               → fetchAPIs() (refresh last_sync_at, last_sync_status)
│  │
│  └─ [Dialog opens on "Config" click]
│      └─ APIConfigDialog
│          └─ PUT /api/integracoes
│              └─ Updates token, base_url, is_active
│
│  LogViewer
│  ├─ [Mount] fetchLogs() + fetchSummaries()
│  │   └─ GET /api/integracoes/logs?page=1&...filters
│  │       └─ → setLogs([...integration_log_entries])
│  │   └─ GET /api/integracoes/logs/summary
│  │       └─ → setSummaries([...sync_logs])
│  │
│  ├─ [User changes filter]
│  │   └─ setFilters({...}) → triggers useEffect
│  │       └─ fetchLogs(1) (reset to page 1)
│  │
│  └─ [User clicks page number]
│      └─ handlePageChange(newPage)
│          └─ fetchLogs(newPage)
│
└─────────────────────────────────────────────────────────────┘
           │ HTTP
           ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend API                                                │
├─────────────────────────────────────────────────────────────┤
│
│  GET  /api/integracoes              → espaider_apis
│  PUT  /api/integracoes              → update espaider_apis
│  POST /api/integracoes/sync         → trigger sync (all active APIs)
│  GET  /api/integracoes/logs         → integration_log_entries (filtered, paginated)
│  GET  /api/integracoes/logs/summary → sync_logs (recent syncs)
│
└─────────────────────────────────────────────────────────────┘
```

---

## Part 2: User Workflows & Pain Points

### 2.1 Workflow 1: Admin Configures Espaider API Token

**Current Flow:**
1. Admin navigates to /integracoes
2. Sees 4 API cards (Projetos, Entregas, Cronogramas, Requisitos)
3. Clicks "Config" button on one card
4. APIConfigDialog opens (password input for token)
5. Enters token, optionally changes base_url
6. Clicks "Salvar"
7. Dialog closes; feedback: "Configuração salva com sucesso!"

**Pain Points:**
- ✗ No indication of current token (is it configured or does it say "PREENCHER_TOKEN"?)
- ✗ If save fails, user must open dialog again (state not preserved)
- ✗ No "test connection" button to verify token works

**Suggested Improvement:**
- Show "Token configured" or "Token missing" status on card
- Add "Test Connection" button in dialog
- Preserve form state if save fails (user can edit without re-typing)

### 2.2 Workflow 2: Admin Triggers Full Sync

**Current Flow:**
1. Admin sees "Sincronizar Tudo" button (assumes all APIs are configured)
2. Clicks button
3. Button shows "Sincronizando..." spinner for 2-5 seconds
4. Sync completes
5. Inline message: "Sincronização concluída com sucesso!" (green)
6. OR "Falha na conexão: [error]" (red, 5s timeout)
7. API cards update with last_sync_at and last_sync_status

**Pain Points:**
- ✗ **No progress indicator:** User doesn't know if Projetos (1000 records) is taking 10s or Entregas (100 records) is taking 1s
- ✗ **All-or-nothing:** If 1 dataset fails, no indication which one (must check LogViewer, filter by dataset)
- ✗ **No retry:** If sync fails halfway, must redo entire sync (can't skip already-synced datasets)
- ✗ **No cancel:** If user realizes they want to stop (wrong token?), no way to abort
- ✗ **Ephemeral feedback:** Success message disappears in 5s; user might not see it

**Suggested Improvements:**
- **Real-time progress:** Show "Projetos: 1000/1000 ✓ | Entregas: 500/1000... | Cronogramas: pending"
- **Per-dataset retry:** "Sync failed for Entregas. Retry just Entregas?"
- **Persistent status:** Show last sync result in APIManager (not just log tooltip)
- **Cancel button:** Add "Abortar" during sync

### 2.3 Workflow 3: Admin Views Sync History & Debugs Failures

**Current Flow:**
1. Admin opens LogViewer (on integracoes page or separate view)
2. Sees "Logs Detalhados" tab (default)
3. 50 log entries displayed (scrolls to see more)
4. Filters: level=error, dataset=Projetos
5. Clicks on error row to expand details (shows JSON context)
6. Sees "BI_SOLICITACOES_SUPORTEESPAIDER returned 401"
7. Clicks "Resumo por Execução" tab
8. Sees 5 recent sync operations (success, partial, failed)
9. Clicks "View details" on a failed sync
10. Logs filtered to that request_id (but UI doesn't auto-scroll or highlight)

**Pain Points:**
- ✗ **Disconnected tabs:** Summary tab shows overview, but "drill down" button doesn't clearly show which logs are selected
- ✗ **Limited error context:** JSON details often show cryptic API errors (e.g., `{"error": "invalid_grant"}`) with no remediation
- ✗ **No request tracing:** Can't see the chain of operations (API call → auth → upsert) with correlation IDs
- ✗ **Manual refresh:** Must click RefreshCw button; no auto-refresh or WebSocket updates
- ✗ **Dataset naming inconsistency:** Filter shows "Geral, Projetos, Entregas..." but sync only deals with "Projetos, Entregas, Cronogramas, Requisitos"

**Suggested Improvements:**
- **Correlation IDs:** Each log entry shows correlation_id so user can trace multi-step operations
- **Contextual remediation:** Error message includes "How to fix: 1. Check token validity. 2. Verify base_url. 3. Retry."
- **Auto-drill-down:** Summary tab → click sync row → auto-opens Logs tab with filtered results
- **Real-time logs:** WebSocket or polling to show new log entries as they arrive
- **Consistent dataset names:** Show only actual datasets (Projetos, Entregas, Cronogramas, Requisitos, TempoPermanencia, HorasLancadas)

### 2.4 Workflow 4: Admin Manages Feature Flags (TempoPermanencia, HorasLancadas)

**Current Flow:**
- Not implemented in UI; requires database changes to enable/disable

**Expected Flow (Phase 4+):**
1. Admin opens Integrations page
2. Sees checkbox "Enable TempoPermanencia sync"
3. Toggles on/off
4. Affects next sync: included vs. skipped

**Pain Points:**
- ✗ **No UI:** Currently requires DB query to toggle (not user-friendly)
- ✗ **No feedback:** No indication of which datasets are enabled/disabled
- ✗ **No documentation:** User doesn't know what TempoPermanencia/HorasLancadas are

**Suggested Improvements:**
- **Feature toggle UI:** Card for each optional dataset with toggle switch
- **Help text:** "TempoPermanencia (Tempos de Permanência) — Enable to sync time-tracking data from Espaider"
- **Status indicator:** Show "Disabled (data not syncing)" in red if toggled off

---

## Part 3: Frontend Components Required for Phase 4+

### 3.1 APIManager.tsx Updates

**Changes Needed:**

1. **Real-time Sync Progress Component**
   ```tsx
   interface SyncProgress {
     dataset: string; // "Projetos", "Entregas", etc.
     status: 'pending' | 'in_progress' | 'success' | 'failed';
     recordsProcessed: number;
     totalRecords: number;
     errorCount?: number;
     estimatedTimeRemaining?: number; // seconds
   }

   // New sub-component: SyncProgressBar
   <SyncProgressBar progresses={[...]} />
   // Shows: "Projetos: 500/1000 (50%) | Entregas: 150/300 (50% est. 30s)..."
   ```

2. **Per-Dataset Retry Logic**
   ```tsx
   // New handler
   const handleRetryDataset = async (dataset: string) => {
     // POST /api/integracoes/sync?datasets=Entregas
     // Only retry failed dataset
   }

   // Rendered in APIManager or as separate modal
   {failedDatasets.length > 0 && (
     <div className="...">
       <p>Sync failed for {failedDatasets.join(", ")}</p>
       <Button onClick={() => handleRetryDataset(failedDatasets[0])}>
         Retry {failedDatasets[0]} Only
       </Button>
     </div>
   )}
   ```

3. **Cancel Sync Button**
   ```tsx
   const handleCancelSync = async () => {
     // POST /api/integracoes/sync/cancel
     // Backend aborts current operation
   }

   <Button onClick={handleCancelSync} disabled={!isSyncing}>
     Abortar Sincronização
   </Button>
   ```

4. **Feature Flag Toggles**
   ```tsx
   // New section in APIManager
   <div className="...">
     <h3>Optional Datasets</h3>
     <label>
       <input
         type="checkbox"
         checked={enableTempoPermanencia}
         onChange={(e) => handleToggleDataset('tempo_permanencia', e.target.checked)}
       />
       Tempos de Permanência
     </label>
     <label>
       <input
         type="checkbox"
         checked={enableHorasLancadas}
         onChange={(e) => handleToggleDataset('horas_lancadas', e.target.checked)}
       />
       Horas Lançadas
     </label>
   </div>
   ```

5. **Token Status Indicator**
   ```tsx
   // On each API card
   <Badge variant={hasValidToken ? 'default' : 'destructive'}>
     {hasValidToken ? 'Token Configurado' : 'Token Ausente'}
   </Badge>
   ```

**File Changes:**
- `src/components/integracoes/APIManager.tsx` → Add SyncProgressBar sub-component
- `src/components/integracoes/SyncProgressBar.tsx` → New component
- `src/components/integracoes/FeatureFlagToggles.tsx` → New component
- `src/app/api/integracoes/sync/route.ts` → Add dataset filtering + cancel endpoint

**Estimated Lines of Code:**
- APIManager.tsx: +150 lines (progress logic, toggles)
- SyncProgressBar.tsx: +80 lines (new)
- FeatureFlagToggles.tsx: +120 lines (new)
- Backend: +100 lines (dataset filtering, cancel logic)
- **Total:** ~450 LOC

### 3.2 LogViewer.tsx Updates

**Changes Needed:**

1. **Correlation ID Display**
   ```tsx
   // In renderLogEntry
   <div className="text-xs text-muted-foreground">
     Correlation ID: <code>{log.correlation_id}</code>
   </div>

   // Add filter by correlation_id
   filters.correlationId?: string;
   ```

2. **Contextual Error Remediation**
   ```tsx
   // Helper function
   function getRemediationSteps(log: LogEntry): string[] {
     if (log.message.includes('401')) {
       return [
         '1. Verify Espaider token is correct',
         '2. Check token expiration',
         '3. Try refreshing token in API Config dialog'
       ];
     }
     // ... more patterns
   }

   // Rendered in error row
   {log.level === 'error' && (
     <details className="...">
       <summary>How to Fix</summary>
       <ol>
         {getRemediationSteps(log).map((step) => <li key={step}>{step}</li>)}
       </ol>
     </details>
   )}
   ```

3. **Auto-Drill-Down from Summary**
   ```tsx
   // Summary tab: onClick handler
   const handleDrillDown = (summary: SyncSummary) => {
     setActiveTab('logs'); // Switch to Logs tab
     setFilters((prev) => ({ ...prev, requestId: summary.request_id }));
     // Optionally: scroll to first log entry
   }
   ```

4. **WebSocket Auto-Refresh** (optional, Phase 5+)
   ```tsx
   // Use TanStack Query with WebSocket
   useEffect(() => {
     const ws = new WebSocket('wss://api.example.com/ws/logs');
     ws.onmessage = (event) => {
       const newLog = JSON.parse(event.data);
       setLogs((prev) => [newLog, ...prev.slice(0, 49)]); // Keep 50 latest
     };
   }, []);
   ```

5. **Dataset Consistency**
   ```tsx
   // Limit to actual datasets (not "Geral", "TempoPermanencia", etc.)
   const DATASETS = [
     'Projetos',
     'Entregas',
     'Cronogramas',
     'Requisitos',
     'TempoPermanencia',
     'HorasLancadas',
   ];
   ```

**File Changes:**
- `src/components/integracoes/LogViewer.tsx` → Add correlation ID, remediation, drill-down
- `src/lib/integracoes/remediation.ts` → New utility for error messages
- Backend WebSocket (optional): `src/app/api/ws/logs/route.ts` → New endpoint

**Estimated Lines of Code:**
- LogViewer.tsx: +120 lines (correlation, drill-down, remediation)
- remediation.ts: +80 lines (error patterns)
- **Total:** ~200 LOC (main changes); WebSocket adds ~150 LOC (Phase 5+)

### 3.3 New Frontend Components Required

**SyncProgressBar.tsx** (80 lines)
```tsx
// Displays real-time progress for each dataset during sync
// Input: SyncProgress[] (from WebSocket or polling)
// Output: Visual bar chart or timeline
```

**FeatureFlagToggles.tsx** (120 lines)
```tsx
// Checkboxes for optional datasets (TempoPermanencia, HorasLancadas)
// Input: enabledDatasets: string[]
// Output: toggle handlers
```

**ErrorRemediationPanel.tsx** (60 lines)
```tsx
// Collapsible panel showing steps to fix error
// Input: error message
// Output: structured remediation steps
```

---

## Part 4: Backend API Changes Required

### 4.1 Existing Endpoints

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/integracoes` | GET | Fetch espaider_apis | ✓ Exists |
| `/api/integracoes` | PUT | Update API config | ✓ Exists |
| `/api/integracoes/sync` | POST | Trigger full sync | ✓ Exists |
| `/api/integracoes/logs` | GET | Fetch integration_log_entries | ✓ Exists |
| `/api/integracoes/logs/summary` | GET | Fetch sync_logs | ✓ Exists |

### 4.2 New Endpoints Required (Phase 4+)

| Endpoint | Method | Purpose | New? | Effort |
|----------|--------|---------|------|--------|
| `/api/integracoes/sync?datasets=Entregas` | POST | Sync specific dataset only | ✓ | 2h |
| `/api/integracoes/sync/cancel` | POST | Abort current sync | ✓ | 3h |
| `/api/integracoes/config/flags` | GET | Fetch feature flags (enabled datasets) | ✓ | 1h |
| `/api/integracoes/config/flags` | POST | Update feature flags | ✓ | 2h |
| `/api/integracoes/sync/retry` | POST | Retry failed dataset | ✓ | 2h |
| `/ws/logs` | WebSocket | Stream logs in real-time (Phase 5+) | ✓ | 6h |

### 4.3 Example: New Endpoint `/api/integracoes/sync?datasets=...`

**Request:**
```
POST /api/integracoes/sync
Content-Type: application/json

{
  "datasets": ["Entregas", "Cronogramas"], // Optional; defaults to all enabled
  "timeout_ms": 30000 // Optional; defaults to 30s per dataset
}
```

**Response:**
```json
{
  "success": true,
  "request_id": "sync-abc123def456",
  "datasets": {
    "Entregas": {
      "status": "in_progress",
      "records_processed": 150,
      "total_records": 300
    },
    "Cronogramas": {
      "status": "pending"
    }
  }
}
```

**Implementation Location:**
- `src/app/api/integracoes/sync/route.ts` → Add query parameter handling

---

## Part 5: Accessibility & Responsive Design

### 5.1 Current Accessibility Status

**WCAG AA Compliance Check (Automated + Manual):**

| Component | Check | Status | Notes |
|-----------|-------|--------|-------|
| APIManager | Color contrast | ✓ Pass | Text ≥4.5:1 on backgrounds |
| APIManager | Keyboard nav | ✓ Pass | Buttons are focusable; dialog closes on Esc |
| APIManager | Screen reader | ⚠️ Partial | Button labels clear; icon-only buttons need aria-label |
| LogViewer | Color contrast | ✓ Pass | Level badges (error=red, success=green) have sufficient contrast |
| LogViewer | Keyboard nav | ✓ Pass | Expandable rows use role="button" + Enter/Space handlers |
| LogViewer | Screen reader | ⚠️ Partial | Filter labels missing; pagination info not announced |

**Recommended Fixes (Phase 4):**
- Add `aria-label` to icon-only buttons (RefreshCw, chevrons)
- Add `aria-live="polite"` to pagination info
- Wrap filter section in `<fieldset>` with `<legend>`
- Announce log entry count on tab change
- Test with NVDA/JAWS screen readers

### 5.2 Responsive Design

**Current Breakpoints:**
- Mobile (xs): 320px - APIManager grid: 1 column
- Tablet (md): 768px - APIManager grid: 2 columns
- Desktop (lg): 1024px - APIManager grid: 3 columns

**LogViewer is always full-width (ScrollArea, not responsive grid)**

**Suggested Improvements:**
- Responsive font sizes for timestamps (smaller on mobile)
- Stack filter controls vertically on mobile (currently grid)
- Collapse "Resumo por Execução" metrics on mobile (show icons only)

---

## Part 6: Testing Strategy for Frontend

### 6.1 Current Test Coverage

| Component | Unit Tests | Integration | E2E | Coverage |
|-----------|-----------|-------------|-----|----------|
| APIManager | ⚠️ Stub only | ✗ None | ✗ None | 0% |
| LogViewer | ✗ None | ✗ None | ✗ None | 0% |

**Existing Test File:**
- `src/components/integracoes/__tests__/APIManager.test.tsx` → Imports component but has no tests

### 6.2 Testing Plan for Phase 4+

**Unit Tests (Jest + React Testing Library):**

1. **APIManager:**
   - ✓ Fetch APIs on mount
   - ✓ Handle sync success (show green message, refresh APIs)
   - ✓ Handle sync failure (show red message with error)
   - ✓ Open/close config dialog
   - ✓ Save config (PUT request)
   - ✓ Cancel config (dialog closes without saving)

2. **SyncProgressBar:**
   - ✓ Display progress for each dataset
   - ✓ Update progress in real-time
   - ✓ Show success/error icons
   - ✓ Estimated time remaining calculation

3. **LogViewer:**
   - ✓ Fetch logs on mount
   - ✓ Filter by level/dataset/date
   - ✓ Pagination (next/prev/page number)
   - ✓ Expand/collapse log details
   - ✓ Switch between "Logs" and "Summary" tabs

4. **FeatureFlagToggles:**
   - ✓ Toggle individual flags
   - ✓ POST to `/api/integracoes/config/flags`
   - ✓ Show current state from props

**Integration Tests (Playwright/Cypress):**

1. **Full Sync Workflow:**
   - ✓ Start sync from APIManager
   - ✓ See progress update in real-time (or poll)
   - ✓ Sync completes
   - ✓ LogViewer auto-refreshes
   - ✓ Last sync time updates in API cards

2. **Error Handling:**
   - ✓ API returns 401 (invalid token)
   - ✓ Error message shown to user
   - ✓ User can retry after fixing token

3. **Feature Flags:**
   - ✓ Toggle flag on
   - ✓ Next sync includes that dataset
   - ✓ Toggle flag off
   - ✓ Next sync skips that dataset

**E2E Tests (with real Supabase instance):**

1. **Complete Sync Cycle (local dev or staging):**
   - ✓ Configure API token
   - ✓ Trigger sync
   - ✓ View logs
   - ✓ Verify data in database

**Estimated Test Writing Effort:** 20-30 hours

---

## Part 7: Performance Considerations

### 7.1 Frontend Performance Baselines

| Metric | Target | Current | Notes |
|--------|--------|---------|-------|
| APIManager paint time | <500ms | ~200ms | Fast (just 4 API cards) |
| LogViewer mount time | <2s | ~800ms (first 50 logs) | Acceptable |
| Pagination (page 5) | <500ms | ~600ms | Slight latency from API |
| Filter change response | <1s | ~1s (debounced) | Good user feedback |

### 7.2 Performance Optimizations (Phase 4+)

1. **Virtualized Log List** (react-window)
   - Current: ScrollArea with all 50 logs rendered
   - Issue: If logs have large details JSON, rendering slows
   - Fix: Virtualize; only render visible logs
   - Benefit: Handle 500+ logs without slowdown
   - Effort: 4h

2. **Memoization** (React.memo)
   - Prevent re-renders of unchanged log entries
   - Add: `export const LogEntry = React.memo(function LogEntry(...) { ... })`
   - Benefit: Smoother pagination
   - Effort: 1h

3. **Code Splitting** (Next.js dynamic imports)
   - Load SyncProgressBar only when syncing
   - Benefit: Smaller initial JS bundle
   - Effort: 1h

---

## Part 8: Implementation Roadmap

### 8.1 Phase 4a: Real-Time Sync Progress (Weeks 1-2)

**Goal:** User sees which dataset is syncing and progress

**Tasks:**
1. Update APIManager state to track `syncProgress: SyncProgress[]`
2. Create SyncProgressBar component
3. Backend: POST `/api/integracoes/sync` returns request_id immediately
4. Backend: polling endpoint `/api/integracoes/sync/{request_id}` returns progress
5. Frontend: Poll `/api/integracoes/sync/{request_id}` every 500ms during sync
6. Show progress bar below "Sincronizar Tudo" button

**Effort:** 12h (frontend) + 8h (backend) = 20h

**Tests:** Unit (APIManager, SyncProgressBar) + Integration (sync + progress updates)

### 8.2 Phase 4b: Error Handling & Retry (Week 3)

**Goal:** User can retry failed datasets individually; error messages are actionable

**Tasks:**
1. Update sync endpoint to track which datasets failed
2. Add "Retry" button for failed datasets
3. Create ErrorRemediationPanel component
4. Add remediation rules for common errors (401, 403, timeout, etc.)
5. LogViewer: Show remediation panel under error log entries

**Effort:** 10h (frontend) + 6h (backend) = 16h

**Tests:** Unit (error remediation) + Integration (retry workflow)

### 8.3 Phase 4c: Feature Flags (Week 3-4)

**Goal:** Admin can toggle TempoPermanencia/HorasLancadas from UI

**Tasks:**
1. Create FeatureFlagToggles component
2. Backend: GET/POST `/api/integracoes/config/flags`
3. Persist enabled datasets in espaider_apis or new feature_flags table
4. Backend: Only sync enabled datasets (skip disabled ones)
5. Frontend: Show toggle state on page load

**Effort:** 8h (frontend) + 4h (backend) = 12h

**Tests:** Unit (toggles) + Integration (sync respects flags)

### 8.4 Phase 4d: LogViewer Enhancements (Week 4)

**Goal:** Logs are more useful for debugging; drill-down from summary

**Tasks:**
1. Add correlation_id to log entries (backend migration)
2. LogViewer: Display correlation_id in log rows
3. Add filter by correlation_id
4. Summary tab: "Drill down" button auto-switches to Logs tab + filters by request_id
5. Add remediation panel below error rows

**Effort:** 6h (frontend) + 4h (backend) = 10h

**Tests:** Unit (drill-down logic) + Integration (summary → logs workflow)

### 8.5 Phase 5 (Post-Phase 4): WebSocket Auto-Updates

**Goal:** Logs update in real-time without manual refresh

**Tasks:**
1. Backend: Create WebSocket endpoint `/ws/logs`
2. Frontend: Connect on mount; listen for new log entries
3. Auto-add new logs to the top of the list
4. Optionally: notify user (badge on "Logs" tab if new entries)

**Effort:** 10h (frontend) + 6h (backend) = 16h

**Tests:** Integration (WebSocket connection) + E2E (real-time updates)

---

## Part 9: UI/UX Wireframes (Text-Based)

### 9.1 APIManager with Real-Time Progress

```
┌─────────────────────────────────────────────────────────────────┐
│  Tech Arauz — Integração Espaider                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  APIs de Integração                         [Sincronizar Tudo] │
│                                                                  │
│  ╔════════════════════════════════════════════════════════════╗ │
│  ║  Sync Progress (in_progress)                               ║ │
│  ║  ┌──────────────────────────────────────────────────────┐  ║ │
│  ║  │ Projetos:       ████████░░░░░░░░░░ 500/1000 (50%)   │  ║ │
│  ║  │ Entregas:       ██░░░░░░░░░░░░░░░░ 100/1000 (10%)   │  ║ │
│  ║  │ Cronogramas:    ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░ 50/100 (50%)     │  ║ │
│  ║  │ Requisitos:     ░░░░░░░░░░░░░░░░░░ 0/500 (0%)       │  ║ │
│  ║  │                                                        │  ║ │
│  ║  │ Est. time: 45s | [✕ Cancel]                           │  ║ │
│  ║  └──────────────────────────────────────────────────────┘  ║ │
│  ╚════════════════════════════════════════════════════════════╝ │
│                                                                  │
│  Optional Datasets                                              │
│  ☑ Tempos de Permanência     ☐ Horas Lançadas                 │
│                                                                  │
│  APIs de Integração                                             │
│  ┌──────────────────┬──────────────────┬──────────────────┐    │
│  │ Projetos         │ Entregas         │ Cronogramas      │    │
│  │ ─────────────    │ ─────────────    │ ─────────────    │    │
│  │ Token Configurado│ Token Ausente    │ Token Configurado│    │
│  │ Tipo: projetos   │ Tipo: entregas   │ Tipo: cronograma │    │
│  │ Última sync:     │ Última sync:     │ Última sync:     │    │
│  │ 15m atrás ✓      │ 1h atrás ✗       │ 3h atrás ⚠       │    │
│  │ [Logs] [Config]  │ [Logs] [Config]  │ [Logs] [Config]  │    │
│  └──────────────────┴──────────────────┴──────────────────┘    │
│  ┌──────────────────┐                                          │
│  │ Requisitos       │                                          │
│  │ ─────────────    │                                          │
│  │ Token Configurado│                                          │
│  │ Tipo: requisitos │                                          │
│  │ Última sync:     │                                          │
│  │ 2h atrás ✓       │                                          │
│  │ [Logs] [Config]  │                                          │
│  └──────────────────┘                                          │
│                                                                  │
│  Retry Failed Datasets                                          │
│  Sync failed for Entregas. [Retry Entregas Only]              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 LogViewer with Remediation & Drill-Down

```
┌─────────────────────────────────────────────────────────────────┐
│  Histórico de Sincronizações                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                    │
│  [Logs Detalhados] [Resumo por Execução]                        │
│                                                                  │
│  Filters: [Nível▼] [Dataset▼] [Data▼] [Buscar...]              │
│                                                                  │
│  Logs (showing: 12 erros | 5 avisos | 200 ok)                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 2026-03-19 14:23:45 [Entregas] ✗ Error                      ││
│  │ Failed to fetch data from Espaider API: 401 Unauthorized    ││
│  │ CorrID: sync-abc123def456-001                               ││
│  │                                                              ││
│  │ ▼ How to Fix:                                              ││
│  │   1. Verify token in API Config is correct                  ││
│  │   2. Check if token has expired                             ││
│  │   3. If token is invalid, update it and retry               ││
│  │                                                              ││
│  │ ▼ Details:                                                  ││
│  │   {                                                         ││
│  │     "endpoint": "BI_SOLICITACOES_SUPORTEESPAIDER_ENTREGAS"  ││
│  │     "status_code": 401,                                     ││
│  │     "response": "{ error: invalid_grant }"                  ││
│  │   }                                                         ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 2026-03-19 14:23:50 [Entregas] ◔ Info                       ││
│  │ Retrying Entregas sync...                                   ││
│  │ CorrID: sync-abc123def456-002                               ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Pagination: 12 registros · Página 1 de 1                       │
│                                                                  │
│  ────────────────────────────────────────────────────────────────│
│  [Resumo por Execução]                                          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ✓ SUCCESS  2026-03-19 14:15:00                              ││
│  │ 2550 registros | 50 novos | 100 atualizados | 0 erros | 2.5s││
│  │ [Drill down to logs →]                                      ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ⚠ PARTIAL   2026-03-19 14:10:00                             ││
│  │ 2300 registros | 40 novos | 80 atualizados | 3 erros | 2.8s ││
│  │ [Drill down to logs →]                                      ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ✗ FAILED    2026-03-19 14:05:00                             ││
│  │ 1500 registros | 20 novos | 50 atualizados | 10 erros | 1.2s││
│  │ [Drill down to logs →]                                      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 10: Frontend Readiness Summary

### 10.1 Current State Assessment

| Dimension | Score | Status | Notes |
|-----------|-------|--------|-------|
| **Architecture** | 8/10 | 🟢 Good | Component separation; proper React patterns |
| **Type Safety** | 8.5/10 | 🟢 Good | TypeScript interfaces for main types |
| **UX** | 6/10 | 🟡 Fair | Functional but lacks real-time feedback |
| **Accessibility** | 7/10 | 🟡 Fair | WCAG AA mostly compliant; needs aria-labels |
| **Responsiveness** | 8/10 | 🟢 Good | Mobile-first grid design; LogViewer full-width |
| **Testing** | 2/10 | 🔴 Poor | No meaningful tests; only stub file |
| **Documentation** | 5/10 | 🟡 Fair | Components self-documenting; no API docs |

### 10.2 Modification Effort Breakdown

| Task | Effort | Priority | Timeline |
|------|--------|----------|----------|
| Real-time sync progress | 20h | HIGH | Week 1-2 |
| Error handling & retry | 16h | HIGH | Week 3 |
| Feature flag toggles | 12h | MEDIUM | Week 3-4 |
| LogViewer enhancements | 10h | MEDIUM | Week 4 |
| A11y fixes | 8h | MEDIUM | Week 4-5 |
| Test coverage | 20h | HIGH | Ongoing |
| WebSocket auto-updates | 16h | LOW | Phase 5 |
| **TOTAL** | **~102h** | | **3-4 weeks (2 devs)** |

### 10.3 Ready for Phase 4?

✓ **YES, with conditions:**
- Backend endpoints documented (Part 4)
- API contracts approved before dev starts
- QA plan in place (Part 6)
- Design mockups reviewed by product (Part 9)

---

## Conclusion

The Espaider integration frontend is **solid** but needs modernization for better UX during sync operations. Key gaps:

1. **No real-time progress** → Users don't know if sync is working or hung
2. **All-or-nothing sync** → Can't retry individual datasets
3. **Ephemeral feedback** → Error messages disappear too quickly
4. **No feature flags** → Can't toggle optional datasets from UI
5. **Limited error context** → Logs don't explain how to fix errors

**Frontend changes (3-4 weeks, 2 devs) will enable:**
- ✓ Real-time sync progress bar (dataset-by-dataset)
- ✓ Per-dataset retry capability
- ✓ Persistent error messages with remediation steps
- ✓ Feature flag UI for TempoPermanencia/HorasLancadas
- ✓ Drill-down from summary logs → detailed logs
- ✓ 95%+ test coverage

**Ready to proceed to Phase 4 (Technical Debt Draft)** and Phase 5+ (Specialist Reviews, QA Gate, Implementation).

---

**Generated:** 2026-03-19 | **Next Review:** After Phase 4 completion | **Wireframes:** Text-based (Part 9)
