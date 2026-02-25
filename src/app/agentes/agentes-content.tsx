'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Edit2, Trash2 } from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreateAgentDialog } from '@/components/agents/CreateAgentDialog';
import { useAgentsList, useDeleteAgentMutation } from '@/services/agents/agentsStore';
import { toast } from 'sonner';
import type { AgentHead } from '@/types/agents';

export function AgentsContent() {
  const router = useRouter();
  const { data: agents = [], isLoading, refetch } = useAgentsList();
  const deleteDelete = useDeleteAgentMutation();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deletar agente "${name}"?`)) return;
    await deleteDelete.mutateAsync(id);
    refetch();
  };

  const handleEdit = (id: string) => {
    router.push(`/agentes/${id}`);
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <DashboardHeader
          title="Gestão de Agentes AI"
          subtitle="Crie e gerencie seus agentes de inteligência artificial"
        />
        <CreateAgentDialog onSuccess={() => refetch()} />
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Carregando agentes...</p>
            </CardContent>
          </Card>
        ) : agents.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <Bot className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum agente cadastrado</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Clique em &quot;Novo Agente&quot; para criar seu primeiro agente.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          agents.map((agent) => (
            <AgentListCard
              key={agent.id}
              agent={agent}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface AgentListCardProps {
  agent: AgentHead;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}

function AgentListCard({ agent, onEdit, onDelete }: AgentListCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{agent.name}</CardTitle>
            <CardDescription>{agent.slug}</CardDescription>
          </div>
          <Badge variant={agent.status === 'draft' ? 'secondary' : 'default'}>
            {agent.status === 'draft' ? '📝 Rascunho' : '✅ Publicado'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Info Grid */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Modelo</p>
              <p className="font-mono">{agent.model_id}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Proprietários</p>
              <p className="truncate">{agent.owners?.[0] || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Atualizado</p>
              <p className="truncate">{new Date(agent.updated_at).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {/* Tags */}
          {agent.tags && agent.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {agent.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => onEdit(agent.id)}
            >
              <Edit2 className="h-4 w-4" />
              Editar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="gap-2"
              onClick={() => onDelete(agent.id, agent.name)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
