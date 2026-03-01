'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatBubble } from '@/components/agents/ChatBubble';
import { Send, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  tokens?: number;
  cost?: number;
  sql?: string;
}

interface ChatContentProps {
  agentId: string;
  initialSessionId?: string;
  initialMessages?: ChatMessage[];
}

export function ChatContent({ agentId, initialSessionId, initialMessages = [] }: ChatContentProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(initialSessionId || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Optimistic update - add user message immediately
    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/agents/${agentId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId || undefined,
          message: input,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(`Error: ${error.error || 'Failed to get response'}`);
        // Remove optimistic user message on error
        setMessages((prev) => prev.slice(0, -1));
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      // Update session ID if not already set
      if (!sessionId && data.session_id) {
        setSessionId(data.session_id);
      }

      // Add assistant message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.answer || data.content || 'No response',
        tokens: data.tokens,
        cost: data.cost,
        sql: data.sql,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast.error(
        `Error: ${error instanceof Error ? error.message : 'Failed to send message'}`,
      );
      // Remove optimistic user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        toast.error('Failed to create new session');
        return;
      }

      const data = await response.json();
      setSessionId(data.session_id);
      setMessages([]);
      toast.success('New chat session created');
    } catch (error) {
      toast.error(
        `Error: ${error instanceof Error ? error.message : 'Failed to create session'}`,
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Chat messages area */}
      <Card className="flex-1 overflow-hidden">
        <CardContent className="h-full overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground">No messages yet. Start a conversation!</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <ChatBubble
                  key={index}
                  role={message.role}
                  content={message.content}
                  tokens={message.tokens}
                  cost={message.cost}
                  sql={message.sql}
                />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <Card className="max-w-md">
                    <CardContent className="pt-3 space-y-2">
                      <Skeleton className="h-4 w-32" data-testid="skeleton-loader" />
                      <Skeleton className="h-4 w-24" />
                    </CardContent>
                  </Card>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Input area */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            size="sm"
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Send
          </Button>
          <Button onClick={handleNewChat} variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Session ID: {sessionId ? sessionId.slice(0, 8) + '...' : 'Not initialized'}
        </p>
      </div>
    </div>
  );
}
