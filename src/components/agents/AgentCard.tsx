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
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export function AgentCard({
  agent,
  onClick,
  onEdit,
  onDelete,
  onDuplicate,
}: AgentCardProps) {
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

  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-lg hover:border-blue-500"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {agentTypeEmoji[agent.agentType as keyof typeof agentTypeEmoji] || '⚙️'}
              </span>
              <h3 className="font-semibold text-sm truncate">{agent.name}</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">{agent.slug}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>
                <Edit2 className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate?.(); }}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Description */}
        {agent.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {agent.description}
          </p>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Modelo</p>
            <p className="font-mono truncate">{agent.modelId}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Proprietários</p>
            <p className="truncate">{agent.owners?.[0] || 'N/A'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Execuções</p>
            <p className="font-semibold">{agent.executionCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Atualizado</p>
            <p className="truncate">
              {new Date(agent.updatedAt).toLocaleDateString('pt-BR')}
            </p>
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

        {/* Status Badge */}
        <Badge className={`text-xs w-full justify-center ${statusColor[agent.status]}`}>
          {agent.status === 'draft' && '📝 Rascunho'}
          {agent.status === 'published' && '✅ Publicado'}
          {agent.status === 'deprecated' && '⛔ Deprecado'}
        </Badge>
      </CardContent>
    </Card>
  );
}
