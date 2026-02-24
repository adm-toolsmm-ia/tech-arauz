# Story CSA-1.3: Create git-wrapper.js helper

**ID**: CSA-1.3
**Epic**: CSA-001 (Command Safety Architecture for DevOps)
**Status**: Draft
**Priority**: MEDIUM
**Complexity**: MEDIUM
**Points**: 13
**Owner**: @dev (Dex)

---

## 📖 User Story

As a @dev, I want a `git-wrapper.js` helper that safely wraps all git operations and handles edge cases like unescaped paths, destructive commands, and validation errors, so that @devops can execute git commands with confidence and get clear error messages when something goes wrong.

---

## ✅ Acceptance Criteria

### Core Wrapper Functionality
- [ ] Wrapper exports `GitWrapper` class with methods: push, pull, commit, merge, reset, rebase, cherry-pick
- [ ] Every method validates inputs using command-validator.js before execution
- [ ] Every method logs the operation: timestamp, command, args, status, output
- [ ] Methods return object: `{ success: boolean, message: string, output: string, error?: string }`
- [ ] Handles both success and failure gracefully (never throws, always returns status)

### Path Handling
- [ ] Automatically detects unescaped spaces in paths
- [ ] Auto-escapes paths or suggests fix to user
- [ ] Validates that referenced branches exist before operations
- [ ] Detects orphan branches and warns before push

### Destructive Operation Protection
- [ ] Detects dangerous flags: --force, --hard, --force-with-lease
- [ ] Requires explicit confirmation for CRITICAL operations
- [ ] Implements maximum force-push limit (default: 5 commits)
- [ ] Validates repo state before reset/rebase (no uncommitted changes)
- [ ] Interactive confirmation mode (prompt user before executing)

### Git Command Implementations
- [ ] **push**: Validate branch + remote exist, max commits check, confirmation for --force
- [ ] **pull**: Standard validation, no destructive protection needed
- [ ] **commit**: Validate message, check for GPG signature option
- [ ] **merge**: Validate base branch exists, detect conflicts
- [ ] **reset**: Validate target, prevent --hard on uncommitted changes
- [ ] **rebase**: Warn about --interactive (manual only recommended), validate target
- [ ] **cherry-pick**: Validate commit hash, check for conflicts

### Error Handling
- [ ] Catches command execution errors and returns structured error response
- [ ] Provides helpful error messages (not just exit code)
- [ ] Suggests fixes when possible (e.g., "Did you mean origin/main?")
- [ ] Handles null/undefined args gracefully
- [ ] Timeout protection (max 30 seconds per git command)

### Logging
- [ ] Logs ALL operations to `logs/git-operations.log`
- [ ] Log format: timestamp, user, command, args, status, duration, output
- [ ] Handles large outputs gracefully (truncate if > 1MB)
- [ ] Rotation: archive logs when > 10MB

### Integration
- [ ] Uses command-validator.js for validation
- [ ] Can be used standalone or with safe-git-push.md task
- [ ] Exports methods for easy chaining (if desired)
- [ ] Compatible with Node.js 18+

### Testing
- [ ] Unit tests: `tests/wrappers/git-wrapper.test.js`
- [ ] 90%+ code coverage
- [ ] Mock git commands (don't actually modify repos)
- [ ] Tests for all 7 git methods
- [ ] Tests for error cases and edge cases
- [ ] Performance tests: each command < 100ms

### Documentation
- [ ] JSDoc on all methods
- [ ] README.md in `src/lib/wrappers/` with usage examples
- [ ] Examples: push with confirmation, merge with conflict handling
- [ ] Integration guide with command-validator.js

---

## 📝 Description

### Problem
Git commands are powerful and dangerous. Currently:
- ❌ No validation before git push/reset/rebase
- ❌ Unescaped paths cause silent failures
- ❌ --force operations happen without confirmation
- ❌ No audit trail of who ran what and when
- ❌ Error messages are cryptic

### Solution
Create a git-wrapper.js helper that:
1. Validates all inputs before executing git commands
2. Automatically detects and fixes unescaped paths
3. Requires confirmation for dangerous operations
4. Logs all operations for audit trail
5. Returns clear, structured error messages

### Design Philosophy
- **Safety First**: Validation before execution, never skip safety checks
- **No Silent Failures**: Always return status (success/failure)
- **Clear Errors**: User-friendly error messages with suggestions
- **Audit Trail**: Every operation logged with timestamp + user
- **Zero Dependencies**: Uses command-validator.js only (no external libs)

---

## 🎯 Scope

### IN
- ✅ Git wrapper for 7 core operations
- ✅ Input validation using command-validator.js
- ✅ Destructive operation protection
- ✅ Logging to file
- ✅ Error handling and suggestions
- ✅ Unit tests (90%+ coverage)
- ✅ JSDoc documentation

### OUT
- ❌ Interactive UI/CLI prompts (safe-git-push.md handles that)
- ❌ GitHub API operations (that's gh-wrapper, not git-wrapper)
- ❌ Merge conflict resolution (user's responsibility)
- ❌ Git configuration management

---

## 📋 Definition of Done

- [ ] Code written and tested
- [ ] 90%+ unit test coverage
- [ ] JSDoc documented
- [ ] README with examples created
- [ ] PR reviewed by @qa
- [ ] No linting errors
- [ ] No TypeScript errors
- [ ] Merged to main branch
- [ ] Documented in `.aios-core/development/tasks/`

---

## 📂 File List

| File | Status | Purpose |
|------|--------|---------|
| `src/lib/wrappers/git-wrapper.js` | NEW | Core wrapper logic |
| `src/lib/wrappers/README.md` | NEW | Usage documentation |
| `tests/wrappers/git-wrapper.test.js` | NEW | Unit tests |
| `logs/.gitkeep` | NEW | Log directory |

---

## 🔑 Core Methods

### `async push(branch, remote, options)`
Safely push changes to remote repository.

**Parameters:**
```javascript
{
  branch: string,              // Branch to push (e.g., 'main')
  remote: string,              // Remote name (e.g., 'origin')
  options: {
    force: boolean,            // Default: false
    forceWithLease: boolean,    // Default: false
    setUpstream: boolean,       // Default: false
    confirm: boolean,           // Default: true (require confirmation for --force)
  }
}
```

**Returns:**
```javascript
{
  success: boolean,
  message: string,
  output: string,
  error?: string,
  suggestions?: string[]
}
```

**Example:**
```javascript
const wrapper = new GitWrapper();
const result = await wrapper.push('feature/xyz', 'origin', {
  confirm: true
});

if (!result.success) {
  console.error('Push failed:', result.message);
  console.log('Suggestions:', result.suggestions);
}
```

### `async pull(branch, remote, options)`
Safely pull changes from remote repository.

**Parameters:**
```javascript
{
  branch: string,
  remote: string,
  options: {
    rebase: boolean,           // Default: false (use rebase instead of merge)
    autostash: boolean,        // Default: true
  }
}
```

### `async commit(message, options)`
Create a new commit with validation.

**Parameters:**
```javascript
{
  message: string,
  options: {
    all: boolean,              // Stage all changes (default: false)
    signoff: boolean,          // Add sign-off (default: false)
    gpg: boolean,              // Sign with GPG (default: false)
  }
}
```

### `async merge(branch, options)`
Merge a branch into current branch.

**Parameters:**
```javascript
{
  branch: string,
  options: {
    noFF: boolean,             // No fast-forward (default: true)
    squash: boolean,           // Squash commits (default: false)
  }
}
```

### `async reset(target, options)`
Reset to a specific commit (DESTRUCTIVE).

**Parameters:**
```javascript
{
  target: string,              // Commit hash or branch
  options: {
    hard: boolean,             // Hard reset (default: false)
    confirm: boolean,           // Require confirmation (default: true)
  }
}
```

### `async rebase(target, options)`
Rebase current branch (DANGEROUS).

**Parameters:**
```javascript
{
  target: string,
  options: {
    interactive: boolean,      // Interactive rebase (default: false, manual only)
    autosquash: boolean,       // Auto-squash (default: false)
  }
}
```

### `async cherryPick(commitHash)`
Cherry-pick a specific commit.

**Parameters:**
```javascript
{
  commitHash: string            // Commit SHA to cherry-pick
}
```

---

## 🧪 Test Scenarios

### Happy Path
```javascript
✅ push('main', 'origin') → success
✅ pull('main', 'origin') → success
✅ commit('feat: add feature') → success
✅ merge('develop') → success
```

### Destructive Operations
```javascript
⚠️  push('main', 'origin', { force: true }) → Requires confirmation
⚠️  reset('HEAD~1', { hard: true }) → Requires confirmation
⚠️  rebase('develop', { interactive: true }) → Warning (manual only)
```

### Error Cases
```javascript
❌ push(null, 'origin') → Error: branch required
❌ push('main', 'invalid-remote') → Error: remote not found
❌ merge('non-existent-branch') → Error: branch not found
❌ reset('HEAD~1', { hard: true }) → Error: uncommitted changes exist
```

### Path Issues
```javascript
⚠️  Commit with path: '/path with spaces/file.txt' → Auto-escape or warn
```

---

## 🚀 Implementation Steps

### Step 1: Create Directory Structure
```bash
mkdir -p src/lib/wrappers
mkdir -p tests/wrappers
mkdir -p logs
```

### Step 2: Implement GitWrapper Class
- Constructor with configuration (repo path, confirm mode, etc.)
- Implement all 7 methods
- Add internal helper methods (_validate, _execute, _log)

### Step 3: Implement Validation
- Use command-validator.js for basic checks
- Add git-specific validation (branch exists, remote exists)
- Implement destructive operation detection

### Step 4: Implement Logging
- Create logs/git-operations.log
- Implement log rotation (archive when > 10MB)
- Format: JSON for easy parsing

### Step 5: Write Unit Tests
- Mock git command execution
- Test all 7 methods (happy + error paths)
- Test validation logic
- Test logging

### Step 6: Create Documentation
- JSDoc on all methods
- README with usage examples
- Integration guide with command-validator.js

---

## 📊 Metrics

- **Lines of Code**: ~250-350
- **Test Lines**: ~600-800
- **Coverage Target**: 90%+
- **Performance Target**: < 100ms per operation (mocked)
- **Log File Size**: Max 10MB before rotation

---

## 🔗 Dependencies

- Node.js 18+
- `src/lib/validators/command-validator.js` (CSA-1.1)
- Child process execution (`child_process.execFile`)
- File system operations (`fs`, `fs/promises`)

---

## 🔐 Security Considerations

### Command Injection Prevention
- Never use shell: true (always use execFile, not exec)
- Validate all args before passing to execFile
- Use array args (not string interpolation)

### Path Traversal Prevention
- Validate paths don't go outside repo
- Prevent `../../../etc/passwd` style attacks
- Check for absolute paths in args

### Privilege Escalation
- Never run git commands with sudo
- Don't execute arbitrary commands
- Whitelist git subcommands only

---

## 📈 Error Messages Examples

```
❌ Error: Branch 'main' not found in remote 'origin'
   Suggestion: Run 'git fetch origin' first, then try again

❌ Error: Uncommitted changes detected
   Suggestion: Commit or stash changes before reset --hard

❌ Error: Force-push limit exceeded (max 5 commits)
   Suggestion: Use 'git push --force-with-lease' if confident

⚠️  Warning: No upstream branch set for 'feature/xyz'
   Suggestion: Use 'git push --set-upstream origin feature/xyz'
```

---

## 💾 Change Log

| Date | Author | Action | Notes |
|------|--------|--------|-------|
| 2026-02-24 | @pm | Created | Initial story structure |

---

## 🤝 Handoff Notes

- **For @dev**: Start with basic push/pull, then add destructive operations
- **For @qa**: Focus on edge cases and error scenarios
- **For @architect**: Review for security implications

---

**Status**: Draft → Ready
**Next**: Assign to @dev for Phase 2 kickoff
