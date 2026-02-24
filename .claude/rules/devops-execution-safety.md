# DevOps Execution Safety Rules (CSA-001)

**Version**: 1.0.0
**Status**: Approved
**Last Updated**: 2026-02-24
**Maintained By**: @devops (Gage), @architect (Aria)

---

## Overview

This document defines **30+ validation rules** that govern all command execution in the AIOS DevOps workflow. Every rule has:
- Unique ID (CSA-RULE-XXX)
- Category (Path, Git, GitHub, NPM, Bash)
- Severity (CRITICAL, HIGH, MEDIUM, LOW)
- Description, valid/invalid examples
- Implementation details and performance impact

**Purpose**: Catch dangerous operations before they execute, enable audit trails, prevent data loss and security breaches.

---

## Rule Categories Overview

| Category | Rules | Severity | Examples |
|----------|-------|----------|----------|
| **Path Safety** | CSA-RULE-001 to 005 | CRITICAL/HIGH | Spaces, traversal, wildcards |
| **Git Operations** | CSA-RULE-010 to 019 | CRITICAL/HIGH | Push, force-push, reset, rebase |
| **GitHub CLI** | CSA-RULE-020 to 024 | HIGH/MEDIUM | PR create/merge, releases |
| **NPM/Package Mgmt** | CSA-RULE-025 to 029 | MEDIUM | Install, publish, audit |
| **Bash/Shell** | CSA-RULE-030 to 034 | CRITICAL/HIGH | Injection, expansion, timeouts |

---

## CATEGORY 1: Path Safety (5 Rules)

### CSA-RULE-001: Spaces in paths must be escaped

**Category**: Path Safety
**Severity**: HIGH
**Type**: Automated (command-validator.js)
**Performance**: < 2ms

**Description**:
Paths containing spaces must be quoted or escaped. Unescaped spaces cause shell word-splitting, breaking command execution.

**Business Impact**:
- Command silently executes wrong operation on wrong file
- Can delete, overwrite, or corrupt files by mistake
- Common source of deployment failures

**Valid Examples**:
```bash
✅ rm '/home/user/my documents/file.txt'
✅ rm '/home/user/my\ documents/file.txt'
✅ mv "$HOME/My Documents" "$HOME/Documents"
```

**Invalid Examples**:
```bash
❌ rm /home/user/my documents/file.txt          # Space unescaped
❌ cp /tmp/file name.txt /dest                  # Space in argument
❌ mkdir /tmp/new folder                        # Space unescaped
```

**Implementation**:
- Implemented in: `command-validator.js` lines 120-135
- Regex check: `/\s/` in path detection
- Suggestion: Auto-escape or quote path
- Manual review required: No

**Notes**:
- Most portable fix: Use single quotes `'path'`
- Backslash escape also works: `path\ with\ spaces`
- Always validate paths before passing to shell

---

### CSA-RULE-002: Absolute paths required for destructive operations

**Category**: Path Safety
**Severity**: HIGH
**Type**: Manual Review
**Performance**: < 3ms

**Description**:
Destructive operations (rm, mv, truncate) MUST use absolute paths. Relative paths can accidentally delete files in wrong directory if current directory changes.

**Business Impact**:
- Accidentally delete files from wrong directory
- Hard to debug since paths are relative
- Common disaster: running `rm -rf *` in wrong dir

**Valid Examples**:
```bash
✅ rm /home/gabriel/temp/file.txt
✅ rm -rf /home/gabriel/tmp-dir
✅ mv /src/old-name /src/new-name
```

**Invalid Examples**:
```bash
❌ rm temp/file.txt                             # Relative path
❌ rm -rf ../backup-old                         # Relative traversal
❌ rm *.log                                     # No path at all, glob
```

**Implementation**:
- Implemented in: `git-wrapper.js` (git operations)
- Also checked in: `safe-git-push.md` pre-validation
- Check: `if (!path.startsWith('/')) { warn }`
- Manual review required: Yes (final confirmation)

**Notes**:
- Especially critical in CI/CD pipelines where pwd can vary
- Consider using `$(pwd)` to ensure absolute path

---

### CSA-RULE-003: Verify path existence before destructive operations

**Category**: Path Safety
**Severity**: MEDIUM
**Type**: Automated (command-validator.js)
**Performance**: < 5ms

**Description**:
Before rm/mv operations, check if path exists. Prevents confusing errors and enables better suggestions.

**Business Impact**:
- Clear error message instead of cryptic shell error
- Can suggest similar filenames if typo detected
- Prevents confusion about what happened

**Valid Examples**:
```bash
✅ [check exists] → rm /tmp/file.txt
✅ [check exists] → mv /src/file /dest/file
✅ [path not found] → Show suggestion: "Did you mean /tmp/file.txt?"
```

**Invalid Examples**:
```bash
❌ rm /tmp/nonexistent-file.txt                 # No pre-check
❌ rm /file\ that\ does\ not\ exist            # Fails silently
```

**Implementation**:
- Check using: `fs.existsSync(path)` (synchronous, safe for validation)
- Provide suggestions for similar files if not found
- Warnings only (don't block execution)
- Manual review required: No

---

### CSA-RULE-004: Blacklist dangerous system paths

**Category**: Path Safety
**Severity**: CRITICAL
**Type**: Automated (command-validator.js)
**Performance**: < 2ms

**Description**:
Absolutely prevent operations on system directories. Block rm/truncate against /, /etc, /sys, /proc, /boot, /root, /dev.

**Business Impact**:
- Catastrophic: `rm -rf /` would destroy entire system
- Medium: `rm -rf /etc` would make system unbootable
- Must be prevented at all costs

**Valid Examples**:
```bash
✅ rm /home/user/temp.txt
✅ rm -rf /var/cache/temp               # /var is safe (not boot-critical)
```

**Invalid Examples**:
```bash
❌ rm -rf /                             # System root
❌ rm -rf /etc                          # Config files
❌ rm -rf /sys                          # System controls
❌ rm -rf /boot                         # Boot loader
❌ rm -rf /proc                         # Process info
```

**Implementation**:
- Implemented in: `command-validator.js` lines 34-43 (DANGEROUS_PATHS)
- Check: Pattern match against whitelist
- Always blocks (error, not warning)
- Manual review required: No (automatic block)

**Notes**:
- Use whitelist approach: only allow /home, /tmp, /var, /opt, user home
- Logs attempt with CRITICAL severity to audit trail

---

### CSA-RULE-005: Validate wildcard expansion

**Category**: Path Safety
**Severity**: MEDIUM
**Type**: Manual Review
**Performance**: < 3ms

**Description**:
Wildcards (*, ?, []) in paths must be quoted or understood. Unquoted wildcards expand at shell level, potentially matching wrong files.

**Business Impact**:
- Deletes more files than intended (e.g., `rm *.log` in source dir)
- Commands fail silently with confusing results
- Hard to debug what happened

**Valid Examples**:
```bash
✅ rm '*.log'                           # Quoted
✅ rm /tmp/"*.txt"                      # Quoted
✅ rm /tmp/*.log                        # In isolation, OK
```

**Invalid Examples**:
```bash
❌ rm *.log                             # Unquoted, may expand unexpectedly
❌ rm /tmp/file-[0-9].txt               # Unquoted bracket expansion
❌ rm backup_?.txt                      # Unquoted ? expansion
```

**Implementation**:
- Implemented in: `command-validator.js` (path validation)
- Check: If path contains *, ?, [ → requires quoting
- Warning only, provides suggestion to quote
- Manual review required: Yes (for destructive ops)

**Notes**:
- Verify what files match before running
- In scripts, use `set -u` and `set -e` for safety
- Consider listing matched files first: `ls` before `rm`

---

## CATEGORY 2: Git Operations (10 Rules)

### CSA-RULE-010: Push requires valid branch and remote

**Category**: Git Operations
**Severity**: HIGH
**Type**: Automated (git-wrapper.js)
**Performance**: < 100ms

**Description**:
Before pushing, verify:
1. Local branch exists and is clean (no uncommitted changes)
2. Remote exists and is reachable
3. Branch tracking is configured

**Business Impact**:
- Typos in branch/remote cause confusing errors
- Uncommitted work can be lost
- Network issues detected early

**Valid Examples**:
```bash
✅ git push origin main                  # Both exist, clean
✅ git push origin feature/xyz           # Feature branch, valid
✅ git push --set-upstream origin main   # Auto-setup tracking
```

**Invalid Examples**:
```bash
❌ git push orgin main                   # Typo in remote
❌ git push origin mian                  # Typo in branch
❌ git push origin dev                   # Branch doesn't exist
❌ git push origin main                  # Uncommitted changes
```

**Implementation**:
- Implemented in: `git-wrapper.js` line 150-180 (push method)
- Also checked in: `safe-git-push.md` step 1-3
- Checks: `git branch`, `git remote -v`, `git status`
- Manual review required: No (automated)

**Notes**:
- Suggestion: Run `git fetch origin` if remote not reachable
- Suggestion: Run `git branch -a` to see all branches

---

### CSA-RULE-011: --force push requires DOUBLE confirmation

**Category**: Git Operations
**Severity**: CRITICAL
**Type**: Manual Review (safe-git-push.md)
**Performance**: Interactive prompt

**Description**:
`--force` and `--force-with-lease` rewrite history and can overwrite team's work. Requires TWO confirmations:
1. First: "History will be rewritten. Are you sure?"
2. Second: Type 'force' to confirm

**Business Impact**:
- Losing commits from remote (can destroy work)
- Team members will lose their changes
- Hard to recover without backups
- One of the most dangerous git operations

**Valid Examples**:
```bash
✅ git push --force origin feature/xyz
   [Confirm 1: Yes/No?] → Yes
   [Confirm 2: Type 'force'] → force
   ✅ Push executed
```

**Invalid Examples**:
```bash
❌ git push --force origin main          # No confirmation
❌ git push -f origin feature/xyz        # Alias, no confirmation
❌ git push --force-with-lease origin    # Still requires confirmation
```

**Implementation**:
- Implemented in: `safe-git-push.md` (Force-Push Flow)
- Also checked in: `git-wrapper.js` push method
- Double confirm: Yes/No → Type 'force'
- Manual review required: YES (mandatory)

**Notes**:
- Log with CRITICAL severity
- Show what will be overwritten (commits, authors, dates)
- Reflog backup created before push for rollback
- Not allowed in CI/CD pipelines (should auto-fail)

---

### CSA-RULE-012: No push to protected branches without special auth

**Category**: Git Operations
**Severity**: CRITICAL
**Type**: Manual Review (safe-git-push.md)
**Performance**: < 50ms

**Description**:
Protected branches (main, master, develop) cannot be directly pushed. Require either:
1. PR review + merge (preferred)
2. Special authorization flag

**Business Impact**:
- Prevents unreviewed code in main branch
- Maintains CI/CD pipeline safety
- Enforces team review process

**Valid Examples**:
```bash
✅ git push origin feature/xyz           # Feature branch, OK
✅ git push origin hotfix/bug            # Hotfix branch, OK
✅ [Via PR review] Merge to main         # Proper flow
```

**Invalid Examples**:
```bash
❌ git push origin main                  # Direct push to main
❌ git push origin master                # Direct push to master
❌ git push origin develop               # Direct push to develop
```

**Implementation**:
- Protected branches: main, master, develop (configurable)
- Implemented in: `safe-git-push.md` (Protected Branch Flow)
- Also checked in: `git-wrapper.js`
- Requires: Double confirmation OR PR
- Manual review required: YES (mandatory)

**Notes**:
- Configure in `.env`: SAFE_PUSH_PROTECTED_BRANCHES
- Special flag for emergencies: `--authorize-main` (logs as CRITICAL)
- CI/CD should enforce branch protection at GitHub level

---

### CSA-RULE-013: Reset --hard requires repo state check

**Category**: Git Operations
**Severity**: CRITICAL
**Type**: Manual Review (git-wrapper.js)
**Performance**: < 100ms

**Description**:
`git reset --hard` is destructive. Before executing:
1. Check for uncommitted changes (could lose work)
2. Show what will be discarded
3. Require explicit confirmation

**Business Impact**:
- Losing uncommitted work permanently
- Data loss if not careful
- Can't easily recover after --hard reset

**Valid Examples**:
```bash
✅ [Check: no uncommitted changes]
   git reset --hard origin/main          # Safe, no local changes
✅ [Commit changes first]
   git commit -m "Save work"
   git reset --hard origin/main
```

**Invalid Examples**:
```bash
❌ git reset --hard HEAD~1               # Uncommitted changes present
❌ git reset --hard --force              # No checking
```

**Implementation**:
- Implemented in: `git-wrapper.js` reset method (line 220-250)
- Check: `git status --porcelain` for changes
- Block if changes found (error message)
- Suggestion: Commit or stash first
- Manual review required: YES (confirmation)

**Notes**:
- Always show target commit (hash + message)
- Warn about implications (commits will be lost)
- Suggest stash if just want to clean: `git stash`

---

### CSA-RULE-014: Rebase --interactive requires manual execution only

**Category**: Git Operations
**Severity**: HIGH
**Type**: Manual Review (git-wrapper.js)
**Performance**: N/A (manual)

**Description**:
`git rebase --interactive` opens an editor for complex history editing. This is inherently manual and cannot be automated safely.

**Business Impact**:
- Easy to rewrite history accidentally
- Merge conflicts require manual resolution
- Complex operation needs human judgment

**Valid Examples**:
```bash
✅ User manually runs: git rebase -i origin/main
   [Opens editor, user makes choices]
   [User resolves conflicts if any]
```

**Invalid Examples**:
```bash
❌ git rebase --interactive origin/main  # Via automation
❌ safe-git-push --rebase-interactive    # Wrapper attempts it
```

**Implementation**:
- Implemented in: `git-wrapper.js` rebase method
- Behavior: Rejects with error message
- Suggestion: Run manually in your terminal
- Manual review required: YES (forced manual)

**Notes**:
- Automation can do non-interactive rebase: `git rebase origin/main`
- Interactive requires editor interaction
- Conflicts require manual resolution

---

### CSA-RULE-015: Merge requires base branch to exist

**Category**: Git Operations
**Severity**: MEDIUM
**Type**: Automated (git-wrapper.js)
**Performance**: < 100ms

**Description**:
Before merging, verify target branch exists and is valid. Prevents typos in branch names.

**Business Impact**:
- Typos cause confusing merge errors
- Early detection saves time
- Clear error messages instead of git's cryptic output

**Valid Examples**:
```bash
✅ git merge origin/main                 # Branch exists
✅ git merge feature/completed           # Feature exists
```

**Invalid Examples**:
```bash
❌ git merge orgin/main                  # Typo in remote
❌ git merge mian                        # Typo in branch
❌ git merge nonexistent-branch          # Branch doesn't exist
```

**Implementation**:
- Implemented in: `git-wrapper.js` merge method (line 280-310)
- Check: `git branch -a | grep <target>`
- Block with error if not found
- Suggestion: Run `git branch -a` to see options
- Manual review required: No

---

### CSA-RULE-016: Cherry-pick requires valid commit hash

**Category**: Git Operations
**Severity**: MEDIUM
**Type**: Automated (git-wrapper.js)
**Performance**: < 100ms

**Description**:
Before cherry-picking, verify commit hash is valid (exists in repository).

**Business Impact**:
- Prevents cherry-picking non-existent commits
- Early error detection instead of failure during cherry-pick
- Clear error messages

**Valid Examples**:
```bash
✅ git cherry-pick abc1234               # Valid hash (exists)
✅ git cherry-pick origin/feature/xyz~2  # Valid ref
```

**Invalid Examples**:
```bash
❌ git cherry-pick abc123                # Hash too short/wrong
❌ git cherry-pick nonexistent           # Not a valid ref
```

**Implementation**:
- Implemented in: `git-wrapper.js` cherryPick method (line 340-360)
- Check: `git rev-parse <hash>` to validate
- Block if invalid
- Manual review required: No

---

### CSA-RULE-017: Force-push max 5 commits (safety limit)

**Category**: Git Operations
**Severity**: HIGH
**Type**: Automated (safe-git-push.md)
**Performance**: < 100ms

**Description**:
Force-push can only rewrite up to 5 commits. Prevents accidental rewriting of large history.

**Business Impact**:
- Limits damage if operator makes mistake
- Encourages careful history management
- Prevents rewriting shared history

**Valid Examples**:
```bash
✅ Force-push 3 new commits              # Within limit
✅ Force-push 5 commits exactly          # At limit
```

**Invalid Examples**:
```bash
❌ Force-push 8 commits                  # Exceeds limit (max 5)
❌ Force-push 50 commits                 # Way over limit
```

**Implementation**:
- Implemented in: `safe-git-push.md` (Force-Push Flow, step 3)
- Also checked in: `git-wrapper.js` push method
- Count: `git log origin/<branch>..<branch> --oneline | wc -l`
- Block if > 5, error message
- Manual review required: Yes (escalation)

**Notes**:
- Configurable in `.env`: SAFE_PUSH_FORCE_LIMIT
- Default: 5 commits
- Contact team lead if legitimately need more

---

### CSA-RULE-018: Detect orphan branches before push

**Category**: Git Operations
**Severity**: MEDIUM
**Type**: Automated (git-wrapper.js)
**Performance**: < 100ms

**Description**:
Orphan branches (disconnected history, created with --orphan) are usually mistakes. Warn before pushing.

**Business Impact**:
- Prevents confusing repository state
- Usually indicates setup error
- Suggests fix (rebase onto main if needed)

**Valid Examples**:
```bash
✅ Regular branch with connected history
✅ Explicitly orphan branch (documented, intentional)
```

**Invalid Examples**:
```bash
❌ Accidentally created orphan branch
   Branch created: git checkout --orphan feature/xyz
   Attempting to push without realizing it's orphan
```

**Implementation**:
- Implemented in: `git-wrapper.js` (pre-push validation)
- Check: `git merge-base --is-ancestor main <branch>`
- Warning (not error) for orphans
- Suggestion: Rebase or fix history
- Manual review required: No (warning only)

---

### CSA-RULE-019: Validate commit signatures (GPG) if required

**Category**: Git Operations
**Severity**: MEDIUM
**Type**: Manual Review (git-wrapper.js)
**Performance**: < 50ms

**Description**:
If your repository requires GPG-signed commits, validate before pushing.

**Business Impact**:
- Ensures commits are verified and traceable
- Required for security-critical repositories
- Prevents pushing unsigned commits to protected branches

**Valid Examples**:
```bash
✅ git commit -S -m "Signed commit"      # GPG signed
✅ Pushing already-signed commits        # All signed
```

**Invalid Examples**:
```bash
❌ git commit -m "Unsigned"              # No signature
❌ Pushing mix of signed and unsigned    # Inconsistent
```

**Implementation**:
- Implemented in: `git-wrapper.js` commit method
- Check: if `commit.gpgSign` enabled in config
- Warning or error depending on policy
- Manual review required: Yes (if enforcement needed)

**Notes**:
- Configure GPG key: `git config --global user.signingKey`
- Enable by default: `git config --global commit.gpgsign true`
- CI/CD can enforce at GitHub level

---

## CATEGORY 3: GitHub CLI (5 Rules)

### CSA-RULE-020: PR create requires base branch exists

**Category**: GitHub CLI
**Severity**: MEDIUM
**Type**: Automated
**Performance**: < 200ms (API call)

**Description**:
Before creating a PR, verify the base branch exists in the repository.

**Business Impact**:
- Prevents PRs against non-existent branches
- Clear error message instead of API failure
- Early validation saves time

**Valid Examples**:
```bash
✅ gh pr create --base main              # main exists
✅ gh pr create --base develop           # develop exists
```

**Invalid Examples**:
```bash
❌ gh pr create --base mian              # Typo, main doesn't exist
❌ gh pr create --base nonexistent       # Branch doesn't exist
```

**Implementation**:
- Implemented in: Command-validator.js for gh commands
- API check: List branches from GitHub
- Manual review required: No

---

### CSA-RULE-021: PR merge requires status checks passing

**Category**: GitHub CLI
**Severity**: HIGH
**Type**: Automated
**Performance**: < 300ms (API)

**Description**:
Cannot merge PR if status checks (CI/CD) are failing. Prevents broken code from reaching main.

**Business Impact**:
- Maintains code quality
- Prevents failing tests in main branch
- Enforces CI/CD pipeline

**Valid Examples**:
```bash
✅ All checks passing → gh pr merge      # OK to merge
```

**Invalid Examples**:
```bash
❌ Status checks failing → gh pr merge   # Blocked
❌ Checks not yet complete              # Blocked
```

**Implementation**:
- Implemented in: git-wrapper.js or GitHub API wrapper
- Check: `gh pr view --json statusCheckRollup`
- Block if any FAIL or PENDING
- Manual review required: No

---

### CSA-RULE-022: Release create requires tag format (vX.Y.Z)

**Category**: GitHub CLI
**Severity**: MEDIUM
**Type**: Automated
**Performance**: < 50ms

**Description**:
Release tags must follow semantic versioning: vX.Y.Z (e.g., v1.2.3, v2.0.0).

**Business Impact**:
- Consistent versioning across releases
- Tools can parse version automatically
- Prevents invalid version formats

**Valid Examples**:
```bash
✅ gh release create v1.0.0
✅ gh release create v2.3.4
✅ gh release create v3.0.0-beta
```

**Invalid Examples**:
```bash
❌ gh release create 1.0.0               # Missing 'v' prefix
❌ gh release create release-2.0         # Wrong format
❌ gh release create my-release          # Not semantic
```

**Implementation**:
- Implemented in: Command-validator.js
- Regex check: `/^v\d+\.\d+\.\d+/`
- Manual review required: No

---

### CSA-RULE-023: Detect conflicts before PR merge

**Category**: GitHub CLI
**Severity**: HIGH
**Type**: Automated
**Performance**: < 200ms (API)

**Description**:
Check if PR has merge conflicts before attempting merge. Cannot merge conflicted PRs.

**Business Impact**:
- Prevents merge failures
- Indicates need for manual conflict resolution
- Clear error message

**Valid Examples**:
```bash
✅ No conflicts → gh pr merge             # OK
```

**Invalid Examples**:
```bash
❌ Has merge conflicts → gh pr merge      # Blocked
   Suggestion: Resolve conflicts manually
```

**Implementation**:
- Implemented in: GitHub API wrapper
- Check: `gh pr view --json mergeStateStatus`
- Block if CONFLICTED
- Manual review required: No

---

### CSA-RULE-024: Validate GITHUB_TOKEN before API calls

**Category**: GitHub CLI
**Severity**: HIGH
**Type**: Automated
**Performance**: < 50ms

**Description**:
Before gh CLI calls, ensure GITHUB_TOKEN is set and valid. Prevents silent API failures.

**Business Impact**:
- Catches auth errors early
- Clear error message vs cryptic API failure
- Prevents partial operations

**Valid Examples**:
```bash
✅ export GITHUB_TOKEN="ghp_xxxx"
   gh pr list                            # Works
```

**Invalid Examples**:
```bash
❌ GITHUB_TOKEN not set                  # Error detected
❌ GITHUB_TOKEN invalid/expired          # Error before API call
```

**Implementation**:
- Implemented in: Command-validator.js
- Check: `checkEnvVars(['GITHUB_TOKEN'])`
- Manual review required: No

---

## CATEGORY 4: NPM/Package Managers (5 Rules)

### CSA-RULE-025: Install requires valid package.json

**Category**: NPM/Package Managers
**Severity**: MEDIUM
**Type**: Automated
**Performance**: < 100ms

**Description**:
Before npm install, verify package.json exists in current directory. Prevents installing to wrong location.

**Business Impact**:
- Prevents installing to unexpected directory
- Common mistake in scripts: npm install from wrong dir
- Early error detection

**Valid Examples**:
```bash
✅ npm install                           # package.json present
```

**Invalid Examples**:
```bash
❌ npm install                           # Wrong directory, no package.json
```

**Implementation**:
- Implemented in: Command-validator.js
- Check: `fs.existsSync('package.json')`
- Manual review required: No

---

### CSA-RULE-026: Publish requires version bump (semver)

**Category**: NPM/Package Managers
**Severity**: HIGH
**Type**: Automated
**Performance**: < 50ms

**Description**:
Before npm publish, ensure version in package.json was bumped (doesn't match published version).

**Business Impact**:
- Prevents publishing same version twice
- Enforces semantic versioning discipline
- Prevents accidental republish of old version

**Valid Examples**:
```bash
✅ Version bumped: 1.0.0 → 1.0.1        # OK to publish
✅ Version bumped: 1.2.0 → 1.3.0        # OK to publish
```

**Invalid Examples**:
```bash
❌ Version not bumped: 1.0.0 → 1.0.0    # Same version
❌ npm publish                           # Already published
```

**Implementation**:
- Implemented in: NPM wrapper or custom script
- Check: Compare local version with npm registry
- Manual review required: No

---

### CSA-RULE-027: Script execution whitelisted only

**Category**: NPM/Package Managers
**Severity**: HIGH
**Type**: Manual Review
**Performance**: < 10ms

**Description**:
npm scripts can be dangerous (arbitrary code execution). Only allow whitelisted scripts.

**Business Impact**:
- Prevents running arbitrary scripts
- Security against injection attacks
- Enforces standard script names

**Valid Examples**:
```bash
✅ npm run build                         # Whitelisted
✅ npm run test                          # Whitelisted
✅ npm run lint                          # Whitelisted
```

**Invalid Examples**:
```bash
❌ npm run arbitrary-script              # Not whitelisted
❌ npm run "arbitrary-$(whoami)"         # Injection attempt
```

**Implementation**:
- Implemented in: Command-validator.js
- Allowed scripts: build, test, lint, dev, start
- Manual review required: Yes (for new scripts)

---

### CSA-RULE-028: Verify vulnerabilities with npm audit

**Category**: NPM/Package Managers
**Severity**: HIGH
**Type**: Automated
**Performance**: < 500ms

**Description**:
Before publishing package, run npm audit to check for known vulnerabilities.

**Business Impact**:
- Prevents publishing packages with known CVEs
- Security responsibility to consumers
- Blocks publication of unsafe packages

**Valid Examples**:
```bash
✅ npm audit                             # No vulnerabilities found
✅ npm audit --fix                       # Vulnerabilities fixed
```

**Invalid Examples**:
```bash
❌ npm audit                             # Critical vulnerabilities found
❌ npm publish                           # Without running audit
```

**Implementation**:
- Implemented in: Safe publish task
- Check: `npm audit --json`
- Block publish if CRITICAL found
- Manual review required: No (auto-block)

---

### CSA-RULE-029: Cache clear requires confirmation

**Category**: NPM/Package Managers
**Severity**: LOW
**Type**: Manual Review
**Performance**: < 50ms

**Description**:
npm cache clean is destructive and affects shared environments. Require confirmation.

**Business Impact**:
- Prevents accidental cache pollution removal
- Affects other team members in shared env
- Usually not necessary

**Valid Examples**:
```bash
✅ [Confirm] npm cache clean --force      # Intentional
```

**Invalid Examples**:
```bash
❌ npm cache clean --force               # Without confirmation
```

**Implementation**:
- Implemented in: Command-validator.js
- Manual review required: Yes (confirmation)

---

## CATEGORY 5: Bash/Shell (5 Rules)

### CSA-RULE-030: Prevent command injection

**Category**: Bash/Shell
**Severity**: CRITICAL
**Type**: Automated (command-validator.js)
**Performance**: < 5ms

**Description**:
Commands must never use shell: true or interpolate user input. Always use execFile with array args.

**Business Impact**:
- Prevents shell injection attacks
- Security critical for production
- One of the most dangerous vulnerabilities

**Valid Examples**:
```javascript
✅ execFile('git', ['push', 'origin', branch])
✅ execFile('npm', ['install', packageName])
```

**Invalid Examples**:
```javascript
❌ exec(`git push origin ${branch}`)      // Command injection possible
❌ shell: true                             // Vulnerable
❌ execSync(`rm -rf ${userInput}`)        // Will be exploited
```

**Implementation**:
- Implemented in: git-wrapper.js, all execution points
- Pattern: Never use exec() or shell: true
- Always use execFile() with array args
- Manual review required: No (enforced)

**Notes**:
- Always pass untrusted data as args, never command
- Validate and sanitize all user input
- Use allowlist for operations

---

### CSA-RULE-031: Variable expansion must be explicit

**Category**: Bash/Shell
**Severity**: HIGH
**Type**: Manual Review
**Performance**: < 5ms

**Description**:
Bash variable expansion ($VAR) can cause unexpected results. Require explicit handling or quoting.

**Business Impact**:
- Prevents unintended variable substitution
- $VAR inside strings can break commands
- Easy to cause bugs with missing vars

**Valid Examples**:
```bash
✅ echo "${VAR}"                        # Explicit, quoted
✅ echo "$VAR"                          # OK if intentional
✅ echo 'literal string'                # No expansion
```

**Invalid Examples**:
```bash
❌ echo $VAR                            # Implicit, unquoted
❌ rm -rf $DIR/*                        # If $DIR empty, deletes /
❌ git commit -m "$BRANCH message"      # May contain special chars
```

**Implementation**:
- Implemented in: Command-validator.js
- Check for: Unquoted $ variables in dangerous contexts
- Warning level (not error)
- Manual review required: Yes (for dangerous ops)

---

### CSA-RULE-032: Syntax check before execution

**Category**: Bash/Shell
**Severity**: HIGH
**Type**: Automated
**Performance**: < 50ms

**Description**:
Before executing bash scripts, check syntax with `bash -n` to catch errors early.

**Business Impact**:
- Prevents syntax errors mid-execution
- Early error detection saves time
- Clear error message instead of runtime failure

**Valid Examples**:
```bash
✅ [Syntax check passes] → execute script
```

**Invalid Examples**:
```bash
❌ Syntax error in script (uncaught)
   → Fails halfway through execution
```

**Implementation**:
- Implemented in: Script execution wrapper
- Check: `bash -n <script>`
- Block if errors found
- Manual review required: No

---

### CSA-RULE-033: Output redirection must be valid

**Category**: Bash/Shell
**Severity**: MEDIUM
**Type**: Automated
**Performance**: < 10ms

**Description**:
File redirection (>, >>, <, etc.) must be valid. Prevents data loss via typos.

**Business Impact**:
- Prevents overwriting important files
- Typos in redirection can destroy data
- Common source of data loss

**Valid Examples**:
```bash
✅ git log > output.txt                 # Appends to file
✅ command 2>&1 | tee output.log        # Redirects stderr to log
```

**Invalid Examples**:
```bash
❌ git log > /etc/important-config      # Wrong destination
❌ command >> /dev/null 2>&1            # OK actually
❌ echo data > /                        # Directory, not file
```

**Implementation**:
- Implemented in: Command-validator.js
- Warn for: Redirection to system paths
- Manual review required: Yes (for destructive)

---

### CSA-RULE-034: Timeout protection (5 min default)

**Category**: Bash/Shell
**Severity**: MEDIUM
**Type**: Automated (git-wrapper.js)
**Performance**: Depends on operation

**Description**:
All commands must have a timeout to prevent infinite loops and hanging processes.

**Business Impact**:
- Prevents hanging CI/CD pipelines
- Kills stalled operations automatically
- Default 5 minutes, configurable

**Valid Examples**:
```bash
✅ timeout 300 git push origin main      # 5 min timeout
✅ timeout 30 npm install               # 30 sec timeout
```

**Invalid Examples**:
```bash
❌ git push origin main                 # No timeout, can hang
❌ npm install                          # Could hang indefinitely
```

**Implementation**:
- Implemented in: git-wrapper.js, all execFile calls
- Timeout: 30 seconds (git), configurable per command
- Error on timeout: "Command timed out"
- Manual review required: No (automatic)

**Notes**:
- Configure per command type: SAFE_PUSH_TIMEOUT_MS
- Default: 30 seconds for git operations
- Increase for slow networks if needed

---

## Severity Matrix

| Severity | Impact | Block? | Action | Example |
|----------|--------|--------|--------|---------|
| **CRITICAL** | Catastrophic (data loss, security) | YES | Block immediately | `rm -rf /`, shell injection |
| **HIGH** | Major disruption (history rewrite, data loss) | YES | Require confirmation | `git push --force` |
| **MEDIUM** | Minor issues (typos, misleading) | NO | Warning + suggestion | Spaces in paths |
| **LOW** | Informational only | NO | Log only | Cache clear |

---

## Automation vs Manual Review Checklist

| Rule | Automated | Manual | Type |
|------|-----------|--------|------|
| CSA-RULE-001 | ✅ | | Path spaces |
| CSA-RULE-002 | | ✅ | Path absolute |
| CSA-RULE-003 | ✅ | | Path exists |
| CSA-RULE-004 | ✅ | | Dangerous paths |
| CSA-RULE-005 | ✅ | | Wildcards |
| CSA-RULE-010 | ✅ | | Git push validation |
| CSA-RULE-011 | | ✅ | Force-push confirmation |
| CSA-RULE-012 | | ✅ | Protected branch |
| CSA-RULE-013 | | ✅ | Reset --hard |
| CSA-RULE-014 | | ✅ | Rebase interactive |
| CSA-RULE-015 | ✅ | | Merge branch exists |
| CSA-RULE-016 | ✅ | | Cherry-pick hash |
| CSA-RULE-017 | ✅ | | Force limit |
| CSA-RULE-018 | ✅ | | Orphan branches |
| CSA-RULE-019 | ✅ | | GPG signatures |
| CSA-RULE-020 | ✅ | | PR base branch |
| CSA-RULE-021 | ✅ | | PR status checks |
| CSA-RULE-022 | ✅ | | Release semver |
| CSA-RULE-023 | ✅ | | Merge conflicts |
| CSA-RULE-024 | ✅ | | GitHub token |
| CSA-RULE-025 | ✅ | | package.json exists |
| CSA-RULE-026 | ✅ | | Version bump |
| CSA-RULE-027 | | ✅ | Whitelisted scripts |
| CSA-RULE-028 | ✅ | | npm audit |
| CSA-RULE-029 | | ✅ | Cache clear |
| CSA-RULE-030 | ✅ | | Command injection |
| CSA-RULE-031 | | ✅ | Variable expansion |
| CSA-RULE-032 | ✅ | | Bash syntax |
| CSA-RULE-033 | | ✅ | Redirection safety |
| CSA-RULE-034 | ✅ | | Timeouts |

---

## Integration Checklist

### Command Validator (CSA-1.1)
- [x] CSA-RULE-001 (spaces in paths)
- [x] CSA-RULE-003 (path exists)
- [x] CSA-RULE-004 (dangerous paths)
- [x] CSA-RULE-005 (wildcards)
- [x] CSA-RULE-030 (command injection prevention)
- [x] CSA-RULE-032 (bash syntax)

### Git Wrapper (CSA-1.3)
- [x] CSA-RULE-010 (push validation)
- [x] CSA-RULE-013 (reset --hard check)
- [x] CSA-RULE-015 (merge branch exists)
- [x] CSA-RULE-016 (cherry-pick hash)
- [x] CSA-RULE-017 (force limit)
- [x] CSA-RULE-018 (orphan detection)
- [x] CSA-RULE-034 (timeouts)

### Safe Git Push (CSA-1.4)
- [x] CSA-RULE-011 (double confirmation)
- [x] CSA-RULE-012 (protected branches)
- [x] CSA-RULE-017 (force limit)

### Manual/Audit
- [ ] CSA-RULE-002 (absolute paths)
- [ ] CSA-RULE-014 (interactive rebase)
- [ ] CSA-RULE-031 (variable expansion)
- [ ] CSA-RULE-033 (redirection)

---

## Quick Reference Card

**Print this 1-page card for your desk:**

| # | Rule | Severity | Example |
|---|------|----------|---------|
| 001 | Spaces → escape | HIGH | `'/path with spaces'` |
| 002 | Absolute paths | HIGH | `rm /tmp/file` not `rm file` |
| 003 | Check exists | MED | `ls file` before `rm` |
| 004 | Block /, /etc, /sys | CRIT | Block all system dirs |
| 005 | Quote wildcards | MED | `'*.txt'` not `*.txt` |
| 010 | Push: validate branch/remote | HIGH | Check before push |
| 011 | Force-push: DOUBLE confirm | CRIT | Yes + Type 'force' |
| 012 | Protected branch (main/master/dev) | CRIT | No direct push |
| 013 | Reset --hard: check state | CRIT | No uncommitted changes |
| 014 | Rebase --interactive: manual only | HIGH | Open editor yourself |
| 015 | Merge: branch exists | MED | Check branch exists |
| 016 | Cherry-pick: hash exists | MED | Validate commit |
| 017 | Force-push: max 5 commits | HIGH | Limit damage |
| 018 | Orphan detection | MED | Warn if disconnected |
| 019 | GPG signatures | MED | If required by repo |
| 020 | PR: base branch exists | MED | Check before create |
| 021 | PR merge: tests passing | HIGH | No merge if failing |
| 022 | Release: semver (vX.Y.Z) | MED | v1.0.0 format |
| 023 | PR: no conflicts | HIGH | Resolve before merge |
| 024 | GitHub token valid | HIGH | Check GITHUB_TOKEN |
| 025 | NPM: package.json exists | MED | In correct directory |
| 026 | Publish: version bumped | HIGH | Don't republish |
| 027 | Scripts: whitelist only | HIGH | build, test, lint, dev |
| 028 | Audit: no CVEs | HIGH | npm audit before publish |
| 029 | Cache clear: confirm | LOW | Requires confirmation |
| 030 | Prevent injection | CRIT | execFile, not exec |
| 031 | Variables: explicit | HIGH | `"${VAR}"` not `$VAR` |
| 032 | Bash syntax check | HIGH | `bash -n script.sh` |
| 033 | Redirection: valid | MED | Don't overwrite system |
| 034 | Timeout: 5 min default | MED | Prevent hangs |

---

## Troubleshooting Guide

### "Command validation failed: Spaces in path"
**Problem**: Path contains unescaped spaces
**Fix**: Quote the path: `'/path with spaces/file.txt'`

### "Error: Dangerous pattern detected: --force"
**Problem**: Using --force without confirmation
**Fix**: Run safe-git-push instead: `*safe-git-push --force`

### "Error: Branch 'main' not found in remote 'origin'"
**Problem**: Typo or branch doesn't exist
**Fix**: Run `git branch -a` to see all branches, check spelling

### "Error: Uncommitted changes detected"
**Problem**: Trying to reset --hard with uncommitted work
**Fix**: Commit or stash first: `git commit -m "WIP"` or `git stash`

### "Error: Missing environment variables: GITHUB_TOKEN"
**Problem**: Not authenticated with GitHub
**Fix**: `export GITHUB_TOKEN="ghp_xxxxx"` or use `gh auth login`

### "Timeout: Command exceeded 30 seconds"
**Problem**: Git operation taking too long
**Fix**: Check network, increase timeout: `SAFE_PUSH_TIMEOUT_MS=60000`

---

## FAQ

**Q: Can I force-push to main?**
A: No, it's protected. Use a feature branch, create PR, get review, then merge.

**Q: What if I have a legitimate reason to bypass a rule?**
A: Use `--authorize-main` flag (logs as CRITICAL). Contact team lead before doing so.

**Q: How do I disable a check?**
A: Don't. Rules exist for safety. Talk to @architect if you disagree.

**Q: Can we add new whitelisted npm scripts?**
A: Yes, update CSA-RULE-027. Changes require @dev approval.

**Q: What if git command hangs?**
A: Should auto-timeout after 30 seconds. Check network. Increase timeout in config if needed.

---

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-24 | Initial release with 30+ rules |

---

## Sign-Off

**Approved by**: @architect (Aria)
**Reviewed by**: @qa (Quincy)
**Maintained by**: @devops (Gage)

**Next Review**: 2026-05-24

---

**Last Updated**: 2026-02-24
**Status**: ACTIVE
