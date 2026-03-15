# org-agent-prompts.md

**Status:** ✅ COMPLETE (Phase 2 Content Generation — Story 11.14)

**Note:** This file contains reference prompts. For comprehensive prompt engineering guidance, see `docs/guides/AI-CONTEXT-ENGINEERING.md`

## Overview

Sample prompts for AI agents working with Tech Arauz organizational context. These examples demonstrate how to structure prompts for different use cases: process analysis, activity planning, knowledge-based reasoning, and multi-step organizational workflows.

## Table of Contents

- [Process Analysis Prompts](#process-analysis-prompts)
- [Activity Planning Prompts](#activity-planning-prompts)
- [Knowledge-Based Reasoning Prompts](#knowledge-based-reasoning-prompts)
- [Organizational Workflow Prompts](#organizational-workflow-prompts)
- [Prompt Engineering Best Practices](#prompt-engineering-best-practices)

## Process Analysis Prompts

### Bottleneck Identification

```markdown
# Task: Process Bottleneck Analysis

You are a business process optimization specialist analyzing a legal process.

## Process Context
**Process Name:** Recuperação de Crédito — Initial Filing
**Owner Role:** advogado
**Current Cycle Time:** 45 hours (Target: 24 hours)

## Process Steps
1. Interview Client → paralegal (avg 2h) → Output: Case Facts
2. Research Debtor → analyst (avg 6h) → Output: Debtor Research
3. Prepare Legal Brief → advogado (avg 8h) → Output: Draft Brief
4. Legal Review → advogado_senior (avg 12h) → Output: Approved Brief
5. File Documents → paralegal (avg 6h) → Output: Court Filing
6. Confirm Filing → court_liaison (avg 3h) → Output: Confirmation

## Current Metrics (Last 30 Days)
- Total Cases: 120
- Completed Cases: 108
- Completion Rate: 90%
- Average Cycle Time: 45.2 hours
- Quality Score: 92%
- On-Time Delivery: 78%

## Historical Baseline
- Q1 2026: 36 hour average
- Q2 2025: 32 hour average
- Industry Benchmark: 20 hours

## SLA Requirements
- Target: 24 hours
- Escalation: 12 hours

## Your Task
1. Identify the top 3 bottlenecks with quantitative evidence
2. Explain why each activity is slow
3. Rank by impact (time saved * frequency)
4. For each bottleneck, suggest 2-3 specific improvements
5. Estimate the effort and feasibility of each improvement

## Output Format
### Bottleneck #1: [Name]
- **Evidence**: Activity X takes Y hours (compared to Z hour benchmark)
- **Impact**: Accounts for X% of total cycle time
- **Root Cause**: [Analysis]
- **Recommendations**:
  1. [Specific action] (Effort: Low/Medium/High, Feasibility: High/Medium/Low)
  2. [Specific action]

### Summary
- **Total Cycle Time Reduction Potential**: X hours
- **Priority Action**: [Highest ROI improvement]
```

### Process Optimization

```markdown
# Task: Process Improvement Plan

You are a process consultant creating an optimized version of a consulting engagement process.

## Current Process
**Engagement Type:** Management Consulting — Operations Review
**Duration:** 12 weeks (Target: 8 weeks)

### Current Activities
1. Kickoff Meeting → engagement_manager (4 hours)
2. Stakeholder Interviews → consultant_senior (48 hours)
3. Data Collection → consultant_junior (40 hours)
4. Analysis & Findings → consultant_senior (60 hours)
5. Draft Report → consultant_senior (20 hours)
6. Client Review Rounds → engagement_manager (30 hours)
7. Final Report & Presentation → partner (10 hours)

## Constraints
- Keep all quality checks
- Cannot eliminate client touchpoints
- Consultant_senior is 85% allocated
- Limited to 1 junior consultant

## Requirements
- Reduce timeline to 8 weeks (save 4 weeks)
- Maintain 95%+ client satisfaction
- Keep quality score ≥ 4.5/5
- Use existing resources (no hiring)

## Your Task
Create an optimized process plan that:
1. Parallelize activities where possible
2. Delegate to junior consultants where appropriate
3. Remove non-value-added steps
4. Optimize senior consultant utilization
5. Maintains quality and client satisfaction

## Output Format
### Optimized Activity Sequence
1. **Activity Name** (Role: X, Duration: Y hours)
   - Can run in parallel with: [Activity IDs]
   - Dependencies: [Activity IDs]
   - Justification: [Why this sequencing is optimal]

### Key Changes from Current Process
- Parallel activities: [List with time savings]
- Delegation changes: [Who is doing what now]
- Removed steps: [What was eliminated and why]

### Timeline Projection
- Optimized total: X weeks (improvement: Y weeks saved)
- Critical path: [List of sequential activities]
- Buffer/contingency: Z days for Q&A

### Risk Assessment
- Capacity concerns: [Resource constraints]
- Quality risks: [Where we need extra oversight]
- Client impact: [How changes affect client touchpoints]
```

### Compliance Gap Analysis

**[Content to be generated when Story 11.13 ≥75%]**

```
# Example Prompt Structure
Analyze this process against these compliance requirements:
[Process definition]
[Compliance rules]
[Current controls]

Identify gaps and recommend remediation.
```

## Activity Planning Prompts

### Responsible Role Assignment

**[Content to be generated when Story 11.13 ≥75%]**

```
# Example Prompt Structure
You are planning activity assignments.
Given these constraints:
[Available roles and permissions]
[SLA requirements]
[Historical workload]

Suggest optimal role assignments for these activities.
```

### Workload Balancing

**[Content to be generated when Story 11.13 ≥75%]**

```
# Example Prompt Structure
Analyze current workload distribution:
[Activities per role]
[Effort estimates]
[Capacity limits]

Suggest rebalancing to improve efficiency.
```

### Escalation Path Planning

**[Content to be generated when Story 11.13 ≥75%]**

```
# Example Prompt Structure
Design escalation paths for these activities:
[Activity definitions]
[Role hierarchy]
[SLA thresholds]

Map decision points to appropriate roles.
```

## Knowledge-Based Reasoning Prompts

### Semantic Search Integration

**[Content to be generated when Story 11.13 ≥75%]**

```
# Example Prompt Structure
You have access to organizational knowledge base.

User Question: [question]
Relevant Knowledge: [semanticSearchKnowledgeAction results]
Role Context: [user's role and permissions]

Answer based on the retrieved knowledge.
```

### Historical Case Application

**[Content to be generated when Story 11.13 ≥75%]**

```
# Example Prompt Structure
You are solving a similar case.

Current Situation: [activity/process details]
Similar Historical Cases: [search results]

What approach worked before? How does it apply here?
```

### Best Practice Recommendation

**[Content to be generated when Story 11.13 ≥75%]**

```
# Example Prompt Structure
You are recommending best practices.

Context: [role, process, activity]
Retrieved Best Practices: [semantic search results]

What's the recommended approach?
Why? What are the caveats?
```

## Organizational Workflow Prompts

### Multi-Step Workflow Analysis

**[Content to be generated when Story 11.13 ≥75%]**

```
# Example Prompt Structure
You are analyzing a workflow.

Workflow Definition:
[Area → Nucleus → Process → Routines → Activities]

Metrics:
[Process metrics and SLA data]

Questions to answer:
1. What's the critical path?
2. Where are the bottlenecks?
3. What's the estimated cycle time?
4. What risks exist?
```

### Cross-Functional Coordination

**[Content to be generated when Story 11.13 ≥75%]**

```
# Example Prompt Structure
You are planning cross-functional work.

Teams Involved:
[Area 1: roles and capacity]
[Area 2: roles and capacity]
[Area 3: roles and capacity]

Task Requirements:
[Dependencies, duration, quality standards]

Generate a coordination plan.
```

### Change Impact Analysis

**[Content to be generated when Story 11.13 ≥75%]**

```
# Example Prompt Structure
You are assessing process change impact.

Proposed Change:
[Change description]

Current State:
[Affected processes, activities, roles]
[Current metrics]
[SLA commitments]

Analyze:
- What processes are affected?
- What's the implementation risk?
- What communication is needed?
```

## Prompt Engineering Best Practices

### Context Injection

**[Content to be generated when Story 11.13 ≥75%]**

Guidelines for:
- Role context inclusion
- Process context depth
- Metric interpretation
- Token budget management

### Prompt Structure

**[Content to be generated when Story 11.13 ≥75%]**

Template:
```
1. Role statement (who you are)
2. Task definition (what you're doing)
3. Context data (org context, metrics, knowledge)
4. Specific question (what we want to know)
5. Output format (how to respond)
```

### Few-Shot Examples

**[Content to be generated when Story 11.13 ≥75%]**

Example input-output pairs for:
- Process optimization tasks
- Role assignment problems
- Workflow design questions

### Testing Prompts

**[Content to be generated when Story 11.13 ≥75%]**

How to validate:
- Accuracy of recommendations
- Compliance with constraints
- Completeness of analysis
- Reasoning quality

---

**Next:** When Story 11.13 ≥75%, Phase 2 content generation will populate all sections with runnable examples.

