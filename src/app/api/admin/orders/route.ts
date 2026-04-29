import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET() {
  const supabase = createAdminClient();

  try {
    // 直接查詢 orders 表，不關聯 profiles
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.log('Orders found:', data?.length);
    return NextResponse.json({ data });
  } catch (e: any) {
    console.error('GET error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  console.log('>>> PATCH /api/admin/orders 被调用');
  
  const supabase = createAdminClient();

  try {
    const body = await req.json();
    console.log('>>> 请求体:', JSON.stringify(body));
    
    const { action, orderId, ...payload } = body;

    console.log('>>> action:', action, 'orderId:', orderId);

    if (action === 'update_status') {
      console.log('>>> 执行 update_status:', payload.status);
      const { error } = await supabase
        .from('orders')
        .update({ status: payload.status })
        .eq('id', orderId);
      if (error) {
        console.error('>>> update_status 失败:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      console.log('>>> update_status 成功');
    } else if (action === 'update_payment') {
      console.log('>>> 执行 update_payment:', payload.payment_status);
      const updateData: any = { payment_status: payload.payment_status };
      if (payload.payment_status === 'paid') {
        updateData.paid_at = new Date().toISOString();
      }
      if (payload.notes) {
        updateData.customer_service_notes = payload.notes;
      }
      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);
      if (error) {
        console.error('>>> update_payment 失败:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      console.log('>>> update_payment 成功');

      // 如果是确认付款，写入财务流水
      if (payload.payment_status === 'paid' && payload.orderData) {
        console.log('>>> 写入财务流水...');
        await supabase.from('payment_transactions').insert({
          order_id: orderId,
          order_number: payload.orderData.order_number,
          order_type: payload.orderData.type,
          amount: payload.orderData.total_price,
          payment_method: payload.orderData.payment_method || 'unknown',
          proof_url: payload.orderData.payment_proof_url,
          status: 'completed',
        });
      }
    } else if (action === 'update_contact') {
      console.log('>>> 执行 update_contact:', payload.contact_status);
      const { error } = await supabase
        .from('orders')
        .update({ contact_status: payload.contact_status })
        .eq('id', orderId);
      if (error) {
        console.error('>>> update_contact 失败:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      console.log('>>> update_contact 成功');
    } else {
      console.log('>>> 未知 action:', action);
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('>>> PATCH 异常:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
