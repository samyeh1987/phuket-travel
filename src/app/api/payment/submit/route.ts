import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerClient } from '@supabase/ssr';

const ALLOWED_PAYMENT_METHODS = ['alipay', 'wechat', 'thai_qr', 'bank_transfer'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, paymentMethod, paymentProofUrl } = body;

    // 驗證必填欄位
    if (!orderId || !paymentMethod || !paymentProofUrl) {
      return NextResponse.json(
        { error: '缺少必要參數：orderId, paymentMethod, paymentProofUrl' },
        { status: 400 }
      );
    }

    // 驗證付款方式
    if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json(
        { error: '不支援的付款方式' },
        { status: 400 }
      );
    }

    // 使用服務端 Admin client 查詢（繞過 RLS）
    const adminSupabase = createAdminClient();

    // 查詢訂單（使用 admin client 確保能找到）
    const { data: order, error: orderError } = await adminSupabase
      .from('orders')
      .select('id, user_id, payment_status, order_number, type, total_price')
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

    // 如果訂單有綁定用戶，嘗試驗證登入狀態（可選驗證）
    if (order.user_id) {
      try {
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              getAll() {
                return req.cookies.getAll();
              },
              setAll() {},
            },
          }
        );
        const { data: { user } } = await supabase.auth.getUser();
        // 若有 user session 且 user_id 不匹配，拒絕
        if (user && user.id !== order.user_id) {
          return NextResponse.json(
            { error: '無權操作此訂單' },
            { status: 403 }
          );
        }
      } catch {
        // auth 檢查失敗不阻塞付款，繼續處理
      }
    }

    // 驗證訂單狀態是 unpaid（已處理的訂單不能重複提交）
    if (order.payment_status !== 'unpaid') {
      return NextResponse.json(
        { error: '訂單已處理，無法重複提交' },
        { status: 400 }
      );
    }

    // 使用 admin client 更新訂單：payment_status 改為 pending_review
    const { error: updateError } = await adminSupabase
      .from('orders')
      .update({
        payment_method: paymentMethod,
        payment_proof_url: paymentProofUrl,
        payment_status: 'pending_review',
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('更新訂單錯誤:', updateError);
      return NextResponse.json(
        { error: '提交失敗，請稍後再試' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '付款提交成功，等待審核',
      orderId: orderId,
    });

  } catch (e: any) {
    console.error('付款提交 API 錯誤:', e);
    return NextResponse.json(
      { error: e.message || '伺服器錯誤' },
      { status: 500 }
    );
  }
}
