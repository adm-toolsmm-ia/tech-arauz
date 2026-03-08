'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Agent {
  id: string;
  name: string;
  description?: string;
  is_global_chatbot: boolean;
}

interface ChatSession {
  id: string;
  agent_id: string;
  tenant_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  chat_messages?: ChatMessage[];
}

interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ChatInterfaceProps {
  agent: Agent;
  session: ChatSession | null;
  messages: ChatMessage[];
  onSendMessage: (content: string) => Promise<void>;
  isLoading?: boolean;
}

/**
 * ChatInterface: Production-grade chat message display and input component
 *
 * Features:
 * - Message display with role-based styling
 * - Timestamps and copy-to-clipboard
 * - Textarea input with shift+enter support
 * - Loading states and auto-scroll
 * - Accessibility (ARIA labels, keyboard nav)
 * - Mobile-responsive layout
 */
export function ChatInterface({
  agent,
  session,
  messages,
  onSendMessage,
  isLoading = false,
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || isSending || !session) {
      return;
    }

    const content = inputValue.trim();
    setInputValue('');

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      setIsSending(true);
      await onSendMessage(content);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Error handling is done at parent level
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as any);
      return;
    }

    // Auto-expand textarea on new line
    if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      // Allow default behavior but mark that we want to send
      // Actually, let's require Ctrl+Enter to send
      return;
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);

    // Auto-expand textarea height
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  };

  const handleCopy = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const emptyState = messages.length === 0;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages Display Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {emptyState ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-sm">
              <div className="mb-4 w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl">💬</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Start a conversation</h3>
              <p className="text-sm text-muted-foreground">
                You&apos;re chatting with <strong>{agent.name}</strong>. Type your message below to begin.
              </p>
              {agent.description && (
                <p className="text-xs text-muted-foreground mt-3 italic">
                  {agent.description}
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3 animate-in fade-in duration-300',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'group relative max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-4 py-3 rounded-lg',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted text-muted-foreground rounded-bl-none border border-border'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                    {message.content}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <time className="text-xs opacity-60">
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                    <button
                      onClick={() => handleCopy(message.content, message.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/10 rounded"
                      aria-label="Copy message"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start animate-in fade-in">
                <div className="bg-muted px-4 py-3 rounded-lg rounded-bl-none border border-border flex gap-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Agent is thinking...</span>
                </div>
              </div>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-background/95 backdrop-blur-sm p-4 space-y-2">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            ref={inputRef}
            placeholder={
              session
                ? 'Type your message... (Ctrl+Enter to send)'
                : 'Select an agent to start chatting'
            }
            value={inputValue}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            disabled={isSending || isLoading || !session}
            className="flex-1 resize-none min-h-[44px] max-h-[200px]"
            aria-label="Chat message input"
            rows={1}
          />
          <Button
            type="submit"
            size="lg"
            disabled={
              isSending ||
              isLoading ||
              !session ||
              !inputValue.trim()
            }
            aria-label="Send message"
            className="self-end"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="ml-2 hidden sm:inline">Send</span>
          </Button>
        </form>

        {!session && (
          <p className="text-xs text-muted-foreground px-2">
            👆 Select an agent from the left sidebar to start a new conversation
          </p>
        )}

        <p className="text-xs text-muted-foreground px-2 text-center">
          Use <kbd className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">Ctrl+Enter</kbd> or{' '}
          <kbd className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">Cmd+Enter</kbd> to send
        </p>
      </div>
    </div>
  );
}
