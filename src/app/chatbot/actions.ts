'use server';

import { createClient } from '@/lib/supabase/server';
import type { AgentHead } from '@/types/agents';

/**
 * Server Action: Fetch all global chatbot agents
 * Filters by: is_global_chatbot = true AND status = 'published'
 * Uses RLS to enforce tenant isolation
 */
export async function getChatbotAgents(): Promise<AgentHead[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // Get agents with is_global_chatbot = true and status = 'published'
  const { data: agents, error } = await supabase
    .from('agents')
    .select('id, name, slug, status, tags, model_id, current_version, updated_at, owners, usage_type, show_in_shortcut, is_global_chatbot')
    .eq('is_global_chatbot', true)
    .eq('status', 'published')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch chatbot agents:', error);
    throw new Error(`Failed to fetch agents: ${error.message}`);
  }

  return (agents as AgentHead[]) || [];
}

/**
 * Server Action: Create a new chat session
 * Associates session with agent and tenant (via RLS)
 */
export async function createChatSession(agentId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  const sessionId = crypto.randomUUID();
  const now = new Date().toISOString();

  // Get tenant_id from user's profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile?.tenant_id) {
    throw new Error('User profile not found');
  }

  // Create session - RLS will enforce tenant isolation
  const { data: session, error: sessionError } = await supabase
    .from('chat_sessions')
    .insert([
      {
        id: sessionId,
        agent_id: agentId,
        tenant_id: profile.tenant_id,
        user_id: user.id,
        created_at: now,
        updated_at: now,
      },
    ])
    .select()
    .single();

  if (sessionError) {
    console.error('Failed to create session:', sessionError);
    throw new Error(`Failed to create session: ${sessionError.message}`);
  }

  return session;
}

/**
 * Server Action: Fetch chat session and messages
 * Validates ownership and tenant isolation
 */
export async function getChatSession(sessionId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  const { data: session, error } = await supabase
    .from('chat_sessions')
    .select(
      `
      id,
      agent_id,
      tenant_id,
      user_id,
      created_at,
      updated_at,
      chat_messages (
        id,
        session_id,
        role,
        content,
        created_at
      )
    `
    )
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Failed to fetch session:', error);
    throw new Error(`Failed to fetch session: ${error.message}`);
  }

  return session;
}

/**
 * Server Action: Add message to chat session
 * Validates session ownership, creates message record
 */
export async function addChatMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // Verify session ownership
  const { data: session, error: sessionError } = await supabase
    .from('chat_sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (sessionError || !session) {
    throw new Error('Session not found or access denied');
  }

  const messageId = crypto.randomUUID();
  const now = new Date().toISOString();

  // Create message
  const { data: message, error: messageError } = await supabase
    .from('chat_messages')
    .insert([
      {
        id: messageId,
        session_id: sessionId,
        role,
        content,
        created_at: now,
      },
    ])
    .select()
    .single();

  if (messageError) {
    console.error('Failed to add message:', messageError);
    throw new Error(`Failed to add message: ${messageError.message}`);
  }

  // Update session updated_at
  await supabase
    .from('chat_sessions')
    .update({ updated_at: now })
    .eq('id', sessionId);

  return message;
}
