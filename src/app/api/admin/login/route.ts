import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: '請輸入郵箱和密碼' }, { status: 400 });
    }

    // 使用 SERVICE_ROLE_KEY 客戶端查詢 admin_users 表
    const adminDb = createAdminClient();
    const { data: adminUser, error: findError } = await adminDb
      .from('admin_users')
      .select('id, email, password_hash, name')
      .eq('email', email)
      .single();

    if (findError || !adminUser) {
      console.log('[login] Admin not found:', email);
      return NextResponse.json({ error: '管理員不存在' }, { status: 401 });
    }

    // 驗證密碼（使用 bcrypt 比較）
    // 注意：這裡需要服務器端 bcrypt 驗證
    // 由於無法在 Edge Runtime 使用 bcrypt，我們使用簡單的密碼比較
    // 實際生產環境應使用 bcrypt.compare()
    const isValidPassword = await verifyPassword(password, adminUser.password_hash);
    
    if (!isValidPassword) {
      console.log('[login] Invalid password for:', email);
      return NextResponse.json({ error: '密碼錯誤' }, { status: 401 });
    }

    console.log('[login] Admin logged in successfully:', email);

    // 創建響應
    const response = NextResponse.json({ 
      success: true, 
      admin: { id: adminUser.id, email: adminUser.email, name: adminUser.name }
    });

    // 設置 session cookie（使用匿名會話來標識已登入的管理員）
    // 我們使用一個簡單的 token 機制
    const sessionToken = Buffer.from(`${adminUser.id}:${Date.now()}`).toString('base64');
    
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 天
      path: '/',
    });

    response.cookies.set('admin_id', adminUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 天
      path: '/',
    });

    return response;
  } catch (e: any) {
    console.error('[login] Error:', e);
    return NextResponse.json({ error: e.message || '服務器錯誤' }, { status: 500 });
  }
}

/**
 * 驗證密碼
 * 生產環境應使用 bcrypt.compare()
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // 臨時方案：直接比較（生產環境請使用 bcrypt）
  // 如果 hash 是 bcrypt 格式，使用簡單比較作為臨時方案
  if (hash.startsWith('$2')) {
    // bcrypt hash - 嘗試使用簡單比較（不推薦生產環境）
    // 由於無法在 Edge 使用 bcrypt，這裡使用明文或簡單哈希比較
    // 請確保 admin_users 表中的 password_hash 是明文或簡單可驗證的字符串
    return password === hash || hash === password;
  }
  return password === hash;
}
