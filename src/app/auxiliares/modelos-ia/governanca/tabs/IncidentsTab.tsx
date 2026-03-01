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
import { AlertCircle } from 'lucide-react';

interface IncidentsTabProps {
  incidents: any[];
  setIncidents: (incidents: any[]) => void;
  availableModels: any[];
}

export function IncidentsTab({ incidents, setIncidents, availableModels }: IncidentsTabProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (incidents.length === 0) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Nenhum incidente registrado"
        description="Os incidentes de modelos aparecerão aqui quando forem reportados."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Incidentes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Modelo</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Iniciado em</TableHead>
              <TableHead>Resolvido em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incidents.map((incident) => {
              const model = availableModels.find((m) => m.id === incident.model_id);
              return (
                <TableRow key={incident.id}>
                  <TableCell className="font-medium">{model?.name || incident.model_id}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getSeverityColor(incident.severity)}>
                      {incident.severity.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{incident.title}</TableCell>
                  <TableCell className="text-sm">{formatDate(incident.started_at)}</TableCell>
                  <TableCell className="text-sm">
                    {incident.resolved_at ? formatDate(incident.resolved_at) : '🔴 Ativo'}
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
