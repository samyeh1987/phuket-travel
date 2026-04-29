import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';

/**
 * Lightweight endpoint for verifying admin session.
 * Returns 200 if authenticated, 401/403 otherwise.
 */
export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req);
  
  if (!auth.authorized) {
    return auth.response;
  }
  
  // 返回成功狀態（Body 為空，減少傳輸）
  return new NextResponse(null, { status: 200 });
}
