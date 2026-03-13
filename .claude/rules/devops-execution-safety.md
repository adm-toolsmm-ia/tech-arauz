---
paths:
  - ".aiox-core/**"
  - "bin/**"
  - ".github/**"
---

# DevOps Execution Safety (CSA-001)

**Maintained by:** @devops (Gage), @architect (Aria)

**Full 34 rules:** [docs/stories/epic-csa-command-safety/CSA-001-rules-reference.md](docs/stories/epic-csa-command-safety/CSA-001-rules-reference.md)

---

## Purpose

Validation rules for command execution in the AIOX DevOps workflow. Catch dangerous operations before execution; enable audit trails; prevent data loss and security breaches.

---

## Rule Categories Summary

| Category | Rules | Severity | Examples |
|----------|-------|----------|----------|
| Path Safety | 001–005 | CRITICAL/HIGH | Spaces, traversal, wildcards |
| Git Operations | 010–019 | CRITICAL/HIGH | Push, force-push, reset |
| GitHub CLI | 020–024 | HIGH/MEDIUM | PR create/merge, releases |
| NPM/Package | 025–029 | MEDIUM | Install, publish, audit |
| Bash/Shell | 030–034 | CRITICAL/HIGH | Injection, expansion, timeouts |

---

## Key Principles

**Path safety:** Quote/escape spaces; use absolute paths for destructive ops; block /, /etc, /sys, /boot, /proc, /root, /dev; validate wildcards.

**Git:** Validate branch/remote before push. Force-push: double confirmation (Yes + type 'force'). Protected branches (main, master, develop): no direct push; use PR. Reset --hard: no uncommitted changes. Rebase --interactive: manual only. Force-push max 5 commits.

**GitHub:** PR base branch exists; merge only with status checks passing; releases semver (vX.Y.Z); no merge with conflicts; token valid.

**NPM:** package.json present; version bump before publish; scripts whitelist only (build, test, lint, dev, start); npm audit before publish; cache clear requires confirmation.

**Shell:** Prevent injection (execFile, not exec); explicit variable expansion; bash -n for syntax; timeouts (e.g. 5 min default).

---

## Severity Handling

| Severity | Action |
|----------|--------|
| CRITICAL | Block execution |
| HIGH | Warn; require confirmation for destructive ops |
| MEDIUM | Warn or suggest |
| LOW | Note only |

---

## Where Implemented

- **command-validator.js:** Path safety (001, 003–005), injection (030), bash syntax (032)
- **git-wrapper.js:** Push validation (010), reset --hard check (013), merge (015), cherry-pick (016), force limit (017), orphan (018), timeouts (034)
- **safe-git-push flow:** Force-push double confirm (011), protected branches (012), force limit (017)
- **Manual/audit:** Absolute paths (002), interactive rebase (014), variable expansion (031), redirection (033)

---

## Authority

- **@devops:** Operates push, PR, releases; enforces these rules
- **@architect:** Approves rule changes; "Talk to @architect if you disagree"
- **@dev:** Approves changes to npm script whitelist (CSA-RULE-027)
