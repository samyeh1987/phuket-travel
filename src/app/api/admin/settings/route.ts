import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (!('user' in auth)) {
    return auth.response;
  }
  const { supabase } = auth;

  try {
    const [settings, banners] = await Promise.all([
      supabase.from('system_settings').select('key, value'),
      supabase.from('banners').select('*').order('sort_order'),
    ]);
    if (settings.error) return NextResponse.json({ error: settings.error.message }, { status: 500 });
    if (banners.error) return NextResponse.json({ error: banners.error.message }, { status: 500 });
    return NextResponse.json({ data: { settings: settings.data, banners: banners.data } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (!('user' in auth)) {
    return auth.response;
  }
  const { supabase } = auth;

  try {
    const { action, table, id, ...payload } = await req.json();

    if (action === 'upsert_setting') {
      const { error } = await supabase
        .from('system_settings')
        .upsert({ key: payload.key, value: payload.value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else if (action === 'insert') {
      const { error } = await supabase.from(table).insert(payload);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else if (action === 'update') {
      const { error } = await supabase.from(table).update(payload).eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else if (action === 'delete') {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
