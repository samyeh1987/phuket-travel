'use client';

import { useState } from 'react';
import { Search, Eye, CheckCircle, XCircle } from 'lucide-react';

const orders = [
  { id: '#TH001', type: '跳岛游', product: '皇帝岛 - 豪华双体帆船', name: '张三', phone: '+86 138xxxx', people: 4, total: 2720, status: '待付款', date: '2026-04-22' },
  { id: '#TH002', type: '深潜', product: '水肺OW考证', name: '李四', phone: '+86 139xxxx', people: 2, total: 5600, status: '已确认', date: '2026-04-22' },
  { id: '#TH003', type: '秀场', product: '西蒙秀 - VIP票', name: '王五', phone: '+86 137xxxx', people: 3, total: 1440, status: '已完成', date: '2026-04-22' },
  { id: '#TH004', type: '跳岛游', product: '皮皮岛 - VIP快艇', name: '赵六', phone: '+86 136xxxx', people: 6, total: 4680, status: '待付款', date: '2026-04-21' },
  { id: '#TH005', type: '深潜', product: '体验深潜', name: '钱七', phone: '+86 135xxxx', people: 2, total: 3600, status: '已完成', date: '2026-04-21' },
  { id: '#TH006', type: '秀场', product: '天皇秀 - 普通票', name: '孙八', phone: '+86 134xxxx', people: 2, total: 760, status: '已取消', date: '2026-04-21' },
];

const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
  '待付款': { color: 'text-amber-600', bg: 'bg-amber-50', icon: XCircle },
  '已确认': { color: 'text-blue-600', bg: 'bg-blue-50', icon: CheckCircle },
  '已完成': { color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
  '已取消': { color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
};

const typeColors: Record<string, string> = {
  '跳岛游': 'bg-cyan-50 text-cyan-600',
  '深潜': 'bg-blue-50 text-blue-600',
  '秀场': 'bg-purple-50 text-purple-600',
};

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState('全部');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<typeof orders[0] | null>(null);

  const types = ['全部', '跳岛游', '深潜', '秀场'];
  const filtered = orders.filter(o => {
    const typeMatch = filter === '全部' || o.type === filter;
    const searchMatch = !search || o.name.includes(search) || o.phone.includes(search) || o.id.includes(search);
    return typeMatch && searchMatch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">订单管理</h1>
        <p className="text-sm text-gray-500 mt-1">查看和处理所有订单</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === t ? 'bg-ocean-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索订单号/姓名/电话"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500">
              <th className="px-5 py-3.5 font-medium">订单号</th>
              <th className="px-5 py-3.5 font-medium">类型</th>
              <th className="px-5 py-3.5 font-medium">产品</th>
              <th className="px-5 py-3.5 font-medium">客户</th>
              <th className="px-5 py-3.5 font-medium">人数</th>
              <th className="px-5 py-3.5 font-medium">金额</th>
              <th className="px-5 py-3.5 font-medium">状态</th>
              <th className="px-5 py-3.5 font-medium">日期</th>
              <th className="px-5 py-3.5 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(o => {
              const status = statusConfig[o.status];
              const StatusIcon = status.icon;
              return (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5 font-mono text-xs">{o.id}</td>
                  <td className="px-5 py-3.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[o.type]}`}>{o.type}</span></td>
                  <td className="px-5 py-3.5 text-gray-700 max-w-[180px] truncate">{o.product}</td>
                  <td className="px-5 py-3.5">
                    <div className="font-medium">{o.name}</div>
                    <div className="text-xs text-gray-400">{o.phone}</div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{o.people}人</td>
                  <td className="px-5 py-3.5 font-semibold text-ocean-600">¥{o.total.toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <span className={`flex items-center gap-1 text-xs font-medium ${status.color} ${status.bg} px-2 py-1 rounded-full w-fit`}>
                      <StatusIcon className="w-3 h-3" />{o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{o.date}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="p-1.5 text-gray-400 hover:text-ocean-500 hover:bg-ocean-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold text-gray-900 mb-4">订单详情 {selectedOrder.id}</h2>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-gray-500">类型</span><div className="font-medium mt-0.5">{selectedOrder.type}</div></div>
                <div><span className="text-gray-500">状态</span><div className={`font-medium mt-0.5 ${statusConfig[selectedOrder.status].color}`}>{selectedOrder.status}</div></div>
                <div><span className="text-gray-500">产品</span><div className="font-medium mt-0.5">{selectedOrder.product}</div></div>
                <div><span className="text-gray-500">日期</span><div className="font-medium mt-0.5">{selectedOrder.date}</div></div>
                <div><span className="text-gray-500">客户姓名</span><div className="font-medium mt-0.5">{selectedOrder.name}</div></div>
                <div><span className="text-gray-500">联系电话</span><div className="font-medium mt-0.5">{selectedOrder.phone}</div></div>
                <div><span className="text-gray-500">人数</span><div className="font-medium mt-0.5">{selectedOrder.people}人</div></div>
                <div><span className="text-gray-500">金额</span><div className="font-semibold text-ocean-600 mt-0.5">¥{selectedOrder.total.toLocaleString()}</div></div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              {selectedOrder.status === '待付款' && (
                <button className="flex-1 py-2.5 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600">确认收款</button>
              )}
              <button onClick={() => setSelectedOrder(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50">关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
