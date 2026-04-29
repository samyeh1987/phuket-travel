import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET() {
  const diagnostics: Record<string, any> = {
    envCheck: {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    supabaseTest: null,
    ordersTest: null,
  };

  try {
    const supabase = createAdminClient();

    // 测试数据库连接
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .limit(1);

    if (ordersError) {
      diagnostics.ordersTest = {
        success: false,
        error: ordersError.message,
        code: ordersError.code,
      };
    } else {
      diagnostics.ordersTest = {
        success: true,
        count: orders?.length || 0,
      };
    }

    // 测试更新
    if (orders && orders.length > 0) {
      const testOrder = orders[0];
      const { error: updateError } = await supabase
        .from('orders')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', testOrder.id);

      diagnostics.updateTest = {
        success: !updateError,
        error: updateError?.message,
      };
    }
  } catch (e: any) {
    diagnostics.supabaseTest = {
      success: false,
      error: e.message,
    };
  }

  return NextResponse.json(diagnostics);
}
