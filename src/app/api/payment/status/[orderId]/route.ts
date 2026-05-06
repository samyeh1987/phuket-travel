import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { error: '缺少 orderId' },
        { status: 400 }
      );
    }

    // 使用 admin client 查詢（繞過 RLS，確保付款頁能正常顯示）
    const supabase = createAdminClient();

    // 查詢訂單（返回完整訂單供付款頁展示）
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError) {
      console.error('查詢訂單錯誤:', orderError);
      return NextResponse.json(
        { error: '查詢訂單失敗' },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { error: '訂單不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: order });

  } catch (e: any) {
    console.error('付款狀態查詢 API 錯誤:', e);
    return NextResponse.json(
      { error: e.message || '伺服器錯誤' },
      { status: 500 }
    );
  }
}
