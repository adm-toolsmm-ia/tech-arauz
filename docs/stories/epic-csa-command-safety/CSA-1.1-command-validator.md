# Story CSA-1.1: Create command-validator.js utility

**ID**: CSA-1.1
**Epic**: CSA-001 (Command Safety Architecture for DevOps)
**Status**: Draft
**Priority**: HIGH
**Complexity**: MEDIUM
**Points**: 13
**Owner**: @dev (Dex)

---

## 📖 User Story

As a @dev, I want a reusable `command-validator.js` utility that validates and normalizes all commands before they are passed to the shell, so that syntactic errors, missing environment variables, and path problems are caught early and consistently across the entire AIOS system.

---

## ✅ Acceptance Criteria

### Core Functionality
- [ ] Utility exports `validateCommand(command, args, options)` function
- [ ] Validates command structure: command must be string, args must be array
- [ ] Returns object: `{ isValid: boolean, errors: [], warnings: [], normalizedCommand: string, normalizedArgs: string[] }`
- [ ] Detects paths with unescaped spaces and suggests corrections
- [ ] Verifies required environment variables are defined
- [ ] Normalizes commands: lowercase, trim whitespace, deduplicate spaces
- [ ] Detects null/undefined arguments and flags them

### Path Safety
- [ ] Function `validatePath(path)` detects spaces in paths
- [ ] Suggests escaping: `path with spaces` → `'path with spaces'` or `path\ with\ spaces`
- [ ] Validates paths don't use dangerous patterns: `~/*`, `../../../`, `/etc/passwd`
- [ ] Checks for relative paths in destructive operations (rm, mv, etc.)

### Environment Variables
- [ ] Function `checkEnvVars(envVarNames)` validates all required vars exist
- [ ] Returns array of missing vars: `{ missing: [], defined: [] }`
- [ ] Handles defaults: if var not defined but has default, use default

### Command Normalization
- [ ] Converts command to lowercase (for consistency)
- [ ] Removes leading/trailing whitespace
- [ ] Removes duplicate spaces between args
- [ ] Normalizes quotes: `"arg"` and `'arg'` both valid

### Integration Points
- [ ] Works with git commands (git, git-push, git-commit, etc.)
- [ ] Works with GitHub CLI (gh, gh pr, gh issue, etc.)
- [ ] Works with npm/yarn commands
- [ ] Works with bash/shell commands
- [ ] Extensible: easy to add new command types

### Testing
- [ ] Unit tests file: `tests/validators/command-validator.test.js`
- [ ] 90%+ code coverage
- [ ] Tests for happy path (valid commands)
- [ ] Tests for error cases (invalid structure, missing vars, bad paths)
- [ ] Tests for normalization (whitespace, quotes, case)
- [ ] Performance test: validation < 10ms per command

### Documentation
- [ ] JSDoc comments on all functions
- [ ] README.md in `src/lib/validators/` with usage examples
- [ ] Examples showing: valid commands, invalid commands, error handling
- [ ] Integration guide: how to use in other modules

---

## 📝 Description

### Problem
Currently, commands are executed directly without validation, leading to:
- ❌ Paths with spaces causing execution failures
- ❌ Missing environment variables silently failing
- ❌ Inconsistent command formatting
- ❌ No audit trail of command attempts

### Solution
Create a single-purpose validation utility that:
1. Checks command syntax and structure
2. Validates all paths are safe and properly escaped
3. Verifies required environment variables exist
4. Normalizes command format for consistency
5. Returns detailed errors/warnings for debugging

### Design
```javascript
// Example usage
const validator = require('@/lib/validators/command-validator');

const result = validator.validateCommand('git', ['push', 'origin', 'main'], {
  requiredEnvVars: ['GIT_AUTHOR_EMAIL'],
  dangerousPatterns: ['--force'],
});

if (!result.isValid) {
  console.error('Command validation failed:', result.errors);
  process.exit(1);
}

// Safe to execute
exec(result.normalizedCommand, result.normalizedArgs);
```

---

## 🎯 Scope

### IN
- ✅ Basic command structure validation
- ✅ Path detection and escaping suggestions
- ✅ Environment variable checking
- ✅ Command normalization
- ✅ Unit tests (90%+ coverage)
- ✅ JSDoc documentation

### OUT
- ❌ Actual command execution (that's the wrapper's job)
- ❌ Interactive prompts (validation only)
- ❌ Logging to files (validation only)
- ❌ Rate limiting or queuing

---

## 📋 Definition of Done

- [ ] Code written and tested
- [ ] 90%+ unit test coverage
- [ ] JSDoc documented
- [ ] README with examples created
- [ ] PR reviewed by @qa
- [ ] No linting errors: `npm run lint`
- [ ] No TypeScript errors: `npm run typecheck`
- [ ] Merged to main branch
- [ ] Documented in `.aios-core/development/tasks/`

---

## 📂 File List

| File | Status | Purpose |
|------|--------|---------|
| `src/lib/validators/command-validator.js` | NEW | Core validation logic |
| `src/lib/validators/README.md` | NEW | Usage documentation |
| `tests/validators/command-validator.test.js` | NEW | Unit tests |

---

## 🔑 Key Functions

### `validateCommand(command, args, options)`
**Signature:**
```javascript
validateCommand(command: string, args: string[], options: ValidationOptions): ValidationResult
```

**Returns:**
```javascript
{
  isValid: boolean,
  errors: string[],        // Critical issues
  warnings: string[],       // Non-critical issues
  normalizedCommand: string,
  normalizedArgs: string[],
  suggestions: string[]     // How to fix
}
```

**Options:**
```javascript
{
  requiredEnvVars: string[],     // ['GIT_AUTHOR_EMAIL', 'GITHUB_TOKEN']
  dangerousPatterns: string[],   // ['--force', '--hard', 'rm -rf']
  allowedCommands: string[],     // Whitelist (optional)
  checkPaths: boolean,           // Default: true
  normalizePaths: boolean,       // Default: true
}
```

### `validatePath(path)`
Checks if path is safe to use. Returns `{ isSafe: boolean, issues: [], suggestion: string }`

### `checkEnvVars(envVarNames, defaults?)`
Verifies environment variables. Returns `{ missing: [], defined: {} }`

### `normalizeCommand(command)`
Returns normalized command string (lowercase, trimmed, deduplicated spaces).

---

## 🧪 Test Scenarios

### Valid Commands
```javascript
✅ validateCommand('git', ['push', 'origin', 'main'])
✅ validateCommand('gh', ['pr', 'create', '--title', 'Fix bug'])
✅ validateCommand('npm', ['install', '--save-dev', 'jest'])
```

### Invalid Commands
```javascript
❌ validateCommand('git', null)                    // args not array
❌ validateCommand(undefined, ['push'])             // command not string
❌ validateCommand('git push', ['origin'])          // command has spaces
```

### Path Safety
```javascript
✅ validateCommand('rm', ['/tmp/file.txt'])
⚠️  validateCommand('rm', ['/path with spaces/file.txt'])  // Warning: needs escaping
❌ validateCommand('rm', ['-rf', '/'])              // Error: dangerous pattern
```

### Environment Variables
```javascript
✅ validateCommand('gh', ['pr', 'create'], {
     requiredEnvVars: ['GITHUB_TOKEN']
   })  // If GITHUB_TOKEN exists

❌ validateCommand('gh', ['pr', 'create'], {
     requiredEnvVars: ['MISSING_VAR']
   })  // Error: MISSING_VAR not defined
```

---

## 🚀 Implementation Steps

### Step 1: Create Directory Structure
```bash
mkdir -p src/lib/validators
mkdir -p tests/validators
```

### Step 2: Write Core Validator
- Implement `validateCommand()` function
- Implement `validatePath()` helper
- Implement `checkEnvVars()` helper
- Implement `normalizeCommand()` helper

### Step 3: Add JSDoc Documentation
- Document all functions with JSDoc
- Include example usage blocks
- Type hints for parameters/returns

### Step 4: Write Unit Tests
- Happy path tests
- Error case tests
- Path validation tests
- Environment variable tests
- Performance tests

### Step 5: Create README
- Usage examples
- API reference
- Integration instructions
- Troubleshooting

---

## 📊 Metrics

- **Lines of Code**: ~150-200
- **Test Lines**: ~400-500
- **Coverage Target**: 90%+
- **Performance Target**: < 10ms per validation
- **Documentation**: Complete JSDoc + README

---

## 🔗 Dependencies

- Node.js 18+ (built-in modules only)
- Jest (for testing)
- No external dependencies (keep it lightweight)

---

## 💾 Change Log

| Date | Author | Action | Notes |
|------|--------|--------|-------|
| 2026-02-24 | @pm | Created | Initial story structure |

---

## 🤝 Handoff Notes

- **For @dev**: Start with happy path tests, then implement validators
- **For @qa**: Focus on security tests (path injection, env injection)
- **For @architect**: Review design for extensibility (adding new command types)

---

**Status**: Draft → Ready
**Next**: Assign to @dev for Phase 1 kickoff
