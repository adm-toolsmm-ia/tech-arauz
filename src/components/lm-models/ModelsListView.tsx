'use client';

import * as React from 'react';
import { ChevronDown, ChevronUp, Power } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import type { LmModel, LmProvider } from '@/types/agents';

interface ModelsListViewProps {
  models: (LmModel & { lm_providers?: LmProvider })[];
  providers: LmProvider[];
  onSelectModel?: (modelId: string) => void;
  onBulkToggleActive?: (modelIds: string[], isActive: boolean) => Promise<void>;
  isLoading?: boolean;
}

const TIER_COLORS: Record<string, string> = {
  entry: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
  balanced: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
  pro: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
  flagship: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
  inactive: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
};

function formatTokens(tokens: number | undefined): string {
  if (!tokens) return '—';
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}K`;
  return tokens.toString();
}

const getProviderName = (providerId: string, providers: LmProvider[]): string => {
  return providers.find((p) => p.id === providerId)?.name || 'Unknown';
};

const getProviderEmoji = (providerId: string, providers: LmProvider[]): string => {
  return providers.find((p) => p.id === providerId)?.icon_emoji || '🤖';
};

export function ModelsListView({
  models,
  providers,
  onSelectModel,
  onBulkToggleActive,
  isLoading = false,
}: ModelsListViewProps) {
  const [sortBy, setSortBy] = React.useState<'name' | 'provider' | 'tier' | 'context'>('name');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const toggleSelect = (modelId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(modelId)) {
      newSelected.delete(modelId);
    } else {
      newSelected.add(modelId);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredModels.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredModels.map((m) => m.id)));
    }
  };

  const filteredModels = React.useMemo(() => {
    const filtered = [...models];

    filtered.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'provider') {
        const providerA = getProviderName(a.provider_id, providers);
        const providerB = getProviderName(b.provider_id, providers);
        comparison = providerA.localeCompare(providerB);
      } else if (sortBy === 'tier') {
        comparison = (a.tier || 'balanced').localeCompare(b.tier || 'balanced');
      } else if (sortBy === 'context') {
        comparison = (a.context_window || 0) - (b.context_window || 0);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [models, sortBy, sortDirection, providers]);

  const SortHeader = ({
    column,
    label,
  }: {
    column: 'name' | 'provider' | 'tier' | 'context';
    label: string;
  }) => (
    <button
      onClick={() => {
        if (sortBy === column) {
          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
          setSortBy(column);
          setSortDirection('asc');
        }
      }}
      className="flex items-center gap-1.5 text-xs font-semibold transition-colors hover:text-primary"
    >
      {label}
      {sortBy === column &&
        (sortDirection === 'asc' ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        ))}
    </button>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Carregando modelos...</p>
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Nenhum modelo encontrado</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Acoes em massa */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
          <span className="text-xs font-medium text-muted-foreground">
            {selectedIds.size} modelo{selectedIds.size !== 1 ? 's' : ''} selecionado
            {selectedIds.size !== 1 ? 's' : ''}
          </span>
          <div className="flex-1" />
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={async () => {
              if (onBulkToggleActive) {
                await onBulkToggleActive(Array.from(selectedIds), true);
                setSelectedIds(new Set());
              }
            }}
          >
            <Power className="mr-1 h-3.5 w-3.5" />
            Ativar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={async () => {
              if (onBulkToggleActive) {
                await onBulkToggleActive(Array.from(selectedIds), false);
                setSelectedIds(new Set());
              }
            }}
          >
            <Power className="mr-1 h-3.5 w-3.5" />
            Desativar
          </Button>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden overflow-hidden rounded-lg border bg-card md:block">
        <div className="max-h-[600px] overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 border-b bg-muted/50">
              <tr>
                <th className="w-8 px-3 py-2 text-left">
                  <Checkbox
                    checked={
                      selectedIds.size === filteredModels.length && filteredModels.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                    aria-label="Selecionar tudo"
                  />
                </th>
                <th className="min-w-fit px-3 py-2 text-left font-semibold text-muted-foreground">
                  <SortHeader column="name" label="Modelo" />
                </th>
                <th className="min-w-fit px-3 py-2 text-left font-semibold text-muted-foreground">
                  <SortHeader column="provider" label="Fornecedor" />
                </th>
                <th className="w-24 min-w-fit px-3 py-2 text-left font-semibold text-muted-foreground">
                  <SortHeader column="tier" label="Tier" />
                </th>
                <th className="w-24 min-w-fit px-3 py-2 text-left font-semibold text-muted-foreground">
                  <SortHeader column="context" label="Contexto" />
                </th>
                <th className="w-20 min-w-fit px-3 py-2 text-left font-semibold text-muted-foreground">
                  Saída
                </th>
                <th className="w-16 min-w-fit px-3 py-2 text-left font-semibold text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredModels.map((model) => (
                <tr
                  key={model.id}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => onSelectModel?.(model.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectModel?.(model.id);
                    }
                  }}
                >
                  <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(model.id)}
                      onCheckedChange={() => toggleSelect(model.id)}
                    />
                  </td>
                  <td className="cursor-pointer truncate px-3 py-2 font-medium text-foreground/90 transition-colors hover:text-primary">
                    <div>
                      <p className="font-semibold">{model.name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {model.model_id}
                      </p>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-foreground/80">
                    <div className="flex items-center gap-2">
                      <span>{getProviderEmoji(model.provider_id, providers)}</span>
                      <span className="text-xs">
                        {getProviderName(model.provider_id, providers)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {model.tier && (
                      <Badge
                        variant="outline"
                        className={cn(
                          'border-0 text-[10px] font-semibold',
                          TIER_COLORS[model.tier],
                        )}
                      >
                        {model.tier.charAt(0).toUpperCase() + model.tier.slice(1)}
                      </Badge>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-foreground/80">
                    {formatTokens(model.context_window)}
                  </td>
                  <td className="px-3 py-2 font-mono text-foreground/80">
                    {formatTokens(model.max_tokens)}
                  </td>
                  <td className="px-3 py-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        'border-0 text-[10px] font-semibold',
                        STATUS_COLORS[model.is_active ? 'active' : 'inactive'],
                      )}
                    >
                      {model.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-2 md:hidden">
        {filteredModels.map((model) => (
          <Card
            key={model.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => onSelectModel?.(model.id)}
          >
            <CardContent className="p-3">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div
                  role="presentation"
                  className="min-w-0 flex-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={selectedIds.has(model.id)}
                    onCheckedChange={() => toggleSelect(model.id)}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{model.name}</p>
                  <p className="truncate font-mono text-[10px] text-muted-foreground">
                    {model.model_id}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getProviderEmoji(model.provider_id, providers)}</span>
                  <span className="font-medium text-foreground">
                    {getProviderName(model.provider_id, providers)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {model.tier && (
                    <Badge
                      variant="outline"
                      className={cn('border-0 text-[10px] font-semibold', TIER_COLORS[model.tier])}
                    >
                      {model.tier.charAt(0).toUpperCase() + model.tier.slice(1)}
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={cn(
                      'border-0 text-[10px] font-semibold',
                      STATUS_COLORS[model.is_active ? 'active' : 'inactive'],
                    )}
                  >
                    {model.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-border/30 pt-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Contexto:</p>
                    <p className="font-mono font-medium">{formatTokens(model.context_window)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Saída:</p>
                    <p className="font-mono font-medium">{formatTokens(model.max_tokens)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredModels.length === 0 && models.length > 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum modelo encontrado com os filtros aplicados
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
