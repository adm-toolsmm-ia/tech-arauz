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

export const ChatBubble: React.FC<ChatBubbleProps> = ({ role, content, tokens, cost, sql }) => {
  const isUser = role === 'user';

  return (
    <div className={cn('mb-4 flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-md rounded-lg px-4 py-3',
          isUser
            ? 'rounded-br-none bg-blue-600 text-white'
            : 'rounded-bl-none bg-muted text-foreground',
        )}
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{content}</p>

        {/* Metadata Footer */}
        {(tokens !== undefined || cost !== undefined || sql) && (
          <div className="mt-3 border-t border-opacity-20 pt-2">
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
                <summary
                  className={cn(
                    'flex cursor-pointer items-center gap-1 text-xs font-medium',
                    isUser ? 'text-blue-100' : 'text-muted-foreground',
                  )}
                >
                  <Code2 className="h-3 w-3" />
                  SQL
                </summary>
                <div
                  className={cn(
                    'mt-2 rounded bg-opacity-10 p-2 font-mono text-xs',
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
};
