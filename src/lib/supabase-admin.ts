import { createClient } from '@supabase/supabase-js';

/**
 * Create a Supabase admin client that bypasses RLS.
 * Use this only for server-side operations that need full database access.
 * 
 * IMPORTANT: Using SUPABASE_SERVICE_ROLE_KEY bypasses Row Level Security.
 * This should only be used in server-side API routes, never in client code.
 */
export function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      `Missing Supabase environment variables: ` +
      `NEXT_PUBLIC_SUPABASE_URL=${!!process.env.NEXT_PUBLIC_SUPABASE_URL}, ` +
      `SUPABASE_SERVICE_ROLE_KEY=${!!process.env.SUPABASE_SERVICE_ROLE_KEY}`
    );
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
