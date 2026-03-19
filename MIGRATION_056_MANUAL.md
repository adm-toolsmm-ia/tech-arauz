# 🔧 Migration 056 - Manual Execution Guide

## ⚠️ PROBLEMA ATUAL
Sincronização falha com "2 erros em 0.6s" porque o banco de dados rejeita logs com `dataset='HorasLancadas'`.

## 🎯 SOLUÇÃO
Expandir os CHECK constraints nas tabelas para permitir 'HorasLancadas' e 'TempoPermanencia'.

---

## 📋 EXECUÇÃO MANUAL (3 passos)

### PASSO 1: Abrir SQL Editor do Supabase
Clique no link abaixo ou copie-o no navegador:

**https://app.supabase.com/project/pybmawlwpmxshtccpqui/sql**

### PASSO 2: Colar o SQL abaixo

```sql
-- ============================================================================
-- Migration 056: Expand dataset CHECK Constraints
-- ============================================================================

-- PARTE 1: Expand sync_logs dataset constraint
ALTER TABLE public.sync_logs
  DROP CONSTRAINT IF EXISTS sync_logs_dataset_check;

ALTER TABLE public.sync_logs
  ADD CONSTRAINT sync_logs_dataset_check
  CHECK (dataset IN (
    'Projetos', 'Entregas', 'Cronogramas', 'Requisitos',
    'Historicos', 'Aprovadores', 'Orcamentos',
    'TempoPermanencia', 'HorasLancadas'
  ));

-- PARTE 2: Expand integration_log_entries dataset constraint
ALTER TABLE public.integration_log_entries
  DROP CONSTRAINT IF EXISTS integration_log_entries_dataset_check;

ALTER TABLE public.integration_log_entries
  ADD CONSTRAINT integration_log_entries_dataset_check
  CHECK (dataset IN (
    'Projetos', 'Entregas', 'Cronogramas', 'Requisitos', 'Geral',
    'Historicos', 'Aprovadores', 'Orcamentos',
    'TempoPermanencia', 'HorasLancadas'
  ));
```

### PASSO 3: Executar

1. Cole o SQL acima na caixa de editor
2. Clique no botão **"Run"** (triângulo azul)
3. Aguarde aparecer a mensagem de sucesso
4. ✅ Pronto!

---

## ✅ VALIDAÇÃO

Após executar, a sincronização funcionará corretamente:

1. Abra https://tech-arauz.vercel.app/integracoes
2. Clique em "Sincronizar tudo"
3. Valide que:
   - [ ] Resultado mostra "0 erros" (não mais "2 erros")
   - [ ] Tab "Histórico de Sincronizações" mostra logs RECENTES
   - [ ] SUPOR.00429/26 aparece em `/projetos`

---

## 📝 NOTAS TÉCNICAS

- **Constraint anterior:** `CHECK (dataset IN ('Projetos', 'Entregas', 'Cronogramas', 'Requisitos', 'Geral', 'Historicos', 'Aprovadores', 'Orcamentos'))`
- **Constraint novo:** Adiciona `'TempoPermanencia'` e `'HorasLancadas'`
- **Impacto:** Zero dados perdidos. Apenas expande o que é permitido.
- **Rollback:** Se necessário, remover `'TempoPermanencia'` e `'HorasLancadas'` da constraint.

---

**Status:** ⏳ Aguardando execução manual do SQL
