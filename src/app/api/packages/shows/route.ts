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
    // Clean zero-width chars and normalize whitespace
    const cleanStr = (s: string) => s?.replace(/[\u200b\u200c\u200d\ufeff]/g, '').replace(/\t/g, ' ').replace(/  +/g, ' ').trim() || s;
    const cleanShows = (shows || []).map((s: any) => ({ ...s, description: cleanStr(s.description) }));
    const cleanPackages = (packages || []).map((p: any) => ({ ...p, description: cleanStr(p.description) }));
    return NextResponse.json({ data: { shows: cleanShows, packages: cleanPackages } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
