import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET() {
  const supabase = createAdminClient();

  try {
    const now = new Date();

    // 本日
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    // 本月（当月1号至当月最后一天）
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const [
      // 总计
      { count: totalOrders },
      { count: totalProfiles },
      // 总收入（已付款）
      totalRevenueResult,
      // 本日订单数
      { count: todayOrdersCount },
      // 本日收入
      todayRevenueResult,
      // 本日新增用户
      { count: todayNewUsers },
      // 未联系订单（待处理）
      { count: pendingContactCount },
      // 本月订单数
      { count: monthOrdersCount },
      // 本月收入
      monthRevenueResult,
    ] = await Promise.all([
      // 总订单
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      // 客户总数（profiles）
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      // 总收入（已付款）
      supabase.from('orders').select('total_price').eq('payment_status', 'paid'),
      // 本日订单数
      supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', startOfDay),
      // 本日收入
      supabase.from('orders').select('total_price').eq('payment_status', 'paid').gte('paid_at', startOfDay),
      // 本日新增用户
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startOfDay),
      // 未联系订单（contact_status = pending_contact）
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('contact_status', 'pending_contact'),
      // 本月订单数
      supabase.from('orders').select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth).lte('created_at', endOfMonth),
      // 本月收入
      supabase.from('orders').select('total_price').eq('payment_status', 'paid')
        .gte('paid_at', startOfMonth).lte('paid_at', endOfMonth),
    ]);

    const totalRevenue = totalRevenueResult.data?.reduce((s: number, o: any) => s + (Number(o.total_price) || 0), 0) || 0;
    const todayRevenue = todayRevenueResult.data?.reduce((s: number, o: any) => s + (Number(o.total_price) || 0), 0) || 0;
    const monthRevenue = monthRevenueResult.data?.reduce((s: number, o: any) => s + (Number(o.total_price) || 0), 0) || 0;

    return NextResponse.json({
      data: {
        // 本日
        todayOrders: todayOrdersCount || 0,
        todayRevenue,
        todayNewUsers: todayNewUsers || 0,
        // 待处理
        pendingContactCount: pendingContactCount || 0,
        // 本月
        monthOrders: monthOrdersCount || 0,
        monthRevenue,
        // 总计
        totalOrders: totalOrders || 0,
        totalRevenue,
        totalProfiles: totalProfiles || 0,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
