import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

/**
 * 驗證管理員會話
 * 使用獨立的管理員 session cookie
 */
export async function GET(req: NextRequest) {
  try {
    // 檢查環境變量
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[verify] SUPABASE_SERVICE_ROLE_KEY not configured');
      return NextResponse.json({ error: 'Server config error', reason: 'service_role_missing' }, { status: 500 });
    }

    // 讀取 admin session cookie
    const adminId = req.cookies.get('admin_id')?.value;
    const adminSession = req.cookies.get('admin_session')?.value;

    console.log('[verify] Admin ID from cookie:', adminId);
    console.log('[verify] Admin session exists:', !!adminSession);

    if (!adminId || !adminSession) {
      console.log('[verify] No admin session found');
      return NextResponse.json({ error: 'Unauthorized', reason: 'no_session' }, { status: 401 });
    }

    // 驗證 session 是否有效（基本檢查）
    try {
      const decoded = Buffer.from(adminSession, 'base64').toString('utf-8');
      const [sessionId, timestamp] = decoded.split(':');
      
      // 檢查 session 是否過期（7天）
      const sessionAge = Date.now() - parseInt(timestamp);
      const maxAge = 7 * 24 * 60 * 60 * 1000;
      
      if (sessionAge > maxAge) {
        console.log('[verify] Session expired');
        return NextResponse.json({ error: 'Unauthorized', reason: 'session_expired' }, { status: 401 });
      }

      if (sessionId !== adminId) {
        console.log('[verify] Session ID mismatch');
        return NextResponse.json({ error: 'Unauthorized', reason: 'invalid_session' }, { status: 401 });
      }
    } catch (e) {
      console.log('[verify] Invalid session format');
      return NextResponse.json({ error: 'Unauthorized', reason: 'invalid_session' }, { status: 401 });
    }

    // 使用 SERVICE_ROLE_KEY 驗證管理員是否存在
    const adminDb = createAdminClient();
    const { data: adminUser, error: adminError } = await adminDb
      .from('admin_users')
      .select('id, email, name')
      .eq('id', adminId)
      .single();

    if (adminError || !adminUser) {
      console.log('[verify] Admin not found in database');
      return NextResponse.json({ error: 'Forbidden', reason: 'not_admin' }, { status: 403 });
    }

    console.log('[verify] Admin verified:', adminUser.email);
    return NextResponse.json({ success: true, admin: adminUser }, { status: 200 });
  } catch (e: any) {
    console.error('[verify] Unexpected error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
