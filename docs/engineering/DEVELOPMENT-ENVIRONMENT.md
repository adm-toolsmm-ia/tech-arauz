# Development Environment — Setup & Debugging (AIOX 10/10)

**Version:** 0.2.3
**Status:** Setup guide for new devs

---

## Prerequisites

- Node.js 18+
- Git
- GitHub CLI
- Supabase CLI (optional)

---

## Initial Setup

```bash
# Clone
git clone https://github.com/YOUR-ORG/tech-arauz.git
cd tech-arauz

# Install dependencies
npm install

# Setup env variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Start dev server
npm run dev
# → Open http://localhost:3000
```

---

## Development Commands

```bash
npm run dev          # Start dev server
npm run lint         # Check code style
npm run typecheck    # TypeScript validation
npm run test         # Run tests
npm run test:watch   # Watch mode
npm run format       # Auto-fix formatting
npm run storybook    # Component library
```

---

## Debugging

### Browser DevTools
- F12: Open DevTools
- Sources tab: Set breakpoints
- Network tab: Inspect API calls
- Console: Check logs/errors

### Server-Side Debugging
```bash
# Enable debug output
export DEBUG=*
npm run dev

# Check server logs
tail -f .next/logs
```

---

## Common Issues

**Issue:** `ENOENT: no such file or directory`
```bash
# Solution: Reinstall node_modules
rm -rf node_modules package-lock.json
npm install
```

**Issue:** Port 3000 already in use
```bash
# Solution: Use different port
npm run dev -- -p 3001
```

---

**Authored by:** Claude Code (Haiku 4.5)
