'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Trash2 } from 'lucide-react';
import type { AgentType } from '@/types/agents';

interface AgentTypeListItemProps {
  type: AgentType;
  isSelected: boolean;
  onSelect: (type: AgentType) => void;
  onToggleActive: (type: AgentType) => void;
  onDelete: (type: AgentType) => void;
}

export function AgentTypeListItem({
  type,
  isSelected,
  onSelect,
  onToggleActive,
  onDelete,
}: AgentTypeListItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={`hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors ${
        isSelected ? 'ring-primary ring-2' : ''
      }`}
      onClick={() => onSelect(type)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(type);
        }
      }}
    >
      {/* Icon & Name */}
      <div className="flex flex-1 items-center gap-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded text-2xl"
          style={{ backgroundColor: `${type.color_hex}20` }}
        >
          {type.icon_emoji || '⚙️'}
        </div>
        <div className="flex-1">
          <h3 className="font-medium">{type.name}</h3>
          <p className="font-mono text-sm text-xs text-muted-foreground">{type.slug}</p>
          {type.description && (
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{type.description}</p>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="mr-4 flex items-center gap-2">
        {type.is_system && (
          <Badge variant="outline">
            <Lock className="mr-1 h-3 w-3" />
            Sistema
          </Badge>
        )}
        {type.is_active ? (
          <Badge variant="default" className="bg-green-600">
            ✅ Ativo
          </Badge>
        ) : (
          <Badge variant="secondary">⭐ Inativo</Badge>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {!type.is_system && (
          <>
            <Button
              variant="ghost"
              size="sm"
              title="Alternar status"
              onClick={(e) => {
                e.stopPropagation();
                onToggleActive(type);
              }}
            >
              {type.is_active ? '🔴' : '🟢'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              title="Deletar"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(type);
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </>
        )}
        {type.is_system && (
          <Button variant="ghost" size="sm" disabled title="Tipo do sistema">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>
    </div>
  );
}
