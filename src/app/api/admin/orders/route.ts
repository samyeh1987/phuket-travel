import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.message?.includes('row-level security')) {
        return NextResponse.json(
          { error: 'RLS 错误：SUPABASE_SERVICE_ROLE_KEY 未正确配置，请检查 Vercel 环境变量。Original: ' + error.message },
          { status: 500 }
        );
      }
      console.error('Query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createAdminClient();

    const body = await req.json();
    const { action, orderId, ...payload } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    // 验证订单存在
    const { data: currentOrder, error: queryError } = await supabase
      .from('orders')
      .select('id, status, payment_status, contact_status')
      .eq('id', orderId)
      .maybeSingle();

    if (queryError) {
      return NextResponse.json({ error: queryError.message }, { status: 500 });
    }

    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    let updatedFields: Record<string, any> = {};

    if (action === 'update_status') {
      updatedFields.status = payload.status;

      const result = await supabase
        .from('orders')
        .update(updatedFields)
        .eq('id', orderId)
        .select('*')
        .maybeSingle();

      if (result?.error) {
        return NextResponse.json({ error: result.error.message }, { status: 500 });
      }
      if (!result?.data) {
        return NextResponse.json({ error: 'Update failed - no rows affected' }, { status: 500 });
      }
      return NextResponse.json({ success: true, updated: result.data, previousStatus: currentOrder.status });

    } else if (action === 'update_payment') {
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

      if (result?.error) {
        return NextResponse.json({ error: result.error.message }, { status: 500 });
      }
      if (!result?.data) {
        return NextResponse.json({ error: 'Update failed - no rows affected' }, { status: 500 });
      }

      // 如果是确认付款，写入财务流水
      if (payload.payment_status === 'paid' && payload.orderData) {
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

      return NextResponse.json({ success: true, updated: result.data, previousStatus: currentOrder.payment_status });

    } else if (action === 'update_contact') {
      updatedFields.contact_status = payload.contact_status;

      const result = await supabase
        .from('orders')
        .update(updatedFields)
        .eq('id', orderId)
        .select('*')
        .maybeSingle();

      if (result?.error) {
        return NextResponse.json({ error: result.error.message }, { status: 500 });
      }
      if (!result?.data) {
        return NextResponse.json({ error: 'Update failed - no rows affected' }, { status: 500 });
      }

      return NextResponse.json({ success: true, updated: result.data, previousStatus: currentOrder.contact_status });

    } else {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
