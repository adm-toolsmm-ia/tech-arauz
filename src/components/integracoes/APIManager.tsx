'use client';

import * as React from 'react';
import { RefreshCw, Settings, Eye, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// =============================================================================
// Types
// =============================================================================

interface EspaiderAPI {
  id: string;
  tenant_id: string;
  nome: string;
  identificador: string;
  tipo: string;
  is_active: boolean;
  base_url?: string;
  last_sync_at?: string | null;
  last_sync_status?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface APIManagerProps {
  onViewLogs?: (dataset?: string) => void;
  onSyncComplete?: () => void;
}

// =============================================================================
// Helpers
// =============================================================================

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'agora mesmo';
  if (diffMins < 60) return `${diffMins}min atrás`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h atrás`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d atrás`;
}

const SYNC_STATUS_CONFIG: Record<
  string,
  { icon: typeof CheckCircle2; color: string; label: string }
> = {
  success: { icon: CheckCircle2, color: 'text-green-600', label: 'Sucesso' },
  partial: { icon: AlertCircle, color: 'text-yellow-600', label: 'Parcial' },
  failed: { icon: XCircle, color: 'text-destructive', label: 'Falhou' },
};

// =============================================================================
// Component: APIManager
// =============================================================================

export function APIManager({ onViewLogs, onSyncComplete }: APIManagerProps) {
  const [apis, setAPIs] = React.useState<EspaiderAPI[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncMessage, setSyncMessage] = React.useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // =========================================================================
  // Fetch APIs on mount
  // =========================================================================
  const fetchAPIs = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/integracoes');

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || `Erro ${res.status}`);
        setAPIs([]);
        return;
      }

      const result = await res.json();
      setAPIs(result.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro ao buscar APIs: ${message}`);
      setAPIs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAPIs();
  }, [fetchAPIs]);

  // Clear sync message after 5s
  React.useEffect(() => {
    if (!syncMessage) return;
    const timer = setTimeout(() => setSyncMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [syncMessage]);

  // =========================================================================
  // Trigger full sync
  // =========================================================================
  const handleSync = React.useCallback(async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/integracoes/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setSyncMessage({ type: 'error', text: result.message || 'Erro ao sincronizar.' });
        return;
      }

      setSyncMessage({ type: 'success', text: 'Sincronização concluída com sucesso!' });
      await fetchAPIs();
      onSyncComplete?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setSyncMessage({ type: 'error', text: `Falha na conexão: ${message}` });
    } finally {
      setIsSyncing(false);
    }
  }, [fetchAPIs, onSyncComplete]);

  // =========================================================================
  // Loading state
  // =========================================================================
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">APIs de Integração</CardTitle>
        </CardHeader>
        <CardContent className="flex h-24 items-center justify-center text-muted-foreground">
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Carregando APIs...
        </CardContent>
      </Card>
    );
  }

  // =========================================================================
  // Error state
  // =========================================================================
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">APIs de Integração</CardTitle>
        </CardHeader>
        <CardContent className="flex h-24 flex-col items-center justify-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <span className="text-center text-sm text-destructive">{error}</span>
          <Button variant="outline" size="sm" onClick={fetchAPIs}>
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  // =========================================================================
  // Render
  // =========================================================================
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">APIs de Integração</CardTitle>
          <Button
            onClick={handleSync}
            disabled={isSyncing || apis.length === 0}
            size="sm"
            title="Sincronizar todos os dados do Espaider"
          >
            <RefreshCw className={`mr-1.5 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Tudo'}
          </Button>
        </div>

        {/* Sync feedback inline */}
        {syncMessage && (
          <div
            className={`mt-2 rounded-md px-3 py-2 text-sm ${syncMessage.type === 'success'
                ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                : 'bg-destructive/10 text-destructive'
              }`}
          >
            {syncMessage.type === 'success' ? (
              <CheckCircle2 className="mr-1.5 inline h-4 w-4" />
            ) : (
              <XCircle className="mr-1.5 inline h-4 w-4" />
            )}
            {syncMessage.text}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {apis.length === 0 ? (
          <div className="flex h-20 items-center justify-center text-sm text-muted-foreground">
            Nenhuma API configurada
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {apis.map((api) => {
              const syncStatus = api.last_sync_status
                ? SYNC_STATUS_CONFIG[api.last_sync_status]
                : null;

              return (
                <div
                  key={api.id}
                  className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  {/* Header */}
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold">{api.nome}</h3>
                      <p className="truncate text-xs text-muted-foreground">{api.identificador}</p>
                    </div>
                    <Badge variant={api.is_active ? 'default' : 'secondary'} className="shrink-0">
                      {api.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="mb-3 space-y-1">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Tipo:</span> {api.tipo}
                    </div>
                    {api.last_sync_at && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Última sync: {formatRelativeTime(api.last_sync_at)}</span>
                        {syncStatus && (
                          <>
                            <span className="mx-0.5">·</span>
                            <syncStatus.icon className={`h-3 w-3 ${syncStatus.color}`} />
                            <span className={syncStatus.color}>{syncStatus.label}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        const datasetMap: Record<string, string> = {
                          projetos: 'Projetos',
                          completo: 'Projetos',
                          entregas: 'Entregas',
                          cronogramas: 'Cronogramas',
                          requisitos: 'Requisitos',
                          horas_lancadas: 'HorasLancadas',
                        };
                        onViewLogs?.(datasetMap[api.tipo]);
                      }}
                      title="Ver logs desta API"
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      Logs
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      title="Editar configuração da API"
                    >
                      <Settings className="mr-1 h-3 w-3" />
                      Config
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
