# EPIC: Command Safety Architecture for DevOps

**Epic ID**: CSA-001
**Status**: PLANNING
**Created**: 2026-02-24
**Owner**: @pm (Morgan)
**Priority**: HIGH
**Complexity**: MEDIUM

---

## 📋 Overview

Implementar sistema de validação e segurança de comandos na arquitetura AIOS para evitar erros de execução, garantir commands corretos na 1ª tentativa e reduzir risco de falhas operacionais no @devops.

Este epic garante que TODA execução de comando (git, gh cli, npm, bash) passa por camada de validação antes de chegar ao shell, prevenindo:
- ❌ Caminhos com espaços não escapados
- ❌ Variáveis de ambiente undefined
- ❌ Operações destrutivas não consentidas
- ❌ Flags inválidas ou incompatíveis

---

## 🎯 Business Goals

1. **Zero-Error DevOps Execution** → 1ª tentativa sempre sucede
2. **Prevent Destructive Mistakes** → Proteção total para `git push --force`, `rm -rf`, `reset --hard`
3. **Audit Trail for All Commands** → Rastreabilidade de quem rodou o quê e quando
4. **Developer Confidence** → Time @devops roda commands sem medo
5. **Scalable Safety Rules** → Fácil adicionar novas validações

---

## 📊 Success Metrics

| Métrica | Baseline | Target | Owner |
|---------|----------|--------|-------|
| Command validation success rate | 0% | 100% | @devops |
| First-attempt success rate | ~60% | 95%+ | @devops |
| Audit trail coverage | 0% | 100% | @devops |
| Response time (validation) | — | < 100ms | @dev |
| Rules coverage | 0 rules | 30+ rules | @devops |
| Team training completion | 0% | 100% | @pm |

---

## 📅 Timeline

### Phase 1: Foundation (Week 1) — 32 points
- [x] CSA-1.1: Create command-validator.js utility
- [x] CSA-1.2: Create devops-execution-safety.md rules

### Phase 2: Enhancement (Week 2) — 21 points
- [x] CSA-1.3: Create git-wrapper.js helper
- [x] CSA-1.4: Create safe-git-push.md task

### Phase 3: Integration (Week 3) — 16 points
- [ ] Integration with @devops workflows
- [ ] Team training + documentation
- [ ] Monitoring + metrics dashboard

---

## 📝 Stories

### Phase 1: Foundation

#### Story CSA-1.1: Create command-validator.js utility
- **Points**: 13
- **Complexity**: MEDIUM
- **Priority**: HIGH
- **Owner**: @dev
- **Acceptance Criteria**:
  - [ ] Utility exports `validateCommand()` function
  - [ ] Valida estrutura básica (command + args)
  - [ ] Detecta paths com espaços não escapados
  - [ ] Verifica variáveis de ambiente obrigatórias
  - [ ] Normalizador de comandos (lowercase, trim)
  - [ ] Unit tests (90%+ coverage)
  - [ ] Documentação com exemplos
- **Related Files**:
  - `src/lib/validators/command-validator.js` (new)
  - `tests/validators/command-validator.test.js` (new)

#### Story CSA-1.2: Create devops-execution-safety.md rules
- **Points**: 8
- **Complexity**: LOW
- **Priority**: HIGH
- **Owner**: @devops
- **Acceptance Criteria**:
  - [ ] Documento com 30+ regras de validação
  - [ ] Categorizado por tipo: paths, git, gh-cli, npm, bash
  - [ ] Cada regra com: ID, description, valid/invalid examples
  - [ ] Severity levels (CRITICAL, HIGH, MEDIUM, LOW)
  - [ ] Checklist de implementação para cada regra
  - [ ] Rastreabilidade com ADRs
- **Related Files**:
  - `docs/devops/devops-execution-safety.md` (new)
  - `.aios-core/development/tasks/devops-safety-rules.md` (new)

### Phase 2: Enhancement

#### Story CSA-1.3: Create git-wrapper.js helper
- **Points**: 13
- **Complexity**: MEDIUM
- **Priority**: MEDIUM
- **Owner**: @dev
- **Acceptance Criteria**:
  - [ ] Wrapper para git commands (push, pull, commit, etc.)
  - [ ] Detecta paths com espaços e escapa automaticamente
  - [ ] Valida flags git antes de executar
  - [ ] Árvore de decisão: é destructivo? pedir confirmação
  - [ ] Logging de todas as operações (arquivo + console)
  - [ ] Unit tests (90%+ coverage)
  - [ ] Integração com command-validator.js
- **Related Files**:
  - `src/lib/wrappers/git-wrapper.js` (new)
  - `tests/wrappers/git-wrapper.test.js` (new)

#### Story CSA-1.4: Create safe-git-push.md task
- **Points**: 8
- **Complexity**: LOW
- **Priority**: MEDIUM
- **Owner**: @devops
- **Acceptance Criteria**:
  - [ ] Task executável com `*safe-git-push` command
  - [ ] Pré-validações: branch, remote, dirty state
  - [ ] Confirmação dupla para --force
  - [ ] Rolback plan se push falhar
  - [ ] Audit log: quem? quando? para onde?
  - [ ] Documentação completa
  - [ ] Tested com 5+ cenários reais
- **Related Files**:
  - `.aios-core/development/tasks/safe-git-push.md` (new)
  - `src/lib/wrappers/safe-git-push.js` (new)

---

## 👥 Team Assignment

| Agent | Role | Stories | Capacity |
|-------|------|---------|----------|
| @aios-master | Orchestration | CSA-001 governance | 5% |
| @pm | Epic owner | Planning, roadmap | 20% |
| @dev | Implementation | CSA-1.1, CSA-1.3 | 50% |
| @devops | Safety rules | CSA-1.2, CSA-1.4 | 50% |
| @qa | Testing | All stories QA | 30% |
| @architect | Design review | Safety architecture | 10% |

---

## 🏗️ Architecture

### Command Validation Flow

```
User Input
    ↓
[command-validator.js] → Syntax + env check
    ↓ (PASS)
[git-wrapper.js / npm-wrapper / bash-wrapper]
    ↓
[devops-execution-safety.md] → Rule matching
    ↓ (MATCH)
[Confirmation Logic] → If CRITICAL/destructive
    ↓ (CONFIRMED)
[Execute] + Log to audit trail
    ↓
[Success / Failure Handler]
```

### File Structure

```
.aios-core/
├── development/
│   └── tasks/
│       ├── devops-safety-rules.md (reference)
│       └── safe-git-push.md (executable)

src/lib/
├── validators/
│   └── command-validator.js (core validation)
└── wrappers/
    ├── git-wrapper.js (git operations)
    ├── npm-wrapper.js (npm operations)
    └── safe-git-push.js (push protection)

docs/devops/
├── devops-execution-safety.md (comprehensive rules)
└── devops-safety-audit-log.md (logging format)

tests/
├── validators/
│   └── command-validator.test.js
└── wrappers/
    └── git-wrapper.test.js
```

---

## 🔑 Key Design Decisions

### 1. Layered Validation
- **Layer 1**: Syntax + structure (command-validator.js)
- **Layer 2**: Environment + paths (git-wrapper.js)
- **Layer 3**: Business rules (devops-execution-safety.md)
- **Layer 4**: User confirmation (safe-git-push.md)

### 2. Fail-Safe Default
- Se validação falha → BLOCK execution (nunca prossegue com comando inválido)
- Sempre pedir confirmação para operações CRITICAL

### 3. Audit Trail Mandatory
- Toda execução logada: timestamp, user, command, status, output
- Retenção: 90 dias (LGPD compliance)

### 4. Rule Versioning
- Regras em arquivo .md (fácil revisar, version control)
- Cada regra com ID único (CSA-RULE-001, etc.)
- Histórico de mudanças em Change Log

---

## 📋 Validation Rules Summary (30+ Rules)

### Path Safety (5 rules)
- CSA-RULE-001: Espaços em paths devem ser escapados
- CSA-RULE-002: Caminhos absolutos recomendados para operações destrutivas
- CSA-RULE-003: Verificar existência de paths antes de rm/mv
- CSA-RULE-004: Não permitir paths como `/`, `/home`, `/var` em operações rm
- CSA-RULE-005: Validar expansão de wildcards (**/?)

### Git Operations (10 rules)
- CSA-RULE-010: Push requer branch + remote válidos
- CSA-RULE-011: --force push requer dupla confirmação
- CSA-RULE-012: Não permitir push para main/master sem PR
- CSA-RULE-013: Reset --hard requer repo state check
- CSA-RULE-014: Rebase --interactive não suportado (manual only)
- CSA-RULE-015: Merge requer base branch existir
- CSA-RULE-016: Cherry-pick requer commit hash válido
- CSA-RULE-017: Force-push com proteção: max 5 commits
- CSA-RULE-018: Detectar branches "orphan" antes de push
- CSA-RULE-019: Validar assinatura de commits (GPG)

### GitHub CLI (5 rules)
- CSA-RULE-020: PR create requer base branch existir
- CSA-RULE-021: PR merge requer status check passing
- CSA-RULE-022: Release create requer tag format (vX.Y.Z)
- CSA-RULE-023: Detectar conflitos em PR antes de merge
- CSA-RULE-024: Validar GITHUB_TOKEN antes de API calls

### NPM/Yarn (5 rules)
- CSA-RULE-025: Install requer package.json válido
- CSA-RULE-026: Publish requer version bump (semver)
- CSA-RULE-027: Script execution whitelisted only
- CSA-RULE-028: Verificar vulnerabilidades com `npm audit`
- CSA-RULE-029: Cache clear requer confirmação

### Bash/Shell (5 rules)
- CSA-RULE-030: Não permitir command injection (pipes de untrusted sources)
- CSA-RULE-031: Expansão de variáveis: $ deve ser escapado se literal
- CSA-RULE-032: Verificar sintaxe com `bash -n` antes de executar
- CSA-RULE-033: Logging requer output redirection válida
- CSA-RULE-034: Timeout padrão: 5 minutos (evitar hang)

---

## 📈 Success Tracking

### Weekly Checkpoints
- [ ] Week 1: CSA-1.1 e CSA-1.2 DONE
- [ ] Week 2: CSA-1.3 e CSA-1.4 DONE
- [ ] Week 3: Integration + training DONE
- [ ] Week 4: Rollout + monitoring

### Quality Gates
- ✅ Unit tests: 90%+ coverage
- ✅ Code review: 2 approvals minimum
- ✅ QA: All acceptance criteria verified
- ✅ Security: No shell injection vulnerabilities
- ✅ Performance: < 100ms validation latency

---

## 🔗 Related Documents

- **Authority Rules**: `.claude/rules/agent-authority.md`
- **Workflow Execution**: `.claude/rules/workflow-execution.md`
- **Story Lifecycle**: `.claude/rules/story-lifecycle.md`
- **Git Safety Rules**: `docs/devops/devops-execution-safety.md` (TBD)
- **Audit Log Format**: `docs/devops/devops-safety-audit-log.md` (TBD)

---

## 💾 Change Log

| Date | Author | Action | Notes |
|------|--------|--------|-------|
| 2026-02-24 | @pm | Created | Initial epic structure with 4 stories |

---

**Status**: PLANNING → Ready for Phase 1 kickoff
**Next Step**: Validate with @architecture, start Phase 1 (stories CSA-1.1 + CSA-1.2)
