'use client';

import { useEffect, useState } from 'react';
import { Anchor, Sailboat, Ticket, ShoppingBag, TrendingUp, Users, Clock, ArrowRight, Settings, AlertCircle, Calendar, Wallet } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    todayOrders: 0, todayRevenue: 0, todayNewUsers: 0,
    pendingContactCount: 0,
    monthOrders: 0, monthRevenue: 0,
    totalOrders: 0, totalRevenue: 0, totalProfiles: 0,
  });
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
          setStats(json.data || {});
        }
      } catch (e) {
        console.error('获取数据失败:', e);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const typeColors: Record<string, string> = {
    diving: 'bg-blue-50 text-blue-600',
    island: 'bg-cyan-50 text-cyan-600',
    show: 'bg-purple-50 text-purple-600',
    custom: 'bg-orange-50 text-orange-600',
  };

  const typeLabels: Record<string, string> = {
    diving: '深潜', diving_experience: '深潜体验', diving_cert: '潜水考证',
    island: '跳岛游', show: '秀场', custom: '定制旅行',
  };

  const statusLabels: Record<string, string> = {
    pending: '待付款', confirmed: '已确认', completed: '已完成', cancelled: '已取消',
  };

  const today = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
  const thisMonth = new Date().toLocaleDateString('zh-CN', { month: 'long' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">控制台</h1>
        <p className="text-sm text-gray-500 mt-1">欢迎回来！</p>
      </div>

      {/* 本日统计 */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> {today}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-ocean-500">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="w-5 h-5 text-ocean-500" />
              <span className="text-sm text-gray-500">本日订单</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{loading ? '-' : stats.todayOrders}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-500">本日收入</span>
            </div>
            <div className="text-2xl font-bold text-green-600">¥{loading ? '-' : stats.todayRevenue.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-500">本日新增用户</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{loading ? '-' : stats.todayNewUsers}</div>
          </div>
        </div>
      </div>

      {/* 待处理 + 本月统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 待处理 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-gray-700">待处理订单</span>
            <span className="ml-auto text-xs text-gray-400">未联系</span>
          </div>
          <div className="text-4xl font-bold text-amber-600">{loading ? '-' : stats.pendingContactCount}</div>
          <p className="text-xs text-gray-400 mt-2">需要客服主动联系客户的订单</p>
          <a href="/admin/orders?filter=pending_contact" className="inline-flex items-center gap-1 mt-3 text-sm text-ocean-500 hover:text-ocean-600 font-medium">
            查看待处理 <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* 本月统计 */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> {thisMonth}
          </h2>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">本月订单</div>
                <div className="text-2xl font-bold text-gray-900">{loading ? '-' : stats.monthOrders}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">本月收入</div>
                <div className="text-2xl font-bold text-green-600">¥{loading ? '-' : stats.monthRevenue.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 总计 */}
      <div className="bg-gradient-to-br from-ocean-500 to-ocean-600 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 opacity-80" />
          <span className="text-sm opacity-80">累计数据</span>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-sm opacity-70">总订单</div>
            <div className="text-3xl font-bold">{loading ? '-' : stats.totalOrders}</div>
          </div>
          <div>
            <div className="text-sm opacity-70">总收入</div>
            <div className="text-3xl font-bold">¥{loading ? '-' : stats.totalRevenue.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm opacity-70">客户总数</div>
            <div className="text-3xl font-bold">{loading ? '-' : stats.totalProfiles}</div>
          </div>
        </div>
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
