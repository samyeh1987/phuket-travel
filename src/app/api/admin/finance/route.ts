import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET() {
  const auth = await verifyAdmin();
  if (!('user' in auth)) {
    return auth.response;
  }
  const { supabase } = auth;

  try {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*, admin_users(email)')
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
