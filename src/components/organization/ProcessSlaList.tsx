'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Edit2, Trash2, AlertCircle } from 'lucide-react';
import type { OrgProcessSla } from '@/types/organization';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ProcessSlaListProps {
  slas?: OrgProcessSla[];
  isLoading?: boolean;
  onEdit?: (sla: OrgProcessSla) => void;
  onDeleteSuccess?: () => void;
}

export function ProcessSlaList({
  slas = [],
  isLoading = false,
  onEdit,
  onDeleteSuccess,
}: ProcessSlaListProps) {
  const [slaToDelete, setSlaToDelete] = useState<OrgProcessSla | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = useCallback(async () => {
    if (!slaToDelete) return;

    setIsDeleting(true);
    try {
      const { deleteProcessSlaAction } = await import('@/app/actions/organization');
      const result = await deleteProcessSlaAction(slaToDelete.id);

      if (result.success) {
        setSlaToDelete(null);
        onDeleteSuccess?.();
      } else {
        console.error('Error deleting SLA:', result.message);
      }
    } catch (error) {
      console.error('Error deleting SLA:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [slaToDelete, onDeleteSuccess]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            SLAs do Processo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (slas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            SLAs do Processo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhum SLA definido para este processo.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            SLAs do Processo — {slas.length}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {slas.map((sla) => (
              <div key={sla.id} className="flex items-start gap-4 rounded-md border p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-sm">{sla.metric_name}</p>
                    <Badge variant="outline" className="text-xs">
                      {sla.target_duration_days}d
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div>
                      <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                        Aviso: {sla.warning_threshold_pct}%
                      </span>
                    </div>
                    <div>
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        Crítico: {sla.critical_threshold_pct}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(sla)}
                    disabled={isDeleting}
                    aria-label={`Editar SLA ${sla.metric_name}`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSlaToDelete(sla)}
                    disabled={isDeleting}
                    aria-label={`Deletar SLA ${sla.metric_name}`}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!slaToDelete} onOpenChange={(open) => !open && setSlaToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar SLA?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o SLA &quot;{slaToDelete?.metric_name}&quot;? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting}>
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Deletar
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
