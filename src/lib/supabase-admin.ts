import { createServerClient, type CookieOptions } from '@supabase/ssr';

/**
 * Create a Supabase client for server-side operations.
 * Uses ANON_KEY for auth (to read user sessions) and SERVICE_ROLE_KEY for data (bypasses RLS).
 */
export function createServerSupabaseClient(cookies: {
  getAll(): { name: string; value: string }[];
  setAll?(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]): void;
}) {
  // Use ANON_KEY for authentication (to read user sessions from cookies)
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          if (cookies.setAll) {
            cookies.setAll(cookiesToSet);
          }
        },
      },
    }
  );
}

/**
 * Create a Supabase admin client that bypasses RLS.
 * Use this only for server-side operations that need full database access.
 */
export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );
}
