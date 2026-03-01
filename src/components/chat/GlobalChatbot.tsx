'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GlobalChatbotButton } from './GlobalChatbotButton';
import { X, Send, Loader2, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface Agent {
  id: string;
  name: string;
  description: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function GlobalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch chatbot agents when sheet opens
  useEffect(() => {
    if (isOpen && agents.length === 0) {
      fetchAgents();
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchAgents = async () => {
    setIsLoadingAgents(true);
    try {
      const response = await fetch(
        '/api/agents?usage_type=chatbot&status=published&show_in_shortcut=true&limit=100'
      );
      if (!response.ok) throw new Error('Failed to fetch agents');
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Erro ao carregar assistentes');
    } finally {
      setIsLoadingAgents(false);
    }
  };

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setMessages([]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedAgent || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/agents/${selectedAgent.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversation_history: messages,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Desculpe, não consegui gerar uma resposta.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearConversation = () => {
    setMessages([]);
    setSelectedAgent(null);
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado!');
  };

  return (
    <>
      <GlobalChatbotButton onClick={() => setIsOpen(true)} />

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:w-[420px] flex flex-col">
          {!selectedAgent ? (
            <>
              <SheetHeader>
                <SheetTitle>Assistentes AI</SheetTitle>
              </SheetHeader>

              <ScrollArea className="flex-1 mt-4">
                {isLoadingAgents ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : agents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum assistente disponível
                  </p>
                ) : (
                  <div className="space-y-2 pr-4">
                    {agents.map((agent) => (
                      <Card
                        key={agent.id}
                        className="cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => handleSelectAgent(agent)}
                      >
                        <CardContent className="pt-4">
                          <h3 className="font-medium">{agent.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {agent.description || 'Sem descrição'}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </>
          ) : (
            <>
              <SheetHeader className="flex flex-row items-center justify-between">
                <SheetTitle>{selectedAgent.name}</SheetTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearConversation}
                    className="h-8 w-8 p-0"
                  >
                    🗑️
                  </Button>
                  <SheetClose asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </SheetClose>
                </div>
              </SheetHeader>

              <ScrollArea className="flex-1 mt-4 pr-4">
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Comece a conversa...
                    </p>
                  )}
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        {msg.role === 'assistant' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 mt-1"
                            onClick={() => handleCopyMessage(msg.content)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted px-3 py-2 rounded-lg">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              <div className="mt-4 flex gap-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isLoading}
                />
                <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
