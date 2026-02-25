'use client';

import { useState, useCallback } from 'react';
import { FileText, Cpu, Lock, Plus, ExternalLink } from 'lucide-react';
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
import { toast } from 'sonner';
import type { LmProvider, LmModel } from '@/types/agents';

interface LmProviderCockpitProps {
  provider: LmProvider;
  models: LmModel[];
  onModelCreated?: (model: LmModel) => void;
}

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || '-'}</p>
    </div>
  );
}

export function LmProviderCockpit({ provider, models, onModelCreated }: LmProviderCockpitProps) {
  const [isCreateModelOpen, setIsCreateModelOpen] = useState(false);
  const [modelForm, setModelForm] = useState({ name: '', model_id: '', docs_url: '' });
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="space-y-6">
      <Tabs defaultValue="detalhes" className="w-full">
        <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="detalhes"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <FileText className="mr-2 size-4" />
            Detalhes
          </TabsTrigger>
          <TabsTrigger
            value="modelos"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Cpu className="mr-2 size-4" />
            Modelos
            {models.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({models.length})</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="detalhes" className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="flex size-12 items-center justify-center rounded-lg text-2xl"
              style={{ backgroundColor: `${provider.color_hex || '#64748B'}20` }}
            >
              {provider.icon_emoji || '🤖'}
            </div>
            <div className="flex flex-wrap gap-2">
              {provider.is_system && (
                <Badge variant="outline">
                  <Lock className="mr-1 size-3" />
                  Sistema
                </Badge>
              )}
              {provider.is_active ? (
                <Badge variant="default" className="bg-green-600">
                  Ativo
                </Badge>
              ) : (
                <Badge variant="secondary">Inativo</Badge>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoField label="Nome" value={provider.name} />
            <InfoField label="Slug" value={provider.slug} />
            <InfoField label="Descrição" value={provider.description} />
            <InfoField label="Endpoint da API" value={provider.api_endpoint} />
            {provider.docs_url && (
              <div className="sm:col-span-2 space-y-1">
                <p className="text-xs text-muted-foreground">Documentação</p>
                <a
                  href={provider.docs_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                >
                  {provider.docs_url}
                  <ExternalLink className="size-3" />
                </a>
              </div>
            )}
          </div>
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
              {models.map((model) => (
                <div
                  key={model.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{model.name}</p>
                    <p className="text-xs font-mono text-muted-foreground">{model.model_id}</p>
                    {model.docs_url && (
                      <a
                        href={model.docs_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
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
                    onChange={(e) =>
                      setModelForm((p) => ({ ...p, docs_url: e.target.value }))
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateModelOpen(false)} disabled={isLoading}>
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
