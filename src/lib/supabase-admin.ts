import { createServerClient, type CookieOptions } from '@supabase/ssr';

export function createServerSupabaseClient(cookies: {
  getAll(): { name: string; value: string }[];
  setAll?(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]): void;
}) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookies.getAll();
        },
        setAll(cookiesToSet) {
          if (cookies.setAll) {
            cookies.setAll(cookiesToSet);
          }
        },
      },
    }
  );
}
