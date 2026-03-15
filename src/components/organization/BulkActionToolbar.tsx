'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Upload,
  Edit2,
  Trash2,
  MoreVertical,
  X,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BulkActionToolbarProps {
  selectedCount: number;
  entityType: string;
  onBulkUpdate?: (updates: Record<string, unknown>) => void | Promise<void>;
  onBulkDelete?: () => void | Promise<void>;
  onExport?: (format: 'csv' | 'json') => void | Promise<void>;
  onImport?: (file: File, format: 'csv' | 'json') => void | Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
}

interface BulkUpdateDialogState {
  open: boolean;
  fieldName: string;
  fieldValue: string;
  isSubmitting: boolean;
}

interface ImportState {
  open: boolean;
  file: File | null;
  format: 'csv' | 'json' | null;
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

/**
 * BulkActionToolbar
 * Story 11.13: Bulk Operations & Import/Export
 *
 * Toolbar for bulk operations on organization entities
 * - Bulk edit selected items
 * - Bulk delete with confirmation
 * - Export as CSV/JSON
 * - Import from CSV/JSON
 */
export function BulkActionToolbar({
  selectedCount,
  entityType,
  onBulkUpdate,
  onBulkDelete,
  onExport,
  onImport,
  isLoading = false,
  disabled = false,
}: BulkActionToolbarProps) {
  const [updateDialog, setUpdateDialog] = React.useState<BulkUpdateDialogState>({
    open: false,
    fieldName: '',
    fieldValue: '',
    isSubmitting: false,
  });

  const [deleteDialog, setDeleteDialog] = React.useState(false);

  const [importState, setImportState] = React.useState<ImportState>({
    open: false,
    file: null,
    format: null,
    isLoading: false,
    error: null,
    success: null,
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (selectedCount === 0) {
    return null;
  }

  const handleBulkUpdate = async () => {
    if (!updateDialog.fieldName || !updateDialog.fieldValue) {
      return;
    }

    setUpdateDialog((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const updates = {
        [updateDialog.fieldName]: updateDialog.fieldValue,
      };

      if (onBulkUpdate) {
        await onBulkUpdate(updates);
      }

      setUpdateDialog({
        open: false,
        fieldName: '',
        fieldValue: '',
        isSubmitting: false,
      });
    } catch (error) {
      console.error('Erro ao atualizar em lote:', error);
    } finally {
      setUpdateDialog((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleBulkDelete = async () => {
    try {
      if (onBulkDelete) {
        await onBulkDelete();
      }
      setDeleteDialog(false);
    } catch (error) {
      console.error('Erro ao deletar em lote:', error);
    }
  };

  const handleFileSelect = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const format = ext === 'csv' ? 'csv' : ext === 'json' ? 'json' : null;

    if (!format) {
      setImportState((prev) => ({
        ...prev,
        error: 'Formato de arquivo inválido. Use CSV ou JSON.',
      }));
      return;
    }

    setImportState((prev) => ({
      ...prev,
      file,
      format,
      error: null,
      success: null,
    }));
  };

  const handleImport = async () => {
    if (!importState.file || !importState.format) {
      return;
    }

    setImportState((prev) => ({ ...prev, isLoading: true, error: null, success: null }));

    try {
      if (onImport) {
        await onImport(importState.file, importState.format);
      }

      setImportState({
        open: false,
        file: null,
        format: null,
        isLoading: false,
        error: null,
        success: `Arquivo ${importState.file.name} importado com sucesso`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao importar arquivo';
      setImportState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
    } finally {
      setImportState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <>
      <div className="sticky bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-semibold">
              {selectedCount} selecionado{selectedCount !== 1 ? 's' : ''}
            </Badge>
            <span className="text-sm text-muted-foreground">de {entityType}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Bulk Update */}
            <Button
              variant="outline"
              size="sm"
              disabled={disabled || isLoading || selectedCount === 0}
              onClick={() => setUpdateDialog((prev) => ({ ...prev, open: true }))}
              className="gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Editar
            </Button>

            {/* Export/Import Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={disabled || isLoading}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Mais</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onExport?.('csv')}
                  disabled={disabled || isLoading || selectedCount === 0}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar como CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onExport?.('json')}
                  disabled={disabled || isLoading || selectedCount === 0}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar como JSON
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setImportState((prev) => ({ ...prev, open: true }))}
                  disabled={disabled || isLoading}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Importar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Bulk Delete */}
            <Button
              variant="destructive"
              size="sm"
              disabled={disabled || isLoading || selectedCount === 0}
              onClick={() => setDeleteDialog(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Deletar
            </Button>

            {/* Clear Selection */}
            <Button
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => window.location.reload()}
              className="ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Update Dialog */}
      <Dialog open={updateDialog.open} onOpenChange={(open) =>
        setUpdateDialog((prev) => ({ ...prev, open }))
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar {selectedCount} item(ns)</DialogTitle>
            <DialogDescription>
              Escolha um campo e valor para aplicar a {selectedCount} {entityType}(s)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="field-name">Campo</Label>
              <Input
                id="field-name"
                placeholder="Ex: name, description"
                value={updateDialog.fieldName}
                onChange={(e) =>
                  setUpdateDialog((prev) => ({ ...prev, fieldName: e.target.value }))
                }
                disabled={updateDialog.isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field-value">Valor</Label>
              <Textarea
                id="field-value"
                placeholder="Novo valor para o campo"
                value={updateDialog.fieldValue}
                onChange={(e) =>
                  setUpdateDialog((prev) => ({ ...prev, fieldValue: e.target.value }))
                }
                disabled={updateDialog.isSubmitting}
                rows={4}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() =>
                  setUpdateDialog({
                    open: false,
                    fieldName: '',
                    fieldValue: '',
                    isSubmitting: false,
                  })
                }
                disabled={updateDialog.isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleBulkUpdate}
                disabled={
                  updateDialog.isSubmitting || !updateDialog.fieldName || !updateDialog.fieldValue
                }
              >
                {updateDialog.isSubmitting ? 'Atualizando...' : `Atualizar ${selectedCount} item(ns)`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Deletar {selectedCount} item(ns)?
            </DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. {selectedCount} {entityType}(s) será(ão)
              permanentemente deletado(s).
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
            >
              Deletar Permanentemente
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importState.open} onOpenChange={(open) =>
        setImportState((prev) => ({ ...prev, open }))
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar {entityType}</DialogTitle>
            <DialogDescription>
              Selecione um arquivo CSV ou JSON para importar dados
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {importState.error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{importState.error}</span>
              </div>
            )}

            {importState.success && (
              <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700 flex items-start gap-2 dark:bg-green-950 dark:text-green-300">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{importState.success}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="file-input">Arquivo</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file-input"
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  disabled={importState.isLoading}
                  className="cursor-pointer"
                />
              </div>
              {importState.file && (
                <div className="text-sm text-muted-foreground">
                  Arquivo selecionado: {importState.file.name} ({importState.format})
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() =>
                  setImportState({
                    open: false,
                    file: null,
                    format: null,
                    isLoading: false,
                    error: null,
                    success: null,
                  })
                }
                disabled={importState.isLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleImport}
                disabled={!importState.file || importState.isLoading}
              >
                {importState.isLoading ? 'Importando...' : 'Importar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
