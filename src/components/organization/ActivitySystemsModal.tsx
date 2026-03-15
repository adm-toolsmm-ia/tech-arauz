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
import { Badge } from '@/components/ui/badge';
import { X, Loader2 } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import type { OrgSystem } from '@/types/organization';

interface ActivitySystem {
  system_id: string;
  system_name: string;
  usage_context?: string;
}

interface ActivitySystemsModalProps {
  activityId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  availableSystems: OrgSystem[];
}

/**
 * ActivitySystemsModal Component
 *
 * Modal for managing Activity-System relationships with:
 * - Display current systems with remove buttons
 * - Autocomplete to select new system
 * - Usage context text field
 * - Add/remove buttons with lifecycle
 * - RLS validation on server actions
 *
 * Story 11.8: Activity-System Relationship UI
 */
export function ActivitySystemsModal({
  activityId,
  isOpen,
  onClose,
  onSave,
  availableSystems,
}: ActivitySystemsModalProps) {
  const [currentSystems, setCurrentSystems] = useState<ActivitySystem[]>([]);
  const [selectedSystemId, setSelectedSystemId] = useState<string>('');
  const [usageContext, setUsageContext] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isOpen_dropdown, setIsOpen_dropdown] = useState(false);

  // Fetch current systems on mount or when activityId changes
  useEffect(() => {
    if (isOpen && activityId) {
      fetchCurrentSystems();
    }
  }, [isOpen, activityId]);

  const fetchCurrentSystems = async () => {
    setIsFetching(true);
    try {
      // TODO: Call getActivitySystemsAction(activityId)
      // const result = await getActivitySystemsAction(activityId);
      // if (result.success && result.data) {
      //   setCurrentSystems(result.data);
      // }
    } catch (error) {
      console.error('Error fetching current systems:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleAddSystem = async () => {
    if (!selectedSystemId) return;

    setIsLoading(true);
    try {
      const system = availableSystems.find((s) => s.id === selectedSystemId);
      if (!system) return;

      // TODO: Call addActivitySystemAction(activityId, selectedSystemId, usageContext)
      // Phase 3: Implement server action with:
      // - Tenant isolation via auth context
      // - RLS policy validation
      // - Audit logging for activity_systems junction
      // - Revalidation of /organizacao path
      // const result = await addActivitySystemAction(activityId, selectedSystemId, usageContext);
      // if (result.success) {
      //   setCurrentSystems([...currentSystems, {
      //     system_id: selectedSystemId,
      //     system_name: system.name,
      //     usage_context: usageContext,
      //   }]);
      //   setSelectedSystemId('');
      //   setUsageContext('');
      // } else {
      //   console.error(result.message);
      // }

      // Temporary: Log success for development
      console.log(`System ${selectedSystemId} would be added (Phase 3: implement action)`);
    } catch (error) {
      console.error('Error adding system:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSystem = async (systemId: string) => {
    setIsLoading(true);
    try {
      // TODO: Call removeActivitySystemAction(activityId, systemId)
      // const result = await removeActivitySystemAction(activityId, systemId);
      // if (result.success) {
      //   setCurrentSystems(currentSystems.filter((s) => s.system_id !== systemId));
      // }
    } catch (error) {
      console.error('Error removing system:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // All changes saved immediately via action handlers
      onSave?.();
      onClose();
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedSystem = availableSystems.find((s) => s.id === selectedSystemId);
  const availableSystemsForAdd = availableSystems.filter(
    (s) => !currentSystems.some((cs) => cs.system_id === s.id)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Sistemas da Atividade</DialogTitle>
          <DialogDescription>
            Adicione ou remova sistemas relacionados a esta atividade e defina o contexto de uso.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Systems */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Sistemas Atual</Label>
            {isFetching ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : currentSystems.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum sistema adicionado ainda.</p>
            ) : (
              <div className="space-y-2">
                {currentSystems.map((system) => (
                  <div
                    key={system.system_id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{system.system_name}</p>
                      {system.usage_context && (
                        <p className="text-xs text-muted-foreground mt-1">{system.usage_context}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSystem(system.system_id)}
                      disabled={isLoading}
                      aria-label={`Remover ${system.system_name}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New System */}
          <div className="space-y-3 border-t pt-4">
            <Label className="text-base font-semibold">Adicionar Sistema</Label>

            {/* System Selection */}
            <div className="space-y-2">
              <Label htmlFor="system-select" className="text-sm">
                Sistema
              </Label>
              <div className="relative">
                <button
                  onClick={() => setIsOpen_dropdown(!isOpen_dropdown)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {selectedSystem ? selectedSystem.name : 'Selecione um sistema...'}
                </button>

                {isOpen_dropdown && availableSystemsForAdd.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border border-input bg-popover shadow-md max-h-60 overflow-y-auto">
                    <Command>
                      <CommandList>
                        <CommandEmpty>Nenhum sistema disponível.</CommandEmpty>
                        <CommandGroup>
                          {availableSystemsForAdd.map((system) => (
                            <CommandItem
                              key={system.id}
                              value={system.id}
                              onSelect={() => {
                                setSelectedSystemId(system.id);
                                setIsOpen_dropdown(false);
                              }}
                              className="cursor-pointer"
                            >
                              <div className="flex flex-col gap-0.5 flex-1">
                                <span className="font-medium">{system.name}</span>
                                {system.description && (
                                  <span className="text-xs text-muted-foreground">
                                    {system.description}
                                  </span>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </div>
                )}
              </div>
            </div>

            {/* Usage Context */}
            <div className="space-y-2">
              <Label htmlFor="usage-context" className="text-sm">
                Contexto de Uso (opcional)
              </Label>
              <Input
                id="usage-context"
                placeholder="Ex: Sincronização de dados, Relatórios..."
                value={usageContext}
                onChange={(e) => setUsageContext(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Add Button */}
            <Button
              onClick={handleAddSystem}
              disabled={!selectedSystemId || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                'Adicionar Sistema'
              )}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
