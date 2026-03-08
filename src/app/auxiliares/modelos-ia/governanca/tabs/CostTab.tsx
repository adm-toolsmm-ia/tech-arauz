'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/ui/EmptyState';
import { TrendingDown } from 'lucide-react';

interface CostTabProps {
  costs: any[];
  availableModels: any[];
}

export function CostTab({ costs, availableModels }: CostTabProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  if (costs.length === 0) {
    return (
      <EmptyState
        icon={TrendingDown}
        title="Nenhum monitoramento de custo"
        description="Os dados de custo por período aparecerão aqui quando forem coletados."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monitoramento de Custo</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Modelo</TableHead>
              <TableHead>Período</TableHead>
              <TableHead className="text-right">Requests</TableHead>
              <TableHead className="text-right">Tokens</TableHead>
              <TableHead className="text-right">Custo Total</TableHead>
              <TableHead className="text-right">P95 Latência</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {costs.map((cost) => {
              const model = availableModels.find((m) => m.id === cost.model_id);
              const periodStart = formatDate(cost.period_start);
              const periodEnd = formatDate(cost.period_end);
              return (
                <TableRow key={cost.id}>
                  <TableCell className="font-medium">{model?.name || cost.model_id}</TableCell>
                  <TableCell className="text-sm">
                    {periodStart} a {periodEnd}
                  </TableCell>
                  <TableCell className="text-right">
                    {cost.total_requests.toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    {cost.total_tokens.toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(cost.total_cost_usd)}
                  </TableCell>
                  <TableCell className="text-right text-sm">{cost.p95_latency_ms}ms</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
