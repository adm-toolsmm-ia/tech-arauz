'use client';

import React, { useState } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit2, Lock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { AgentType } from '@/types/agents';

interface AgentTypesContentProps {
  initialAgentTypes: AgentType[];
}

export function AgentTypesContent({ initialAgentTypes }: AgentTypesContentProps) {
  const [agentTypes, setAgentTypes] = useState(initialAgentTypes);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter by search
  const filtered = agentTypes.filter(
    (type) =>
      type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <DashboardHeader
          title="Tipos de Agentes"
          subtitle="Gerencie as categorias e tipos de agentes disponíveis no sistema"
        />
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Tipo
        </Button>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-sm">ℹ️ Sobre Tipos de Agentes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Tipos de agentes são categorias que padronizam a configuração e o comportamento dos
            agentes. Cada tipo pode ter modelos padrão, temperatura e outras configurações
            pré-definidas.
          </p>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, slug ou descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="pb-12 pt-12">
            <div className="text-center">
              <p className="mb-4 text-muted-foreground">
                {agentTypes.length === 0
                  ? 'Nenhum tipo criado ainda'
                  : 'Nenhum resultado encontrado'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {filtered.length} de {agentTypes.length} tipos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filtered.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex flex-1 items-center gap-3">
                    {/* Icon & Name */}
                    <div className="text-2xl">{type.icon_emoji || '⚙️'}</div>
                    <div className="flex-1">
                      <h3 className="font-medium">{type.name}</h3>
                      <p className="text-sm text-muted-foreground">{type.slug}</p>
                      {type.description && (
                        <p className="mt-1 text-xs text-muted-foreground">{type.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Badges & Status */}
                  <div className="flex items-center gap-2">
                    {type.is_system && <Badge variant="outline">🔒 Sistema</Badge>}
                    {type.is_active ? (
                      <Badge className="bg-green-100 text-green-800">✅ Ativo</Badge>
                    ) : (
                      <Badge variant="secondary">⭐ Inativo</Badge>
                    )}

                    {/* Model Info */}
                    {type.default_model_provider && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {type.default_model_provider} - {type.default_model_id}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="ml-4 flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={type.is_system}
                      title={type.is_system ? 'Tipos de sistema não podem ser editados' : 'Editar'}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {type.is_system ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled
                        title="Tipos de sistema não podem ser deletados"
                      >
                        <Lock className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast.error('Delete não implementado ainda')}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
