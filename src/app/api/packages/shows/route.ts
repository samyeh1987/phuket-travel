import { createAdminClient } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const [{ data: shows, error: showsError }, { data: packages, error: packagesError }] = await Promise.all([
      supabase.from('shows').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('show_packages').select('*').eq('is_active', true).order('sort_order'),
    ]);
    if (showsError) return NextResponse.json({ error: showsError.message }, { status: 500 });
    if (packagesError) return NextResponse.json({ error: packagesError.message }, { status: 500 });
    return NextResponse.json({ data: { shows, packages } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
