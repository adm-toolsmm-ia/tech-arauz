export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

/**
 * Fallback: call OpenAI directly when the Python FastAPI service is unavailable.
 * Fetches agent config from Supabase and builds a chat completion request.
 */
async function chatFallback(
  agentId: string,
  message: string,
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
) {
  // 1. Fetch agent config from Supabase
  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select(
      'name, persona, prompt_objective, model_provider, model_id, model_temperature, model_max_tokens',
    )
    .eq('id', agentId)
    .single();

  if (agentError || !agent) {
    console.error('[chat/fallback] Agent not found:', agentError);
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  if (!OPENAI_API_KEY) {
    console.error('[chat/fallback] OPENAI_API_KEY not configured');
    return NextResponse.json({ error: 'LLM not configured' }, { status: 500 });
  }

  const systemContent = [
    agent.persona || 'You are a helpful assistant.',
    agent.prompt_objective ? `\nObjective: ${agent.prompt_objective}` : '',
  ].join('');

  const model = agent.model_id || 'gpt-4o';
  const temperature = agent.model_temperature ?? 0.7;
  const maxTokens = agent.model_max_tokens ?? 2000;

  // 2. Call OpenAI Chat Completions API directly
  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: message },
      ],
    }),
  });

  if (!openaiRes.ok) {
    const errBody = await openaiRes.text();
    console.error('[chat/fallback] OpenAI error:', openaiRes.status, errBody);
    return NextResponse.json({ error: 'Failed to generate response from LLM' }, { status: 502 });
  }

  const openaiData = await openaiRes.json();
  const answer = openaiData.choices?.[0]?.message?.content || 'Sem resposta do modelo.';
  const tokensUsed =
    (openaiData.usage?.prompt_tokens || 0) + (openaiData.usage?.completion_tokens || 0);

  return NextResponse.json({
    session_id: `fallback-${Date.now()}`,
    message_id: `fb-${Date.now()}`,
    answer,
    response: answer, // compat with GlobalChatbot reading data.response
    tokens_used: tokensUsed,
    cost_usd: 0,
    duration_ms: 0,
    fallback: true,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get JWT session token
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return NextResponse.json({ error: 'No session token' }, { status: 401 });
  }

  // Parse request body
  const body = await request.json();

  if (!body.message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`${AI_SERVICE_URL}/api/agents/${id}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        session_id: body.session_id,
        message: body.message,
      }),
    });

    if (!res.ok) {
      // If FastAPI returns 503 or 502, fall back to direct LLM call
      if (res.status === 503 || res.status === 502) {
        console.warn('[agents/[id]/chat/POST] AI service unavailable, using fallback');
        return chatFallback(id, body.message, supabase);
      }

      const error = await res.json();
      return NextResponse.json(error, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    // Network error (FastAPI not reachable at all) → fallback
    console.warn('[agents/[id]/chat/POST] Proxy error, using fallback:', error);
    return chatFallback(id, body.message, supabase);
  }
}
