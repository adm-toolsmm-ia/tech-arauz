'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { KPICard } from '@/components/dashboard/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Zap, Database } from 'lucide-react';
import { toast } from 'sonner';
import { FilterBar } from '@/components/filters/FilterBar';
import { filterRegistryModelosIa } from '@/lib/filters/filters-modelos-ia';
import { SplitView } from '@/components/views/SplitView';
import { ModelCard } from '@/components/lm-models/ModelCard';
import type { LmModel, LmProvider } from '@/types/agents';

interface ModelsIaContentProps {
  initialModels: (LmModel & { lm_providers: LmProvider })[];
  initialProviders: LmProvider[];
}

interface FormData {
  name: string;
  model_id: string;
  provider_id: string;
  docs_url: string;
  max_tokens?: number;
}

export function ModelsIaContent({
  initialModels,
  initialProviders,
}: ModelsIaContentProps) {
  const [models, setModels] = useState(initialModels);
  const [selectedModel, setSelectedModel] = useState<LmModel | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    model_id: '',
    provider_id: '',
    docs_url: '',
    max_tokens: undefined,
  });

  // KPIs
  const kpis = useMemo(
    () => ({
      total: models.length,
      byProvider: selectedProvider
        ? models.filter((m) => m.provider_id === selectedProvider).length
        : 0,
      unique_providers: new Set(models.map((m) => m.provider_id)).size,
    }),
    [models, selectedProvider]
  );

  // Filtrar modelos
  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        model.name.toLowerCase().includes(searchLower) ||
        model.model_id.toLowerCase().includes(searchLower);
      const matchesProvider = !selectedProvider || model.provider_id === selectedProvider;
      return matchesSearch && matchesProvider;
    });
  }, [models, search, selectedProvider]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      model_id: '',
      provider_id: '',
      docs_url: '',
      max_tokens: undefined,
    });
  }, []);

  // TODO: Implementar ações (create, delete)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <DashboardHeader
          title="Gestão 360° de Modelos IA"
          subtitle="Visualize, organize e gerencie todos os modelos de IA dos seus fornecedores"
        />
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Modelo
        </Button>
      </div>

      {/* KPIs */}
      {models.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard
            icon={Database}
            title="Total de Modelos"
            value={kpis.total}
            trend={{ value: '0', positive: false }}
          />
          <KPICard
            icon={Zap}
            title={selectedProvider ? 'Modelos do Fornecedor' : 'Fornecedores'}
            value={selectedProvider ? kpis.byProvider : kpis.unique_providers}
            trend={{ value: '0', positive: false }}
          />
          <KPICard
            icon={Plus}
            title="Filtrados"
            value={filteredModels.length}
            trend={{ value: '0', positive: true }}
          />
        </div>
      )}

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-sm">📚 Sobre Modelos IA</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Modelos IA são os componentes principais dos Fornecedores IA. Cada modelo tem
            configurações únicas (tamanho de contexto, documentação, etc.) e pode ser usado por
            diferentes tipos de agentes.
          </p>
        </CardContent>
      </Card>

      {/* Filtros */}
      <div className="space-y-4">
        <FilterBar
          moduleId={filterRegistryModelosIa.moduleId}
          filters={filterRegistryModelosIa}
          onFiltersChange={() => {}}
          onSearchChange={setSearch}
          onViewModeChange={() => {}}
          initialFilters={{}}
          initialSearch={search}
          initialViewMode="list"
          currentFilters={{}}
          currentSearch={search}
          currentViewMode="list"
          onUpdateFilter={() => {}}
        />

        {/* Provider Filter */}
        <Select value={selectedProvider} onValueChange={setSelectedProvider}>
          <SelectTrigger className="w-full md:w-64">
            <SelectValue placeholder="Filtrar por fornecedor..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os fornecedores</SelectItem>
            {initialProviders.map((provider) => (
              <SelectItem key={provider.id} value={provider.id}>
                {provider.icon_emoji} {provider.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Models Grid/List */}
      {filteredModels.length === 0 ? (
        <Card>
          <CardContent className="pb-12 pt-12">
            <div className="text-center">
              <p className="mb-4 text-muted-foreground">
                {models.length === 0
                  ? 'Nenhum modelo criado ainda'
                  : 'Nenhum resultado encontrado'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {filteredModels.length} de {models.length} modelos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredModels.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  provider={model.lm_providers as any}
                  isSelected={selectedModel?.id === model.id}
                  onSelect={setSelectedModel}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SplitView - Modelo Details */}
      {selectedModel && (
        <SplitView
          isOpen={!!selectedModel}
          onClose={() => setSelectedModel(null)}
          title="Detalhes do Modelo"
          subtitle={selectedModel.name}
          width="lg"
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-2">Informações Gerais</h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Nome:</dt>
                  <dd className="font-medium">{selectedModel.name}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Model ID:</dt>
                  <dd className="font-mono">{selectedModel.model_id}</dd>
                </div>
                {selectedModel.max_tokens != null && (
                  <div>
                    <dt className="text-muted-foreground">Máx. Tokens:</dt>
                    <dd className="font-medium">
                      {selectedModel.max_tokens.toLocaleString('pt-BR')} tokens
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {selectedModel.docs_url && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Documentação</h3>
                <a
                  href={selectedModel.docs_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline text-sm"
                >
                  Ver documentação →
                </a>
              </div>
            )}
          </div>
        </SplitView>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Modelo IA</DialogTitle>
            <DialogDescription>
              Crie um novo modelo adicionando informações do provedor de IA.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Fornecedor</Label>
              <Select value={formData.provider_id} onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, provider_id: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um fornecedor..." />
                </SelectTrigger>
                <SelectContent>
                  {initialProviders.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.icon_emoji} {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Nome do Modelo</Label>
              <Input
                placeholder="Ex: GPT-4 Turbo"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <Label>Model ID</Label>
              <Input
                placeholder="Ex: gpt-4-turbo-preview"
                value={formData.model_id}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, model_id: e.target.value }))
                }
              />
            </div>

            <div>
              <Label>URL da Documentação (opcional)</Label>
              <Input
                placeholder="https://..."
                value={formData.docs_url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, docs_url: e.target.value }))
                }
              />
            </div>

            <div>
              <Label>Máx. Tokens (opcional)</Label>
              <Input
                type="number"
                placeholder="Ex: 8000"
                value={formData.max_tokens ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    max_tokens: e.target.value ? parseInt(e.target.value, 10) : undefined,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button disabled={isLoading} onClick={() => {
              toast.info('Funcionalidade em desenvolvimento');
            }}>
              {isLoading ? 'Criando...' : 'Criar Modelo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
