'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import type { OrgProcessSla } from '@/types/organization';

interface ProcessSlaModalProps {
  processId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  slaToEdit?: OrgProcessSla | null;
  mode: 'create' | 'edit';
}

export function ProcessSlaModal({
  processId,
  isOpen,
  onClose,
  onSave,
  slaToEdit,
  mode,
}: ProcessSlaModalProps) {
  const [metricName, setMetricName] = useState('');
  const [targetDuration, setTargetDuration] = useState('');
  const [warningThreshold, setWarningThreshold] = useState('');
  const [criticalThreshold, setCriticalThreshold] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && slaToEdit) {
      setMetricName(slaToEdit.metric_name);
      setTargetDuration(String(slaToEdit.target_duration_days));
      setWarningThreshold(String(slaToEdit.warning_threshold_pct));
      setCriticalThreshold(String(slaToEdit.critical_threshold_pct));
      setDescription('');
    } else {
      resetForm();
    }
    setError(null);
  }, [isOpen, mode, slaToEdit]);

  const resetForm = () => {
    setMetricName('');
    setTargetDuration('');
    setWarningThreshold('');
    setCriticalThreshold('');
    setDescription('');
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!metricName.trim()) {
      setError('Métrica é obrigatória');
      return false;
    }

    const targetNum = parseInt(targetDuration, 10);
    if (!targetDuration || isNaN(targetNum) || targetNum <= 0) {
      setError('Duração alvo deve ser um número maior que 0');
      return false;
    }

    const warningNum = parseInt(warningThreshold, 10);
    if (!warningThreshold || isNaN(warningNum) || warningNum < 0 || warningNum > 100) {
      setError('Threshold de aviso deve estar entre 0 e 100');
      return false;
    }

    const criticalNum = parseInt(criticalThreshold, 10);
    if (!criticalThreshold || isNaN(criticalNum) || criticalNum < 0 || criticalNum > 100) {
      setError('Threshold crítico deve estar entre 0 e 100');
      return false;
    }

    if (warningNum >= criticalNum) {
      setError('Threshold de aviso deve ser menor que o crítico');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (mode === 'create') {
        const { createProcessSlaAction } = await import('@/app/actions/organization');
        const result = await createProcessSlaAction(
          processId,
          metricName,
          parseInt(targetDuration, 10),
          parseInt(warningThreshold, 10),
          parseInt(criticalThreshold, 10),
          description || undefined
        );

        if (result.success) {
          resetForm();
          onSave?.();
          onClose();
        } else {
          setError(result.message);
        }
      } else {
        if (!slaToEdit) return;
        const { updateProcessSlaAction } = await import('@/app/actions/organization');
        const result = await updateProcessSlaAction(slaToEdit.id, {
          metricName,
          targetDurationDays: parseInt(targetDuration, 10),
          warningThresholdPct: parseInt(warningThreshold, 10),
          criticalThresholdPct: parseInt(criticalThreshold, 10),
          description: description || undefined,
        });

        if (result.success) {
          resetForm();
          onSave?.();
          onClose();
        } else {
          setError(result.message);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar SLA');
    } finally {
      setIsLoading(false);
    }
  };

  const title = mode === 'create' ? 'Criar novo SLA' : 'Editar SLA';
  const description_text =
    mode === 'create'
      ? 'Defina um novo Service Level Agreement para este processo'
      : 'Atualize os detalhes deste SLA';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description_text}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="metric-name">Métrica *</Label>
            <Input
              id="metric-name"
              placeholder="Ex: tempo_conclusão, qualidade_resultado"
              value={metricName}
              onChange={(e) => setMetricName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-duration">Duração Alvo (dias) *</Label>
            <Input
              id="target-duration"
              type="number"
              min="1"
              placeholder="Ex: 5"
              value={targetDuration}
              onChange={(e) => setTargetDuration(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="warning-threshold">Threshold de Aviso (%) *</Label>
            <Input
              id="warning-threshold"
              type="number"
              min="0"
              max="100"
              placeholder="Ex: 75"
              value={warningThreshold}
              onChange={(e) => setWarningThreshold(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="critical-threshold">Threshold Crítico (%) *</Label>
            <Input
              id="critical-threshold"
              type="number"
              min="0"
              max="100"
              placeholder="Ex: 95"
              value={criticalThreshold}
              onChange={(e) => setCriticalThreshold(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Notas sobre este SLA (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Criar' : 'Atualizar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
