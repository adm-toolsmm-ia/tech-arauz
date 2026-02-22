# S1-2: RLS Policy Framework — Auditar e Documentar Segurança

**Epic:** epic-technical-debt
**Story ID:** S1-2
**Status:** Ready
**Complexity:** 18/25 (COMPLEX)
**Story Points:** 12
**Effort:** 12h
**Owner:** @data-engineer
**Priority:** P0 (security-critical)
**Validated By:** @po (Pax)
**Validation Date:** 2026-02-22
**Validation Score:** 10/10
**Verdict:** GO (pair with @architect recommended)

---

## User Story

Como arquiteto de segurança,
Quero um framework para auditar RLS policies em todas as 11 tabelas,
Para garantir que cada tenant só vê seus próprios dados.

---

## Acceptance Criteria

- [ ] AC-1: Função SQL `audit_rls_policy(table_name)` criada
- [ ] AC-2: Audita todas 11 tabelas (projetos, entregas, cronogramas, etc.)
- [ ] AC-3: Identifica gaps: missing policies, overly permissive policies
- [ ] AC-4: Relatório: `RLS-AUDIT-REPORT.md` documentando findings
- [ ] AC-5: Service role PODE sincronizar Espaider
- [ ] AC-6: Usuários NÃO conseguem acessar dados de outro tenant
- [ ] AC-7: Todas policies seguem padrão (USING + WITH CHECK)
- [ ] AC-8: Multi-tenant isolation verificada em testes

---

## Scope

### IN
- Função audit_rls_policy()
- 11 tabelas audited
- RLS audit report
- Migrations para qualquer gap encontrado

### OUT
- Row-level encryption
- Field-level security
- Dynamic RLS policies

---

## Dependencies

- Projeto live em produção (11 tabelas já existem)

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Encontra gaps críticos | MEDIUM | HIGH | Fix em migration junto com story |
| Performance audit impact | LOW | MEDIUM | Run audit offline, não prod |
| Service role tests fail | MEDIUM | HIGH | Debug com real Espaider credentials |

---

## Definition of Done

- [ ] audit_rls_policy() function criada
- [ ] Todas 11 tabelas auditadas
- [ ] RLS-AUDIT-REPORT.md documentado
- [ ] Zero gaps críticos (1-2 médios aceitáveis)
- [ ] Service role pode sincronizar
- [ ] User isolation testes passando
- [ ] Migrations committed
- [ ] Reviewed por @architect
- [ ] Commit: `feat: add RLS policy framework and audit [S1-2]`

---

## File List

(will be populated by @data-engineer)

---

## Dev Notes

(will be populated by @data-engineer)

---

## Change Log

- **2026-02-22** | Created | Status: Draft
- **2026-02-22** | Validated | Status: Draft → Ready | 10-point checklist passed (10/10), @po approval, pair with @architect for COMPLEX implementation
