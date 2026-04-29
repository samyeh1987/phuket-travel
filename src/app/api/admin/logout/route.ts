import { NextResponse } from 'next/server';

/**
 * 管理員登出
 * 清除 session cookies
 */
export async function POST() {
  const response = NextResponse.json({ success: true });

  // 清除 session cookies
  response.cookies.set('admin_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  response.cookies.set('admin_id', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
