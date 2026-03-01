'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/ui/EmptyState';
import { LinkIcon } from 'lucide-react';

interface FallbackTabProps {
  policies: any[];
  setPolicies: (policies: any[]) => void;
  availableModels: any[];
}

export function FallbackTab({ policies, setPolicies, availableModels }: FallbackTabProps) {
  if (policies.length === 0) {
    return (
      <EmptyState
        icon={LinkIcon}
        title="Nenhuma política de fallback"
        description="As políticas de fallback para modelos aparecerão aqui quando forem criadas."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Políticas de Fallback</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Modelo Principal</TableHead>
              <TableHead>Fallback</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Gatilhos</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.map((policy) => {
              const primaryModel = availableModels.find((m) => m.id === policy.primary_model_id);
              const fallbackModel = availableModels.find((m) => m.id === policy.fallback_model_id);
              return (
                <TableRow key={policy.id}>
                  <TableCell className="font-medium">{primaryModel?.name || policy.primary_model_id}</TableCell>
                  <TableCell className="font-medium">{fallbackModel?.name || policy.fallback_model_id}</TableCell>
                  <TableCell className="text-sm">{policy.priority}</TableCell>
                  <TableCell className="text-sm">
                    {Array.isArray(policy.trigger_on) ? policy.trigger_on.join(', ') : String(policy.trigger_on)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={policy.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {policy.is_active ? '✅ Ativo' : '❌ Inativo'}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
