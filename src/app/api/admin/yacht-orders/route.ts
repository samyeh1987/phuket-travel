import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from('yacht_orders')
      .select('*, yacht_passengers(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching yacht orders:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
