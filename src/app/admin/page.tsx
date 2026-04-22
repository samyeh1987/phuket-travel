import { LayoutDashboard, Anchor, Sailboat, Ticket, ShoppingBag, TrendingUp, Users, Clock } from 'lucide-react';

const stats = [
  { label: '总订单', value: '128', change: '+12%', icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
  { label: '待处理', value: '23', change: '-5%', icon: Clock, color: 'bg-amber-50 text-amber-600' },
  { label: '本月收入', value: '¥45,680', change: '+23%', icon: TrendingUp, color: 'bg-green-50 text-green-600' },
  { label: '客户总数', value: '892', change: '+8%', icon: Users, color: 'bg-purple-50 text-purple-600' },
];

const recentOrders = [
  { id: '#TH001', type: '跳岛游', island: '皇帝岛', people: 4, amount: 2720, status: '待付款', time: '5分钟前' },
  { id: '#TH002', type: '深潜', island: 'OW考证', people: 2, amount: 5600, status: '已确认', time: '12分钟前' },
  { id: '#TH003', type: '秀场', island: '西蒙秀', people: 3, amount: 1440, status: '已完成', time: '30分钟前' },
  { id: '#TH004', type: '跳岛游', island: '皮皮岛', people: 6, amount: 4680, status: '待付款', time: '1小时前' },
  { id: '#TH005', type: '深潜', island: '体验深潜', people: 2, amount: 3600, status: '已完成', time: '2小时前' },
];

const statusMap: Record<string, { color: string; bg: string }> = {
  '待付款': { color: 'text-amber-600', bg: 'bg-amber-50' },
  '已确认': { color: 'text-blue-600', bg: 'bg-blue-50' },
  '已完成': { color: 'text-green-600', bg: 'bg-green-50' },
};

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">控制台</h1>
        <p className="text-sm text-gray-500 mt-1">欢迎回来！以下是今日概览。</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-medium ${s.change.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>{s.change}</span>
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
          <h2 className="font-bold text-gray-900">最近订单</h2>
          <a href="/admin/orders" className="text-sm text-ocean-500 hover:text-ocean-600">查看全部 →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500">
                <th className="px-5 py-3 font-medium">订单号</th>
                <th className="px-5 py-3 font-medium">类型</th>
                <th className="px-5 py-3 font-medium">详情</th>
                <th className="px-5 py-3 font-medium">人数</th>
                <th className="px-5 py-3 font-medium">金额</th>
                <th className="px-5 py-3 font-medium">状态</th>
                <th className="px-5 py-3 font-medium">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentOrders.map(o => {
                const status = statusMap[o.status];
                return (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-xs">{o.id}</td>
                    <td className="px-5 py-3">{o.type}</td>
                    <td className="px-5 py-3">{o.island}</td>
                    <td className="px-5 py-3">{o.people}人</td>
                    <td className="px-5 py-3 font-semibold text-ocean-600">¥{o.amount.toLocaleString()}</td>
                    <td className="px-5 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color} ${status.bg}`}>{o.status}</span></td>
                    <td className="px-5 py-3 text-gray-400">{o.time}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '添加深潜套餐', href: '/admin/diving', color: 'bg-blue-500' },
          { label: '管理岛屿船只', href: '/admin/islands', color: 'bg-cyan-500' },
          { label: '管理秀场', href: '/admin/shows', color: 'bg-purple-500' },
          { label: '系统设置', href: '/admin/settings', color: 'bg-gray-500' },
        ].map(a => (
          <a key={a.label} href={a.href} className={`${a.color} text-white rounded-2xl p-5 text-center font-semibold hover:opacity-90 transition-opacity`}>
            {a.label}
          </a>
        ))}
      </div>
    </div>
  );
}
