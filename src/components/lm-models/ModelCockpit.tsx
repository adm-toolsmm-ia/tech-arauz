'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Cpu, FileText, DollarSign } from 'lucide-react';
import type { LmModel, LmProvider } from '@/types/agents';

interface ModelCockpitProps {
  model: LmModel & { lm_providers?: LmProvider };
  provider?: LmProvider;
  onEdit?: () => void;
}

function InfoField({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? '-'}</p>
    </div>
  );
}

function formatTokens(tokens: number | undefined): string {
  if (!tokens) return '-';
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}K`;
  return tokens.toString();
}

const TIER_BADGE: Record<string, { emoji: string; label: string }> = {
  entry: { emoji: '🚀', label: 'Entry' },
  balanced: { emoji: '⚡', label: 'Balanced' },
  pro: { emoji: '💎', label: 'Pro' },
  flagship: { emoji: '👑', label: 'Flagship' },
};

export function ModelCockpit({ model, provider, onEdit }: ModelCockpitProps) {
  const p = provider ?? model.lm_providers;
  const tierInfo = model.tier ? TIER_BADGE[model.tier] : null;

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className={
              model.is_active
                ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
            }
          >
            {model.is_active ? '✅ Ativo' : '⛔ Inativo'}
          </Badge>
          {tierInfo && (
            <Badge variant="outline" className="text-xs">
              {tierInfo.emoji} {tierInfo.label}
            </Badge>
          )}
          {p && (
            <Badge variant="outline" className="text-xs">
              {p.icon_emoji || '🤖'} {p.name}
            </Badge>
          )}
        </div>
        {onEdit && !model.is_system && (
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-2">
            <ExternalLink className="size-4" />
            Editar
          </Button>
        )}
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
          <TabsTrigger value="docs">Documentação</TabsTrigger>
        </TabsList>

        {/* TAB 1: GENERAL */}
        <TabsContent value="general" className="mt-4 space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">Informações Gerais</h4>
            </div>

            <Separator />

            <InfoField label="Nome" value={model.name} />
            <InfoField label="Model ID" value={model.model_id} />
            <InfoField label="Descrição" value={model.description ?? undefined} />
            <InfoField
              label="Provedor"
              value={p ? `${p.icon_emoji || '🤖'} ${p.name}` : undefined}
            />
          </div>
        </TabsContent>

        {/* TAB 2: CONFIG */}
        <TabsContent value="config" className="mt-4 space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">Configuração LLM</h4>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoField label="Max. Tokens" value={model.max_tokens ?? undefined} />
              <InfoField
                label="Context Window"
                value={
                  model.context_window != null
                    ? `${formatTokens(model.context_window)} tokens`
                    : undefined
                }
              />
              <InfoField
                label="Temperatura padrão"
                value={model.default_temperature ?? undefined}
              />
              <InfoField label="Tier" value={model.tier ? TIER_BADGE[model.tier]?.label : undefined} />
            </div>

            {(model.input_cost_per_1k_tokens != null ||
              model.output_cost_per_1k_tokens != null) && (
              <>
                <Separator />
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold">Custos (USD/1K tokens)</h4>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoField
                    label="Entrada"
                    value={
                      model.input_cost_per_1k_tokens != null
                        ? `$${model.input_cost_per_1k_tokens.toFixed(6)}`
                        : undefined
                    }
                  />
                  <InfoField
                    label="Saída"
                    value={
                      model.output_cost_per_1k_tokens != null
                        ? `$${model.output_cost_per_1k_tokens.toFixed(6)}`
                        : undefined
                    }
                  />
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* TAB 3: DOCS */}
        <TabsContent value="docs" className="mt-4 space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">Documentação</h4>
            </div>

            <Separator />

            {model.docs_url ? (
              <a
                href={model.docs_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary underline"
              >
                <ExternalLink className="size-4" />
                Ver documentação
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma URL de documentação cadastrada.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
