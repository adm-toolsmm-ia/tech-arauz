'use client';

import * as React from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// =============================================================================
// Types
// =============================================================================

interface LogEntry {
  id: string;
  level: 'info' | 'warn' | 'error' | 'success';
  dataset: string;
  message: string;
  details: Record<string, unknown> | null;
  logged_at: string;
  request_id: string;
}

interface SyncSummary {
  id: string;
  request_id: string;
  status: 'success' | 'partial' | 'failed' | 'running';
  total_records?: number;
  new_records?: number;
  updated_records?: number;
  errors?: number;
  duration_ms?: number;
  created_at: string;
}

interface Filters {
  level: string;
  dataset: string;
  startDate: string;
  endDate: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// =============================================================================
// Constants
// =============================================================================

const LEVEL_CONFIG = {
  error: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
  warn: {
    icon: AlertTriangle,
    color: 'text-yellow-600 dark:text-yellow-500',
    bg: 'bg-yellow-500/10',
  },
  success: {
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-500',
    bg: 'bg-green-500/10',
  },
  info: { icon: Info, color: 'text-muted-foreground', bg: 'bg-muted' },
};

const DATASETS = [
  'Geral',
  'Projetos',
  'Entregas',
  'Cronogramas',
  'Requisitos',
  'Historicos',
  'Aprovadores',
  'Orcamentos',
];
const LEVELS = ['info', 'warn', 'error', 'success'];

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  running: { label: 'Executando', variant: 'outline' },
  success: { label: 'Sucesso', variant: 'default' },
  partial: { label: 'Parcial', variant: 'secondary' },
  failed: { label: 'Falhou', variant: 'destructive' },
};

// =============================================================================
// Component
// =============================================================================

export function LogViewer() {
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [summaries, setSummaries] = React.useState<SyncSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());
  const [filters, setFilters] = React.useState<Filters>({
    level: '',
    dataset: '',
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = React.useState(false);
  const [pagination, setPagination] = React.useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  // =========================================================================
  // Fetch logs with filters and pagination
  // =========================================================================
  const fetchLogs = React.useCallback(
    async (page = 1) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(50));
        if (filters.level) params.set('level', filters.level);
        if (filters.dataset) params.set('dataset', filters.dataset);
        if (filters.startDate) params.set('startDate', filters.startDate);
        if (filters.endDate) params.set('endDate', filters.endDate);

        const res = await fetch(`/api/integracoes/logs?${params}`);

        if (!res.ok) {
          const errorData = await res.json();
          const errorMessage = errorData.error || `Erro ${res.status}`;
          setError(errorMessage);
          setLogs([]);
          setPagination((prev) => ({ ...prev, page, total: 0, totalPages: 0 }));
          return;
        }

        const result = await res.json();
        if (result.data) {
          setLogs(result.data);
          setPagination((prev) => ({ ...prev, ...result.pagination, page }));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(`Erro ao buscar logs: ${message}`);
        setLogs([]);
      } finally {
        setIsLoading(false);
      }
    },
    [filters],
  );

  // =========================================================================
  // Fetch sync summaries
  // =========================================================================
  const fetchSummaries = React.useCallback(async () => {
    try {
      const res = await fetch('/api/integracoes/logs/summary');

      if (!res.ok) {
        console.warn(`[fetchSummaries] API returned ${res.status}`);
        return;
      }

      const result = await res.json();
      if (result.data) {
        setSummaries(result.data);
      }
    } catch (err) {
      console.warn('Failed to fetch summaries (non-critical):', err);
    }
  }, []);

  // =========================================================================
  // Initial load on mount (only once)
  // =========================================================================
  React.useEffect(() => {
    fetchLogs(1);
    fetchSummaries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array: run only on mount

  // =========================================================================
  // Re-fetch when filters change (reset to page 1)
  // =========================================================================
  React.useEffect(() => {
    fetchLogs(1);
  }, [filters, fetchLogs]);

  // =========================================================================
  // Handle pagination changes
  // =========================================================================
  const handlePageChange = React.useCallback(
    (newPage: number) => {
      setPagination((prev) => ({ ...prev, page: newPage }));
      fetchLogs(newPage);
    },
    [fetchLogs],
  );

  // =========================================================================
  // Toggle row expansion for details
  // =========================================================================
  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // =========================================================================
  // Format date to human-readable string
  // =========================================================================
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // =========================================================================
  // Apply filters (reset pagination)
  // =========================================================================
  const applyFilters = () => {
    setError(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // =========================================================================
  // Clear all filters
  // =========================================================================
  const clearFilters = () => {
    setError(null);
    setFilters({ level: '', dataset: '', startDate: '', endDate: '' });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // =========================================================================
  // Render log entry row with expandable details
  // =========================================================================
  const renderLogEntry = (log: LogEntry) => {
    const config = LEVEL_CONFIG[log.level];
    const Icon = config.icon;
    const isExpanded = expandedRows.has(log.id);
    const hasDetails = log.details && Object.keys(log.details).length > 0;

    return (
      <div key={log.id} className={`border-b border-border/50 ${config.bg}`}>
        <div
          className={`flex items-start gap-2 p-2 ${hasDetails ? 'cursor-pointer hover:bg-muted/50' : ''}`}
          onClick={() => hasDetails && toggleRow(log.id)}
        >
          {hasDetails ? (
            isExpanded ? (
              <ChevronDown className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0" />
            )
          ) : (
            <div className="w-4" />
          )}
          <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.color}`} />
          <span className="w-36 shrink-0 text-xs text-muted-foreground">
            {formatDate(log.logged_at)}
          </span>
          <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-[10px]">
            {log.dataset}
          </Badge>
          <span className={`flex-1 text-sm ${config.color}`}>{log.message}</span>
        </div>
        {isExpanded && hasDetails && (
          <div className="px-10 pb-2">
            <pre className="max-h-48 overflow-x-auto rounded bg-muted p-2 text-xs">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  // =========================================================================
  // Render sync summary row
  // =========================================================================
  const renderSummaryRow = (summary: SyncSummary) => {
    const config = STATUS_CONFIG[summary.status] || STATUS_CONFIG.failed;

    return (
      <div
        key={summary.id}
        className="flex items-center gap-3 border-b border-border/50 p-3 hover:bg-muted/50"
      >
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={config.variant} className="text-xs">
              {config.label}
            </Badge>
            <span className="text-xs text-muted-foreground">{formatDate(summary.created_at)}</span>
          </div>
          {(summary.total_records ?? 0) > 0 && (
            <div className="mt-1 text-xs text-muted-foreground">
              {summary.total_records} registros | {summary.new_records} novos |{' '}
              {summary.updated_records} atualizados | {summary.errors} erros |{' '}
              {summary.duration_ms ? (summary.duration_ms / 1000).toFixed(1) + 's' : '-'}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // Filter by request_id
            const params = new URLSearchParams();
            params.set('requestId', summary.request_id);
            fetch(`/api/integracoes/logs?${params}`)
              .then((res) => res.json())
              .then((result) => {
                if (result.data) {
                  setLogs(result.data);
                  setPagination((prev) => ({ ...prev, ...result.pagination }));
                }
              });
          }}
          title="Ver logs desta execução"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  // =========================================================================
  // Render component
  // =========================================================================

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Histórico de Sincronizações</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-1 h-4 w-4" />
              Filtros
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchLogs(pagination.page);
                fetchSummaries();
              }}
              disabled={isLoading}
              title="Recarregar logs"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        <Collapsible open={showFilters}>
          <CollapsibleTrigger className="hidden" />
          <CollapsibleContent>
            <div className="grid grid-cols-2 gap-3 pt-3 md:grid-cols-5">
              <div>
                <Label className="text-xs">Nível</Label>
                <Select
                  value={filters.level}
                  onValueChange={(v) => setFilters((prev) => ({ ...prev, level: v }))}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Dataset</Label>
                <Select
                  value={filters.dataset}
                  onValueChange={(v) => setFilters((prev) => ({ ...prev, dataset: v }))}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {DATASETS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Data Início</Label>
                <Input
                  type="date"
                  className="h-8"
                  value={filters.startDate}
                  onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-xs">Data Fim</Label>
                <Input
                  type="date"
                  className="h-8"
                  value={filters.endDate}
                  onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button size="sm" className="h-8" onClick={applyFilters}>
                  Aplicar
                </Button>
                <Button size="sm" variant="ghost" className="h-8" onClick={clearFilters}>
                  Limpar
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs defaultValue="logs">
          <TabsList className="mx-4">
            <TabsTrigger value="logs">Logs Detalhados</TabsTrigger>
            <TabsTrigger value="summary">Resumo por Execução</TabsTrigger>
          </TabsList>

          {/* Logs Tab */}
          <TabsContent value="logs" className="m-0">
            <ScrollArea className="h-96">
              {isLoading ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Carregando...
                </div>
              ) : error ? (
                <div className="flex h-32 flex-col items-center justify-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <span className="px-4 text-center text-sm text-destructive">{error}</span>
                </div>
              ) : logs.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  Nenhum log encontrado
                </div>
              ) : (
                <div className="font-mono text-sm">{logs.map(renderLogEntry)}</div>
              )}
            </ScrollArea>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && !error && (
              <div className="flex items-center justify-between border-t p-3">
                <span className="text-xs text-muted-foreground">
                  Página {pagination.page} de {pagination.totalPages} ({pagination.total} registros)
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1 || isLoading}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages || isLoading}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary" className="m-0">
            <ScrollArea className="h-96">
              {summaries.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  Nenhuma sincronização registrada
                </div>
              ) : (
                summaries.map(renderSummaryRow)
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
