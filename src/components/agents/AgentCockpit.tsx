'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Cpu, MessageCircle, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import type { LmProvider, AgentType } from '@/types/agents';
import type { UIAgent } from '@/lib/transformers/agent';
import { AgentMetrics360 } from '@/components/agents/AgentMetrics360';

interface AgentCockpitProps {
  agent: UIAgent;
  agentTypes?: AgentType[];
  providers?: LmProvider[];
  onEdit?: () => void;
}

function InfoField({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || '-'}</p>
    </div>
  );
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
}

const statusBadgeColor = {
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
  published: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
  deprecated: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
};

export function AgentCockpit({
  agent,
  agentTypes = [],
  providers = [],
  onEdit,
}: AgentCockpitProps) {
  const selectedType = useMemo(
    () => agentTypes.find((t) => t.id === agent.agentTypeId),
    [agent.agentTypeId, agentTypes],
  );

  const selectedProvider = useMemo(
    () => providers.find((p) => p.slug === agent.fullConfig.modelProvider),
    [agent.fullConfig.modelProvider, providers],
  );

  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Badge className={`text-xs ${statusBadgeColor[agent.status as keyof typeof statusBadgeColor]}`}>
            {agent.status === 'draft' && '📝 Rascunho'}
            {agent.status === 'published' && '✅ Publicado'}
            {agent.status === 'deprecated' && '⛔ Deprecado'}
          </Badge>
          {selectedType && (
            <Badge variant="outline" className="text-xs">
              {selectedType.icon_emoji} {selectedType.name}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {agent.status === 'published' && (
            <Link href={`/agentes/${agent.id}/chat`}>
              <Button variant="default" size="sm" className="gap-2">
                <MessageCircle className="size-4" />
                Testar Chat
              </Button>
            </Link>
          )}
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit} className="gap-2">
              <ExternalLink className="size-4" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="model">Modelo</TabsTrigger>
          <TabsTrigger value="persona">Persona</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
        </TabsList>

        {/* TAB 1: GENERAL */}
        <TabsContent value="general" className="mt-4 space-y-4">
          <div className="space-y-4">
            <InfoField label="Nome" value={agent.name} />
            <InfoField label="Slug" value={agent.slug} />
            <InfoField label="Descrição" value={agent.description || undefined} />

            <Separator className="my-4" />

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Classificação</h4>
              <InfoField
                label="Tipo de Uso"
                value={agent.usageType === 'chatbot' ? '🗨️ Chatbot' : '⚙️ Workflow'}
              />
              {agent.usageType === 'chatbot' && (
                <>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Exibir no Atalho Global</p>
                    <p className="text-sm font-medium">{agent.showInShortcut ? '✅ Sim' : '❌ Não'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Chatbot Global</p>
                    <p className="text-sm font-medium">{agent.isGlobalChatbot ? '✅ Sim' : '❌ Não'}</p>
                  </div>
                </>
              )}
            </div>

            {agent.tags && agent.tags.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {agent.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-4" />

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoField label="Criado em" value={formatDate(agent.createdAt)} />
              <InfoField label="Atualizado em" value={formatDate(agent.updatedAt)} />
            </div>

            <Separator className="my-4" />

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoField label="Execuções" value={agent.executionCount} />
              <InfoField
                label="Última execução"
                value={
                  agent.lastExecutionAt
                    ? formatDate(agent.lastExecutionAt)
                    : 'Nunca executado'
                }
              />
            </div>

            {agent.owners && agent.owners.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Owners</p>
                <div className="flex flex-wrap gap-1">
                  {agent.owners.map((owner: string) => (
                    <Badge key={owner} variant="outline" className="text-xs">
                      {owner}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                {advancedOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                Avançado (requirements, output_schema, validation_rules)
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-3 pl-6">
                {agent.fullConfig.requirements && agent.fullConfig.requirements.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Requisitos</p>
                    <ul className="list-inside list-disc text-sm">
                      {agent.fullConfig.requirements.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {agent.fullConfig.outputSchema && Object.keys(agent.fullConfig.outputSchema).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Output Schema</p>
                    <pre className="rounded-md bg-muted p-2 text-xs overflow-x-auto">
                      {JSON.stringify(agent.fullConfig.outputSchema, null, 2)}
                    </pre>
                  </div>
                )}
                {agent.fullConfig.validationRules && Object.keys(agent.fullConfig.validationRules).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Regras de Validação</p>
                    <pre className="rounded-md bg-muted p-2 text-xs overflow-x-auto">
                      {JSON.stringify(agent.fullConfig.validationRules, null, 2)}
                    </pre>
                  </div>
                )}
                {(!agent.fullConfig.requirements?.length && !agent.fullConfig.outputSchema && (!agent.fullConfig.validationRules || Object.keys(agent.fullConfig.validationRules).length === 0)) && (
                  <p className="text-xs text-muted-foreground">Nenhum dado avançado configurado.</p>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </TabsContent>

        {/* TAB 2: MODEL */}
        <TabsContent value="model" className="mt-4 space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">Configuração LLM</h4>
            </div>

            <Separator />

            <InfoField
              label="Provider"
              value={selectedProvider ? `${selectedProvider.icon_emoji} ${selectedProvider.name}` : agent.fullConfig.modelProvider}
            />
            <InfoField label="Modelo" value={agent.modelId} />

            <Separator />

            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Temperatura</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${(agent.fullConfig.modelTemperature / 2) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-sm">
                    {agent.fullConfig.modelTemperature.toFixed(1)}
                  </span>
                </div>
              </div>

              <InfoField
                label="Max Tokens"
                value={agent.fullConfig.modelMaxTokens}
              />
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: PERSONA */}
        <TabsContent value="persona" className="mt-4 space-y-4">
          <div className="space-y-4">
            {agent.fullConfig.persona && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-semibold">Persona</p>
                <p className="text-sm whitespace-pre-wrap text-foreground">
                  {agent.fullConfig.persona}
                </p>
              </div>
            )}

            {agent.fullConfig.promptObjective && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-semibold">Objetivo</p>
                  <p className="text-sm whitespace-pre-wrap text-foreground">
                    {agent.fullConfig.promptObjective}
                  </p>
                </div>
              </>
            )}

            {agent.fullConfig.promptInstructions &&
              agent.fullConfig.promptInstructions.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-semibold">Instruções</p>
                    <p className="text-sm whitespace-pre-wrap text-foreground">
                      {Array.isArray(agent.fullConfig.promptInstructions)
                        ? agent.fullConfig.promptInstructions.join('\n')
                        : String(agent.fullConfig.promptInstructions)}
                    </p>
                  </div>
                </>
              )}

            {agent.fullConfig.promptTemplate && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-semibold">
                    Template de Prompt
                  </p>
                  <div className="rounded-md bg-muted p-3">
                    <code className="text-xs whitespace-pre-wrap text-foreground">
                      {agent.fullConfig.promptTemplate}
                    </code>
                  </div>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* TAB 4: METRICS */}
        <TabsContent value="metrics" className="mt-4">
          <AgentMetrics360 agentId={agent.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
