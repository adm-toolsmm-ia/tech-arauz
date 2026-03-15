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
      className={`cursor-pointer transition-shadow hover:shadow-md ${className || ''}`}
      onClick={onClick}
    >
      <CardContent className="flex items-start justify-between p-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold">{title}</h4>
            {badge && (
              <Badge variant="secondary" className="text-xs">
                {badge}
              </Badge>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}

          {meta && (
            <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
              {Object.entries(meta).map(([key, value]) => (
                <span key={key}>
                  {key}: <strong>{value}</strong>
                </span>
              ))}
            </div>
          )}
        </div>

        <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
      </CardContent>
    </Card>
  );
}
