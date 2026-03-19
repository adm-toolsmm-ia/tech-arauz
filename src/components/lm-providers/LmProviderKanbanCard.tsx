'use client';

import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LmProvider } from '@/types/agents';

interface LmProviderKanbanCardProps {
  provider: LmProvider;
}

export const LmProviderKanbanCard: React.FC<LmProviderKanbanCardProps> = ({ provider }) => {
  return (
    <div className="space-y-1.5">
      <span className="text-foreground dark:text-[hsl(0,0%,97%)] line-clamp-2 text-sm font-semibold leading-tight">
        {provider.icon_emoji || '🤖'} {provider.name}
      </span>
      {provider.description && (
        <p className="line-clamp-2 text-[11px] text-muted-foreground">{provider.description}</p>
      )}
      <div className="flex flex-wrap gap-1">
        <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
          {provider.slug}
        </Badge>
        {provider.is_system && (
          <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
            <Lock className="mr-0.5 size-2.5" />
            Sistema
          </Badge>
        )}
        <Badge
          variant="secondary"
          className={cn(
            'px-1.5 py-0 text-[10px]',
            provider.is_active
              ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
          )}
        >
          {provider.is_active ? 'Ativo' : 'Inativo'}
        </Badge>
      </div>
    </div>
  );
};
