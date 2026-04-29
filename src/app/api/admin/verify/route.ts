import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-admin';

/**
 * Lightweight endpoint for verifying admin session.
 * Returns 200 if authenticated, 401/403 otherwise.
 */
export async function GET(req: NextRequest) {
  try {
    // 讀取 cookies
    const cookies = req.cookies.getAll();
    console.log('[verify] Cookies received:', cookies.map(c => c.name));
    
    // 創建服務端客戶端（使用 ANON_KEY 讀取 session）
    const supabase = createServerSupabaseClient({
      getAll() {
        return cookies;
      },
    });

    // 獲取用戶 session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('[verify] Auth error:', authError.message);
    }
    
    if (!user) {
      console.log('[verify] No user found in session');
      return NextResponse.json({ error: 'Unauthorized', reason: 'no_session' }, { status: 401 });
    }
    
    console.log('[verify] User found:', user.email);

    // 使用 SERVICE_ROLE_KEY 客戶端檢查 admin_users 表
    const adminDb = createAdminClient();
    const { data: adminUser, error: adminError } = await adminDb
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (adminError) {
      console.log('[verify] Admin check error:', adminError.message);
    }
    
    if (!adminUser) {
      console.log('[verify] User is not an admin:', user.id);
      return NextResponse.json({ error: 'Forbidden', reason: 'not_admin' }, { status: 403 });
    }

    console.log('[verify] Admin verified successfully');
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e: any) {
    console.error('[verify] Unexpected error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
