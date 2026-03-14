import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';

interface OrgEntityCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  meta?: Record<string, string | number>;
  onClick?: () => void;
  className?: string;
}

/**
 * Generic clickable entity card for hierarchical navigation
 * Used in lists within cockpits (Núcleos em Area, Processos em Nucleus, etc)
 */
export function OrgEntityCard({
  title,
  subtitle,
  badge,
  meta,
  onClick,
  className,
}: OrgEntityCardProps) {
  return (
    <Card
      className={`hover:shadow-md transition-shadow cursor-pointer ${className || ''}`}
      onClick={onClick}
    >
      <CardContent className="p-3 flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">{title}</h4>
            {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
          </div>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}

          {meta && (
            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
              {Object.entries(meta).map(([key, value]) => (
                <span key={key}>
                  {key}: <strong>{value}</strong>
                </span>
              ))}
            </div>
          )}
        </div>

        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </CardContent>
    </Card>
  );
}
