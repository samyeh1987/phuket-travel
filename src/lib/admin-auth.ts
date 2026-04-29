import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from './supabase-admin';

/**
 * Verify that the current request is from an authenticated admin user.
 * Uses independent admin session cookies instead of Supabase Auth.
 */
export async function verifyAdmin(req?: NextRequest): Promise<
  { authorized: true; adminId: string; supabase: ReturnType<typeof createAdminClient> } |
  { authorized: false; response: NextResponse }
> {
  if (!req) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Unauthorized', details: 'No request' }, { status: 401 })
    };
  }

  // 檢查環境變量
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[verifyAdmin] SUPABASE_SERVICE_ROLE_KEY not configured');
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Server config error', details: 'service_role_missing' }, { status: 500 })
    };
  }

  // 讀取 admin session cookies
  const adminId = req.cookies.get('admin_id')?.value;
  const adminSession = req.cookies.get('admin_session')?.value;

  console.log('[verifyAdmin] Admin ID from cookie:', adminId);

  if (!adminId || !adminSession) {
    console.log('[verifyAdmin] No admin session found');
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Unauthorized', details: 'no_session' }, { status: 401 })
    };
  }

  // 驗證 session 格式
  try {
    const decoded = Buffer.from(adminSession, 'base64').toString('utf-8');
    const [sessionId, timestamp] = decoded.split(':');
    
    // 檢查 session 是否過期（7天）
    const sessionAge = Date.now() - parseInt(timestamp);
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    
    if (sessionAge > maxAge) {
      console.log('[verifyAdmin] Session expired');
      return {
        authorized: false,
        response: NextResponse.json({ error: 'Unauthorized', details: 'session_expired' }, { status: 401 })
      };
    }

    if (sessionId !== adminId) {
      console.log('[verifyAdmin] Session ID mismatch');
      return {
        authorized: false,
        response: NextResponse.json({ error: 'Unauthorized', details: 'invalid_session' }, { status: 401 })
      };
    }
  } catch (e) {
    console.log('[verifyAdmin] Invalid session format');
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Unauthorized', details: 'invalid_session' }, { status: 401 })
    };
  }

  // 使用 SERVICE_ROLE_KEY 客戶端驗證管理員是否存在
  const adminDb = createAdminClient();
  const { data: adminUser, error: adminError } = await adminDb
    .from('admin_users')
    .select('id')
    .eq('id', adminId)
    .single();

  if (adminError || !adminUser) {
    console.log('[verifyAdmin] Admin not found in database');
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Forbidden', details: 'not_admin' }, { status: 403 })
    };
  }

  // 返回成功
  return { 
    authorized: true,
    adminId,
    supabase: adminDb
  };
}
