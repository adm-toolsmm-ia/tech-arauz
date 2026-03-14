# Code Review Standards — CodeRabbit, Security, Performance (AIOX 10/10)

**Version:** 0.2.3 (Production Live)
**Status:** Authoritative

---

## Checklist (7 Points)

### 1. Lint & Format
```bash
npm run lint  # Zero errors
npm run format:check  # Code style
```

### 2. TypeScript
```bash
npm run typecheck  # Zero errors, strict mode
```

### 3. Tests
```bash
npm run test  # All pass, ≥85% coverage
```

### 4. No Secrets
- No API keys in code
- No credentials in strings
- All config via env vars

### 5. Error Handling
- Try/catch on async
- Error boundaries on React
- User-friendly error messages

### 6. Accessibility (WCAG AA)
- Semantic HTML
- ARIA labels on interactive elements
- Keyboard navigation
- Focus indicators

### 7. Documentation
- Comments on complex logic
- Commit message clear + story ID
- README updated (if user-facing)

---

## CodeRabbit

Auto-review on every PR. Checks:
- Security (SQLi, XSS, exposed secrets)
- Performance (N+1 queries, large bundles)
- Code style (consistency, simplicity)
- Test coverage (new code tested)

---

**Authored by:** Claude Code (Haiku 4.5)
