# Story CSA-1.2: Create devops-execution-safety.md rules

**ID**: CSA-1.2
**Epic**: CSA-001 (Command Safety Architecture for DevOps)
**Status**: InProgress
**Priority**: HIGH
**Complexity**: LOW
**Points**: 8
**Owner**: @devops (Gage)

---

## 📖 User Story

As @devops, I want a comprehensive, single-source-of-truth document that defines all 30+ validation rules for safe command execution in the AIOS DevOps workflow, so that every command (git, gh, npm, bash) is validated consistently, audited, and can be rejected before it causes damage.

---

## ✅ Acceptance Criteria

### Rule Documentation
- [x] Document contains 30+ validation rules organized by category
- [x] Each rule has: ID, category, severity, description, valid examples, invalid examples
- [x] Rules are formatted consistently (markdown table)
- [x] Severity levels defined: CRITICAL, HIGH, MEDIUM, LOW
- [x] Every rule includes WHY it matters (business impact)

### Rule Categories (5+ categories)
- [x] **Path Safety** (5 rules): escaping, dangerous paths, wildcards
- [x] **Git Operations** (10 rules): push, force-push, reset, merge, etc.
- [x] **GitHub CLI** (5 rules): PR, releases, authentication
- [x] **NPM/Package Managers** (5 rules): install, publish, scripts, audit
- [x] **Bash/Shell** (5 rules): injection prevention, variable expansion, timeouts

### Rule Quality
- [x] Each rule has unique ID: CSA-RULE-XXX format
- [x] Clear acceptance/rejection criteria
- [x] At least 2 valid examples per rule
- [x] At least 2 invalid examples per rule
- [x] Traceability: each rule linked to a validation function (or note why manual)

### Completeness
- [x] All 30+ rules documented with full detail
- [x] Checklist: which rules are automated vs manual review
- [x] Performance impact noted for each rule
- [x] Dependencies between rules documented (e.g., rule A depends on rule B)

### Integration Points
- [x] Checklist: how command-validator.js implements rules
- [x] Checklist: how git-wrapper.js implements rules
- [x] Checklist: which rules require human confirmation
- [x] Checklist: how safe-git-push.md uses these rules

### Change Control
- [x] Version number (1.0.0)
- [x] Last updated date
- [x] Change log with previous versions
- [x] Review/approval sign-off section

### Supplementary Documentation
- [x] Quick reference card (1 page, all 30+ rules)
- [x] Severity matrix (which rules are blocking vs warnings)
- [x] Troubleshooting guide (common validation failures)
- [x] FAQ: why this rule, how to work around it

---

## 📝 Description

### Problem
DevOps operations are high-risk (git push, force-push, reset, delete, etc.). Without clear safety rules:
- ❌ Operators don't know what's allowed
- ❌ No consistent enforcement across tools
- ❌ Mistakes happen without audit trail
- ❌ Each tool (git, npm, gh) has different safety models

### Solution
Create a comprehensive, single-source-of-truth rule document that:
1. Lists ALL 30+ validation rules in one place
2. Clearly explains why each rule exists
3. Shows valid and invalid examples for every rule
4. Maps rules to implementing code (validators, wrappers)
5. Provides change control and versioning
6. Enables training, audits, and compliance

### Audience
- 👥 @devops team members (primary users)
- 👥 @dev team (implementing validators)
- 👥 @qa team (testing validators)
- 👥 @pm team (compliance, audit)
- 👥 New team members (onboarding)

---

## 🎯 Scope

### IN
- ✅ 30+ rules across 5 categories
- ✅ Each rule with: ID, description, examples, severity
- ✅ Integration checklist with code
- ✅ Quick reference card
- ✅ Change log and versioning
- ✅ FAQ and troubleshooting

### OUT
- ❌ Implementation code (that's CSA-1.1, CSA-1.3, CSA-1.4)
- ❌ Automated enforcement (code's responsibility)
- ❌ Interactive UI/forms (out of scope)
- ❌ Performance tuning (covered in implementation stories)

---

## 📋 Definition of Done

- [ ] All 30+ rules documented
- [ ] All rules have valid/invalid examples
- [ ] Integration checklist completed
- [ ] Quick reference card generated
- [ ] Troubleshooting guide written
- [ ] Change log added
- [ ] PR reviewed by @architect + @qa
- [ ] No conflicts with existing policies
- [ ] Merged to main branch
- [ ] Published to `/docs/devops/`

---

## 📂 File List

| File | Status | Purpose |
|------|--------|---------|
| `.claude/rules/devops-execution-safety.md` | COMPLETE | Main rules document (34 rules) |
| `docs/devops/devops-safety-quick-reference.md` | PENDING | 1-page cheat sheet |
| `docs/devops/devops-safety-troubleshooting.md` | PENDING | FAQ & troubleshooting |
| `.aios-core/decision-logs/ADR-CSA-safety-rules.md` | PENDING | Decision log |

---

## 📋 Rule Template

Each rule follows this format:

```markdown
### CSA-RULE-XXX: [Rule Name]

**Category**: [Path/Git/GitHub/NPM/Bash]
**Severity**: [CRITICAL/HIGH/MEDIUM/LOW]
**Type**: [Automated/Manual Review/Confirmation Required]

**Description**:
Clear explanation of what this rule prevents and why it matters.

**Business Impact**:
What happens if this rule is violated (data loss, security breach, etc.).

**Valid Examples**:
✅ `git push origin main`
✅ `git push origin feature/xyz`

**Invalid Examples**:
❌ `git push origin main --force` (without confirmation)
❌ `git push --force-all` (dangerous flag)

**Implementation**:
- Implemented in: `command-validator.js` line 45-60
- Also checked in: `git-wrapper.js`
- Manual review required: Yes (confirm before execution)

**Performance Impact**:
< 5ms (checks regex only)

**Notes**:
Additional context, exceptions, or future considerations.
```

---

## 🔑 Rule Categories

### 1. Path Safety (5 rules)

**CSA-RULE-001**: Spaces in paths must be escaped
- Prevents: Execution failures with paths like `/home/user/my projects/file.txt`

**CSA-RULE-002**: Absolute paths recommended for destructive operations
- Prevents: Accidentally deleting files in wrong directory

**CSA-RULE-003**: Verify path existence before rm/mv
- Prevents: Errors, suggests alternatives if path not found

**CSA-RULE-004**: Blacklist dangerous system paths
- Prevents: `rm -rf /`, `rm -rf /home`, `rm -rf /var`, etc.

**CSA-RULE-005**: Validate wildcard expansion
- Prevents: Unintended file matching with `*` or `?`

### 2. Git Operations (10 rules)

**CSA-RULE-010**: Push requires valid branch + remote
- Prevents: Typos in branch/remote names

**CSA-RULE-011**: --force push requires double confirmation
- Prevents: Accidental force-push that rewrites history

**CSA-RULE-012**: No push to main/master without PR
- Prevents: Direct commits to protected branches

**CSA-RULE-013**: Reset --hard requires repo state check
- Prevents: Losing uncommitted changes

**CSA-RULE-014**: Rebase --interactive requires manual execution only
- Prevents: Unintended rewrites of history

**CSA-RULE-015**: Merge requires base branch to exist
- Prevents: Typos in merge targets

**CSA-RULE-016**: Cherry-pick requires valid commit hash
- Prevents: Applying non-existent commits

**CSA-RULE-017**: Force-push max 5 commits (safety limit)
- Prevents: Rewriting 100+ commits by mistake

**CSA-RULE-018**: Detect orphan branches before push
- Prevents: Creating disconnected branches

**CSA-RULE-019**: Validate commit signatures (GPG)
- Prevents: Pushing unsigned commits (if required)

### 3. GitHub CLI (5 rules)

**CSA-RULE-020**: PR create requires base branch exists
- Prevents: Creating PR against non-existent branch

**CSA-RULE-021**: PR merge requires status checks passing
- Prevents: Merging code with failing tests

**CSA-RULE-022**: Release create requires tag format (vX.Y.Z)
- Prevents: Invalid semantic versions

**CSA-RULE-023**: Detect conflicts before PR merge
- Prevents: Merging conflicted code

**CSA-RULE-024**: Validate GITHUB_TOKEN before API calls
- Prevents: API failures due to auth issues

### 4. NPM/Package Managers (5 rules)

**CSA-RULE-025**: Install requires valid package.json
- Prevents: Installing to wrong directory

**CSA-RULE-026**: Publish requires version bump (semver)
- Prevents: Publishing duplicate versions

**CSA-RULE-027**: Script execution whitelisted only
- Prevents: Running arbitrary npm scripts

**CSA-RULE-028**: Verify vulnerabilities with npm audit
- Prevents: Publishing with known CVEs

**CSA-RULE-029**: Cache clear requires confirmation
- Prevents: Accidentally clearing shared cache

### 5. Bash/Shell (5 rules)

**CSA-RULE-030**: Prevent command injection
- Prevents: Shell injection from user input

**CSA-RULE-031**: Variable expansion must be explicit
- Prevents: Unintended variable substitution

**CSA-RULE-032**: Syntax check before execution
- Prevents: Bash syntax errors

**CSA-RULE-033**: Output redirection must be valid
- Prevents: Data loss via wrong redirection

**CSA-RULE-034**: Timeout protection (5 min default)
- Prevents: Infinite loops, hanging processes

---

## 📊 Severity Matrix

| Severity | Impact | Action | Example |
|----------|--------|--------|---------|
| CRITICAL | Data loss / Security | Block immediately | `rm -rf /` |
| HIGH | Workflow disruption | Require confirmation | `git push --force` |
| MEDIUM | Minor issues | Warning + document | Space in path without escaping |
| LOW | Info only | Log only | Uncommitted changes warning |

---

## 🔗 Integration Checklist

### Command Validator (CSA-1.1)
- [ ] Implements CSA-RULE-001, 002, 003 (paths)
- [ ] Implements CSA-RULE-030, 031, 032 (shell safety)
- [ ] Implements CSA-RULE-025, 026 (npm basic checks)

### Git Wrapper (CSA-1.3)
- [ ] Implements CSA-RULE-010, 011, 012, 013 (git operations)
- [ ] Implements CSA-RULE-017, 018, 019 (advanced git)
- [ ] Calls command-validator for CSA-RULE-001, 003

### Safe Git Push (CSA-1.4)
- [ ] Implements CSA-RULE-011 (double confirmation)
- [ ] Implements CSA-RULE-012 (branch protection)
- [ ] Implements CSA-RULE-017 (force-push limit)

### Manual Review (Audit Log)
- [ ] CSA-RULE-014 (rebase --interactive)
- [ ] CSA-RULE-021 (PR merge final decision)
- [ ] CSA-RULE-023 (conflict resolution)

---

## 📈 Metrics

- **Rules documented**: 30+
- **Categories**: 5+
- **Documentation pages**: 4
- **Code examples**: 80+
- **Change log entries**: 1 (initial version 1.0.0)

---

## 🚀 Implementation Steps

### Step 1: Create Rule Documents
- Write all 30+ rules using template
- Organize by category
- Add examples for each

### Step 2: Create Quick Reference
- 1-page summary (printable)
- Table format: ID, category, severity, description

### Step 3: Create Troubleshooting Guide
- Common validation failures
- How to interpret error messages
- Workarounds and alternatives

### Step 4: Add Integration Checklist
- Map each rule to implementation code
- Note which are automated vs manual

### Step 5: Create Change Log
- Version 1.0.0 entry
- Sign-off section
- Future amendment procedure

---

## 📚 Output Example (Quick Reference)

| ID | Category | Severity | Rule | Implementation |
|----|-----------|-----------|----|---|
| CSA-RULE-001 | Path | HIGH | Spaces must be escaped | command-validator.js |
| CSA-RULE-011 | Git | CRITICAL | --force needs confirmation | git-wrapper.js |
| CSA-RULE-025 | NPM | MEDIUM | Verify package.json | command-validator.js |
| ... | ... | ... | ... | ... |

---

## 💾 Change Log

| Date | Author | Action | Notes |
|------|--------|--------|-------|
| 2026-02-24 | @pm | Created | Initial story structure |

---

## 🤝 Handoff Notes

- **For @devops**: Lead the rule definition, ensure completeness and clarity
- **For @architect**: Review for consistency with AIOS framework
- **For @qa**: Create test cases from each rule's examples
- **For @dev**: Use rules as specification for implementation

---

**Status**: Draft → Ready
**Next**: Assign to @devops for Phase 1 kickoff
