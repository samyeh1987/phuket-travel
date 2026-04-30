import { createClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient();
  const [{ data: shows, error: showsError }, { data: packages, error: packagesError }] = await Promise.all([
    supabase.from('shows').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('show_packages').select('*').eq('is_active', true).order('sort_order'),
  ]);
  if (showsError) return NextResponse.json({ error: showsError.message }, { status: 500 });
  if (packagesError) return NextResponse.json({ error: packagesError.message }, { status: 500 });
  return NextResponse.json({ data: { shows, packages } });
}
