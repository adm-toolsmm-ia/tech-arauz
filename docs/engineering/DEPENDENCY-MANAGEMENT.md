# Dependency Management — Package Governance (AIOX 10/10)

**Version:** 0.2.3
**Status:** Policy & checklist

---

## Current Dependencies

**Major Versions (locked):**
- Next.js: 14.2.0
- React: 18.3.0
- TypeScript: 5.5.0
- Tailwind: 3.4.0
- Supabase: 2.45.0
- TanStack Query: 5.50.0

**Total:** 60+ dependencies

---

## Update Strategy

- **Patch (0.0.x):** Auto-apply (security fixes)
- **Minor (0.x.0):** Review, apply if no breaking changes
- **Major (x.0.0):** Flag to @architect, only if necessary

---

## Security Scanning

```bash
npm audit
# → Shows vulnerabilities
# → Fix: npm audit fix

# Pre-commit hook runs npm audit
# Fails if critical vulnerabilities found
```

---

## Adding Dependencies

**Before adding:**
1. Is it necessary? (don't bloat bundle)
2. Is it maintained? (active commits, no security issues)
3. Size check: `npm bundle-report`

---

**Authored by:** Claude Code (Haiku 4.5)
