'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Trash2 } from 'lucide-react';
import type { LmProvider } from '@/types/agents';

interface LmProviderListItemProps {
    provider: LmProvider;
    isSelected: boolean;
    onSelect: (provider: LmProvider) => void;
    onToggleActive: (provider: LmProvider) => void;
    onDelete: (provider: LmProvider) => void;
}

export function LmProviderListItem({
    provider,
    isSelected,
    onSelect,
    onToggleActive,
    onDelete,
}: LmProviderListItemProps) {
    return (
        <div
            role="button"
            tabIndex={0}
            className={`cursor-pointer border rounded-lg p-4 hover:bg-muted/50 transition-colors ${isSelected ? 'ring-2 ring-primary' : ''
                }`}
            onClick={() => onSelect(provider)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(provider);
                }
            }}
        >
            {/* Provider Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex flex-1 items-center gap-4">
                    <div
                        className="text-2xl w-10 h-10 flex items-center justify-center rounded"
                        style={{ backgroundColor: `${provider.color_hex}20` }}
                    >
                        {provider.icon_emoji || '🤖'}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-medium">{provider.name}</h3>
                        <p className="text-sm text-muted-foreground font-mono text-xs">{provider.slug}</p>
                        {provider.description && (
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                                {provider.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 mr-4">
                    {provider.is_system && (
                        <Badge variant="outline">
                            <Lock className="h-3 w-3 mr-1" />
                            Sistema
                        </Badge>
                    )}
                    {provider.is_active ? (
                        <Badge variant="default" className="bg-green-600">
                            ✅ Ativo
                        </Badge>
                    ) : (
                        <Badge variant="secondary">⭐ Inativo</Badge>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    {!provider.is_system && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                title="Alternar status"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleActive(provider);
                                }}
                            >
                                {provider.is_active ? '🔴' : '🟢'}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                title="Deletar"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(provider);
                                }}
                            >
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </>
                    )}
                    {provider.is_system && (
                        <Button variant="ghost" size="sm" disabled>
                            <Lock className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    )}
                </div>
            </div>

            {/* API Endpoint */}
            {provider.api_endpoint && (
                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded font-mono">
                    {provider.api_endpoint}
                </div>
            )}
        </div>
    );
}
