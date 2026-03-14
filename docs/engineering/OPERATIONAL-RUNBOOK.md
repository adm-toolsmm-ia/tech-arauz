# Operational Runbook — Monitoring, Incidents, Troubleshooting (AIOX 10/10)

**Version:** 0.2.3 (Production Live)
**Status:** Quick reference for ops

---

## Health Checks

**Application:**
```bash
curl https://tech-arauz.vercel.app/api/health
# Response: { "status": "ok" }
```

**Database:**
```bash
supabase status
# Check: Connection OK, no errors
```

**Key Metrics:**
- Vercel analytics: https://vercel.com/dashboard
- Uptime: Expect >99.9%
- Latency P95: < 50ms

---

## Common Issues

### Issue: Projects not loading
**Cause:** Supabase down or RLS policy error
**Fix:**
```bash
# Check DB
supabase status

# Verify RLS policy
SELECT * FROM pg_policies WHERE schemaname='public';

# Test query
SELECT * FROM projects LIMIT 1;
```

### Issue: Slow queries
**Cause:** Missing index or N+1 queries
**Check:**
```bash
# Slow query log
SELECT query, mean_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100;

# Add index if needed
CREATE INDEX idx_projects_status ON projects(status);
```

---

## Logs

**Vercel:** Logs tab in dashboard
**Supabase:** Logs → Database Webhooks / RLS / Realtime

---

**Authored by:** Claude Code (Haiku 4.5)
