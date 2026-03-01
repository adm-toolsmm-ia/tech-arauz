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
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface RevisionTabProps {
  reviews: any[];
  setReviews: (reviews: any[]) => void;
  availableModels: any[];
}

export function RevisionsTab({ reviews, setReviews, availableModels }: RevisionTabProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
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

  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="Nenhuma revisão de governança"
        description="As revisões de modelos aparecerão aqui quando forem registradas."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Revisões</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Modelo</TableHead>
              <TableHead>Revisor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Notas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => {
              const model = availableModels.find((m) => m.id === review.model_id);
              return (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">{model?.name || review.model_id}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{review.reviewer_id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(review.status)}>
                      {review.status === 'approved' && '✅'}
                      {review.status === 'rejected' && '❌'}
                      {review.status === 'pending' && '⏳'}
                      {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(review.reviewed_at)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{review.notes || '-'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
