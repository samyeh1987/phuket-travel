import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const supabase = createAdminClient();
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
  try {
    const supabase = createAdminClient();
    const payload = await req.json();
    const { error } = await supabase.from('diving_packages').insert(payload);
    if (error) {
      if (error.message?.includes('row-level security')) {
        return NextResponse.json(
          { error: 'RLS 错误：SUPABASE_SERVICE_ROLE_KEY 未正确配置，请检查 Vercel 环境变量。Original: ' + error.message },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { id, ...payload } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const { data: existing } = await supabase
      .from('diving_packages')
      .select('id')
      .eq('id', id)
      .maybeSingle();
    if (!existing) return NextResponse.json({ error: '记录不存在' }, { status: 404 });
    const { error: updateError } = await supabase
      .from('diving_packages')
      .update(payload)
      .eq('id', id);
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
    const { data: updated } = await supabase
      .from('diving_packages')
      .select('*')
      .eq('id', id)
      .single();
    return NextResponse.json({ success: true, data: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createAdminClient();
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
