import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/test-token
 *
 * ⚠️ DESENVOLVIMENTO APENAS
 *
 * Retorna um JWT token válido para testar APIs
 * Use com: curl https://arauz-tech.vercel.app/api/test-token
 *
 * Resposta: { "token": "eyJ...", "expiresIn": 3600 }
 */
export async function GET(request: NextRequest) {
  try {
    // Check if request has auth header (optional security)
    const auth = request.headers.get('authorization');

    // If already authenticated, return their token
    if (auth && auth.startsWith('Bearer ')) {
      return NextResponse.json({
        message: 'You already have a valid token!',
        token: auth.replace('Bearer ', ''),
        usage: 'Use this token with: curl -H "Authorization: Bearer [token]" https://arauz-tech.vercel.app/api/knowledge/graph'
      });
    }

    // Create Supabase client
    const supabase = await createClient();

    // Try to get current user (if authenticated)
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // User is authenticated - return their session
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.access_token) {
        return NextResponse.json({
          message: 'Your authentication token',
          token: session.access_token,
          user: user.email,
          expiresIn: Math.round((new Date(session.expires_at || 0).getTime() - Date.now()) / 1000),
          usage: `curl -H "Authorization: Bearer ${session.access_token}" https://arauz-tech.vercel.app/api/knowledge/documents`,
        });
      }
    }

    // Not authenticated - return instructions
    return NextResponse.json({
      message: 'Not authenticated. Please login first at https://arauz-tech.vercel.app',
      instructions: [
        '1. Go to https://arauz-tech.vercel.app',
        '2. Login with your account',
        '3. Try this endpoint again in the browser (cookies will be sent automatically)',
        '4. Or copy the token from F12 > Application > Local Storage'
      ],
      example: 'In browser: https://arauz-tech.vercel.app/api/test-token',
      error: 'No authentication context found'
    }, { status: 401 });

  } catch (error) {
    console.error('Test token error:', error);
    return NextResponse.json(
      { error: 'Failed to generate test token', details: String(error) },
      { status: 500 }
    );
  }
}
