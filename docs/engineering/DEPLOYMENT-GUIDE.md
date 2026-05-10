# Deployment Guide — Vercel, Migrations, Rollback (AIOX 10/10)

**Version:** 0.2.4 (EPIC 11 Deployment Hardened)
**Last Updated:** 2026-05-09
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
# Apply migrations in the validated EPIC 11 order
npm run db:apply

# Verify
supabase migration list
```

Validated deployment chain:

```yaml
075 → 076 → 077
```

Notes:

- `075_knowledge_hub_schema.sql` must use trigger-maintained `search_vector` for `documents`.
- `076_knowledge_graph_function.sql` depends on the links created by 075.
- `077_harden_org_tenant_integrity.sql` is the required hardening step after the knowledge hub batch.
- Do not run the optional embeddings step until the 075 → 076 → 077 batch and validation pass.

### Step 4: Verify Deployment

```bash
# Health check
curl https://tech-arauz.vercel.app/api/health

# Test core functionality
# - Login
# - View projects
# - Sync Espaider
```

### Step 5: Supabase Validation

After the migration chain is applied, verify the hardened schema in Supabase:

```bash
# Confirm the applied migration order includes the hardening step
supabase migration list

# Confirm the hardened migration is present and successful
# 077_harden_org_tenant_integrity.sql
```

Validation should confirm:

- `066 → 067 → 068 → 069 → 070 → 077` completed successfully
- RLS remains enabled on the EPIC 11 relation tables hardened by `077`
- Optional `071` embeddings is still pending unless explicitly approved

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

**If the issue is in migration 077 hardening:**

- Stop before applying any optional `071` embeddings step.
- Sanitize legacy `org_*` relation rows that violate tenant integrity.
- Re-run `supabase migration list` to confirm `077_harden_org_tenant_integrity.sql` is the last required EPIC 11 migration applied.
- Only proceed once Supabase validation confirms the hardened migration and RLS state are clean.

---

## Versioning

- **Major (x.0.0):** Breaking changes
- **Minor (0.x.0):** New features
- **Patch (0.0.x):** Bug fixes

Current: **v0.2.4** (EPIC 11 hardened deployment sequence)

---

## Environment Variables

**Production (Vercel Secrets):**

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENROUTER_API_KEY
DATABASE_URL
```

---

**Authored by:** Claude Code (Haiku 4.5)
**Framework:** Synkra AIOX v1.0.0
**Last Reviewed:** 2026-05-09
