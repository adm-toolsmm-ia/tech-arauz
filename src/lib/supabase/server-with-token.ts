import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Create a Supabase client with a JWT token from Authorization header
 * Used for API routes that accept Bearer tokens
 */
export function createClientFromToken(token: string) {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
}

/**
 * Extract JWT token from Authorization header
 * Expected format: "Bearer eyJ..."
 */
export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}
