'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Bot,
  ArrowLeft,
  Activity,
  Clock,
  DollarSign,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { KPICard } from '@/components/dashboard/KPICard';
import { TraceList, TraceTimeline, type Agent, type Trace } from '@/components/agents';
import { SplitView } from '@/components/views/SplitView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface AgentDetailContentProps {
  agent: Record<string, unknown>;
  traces: Array<Record<string, unknown>>;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  active: {
    label: 'Ativo',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  },
  inactive: {
    label: 'Inativo',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
  },
  development: {
    label: 'Em Desenvolvimento',
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  },
  deprecated: {
    label: 'Descontinuado',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  },
};

const typeLabels: Record<string, string> = {
  automation: 'Automação',
  analysis: 'Análise',
  integration: 'Integração',
  assistant: 'Assistente',
};

export function AgentDetailContent({
  agent: rawAgent,
  traces: rawTraces,
}: AgentDetailContentProps) {
  const agent = rawAgent as unknown as Agent;
  const traces = rawTraces as unknown as Trace[];
  const [selectedTrace, setSelectedTrace] = React.useState<Trace | null>(null);

  const status = statusConfig[agent.status] || statusConfig.inactive;

  return (
    <div className="flex flex-col">
      <DashboardHeader title={agent.name} subtitle={agent.description} />

      <div className="flex-1 space-y-6 p-6">
        {/* Back button */}
        <Button variant="ghost" size="sm" asChild>
          <Link href="/agentes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Agentes
          </Link>
        </Button>

        {/* Agent info card */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold">{agent.name}</h2>
                  <span className="text-sm text-muted-foreground">v{agent.version}</span>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      status.className,
                    )}
                  >
                    {status.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{agent.description}</p>
                <p className="text-xs text-muted-foreground">
                  Tipo: {typeLabels[agent.type] || agent.type} | Criado em:{' '}
                  {new Date(agent.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard title="Execuções" value={agent.total_runs} icon={Activity} />
          <KPICard
            title="Taxa de Sucesso"
            value={`${agent.success_rate}%`}
            icon={TrendingUp}
            trend={{
              value: agent.success_rate >= 90 ? 'Saudável' : 'Atenção',
              positive: agent.success_rate >= 90,
            }}
          />
          <KPICard
            title="Latência Média"
            value={`${(agent.avg_latency_ms / 1000).toFixed(1)}s`}
            icon={Clock}
          />
          <KPICard
            title="Custo Total"
            value={`$${agent.total_cost_usd.toFixed(2)}`}
            icon={DollarSign}
          />
        </div>

        {/* Tabs: Traces */}
        <Tabs defaultValue="traces">
          <TabsList>
            <TabsTrigger value="traces">Execuções ({traces.length})</TabsTrigger>
            <TabsTrigger value="config">Configuração</TabsTrigger>
          </TabsList>

          <TabsContent value="traces" className="mt-4">
            <TraceList traces={traces} onTraceClick={(trace) => setSelectedTrace(trace)} />
          </TabsContent>

          <TabsContent value="config" className="mt-4">
            <Card>
              <CardContent className="space-y-4 p-5">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID do Agente</label>
                  <p className="font-mono text-sm">{agent.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Versão</label>
                  <p>{agent.version}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                  <p>{typeLabels[agent.type] || agent.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p>{status.label}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Trace detail SplitView */}
        <SplitView
          isOpen={!!selectedTrace}
          onClose={() => setSelectedTrace(null)}
          title="Detalhes da Execução"
          subtitle={selectedTrace?.id}
          width="lg"
        >
          {selectedTrace && (
            <div className="space-y-6">
              {/* Input */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Input</label>
                <p className="mt-1 text-sm">{selectedTrace.input_preview}</p>
              </div>

              {/* Output */}
              {selectedTrace.output_preview && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Output</label>
                  <p className="mt-1 text-sm">{selectedTrace.output_preview}</p>
                </div>
              )}

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Duração</label>
                  <p className="font-medium">
                    {selectedTrace.duration_ms
                      ? `${(selectedTrace.duration_ms / 1000).toFixed(1)}s`
                      : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Tokens</label>
                  <p className="font-medium">{selectedTrace.tokens_used}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Custo</label>
                  <p className="font-medium">${selectedTrace.cost_usd.toFixed(4)}</p>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <label className="mb-3 block text-sm font-medium text-muted-foreground">
                  Pipeline de Execução
                </label>
                <TraceTimeline steps={selectedTrace.steps} />
              </div>

              {/* LangSmith link */}
              {selectedTrace.trace_url && (
                <a
                  href={selectedTrace.trace_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver no LangSmith
                </a>
              )}
            </div>
          )}
        </SplitView>
      </div>
    </div>
  );
}
