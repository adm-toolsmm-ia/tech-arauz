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
  Search,
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
  search: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface LogViewerProps {
  datasetFilter?: string;
}

// =============================================================================
// Constants
// =============================================================================

const LEVEL_CONFIG = {
  error: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Erro' },
  warn: {
    icon: AlertTriangle,
    color: 'text-yellow-600 dark:text-yellow-500',
    bg: 'bg-yellow-500/10',
    label: 'Aviso',
  },
  success: {
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-500',
    bg: 'bg-green-500/10',
    label: 'Sucesso',
  },
  info: { icon: Info, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Info' },
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
// Helpers
// =============================================================================

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function getErrorMessage(status: number): string {
  switch (status) {
    case 401:
      return 'Sessão expirada. Faça login novamente para visualizar os logs.';
    case 403:
      return 'Sem permissão para acessar logs. Contate o administrador do sistema.';
    case 500:
      return 'Erro no servidor ao buscar logs. Tente novamente em alguns instantes.';
    default:
      return `Erro inesperado (${status}). Tente novamente.`;
  }
}

// =============================================================================
// Component
// =============================================================================

export function LogViewer({ datasetFilter }: LogViewerProps) {
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [summaries, setSummaries] = React.useState<SyncSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());
  const [filters, setFilters] = React.useState<Filters>({
    level: '',
    dataset: datasetFilter || '',
    startDate: '',
    endDate: '',
    search: '',
  });
  const [showFilters, setShowFilters] = React.useState(false);
  const [pagination, setPagination] = React.useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  // Track search input separately for debounce
  const [searchInput, setSearchInput] = React.useState('');
  const searchTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

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
        if (filters.search) params.set('search', filters.search);

        const res = await fetch(`/api/integracoes/logs?${params}`);

        if (!res.ok) {
          setError(getErrorMessage(res.status));
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
        setError(`Falha na conexão: ${message}`);
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
      if (!res.ok) return;
      const result = await res.json();
      if (result.data) setSummaries(result.data);
    } catch {
      // Non-critical: summaries are secondary info
    }
  }, []);

  // =========================================================================
  // Single useEffect: fetch on mount + when filters change
  // =========================================================================
  React.useEffect(() => {
    fetchLogs(1);
    fetchSummaries();
  }, [fetchLogs, fetchSummaries]);

  // =========================================================================
  // Update dataset filter from parent prop
  // =========================================================================
  React.useEffect(() => {
    if (datasetFilter !== undefined) {
      setFilters((prev) => ({ ...prev, dataset: datasetFilter }));
    }
  }, [datasetFilter]);

  // =========================================================================
  // Debounced search input handler
  // =========================================================================
  const handleSearchChange = React.useCallback((value: string) => {
    setSearchInput(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value }));
    }, 400);
  }, []);

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  // =========================================================================
  // Handle pagination
  // =========================================================================
  const handlePageChange = React.useCallback(
    (newPage: number) => {
      fetchLogs(newPage);
    },
    [fetchLogs],
  );

  // =========================================================================
  // Toggle row expansion
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
  // Clear all filters
  // =========================================================================
  const clearFilters = () => {
    setError(null);
    setSearchInput('');
    setFilters({ level: '', dataset: '', startDate: '', endDate: '', search: '' });
  };

  // =========================================================================
  // Compute log level stats
  // =========================================================================
  const levelStats = React.useMemo(() => {
    const stats = { error: 0, warn: 0, success: 0, info: 0 };
    for (const log of logs) {
      if (log.level in stats) stats[log.level]++;
    }
    return stats;
  }, [logs]);

  // =========================================================================
  // Render log entry row
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
            // Filter by this request_id
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
  // Render pagination with page numbers
  // =========================================================================
  const renderPagination = () => {
    if (pagination.totalPages <= 1 || error) return null;

    const pages: (number | '...')[] = [];
    const { page, totalPages } = pagination;

    // Build range: show 1 ... p-1 p p+1 ... N
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return (
      <div className="flex items-center justify-between border-t p-3">
        <span className="text-xs text-muted-foreground">
          {pagination.total} registros · Página {page} de {totalPages}
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isLoading}
            onClick={() => handlePageChange(page - 1)}
          >
            ‹
          </Button>
          {pages.map((p, i) =>
            p === '...' ? (
              <span
                key={`ellipsis-${i}`}
                className="flex items-center px-1 text-xs text-muted-foreground"
              >
                …
              </span>
            ) : (
              <Button
                key={p}
                variant={p === page ? 'default' : 'outline'}
                size="sm"
                className="min-w-[32px]"
                disabled={isLoading}
                onClick={() => handlePageChange(p)}
              >
                {p}
              </Button>
            ),
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isLoading}
            onClick={() => handlePageChange(page + 1)}
          >
            ›
          </Button>
        </div>
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
          <div className="flex items-center gap-3">
            <CardTitle className="text-base">Histórico de Sincronizações</CardTitle>
            {/* Level stats badges */}
            {!isLoading && logs.length > 0 && (
              <div className="flex gap-1.5">
                {levelStats.error > 0 && (
                  <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">
                    {levelStats.error} erros
                  </Badge>
                )}
                {levelStats.warn > 0 && (
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                    {levelStats.warn} avisos
                  </Badge>
                )}
                {levelStats.success > 0 && (
                  <Badge
                    variant="outline"
                    className="border-green-500/50 px-1.5 py-0 text-[10px] text-green-600"
                  >
                    {levelStats.success} ok
                  </Badge>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-1 h-4 w-4" />
              Filtros
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLogs(pagination.page)}
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
            <div className="grid grid-cols-2 gap-3 pt-3 md:grid-cols-6">
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
                        {LEVEL_CONFIG[l as keyof typeof LEVEL_CONFIG].label}
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
              <div>
                <Label className="text-xs">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="mensagem..."
                    className="h-8 pl-7"
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-end">
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
            <ScrollArea className="h-[420px]">
              {isLoading ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Carregando...
                </div>
              ) : error ? (
                <div className="flex h-32 flex-col items-center justify-center gap-2 px-8">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <span className="text-center text-sm text-destructive">{error}</span>
                  <Button variant="outline" size="sm" onClick={() => fetchLogs(1)}>
                    Tentar Novamente
                  </Button>
                </div>
              ) : logs.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center gap-1 text-muted-foreground">
                  <Info className="h-5 w-5" />
                  <span className="text-sm">Nenhum log encontrado</span>
                  {(filters.level || filters.dataset || filters.search) && (
                    <Button variant="link" size="sm" onClick={clearFilters}>
                      Limpar filtros
                    </Button>
                  )}
                </div>
              ) : (
                <div className="font-mono text-sm">{logs.map(renderLogEntry)}</div>
              )}
            </ScrollArea>

            {/* Pagination */}
            {renderPagination()}
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary" className="m-0">
            <ScrollArea className="h-[420px]">
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
