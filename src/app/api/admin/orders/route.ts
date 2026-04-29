import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*, profiles(name_cn, email)')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const body = await req.json();
    const { action, orderId, ...payload } = body;

    if (action === 'update_status') {
      const { error } = await supabase
        .from('orders')
        .update({ status: payload.status })
        .eq('id', orderId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else if (action === 'update_payment') {
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
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

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
    } else if (action === 'update_contact') {
      const { error } = await supabase
        .from('orders')
        .update({ contact_status: payload.contact_status })
        .eq('id', orderId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
