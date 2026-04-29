import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from './supabase-admin';

/**
 * Verify that the current request is from an authenticated admin user.
 * Returns the user object if valid, or a 401 NextResponse if not.
 */
export async function verifyAdmin(req?: NextRequest) {
  const supabase = createServerSupabaseClient({
    getAll() {
      if (req) {
        return req.cookies.getAll();
      }
      // Fallback for middleware or other contexts
      return [];
    },
    setAll(cookiesToSet) {
      // This is for response cookies, not needed for verification
    },
  });

  // Get the user's session from cookies
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    };
  }

  // Check if user is in admin_users table
  const { data: adminUser, error: adminError } = await supabase
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

  return { user, supabase };
}
