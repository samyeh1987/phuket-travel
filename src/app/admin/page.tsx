'use client';

import { useEffect, useState } from 'react';
import { Anchor, Sailboat, Ticket, ShoppingBag, TrendingUp, Users, Clock, ArrowRight, Settings } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, revenue: 0, users: 0, todayOrders: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/dashboard', { credentials: 'include' });
        const json = await res.json();
        if (json.error) {
          console.error('获取数据失败:', json.error);
        } else {
          const d = json.data;
          setStats({
            total: d.totalOrders || 0,
            pending: d.pendingOrders || 0,
            revenue: d.monthlyRevenue || 0,
            users: d.totalProfiles || 0,
            todayOrders: d.todayOrders || 0,
          });
          setRecentOrders(d.recentOrders || []);
        }
      } catch (e) {
        console.error('获取数据失败:', e);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const statusMap: Record<string, { color: string; bg: string }> = {
    pending: { color: 'text-amber-600', bg: 'bg-amber-50' },
    confirmed: { color: 'text-blue-600', bg: 'bg-blue-50' },
    completed: { color: 'text-green-600', bg: 'bg-green-50' },
    cancelled: { color: 'text-red-600', bg: 'bg-red-50' },
  };

  const typeColors: Record<string, string> = {
    diving: 'bg-blue-50 text-blue-600',
    island: 'bg-cyan-50 text-cyan-600',
    show: 'bg-purple-50 text-purple-600',
    custom: 'bg-orange-50 text-orange-600',
  };

  const statCards = [
    { label: '本日订单', value: stats.todayOrders, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { label: '待处理', value: stats.pending, icon: Clock, color: 'bg-amber-50 text-amber-600' },
    { label: '本月收入', value: `¥${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
    { label: '客户总数', value: stats.users, icon: Users, color: 'bg-purple-50 text-purple-600' },
  ];

  const typeLabels: Record<string, string> = {
    diving: '深潜', island: '跳岛游', show: '秀场', custom: '定制旅行',
  };

  const statusLabels: Record<string, string> = {
    pending: '待付款', confirmed: '已确认', completed: '已完成', cancelled: '已取消',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">控制台</h1>
        <p className="text-sm text-gray-500 mt-1">欢迎回来！以下是今日概览。</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-gray-900">本日订单</h2>
          <a href="/admin/orders" className="flex items-center gap-1 text-sm text-ocean-500 hover:text-ocean-600 font-medium">
            查看全部 <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <div className="w-6 h-6 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm">加载中...</p>
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">暂无订单数据</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500">
                  <th className="px-5 py-3 font-medium">订单号</th>
                  <th className="px-5 py-3 font-medium">类型</th>
                  <th className="px-5 py-3 font-medium">客户</th>
                  <th className="px-5 py-3 font-medium">人数</th>
                  <th className="px-5 py-3 font-medium">金额</th>
                  <th className="px-5 py-3 font-medium">状态</th>
                  <th className="px-5 py-3 font-medium">时间</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map(o => {
                  const status = statusMap[o.status] || statusMap.pending;
                  const typeLabel = typeLabels[o.type] || o.type;
                  return (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-mono text-xs text-gray-600">{o.order_number}</td>
                      <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[o.type] || 'bg-gray-50 text-gray-600'}`}>{typeLabel}</span></td>
                      <td className="px-5 py-3">
                        <div className="font-medium text-gray-800">{o.profiles?.name_cn || o.contact_name_cn || '—'}</div>
                        <div className="text-xs text-gray-400">{o.contact_email || ''}</div>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{o.quantity || 1}人</td>
                      <td className="px-5 py-3 font-semibold text-ocean-600">¥{Number(o.total_price || 0).toLocaleString()}</td>
                      <td className="px-5 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color} ${status.bg}`}>{statusLabels[o.status] || o.status}</span></td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{new Date(o.created_at).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '深潜套餐', href: '/admin/diving', color: 'bg-blue-500', icon: Anchor },
          { label: '岛屿&船只', href: '/admin/islands', color: 'bg-cyan-500', icon: Sailboat },
          { label: '秀场管理', href: '/admin/shows', color: 'bg-purple-500', icon: Ticket },
          { label: '系统设置', href: '/admin/settings', color: 'bg-gray-500', icon: Settings },
        ].map(a => {
          const Icon = a.icon;
          return (
            <a key={a.label} href={a.href} className={`${a.color} text-white rounded-2xl p-5 text-center font-semibold hover:opacity-90 transition-opacity flex flex-col items-center gap-2`}>
              <Icon className="w-6 h-6" />
              {a.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
