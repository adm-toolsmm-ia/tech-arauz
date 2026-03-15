'use client';

import { useState, useCallback } from 'react';
import { FileText, Cpu, Lock, Plus, ExternalLink, X, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createLmModelAction } from '@/app/actions/lm-models';
import { updateLmProviderAction } from '@/app/actions/lm-providers';
import { toast } from 'sonner';
import type { LmProvider, LmModel } from '@/types/agents';

interface LmProviderCockpitProps {
  provider: LmProvider;
  models: LmModel[];
  onModelCreated?: (model: LmModel) => void;
  onProviderUpdated?: (provider: LmProvider) => void;
}

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || '-'}</p>
    </div>
  );
}

export function LmProviderCockpit({
  provider,
  models,
  onModelCreated,
  onProviderUpdated,
}: LmProviderCockpitProps) {
  const [isCreateModelOpen, setIsCreateModelOpen] = useState(false);
  const [modelForm, setModelForm] = useState({ name: '', model_id: '', docs_url: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: provider.name,
    description: provider.description ?? '',
    api_endpoint: provider.api_endpoint ?? '',
    docs_url: provider.docs_url ?? '',
    api_key_field_name: provider.api_key_field_name ?? 'api_key',
  });

  const handleCreateModel = useCallback(async () => {
    if (!modelForm.name.trim() || !modelForm.model_id.trim()) {
      toast.error('Nome e Model ID são obrigatórios');
      return;
    }
    setIsLoading(true);
    try {
      const result = await createLmModelAction({
        provider_id: provider.id,
        name: modelForm.name.trim(),
        model_id: modelForm.model_id.trim().toLowerCase().replace(/\s+/g, '-'),
        docs_url: modelForm.docs_url.trim() || undefined,
        is_active: true,
        is_system: false,
      });
      if (result.success && result.data) {
        onModelCreated?.(result.data);
        toast.success(result.message);
        setModelForm({ name: '', model_id: '', docs_url: '' });
        setIsCreateModelOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('Erro ao criar modelo');
    } finally {
      setIsLoading(false);
    }
  }, [provider.id, modelForm, onModelCreated]);

  const handleSaveEdit = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await updateLmProviderAction(provider.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim() || undefined,
        api_endpoint: editForm.api_endpoint.trim() || undefined,
        docs_url: editForm.docs_url.trim() || undefined,
        api_key_field_name: editForm.api_key_field_name.trim() || 'api_key',
      });
      if (result.success && result.data) {
        onProviderUpdated?.(result.data);
        toast.success(result.message);
        setIsEditing(false);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('Erro ao atualizar provedor');
    } finally {
      setIsLoading(false);
    }
  }, [provider.id, editForm, onProviderUpdated]);

  const handleCancelEdit = useCallback(() => {
    setEditForm({
      name: provider.name,
      description: provider.description ?? '',
      api_endpoint: provider.api_endpoint ?? '',
      docs_url: provider.docs_url ?? '',
      api_key_field_name: provider.api_key_field_name ?? 'api_key',
    });
    setIsEditing(false);
  }, [provider]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="detalhes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="detalhes">
            <FileText className="mr-2 size-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="modelos">
            <Cpu className="mr-2 size-4" />
            Modelos
            {models.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({models.length})</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="detalhes" className="mt-4 space-y-4">
          {/* Header with Actions (aligned with AgentCockpit) */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className={
                  provider.is_active
                    ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
                }
              >
                {provider.is_active ? '✅ Ativo' : '⛔ Inativo'}
              </Badge>
              {provider.is_system && (
                <Badge variant="outline" className="text-xs">
                  <Lock className="mr-1 size-3" />
                  Sistema
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {provider.icon_emoji || '🤖'} {provider.name}
              </Badge>
            </div>
            {!provider.is_system && onProviderUpdated && (
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                      className="gap-1"
                    >
                      <X className="size-4" />
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={isLoading}
                      className="gap-1"
                    >
                      <Check className="size-4" />
                      Salvar
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditForm({
                        name: provider.name,
                        description: provider.description ?? '',
                        api_endpoint: provider.api_endpoint ?? '',
                        docs_url: provider.docs_url ?? '',
                        api_key_field_name: provider.api_key_field_name ?? 'api_key',
                      });
                      setIsEditing(true);
                    }}
                    className="gap-1"
                  >
                    <ExternalLink className="size-4" />
                    Editar
                  </Button>
                )}
              </div>
            )}
          </div>

          <Separator />

          {isEditing ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="edit-name">Nome *</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  disabled={isLoading}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Input
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="edit-api_endpoint">Endpoint da API</Label>
                <Input
                  id="edit-api_endpoint"
                  value={editForm.api_endpoint}
                  onChange={(e) => setEditForm((p) => ({ ...p, api_endpoint: e.target.value }))}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="edit-api_key_field_name">Identificador da API Key</Label>
                <Input
                  id="edit-api_key_field_name"
                  value={editForm.api_key_field_name}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, api_key_field_name: e.target.value }))
                  }
                  disabled={isLoading}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="edit-docs_url">URL da documentação</Label>
                <Input
                  id="edit-docs_url"
                  value={editForm.docs_url}
                  onChange={(e) => setEditForm((p) => ({ ...p, docs_url: e.target.value }))}
                  disabled={isLoading}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoField label="Nome" value={provider.name} />
              <InfoField label="Slug" value={provider.slug} />
              <InfoField label="Descrição" value={provider.description} />
              <InfoField label="Endpoint da API" value={provider.api_endpoint} />
              <InfoField
                label="Identificador da API Key"
                value={provider.api_key_field_name ?? 'api_key'}
              />
              {provider.docs_url && (
                <div className="space-y-1 sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Documentação</p>
                  <a
                    href={provider.docs_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
                  >
                    {provider.docs_url}
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="modelos" className="mt-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {models.length === 0
                ? 'Nenhum modelo cadastrado para este provedor.'
                : `${models.length} modelo(s) cadastrado(s).`}
            </p>
            {!provider.is_system && (
              <Button size="sm" onClick={() => setIsCreateModelOpen(true)} className="gap-2">
                <Plus className="size-4" />
                Novo Modelo
              </Button>
            )}
          </div>
          {models.length > 0 && (
            <div className="space-y-2">
              {models
                .sort((a, b) => (a.display_order ?? 100) - (b.display_order ?? 100))
                .map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{model.name}</p>
                        {model.tier && (
                          <Badge variant="outline" className="text-xs font-semibold">
                            {model.tier === 'entry' && '🚀'}
                            {model.tier === 'balanced' && '⚡'}
                            {model.tier === 'pro' && '💎'}
                            {model.tier === 'flagship' && '👑'}{' '}
                            {model.tier.charAt(0).toUpperCase() + model.tier.slice(1)}
                          </Badge>
                        )}
                      </div>
                      <p className="font-mono text-xs text-muted-foreground">{model.model_id}</p>
                      {model.context_window != null && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Contexto: {(model.context_window / 1000).toFixed(0)}K tokens
                        </p>
                      )}
                      {model.docs_url && (
                        <a
                          href={model.docs_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary mt-1 inline-flex items-center gap-1 text-xs hover:underline"
                        >
                          Documentação
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {model.is_system && (
                        <Badge variant="outline" className="text-xs">
                          Sistema
                        </Badge>
                      )}
                      {model.is_active ? (
                        <Badge variant="secondary" className="text-xs">
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Inativo
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}

          <Dialog open={isCreateModelOpen} onOpenChange={setIsCreateModelOpen}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Novo Modelo</DialogTitle>
                <DialogDescription>
                  Adicione um novo modelo ao provedor {provider.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="model-name">Nome *</Label>
                  <Input
                    id="model-name"
                    placeholder="Ex: GPT-4o Mini"
                    value={modelForm.name}
                    onChange={(e) => setModelForm((p) => ({ ...p, name: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="model-id">Model ID *</Label>
                  <Input
                    id="model-id"
                    placeholder="Ex: gpt-4o-mini"
                    value={modelForm.model_id}
                    onChange={(e) =>
                      setModelForm((p) => ({
                        ...p,
                        model_id: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                      }))
                    }
                    disabled={isLoading}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Identificador exato usado na API do provedor
                  </p>
                </div>
                <div>
                  <Label htmlFor="model-docs-url">URL da documentação</Label>
                  <Input
                    id="model-docs-url"
                    placeholder="Ex: https://platform.openai.com/docs/models/gpt-4o-mini"
                    value={modelForm.docs_url}
                    onChange={(e) => setModelForm((p) => ({ ...p, docs_url: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateModelOpen(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button onClick={handleCreateModel} disabled={isLoading}>
                  {isLoading ? 'Criando...' : 'Criar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
