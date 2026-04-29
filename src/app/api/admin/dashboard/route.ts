import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET() {
  const supabase = createAdminClient();

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const [
      { count: totalOrders },
      { count: pendingOrders },
      { count: totalProfiles },
      { count: todayOrders },
      revenueData,
      recentOrders,
    ] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', startOfDay),
      supabase.from('orders')
        .select('total_price')
        .gte('created_at', startOfMonth)
        .eq('status', 'completed'),
      supabase
        .from('orders')
        .select('*, profiles(name_cn, email)')
        .gte('created_at', startOfDay)
        .order('created_at', { ascending: false }),
    ]);

    const monthlyRevenue = revenueData.data?.reduce((sum: number, o: any) => sum + (Number(o.total_price) || 0), 0) || 0;

    return NextResponse.json({
      data: {
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        totalProfiles: totalProfiles || 0,
        monthlyRevenue,
        todayOrders: todayOrders || 0,
        recentOrders: recentOrders.data || [],
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
