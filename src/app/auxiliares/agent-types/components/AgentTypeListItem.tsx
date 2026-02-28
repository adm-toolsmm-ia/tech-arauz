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
            className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50 ${isSelected ? 'ring-2 ring-primary' : ''
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
                    className="text-2xl w-10 h-10 flex items-center justify-center rounded"
                    style={{ backgroundColor: `${type.color_hex}20` }}
                >
                    {type.icon_emoji || '⚙️'}
                </div>
                <div className="flex-1">
                    <h3 className="font-medium">{type.name}</h3>
                    <p className="text-sm text-muted-foreground font-mono text-xs">{type.slug}</p>
                    {type.description && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{type.description}</p>
                    )}
                </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 mr-4">
                {type.is_system && (
                    <Badge variant="outline">
                        <Lock className="h-3 w-3 mr-1" />
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
