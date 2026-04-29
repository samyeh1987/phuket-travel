import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET() {
  const supabase = createAdminClient();

  try {
    // 从 orders 表获取已付款的订单作为财务流水
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*, admin_users(email)')
      .eq('payment_status', 'paid')
      .order('paid_at', { ascending: false });

    if (ordersError) return NextResponse.json({ error: ordersError.message }, { status: 500 });

    // 转换为统一格式
    const transactions = (orders || []).map(order => ({
      id: order.id,
      order_id: order.id,
      order_number: order.order_number,
      order_type: order.type,
      amount: order.total_price,
      payment_method: order.payment_method || 'unknown',
      proof_url: order.payment_proof_url,
      status: 'completed',
      admin_id: order.reviewed_by,
      created_at: order.paid_at || order.updated_at,
      paid_at: order.paid_at,
      contact_name_cn: order.contact_name_cn,
      contact_phone: order.contact_phone,
      admin_users: order.admin_users,
    }));

    return NextResponse.json({ data: transactions });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
