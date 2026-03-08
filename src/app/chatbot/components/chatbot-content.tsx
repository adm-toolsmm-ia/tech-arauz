'use client';

import React, { useState, useEffect } from 'react';
import { AgentSelector } from './agent-selector';
import { ChatInterface } from './chat-interface';
import { Card } from '@/components/ui/card';
import { useChat } from '../hooks/useChat';
import type { ChatSession, ChatMessage } from '../hooks/useChat';

interface Agent {
  id: string;
  name: string;
  description?: string;
  is_global_chatbot: boolean;
}

/**
 * ChatbotContent: Main chatbot orchestrator component
 *
 * Manages:
 * - Agent selection
 * - Session creation/loading via useChat hook
 * - Message history
 * - Chat flow
 */
export function ChatbotContent() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const { session, messages, error, isLoading, createSession, sendMessage } = useChat();

  // Initialize on mount (useChat hook handles this)
  useEffect(() => {
    // TODO: Fetch default agent or from URL params (Phase 2)
    // TODO: Create or fetch existing session from localStorage or URL
    // For now, just show empty state until user selects an agent
  }, []);

  const handleAgentChange = (agent: Agent) => {
    setSelectedAgent(agent);
    // Create session via useChat hook
    createSession(agent.id).catch((err) => {
      console.error('Failed to create session:', err);
    });
  };

  const handleSendMessage = async (content: string) => {
    if (!session) {
      console.error('No active session');
      return;
    }

    try {
      await sendMessage(content);
      // TODO: Send message to agent API (Phase 2)
      // TODO: Handle streaming response from agent
      // TODO: Add assistant message to database
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="flex h-full gap-6 p-6">
      {/* Sidebar: Agent Selector & History */}
      <aside className="w-64 flex flex-col gap-4">
        <Card className="p-4 flex-1 flex flex-col gap-4 overflow-auto">
          <div className="font-semibold text-sm">Select Agent</div>
          <AgentSelector
            selectedAgent={selectedAgent}
            onAgentSelect={handleAgentChange}
            isLoading={isLoading}
          />

          {/* TODO: Chat history sidebar in Phase 2 */}
          <div className="text-xs text-muted-foreground">
            Chat history coming in Phase 2
          </div>
        </Card>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col gap-4">
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
            <p>{error}</p>
            <p className="text-xs mt-2">Try refreshing the page or selecting a different agent.</p>
          </div>
        )}

        {selectedAgent ? (
          <Card className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b bg-muted/50">
              <h2 className="font-semibold text-lg">{selectedAgent.name}</h2>
              {selectedAgent.description && (
                <p className="text-sm text-muted-foreground">{selectedAgent.description}</p>
              )}
            </div>

            <ChatInterface
              agent={selectedAgent}
              session={session}
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </Card>
        ) : (
          <Card className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Select an agent to begin</p>
              <p className="text-xs text-muted-foreground">
                Chatbot agents appear in the left sidebar
              </p>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
