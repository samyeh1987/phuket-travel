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
  console.log('>>> 环境变量检查:',
    'NEXT_PUBLIC_SUPABASE_URL =', process.env.NEXT_PUBLIC_SUPABASE_URL ? '已设置' : '未设置!',
    'SUPABASE_SERVICE_ROLE_KEY =', process.env.SUPABASE_SERVICE_ROLE_KEY ? '已设置' : '未设置!'
  );
  
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

    // 验证订单存在
    const { data: currentOrder, error: queryError } = await supabase
      .from('orders')
      .select('id, status, payment_status, contact_status')
      .eq('id', orderId)
      .maybeSingle();
    
    console.log('>>> 当前订单:', JSON.stringify(currentOrder), 'queryError:', queryError);

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
      console.log('>>> 执行 update_status: 当前状态 =', currentOrder.status, '-> 新状态 =', payload.status);
      updatedFields.status = payload.status;
      
      // 详细日志：打印要更新的字段
      console.log('>>> update_status 准备更新:', { id: orderId, fields: updatedFields });
      
      // 使用 select 获取更新结果，并使用.returning() 或 .select('*')
      const result = await supabase
        .from('orders')
        .update(updatedFields)
        .eq('id', orderId)
        .select('*')
        .maybeSingle();
      
      console.log('>>> update_status 结果 - data:', JSON.stringify(result?.data), 'error:', result?.error, 'count:', result?.data ? 1 : 0);
      
      if (result?.error) {
        console.error('>>> update_status 失败:', result.error);
        return NextResponse.json({ error: result.error.message }, { status: 500 });
      }

      // 验证更新是否成功 - 检查是否有数据返回
      if (!result?.data) {
        // 尝试单独查询看订单是否存在
        const checkResult = await supabase.from('orders').select('id, status').eq('id', orderId).maybeSingle();
        console.log('>>> 更新后查询订单:', JSON.stringify(checkResult));
        
        if (checkResult?.data) {
          // 订单存在但返回null，可能是权限问题
          console.error('>>> 订单存在但更新返回null，可能是 RLS 策略问题');
          return NextResponse.json({ error: 'Update blocked by RLS policy', detail: 'Order exists but update was blocked' }, { status: 500 });
        } else {
          console.error('>>> update_status 没有返回数据，订单可能不存在');
          return NextResponse.json({ error: 'Update failed - no rows affected' }, { status: 500 });
        }
      }
      
      console.log('>>> update_status 成功, 更新后订单状态:', result.data.status);
      return NextResponse.json({ success: true, updated: result.data, previousStatus: currentOrder.status });
      
    } else if (action === 'update_payment') {
      console.log('>>> 执行 update_payment: 当前状态 =', currentOrder.payment_status, '-> 新状态 =', payload.payment_status);
      updatedFields.payment_status = payload.payment_status;
      
      if (payload.payment_status === 'paid') {
        updatedFields.paid_at = new Date().toISOString();
      }
      if (payload.notes) {
        updatedFields.customer_service_notes = payload.notes;
      }
      
      const result = await supabase
        .from('orders')
        .update(updatedFields)
        .eq('id', orderId)
        .select('*')
        .maybeSingle();
      
      console.log('>>> update_payment 结果 - data:', JSON.stringify(result?.data), 'error:', result?.error);
      
      if (result?.error) {
        console.error('>>> update_payment 失败:', result.error);
        return NextResponse.json({ error: result.error.message }, { status: 500 });
      }

      if (!result?.data) {
        console.error('>>> update_payment 没有返回数据，可能更新失败');
        return NextResponse.json({ error: 'Update failed - no rows affected' }, { status: 500 });
      }

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
      
      console.log('>>> update_payment 成功, 更新后订单付款状态:', result.data.payment_status);
      return NextResponse.json({ success: true, updated: result.data, previousStatus: currentOrder.payment_status });
      
    } else if (action === 'update_contact') {
      console.log('>>> 执行 update_contact: 当前状态 =', currentOrder.contact_status, '-> 新状态 =', payload.contact_status);
      updatedFields.contact_status = payload.contact_status;
      
      const result = await supabase
        .from('orders')
        .update(updatedFields)
        .eq('id', orderId)
        .select('*')
        .maybeSingle();
      
      console.log('>>> update_contact 结果 - data:', JSON.stringify(result?.data), 'error:', result?.error);
      
      if (result?.error) {
        console.error('>>> update_contact 失败:', result.error);
        return NextResponse.json({ error: result.error.message }, { status: 500 });
      }

      if (!result?.data) {
        console.error('>>> update_contact 没有返回数据，可能更新失败');
        return NextResponse.json({ error: 'Update failed - no rows affected' }, { status: 500 });
      }
      
      console.log('>>> update_contact 成功, 更新后订单联系状态:', result.data.contact_status);
      return NextResponse.json({ success: true, updated: result.data, previousStatus: currentOrder.contact_status });
      
    } else {
      console.log('>>> 未知 action:', action);
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

  } catch (e: any) {
    console.error('>>> PATCH 异常:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
