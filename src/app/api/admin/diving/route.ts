import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET() {
  const supabase = createAdminClient();

  try {
    const { data, error } = await supabase
      .from('diving_packages')
      .select('*')
      .order('sort_order');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = createAdminClient();

  try {
    const payload = await req.json();
    const { error } = await supabase.from('diving_packages').insert(payload);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const supabase = createAdminClient();

  try {
    const { id, ...payload } = await req.json();
    console.log('[DEBUG PUT] Received payload:', JSON.stringify(payload));
    // First check if record exists
    const { data: existing } = await supabase
      .from('diving_packages')
      .select('id')
      .eq('id', id)
      .maybeSingle();
    if (!existing) return NextResponse.json({ error: '记录不存在' }, { status: 404 });
    console.log('[DEBUG PUT] Record exists, updating...');
    // Update
    const { error: updateError } = await supabase
      .from('diving_packages')
      .update(payload)
      .eq('id', id);
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
    console.log('[DEBUG PUT] Update complete, fetching...');
    // Fetch updated record
    const { data: updated } = await supabase
      .from('diving_packages')
      .select('*')
      .eq('id', id)
      .single();
    console.log('[DEBUG PUT] Updated record:', JSON.stringify(updated));
    return NextResponse.json({ success: true, data: updated });
  } catch (e: any) {
    console.error('[DEBUG PUT] Error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = createAdminClient();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const { error } = await supabase.from('diving_packages').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
