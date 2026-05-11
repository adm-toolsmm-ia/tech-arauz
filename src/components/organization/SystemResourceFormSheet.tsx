'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Puzzle, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  createSystemResourceAction,
  updateSystemResourceAction,
} from '@/app/actions/organization';
import type { OrgSystemResource } from '@/types/organization';

interface SystemResourceFormSheetProps {
  mode: 'create' | 'edit';
  systemId?: string;
  systemName?: string;
  initialData?: OrgSystemResource;
  isOpen?: boolean;
  onClose?: () => void;
  onSaved?: (saved: OrgSystemResource) => void;
}

interface FormData {
  name: string;
  description: string;
}

const defaultFormData: FormData = {
  name: '',
  description: '',
};

export function SystemResourceFormSheet({
  mode,
  systemId,
  systemName,
  initialData,
  isOpen = true,
  onClose,
  onSaved,
}: SystemResourceFormSheetProps) {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFormData({
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
    });
  }, [initialData, isOpen]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (mode === 'create' && !systemId) {
      toast.error('Sistema de destino não informado');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
      };

      const result =
        mode === 'create'
          ? await createSystemResourceAction({
              system_id: systemId!,
              ...payload,
            })
          : await updateSystemResourceAction(initialData!.id, payload);

      if (!result.success || !result.data) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      onSaved?.(result.data);
      onClose?.();
    } catch (error) {
      toast.error(`Erro ao salvar: ${error instanceof Error ? error.message : 'desconhecido'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <SheetContent side="right" className="w-full border-l p-0 sm:max-w-2xl">
        <SheetHeader className="border-b px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex size-11 items-center justify-center rounded-xl bg-slate-500/10 text-slate-700">
              <Puzzle className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-2xl font-semibold">
                {mode === 'create' ? 'Adicionar recurso ao sistema' : 'Editar recurso do sistema'}
              </SheetTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Estruture módulos, integrações e componentes vinculados ao sistema operacional.
              </p>
              {systemName && (
                <div className="mt-3">
                  <Badge variant="outline">Sistema: {systemName}</Badge>
                </div>
              )}
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-176px)]">
          <div className="space-y-6 px-6 py-6">
            <Card className="border-dashed">
              <CardContent className="grid gap-3 p-4 md:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Cadastro
                  </p>
                  <p className="mt-2 text-sm font-medium">
                    {mode === 'create' ? 'Novo recurso' : initialData?.name || 'Recurso'}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Sistema alvo
                  </p>
                  <p className="mt-2 text-sm font-medium">{systemName || 'Não informado'}</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-2">
              <Label htmlFor="system-resource-name">Nome *</Label>
              <Input
                id="system-resource-name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ex.: API de autenticação, módulo financeiro"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="system-resource-description">Descrição</Label>
              <Textarea
                id="system-resource-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Explique a função operacional deste recurso"
                rows={4}
              />
            </div>
          </div>
        </ScrollArea>

        <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !formData.name.trim()}>
            {isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
            {mode === 'create' ? 'Adicionar recurso' : 'Salvar alterações'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
