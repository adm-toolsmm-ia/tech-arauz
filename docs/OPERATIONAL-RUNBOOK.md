# Tech Arauz — Operational Runbook

**Version:** 1.0 (EPIC 11 — Process SLA Monitoring)
**Last Updated:** 2026-03-16
**Status:** Production Ready v0.2.4
**Audience:** DevOps, Product Management, Operations Teams

---

## Overview

This runbook documents operational procedures for monitoring, maintaining, and troubleshooting Tech Arauz systems in production, with emphasis on EPIC 11 process SLA monitoring and organizational enrichment.

---

## Table of Contents

- [Daily Operations](#daily-operations)
- [Process SLA Monitoring](#process-sla-monitoring)
- [Threshold-Based Alerting](#threshold-based-alerting)
- [Error Recovery](#error-recovery)
- [Escalation Contacts](#escalation-contacts)
- [Troubleshooting Guide](#troubleshooting-guide)

---

## Daily Operations

### Health Check Procedure

**Frequency:** Daily, 09:00 AM (before business hours)

**Steps:**

1. **Database Connectivity Check**
   ```bash
   # Verify Supabase connection
   curl -s -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
     https://[project-id].supabase.co/rest/v1/tenants?select=id,name \
     | jq '.length'
   ```
   Expected: List of tenant records, no errors

2. **Application Status**
   ```bash
   # Check Next.js app health endpoint
   curl -s http://localhost:3000/health | jq .
   ```
   Expected output:
   ```json
   {
     "status": "healthy",
     "timestamp": "2026-03-16T09:00:00Z",
     "database": "connected",
     "cache": "active"
   }
   ```

3. **pgvector Index Health**
   ```sql
   -- Check embeddings index status
   SELECT
     schemaname,
     tablename,
     indexname,
     indexdef
   FROM pg_indexes
   WHERE tablename = 'org_knowledge_entries'
     AND indexname LIKE '%embedding%';
   ```
   Expected: Index type `ivfflat` with `cosine` metric

---

## Process SLA Monitoring

### SLA Overview

**Process SLA Configuration:**

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `org_process_slas` | Define targets | target_duration_days, warning_threshold_pct, critical_threshold_pct |
| `org_process_metrics` | Track actuals | avg_duration_days, compliance_pct, period_start, period_end |

**Default Thresholds:**
- Warning: 80% of SLA consumed
- Critical: 95% of SLA consumed
- Breach: > 100% of SLA consumed

### Procedure: Daily SLA Health Check

**Frequency:** Daily, 10:00 AM

**Purpose:** Identify processes trending toward SLA breach

**Steps:**

1. **Query Current SLA Status**

   ```sql
   -- Get all process SLAs with current compliance
   SELECT
     sla.process_id,
     p.name as process_name,
     sla.metric_name,
     sla.target_duration_days,
     sla.warning_threshold_pct,
     sla.critical_threshold_pct,
     COALESCE(m.avg_duration_days, 0) as actual_duration_days,
     COALESCE(m.compliance_pct, 0) as current_compliance_pct,
     m.period_start,
     m.period_end
   FROM org_process_slas sla
   JOIN org_processes p ON sla.process_id = p.id
   LEFT JOIN org_process_metrics m ON (
     sla.process_id = m.process_id
     AND sla.metric_name = m.metric_name
     AND m.period_end = CURRENT_DATE
   )
   WHERE sla.tenant_id = $1
   ORDER BY current_compliance_pct ASC;
   ```

2. **Identify At-Risk Processes**

   ```sql
   -- Find processes where compliance < warning threshold
   SELECT
     p.name,
     sla.metric_name,
     sla.warning_threshold_pct,
     m.compliance_pct,
     (sla.warning_threshold_pct - m.compliance_pct) as deviation_pct,
     CASE
       WHEN m.compliance_pct < (sla.critical_threshold_pct * 0.5) THEN 'CRITICAL'
       WHEN m.compliance_pct < sla.warning_threshold_pct THEN 'WARNING'
       ELSE 'OK'
     END as status
   FROM org_process_slas sla
   JOIN org_processes p ON sla.process_id = p.id
   LEFT JOIN org_process_metrics m ON (
     sla.process_id = m.process_id
     AND sla.metric_name = m.metric_name
     AND m.period_end = CURRENT_DATE
   )
   WHERE sla.tenant_id = $1
     AND m.compliance_pct < sla.warning_threshold_pct
   ORDER BY m.compliance_pct ASC;
   ```

3. **Review Variance from Baseline**

   ```sql
   -- Compare current vs historical average
   WITH recent AS (
     SELECT
       process_id,
       metric_name,
       AVG(compliance_pct) as recent_avg,
       STDDEV(compliance_pct) as recent_stddev
     FROM org_process_metrics
     WHERE period_end >= CURRENT_DATE - INTERVAL '7 days'
     GROUP BY process_id, metric_name
   )
   SELECT
     p.name,
     r.metric_name,
     m.compliance_pct as today,
     r.recent_avg as week_avg,
     ROUND(((m.compliance_pct - r.recent_avg) / r.recent_avg * 100)::numeric, 1) as variance_pct,
     CASE
       WHEN ABS(m.compliance_pct - r.recent_avg) > (2 * r.recent_stddev) THEN '⚠️ ANOMALY'
       ELSE 'Normal'
     END as anomaly_status
   FROM recent r
   JOIN org_processes p ON r.process_id = p.id
   JOIN org_process_metrics m ON (
     r.process_id = m.process_id
     AND r.metric_name = m.metric_name
     AND m.period_end = CURRENT_DATE
   )
   ORDER BY ABS(m.compliance_pct - r.recent_avg) DESC;
   ```

4. **Document Findings**

   Create ticket with:
   - Processes in WARNING/CRITICAL status
   - Root cause hypothesis (from AI analysis or metrics)
   - Recommended actions
   - Assigned owner (usually @pm for process improvement)

### Real-World Example: Credit Recovery SLA Check

**Scenario:** Daily check identifies credit recovery process compliance dropped to 75% (target 100%).

```sql
-- Query for specific process
SELECT
  sla.metric_name,
  sla.target_duration_days,
  m.avg_duration_days as actual_duration_days,
  m.compliance_pct,
  m.instances_count,
  m.period_start,
  m.period_end
FROM org_process_slas sla
JOIN org_process_metrics m ON (
  sla.process_id = m.process_id
  AND sla.metric_name = m.metric_name
)
JOIN org_processes p ON sla.process_id = p.id
WHERE p.name = 'Credit Recovery Initial Filing'
  AND sla.tenant_id = $1
  AND m.period_end = CURRENT_DATE
ORDER BY m.period_end DESC
LIMIT 1;
```

**Output:**
```
metric_name: total_cycle_time
target_duration_days: 30
actual_duration_days: 37.5
compliance_pct: 75.0
instances_count: 28
period: 2026-03-16 to 2026-03-16
```

**Action:** Escalate to @pm with findings for process optimization investigation.

---

## Threshold-Based Alerting

### Alert 1: WARNING (80% SLA Consumed)

**Trigger Condition:**
```sql
WHERE m.compliance_pct < sla.warning_threshold_pct
  AND m.compliance_pct >= (sla.critical_threshold_pct - 10)
```

**Alert Content:**

```
🟡 PROCESS SLA WARNING

Process: ${process_name}
Metric: ${metric_name}
Target: ${target_duration_days} days
Actual: ${avg_duration_days} days
Compliance: ${compliance_pct}% (WARNING threshold: ${warning_threshold_pct}%)

Status: At risk of missing SLA
Action Required: Assess root cause and plan intervention

Recommended:
1. Review org_process_metrics for trend (increasing?)
2. Check org_role_definitions for capacity constraints
3. Query org_activity_templates for optimization opportunities
4. Contact process owner for context
```

**Delivery:**
- Slack: #tech-arauz-alerts
- Email: operations@company.com
- Frequency: Once per alert (deduplicate within 1 hour)

### Alert 2: CRITICAL (95% SLA Consumed)

**Trigger Condition:**
```sql
WHERE m.compliance_pct < sla.critical_threshold_pct
  AND m.compliance_pct > 0  -- Exclude no-data cases
```

**Alert Content:**

```
🔴 CRITICAL: PROCESS SLA BREACH IMMINENT

Process: ${process_name}
Metric: ${metric_name}
Target: ${target_duration_days} days
Actual: ${avg_duration_days} days
Compliance: ${compliance_pct}%

⏰ Status: CRITICAL — Immediate action required

ESCALATION CHAIN:
1. Process Owner (from org_role_definitions)
2. Team Manager (role escalation_path)
3. @pm (process improvement authority)
4. @devops (if infrastructure issue)

Diagnostics:
- Recent trends: ${trend_direction}
- Capacity status: ${role_capacity_pct}%
- Known issues: ${open_tickets_count}

Immediate Actions:
1. Confirm breach root cause (human vs system)
2. Activate contingency plan (if documented)
3. Increase staffing/capacity (if bottleneck)
4. Notify stakeholders of impact
```

**Delivery:**
- Slack: @team-leads + #tech-arauz-alerts (with urgency marker)
- PagerDuty: Incident creation (if configured)
- Email: High-priority to management chain

### Alert 3: BREACH (> 100% SLA Consumed)

**Trigger Condition:**
```sql
WHERE m.compliance_pct = 0
   OR m.avg_duration_days > sla.target_duration_days
```

**Alert Content:**

```
🚨 CRITICAL: SLA BREACH CONFIRMED

Process: ${process_name}
Target SLA: ${target_duration_days} days
Actual: ${avg_duration_days} days
Breach Severity: ${((avg_duration_days / target_duration_days - 1) * 100).toFixed(1)}% over target

⚠️ Customer impact: Likely service level violations

IMMEDIATE ESCALATION:
→ Process Owner
→ @pm (Process Improvement)
→ @architect (if infrastructure bottleneck)
→ Customer Success (client notification)

Post-Breach Analysis Required:
1. Root cause analysis (RCA) within 24h
2. Corrective action plan
3. Prevention measures
4. Client communication timeline
```

**Delivery:**
- PagerDuty: Immediate incident (if configured)
- Slack: @channel in #incidents + #tech-arauz-alerts
- Email: Executive escalation

---

## Error Recovery

### Scenario 1: RLS Policy Violation on org_process_slas

**Symptom:**
```
Error: "new row violates row-level security policy for table org_process_slas"
Endpoint: PATCH /org_process_slas/{id}
Status: 403 Forbidden
```

**Root Cause Analysis:**

1. **Check RLS Policy:**
   ```sql
   -- Verify RLS is enabled
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE tablename = 'org_process_slas';
   -- Expected: rowsecurity = true

   -- Check policy definition
   SELECT policyname, qual, with_check
   FROM pg_policies
   WHERE tablename = 'org_process_slas';
   ```

2. **Verify JWT Claims:**
   ```typescript
   // Check auth token in client
   const { data: { session } } = await supabase.auth.getSession();
   console.log('JWT claims:', session?.user?.user_metadata);
   // Must include: tenant_id (matches org_process_slas.tenant_id)
   ```

3. **Validate Tenant Assignment:**
   ```sql
   -- Verify SLA record tenant_id matches user's tenant
   SELECT
     org_process_slas.tenant_id,
     org_process_slas.id,
     org_process_slas.process_id
   FROM org_process_slas
   WHERE id = ${sla_id}
   LIMIT 1;
   -- Compare with auth.jwt()->>'tenant_id'
   ```

**Recovery Steps:**

```bash
# Step 1: Verify user session
psql -U postgres -d postgres -h localhost << EOF
SELECT id, email, raw_user_meta_data->>'tenant_id' as tenant_id
FROM auth.users
WHERE email = 'user@company.com';
EOF

# Step 2: Check RLS policy allows operation
# Policy should be: (auth.jwt()->>'tenant_id'::uuid = org_process_slas.tenant_id)

# Step 3: Test with admin role (bypass RLS)
psql -U postgres -d postgres -h localhost << EOF
SET ROLE postgres;  -- Bypass RLS temporarily
UPDATE org_process_slas
SET critical_threshold_pct = 95.00
WHERE id = '${sla_id}';
RESET ROLE;
EOF

# Step 4: Re-verify RLS with user account
curl -X GET \
  -H "Authorization: Bearer $JWT_TOKEN" \
  https://[project-id].supabase.co/rest/v1/org_process_slas?id=eq.${sla_id}
```

**Validation Test:**

```typescript
// Test RLS enforcement
async function testRLSEnforcement() {
  const supabase = await createClient();

  // Should succeed (user in same tenant)
  const { data: slaData, error: readError } = await supabase
    .from('org_process_slas')
    .select('*')
    .eq('tenant_id', userTenantId);

  if (readError) {
    console.error('❌ RLS READ failed:', readError);
  } else {
    console.log('✓ RLS READ OK:', slaData?.length, 'records');
  }

  // Should fail (cross-tenant)
  const { data: crossTenant, error: crossError } = await supabase
    .from('org_process_slas')
    .select('*')
    .eq('tenant_id', 'other-tenant-id');

  if (crossError || crossTenant?.length === 0) {
    console.log('✓ RLS ISOLATION OK: Cross-tenant access blocked');
  }
}
```

### Scenario 2: pgvector Embedding Stale Data

**Symptom:**
```
Knowledge base searches return irrelevant results
Similarity scores: < 0.3 (below useful threshold of 0.5)
Cause: Embeddings not refreshed after content updates
```

**Recovery Procedure:**

1. **Check Embedding Freshness:**
   ```sql
   -- Find stale embeddings (> 1 hour old)
   SELECT
     id,
     title,
     type,
     updated_at,
     NOW() - updated_at as age,
     embedding_generated_at
   FROM org_knowledge_entries
   WHERE embedding_generated_at IS NULL
      OR (NOW() - embedding_generated_at) > INTERVAL '1 hour'
   ORDER BY embedding_generated_at DESC NULLS FIRST
   LIMIT 10;
   ```

2. **Regenerate Missing Embeddings:**

   ```typescript
   export async function refreshEmbeddingsAction(limit: number = 100) {
     const supabase = await createClient();

     // Find entries needing embedding refresh
     const { data: staleEntries } = await supabase
       .from('org_knowledge_entries')
       .select('id, content')
       .is('embedding_generated_at', null)
       .limit(limit);

     if (!staleEntries) return { refreshed: 0 };

     let refreshed = 0;

     for (const entry of staleEntries) {
       try {
         // Generate embedding
         const embedding = await generateEmbedding(entry.content);

         // Update record
         await supabase
           .from('org_knowledge_entries')
           .update({
             embedding: embedding,
             embedding_generated_at: new Date().toISOString()
           })
           .eq('id', entry.id);

         refreshed++;
       } catch (error) {
         console.error(`Failed to embed entry ${entry.id}:`, error);
       }
     }

     return { refreshed };
   }
   ```

3. **Validate Embedding Quality:**

   ```sql
   -- Test similarity search after refresh
   SELECT
     ke.title,
     ke.type,
     (ke.embedding <=> $1) as similarity_score  -- <=> is cosine distance operator
   FROM org_knowledge_entries ke
   WHERE tenant_id = $2
   ORDER BY similarity_score ASC
   LIMIT 5;
   -- Expect: top result similarity > 0.6
   ```

### Scenario 3: Process Metrics Not Updating

**Symptom:**
```
org_process_metrics shows no data for today
Last record: 2026-03-15
Current date: 2026-03-16
AI analysis fails: "No recent metrics available"
```

**Investigation Steps:**

1. **Check Metrics Collection Job:**
   ```bash
   # Verify cron job is running
   ps aux | grep "metrics.*cron"

   # Check logs
   tail -100 /var/log/tech-arauz/metrics-collection.log | grep -E "ERROR|WARN"
   ```

2. **Verify Data Source:**
   ```sql
   -- Check if process activities exist
   SELECT
     p.id,
     p.name,
     COUNT(a.id) as activity_count,
     MAX(a.updated_at) as last_activity_update
   FROM org_processes p
   LEFT JOIN org_activities a ON p.id = a.process_id
   WHERE p.tenant_id = $1
   GROUP BY p.id, p.name
   HAVING COUNT(a.id) = 0;  -- Empty processes won't have metrics
   ```

3. **Manually Trigger Metrics Calculation:**

   ```typescript
   export async function calculateProcessMetricsAction(
     tenant_id: string,
     process_id: string,
     period_start: Date,
     period_end: Date
   ) {
     const supabase = await createClient();

     // 1. Count completed activities
     const { data: activities } = await supabase
       .from('org_activities')
       .select('id, average_execution_time')
       .eq('process_id', process_id)
       .gte('updated_at', period_start.toISOString())
       .lte('updated_at', period_end.toISOString());

     // 2. Calculate metrics
     const avgDuration = activities
       ?.reduce((sum, a) => sum + (a.average_execution_time || 0), 0) / (activities?.length || 1);

     // 3. Insert or update metric
     const { error } = await supabase
       .from('org_process_metrics')
       .upsert({
         tenant_id,
         process_id,
         period_start: period_start.toISOString().split('T')[0],
         period_end: period_end.toISOString().split('T')[0],
         metric_name: 'average_cycle_time',
         avg_duration_days: avgDuration,
         instances_count: activities?.length || 0,
         updated_at: new Date().toISOString()
       }, {
         onConflict: 'tenant_id,process_id,metric_name,period_start,period_end'
       });

     return error ? { error } : { success: true };
   }
   ```

4. **Validate After Repair:**
   ```sql
   -- Verify metrics now exist
   SELECT * FROM org_process_metrics
   WHERE tenant_id = $1
     AND period_end = CURRENT_DATE
   ORDER BY updated_at DESC
   LIMIT 10;
   ```

---

## Escalation Contacts

### Escalation Matrix

| Issue | First Contact | Second Contact | Third Contact |
|-------|--------------|----------------|----------------|
| Process SLA WARNING | Process Owner | @pm | @architect |
| Process SLA CRITICAL | @pm | @architect | @devops |
| RLS Policy Violation | @data-engineer | @architect | @devops |
| pgvector Anomaly | @dev | @data-engineer | @devops |
| Metrics Not Updating | @dev | @data-engineer | @devops |
| Performance Degradation | @devops | @architect | @pm |

### Contact Details

**@pm (Morgan) — Product Management**
- Role: Process improvement, SLA target negotiation, roadmap prioritization
- Escalation: SLA breaches, process bottlenecks, automation ROI decisions
- Response Time: 2 business hours

**@architect (Aria) — Architecture & Design**
- Role: System design, performance optimization, technology decisions
- Escalation: Capacity constraints, scaling issues, architectural gaps
- Response Time: 4 business hours

**@data-engineer (Dara) — Database Specialist**
- Role: Schema optimization, RLS policy enforcement, query performance
- Escalation: Data integrity issues, RLS violations, metrics collection failure
- Response Time: 2 business hours

**@devops (Gage) — DevOps & Infrastructure**
- Role: Deployment, monitoring, incident response
- Escalation: Service outages, infrastructure failures, critical patches
- Response Time: 1 hour (critical), 4 hours (non-critical)

---

## Troubleshooting Guide

### Performance Issues

**Slow SLA Compliance Queries**

Symptom: SLA health check query takes > 10 seconds

Solution:
```sql
-- Add indexes for common queries
CREATE INDEX CONCURRENTLY idx_org_process_slas_tenant_process
  ON org_process_slas(tenant_id, process_id);

CREATE INDEX CONCURRENTLY idx_org_process_metrics_tenant_period
  ON org_process_metrics(tenant_id, period_end DESC);

-- Analyze table statistics
ANALYZE org_process_slas;
ANALYZE org_process_metrics;
```

**Slow Knowledge Base Search**

Symptom: pgvector similarity search takes > 500ms

Solution:
```sql
-- Verify IVFFlat index exists
SELECT * FROM pg_indexes
WHERE tablename = 'org_knowledge_entries'
  AND indexname LIKE '%embedding%';

-- If missing, create:
CREATE INDEX CONCURRENTLY org_knowledge_entries_embedding_idx
  ON org_knowledge_entries
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Verify index is being used
EXPLAIN (ANALYZE)
  SELECT * FROM org_knowledge_entries
  ORDER BY embedding <-> $1::vector
  LIMIT 10;
```

### Data Quality Issues

**Inconsistent Compliance Percentages**

Check:
```sql
-- Verify calculation logic
SELECT
  metric_name,
  period_start,
  period_end,
  instances_count,
  ROUND((instances_count::numeric / NULLIF(instances_count, 0) * 100), 2) as expected_pct,
  compliance_pct,
  CASE
    WHEN compliance_pct IS NULL THEN 'NULL value'
    WHEN compliance_pct > 100 THEN 'Value > 100%'
    WHEN compliance_pct < 0 THEN 'Value < 0%'
    ELSE 'Valid'
  END as status
FROM org_process_metrics
WHERE tenant_id = $1
ORDER BY period_end DESC;
```

### Access Issues

**User Cannot View SLA Data**

Verify:
1. User's JWT includes tenant_id claim
2. User's tenant_id matches org_process_slas.tenant_id
3. RLS policy is enabled on org_process_slas table
4. User has appropriate Supabase role

```sql
-- Check RLS policy
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'org_process_slas'
LIMIT 5;
```

---

## Quick Reference

### Common Commands

```bash
# Check app health
curl http://localhost:3000/health

# Get today's SLA status
curl -H "Authorization: Bearer $TOKEN" \
  https://[project].supabase.co/rest/v1/rpc/check_sla_health \
  -d '{"tenant_id":"'$TENANT_ID'"}'

# Refresh stale embeddings (manual trigger)
curl -X POST http://localhost:3000/api/refresh-embeddings \
  -H "Authorization: Bearer $TOKEN"

# View metrics for specific process
psql -U postgres -d tech_arauz -h localhost -c \
  "SELECT * FROM org_process_metrics \
   WHERE process_id = '${PROCESS_ID}' \
   ORDER BY period_end DESC LIMIT 5;"
```

### Emergency Contacts

- **On-Call DevOps:** Check PagerDuty schedule
- **Emergency Line:** +55-XX-9XXXX-XXXX
- **Incident Channel:** #incidents (Slack)

---

**Document Maintained By:** @devops
**Last Review:** 2026-03-16
**Next Review:** 2026-06-16 (quarterly)
