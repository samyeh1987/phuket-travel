import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from './supabase-admin';

/**
 * Verify that the current request is from an authenticated admin user.
 */
export async function verifyAdmin(req?: NextRequest): Promise<
  { authorized: true; user: any; supabase: ReturnType<typeof createAdminClient> } |
  { authorized: false; response: NextResponse }
> {
  // Use ANON_KEY client to read user session from cookies
  const supabase = createServerSupabaseClient({
    getAll() {
      if (req) {
        return req.cookies.getAll();
      }
      return [];
    },
    setAll(cookiesToSet) {
      // This is for response cookies
    },
  });

  // Get the user's session from cookies (uses ANON_KEY for auth)
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { status: 401 })
    };
  }

  // Use SERVICE_ROLE_KEY client to check admin_users table (bypasses RLS)
  const adminDb = createAdminClient();
  const { data: adminUser, error: adminError } = await adminDb
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .single();

  if (adminError || !adminUser) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Forbidden - Not an admin' }, { status: 403 })
    };
  }

  // Return admin client for data operations (bypasses RLS)
  return { 
    authorized: true,
    user, 
    supabase: adminDb
  };
}
