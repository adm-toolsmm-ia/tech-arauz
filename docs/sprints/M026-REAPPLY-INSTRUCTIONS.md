# M026 Reapply Instructions (FIXED)

**Data:** 2026-02-22
**Issue:** Tabela `tenants` com status CRITICAL (false positive)
**Causa Raiz:** Lógica de audit exigia `tenant_id` para TODAS as tabelas
**Solução:** Exempler tabelas sistema (`tenants`, `profiles`) da verificação de `tenant_id`
**Commit:** `e09cb22`

---

## 📋 Instruções para Reapplicar

### Opção 1: Supabase Dashboard (Recomendado)

#### Passo 1: Copiar o arquivo SQL

Arquivo pronto para copiar: **[REAPPLY-M026-FIXED.sql](./REAPPLY-M026-FIXED.sql)**

#### Passo 2: Abrir Supabase Dashboard

1. Acesse: https://app.supabase.com/
2. Select projeto: **tech-arauz**
3. Vá para: **SQL Editor**
4. Clique em: **New Query**

#### Passo 3: Executar SQL

1. Copie TODO o conteúdo de `REAPPLY-M026-FIXED.sql`
2. Cole na janela do SQL Editor
3. Clique em **Run** (ou Cmd+Enter)

**Resultado esperado:**
```
✅ Successfully executed
(0 rows affected)
```

#### Passo 4: Verificar resultado

Após executar, deve ver:
- `rls_audit_summary` com 12 linhas
- `tenants` mostrando `✅ PASS` (não mais CRITICAL)
- `profiles` mostrando `✅ PASS` (não mais CRITICAL)
- Todas as outras tabelas mostrando `✅ PASS`

---

## 🔍 O que foi corrigido

### Antes (Errado)
```sql
CASE
    WHEN rls_enabled AND total_policies > 0 AND tenant_isolation_found THEN '✅ PASS'
    WHEN rls_enabled AND total_policies > 0 AND NOT tenant_isolation_found AND has_tenant_id_column THEN '⚠️  WARN (no isolation)'
    WHEN rls_enabled AND total_policies > 0 AND NOT tenant_isolation_found AND NOT has_tenant_id_column THEN '🔴 CRITICAL (missing tenant_id)'
    -- ❌ Exigia tenant_id para TODAS as tabelas
END
```

### Depois (Correto)
```sql
CASE
    -- System tables (tenants, profiles) - only need RLS + policies, no tenant_id required
    WHEN table_name IN ('tenants', 'profiles') AND rls_enabled AND total_policies > 0 THEN '✅ PASS'
    WHEN table_name IN ('tenants', 'profiles') AND NOT rls_enabled THEN '🔴 CRITICAL (RLS disabled)'
    WHEN table_name IN ('tenants', 'profiles') AND total_policies = 0 THEN '🔴 CRITICAL (no policies)'

    -- Data tables (all others) - need RLS + policies + tenant_isolation
    WHEN rls_enabled AND total_policies > 0 AND tenant_isolation_found THEN '✅ PASS'
    -- ... resto igual
END
```

---

## ✅ Checklist após execução

- [ ] SQL executado sem erros no Supabase Dashboard
- [ ] `SELECT * FROM public.rls_audit_summary;` retorna 12 linhas
- [ ] `tenants` com status `✅ PASS` (antes era 🔴 CRITICAL)
- [ ] `profiles` com status `✅ PASS` (antes era 🔴 CRITICAL)
- [ ] Todas as outras 10 tabelas com status `✅ PASS`
- [ ] Nenhuma tabela com status `🔴 CRITICAL` ou `⚠️  WARN`

---

## 🚀 Próximos passos

Após confirmar sucesso da M026:

1. **Executar smoke tests** (Sprint 1):
   - Seguir: `docs/sprints/SMOKE-TESTS-S1-4.md`
   - Testar: Sync Espaider, LogViewer, ProjectCockpit, Dark Mode

2. **Deploy para Vercel**:
   - Staging: `git push origin main` → Deploy automático
   - Production: Após aprovação de stakeholder

3. **Começar Sprint 2**:
   - Stories: S2-1 (Notifications), S2-2 (UX), S2-3 (Performance)
   - Planning: `docs/sprints/SPRINT-2-PLANNING.md`

---

## 🆘 Se der erro

| Erro | Solução |
|------|---------|
| `function already exists` | Drop functions no Passo 1 foi realizado? Tente novamente. |
| `view already exists` | Drop view no Passo 1 foi realizado? Tente novamente. |
| `syntax error` | Verificar se todo o SQL foi copiado corretamente. |
| Timeout | Tente em chunks menores (PART 1, PART 2, etc). |

---

**Status:** Pronto para execução ✅
