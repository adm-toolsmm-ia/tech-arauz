import { useState, useCallback } from 'react';
import { createChatSession, addChatMessage, getChatSession } from '../actions';

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  agent_id: string;
  tenant_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  chat_messages?: ChatMessage[];
}

/**
 * Hook: useChat
 *
 * Manages chat state and operations:
 * - Session creation/fetching
 * - Message management
 * - Error handling
 */
export function useChat() {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(async (agentId: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const newSession = await createChatSession(agentId);
      setSession(newSession);
      setMessages([]); // Start with fresh message history

      return newSession;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSession = useCallback(async (sessionId: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const loadedSession = await getChatSession(sessionId);
      setSession(loadedSession);
      setMessages(loadedSession.chat_messages || []);

      return loadedSession;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load session';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!session) {
        throw new Error('No active session');
      }

      try {
        setError(null);

        // Add user message
        const userMessage = await addChatMessage(session.id, 'user', content);
        setMessages((prev) => [...prev, userMessage]);

        // TODO: Call agent API to get response (Phase 2)
        // For now, just show user message

        return userMessage;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMsg);
        throw err;
      }
    },
    [session],
  );

  const clearSession = useCallback(() => {
    setSession(null);
    setMessages([]);
    setError(null);
  }, []);

  return {
    session,
    messages,
    isLoading,
    error,
    createSession,
    loadSession,
    sendMessage,
    clearSession,
  };
}
