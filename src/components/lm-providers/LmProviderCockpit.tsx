'use client';

import { FileText, Cpu, Lock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { LmProvider, LmModel } from '@/types/agents';

interface LmProviderCockpitProps {
  provider: LmProvider;
  models: LmModel[];
}

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || '-'}</p>
    </div>
  );
}

export function LmProviderCockpit({ provider, models }: LmProviderCockpitProps) {
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
          </div>
        </TabsContent>

        <TabsContent value="modelos" className="mt-4">
          {models.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum modelo cadastrado para este provedor.</p>
          ) : (
            <div className="space-y-2">
              {models.map((model) => (
                <div
                  key={model.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{model.name}</p>
                    <p className="text-xs font-mono text-muted-foreground">{model.model_id}</p>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
