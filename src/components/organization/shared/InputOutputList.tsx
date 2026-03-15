import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, AlertCircle, BarChart3 } from 'lucide-react';

interface InputOutputItem {
  name: string;
  description?: string;
  required?: boolean;
  severity?: string;
}

interface InputOutputListProps {
  items: InputOutputItem[];
  direction: 'input' | 'output' | 'risk' | 'impact';
  variant?: 'default' | 'risk' | 'impact';
  className?: string;
}

/**
 * Display inputs/outputs/risks/impacts as directional cards
 * Variant controls colors: default=slate, risk=destructive, impact=warning
 */
export function InputOutputList({
  items,
  direction,
  variant = 'default',
  className,
}: InputOutputListProps) {
  if (!items || items.length === 0) {
    return <p className="text-xs text-muted-foreground">Nenhum item</p>;
  }

  const getIcon = () => {
    switch (direction) {
      case 'input':
        return <ArrowDown className="h-4 w-4 text-blue-600" />;
      case 'output':
        return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'risk':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'impact':
        return <BarChart3 className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'risk':
        return 'bg-destructive/5 border-destructive/20';
      case 'impact':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className={`space-y-2 ${className || ''}`}>
      {items.map((item, idx) => (
        <div
          key={`${direction}-${idx}`}
          className={`flex gap-3 rounded border p-3 ${getVariantClass()}`}
        >
          <div className="mt-0.5 flex-shrink-0">{getIcon()}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{item.name}</span>
              {item.required && (
                <Badge variant="outline" className="text-xs">
                  Required
                </Badge>
              )}
              {item.severity && (
                <Badge variant={variant === 'risk' ? 'destructive' : 'outline'} className="text-xs">
                  {item.severity}
                </Badge>
              )}
            </div>
            {item.description && (
              <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
