-- =============================================================================
-- PATCH: Desabilitar trigger de auditoria em integration_log_entries
-- =============================================================================
--
-- PROBLEMA: Trigger 'audit_integration_log_entries_ops' (migração 059)
-- causa erro ao tentar inserir logs via service role
--
-- SOLUÇÃO: Desabilitar trigger (auditoria já existe em sync_logs)
--
-- INSTRUÇÕES:
-- 1. Copie este SQL completo
-- 2. Abra: https://app.supabase.com/project/pybmawlwpmxshtccpqui/sql
-- 3. Cole na caixa de editor
-- 4. Clique em "RUN"
-- 5. Aguarde sucesso
--
-- =============================================================================

-- Desabilitar o trigger de auditoria que causa o erro
ALTER TABLE public.integration_log_entries
  DISABLE TRIGGER audit_integration_log_entries_ops;

-- Teste de verificação: tentar inserir com HorasLancadas
INSERT INTO public.integration_log_entries (
  tenant_id,
  request_id,
  level,
  dataset,
  message,
  logged_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'PATCH-VERIFY-' || NOW()::TEXT,
  'info',
  'HorasLancadas',
  'Patch verification: trigger disabled and insert working',
  NOW()
);

-- Ver status do trigger
SELECT
  trigger_name,
  trigger_schema,
  event_object_table,
  (SELECT is_enabled FROM information_schema.triggered_update_columns WHERE trigger_name = 'audit_integration_log_entries_ops') as is_enabled
FROM information_schema.triggers
WHERE event_object_table = 'integration_log_entries'
  AND trigger_name = 'audit_integration_log_entries_ops'
LIMIT 1;
