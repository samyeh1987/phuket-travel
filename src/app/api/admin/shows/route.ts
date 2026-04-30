import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET() {
  const supabase = createAdminClient();

  try {
    const [shows, packages] = await Promise.all([
      supabase.from('shows').select('*').order('sort_order'),
      supabase.from('show_packages').select('*').order('sort_order'),
    ]);
    if (shows.error) return NextResponse.json({ error: shows.error.message }, { status: 500 });
    if (packages.error) return NextResponse.json({ error: packages.error.message }, { status: 500 });
    return NextResponse.json({ data: { shows: shows.data, packages: packages.data } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = createAdminClient();

  try {
    const { table, ...payload } = await req.json();
    const { error } = await supabase.from(table).insert(payload);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const supabase = createAdminClient();

  try {
    const { table, id, ...payload } = await req.json();
    console.log('[PUT shows] table:', table, 'id:', id);
    console.log('[PUT shows] payload:', JSON.stringify(payload));
    // Check if record exists
    const { data: existing } = await supabase.from(table).select('id').eq('id', id).maybeSingle();
    if (!existing) return NextResponse.json({ error: '记录不存在' }, { status: 404 });
    // Update
    const { error: updateError } = await supabase.from(table).update(payload).eq('id', id);
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
    // Fetch updated record
    const { data: updated } = await supabase.from(table).select('*').eq('id', id).single();
    console.log('[PUT shows] updated record:', JSON.stringify(updated));
    return NextResponse.json({ success: true, data: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = createAdminClient();

  try {
    const { searchParams } = new URL(req.url);
    const table = searchParams.get('table');
    const id = searchParams.get('id');
    if (!table || !id) return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
