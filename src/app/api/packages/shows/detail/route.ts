import { createAdminClient } from '@/lib/supabase-admin';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/packages/shows/detail?slug=xxx
// 通过 slug、name 或 id 查找秀场详情及套餐
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('slug');

    if (!key) {
      return NextResponse.json({ error: '缺少 slug 参数' }, { status: 400 });
    }

    const supabase = createAdminClient();
    let showData = null;

    // 1. 先用 slug 精确匹配
    const { data: bySlug } = await supabase
      .from('shows')
      .select('*')
      .eq('slug', key)
      .maybeSingle();

    if (bySlug) {
      showData = bySlug;
    }

    // 2. 尝试 URL decode 后匹配 slug（兼容中文 slug）
    if (!showData) {
      try {
        const decoded = decodeURIComponent(key);
        if (decoded !== key) {
          const { data: byDecodedSlug } = await supabase
            .from('shows')
            .select('*')
            .eq('slug', decoded)
            .maybeSingle();
          if (byDecodedSlug) showData = byDecodedSlug;
        }
      } catch (_) {}
    }

    // 3. 匹配 name
    if (!showData) {
      try {
        const decoded = decodeURIComponent(key);
        const { data: byName } = await supabase
          .from('shows')
          .select('*')
          .eq('name', decoded)
          .maybeSingle();
        if (byName) showData = byName;
      } catch (_) {}
    }

    // 4. 不区分大小写匹配 slug
    if (!showData) {
      const { data: byIlike } = await supabase
        .from('shows')
        .select('*')
        .ilike('slug', key)
        .maybeSingle();
      if (byIlike) showData = byIlike;
    }

    // 5. 按 id 匹配（终极 fallback）
    if (!showData) {
      const { data: byId } = await supabase
        .from('shows')
        .select('*')
        .eq('id', key)
        .maybeSingle();
      if (byId) showData = byId;
    }

    if (!showData) {
      return NextResponse.json({ error: '秀场不存在' }, { status: 404 });
    }

    // 查询套餐
    const { data: packages, error: pkgError } = await supabase
      .from('show_packages')
      .select('*')
      .eq('show_id', showData.id)
      .eq('is_active', true)
      .order('sort_order');

    if (pkgError) {
      console.error('套餐查询失败:', pkgError);
    }

    return NextResponse.json({
      data: {
        show: showData,
        packages: packages || [],
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
