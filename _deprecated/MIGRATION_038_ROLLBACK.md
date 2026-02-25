# 🔄 Migration 038: Rollback & Troubleshooting Guide

---

## ⚠️ Em caso de problema durante execução

### Erro: "Constraint violation on unique_model_per_provider"

**Causa**: Modelo duplicado já existe na mesma provider.

**Solução**:
```sql
-- Verificar duplicatas
SELECT provider_id, model_id, COUNT(*) as cnt
FROM lm_models
GROUP BY provider_id, model_id
HAVING COUNT(*) > 1;

-- Se houver, remover duplos (manter o mais recente by updated_at)
DELETE FROM lm_models
WHERE id NOT IN (
  SELECT MAX(id) 
  FROM lm_models
  GROUP BY provider_id, model_id
)
AND (provider_id, model_id) IN (
  SELECT provider_id, model_id
  FROM lm_models
  GROUP BY provider_id, model_id
  HAVING COUNT(*) > 1
);

-- Reapplicar migration
npx supabase db push
```

---

### Erro: "Provider não encontrado"

**Causa**: Migrations 034-036 não foram aplicadas.

**Verificação**:
```bash
npx supabase migration list
# Deve mostrar:
# 034_agent_types_default_model_and_more_providers.sql
# 035_add_docs_url_and_seed_providers.sql
# 036_seed_gemini_provider_and_models.sql
```

**Solução**:
```bash
# Aplicar apenas as migrations faltantes
npx supabase migration up
```

---

### Erro: "Tenant 'arauz-advogados' não encontrado"

**Causa**: Migration 003 não foi aplicada ou tenant foi deletado.

**Verificação**:
```sql
SELECT id, name, slug FROM tenants WHERE slug = 'arauz-advogados';
```

**Solução**:
```bash
# Re-criar tenant se necessário (apenas dev/staging)
npx supabase db reset
```

---

## 🔄 Rollback Completo

### Opção 1: Revert automático via Supabase CLI

```bash
# Visualizar histórico de migrations
npx supabase migration list

# Desfazer última migration (038)
npx supabase migration undo

# Confirmar
npx supabase migration list
# 038 deve desaparecer
```

### Opção 2: Manual rollback (SQL)

```sql
-- Reativar todos os modelos desativados
UPDATE lm_models
SET is_active = true
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'arauz-advogados')
  AND is_system = false
  AND display_order >= 100;

-- Remover modelos curados novos (optional - apenas se necessário)
DELETE FROM lm_models
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'arauz-advogados')
  AND is_system = true
  AND display_order BETWEEN 1 AND 5;
```

---

## ✅ Validação Pós-Execução

### Verificar contagem correta

```sql
-- DEVE retornar: 6 linhas (um por provedor), cada uma com active_curated = 5
SELECT 
  p.name as provider,
  COUNT(*) as total_models,
  SUM(CASE WHEN m.is_active = true THEN 1 ELSE 0 END) as active_curated,
  SUM(CASE WHEN m.is_active = false THEN 1 ELSE 0 END) as inactive_legacy
FROM lm_models m
JOIN lm_providers p ON m.provider_id = p.id
JOIN tenants t ON m.tenant_id = t.id
WHERE t.slug = 'arauz-advogados'
GROUP BY p.id, p.name
ORDER BY p.name;
```

**Saída esperada**:
```
Anthropic    | 5+N | 5 | N
Cohere       | 5+N | 5 | N
Google       | 5+N | 5 | N
Groq         | 5+N | 5 | N
Mistral      | 5+N | 5 | N
OpenAI       | 5+N | 5 | N
```

### Verificar display_order

```sql
-- DEVE mostrar apenas 1-5 para curados (is_active=true, is_system=true)
SELECT 
  p.name,
  m.model_id,
  m.display_order,
  m.tier,
  m.is_active,
  m.context_window,
  ROUND(m.input_cost_per_1k_tokens::numeric, 6) as input_cost_usd,
  ROUND(m.output_cost_per_1k_tokens::numeric, 6) as output_cost_usd
FROM lm_models m
JOIN lm_providers p ON m.provider_id = p.id
WHERE m.is_system = true AND m.is_active = true
ORDER BY p.name, m.display_order;
```

**Saída esperada** (exemplo OpenAI):
```
OpenAI | gpt-4o-mini    | 1 | entry     | true | 128000 | 0.00015 | 0.0006
OpenAI | gpt-4o         | 2 | balanced  | true | 128000 | 0.005   | 0.015
OpenAI | gpt-4-turbo    | 3 | pro       | true | 128000 | 0.01    | 0.03
OpenAI | o1-mini        | 4 | pro       | true | 128000 | 0.0011  | 0.0044
OpenAI | o1             | 5 | flagship  | true | 128000 | 0.015   | 0.06
```

### Verificar tier distribution

```sql
-- DEVE mostrar: entry (6), balanced (10-12), pro (8-10), flagship (6)
SELECT 
  tier,
  COUNT(*) as count,
  ROUND(AVG(input_cost_per_1k_tokens)::numeric, 6) as avg_input_cost
FROM lm_models
WHERE is_system = true AND is_active = true
GROUP BY tier
ORDER BY 
  CASE tier WHEN 'entry' THEN 1 WHEN 'balanced' THEN 2 WHEN 'pro' THEN 3 WHEN 'flagship' THEN 4 END;
```

**Saída esperada**:
```
entry     | 6  | ~0.0001
balanced  | 11 | ~0.0006
pro       | 7  | ~0.006
flagship  | 6  | ~0.01
```

---

## 🧪 Teste de Integridade

### Teste 1: Uniqueness constraint

```sql
-- DEVE retornar 0 (zero duplicatas)
SELECT COUNT(*) as duplicates
FROM (
  SELECT provider_id, model_id, COUNT(*) as cnt
  FROM lm_models
  WHERE is_system = true
  GROUP BY provider_id, model_id
  HAVING COUNT(*) > 1
) t;
```

### Teste 2: Campos obrigatórios

```sql
-- DEVE retornar 0 (todos os campos preenchidos)
SELECT COUNT(*) as missing_data
FROM lm_models
WHERE is_system = true
  AND (
    context_window IS NULL
    OR input_cost_per_1k_tokens IS NULL
    OR output_cost_per_1k_tokens IS NULL
    OR tier IS NULL
    OR display_order IS NULL
    OR docs_url IS NULL
  );
```

### Teste 3: RLS compliance

```sql
-- Verificar que RLS não foi quebrado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('lm_models', 'lm_providers', 'tenants')
  AND schemaname = 'public';

-- DEVE retornar: rowsecurity = true para todas as 3 tabelas
```

---

## 🐛 Debug Mode

Se algo der errado, ativar debug:

```bash
# Ver log completo da migration
npx supabase db push --debug

# Ou fazer push com verbose
npx supabase db push -v
```

---

## 📞 Escalação

Se nenhuma solução acima funcionar:

1. **Backup**: `npx supabase db pull`
2. **Check logs**: `npx supabase logs push`
3. **Reset (dev only)**: `npx supabase db reset`
4. **Contact**: Supabase support ou @data-engineer

---

## ✅ Checklist Final

Antes de considerar sucesso:

- [ ] Migration 038 listada em `npx supabase migration list`
- [ ] Contagem: 30 modelos ativos (5 por provedor)
- [ ] Display_order: 1-5 para todos curados
- [ ] Tiers: distribuição correta (entry, balanced, pro, flagship)
- [ ] Context windows: todos preenchidos
- [ ] Custos: todos preenchidos em USD
- [ ] RLS: policies intactas
- [ ] Constraint unique: sem duplicatas
- [ ] Campos obrigatórios: todos preenchidos
- [ ] Tenant isolation: arauz-advogados only

**✅ Se tudo passou: Migration 038 está em PRODUÇÃO**

