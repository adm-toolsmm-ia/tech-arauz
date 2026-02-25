# ADR: Command Safety Architecture (CSA-001)

**Title**: 4-Layer Command Validation Architecture for DevOps
**Status**: PROPOSED
**Context**: Epic CSA-001
**Decision Date**: 2026-02-24
**Deciders**: @architect (Aria), @pm (Morgan), @devops (Gage)

---

## 📋 Context

DevOps operations (git push, force-push, reset, etc.) are high-risk with potential for:
- Data loss (overwriting commits, deleting branches)
- Workflow disruption (pushing to wrong branch)
- Security breaches (credentials exposed)
- Loss of audit trail (no record of who did what)

Current state: No systematic validation of commands before execution.

---

## ❓ Problem

1. **No Consistent Validation**: Each tool (git, npm, gh) has different safety models
2. **No Audit Trail**: Commands executed without logging
3. **No Reversibility**: Mistakes are hard to undo
4. **No Clear Rules**: Teams don't know what's allowed vs forbidden
5. **No Training**: New team members don't understand safety procedures

---

## 🎯 Decision

Implement a **4-layer command safety architecture**:

```
Layer 4: Task Execution         (safe-git-push)
         ↓ Interactive flow
Layer 3: Command Wrappers       (git-wrapper, npm-wrapper)
         ↓ Git/npm/bash operations
Layer 2: Validation Rules       (devops-execution-safety.md)
         ↓ 30+ rules documented
Layer 1: Validator Utility      (command-validator.js)
         ↓ Core validation logic
```

---

## 🔑 Key Design Decisions

### 1. Layered Architecture (Not Monolithic)
**Why**: Separation of concerns, reusability, testing, maintainability
- Layer 1: Reusable utility for any command
- Layer 2: Rules are documented, versionable, auditable
- Layer 3: Wrappers for specific tools (git, npm, bash)
- Layer 4: Task interfaces for human users

### 2. Documentation-Driven Rules (Not Code-Only)
**Why**: Rules need to be:
- Understandable to non-developers (@devops, @pm)
- Auditable by compliance team
- Versionable and reviewable like code
- Linked to implementation code

**Decision**: Rules defined in `devops-execution-safety.md` (30+ rules) with cross-references to implementation code. Full specification: `docs/stories/epic-csa-command-safety/CSA-001-rules-reference.md`. Context summary for IDE: `.claude/rules/devops-execution-safety.md`.

### 3. Paranoid Validation (Fail-Safe Default)
**Why**: Better to reject a valid command than allow an invalid one
- Multiple validation passes (layer 1 + layer 2 + layer 3)
- Each layer independent (no single point of failure)
- No silent failures (always return status)

**Decision**: Validate at every layer, never skip checks.

### 4. Mandatory Audit Trail
**Why**: Compliance, debugging, accountability
- Every command logged with timestamp, user, args, status
- Structured JSON format (machine-readable)
- Retention policy (90 days, LGPD compliance)
- API endpoint for querying logs

**Decision**: No operation proceeds without logging capability.

### 5. Reversibility for Destructive Operations
**Why**: Humans make mistakes, operations should be reversible
- Pre-push reflog backup
- Double confirmation for --force
- Rollback instructions provided
- Limited scope (max 5 commits in force-push)

**Decision**: Every destructive operation has a rollback plan.

### 6. Interactive Confirmation Flow (Not Automatic)
**Why**: High-risk operations need human decision-making
- Show exactly what will happen (git diff, file counts, etc.)
- Ask for explicit confirmation
- For --force operations, require typing "force"
- Provide cancel option at each step

**Decision**: No automatic execution of high-risk commands.

### 7. Zero External Dependencies (Core Validator)
**Why**: Reliability, security, minimal footprint
- command-validator.js uses Node.js built-ins only
- No npm packages required for core validation
- Faster execution, lower attack surface
- Easy to audit

**Decision**: Core validator (Layer 1) has zero external deps.

### 8. Extensible Wrapper Pattern
**Why**: Easy to add new command types (npm, bash, etc.)
- GitWrapper class serves as pattern
- Can be reused for npmWrapper, bashWrapper, ghWrapper
- Rules document scales to 50+ rules
- Consistent API across all wrappers

**Decision**: Use wrapper pattern from day 1 (CSA-1.3), not a monolith.

### 9. Task-Driven User Interface (Not CLI Library)
**Why**: Consistency with AIOS framework
- Use standard AIOS task interface (`*safe-git-push`)
- Console prompts for interactive flow (readline module)
- No external UI library dependency
- Aligns with @pm/story-driven development

**Decision**: Use `*command` task pattern, not standalone CLI.

### 10. Metrics + Monitoring from Day 1
**Why**: Can't improve what you don't measure
- Track validation success rate
- Monitor command latency
- Collect team confidence feedback
- Weekly metrics review

**Decision**: Monitoring dashboard created in Phase 3, metrics collected from Phase 1.

---

## 💪 Why This Architecture

### vs. Alternatives

#### Alternative 1: Monolithic Validator
❌ Single function does everything
- Hard to test
- Hard to maintain
- Tight coupling

✅ Our 4-layer approach
- Each layer testable independently
- Changes to rules don't affect validator
- Easy to add new command types

#### Alternative 2: Code-Only Rules (No Documentation)
❌ Rules buried in if/else statements
- Non-developers can't understand them
- Compliance team can't audit
- Hard to version and track changes

✅ Our documentation-driven approach
- Rules visible in `devops-execution-safety.md`
- Non-developers can understand
- Easy to audit and track changes
- Code cross-referenced to rules

#### Alternative 3: Automatic Execution
❌ "User clicks button, git push --force happens automatically"
- No confirmation needed
- No time to back out
- Oops!

✅ Our confirmation flow
- Show what will happen first
- User explicitly confirms
- For --force, type "force" to proceed
- Paranoid: ask multiple times

#### Alternative 4: No Audit Trail
❌ "Command executed, no record"
- If something goes wrong, no evidence
- Compliance team unhappy
- Can't debug issues

✅ Our mandatory logging
- Every command logged
- Structured JSON format
- API endpoint for queries
- 90-day retention

---

## 🏗️ Architecture Diagram

```
DevOps User
    │
    ├─ *safe-git-push [branch] [remote]  (Layer 4: Task)
    │
    ├─ Pre-flight checks:
    │  ├─ Is branch clean? (no uncommitted changes)
    │  ├─ Does remote exist?
    │  ├─ Does branch track upstream?
    │  └─ Validate all with command-validator.js (Layer 1)
    │
    ├─ Check against rules (Layer 2):
    │  ├─ CSA-RULE-010: Push requires valid branch + remote
    │  ├─ CSA-RULE-011: --force needs double confirmation
    │  └─ CSA-RULE-012: No push to main without special auth
    │
    ├─ Execute via git-wrapper.js (Layer 3):
    │  ├─ Call validator again (defense in depth)
    │  ├─ Detect --force flag
    │  └─ Ask confirmation if needed
    │
    ├─ Show confirmation (if interactive mode):
    │  ├─ Summary: branch, remote, commits, files
    │  ├─ For --force: show overwritten commits
    │  └─ Ask: "Proceed? (Y/n)"
    │
    ├─ If --force: Ask second confirmation
    │  └─ "Type 'force' to confirm"
    │
    ├─ Execute git push
    │
    └─ Log to audit trail (Layer 2):
       ├─ timestamp, user, command, args, status
       ├─ File: audit/git-push-log.json
       └─ Also available via API: GET /api/audit/git-push-history
```

---

## 🔒 Security Implications

### Threat: Command Injection
**Mitigation**: Never use shell: true, always use execFile with array args

### Threat: Path Traversal
**Mitigation**: Validate paths, prevent `../../../etc/passwd` patterns

### Threat: Privilege Escalation
**Mitigation**: Never use sudo in wrappers, user runs commands with own permissions

### Threat: Audit Log Tampering
**Mitigation**: Logs in .git/ (protected) and audit/ (restricted read), append-only

### Threat: Accidental Exposure of Secrets
**Mitigation**: Never log environment variables, never log API tokens

---

## 📊 Implementation Phases

### Phase 1: Foundation (Week 1)
- CSA-1.1: command-validator.js (Layer 1)
- CSA-1.2: devops-execution-safety.md (Layer 2)

### Phase 2: Enhancement (Week 2)
- CSA-1.3: git-wrapper.js (Layer 3)
- CSA-1.4: safe-git-push task (Layer 4)

### Phase 3: Integration (Week 3)
- CI/CD integration
- Team training
- Monitoring dashboard

### Future: Extensibility
- npm-wrapper.js
- bash-wrapper.js
- gh-wrapper.js (GitHub CLI)
- More rules (50+ total)

---

## 📈 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Command validation success | 100% | Count of validation passes / total |
| First-attempt success rate | 95%+ | Count of 1st-try successes / total |
| Validation latency | < 100ms | Measure time from command to validation result |
| Audit trail coverage | 100% | Count of logged operations / total |
| Team confidence | 5/5 | Survey after 2 weeks |
| Production incidents | 0 | Count of command-related incidents |

---

## ⚠️ Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Performance < 100ms not met | Medium | Medium | Optimize regex, cache rules, profile early |
| Team resistance to strict validation | Low | High | Education, show real incidents, gradual rollout |
| Git mocking complexity in tests | Medium | Low | Use real git for integration tests, mock for unit |
| Audit log performance impact | Low | Medium | Async logging, queue, separate process |
| Rollback not working correctly | Low | High | Test extensively, provide manual procedures |

---

## 🔄 Decision Rationale

### Why 4 Layers Instead of 1?
- **Separation of Concerns**: Each layer has single responsibility
- **Testability**: Can test Layer 1 without Layer 4
- **Reusability**: command-validator.js useful everywhere
- **Maintainability**: Changes to rules don't affect code

### Why Document Rules in MD Instead of Code?
- **Auditability**: Non-developers can read and understand
- **Versionability**: Changes visible in git history
- **Compliance**: Rules traceable for audits
- **Change Control**: Clear process for updating rules

### Why Paranoid Validation?
- **Risk**: DevOps operations can destroy months of work
- **Benefit**: False positive (reject valid command) is better than false negative
- **Philosophy**: When in doubt, ask the user

### Why Mandatory Audit Trail?
- **Compliance**: LGPD requires data access logs
- **Debugging**: If something goes wrong, we need evidence
- **Accountability**: Team knows operations are tracked
- **Training**: Can review logs to understand what happened

---

## ✅ Approval

- [ ] @architect (Aria) — Architecture approved
- [ ] @pm (Morgan) — Timeline and scope approved
- [ ] @devops (Gage) — Safety rules approach approved
- [ ] @dev (Dex) — Implementation feasible

---

## 📝 Change Log

| Date | Author | Status | Notes |
|------|--------|--------|-------|
| 2026-02-24 | @pm | PROPOSED | Initial ADR |

---

## 🔗 Related

- **Epic**: `EPIC-CSA-001.md`
- **Stories**: CSA-1.1, CSA-1.2, CSA-1.3, CSA-1.4
- **Roadmap**: `ROADMAP.md`
- **Framework**: `.aios-core/constitution.md`

---

**Next**: Review by @architect, then proceed to Phase 1
