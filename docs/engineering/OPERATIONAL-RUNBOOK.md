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

## SLA Monitoring & Process Metrics (Story 11.3)

### Overview

Tech Arauz tracks **Service Level Agreements (SLAs)** per process with real-time metrics dashboards. This enables operational teams to monitor process health, identify bottlenecks, and trigger alerts when SLA targets are breached.

**Key Tables:**
- `org_process_slas` — SLA definitions (target cycle time, quality %)
- `org_process_metrics` — Daily aggregated metrics (completion rate, avg duration, on-time %)

### 11.1 SLA Query Examples

**Check SLA Compliance for a Process:**

```sql
-- Get SLA definition + recent metrics
SELECT
  ps.id, ps.name,
  ps.target_cycle_time_hours,
  ps.target_quality_percentage,
  ps.escalation_threshold_hours,
  pm.metric_date,
  pm.total_cases,
  pm.completed_cases,
  pm.average_cycle_time_hours,
  pm.quality_percentage,
  pm.on_time_percentage,
  CASE
    WHEN pm.on_time_percentage >= ps.target_quality_percentage THEN 'COMPLIANT'
    WHEN pm.on_time_percentage >= (ps.target_quality_percentage * 0.9) THEN 'WARNING'
    ELSE 'NON-COMPLIANT'
  END as sla_status
FROM org_process_slas ps
LEFT JOIN org_process_metrics pm ON ps.process_id = pm.process_id
WHERE ps.process_id = $1  -- process_id parameter
  AND ps.tenant_id = $2
  AND pm.metric_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY pm.metric_date DESC;
```

**Performance:** Indexed (process_id, metric_date). Expected < 50ms.

**Identify Processes Exceeding SLA (Last 7 Days):**

```sql
-- Find processes with on-time % below target
SELECT
  p.id, p.name,
  ps.target_cycle_time_hours,
  pm.average_cycle_time_hours,
  pm.on_time_percentage,
  (ps.target_cycle_time_hours - pm.average_cycle_time_hours) as variance_hours,
  ROUND((ps.target_cycle_time_hours - pm.average_cycle_time_hours) / ps.target_cycle_time_hours * 100, 1) as variance_pct
FROM org_processes p
JOIN org_process_slas ps ON p.id = ps.process_id
LEFT JOIN org_process_metrics pm ON p.id = pm.process_id
WHERE p.tenant_id = $1
  AND pm.metric_date >= CURRENT_DATE - INTERVAL '7 days'
  AND pm.on_time_percentage < ps.target_quality_percentage
ORDER BY variance_pct DESC;
```

### 11.2 Frontend Components: Process Metrics Dashboard

**ProcessMetricsCard Component**

Displays current SLA status + compliance indicators:

```typescript
// From: src/components/organization/ProcessMetricsCard.tsx
interface ProcessMetricsCardProps {
  processId: string;
  sla?: OrgProcessSla;
  recentMetrics?: OrgProcessMetrics;
}

// Renders:
// - Target SLA (days)
// - Actual average duration
// - Compliance % (on-time percentage)
// - Status badge: Green (Compliant) | Yellow (Warning) | Red (Critical)
// - Status message with recommendations
```

**Compliance Logic:**
```typescript
if (compliancePct < 80) {
  status = 'on-track'  // ✓ No Track (green)
} else if (compliancePct < 95) {
  status = 'warning'   // ⚠ Aviso (yellow)
} else {
  status = 'critical'  // ✗ Crítico (red)
}
```

**Real-World Rendering (3-column grid):**
```
┌────────────────────────────────────────────────────┐
│ Métricas do Processo              [Green circle]  │
│ Período: 01/01/2026 - 15/03/2026                  │
├────────────────────────────────────────────────────┤
│ [No Track] 75.2% de conformidade                  │
│                                                    │
│ ┌──────────────┬──────────────┬──────────────┐    │
│ │  SLA Alvo    │ Duração Média│ Instâncias   │    │
│ │     30       │    22.5      │     1,245    │    │
│ │    dias      │    dias      │   executadas │    │
│ └──────────────┴──────────────┴──────────────┘    │
│                                                    │
│ ✓ O processo está dentro do SLA com margem       │
│   de segurança.                                   │
└────────────────────────────────────────────────────┘
```

**ProcessMetricsHistory Component**

Displays time-series trends:

```typescript
// From: src/components/organization/ProcessMetricsHistory.tsx
interface ProcessMetricsHistoryProps {
  processId: string;
  metrics: OrgProcessMetrics[];
  timeframe?: 'week' | 'month' | 'quarter';
  onTimeframeChange?: (tf: 'week' | 'month' | 'quarter') => void;
}

// Renders:
// - Line chart: Average cycle time over time
// - Bar chart: Compliance % trend
// - Stats grid: Total instances, avg duration, avg compliance
// - Period selector (Semana / Mês / Trimestre)
```

**Example Data Transformation:**
```typescript
const chartData = metrics
  .sort((a, b) => new Date(a.period_start).getTime() - new Date(b.period_start).getTime())
  .map((metric) => ({
    period: new Date(metric.period_start).toLocaleDateString('pt-BR'),
    avgDuration: metric.average_cycle_time_hours || 0,
    compliance: metric.on_time_percentage || 0,
    instances: metric.total_cases || 0,
  }));
```

### 11.3 ProcessCockpit360: Integrated SLA Dashboard

The `ProcessCockpit360` component integrates metrics monitoring:

```typescript
// From: src/components/organization/ProcessCockpit360.tsx
export function ProcessCockpit360({
  process,
  areaName,
  nucleusName,
  routines,
  systems,
  onEdit,
  onDelete,
}: ProcessCockpit360Props) {
  const [metricsTimeframe, setMetricsTimeframe] = useState<'week' | 'month' | 'quarter'>('month');

  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
        <TabsTrigger value="metrics">Métricas</TabsTrigger>
        <TabsTrigger value="routines">Rotinas</TabsTrigger>
        <TabsTrigger value="systems">Sistemas</TabsTrigger>
      </TabsList>

      <TabsContent value="metrics">
        {/* Current SLA Status Card */}
        <ProcessMetricsCard
          processId={process.id}
          sla={process.sla}
          recentMetrics={process.recentMetrics}
        />

        {/* Historical Trend Chart */}
        <ProcessMetricsHistory
          processId={process.id}
          metrics={process.metricsHistory}
          timeframe={metricsTimeframe}
          onTimeframeChange={setMetricsTimeframe}
        />
      </TabsContent>
    </Tabs>
  );
}
```

### 11.4 SLA Monitoring Procedures

**Daily Operations:**

1. **Check Dashboard at 8:00 AM:**
   - Navigate to Organizations → Process Details
   - Review "Métricas" tab for SLA status
   - Any RED status (critical) triggers immediate action

2. **Review Weekly Trends (Fridays):**
   - Set timeframe to "week" or "month"
   - Compare current week vs. previous 4 weeks
   - Identify improving/declining trends

3. **Escalation Trigger:**
   - If on_time_percentage < 80% → Auto-escalate to process owner
   - If on_time_percentage < 70% → Escalate to area manager
   - If on_time_percentage < 60% → Executive alert

**Alert Configuration (Future Enhancement):**

```sql
-- Trigger rule: Create alert when SLA breached
CREATE OR REPLACE TRIGGER alert_sla_breach
AFTER INSERT ON org_process_metrics
FOR EACH ROW
WHEN (NEW.on_time_percentage < (
  SELECT target_quality_percentage FROM org_process_slas
  WHERE process_id = NEW.process_id
))
EXECUTE FUNCTION create_sla_alert(NEW);
```

### 11.5 Real-World Example: Credit Recovery Process

**Scenario:** Monitor SLA compliance for "Credit Recovery Initial Filing"

**Setup:**
```typescript
// Define SLA
const sla = {
  process_id: "cr-initial-filing",
  target_cycle_time_hours: 720,  // 30 days
  target_quality_percentage: 90,  // 90% on-time
  escalation_threshold_hours: 800 // Alert at 33 days
};

// Simulate metrics
const metrics = [
  { metric_date: '2026-03-10', average_cycle_time_hours: 648, on_time_percentage: 92 },  // ✓ Compliant
  { metric_date: '2026-03-11', average_cycle_time_hours: 720, on_time_percentage: 85 },  // ⚠ Warning
  { metric_date: '2026-03-12', average_cycle_time_hours: 810, on_time_percentage: 72 },  // ✗ Critical
];
```

**Dashboard Display:**

```
Cockpit360 → Metrics Tab

ProcessMetricsCard:
┌─────────────────────────────────────────────────┐
│ Métricas do Processo                  [Red ✗]  │
│ Período: 01/03/2026 - 12/03/2026                │
├─────────────────────────────────────────────────┤
│ [Crítico] 72.0% de conformidade                │
│                                                 │
│ SLA Alvo: 30 dias                              │
│ Duração Média: 33.75 dias  ← EXCEEDS!         │
│ Instâncias: 145 executadas                     │
│                                                 │
│ ✗ O processo está excedendo o SLA.            │
│   Ação corretiva recomendada.                  │
└─────────────────────────────────────────────────┘

ProcessMetricsHistory:
[Chart showing upward trend in duration]
[Bar chart showing declining compliance %]

→ Next Step: Escalate to process owner for root cause analysis
```

### 11.6 Integration with AI Agents

AI agents use SLA data for intelligent recommendations:

```typescript
// AI agent retrieves SLA + metrics
const slaContext = await getProcessMetricsAction(processId, {
  start: new Date(Date.now() - 30*24*60*60*1000),  // 30 days
  end: new Date()
});

// Agent prompt includes SLA context
const prompt = `
Process SLA Status:
- Target: ${slaContext.sla.target_cycle_time_hours} hours
- Actual: ${slaContext.metrics[0].average_cycle_time_hours} hours
- Variance: ${slaContext.metrics[0].average_cycle_time_hours - slaContext.sla.target_cycle_time_hours} hours

Compliance Trend (Last 7 days):
${slaContext.metrics.slice(-7).map(m => `
- ${m.metric_date}: ${m.on_time_percentage}%
`).join('')}

Task: Recommend 3 actions to improve SLA compliance.
`;

// AI generates data-driven recommendations
```

---

**Authored by:** Claude Code (Haiku 4.5)
**Last Updated:** 2026-03-16
**Next Review:** 2026-06-30
