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
import { History } from 'lucide-react';

interface ChangelogTabProps {
  changelog: any[];
  availableModels: any[];
}

export function ChangelogTab({ changelog, availableModels }: ChangelogTabProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (changelog.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="Nenhuma alteração registrada"
        description="O histórico de mudanças aparecerá aqui quando forem realizadas alterações."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Mudanças</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Modelo</TableHead>
              <TableHead>Tipo de Mudança</TableHead>
              <TableHead>Valor Anterior</TableHead>
              <TableHead>Novo Valor</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {changelog.map((entry) => {
              const model = availableModels.find((m) => m.id === entry.model_id);
              return (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{model?.name || entry.model_id}</TableCell>
                  <TableCell className="text-sm">{entry.change_type}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {typeof entry.old_value === 'object'
                      ? JSON.stringify(entry.old_value).slice(0, 30) + '...'
                      : String(entry.old_value)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {typeof entry.new_value === 'object'
                      ? JSON.stringify(entry.new_value).slice(0, 30) + '...'
                      : String(entry.new_value)}
                  </TableCell>
                  <TableCell className="text-sm">{entry.change_reason || '-'}</TableCell>
                  <TableCell className="text-sm">{formatDate(entry.changed_at)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
