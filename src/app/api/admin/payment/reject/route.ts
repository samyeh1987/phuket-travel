import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';

// 驗證是否為管理員
async function verifyAdmin(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', userId)
    .maybeSingle();
  
  return !error && !!data;
}

/**
 * 付款拒絕 API（後台管理員用）
 * 將 payment_status 改為 'unpaid' 並記錄拒絕原因
 */
export async function POST(req: NextRequest) {
  try {
    // 1. 驗證管理員身份
    const supabaseServer = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const isAdmin = await verifyAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: '無權訪問此接口' }, { status: 403 });
    }

    // 2. 解析請求參數
    const body = await req.json();
    const { orderId, reason } = body;

    if (!orderId) {
      return NextResponse.json({ error: '缺少訂單ID' }, { status: 400 });
    }

    if (!reason || reason.trim() === '') {
      return NextResponse.json({ error: '請填寫拒絕原因' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 3. 驗證訂單存在且狀態是 pending_review
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, payment_status, customer_service_notes')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError) {
      console.error('Order query error:', orderError);
      return NextResponse.json({ error: '查詢訂單失敗' }, { status: 500 });
    }

    if (!order) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    if (order.payment_status !== 'pending_review') {
      return NextResponse.json({ error: '訂單狀態不是待審核' }, { status: 400 });
    }

    // 4. 更新 payment_status 為 unpaid
    const now = new Date().toISOString();
    const updatedNotes = `${order.customer_service_notes || ''}\n[付款拒絕 ${now}] ${reason.trim()}`.trim();

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'unpaid',
        reviewed_by: user.id,
        reviewed_at: now,
        customer_service_notes: updatedNotes,
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Order update error:', updateError);
      return NextResponse.json({ error: '更新訂單失敗' }, { status: 500 });
    }

    // 5. 插入 payment_transactions 記錄
    const { error: transactionError } = await supabaseAdmin
      .from('payment_transactions')
      .insert({
        order_id: orderId,
        order_number: order.order_number,
        status: 'rejected',
        admin_note: reason.trim(),
        reviewed_by: user.id,
        reviewed_at: now,
      });

    if (transactionError) {
      console.error('Transaction insert error:', transactionError);
      // 不阻止主流程，只記錄錯誤
    }

    return NextResponse.json({ 
      success: true, 
      message: '付款已拒絕，用戶可重新提交' 
    });

  } catch (e: any) {
    console.error('Payment reject error:', e);
    return NextResponse.json({ error: e.message || '拒絕失敗' }, { status: 500 });
  }
}
