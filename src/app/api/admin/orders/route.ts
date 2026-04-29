import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET() {
  const supabase = createAdminClient();

  try {
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

    console.log('>>> 解析后 - action:', action, 'orderId:', orderId, 'payload:', JSON.stringify(payload));

    if (!orderId) {
      console.error('>>> orderId 为空!');
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    // 先查询当前订单状态
    console.log('>>> 查询当前订单状态...');
    const { data: currentOrder, error: queryError } = await supabase
      .from('orders')
      .select('id, status, payment_status, contact_status')
      .eq('id', orderId)
      .maybeSingle();  // 使用 maybeSingle 避免没有记录时抛出错误
    
    console.log('>>> 当前订单:', JSON.stringify(currentOrder), '错误:', queryError);

    if (queryError) {
      console.error('>>> 查询订单失败:', queryError);
      return NextResponse.json({ error: queryError.message }, { status: 500 });
    }

    if (!currentOrder) {
      console.error('>>> 订单不存在:', orderId);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    let updatedFields: Record<string, any> = {};

    if (action === 'update_status') {
      console.log('>>> 执行 update_status: 新状态 =', payload.status);
      updatedFields.status = payload.status;
      
      const { data, error } = await supabase
        .from('orders')
        .update(updatedFields)
        .eq('id', orderId);
      
      console.log('>>> update_status 结果 - data:', JSON.stringify(data), 'error:', error);
      
      if (error) {
        console.error('>>> update_status 失败:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      // 查询更新后的订单
      const { data: updatedOrder } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();
      
      console.log('>>> update_status 成功, 更新后订单:', JSON.stringify(updatedOrder));
      return NextResponse.json({ success: true, updated: updatedOrder });
      
    } else if (action === 'update_payment') {
      console.log('>>> 执行 update_payment: 新状态 =', payload.payment_status);
      updatedFields.payment_status = payload.payment_status;
      
      if (payload.payment_status === 'paid') {
        updatedFields.paid_at = new Date().toISOString();
      }
      if (payload.notes) {
        updatedFields.customer_service_notes = payload.notes;
      }
      
      const { data, error } = await supabase
        .from('orders')
        .update(updatedFields)
        .eq('id', orderId);
      
      console.log('>>> update_payment 结果 - data:', JSON.stringify(data), 'error:', error);
      
      if (error) {
        console.error('>>> update_payment 失败:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // 查询更新后的订单
      const { data: updatedOrder } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

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
      
      console.log('>>> update_payment 成功, 更新后订单:', JSON.stringify(updatedOrder));
      return NextResponse.json({ success: true, updated: updatedOrder });
      
    } else if (action === 'update_contact') {
      console.log('>>> 执行 update_contact: 新状态 =', payload.contact_status);
      updatedFields.contact_status = payload.contact_status;
      
      const { data, error } = await supabase
        .from('orders')
        .update(updatedFields)
        .eq('id', orderId);
      
      console.log('>>> update_contact 结果 - data:', JSON.stringify(data), 'error:', error);
      
      if (error) {
        console.error('>>> update_contact 失败:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      // 查询更新后的订单
      const { data: updatedOrder } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();
      
      console.log('>>> update_contact 成功, 更新后订单:', JSON.stringify(updatedOrder));
      return NextResponse.json({ success: true, updated: updatedOrder });
      
    } else {
      console.log('>>> 未知 action:', action);
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

  } catch (e: any) {
    console.error('>>> PATCH 异常:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
