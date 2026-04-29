import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (!auth.authorized) {
    return auth.response;
  }
  const { supabase } = auth;

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [
      { count: totalOrders },
      { count: pendingOrders },
      { count: totalProfiles },
      revenueData,
      recentOrders,
    ] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('orders')
        .select('total_price')
        .gte('created_at', startOfMonth)
        .eq('status', 'completed'),
      supabase
        .from('orders')
        .select('*, profiles(name_cn, email)')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    const monthlyRevenue = revenueData.data?.reduce((sum: number, o: any) => sum + (Number(o.total_price) || 0), 0) || 0;

    return NextResponse.json({
      data: {
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        totalProfiles: totalProfiles || 0,
        monthlyRevenue,
        recentOrders: recentOrders.data || [],
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
