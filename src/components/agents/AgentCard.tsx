'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit2, Trash2, Copy } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { UIAgent } from '@/lib/transformers/agent';

interface AgentCardProps {
  agent: UIAgent;
  agentTypeName?: string;
  toolsCount?: number;
  publishedVersionsCount?: number;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  agentTypeName,
  toolsCount = 0,
  publishedVersionsCount = 0,
  onClick,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  const statusColor = {
    draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    deprecated: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const agentTypeEmoji = {
    'status-report': '📊',
    requirements: '📋',
    analysis: '🔍',
    custom: '⚙️',
  };

  // Calcular tempo desde última atualização
  const getTimeAgoLabel = (dateString: string): string => {
    const now = new Date();
    const updated = new Date(dateString);
    const diffMs = now.getTime() - updated.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'hoje';
    if (diffDays === 1) return '1 dia atrás';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} sem atrás`;
    return `${Math.floor(diffDays / 30)} mês${Math.floor(diffDays / 30) > 1 ? 'es' : ''} atrás`;
  };

  return (
    <Card
      className="group cursor-pointer transition-all hover:border-blue-500 hover:shadow-lg"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        {/* SEÇÃO 1: HEADER - Nome + Status Badge + Tempo */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {agentTypeEmoji[agent.agentType as keyof typeof agentTypeEmoji] || '⚙️'}
              </span>
              <div>
                <h3 className="truncate text-sm font-semibold">{agent.name}</h3>
                <p className="text-[10px] text-muted-foreground">
                  Atualizado {getTimeAgoLabel(agent.updatedAt)}
                </p>
              </div>
            </div>
            <p className="mt-1 truncate text-xs text-muted-foreground">{agent.slug}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate?.();
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Deletar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Description */}
        {agent.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{agent.description}</p>
        )}

        {/* SEÇÃO 2: TIPO DE AGENTE */}
        {agentTypeName && (
          <div className="border-t border-border/30 pt-2">
            <p className="text-[10px] text-muted-foreground">Tipo de Agente:</p>
            <p className="text-xs font-semibold text-foreground">{agentTypeName}</p>
          </div>
        )}

        {/* SEÇÃO 3: MODELO PADRÃO */}
        <div className="border-t border-border/30 pt-2">
          <p className="text-[10px] text-muted-foreground">Modelo padrão:</p>
          <p className="truncate font-mono text-xs text-foreground">{agent.modelId || 'N/A'}</p>
        </div>

        {/* SEÇÃO 4: FERRAMENTAS (Tools Count) */}
        <div className="border-t border-border/30 pt-2">
          <p className="text-[10px] text-muted-foreground">Ferramentas:</p>
          <div className="flex items-center gap-2">
            <span className="text-lg">🔧</span>
            <span className="text-xs font-semibold text-foreground">{toolsCount}</span>
          </div>
        </div>

        {/* SEÇÃO 5: VERSÕES PUBLICADAS */}
        <div className="border-t border-border/30 pt-2">
          <p className="text-[10px] text-muted-foreground">Versões publicadas:</p>
          <div className="flex items-center gap-2">
            <span className="text-lg">📦</span>
            <span className="text-xs font-semibold text-foreground">{publishedVersionsCount}</span>
          </div>
        </div>

        {/* Info Grid (antigo) */}
        <div className="grid grid-cols-2 gap-2 border-t border-border/30 pt-2 text-xs">
          <div>
            <p className="text-muted-foreground">Proprietários</p>
            <p className="truncate">{agent.owners?.[0] || 'N/A'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Execuções</p>
            <p className="font-semibold">{agent.executionCount}</p>
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

        {/* SEÇÃO 6: STATUS BADGE (Footer) */}
        <Badge className={`w-full justify-center text-xs ${statusColor[agent.status]}`}>
          {agent.status === 'draft' && '📝 Rascunho'}
          {agent.status === 'published' && '✅ Publicado'}
          {agent.status === 'deprecated' && '⛔ Deprecado'}
        </Badge>
      </CardContent>
    </Card>
  );
};
