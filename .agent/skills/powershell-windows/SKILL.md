---
name: powershell-windows
description: PowerShell Windows patterns. Critical pitfalls, operator syntax, error handling.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# PowerShell Windows Patterns

> Critical patterns and pitfalls for Windows PowerShell.

---

## 1. Operator Syntax Rules

### CRITICAL: Parentheses Required

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `if (Test-Path "a" -or Test-Path "b")` | `if ((Test-Path "a") -or (Test-Path "b"))` |
| `if (Get-Item $x -and $y -eq 5)` | `if ((Get-Item $x) -and ($y -eq 5))` |

**Rule:** Each cmdlet call MUST be in parentheses when using logical operators.

---

## 2. Unix vs PowerShell (CRITICAL on Windows)

**Rule:** On Windows the shell is PowerShell. Do not use Unix commands — they are not available and cause "term not recognized" errors.

### CRITICAL: Never use `&&`

In Bash, `&&` chains commands (run second only if first succeeds). In **Windows PowerShell 5.x** (default on Windows), `&&` is **not supported** and produces a syntax/operator error. Always use `;` to chain commands in this project (see `configs/project.yaml` → `shell_forbidden: "&&"`).

| ❌ Wrong (fails on Windows) | ✅ Correct |
|-----------------------------|-----------|
| `npm run lint && npm run typecheck` | `npm run lint ; npm run typecheck` |
| `cd src ; npm run build && npm run test` | `cd src ; npm run build ; npm run test` |

**Rule:** When suggesting or generating terminal commands for this repo, never use `&&`. Use `;` only.

---

| Unix (Bash) | PowerShell equivalent |
|-------------|------------------------|
| `head -n 50` | `Select-Object -First 50` |
| `tail -n 50` | `Select-Object -Last 50` |
| `cat file` | `Get-Content file` |
| `ls` | `Get-ChildItem` |
| `grep "x"` (command) | `Select-String "x"` or use the Cursor **Grep** tool |
| `cmd1 && cmd2` | `cmd1 ; cmd2` (or run separately) |

Example: to list first 50 items from a pipeline use `... | Select-Object -First 50`, not `... | head -50`.

---

## 3. Unicode/Emoji Restriction

### CRITICAL: No Unicode in Scripts

| Purpose | ❌ Don't Use | ✅ Use |
|---------|-------------|--------|
| Success | ✅ ✓ | [OK] [+] |
| Error | ❌ ✗ 🔴 | [!] [X] |
| Warning | ⚠️ 🟡 | [*] [WARN] |
| Info | ℹ️ 🔵 | [i] [INFO] |
| Progress | ⏳ | [...] |

**Rule:** Use ASCII characters only in PowerShell scripts.

---

## 4. Null Check Patterns

### Always Check Before Access

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `$array.Count -gt 0` | `$array -and $array.Count -gt 0` |
| `$text.Length` | `if ($text) { $text.Length }` |

---

## 5. String Interpolation

### Complex Expressions

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `"Value: $($obj.prop.sub)"` | Store in variable first |

**Pattern:**
```
$value = $obj.prop.sub
Write-Output "Value: $value"
```

---

## 6. Error Handling

### ErrorActionPreference

| Value | Use |
|-------|-----|
| Stop | Development (fail fast) |
| Continue | Production scripts |
| SilentlyContinue | When errors expected |

### Try/Catch Pattern

- Don't return inside try block
- Use finally for cleanup
- Return after try/catch

---

## 7. File Paths

### Windows Path Rules

| Pattern | Use |
|---------|-----|
| Literal path | `C:\Users\User\file.txt` |
| Variable path | `Join-Path $env:USERPROFILE "file.txt"` |
| Relative | `Join-Path $ScriptDir "data"` |

**Rule:** Use Join-Path for cross-platform safety.

---

## 8. Array Operations

### Correct Patterns

| Operation | Syntax |
|-----------|--------|
| Empty array | `$array = @()` |
| Add item | `$array += $item` |
| ArrayList add | `$list.Add($item) | Out-Null` |

---

## 9. JSON Operations

### CRITICAL: Depth Parameter

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `ConvertTo-Json` | `ConvertTo-Json -Depth 10` |

**Rule:** Always specify `-Depth` for nested objects.

### File Operations

| Operation | Pattern |
|-----------|---------|
| Read | `Get-Content "file.json" -Raw | ConvertFrom-Json` |
| Write | `$data | ConvertTo-Json -Depth 10 | Out-File "file.json" -Encoding UTF8` |

---

## 10. Common Errors

| Error Message | Cause | Fix |
|---------------|-------|-----|
| "parameter 'or'" | Missing parentheses | Wrap cmdlets in () |
| "Unexpected token" | Unicode character | Use ASCII only |
| "Cannot find property" | Null object | Check null first |
| "Cannot convert" | Type mismatch | Use .ToString() |

---

## 11. Script Template

```powershell
# Strict mode
Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"

# Paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Main
try {
    # Logic here
    Write-Output "[OK] Done"
    exit 0
}
catch {
    Write-Warning "Error: $_"
    exit 1
}
```

---

> **Remember:** PowerShell has unique syntax rules. Parentheses, ASCII-only, and null checks are non-negotiable.
