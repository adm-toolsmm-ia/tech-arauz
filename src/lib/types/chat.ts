export interface AgentSessionWithAgent {
  id: string;
  user_id: string;
  agent_id: string;
  agent_name: string;
  started_at: string;
  ended_at: string | null;
  status: 'active' | 'paused' | 'closed';
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface SessionsResponse {
  sessions: AgentSessionWithAgent[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
