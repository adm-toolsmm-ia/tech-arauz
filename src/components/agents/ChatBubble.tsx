'use client';

import React from 'react';
import { Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  tokens?: number;
  cost?: number;
  sql?: string;
}

export function ChatBubble({ role, content, tokens, cost, sql }: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={cn('flex mb-4', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-md px-4 py-3 rounded-lg',
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-muted text-foreground rounded-bl-none',
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{content}</p>

        {/* Metadata Footer */}
        {(tokens !== undefined || cost !== undefined || sql) && (
          <div className="mt-3 pt-2 border-t border-opacity-20">
            <div className="flex items-center gap-2 text-xs">
              {tokens !== undefined && (
                <span className={isUser ? 'text-blue-100' : 'text-muted-foreground'}>
                  Tokens: {tokens}
                </span>
              )}
              {cost !== undefined && (
                <span className={isUser ? 'text-blue-100' : 'text-muted-foreground'}>
                  Cost: ${cost.toFixed(4)}
                </span>
              )}
            </div>

            {/* SQL Details (collapsible) */}
            {sql && (
              <details className="mt-2">
                <summary className={cn(
                  'cursor-pointer flex items-center gap-1 text-xs font-medium',
                  isUser ? 'text-blue-100' : 'text-muted-foreground',
                )}>
                  <Code2 className="h-3 w-3" />
                  SQL
                </summary>
                <div
                  className={cn(
                    'mt-2 p-2 rounded bg-opacity-10 font-mono text-xs',
                    isUser ? 'bg-blue-900' : 'bg-slate-900',
                  )}
                >
                  <code className={isUser ? 'text-blue-50' : 'text-slate-200'}>{sql}</code>
                </div>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
