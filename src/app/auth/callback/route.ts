import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  // 如果沒有 code，可能是 Supabase 直接重定向過來的其他情況
  if (!code) {
    console.error('[Auth Callback] No code found in params:', Object.fromEntries(searchParams));
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`);
  }

  const cookieStore = await import('next/headers').then(m => m.cookies());
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as any)
          );
        },
      },
    }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error('[Auth Callback] getUser error:', userError);
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(userError.message)}`);
  }

  // 建立或更新 profiles 表
  if (user) {
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      name_cn: user.user_metadata?.name_cn || '',
    }, { onConflict: 'id', ignoreDuplicates: true });

    if (profileError) {
      console.error('[Auth Callback] Profile upsert error:', profileError);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
