import React, { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { AlertCircle, Clock, ChevronDown } from 'lucide-react';

interface OrgDocumentation {
  procedures?: string | null;
  instructions?: string | null;
  regra?: string | null;
  prazo?: string | null;
  horario_limite?: string | null;
  steps?: string[] | null;
  [key: string]: any;
}

interface DocumentationAccordionProps {
  data: OrgDocumentation | null;
  className?: string;
}

/**
 * Display JSONB documentation fields as accordion items
 * Special case: regra field with AlertCircle icon and destructive color
 * Special case: prazo field with Clock icon and horario_limite side-by-side
 * Steps rendered as <ol> numerada
 */
export function DocumentationAccordion({ data, className }: DocumentationAccordionProps) {
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set());

  if (!data) {
    return <p className="text-xs text-muted-foreground">Sem documentação</p>;
  }

  // Build accordion items from non-null fields
  const items: Array<{ key: string; label: string; content: React.ReactNode; special?: boolean }> = [];

  // SPECIAL: regra field with destaque
  if (data.regra) {
    items.push({
      key: 'regra',
      label: 'REGRA DE NEGÓCIO',
      content: data.regra,
      special: true,
    });
  }

  // SPECIAL: prazo field with Clock icon
  if (data.prazo) {
    items.push({
      key: 'prazo',
      label: 'Prazo',
      content: (
        <div className="flex gap-4">
          <div>
            <span className="text-xs text-muted-foreground">Prazo: </span>
            <span className="text-sm">{data.prazo}</span>
          </div>
          {data.horario_limite && (
            <div>
              <span className="text-xs text-muted-foreground">Limite: </span>
              <span className="text-sm">{data.horario_limite}</span>
            </div>
          )}
        </div>
      ),
    });
  }

  // SPECIAL: steps as numbered list
  if (data.steps && Array.isArray(data.steps) && data.steps.length > 0) {
    items.push({
      key: 'steps',
      label: 'Passos',
      content: (
        <ol className="list-decimal list-inside space-y-2">
          {data.steps.map((step, idx) => (
            <li key={idx} className="text-sm">
              {step}
            </li>
          ))}
        </ol>
      ),
    });
  }

  // Regular fields: procedures, instructions, etc.
  const regularFields = ['procedures', 'instructions'];
  for (const field of regularFields) {
    if (data[field]) {
      const label = field === 'procedures' ? 'Procedimentos' : 'Instruções';
      items.push({
        key: field,
        label,
        content: data[field],
      });
    }
  }

  if (items.length === 0) {
    return <p className="text-xs text-muted-foreground">Sem documentação</p>;
  }

  const toggleOpen = (key: string) => {
    const newSet = new Set(openKeys);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setOpenKeys(newSet);
  };

  return (
    <div className={`space-y-2 ${className || ''}`}>
      {items.map((item) => {
        const isOpen = openKeys.has(item.key);
        return (
          <Collapsible
            key={item.key}
            open={isOpen}
            onOpenChange={() => toggleOpen(item.key)}
            className={
              item.special && item.key === 'regra'
                ? 'border-l-2 border-destructive rounded'
                : 'border rounded'
            }
          >
            <CollapsibleTrigger className="w-full px-3 py-2 flex items-center justify-between hover:bg-muted/50">
              <div className="flex items-center gap-2">
                {item.key === 'regra' && (
                  <AlertCircle className="w-4 h-4 text-destructive" />
                )}
                {item.key === 'prazo' && <Clock className="w-4 h-4 text-primary" />}
                <span
                  className={
                    item.special && item.key === 'regra'
                      ? 'font-bold text-destructive'
                      : 'font-semibold text-sm'
                  }
                >
                  {item.label}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent
              className={
                item.key === 'regra'
                  ? 'px-3 py-2 bg-destructive/5 text-destructive/80 border-t'
                  : 'px-3 py-2 border-t'
              }
            >
              {item.content}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
