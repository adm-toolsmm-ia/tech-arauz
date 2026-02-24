# Story CSA-1.4: Create safe-git-push.md task

**ID**: CSA-1.4
**Epic**: CSA-001 (Command Safety Architecture for DevOps)
**Status**: Draft
**Priority**: MEDIUM
**Complexity**: LOW
**Points**: 8
**Owner**: @devops (Gage)

---

## 📖 User Story

As @devops, I want an executable `*safe-git-push` task that provides total protection for git push operations with pre-validation, double confirmation for dangerous operations, rollback procedures, and complete audit logging, so that every push is intentional, reversible, and tracked.

---

## ✅ Acceptance Criteria

### Pre-Execution Validations
- [ ] Task validates current branch exists and is clean (no uncommitted changes)
- [ ] Task validates remote exists and is reachable
- [ ] Task checks if branch is tracking an upstream branch
- [ ] Task verifies commit history (no orphan commits)
- [ ] Task detects if local branch is behind remote (suggest pull first)

### Push Protection
- [ ] Detects --force or --force-with-lease flags and requires DOUBLE confirmation
- [ ] Implements maximum force-push limit (default: 5 commits, configurable)
- [ ] For --force pushes, shows diff of what will be overwritten
- [ ] Prevents push to protected branches (main, master, develop) without special auth
- [ ] Validates commit messages for required format (conventional commits)

### Confirmation Flow (Interactive)
- [ ] Step 1: Show summary (branch, remote, commits, files changed)
- [ ] Step 2: If --force, show what will be overwritten + ask confirmation
- [ ] Step 3: If protected branch, require DOUBLE confirmation
- [ ] Step 4: Final confirmation before execution
- [ ] Each step allows cancel or retry

### Rollback Capability
- [ ] Saves pre-push reflog state in `.git/csa-reflog-backup-{timestamp}`
- [ ] If push succeeds but user regrets, provides rollback command
- [ ] Rollback is semi-automatic (suggest command, user must confirm)
- [ ] Rollback guidance shows: original branch, how to recover commits

### Audit Logging
- [ ] Logs to `audit/git-push-log.json` (structured format)
- [ ] Log entry includes: timestamp, user, branch, remote, flags, status, duration
- [ ] Log rotation: archive when > 10MB, keep last 10 archives
- [ ] API endpoint to query logs: `GET /api/audit/git-push-history`

### Dry-Run Mode
- [ ] Task accepts `--dry-run` flag to simulate push without executing
- [ ] Dry-run shows all validations and confirmation flow without actual push
- [ ] Dry-run output matches production flow for testing

### Integration
- [ ] Uses git-wrapper.js (CSA-1.3) for actual push execution
- [ ] Uses command-validator.js (CSA-1.1) for command validation
- [ ] Can be invoked: `*safe-git-push [branch] [remote] [flags]`
- [ ] Fallback to interactive mode if args missing

### Error Handling
- [ ] Clear error messages for all failure scenarios
- [ ] Suggestions for how to fix (e.g., "Run git pull first")
- [ ] Timeout protection (30 second max for all operations)
- [ ] Graceful degradation if git-wrapper unavailable

### Documentation
- [ ] Task definition in `.aios-core/development/tasks/safe-git-push.md`
- [ ] Implementation in `src/lib/wrappers/safe-git-push.js`
- [ ] User guide: `docs/devops/safe-git-push-usage.md`
- [ ] Examples and troubleshooting guide

### Testing
- [ ] Unit tests: `tests/wrappers/safe-git-push.test.js`
- [ ] 85%+ code coverage (some mock limitations)
- [ ] Tests for all validation scenarios
- [ ] Tests for rollback flow
- [ ] Tests for audit logging

---

## 📝 Description

### Problem
`git push` is one of the most dangerous commands in DevOps:
- ❌ --force-push can overwrite team's work
- ❌ Pushing to wrong branch is common
- ❌ No confirmation before irreversible changes
- ❌ No audit trail of who pushed what
- ❌ Rollback is manual and error-prone

### Solution
Create an executable task that:
1. Validates all preconditions before push
2. Shows clear summary and asks confirmation
3. Requires DOUBLE confirmation for --force
4. Logs everything for audit trail
5. Provides easy rollback if needed
6. Prevents protected branch accidents

### Design Philosophy
- **Paranoid Validation**: Check everything multiple times
- **Transparency**: Show exactly what will happen
- **Reversibility**: Always provide rollback option
- **Audit Trail**: Complete history for compliance
- **User-Friendly**: Clear prompts, helpful suggestions

---

## 🎯 Scope

### IN
- ✅ Pre-execution validation (branch, remote, commits)
- ✅ Double confirmation for --force
- ✅ Protected branch detection
- ✅ Rollback capability
- ✅ Audit logging
- ✅ Dry-run mode
- ✅ User guide + examples
- ✅ Unit tests (85%+ coverage)

### OUT
- ❌ Interactive CLI UI library (use console prompts only)
- ❌ GitHub branch protection enforcement (Git responsibility)
- ❌ Email/Slack notifications (separate module)
- ❌ Automatic rollback (manual only)

---

## 📋 Definition of Done

- [ ] Task executable with `*safe-git-push` command
- [ ] All validations implemented and tested
- [ ] Rollback capability working
- [ ] Audit logging functional
- [ ] Documentation complete
- [ ] PR reviewed by @qa + @architect
- [ ] No linting/TypeScript errors
- [ ] Merged to main
- [ ] Published to `.aios-core/development/tasks/`

---

## 📂 File List

| File | Status | Purpose |
|------|--------|---------|
| `.aios-core/development/tasks/safe-git-push.md` | NEW | Task definition |
| `src/lib/wrappers/safe-git-push.js` | NEW | Implementation |
| `tests/wrappers/safe-git-push.test.js` | NEW | Unit tests |
| `docs/devops/safe-git-push-usage.md` | NEW | User guide |
| `audit/git-push-log.json` | NEW | Audit log file |

---

## 🔑 Core Flow

### Normal Push Flow (Non-Destructive)

```
1. User: *safe-git-push main origin
2. Validate branch 'main' exists + clean + tracking
3. Validate remote 'origin' reachable
4. Show summary:
   Branch: main
   Remote: origin
   Commits: 3 new
   Files: 5 changed
5. Ask: Proceed? (Y/n)
6. If Y: Execute git push origin main
7. If success: Show "Push successful" + offer audit log link
8. If failure: Show error + rollback suggestion
```

### Force-Push Flow (Destructive)

```
1. User: *safe-git-push --force feature/xyz origin
2. Run all normal validations
3. Check force-push limit (max 5 commits)
4. Show what will be overwritten:
   - 5 commits will be lost from remote
   - Last 3 commits in remote history
5. Ask FIRST confirmation: "This will rewrite history. Continue? (y/N)"
6. If N: Abort
7. If Y: Ask SECOND confirmation: "Type 'force' to confirm"
8. If typed correctly: Execute git push --force origin feature/xyz
9. Save reflog backup for rollback
10. Log with CRITICAL severity to audit log
```

### Protected Branch Flow

```
1. User: *safe-git-push develop origin
2. Detect 'develop' is protected
3. Check authorization (require special flag)
4. Show warning: "Protected branch detected"
5. Ask DOUBLE confirmation
6. If approved: Execute push
7. Log with HIGH severity
```

### Rollback Flow (Post-Push Regret)

```
1. Push succeeds
2. User runs: *safe-git-push --rollback
3. System suggests:
   "To undo last push, run:"
   "git reset --hard origin/main"
4. User confirms (Y/n)
5. Execute rollback
6. Log rollback action to audit trail
```

---

## 📋 Configuration

```javascript
// Can be configured in .env or config
{
  SAFE_PUSH_CONFIRM_MODE: 'interactive',    // or 'auto' (for CI/CD)
  SAFE_PUSH_FORCE_LIMIT: 5,                 // Max commits in force-push
  SAFE_PUSH_PROTECTED_BRANCHES: ['main', 'master', 'develop'],
  SAFE_PUSH_AUDIT_LOG_PATH: 'audit/git-push-log.json',
  SAFE_PUSH_TIMEOUT_MS: 30000,              // 30 seconds max
  SAFE_PUSH_DRY_RUN_DEFAULT: false,         // --dry-run flag
}
```

---

## 🧪 Test Scenarios

### Valid Scenarios
```javascript
✅ Normal push: *safe-git-push main origin
✅ Feature push: *safe-git-push feature/xyz origin
✅ Dry-run: *safe-git-push --dry-run main origin
✅ Force with confirmation: *safe-git-push --force feature/xyz origin
✅ Rollback: *safe-git-push --rollback
```

### Error Scenarios
```javascript
❌ No args: *safe-git-push (prompt for interactive mode)
❌ Invalid branch: *safe-git-push invalid-branch origin
❌ Invalid remote: *safe-git-push main invalid-remote
❌ Uncommitted changes: *safe-git-push main origin (reject)
❌ Protected branch: *safe-git-push main origin (double confirm)
❌ Force-push too many commits: *safe-git-push --force (reject > 5)
```

---

## 📝 Audit Log Format

```json
{
  "timestamp": "2026-02-24T10:30:45.123Z",
  "user": "gabriel",
  "command": "safe-git-push",
  "args": {
    "branch": "main",
    "remote": "origin",
    "flags": ["--force"]
  },
  "validation": {
    "branch_clean": true,
    "branch_exists": true,
    "remote_reachable": true,
    "tracking_branch": true,
    "protected_branch": false,
    "force_limit_ok": true
  },
  "execution": {
    "status": "success",
    "duration_ms": 2345,
    "commits_pushed": 3,
    "files_changed": 5,
    "confirmations_required": 0
  },
  "security": {
    "severity": "MEDIUM",
    "requires_audit_review": false,
    "rollback_available": true,
    "reflog_backup": ".git/csa-reflog-backup-20260224T103045"
  }
}
```

---

## 🚀 Implementation Steps

### Step 1: Create Task Definition
- Write `.aios-core/development/tasks/safe-git-push.md`
- Define task interface and CLI options

### Step 2: Implement Core Logic
- Pre-validation functions
- Confirmation flow (interactive prompts)
- Git operations (using git-wrapper.js)

### Step 3: Implement Rollback
- Save reflog state before push
- Implement rollback detection
- Generate rollback instructions

### Step 4: Implement Logging
- Structured JSON logging
- Log rotation mechanism
- API endpoint to query logs

### Step 5: Write Tests
- Mock git operations
- Test all validation scenarios
- Test interactive flows

### Step 6: Create Documentation
- User guide with examples
- Troubleshooting guide
- API documentation

---

## 📊 Metrics

- **Lines of Code**: ~200-250
- **Test Lines**: ~350-450
- **Coverage Target**: 85%+
- **Execution Time**: < 5 seconds (normal), < 10 seconds (force-push with prompts)
- **Log Entry Size**: ~1KB per operation

---

## 🔗 Dependencies

- `src/lib/wrappers/git-wrapper.js` (CSA-1.3)
- `src/lib/validators/command-validator.js` (CSA-1.1)
- Node.js 18+ (child_process, fs)
- readline module (for interactive prompts)

---

## 🔐 Security Checklist

- [ ] No shell injection vulnerabilities
- [ ] Audit log not readable by unauthorized users
- [ ] Reflog backups in .git (protected from world)
- [ ] Environment variables not logged
- [ ] Rollback commands validated before execution

---

## 📈 Error Messages Examples

```
❌ Error: Branch 'develop' has uncommitted changes
   Fix: Run 'git status' and commit or stash changes

❌ Error: Remote 'origin' is not reachable
   Fix: Check network, then 'git fetch origin'

⚠️  Warning: Force-push detected with 8 commits (max: 5)
   Action: Reduce to ≤ 5 commits or contact team lead

✅ Push successful! 3 commits pushed to origin/main
   Rollback: *safe-git-push --rollback
```

---

## 💾 Change Log

| Date | Author | Action | Notes |
|------|--------|--------|-------|
| 2026-02-24 | @pm | Created | Initial story structure |

---

## 🤝 Handoff Notes

- **For @devops**: Lead the design of confirmation flow and validation logic
- **For @dev**: Implement task execution and git-wrapper integration
- **For @qa**: Test all interactive flows and edge cases
- **For @architect**: Review security implications of audit logging

---

**Status**: Draft → Ready
**Next**: Assign to @devops for Phase 2 kickoff (after CSA-1.3 completion)
