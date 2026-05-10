# AI-CONTEXT-ENGINEERING.md

**Status:** ✅ COMPLETE (Phase 2 Content Generation — Story 11.14)

## Overview

Integration guide for AI agents working with EPIC 11 — Organizational Enrichment & BPM Mastery context. This document covers role context injection, process metrics transformation, knowledge base retrieval patterns, and prompt engineering best practices for autonomous agent systems like Synkra AIOX.

## Table of Contents

- [Role Context Injection](#role-context-injection)
- [Tenant Snapshot Fallback](#tenant-snapshot-fallback)
- [Process Metrics Transformer](#process-metrics-transformer)
- [Knowledge Base Retrieval](#knowledge-base-retrieval)
- [Sample AI Prompts](#sample-ai-prompts)
- [Integration with Agent System](#integration-with-agent-system)
- [Best Practices](#best-practices)
- [Real-World Examples](#real-world-examples)

---

## Role Context Injection

### What is Role Context?

Role context is enriched metadata about who performs activities and what permissions/responsibilities they have. AI agents use this to make decisions, recommendations, and plan workflows.

**Example:** Instead of just "advogado", context includes:
```json
{
  "role_name": "advogado",
  "display_name": "Lawyer",
  "processes": ["initial_filing", "contract_review", "legal_opinion"],
  "activities": ["legal_review", "document_preparation", "client_interview"],
  "escalation_path": ["advogado_senior", "diretor_juridico"],
  "typical_cycle_time_hours": 2,
  "avg_quality_score": 0.98
}
```

### How to Inject Role Context

**Step 1: Retrieve Role Metadata from Database**

```typescript
// Server action: getRoleContextAction()
export async function getRoleContextAction(
  role_name: string
): Promise<RoleContext> {
  const supabase = await createClient();

  // Get all entities with this role
  const [activities, processes, routines] = await Promise.all([
    supabase
      .from('org_activities')
      .select('id, name, complexity, priority, responsible_roles')
      .contains('responsible_roles', [role_name]),
    supabase
      .from('org_processes')
      .select('id, name, responsible_roles')
      .contains('responsible_roles', [role_name]),
    supabase
      .from('org_routines')
      .select('id, name, responsible_roles')
      .contains('responsible_roles', [role_name])
  ]);

  // Aggregate metrics
  const avg_quality = await calculateQualityMetrics(role_name);
  const escalation_path = getEscalationPath(role_name);

  return {
    role_name,
    display_name: formatRoleName(role_name),
    activities: activities.data || [],
    processes: processes.data || [],
    escalation_path,
    avg_quality_score: avg_quality,
    assignment_count: activities.data?.length || 0
  };
}
```

**Step 2: Format Context for Prompt Injection**

```typescript
// Format role context as natural language for LLM
function formatRoleContextForPrompt(roleContext: RoleContext): string {
  return `
# Role Context: ${roleContext.display_name}

**Responsibilities:**
- Assigned to ${roleContext.activities.length} activities across ${roleContext.processes.length} processes
- Quality performance: ${(roleContext.avg_quality_score * 100).toFixed(1)}%
- Typical cycle time: ${roleContext.typical_cycle_time_hours} hours

**Key Activities:**
${roleContext.activities.map(a => `- ${a.name} (${a.complexity})`).join('\n')}

**Escalation Path:**
${roleContext.escalation_path.join(' → ')}

**Typical Workflows:**
${generateWorkflowSummary(roleContext.processes)}
`;
}
```

**Step 3: Inject into Agent Prompt**

```typescript
// In agent planning/decision-making
const roleContext = await getRoleContextAction('advogado');
const contextString = formatRoleContextForPrompt(roleContext);

const systemPrompt = `
You are an organizational process planning assistant for Tech Arauz.
Your task is to recommend the best person for this task.

${contextString}

Consider their experience, current workload, and availability.
`;

// Use with Claude API
const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  system: systemPrompt,
  messages: [
    {
      role: 'user',
      content: 'Who should handle the legal review for this contract?'
    }
  ]
});
```

### Role Context Structure

```typescript
interface RoleContext {
  role_name: string;                           // e.g., "advogado"
  display_name: string;                        // e.g., "Lawyer"
  description?: string;

  // Entity coverage
  activities: ActivityRef[];                   // Activities assigned
  processes: ProcessRef[];                     // Processes with this role
  routines: RoutineRef[];                      // Routines with this role

  // Performance metrics
  avg_quality_score: number;                   // 0-1
  avg_cycle_time_hours: number;
  total_assignments: number;

  // Governance
  escalation_path: string[];                   // [role1, role2, ...] chain
  can_escalate_to: string[];                   // Who can escalate to
  permissions?: string[];                      // Future RBAC

  // Recommendations
  recommended_next_role?: string;              // Who to handoff to
  common_handoff_targets: string[];            // Most common next steps

  // Workload (real-time)
  current_assignments: number;
  available_capacity: number;                  // Slots remaining
}

interface ActivityRef {
  id: string;
  name: string;
  complexity: 'low' | 'medium' | 'high';
  priority: 'low' | 'normal' | 'high';
}

interface ProcessRef {
  id: string;
  name: string;
  avg_cycle_time_hours: number;
}
```

---

## Tenant Snapshot Fallback

When the dedicated AI service is unavailable, the Next.js chat fallback now augments the agent prompt with a tenant-scoped organizational snapshot.

The snapshot is assembled from the current tenant's:

- areas
- nuclei
- processes
- routines
- activities

It also highlights the most recently updated process, routine, or activity using the flat `toAIContext()` transformer so the fallback prompt still carries structured operational context.

### Runtime Helper

```typescript
import { buildAgentOrganizationContext } from '@/lib/ai/organization-context';

const organizationContext = await buildAgentOrganizationContext(supabase);
```

### Prompt Shape

```text
# Contexto organizacional do tenant
- Áreas: 12
  - Legal Operations — Fluxo de atuação jurídica...
- Núcleos: 8
...
## Contexto em foco
- Tipo: process
- Entidade: Solicitação de Protocolo (Espaider)
- Objetivo: ...
```

This keeps the direct LLM fallback aligned with the same organizational vocabulary used by the AI context layer, without inventing cross-tenant assumptions.

---

## Process Metrics Transformer

### Collecting Process Metrics

Real-time and historical metrics help AI agents understand process performance:

```typescript
// Server action: getProcessMetricsAction()
export async function getProcessMetricsAction(
  processId: string,
  dateRange: { start: Date; end: Date }
): Promise<ProcessMetrics> {
  const supabase = await createClient();

  const metrics = await supabase
    .from('org_process_metrics')
    .select('*')
    .eq('process_id', processId)
    .gte('metric_date', dateRange.start.toISOString().split('T')[0])
    .lte('metric_date', dateRange.end.toISOString().split('T')[0])
    .order('metric_date', { ascending: true });

  // Aggregate and trend
  return {
    process_id: processId,
    date_range: dateRange,
    metrics: metrics.data || [],
    trends: calculateTrends(metrics.data || []),
    forecast: forecastMetrics(metrics.data || []),
    anomalies: detectAnomalies(metrics.data || [])
  };
}
```

### Available Metrics

| Metric | Type | Source | Use Case |
|--------|------|--------|----------|
| `total_cases` | Integer | Workflow engine | Throughput analysis |
| `completed_cases` | Integer | Workflow engine | Completion rate |
| `average_cycle_time_hours` | Decimal | Timestamps | SLA compliance |
| `quality_percentage` | Decimal (0-100) | QA system | Quality control |
| `on_time_percentage` | Decimal (0-100) | SLA tracking | Delivery reliability |

### Transforming Metrics for AI

```typescript
// Transform raw metrics into AI-friendly format
function transformMetricsForAI(metrics: ProcessMetrics[]): string {
  const latest = metrics[metrics.length - 1];
  const avgMetrics = calculateAverages(metrics);
  const trend = calculateTrend(metrics);

  return `
# Process Performance Metrics

**Latest (${latest.metric_date}):**
- Cases Completed: ${latest.completed_cases}/${latest.total_cases} (${((latest.completed_cases/latest.total_cases)*100).toFixed(1)}%)
- Average Cycle Time: ${latest.average_cycle_time_hours.toFixed(1)} hours
- Quality Score: ${latest.quality_percentage.toFixed(1)}%
- On-Time Delivery: ${latest.on_time_percentage.toFixed(1)}%

**30-Day Average:**
- Completion Rate: ${(avgMetrics.completion_rate * 100).toFixed(1)}%
- Avg Cycle Time: ${avgMetrics.avg_cycle_time_hours.toFixed(1)} hours
- Quality Score: ${avgMetrics.quality_percentage.toFixed(1)}%

**Trend (Last 7 Days):**
- Completion Rate: ${trend.completion_direction > 0 ? '📈 Up' : trend.completion_direction < 0 ? '📉 Down' : '→ Stable'}
- Cycle Time: ${trend.cycle_time_direction > 0 ? '📈 Increasing (Slower)' : '📉 Decreasing (Faster)' : '→ Stable'}
- Quality: ${trend.quality_direction > 0 ? '📈 Improving' : trend.quality_direction < 0 ? '📉 Declining' : '→ Stable'}

**Anomalies Detected:**
${metrics.some(m => isAnomaly(m)) ? '⚠️ Yes - investigate' : '✓ None'}
`;
}
```

### Usage Patterns for AI

**Pattern 1: Process Bottleneck Detection**

```typescript
async function detectBottlenecks(processId: string): Promise<string> {
  const metrics = await getProcessMetricsAction(processId, {
    start: new Date(Date.now() - 30*24*60*60*1000),  // Last 30 days
    end: new Date()
  });

  const prompt = `
Analyze this process performance data:

${transformMetricsForAI(metrics.metrics)}

Identify the top 3 bottlenecks and suggest optimizations that could improve throughput by 20% without compromising quality.

Format your response as:
1. **Bottleneck Name**: Description and metric evidence
   - Impact: X% throughput loss
   - Root Cause:
   - Recommendation:
  `;

  return generateAIAnalysis(prompt);
}
```

**Pattern 2: Capacity Planning**

```typescript
async function predictCapacityNeeds(processId: string): Promise<string> {
  const historicalMetrics = await getProcessMetricsAction(processId, {
    start: new Date(Date.now() - 90*24*60*60*1000),  // Last 90 days
    end: new Date()
  });

  const forecast = predictNextQuarter(historicalMetrics);

  const prompt = `
Process: ${processId}

Historical Volume (Last 90 days):
${summarizeVolume(historicalMetrics)}

Forecast (Next 90 days):
${summarizeVolume(forecast)}

Based on this trend:
1. Will we exceed SLA targets?
2. How many additional resources (roles) are needed?
3. Which activities should be automated?
`;

  return generateAIAnalysis(prompt);
}
```

---

## Knowledge Base Retrieval

### Semantic Search with Embeddings (Story 11.11)

The organization maintains a knowledge base of entries with semantic embeddings for AI-powered search:

```typescript
// Server action: semanticSearchKnowledgeAction()
export async function semanticSearchKnowledgeAction(
  query: string,
  limit: number = 10,
  threshold: number = 0.5
): Promise<KnowledgeEntry[]> {
  const supabase = await createClient();

  // 1. Generate embedding for query
  const queryEmbedding = await generateEmbedding(query);

  // 2. Search using vector similarity
  const results = await supabase.rpc(
    'match_knowledge_entries',
    {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit
    }
  );

  return results || [];
}
```

### Knowledge Entry Types

| Type | Example | Use Case |
|------|---------|----------|
| `process` | "Credit Recovery Initial Filing Process" | Understanding workflows |
| `best_practice` | "How to efficiently interview clients" | Guidance & improvement |
| `case_study` | "Case #123: Successful settlement in 45 days" | Learning from examples |
| `template` | "Activity template: Legal document review" | Pattern reuse |
| `role_guide` | "Paralegal responsibilities in judicial recovery" | Role onboarding |

### Integration Patterns

**Pattern 1: Single-Turn Knowledge Query**

```typescript
// Agent asks: "What's the best way to interview clients?"
const query = 'client interview best practices';
const knowledge = await semanticSearchKnowledgeAction(query, 3);

const prompt = `
Answer this question using the provided knowledge base:
Question: "What's the best way to interview clients in credit recovery cases?"

Relevant Knowledge:
${knowledge.map(k => `- [${k.type}] ${k.title}: ${k.content.substring(0, 200)}...`).join('\n')}

Provide a practical, actionable answer with specific steps.
`;
```

**Pattern 2: Multi-Turn Context Building**

```typescript
// Agent develops understanding through multiple queries
const conversationContext = [];

// Turn 1: Understand the process
const process = await semanticSearchKnowledgeAction('credit recovery process overview', 1);
conversationContext.push({ role: 'assistant', content: summarizeEntry(process[0]) });

// Turn 2: Get role-specific guidance
const roleGuide = await semanticSearchKnowledgeAction('paralegal credit recovery responsibilities', 1);
conversationContext.push({ role: 'assistant', content: summarizeEntry(roleGuide[0]) });

// Turn 3: Learn best practices
const bestPractices = await semanticSearchKnowledgeAction('efficient credit recovery techniques', 2);
conversationContext.push({ role: 'assistant', content: bestPractices.map(summarizeEntry).join('\n') });

// Now agent can make informed recommendations
```

**Pattern 3: Knowledge-Confidence Filtering**

```typescript
// Only use knowledge that's recent and relevant
const query = 'latest regulatory requirements for credit recovery';
const knowledge = await semanticSearchKnowledgeAction(query, 10, 0.7);  // High threshold

const confidenceScores = knowledge.map(entry => ({
  entry,
  relevance: calculateRelevance(query, entry),
  recency: calculateRecency(entry.updated_at),
  combined_score: (calculateRelevance(query, entry) + calculateRecency(entry.updated_at)) / 2
}));

// Use only top 3 by confidence
const trusted = confidenceScores
  .sort((a, b) => b.combined_score - a.combined_score)
  .slice(0, 3);
```

---

## Sample AI Prompts

### Prompt 1: Process Analysis for Bottleneck Identification

```
You are a business process optimization consultant analyzing Tech Arauz processes.

# Current Process Context
${processMetrics}

# Organization Context
${organizationStructure}

# Role Context (Primary Owner)
${roleContext}

# Knowledge Base References
${relevantKnowledge}

Task: Analyze this process for bottlenecks and inefficiencies.

Your analysis should:
1. Identify the top 3 bottlenecks with quantitative evidence
2. Calculate potential impact of removing each bottleneck
3. Suggest specific, actionable improvements
4. Estimate effort and timeline for each improvement
5. Prioritize by ROI (impact / effort)

Format as:
## Bottleneck Analysis

### 1. [Bottleneck Name]
- **Current Impact**: X% throughput loss or Y hours delay
- **Root Cause**: [Evidence from metrics]
- **Recommendation**: [Specific action]
- **Implementation Effort**: Low/Medium/High
- **Expected ROI**: X% improvement in [metric]

## Summary
- Top priority action: [recommendation with highest ROI]
- Estimated total improvement: Y% across all metrics
- Timeline: Z weeks for full implementation
```

### Prompt 2: Activity Planning with Role Assignment

```
You are planning activities for a new process: ${processName}

# Available Roles
${listAvailableRoles}

# Role Capacity
${roleCapacityData}

# Process Requirements
- Inputs: ${processInputs}
- Outputs: ${processOutputs}
- Estimated Duration: ${processDuration}
- Quality Requirement: ${qualityTarget}%
- SLA Target: ${slaHours} hours

# Relevant Activity Templates
${applicableTemplates}

# Historical Similar Processes
${historicalData}

Task: Create an optimized activity sequence for this process.

Your plan should:
1. Define activities in logical sequence
2. Assign optimal roles to each activity (considering expertise & capacity)
3. Justify role assignments based on role context
4. Estimate realistic cycle times based on historical data
5. Flag any capacity concerns
6. Recommend SLA targets

Format as:
## Process Plan: ${processName}

### Activity Sequence
1. **[Activity Name]** (Owner: [role_name])
   - Rationale: [Why this role is best]
   - Estimated time: X hours
   - Dependencies: [Previous activities]
   - Success criteria: [Concrete acceptance criteria]

### Risk Assessment
- Capacity risk: [Role X may be overloaded]
- Timeline risk: [Activity Y commonly takes longer]
- Quality risk: [Role Z has lower quality scores]

### Recommendations
- Consider parallel execution of activities 3 & 4 to save time
- Have role X trained on activity 5 as backup
- Monitor activity 2 closely (highest quality risk)

### Projected Metrics
- Total cycle time: X hours
- Estimated quality: Y%
- Confidence in timeline: High/Medium/Low
```

### Prompt 3: Knowledge-Based Problem Solving

```
# Organizational Knowledge Base
${semanticSearchResults}

# Current Situation
You're working on: ${currentTask}
Role: ${currentRole}
Context: ${taskContext}

# Question
${userQuestion}

Task: Provide a detailed, actionable answer using the knowledge base.

Your response should:
1. Directly answer the question
2. Reference specific knowledge entries
3. Adapt guidance to the current context
4. Highlight any warnings or special considerations
5. Suggest next steps

Format:
## Answer: [Restate the question]

[Detailed answer with references to knowledge entries]

### Key References
- **Entry 1**: [Summary and relevance]
- **Entry 2**: [Summary and relevance]

### Context-Specific Adjustments
[How the guidance needs to be adjusted for this role/situation]

### Important Notes
⚠️ [Any warnings or special considerations]

### Next Steps
1. [Recommended next action]
2. [Optional: What to do if first approach doesn't work]
```

---

## Integration with Agent System

### Agent Activation in AIOX

Tech Arauz uses Synkra AIOX for autonomous agent orchestration:

```typescript
// Activate @dev (Dex) for activity implementation
@dev *implement-activity {
  activity_id: "activity-123",
  context: {
    organization: org_context,
    role_assignments: role_context,
    process_metrics: metrics_context,
    relevant_knowledge: knowledge_entries
  }
}
```

### Context Sharing Between Agents

When handing off between agents, pass organizational context:

```typescript
// @architect → @dev handoff
handoff_artifact: {
  from_agent: 'architect',
  to_agent: 'dev',
  story_context: {
    story_id: '11.14',
    current_task: 'Document AI integration patterns'
  },
  org_context: {
    organization_id: org_id,
    role_context: roleContext,
    process_metrics: metricsContext,
    knowledge_base: relevantKnowledge
  },
  decisions: [
    'Use hierarchical organization structure (ADR-005)',
    'Implement embeddings for semantic search',
    'Support multi-role assignments for flexibility'
  ]
}
```

---

## Best Practices

### Context Quality

**Principles:**
1. **Completeness**: Include all relevant organizational context
2. **Accuracy**: Verify metrics are current (< 1 hour old)
3. **Relevance**: Filter context to what's needed for the decision
4. **Timeliness**: Use real-time data, not stale extracts

**Implementation:**
```typescript
async function buildHighQualityContext(entityId: string): Promise<AIContext> {
  // Check data freshness
  const lastUpdate = await getLastUpdate(entityId);
  if (Date.now() - lastUpdate > 3600000) {
    // > 1 hour old, refresh
    await refreshMetrics(entityId);
  }

  // Gather context from multiple sources
  const context = {
    entity: await getEntity(entityId),
    metrics: await getMetrics(entityId),
    roles: await getInvolvedRoles(entityId),
    knowledge: await searchRelevantKnowledge(entityId),
    historical: await getHistoricalPatterns(entityId)
  };

  // Filter to relevant items only (< 4K tokens)
  return pruneContextToSize(context, 4000);
}
```

### Prompt Engineering

**Best Practices:**
1. **Clear Instructions**: Be specific about what you want
2. **Few-Shot Examples**: Provide 1-2 examples of desired output format
3. **Error Handling**: Ask agent to flag uncertainty
4. **Output Format**: Specify exact format (JSON, markdown, etc.)

**Example:**
```typescript
const prompt = `
You are planning activities for a process. Analyze the context and create a plan.

## Context
${organizationContext}

## Instructions
1. List each activity in order
2. Assign a role to each activity
3. For each role assignment, explain why it's the best choice
4. Flag any concerns (capacity, expertise, timeline)
5. Output as JSON with structure:
{
  "activities": [
    {
      "name": "Activity name",
      "assigned_role": "role_name",
      "rationale": "Why this role",
      "concerns": ["Concern 1", "Concern 2"]
    }
  ],
  "overall_assessment": "Is this plan feasible?"
}

## Important
If you're uncertain about any assignment, explain your uncertainty in the "concerns" field.
`;
```

### Testing and Validation

```typescript
// Test 1: Verify AI analysis matches metrics
const aiAnalysis = await analyzeProcess(processId);
const metrics = await getProcessMetrics(processId);

assert(
  aiAnalysis.bottleneck_impact <= metrics.current_inefficiency,
  'AI bottleneck identification should not overstate impact'
);

// Test 2: Validate recommendations are actionable
const recommendations = aiAnalysis.recommendations;
assert(
  recommendations.every(r => r.implementation_effort && r.effort !== 'impossible'),
  'All recommendations must have feasible effort estimates'
);

// Test 3: Check knowledge base accuracy
const knowledgeEntry = await getKnowledgeEntry(entryId);
const similarHistoricalCases = await findSimilarCases(knowledgeEntry);
assert(
  similarHistoricalCases.every(c => c.outcome_matches_guidance),
  'Knowledge base guidance should be validated by historical cases'
);
```

### Privacy and Security

```typescript
// Redact sensitive information before passing to AI
function redactSensitiveContext(context: AIContext): AIContext {
  return {
    ...context,
    entity: {
      ...context.entity,
      personal_data: '[REDACTED]',
      client_name: '[REDACTED]',
      financial_data: '[REDACTED_AMOUNT]'
    },
    roles: context.roles.map(r => ({
      ...r,
      personal_contact: '[REDACTED]',
      home_address: '[REDACTED]'
    }))
  };
}

// All prompts must enforce RLS
const prompt = `
You have access to organizational data for tenant: ${tenant_id}
DO NOT make recommendations that leak data across tenants.
All suggestions must respect row-level security policies.
`;
```

---

## Real-World Examples

### Example 1: Legal Firm — Credit Recovery Process Optimization

**Scenario:** AI agent analyzes why credit recovery cases take 45 days vs. target of 30 days.

**Context Provided:**
- Process metrics (last 30 days)
- Role context for paralegals and lawyers
- Knowledge base entries on efficient filing procedures
- Historical case data

**AI Analysis:**
```
## Bottleneck Analysis: Credit Recovery Initial Filing

### Bottleneck 1: Document Preparation
- Current: 8 hours average
- Benchmark (Knowledge Base): 4 hours
- Root Cause: New paralegals not using templates
- Recommendation: Mandatory template usage training + document checklist

### Bottleneck 2: Legal Review Queue
- Current: 6 hours wait time
- Cause: Single lawyer bottleneck (advogado_senior)
- Recommendation: Cross-train paralegal_senior for basic review or hire/promote

### Bottleneck 3: Court Filing System
- Current: 12 hours from completion to filing
- Cause: Manual court system integration
- Recommendation: Automate court filing interface

### Projected Impact
- Implementing all 3: 30-day target achievable
- Priority: Fix bottleneck 1 (high ROI, low effort)
```

### Example 2: Consultancy — Engagement Planning

**Scenario:** AI creates activity plan for new management consulting engagement.

**Context:**
- Engagement scope & requirements
- Available consultants + capacity
- Similar past engagements (knowledge base)
- Client expectations (SLA)

**AI Plan:**
```json
{
  "activities": [
    {
      "name": "Stakeholder Interviews",
      "assigned_role": "consultant_senior",
      "rationale": "Needs interviewing experience for credibility with C-suite",
      "estimated_hours": 16,
      "dependencies": []
    },
    {
      "name": "Data Collection",
      "assigned_role": "consultant_junior",
      "rationale": "Systematic data gathering doesn't require seniority; good development opportunity",
      "estimated_hours": 24,
      "dependencies": ["Stakeholder Interviews"]
    }
  ],
  "timeline_summary": "8 weeks to completion (vs. typical 10 weeks)",
  "capacity_concern": "consultant_senior is at 95% capacity; recommend buffer"
}
```

---

**For complete server action documentation, see:** `docs/architecture/ORGANIZATION-SCHEMA.md`
**For Synkra AIOX integration, see:** `.claude/CLAUDE.md`
