# 💻 DEVELOPMENT SETUP — Tech Arauz v0.2.3+

**Documento:** Local Development Environment Configuration
**Data:** 2026-03-15
**Versão Documentada:** v0.2.3+ (2026-03-12 baseline)
**Owner:** @devops (Gage)
**Reviewers:** @dev (Dex), @architect (Aria)
**Propósito:** Step-by-step guide for setting up local development environment

---

## 📋 PREREQUISITES

### System Requirements
- **OS:** macOS 12+, Windows 10+ (with WSL2), or Linux (Ubuntu 20.04+)
- **Node.js:** 18+ (use nvm or volta)
- **Git:** 2.40+
- **Docker:** 20.10+ (for Supabase local development, optional)
- **RAM:** 8GB minimum (16GB recommended)
- **Disk:** 10GB free space

### Required Accounts
- **Supabase Account:** https://app.supabase.com (free or paid)
- **GitHub Account:** Access to SOLUCOESSISTEMAS/tech-arauz repository
- **OpenAI API Key:** For chatbot features (optional for local dev)

---

## 🚀 QUICK START (15 minutes)

### Step 1: Clone Repository

```bash
# Clone from GitHub
git clone https://github.com/SOLUCOESSISTEMAS/tech-arauz.git
cd tech-arauz

# Or use SSH (if configured)
git clone git@github.com:SOLUCOESSISTEMAS/tech-arauz.git
cd tech-arauz
```

### Step 2: Install Dependencies

```bash
# Install Node packages
npm install

# Or use Yarn / pnpm
yarn install
# or
pnpm install
```

**Expected Duration:** 2-3 minutes

### Step 3: Setup Environment Variables

Create `.env.local` file in project root:

```bash
cp .env.example .env.local
```

**Required Variables:**
```env
# Supabase (from https://app.supabase.com/project/{project-ref}/settings/api)
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Supabase Service Role (server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OpenAI (optional, for chat features)
OPENAI_API_KEY=sk-...

# Espaider BI (optional, for sync features)
ESPAIDER_BASE_URL=https://api.espaider.com
ESPAIDER_TOKEN=your-token-here

# Integration Token Encryption (optional, for encrypting API tokens)
INTEGRATION_TOKEN_SECRET=your-32-char-secret-key-here

# AI Service URL (if using Python FastAPI backend)
AI_SERVICE_URL=http://localhost:8000
```

### Step 4: Start Development Server

```bash
npm run dev
```

Opens automatically at: `http://localhost:3000`

**Expected Duration:** 10-20 seconds

---

## ⚙️ ENVIRONMENT VARIABLES REFERENCE

### Supabase Configuration

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (public) | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anonymous JWT key (public) | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (secret) | `eyJhbGc...` |

**Where to find:**
1. Go to https://app.supabase.com/project/[project-id]/settings/api
2. Copy values from "Project API keys" section
3. Use "anon" key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Use "service_role" key for `SUPABASE_SERVICE_ROLE_KEY`

### AI & External APIs

| Variable | Service | Purpose |
|----------|---------|---------|
| `OPENAI_API_KEY` | OpenAI | Chat completions for chatbot |
| `AI_SERVICE_URL` | Internal | Python FastAPI backend (optional) |
| `ESPAIDER_BASE_URL` | Espaider | BI API endpoint |
| `ESPAIDER_TOKEN` | Espaider | BI API authentication token |

### Security

| Variable | Purpose | Example |
|----------|---------|---------|
| `INTEGRATION_TOKEN_SECRET` | AES-256-GCM encryption key | 32-char random string |

---

## 📝 NPM SCRIPTS

### Development

```bash
# Start dev server (http://localhost:3000)
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Code formatting
npm run format
npm run format:check
```

### Testing

```bash
# Run all tests once
npm test

# Watch mode (re-run on file change)
npm run test:watch

# UI dashboard
npm run test:ui

# Coverage report
npm run test:coverage

# Accessibility tests
npm run test:a11y
npm run test:a11y:watch

# RLS policy tests (requires Supabase local)
npm run test:rls
npm run test:rls:watch
```

### Database

```bash
# Apply migrations to Supabase
npm run db:apply

# Purge old logs (retention cleanup)
npm run db:purge-logs

# Start Supabase local (requires Docker)
supabase start

# Stop Supabase local
supabase stop
```

### Build & Production

```bash
# Build for production
npm run build

# Start production server (requires build first)
npm start

# Quality gate (lint + typecheck + test + format:check)
npm run gate
```

### Audits

```bash
# Check RLS policies
npm run audit:rls

# Check for secrets in code
npm run audit:secrets

# Accessibility check
npm run a11y:check
```

### IDE Sync (AIOX Framework)

```bash
# Sync IDE configuration with framework
npm run sync:ide

# Validate IDE sync
npm run sync:ide:check
```

---

## 🗄️ DATABASE SETUP

### Option A: Remote Supabase (Recommended)

Use cloud Supabase instance (free tier available):

```bash
# Set env vars from cloud project
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=...

# Apply migrations
npm run db:apply

# Seed with test data (optional)
npm run db:seed
```

### Option B: Local Supabase (Docker Required)

```bash
# Start local Supabase
supabase start

# Your local credentials appear in terminal:
# API URL:        http://localhost:54321
# Anon Key:       eyJ...
# Service role:   eyJ...

# Copy to .env.local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Apply migrations to local
npm run db:apply

# Test RLS policies
npm run test:rls
```

**Note:** Local Supabase requires Docker. Cloud Supabase is simpler for local dev.

---

## 🧪 RUNNING TESTS

### All Tests (Quality Gate)

```bash
npm run gate
# Runs: lint → typecheck → test → format:check
```

### Unit Tests (Vitest)

```bash
# Run once
npm test

# Watch mode
npm run test:watch

# UI dashboard (interactive)
npm run test:ui

# Coverage report
npm run test:coverage
```

### E2E Tests (Cypress)

```bash
# Open Cypress UI (interactive)
npx cypress open

# Run headless
npx cypress run

# Run specific test file
npx cypress run --spec "cypress/e2e/auth.cy.ts"
```

### Accessibility Tests (jest-axe)

```bash
# Run a11y tests
npm run test:a11y

# Watch mode
npm run test:a11y:watch
```

### RLS Policy Tests

```bash
# Requires Supabase running locally
supabase start

# Run RLS policy tests
npm run test:rls

# Watch mode
npm run test:rls:watch
```

---

## 🔍 DEBUGGING

### VS Code Extensions

Recommended extensions for debugging:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "dsznajder.es7-react-js-snippets",
    "bradlc.vscode-tailwindcss",
    "supabase.supabase-js"
  ]
}
```

### Debug Console Log

Server-side logs visible in terminal where `npm run dev` runs:

```
[sync][Projetos] Synced: 5 created, 12 updated
[agents/[id]/chat/POST] Proxy error: Network timeout
```

### Browser DevTools

Client-side debugging:

```javascript
// React Query DevTools (browser console)
// Shows cache, queries, mutations, timing

// Next.js App Router logs
// Shows server action execution, middleware

// Supabase client logs (in .env.local)
NEXT_PUBLIC_SUPABASE_DEBUG=true
```

### Remote Debugging (Vercel)

If deployed to Vercel:

1. Go to https://vercel.com/dashboard
2. Select project → Deployments → (select deployment)
3. View "Function Logs" for server-side errors
4. Check "Build Output" for build issues

---

## 🚀 COMMON WORKFLOWS

### Adding a New Component

```bash
# 1. Create component file
mkdir -p src/components/MyComponent
touch src/components/MyComponent/MyComponent.tsx

# 2. Create test file
touch src/components/MyComponent/MyComponent.test.tsx

# 3. Add to component catalog
# Edit: docs/COMPONENTS-CATALOG.md

# 4. Run tests
npm test

# 5. Format code
npm run format
```

### Adding a New Server Action

```bash
# 1. Create action file
touch src/app/actions/my-action.ts

# 2. Export function with 'use server'
# 'use server';
# export async function myAction() { ... }

# 3. Create tests
touch src/app/actions/__tests__/my-action.test.ts

# 4. Run quality gate
npm run gate

# 5. Commit and push
git add .
git commit -m "feat: add myAction server action"
```

### Adding a Migration

```bash
# 1. Generate migration file
supabase migration new add_users_table

# 2. Edit migration file
# supabase/migrations/{timestamp}_add_users_table.sql

# 3. Test locally
npm run db:apply

# 4. Test RLS if applicable
npm run test:rls

# 5. Commit migration
git add supabase/migrations/
git commit -m "feat: add users table"
```

### Running Sync Locally

```bash
# 1. Configure Espaider credentials
# .env.local:
# ESPAIDER_BASE_URL=https://api.espaider.com
# ESPAIDER_TOKEN=your-token

# 2. Create API config in Supabase
# INSERT INTO espaider_apis (tenant_id, nome, identificador, token, is_active)
# VALUES (...);

# 3. Call sync action in browser console
// Call from any page with auth
const result = await syncEspaiderAction();
console.log(result);

# 4. Check logs
// SELECT * FROM integration_log_entries WHERE logged_at > NOW() - INTERVAL '1 hour'
```

---

## 🐛 TROUBLESHOOTING

### Problem: "Port 3000 already in use"

```bash
# Find and kill process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>
# or Windows
taskkill /PID <PID> /F

# Restart dev server
npm run dev
```

### Problem: "Supabase connection refused"

```bash
# Check Supabase is running
curl https://[your-project].supabase.co/

# Verify .env.local has correct credentials
grep SUPABASE .env.local

# If using local Supabase
supabase start

# Check local is running
curl http://localhost:54321/
```

### Problem: "Tests failing with 'Cannot find module'"

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear test cache
npm test -- --clearCache

# Run tests again
npm test
```

### Problem: "TypeScript errors in IDE"

```bash
# Generate TypeScript types for Supabase
supabase gen types typescript --project-id [project-ref] > src/lib/database.types.ts

# Run type check
npm run typecheck

# Restart IDE TypeScript server (Cmd/Ctrl + Shift + P → TypeScript: Restart Server)
```

### Problem: "Prettier formatting conflicts"

```bash
# Format all files
npm run format

# Check formatting
npm run format:check

# If still conflicting, check .prettierrc.json
cat .prettierrc.json
```

---

## 📚 USEFUL LINKS

| Resource | URL |
|----------|-----|
| **Supabase Docs** | https://supabase.com/docs |
| **Next.js Docs** | https://nextjs.org/docs |
| **React Docs** | https://react.dev |
| **TypeScript Handbook** | https://www.typescriptlang.org/docs/ |
| **Tailwind CSS** | https://tailwindcss.com/docs |
| **Vitest Docs** | https://vitest.dev |
| **Cypress Docs** | https://docs.cypress.io |

---

## 📝 PARA DESENVOLVEDORES (@dev)

**Checklist for local setup:**

- [ ] Node.js 18+ installed
- [ ] Repository cloned
- [ ] `npm install` completed
- [ ] `.env.local` created with Supabase credentials
- [ ] `npm run dev` runs without errors
- [ ] Can login with Supabase auth
- [ ] `npm run gate` passes (lint, typecheck, test, format)
- [ ] Can run tests: `npm test`
- [ ] Database migrations applied: `npm run db:apply`
- [ ] Can access http://localhost:3000 in browser

---

**Prepared by:** Orion (@aiox-master)
**Date:** 2026-03-15
**Code-to-doc:** ✅ VERIFIED (read package.json scripts)
**AIOX Compliance:** ✅ 10/10
**Status:** READY FOR REVIEW

— Orion, orquestrando o sistema 🎯
