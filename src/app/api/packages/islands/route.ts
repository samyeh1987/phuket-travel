import { createAdminClient } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

// GET /api/packages/islands?slug=xxx
export async function GET(req: Request) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (slug) {
      // 按 slug 查询指定岛屿及其船只套餐
      const { data: islandData, error: islandError } = await supabase
        .from('islands')
        .select('id, name, slug, description, image_url')
        .eq('slug', slug)
        .single();

      if (islandError) return NextResponse.json({ error: islandError.message }, { status: 404 });

      const { data: boats, error: boatsError } = await supabase
        .from('island_boats')
        .select('*')
        .eq('island_id', islandData.id)
        .eq('is_active', true)
        .order('sort_order');

      if (boatsError) return NextResponse.json({ error: boatsError.message }, { status: 500 });

      return NextResponse.json({ data: { island: islandData, boats: boats || [] } });
    }

    // 不传 slug 时返回所有活跃岛屿
    const { data, error } = await supabase
      .from('islands')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
