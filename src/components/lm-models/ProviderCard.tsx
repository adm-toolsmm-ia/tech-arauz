'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import type { LmProvider, LmModel } from '@/types/agents';

interface ProviderCardProps {
  provider: LmProvider;
  modelCount?: number;
  recentModels?: LmModel[];
  onEdit?: (provider: LmProvider) => void;
  onDelete?: (e: React.MouseEvent, provider: LmProvider) => void;
}

export function ProviderCard({
  provider,
  modelCount = 0,
  recentModels = [],
  onEdit,
  onDelete,
}: ProviderCardProps) {
  const statusBadgeColor = provider.is_active
    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
    : 'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400';

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-lg border transition-colors',
        'hover:bg-muted/50 p-4',
        'cursor-default'
      )}
    >
      {/* Barra lateral colorida */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
        style={{ backgroundColor: provider.color_hex || '#64748B' }}
      />

      <div className="flex-1 space-y-3 pl-1">
        {/* SEÇÃO 1: HEADER - Nome + emoji + status */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">{provider.icon_emoji || '🤖'}</span>
              <h3 className="font-semibold text-sm text-foreground">{provider.name}</h3>
            </div>
            <p className="text-xs font-mono text-muted-foreground">{provider.slug}</p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              'whitespace-nowrap text-[10px] font-semibold border',
              statusBadgeColor
            )}
          >
            {provider.is_active ? '✅ Ativo' : '⭕ Inativo'}
          </Badge>
        </div>

        {/* SEÇÃO 2: API ENDPOINT */}
        {provider.api_endpoint && (
          <div className="space-y-1 border-t border-border/30 pt-2">
            <p className="text-[10px] text-muted-foreground">API Endpoint:</p>
            <p className="text-xs font-mono text-foreground truncate">{provider.api_endpoint}</p>
          </div>
        )}

        {/* SEÇÃO 3: COUNT DE MODELOS */}
        <div className="space-y-1 border-t border-border/30 pt-2">
          <p className="text-[10px] text-muted-foreground">Modelos ativos:</p>
          <p className="text-sm font-semibold text-foreground">{modelCount}</p>
        </div>

        {/* SEÇÃO 4: TOP 3 MODELOS RECENTES */}
        {recentModels.length > 0 && (
          <div className="space-y-1 border-t border-border/30 pt-2">
            <p className="text-[10px] text-muted-foreground">Últimos modelos:</p>
            <ul className="space-y-1">
              {recentModels.slice(0, 3).map((model) => (
                <li key={model.id} className="flex items-center justify-between text-xs">
                  <span className="truncate text-foreground">{model.name}</span>
                  {model.tier && (
                    <Badge
                      variant="outline"
                      className="text-[9px] ml-1 whitespace-nowrap"
                    >
                      {model.tier}
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* SEÇÃO 5: FOOTER - Ações */}
        <div className="flex items-center justify-between border-t border-border/30 pt-2">
          <Badge variant="outline" className="text-[10px] bg-blue-50 dark:bg-blue-900/20">
            🔌 Provider
          </Badge>

          {/* Ações */}
          <div role="presentation" className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="Editar Provider"
                onClick={() => onEdit(provider)}
              >
                <Edit2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="Deletar Provider"
                onClick={(e) => onDelete(e, provider)}
              >
                <Trash2 className="h-3.5 w-3.5 text-red-500 hover:text-red-600" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
