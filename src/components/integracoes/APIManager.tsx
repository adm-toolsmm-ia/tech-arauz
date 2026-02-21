'use client';

import * as React from 'react';
import { RefreshCw, Settings, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

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
  created_at?: string;
  updated_at?: string;
}

interface APIManagerProps {
  onViewLogsClick?: (apiId?: string) => void;
}

// =============================================================================
// Component: APIManager
// =============================================================================

export function APIManager({ onViewLogsClick }: APIManagerProps) {
  const [apis, setAPIs] = React.useState<EspaiderAPI[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSyncing, setIsSyncing] = React.useState(false);

  // =========================================================================
  // Fetch APIs on mount
  // =========================================================================
  React.useEffect(() => {
    fetchAPIs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================================================================
  // Fetch all registered APIs
  // =========================================================================
  const fetchAPIs = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/integracoes');

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || `Erro ${res.status}`);
        setAPIs([]);
        return;
      }

      const result = await res.json();
      if (result.data) {
        setAPIs(result.data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro ao buscar APIs: ${message}`);
      setAPIs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =========================================================================
  // Trigger full sync
  // =========================================================================
  const handleSync = React.useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/integracoes/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(`Erro ao sincronizar: ${errorData.message || errorData.error}`);
        return;
      }

      const result = await res.json();
      if (result.success) {
        alert('Sincronização iniciada com sucesso!');
        // Refresh APIs list
        await fetchAPIs();
      } else {
        alert(`Erro: ${result.message}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      alert(`Erro ao iniciar sincronização: ${message}`);
    } finally {
      setIsSyncing(false);
    }
  }, [fetchAPIs]);

  // =========================================================================
  // Render component
  // =========================================================================

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>APIs de Integração</CardTitle>
        </CardHeader>
        <CardContent className="flex h-32 items-center justify-center text-muted-foreground">
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Carregando APIs...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>APIs de Integração</CardTitle>
        </CardHeader>
        <CardContent className="flex h-32 flex-col items-center justify-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <span className="px-4 text-center text-sm text-destructive">{error}</span>
          <Button variant="outline" size="sm" onClick={fetchAPIs}>
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (apis.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>APIs de Integração</CardTitle>
        </CardHeader>
        <CardContent className="flex h-32 items-center justify-center text-muted-foreground">
          Nenhuma API configurada
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>APIs de Integração</CardTitle>
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            size="sm"
            title="Sincronizar todos os dados do Espaider"
          >
            <RefreshCw className={`mr-1 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {apis.map((api) => (
          <div
            key={api.id}
            className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
          >
            {/* API Header */}
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold">{api.nome}</h3>
                <p className="truncate text-xs text-muted-foreground">{api.identificador}</p>
              </div>
              <Badge variant={api.is_active ? 'default' : 'secondary'} className="shrink-0">
                {api.is_active ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>

            {/* API Details */}
            <div className="mb-3 space-y-1">
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Tipo:</span> {api.tipo}
              </div>
              {api.base_url && (
                <div className="truncate text-xs text-muted-foreground">
                  <span className="font-medium">URL:</span> {api.base_url}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => onViewLogsClick?.(api.id)}
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
        ))}
      </CardContent>
    </Card>
  );
}
