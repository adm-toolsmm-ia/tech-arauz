-- Migration: Create Chat Sessions and Messages Tables
-- Purpose: Support chatbot AI module with session persistence
-- Date: 2026-03-08

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  title VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  -- Foreign key constraints
  CONSTRAINT fk_agent FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE CASCADE,
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  -- Foreign key constraint
  CONSTRAINT fk_session FOREIGN KEY (session_id) REFERENCES public.chat_sessions(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_chat_sessions_agent_id ON public.chat_sessions(agent_id);
CREATE INDEX idx_chat_sessions_tenant_id ON public.chat_sessions(tenant_id);
CREATE INDEX idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_updated_at ON public.chat_sessions(updated_at DESC);
CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- Enable RLS on both tables
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_sessions
-- Users can only see their own sessions (tenant isolation enforced via auth)
CREATE POLICY "Users can view their own sessions" ON public.chat_sessions
  FOR SELECT USING (
    auth.uid() = user_id
    AND tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert their own sessions" ON public.chat_sessions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update their own sessions" ON public.chat_sessions
  FOR UPDATE USING (
    auth.uid() = user_id
    AND tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id
    AND tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can delete their own sessions" ON public.chat_sessions
  FOR DELETE USING (
    auth.uid() = user_id
    AND tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- RLS Policies for chat_messages
-- Users can only see/modify messages in their sessions
CREATE POLICY "Users can view messages from their sessions" ON public.chat_messages
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM chat_sessions
      WHERE user_id = auth.uid()
      AND tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can insert messages to their sessions" ON public.chat_messages
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM chat_sessions
      WHERE user_id = auth.uid()
      AND tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Optional: Allow chat_messages updates/deletes (for editing/cleanup)
CREATE POLICY "Users can update messages in their sessions" ON public.chat_messages
  FOR UPDATE USING (
    session_id IN (
      SELECT id FROM chat_sessions
      WHERE user_id = auth.uid()
      AND tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    )
  )
  WITH CHECK (
    session_id IN (
      SELECT id FROM chat_sessions
      WHERE user_id = auth.uid()
      AND tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can delete messages from their sessions" ON public.chat_messages
  FOR DELETE USING (
    session_id IN (
      SELECT id FROM chat_sessions
      WHERE user_id = auth.uid()
      AND tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Grant permissions
GRANT ALL ON public.chat_sessions TO authenticated;
GRANT ALL ON public.chat_messages TO authenticated;
