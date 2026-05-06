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
      // 使用可能是 slug 或 name 或 id，尝试多种匹配方式
      let islandData;

      // 1. 尝试按 slug 精确匹配
      let { data, error } = await supabase
        .from('islands')
        .select('id, name, slug, description, image_url, images')
        .eq('slug', slug)
        .limit(1);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // 2. 如果没找到，尝试按 id 匹配
      if (!data || data.length === 0) {
        ({ data, error } = await supabase
          .from('islands')
          .select('id, name, slug, description, image_url, images')
          .eq('id', slug)
          .limit(1));
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // 3. 如果还没找到，尝试按 name 匹配
      if (!data || data.length === 0) {
        ({ data, error } = await supabase
          .from('islands')
          .select('id, name, slug, description, image_url, images')
          .ilike('name', slug)
          .limit(1));
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data || data.length === 0) {
        return NextResponse.json({ error: '岛屿不存在' }, { status: 404 });
      }

      islandData = data[0];

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
      .select('id, name, slug, description, image_url, images')
      .eq('is_active', true)
      .order('sort_order');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
