import { createBrowserClient, type CookieOptions } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (typeof document === 'undefined') return [];
          return document.cookie.split('; ').map(pair => {
            const [name, ...valueParts] = pair.split('=');
            return { name, value: valueParts.join('=') };
          }).filter(c => c.name);
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          if (typeof document === 'undefined') return;
          cookiesToSet.forEach(({ name, value, options }) => {
            const expires = options?.expires
              ? `; expires=${new Date(options.expires).toUTCString()}`
              : '';
            const path = options?.path ? `; path=${options.path}` : '; path=/';
            const domain = options?.domain ? `; domain=${options.domain}` : '';
            const secure = options?.secure ? '; Secure' : '';
            const sameSite = options?.sameSite
              ? `; SameSite=${options.sameSite}`
              : '; SameSite=Lax';
            document.cookie = `${name}=${value}${expires}${path}${domain}${secure}${sameSite}`;
          });
        },
      },
    }
  );
}
