-- =============================================================================
-- Tech Arauz - Migration 006: Log Entries Detalhados
-- =============================================================================
-- Armazena cada SyncLogEntry individualmente para histórico e debug
-- Relaciona com sync_logs via request_id para rastreabilidade
-- =============================================================================

-- Tabela: integration_log_entries
-- Persiste cada log individual da sincronização Espaider
CREATE TABLE IF NOT EXISTS public.integration_log_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

    -- Vínculo com sync_logs (1-N)
    sync_log_id UUID REFERENCES public.sync_logs(id) ON DELETE CASCADE,
    request_id TEXT NOT NULL,

    -- Campos do SyncLogEntry
    level TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error', 'success')),
    dataset TEXT NOT NULL CHECK (dataset IN ('Projetos', 'Entregas', 'Cronogramas', 'Requisitos', 'Geral')),
    message TEXT NOT NULL,
    details JSONB,

    -- Timestamp do log (do cliente, não do banco)
    logged_at TIMESTAMPTZ NOT NULL,

    -- Timestamp de criação no banco
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comentário da tabela
COMMENT ON TABLE public.integration_log_entries IS
'Logs detalhados de sincronização Espaider. Cada registro representa um SyncLogEntry.
Vinculado a sync_logs via sync_log_id/request_id para correlação.';

-- =============================================================================
-- Índices otimizados para queries do LogViewer
-- =============================================================================

-- Índice para isolamento por tenant (RLS)
CREATE INDEX idx_log_entries_tenant_id
    ON public.integration_log_entries(tenant_id);

-- Índice para correlação com sync_logs
CREATE INDEX idx_log_entries_request_id
    ON public.integration_log_entries(request_id);

-- Índice para FK com sync_logs
CREATE INDEX idx_log_entries_sync_log_id
    ON public.integration_log_entries(sync_log_id);

-- Índice para filtro por nível
CREATE INDEX idx_log_entries_level
    ON public.integration_log_entries(level);

-- Índice para filtro por dataset
CREATE INDEX idx_log_entries_dataset
    ON public.integration_log_entries(dataset);

-- Índice para ordenação temporal (DESC para mostrar mais recentes primeiro)
CREATE INDEX idx_log_entries_logged_at
    ON public.integration_log_entries(logged_at DESC);

-- Índice composto para filtros combinados (comum no LogViewer)
CREATE INDEX idx_log_entries_tenant_level_date
    ON public.integration_log_entries(tenant_id, level, logged_at DESC);

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================

ALTER TABLE public.integration_log_entries ENABLE ROW LEVEL SECURITY;

-- Admins podem ver todos os logs do tenant
CREATE POLICY "Log entries: admins can view"
    ON public.integration_log_entries FOR SELECT
    USING (
        tenant_id = public.get_user_tenant_id()
        AND public.get_user_role() = 'admin'
    );

-- System (service role) pode inserir - usado pelo sync service
CREATE POLICY "Log entries: system can insert"
    ON public.integration_log_entries FOR INSERT
    WITH CHECK (TRUE);

-- =============================================================================
-- Função opcional para limpeza automática (manter últimos 30 dias)
-- Descomente se quiser ativar auto-cleanup
-- =============================================================================

-- CREATE OR REPLACE FUNCTION public.cleanup_old_log_entries()
-- RETURNS void AS $$
-- BEGIN
--     DELETE FROM public.integration_log_entries
--     WHERE created_at < NOW() - INTERVAL '30 days';
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Para agendar, use pg_cron:
-- SELECT cron.schedule('cleanup-old-logs', '0 3 * * *', 'SELECT public.cleanup_old_log_entries()');
