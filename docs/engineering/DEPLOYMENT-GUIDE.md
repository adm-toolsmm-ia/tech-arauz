# Deployment Guide — Vercel, Migrations, Rollback (AIOX 10/10)

**Version:** 0.2.3 (Production Live)
**Last Updated:** 2026-03-14
**Status:** Authoritative
**Platform:** Vercel + Supabase

---

## Deployment Checklist

- [ ] Code merged to main
- [ ] All tests pass
- [ ] Database migrations reviewed (if any)
- [ ] Environment variables verified
- [ ] Release notes generated
- [ ] Version bumped (semantic versioning)
- [ ] Git tag created

---

## Production Release Process

### Step 1: Prepare Release

```bash
# Update version
npm version patch  # 0.2.2 → 0.2.3 (or minor/major)

# Generate changelog
git log --oneline main..last-release > CHANGELOG.md
```

### Step 2: Deploy to Vercel

```bash
# Merge to main
git push origin feature-branch
gh pr create && gh pr merge

# Vercel auto-deploys from main
# (GitHub integration)
```

### Step 3: Database Migrations

If schema changes:

```bash
# Apply migrations
npm run db:apply

# Verify
supabase migration list
```

### Step 4: Verify Deployment

```bash
# Health check
curl https://tech-arauz.vercel.app/api/health

# Test core functionality
# - Login
# - View projects
# - Sync Espaider
```

---

## Rollback Procedure

**If critical issue found:**

```bash
# Option 1: Redeploy previous version
vercel rollback  # or via Vercel dashboard

# Option 2: Revert commit + redeploy
git revert HEAD
git push origin main
# (Vercel auto-deploys)
```

---

## Versioning

- **Major (x.0.0):** Breaking changes
- **Minor (0.x.0):** New features
- **Patch (0.0.x):** Bug fixes

Current: **v0.2.3** (3 patches on 0.2)

---

## Environment Variables

**Production (Vercel Secrets):**

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_KEY
SUPABASE_TOKEN (service role)
OPENROUTER_API_KEY
DATABASE_URL
```

---

**Authored by:** Claude Code (Haiku 4.5)
**Framework:** Synkra AIOX v1.0.0
**Last Reviewed:** 2026-03-14
