import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET() {
  const supabase = createAdminClient();

  try {
    // 从 orders 表获取已付款的订单作为财务流水
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_status', 'paid')
      .order('paid_at', { ascending: false, nullsFirst: false });

    if (ordersError) return NextResponse.json({ error: ordersError.message }, { status: 500 });

    // 如果有 reviewed_by，批量查询管理员信息
    const allReviewerIds = (orders || []).map((o: any) => o.reviewed_by).filter(Boolean);
    const reviewerIds = allReviewerIds.filter((id: string, idx: number) => allReviewerIds.indexOf(id) === idx);
    let adminMap: Record<string, string> = {};
    if (reviewerIds.length > 0) {
      const { data: admins } = await supabase
        .from('admin_users')
        .select('id, email')
        .in('id', reviewerIds);
      (admins || []).forEach((a: any) => { adminMap[a.id] = a.email; });
    }

    // 转换为统一格式
    const transactions = (orders || []).map((order: any) => ({
      id: order.id,
      order_number: order.order_number,
      order_type: order.type,
      amount: order.total_price,
      payment_method: order.payment_method || 'unknown',
      proof_url: order.payment_proof_url,
      created_at: order.paid_at || order.updated_at,
      contact_name_cn: order.contact_name_cn,
      contact_phone: order.contact_phone,
      reviewer_email: order.reviewed_by ? adminMap[order.reviewed_by] || '系统' : '系统',
    }));

    return NextResponse.json({ data: transactions });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
