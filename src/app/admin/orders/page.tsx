'use client';

import { useEffect, useState } from 'react';
import { Search, Eye, RefreshCw, X, Calendar, Check, XCircle, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);
  const [filter, setFilter] = useState('全部');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);

  // 验证管理员身份（通过调用 API 间接验证）
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/admin/orders');
        if (!res.ok) {
          router.push('/admin/auth/login?next=/admin/orders');
          return;
        }
        setChecking(false);
      } catch {
        router.push('/admin/auth/login?next=/admin/orders');
      }
    };
    checkAdmin();
  }, [router]);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/orders');
    const json = await res.json();
    if (json.error) {
      console.error('获取订单失败:', json.error);
    }
    setOrders(json.data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!checking) {
      fetchOrders();
    }
  }, [checking]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(true);
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_status', orderId, status }),
    });
    setSelectedOrder(null);
    await fetchOrders();
    setUpdating(false);
  };

  const updatePaymentStatus = async (orderId: string, paymentStatus: string, notes?: string) => {
    setUpdating(true);
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_payment',
        orderId,
        payment_status: paymentStatus,
        notes,
        orderData: selectedOrder,
      }),
    });
    setSelectedOrder(null);
    await fetchOrders();
    setUpdating(false);
  };

  // 更新联系状态（定制旅行专用）
  const updateContactStatus = async (orderId: string, contactStatus: string) => {
    setUpdating(true);
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_contact', orderId, contact_status: contactStatus }),
    });
    setSelectedOrder(null);
    await fetchOrders();
    setUpdating(false);
  };

  const types = ['全部', 'diving', 'island', 'show', 'custom'];
  const typeLabels: Record<string, string> = {
    diving: '深潜', island: '跳岛游', show: '秀场', custom: '定制旅行',
  };

  const statusConfig: Record<string, { color: string; bg: string }> = {
    pending: { color: 'text-amber-600', bg: 'bg-amber-50' },
    confirmed: { color: 'text-blue-600', bg: 'bg-blue-50' },
    completed: { color: 'text-green-600', bg: 'bg-green-50' },
    cancelled: { color: 'text-red-600', bg: 'bg-red-50' },
  };

  const paymentStatusConfig: Record<string, { color: string; bg: string; label: string }> = {
    unpaid: { color: 'text-gray-600', bg: 'bg-gray-100', label: '未付款' },
    pending_review: { color: 'text-orange-600', bg: 'bg-orange-100', label: '待审核' },
    paid: { color: 'text-green-600', bg: 'bg-green-100', label: '已付款' },
    rejected: { color: 'text-red-600', bg: 'bg-red-100', label: '已拒绝' },
  };

  const contactStatusConfig: Record<string, { color: string; bg: string; label: string }> = {
    pending_contact: { color: 'text-amber-600', bg: 'bg-amber-100', label: '待联系' },
    contacted: { color: 'text-green-600', bg: 'bg-green-100', label: '已联系' },
  };

  const typeColors: Record<string, string> = {
    diving: 'bg-blue-50 text-blue-600',
    island: 'bg-cyan-50 text-cyan-600',
    show: 'bg-purple-50 text-purple-600',
    custom: 'bg-orange-50 text-orange-600',
  };

  const statusOptions = [
    { value: 'pending', label: '待付款', color: 'text-amber-600' },
    { value: 'confirmed', label: '已确认', color: 'text-blue-600' },
    { value: 'completed', label: '已完成', color: 'text-green-600' },
    { value: 'cancelled', label: '已取消', color: 'text-red-600' },
  ];

  const filtered = orders.filter(o => {
    const typeMatch = filter === '全部' || o.type === filter;
    const q = search.toLowerCase();
    const searchMatch = !q ||
      (o.order_number || '').toLowerCase().includes(q) ||
      (o.profiles?.name_cn || o.contact_name_cn || '').toLowerCase().includes(q) ||
      (o.contact_phone || '').includes(q) ||
      (o.contact_email || '').toLowerCase().includes(q);

    const orderDate = new Date(o.created_at);
    const fromMatch = !dateFrom || orderDate >= new Date(dateFrom);
    const toMatch = !dateTo || orderDate <= new Date(dateTo + 'T23:59:59');

    return typeMatch && searchMatch && fromMatch && toMatch;
  });

  const statusLabels: Record<string, string> = {
    pending: '待付款', confirmed: '已确认', completed: '已完成', cancelled: '已取消',
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">订单管理</h1>
          <p className="text-sm text-gray-500 mt-1">共 {filtered.length} 笔订单</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-ocean-500 border border-gray-200 rounded-xl hover:border-ocean-300 transition-colors">
          <RefreshCw className="w-4 h-4" /> 刷新
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {types.map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === t ? 'bg-ocean-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {t === '全部' ? t : typeLabels[t]}
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

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">日期范围：</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
            />
            <span className="text-gray-400">至</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); }}
                className="px-2 py-1 text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> 清除
              </button>
            )}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => {
                const today = new Date();
                setDateFrom(today.toISOString().split('T')[0]);
                setDateTo(today.toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-ocean-500 border border-gray-200 rounded-lg hover:border-ocean-300 transition-colors"
            >
              今天
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                setDateFrom(weekAgo.toISOString().split('T')[0]);
                setDateTo(today.toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-ocean-500 border border-gray-200 rounded-lg hover:border-ocean-300 transition-colors"
            >
              近7天
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                setDateFrom(monthAgo.toISOString().split('T')[0]);
                setDateTo(today.toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-ocean-500 border border-gray-200 rounded-lg hover:border-ocean-300 transition-colors"
            >
              近30天
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="w-6 h-6 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm">加载中...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">暂无订单</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500">
                  <th className="px-5 py-3.5 font-medium">订单号</th>
                  <th className="px-5 py-3.5 font-medium">类型</th>
                  <th className="px-5 py-3.5 font-medium">客户</th>
                  <th className="px-5 py-3.5 font-medium">人数</th>
                  <th className="px-5 py-3.5 font-medium">金额</th>
                  <th className="px-5 py-3.5 font-medium">付款状态</th>
                  <th className="px-5 py-3.5 font-medium">联系状态</th>
                  <th className="px-5 py-3.5 font-medium">订单状态</th>
                  <th className="px-5 py-3.5 font-medium">日期</th>
                  <th className="px-5 py-3.5 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(o => {
                  const status = statusConfig[o.status] || statusConfig.pending;
                  const isCustomOrder = o.type === 'custom';
                  return (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-600">{o.order_number}</td>
                      <td className="px-5 py-3.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[o.type] || 'bg-gray-50 text-gray-600'}`}>{typeLabels[o.type] || o.type}</span></td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium">{o.profiles?.name_cn || o.contact_name_cn || '—'}</div>
                        <div className="text-xs text-gray-400">{o.contact_phone || o.contact_email || ''}</div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">{o.quantity || 1}人</td>
                      <td className="px-5 py-3.5 font-semibold text-ocean-600">¥{Number(o.total_price || 0).toLocaleString()}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentStatusConfig[o.payment_status]?.color || 'text-gray-600'} ${paymentStatusConfig[o.payment_status]?.bg || 'bg-gray-100'}`}>
                          {paymentStatusConfig[o.payment_status]?.label || '未付款'}
                        </span>
                        {o.payment_proof_url && (
                          <a href={o.payment_proof_url} target="_blank" rel="noopener noreferrer" className="ml-1 text-ocean-500 hover:text-ocean-700">
                            <ImageIcon className="w-3.5 h-3.5 inline" />
                          </a>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {isCustomOrder ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${contactStatusConfig[o.contact_status]?.color || 'text-gray-600'} ${contactStatusConfig[o.contact_status]?.bg || 'bg-gray-100'}`}>
                            {contactStatusConfig[o.contact_status]?.label || '待联系'}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color} ${status.bg}`}>
                          {statusLabels[o.status] || o.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs">{new Date(o.created_at).toLocaleDateString('zh-CN')}</td>
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
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">订单详情</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-gray-500">订单号</span><div className="font-mono text-xs font-medium mt-0.5">{selectedOrder.order_number}</div></div>
                <div><span className="text-gray-500">状态</span>
                  <select
                    value={selectedOrder.status}
                    onChange={async (e) => { await updateStatus(selectedOrder.id, e.target.value); }}
                    disabled={updating}
                    className={`mt-0.5 w-full px-2 py-1 rounded-lg text-xs font-medium border ${statusConfig[selectedOrder.status]?.color} ${statusConfig[selectedOrder.status]?.bg}`}
                  >
                    {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div><span className="text-gray-500">类型</span><div className="font-medium mt-0.5">{typeLabels[selectedOrder.type] || selectedOrder.type}</div></div>
                <div><span className="text-gray-500">旅行日期</span><div className="font-medium mt-0.5">{selectedOrder.travel_date || '—'}</div></div>
                <div><span className="text-gray-500">姓名</span><div className="font-medium mt-0.5">{selectedOrder.profiles?.name_cn || selectedOrder.contact_name_cn || '—'}</div></div>
                <div><span className="text-gray-500">电话</span><div className="font-medium mt-0.5">{selectedOrder.contact_phone || '—'}</div></div>
                <div><span className="text-gray-500">微信</span><div className="font-medium mt-0.5">{selectedOrder.contact_wechat || '—'}</div></div>
                <div><span className="text-gray-500">邮箱</span><div className="font-medium mt-0.5 text-xs">{selectedOrder.contact_email || '—'}</div></div>
                <div><span className="text-gray-500">人数</span><div className="font-medium mt-0.5">{selectedOrder.quantity || 1}人</div></div>
                <div><span className="text-gray-500">金额</span><div className="font-semibold text-ocean-600 mt-0.5">¥{Number(selectedOrder.total_price || 0).toLocaleString()}</div></div>
                <div><span className="text-gray-500">付款方式</span><div className="font-medium mt-0.5">{selectedOrder.payment_method === 'alipay' ? '支付宝' : selectedOrder.payment_method === 'wechat' ? '微信支付' : selectedOrder.payment_method === 'thai_qr' ? '泰国QR码' : '—'}</div></div>
                <div><span className="text-gray-500">付款状态</span>
                  <span className={`inline-block mt-0.5 px-2 py-1 rounded-full text-xs font-medium ${paymentStatusConfig[selectedOrder.payment_status]?.color || 'text-gray-600'} ${paymentStatusConfig[selectedOrder.payment_status]?.bg || 'bg-gray-100'}`}>
                    {paymentStatusConfig[selectedOrder.payment_status]?.label || '未付款'}
                  </span>
                </div>
                {selectedOrder.type === 'custom' && (
                  <div><span className="text-gray-500">联系状态</span>
                    <select
                      value={selectedOrder.contact_status || 'pending_contact'}
                      onChange={async (e) => { await updateContactStatus(selectedOrder.id, e.target.value); }}
                      disabled={updating}
                      className={`mt-0.5 w-full px-2 py-1 rounded-lg text-xs font-medium border ${contactStatusConfig[selectedOrder.contact_status]?.color} ${contactStatusConfig[selectedOrder.contact_status]?.bg}`}
                    >
                      <option value="pending_contact">待联系</option>
                      <option value="contacted">已联系</option>
                    </select>
                  </div>
                )}
                <div><span className="text-gray-500">酒店</span><div className="font-medium mt-0.5">{selectedOrder.hotel_name || '—'}</div></div>
                <div><span className="text-gray-500">创建时间</span><div className="font-medium mt-0.5">{new Date(selectedOrder.created_at).toLocaleString('zh-CN')}</div></div>
                {selectedOrder.paid_at && (
                  <div><span className="text-gray-500">付款时间</span><div className="font-medium mt-0.5 text-green-600">{new Date(selectedOrder.paid_at).toLocaleString('zh-CN')}</div></div>
                )}
              </div>
              {selectedOrder.payment_proof_url && (
                <div>
                  <span className="text-gray-500">付款凭证</span>
                  <a href={selectedOrder.payment_proof_url} target="_blank" rel="noopener noreferrer" className="mt-1 block">
                    <img src={selectedOrder.payment_proof_url} alt="付款凭证" className="max-w-full h-auto rounded-lg border border-gray-200" />
                  </a>
                </div>
              )}
              {selectedOrder.extra_data && (
                <div>
                  <span className="text-gray-500">附加信息</span>
                  <pre className="mt-1 p-2 bg-gray-50 rounded-lg text-xs text-gray-700 overflow-auto">
                    {JSON.stringify(selectedOrder.extra_data, null, 2)}
                  </pre>
                </div>
              )}
              {selectedOrder.customer_service_notes && (
                <div>
                  <span className="text-gray-500">客服备注</span>
                  <div className="mt-1 p-2 bg-yellow-50 rounded-lg text-xs text-yellow-800">{selectedOrder.customer_service_notes}</div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <p className="text-xs text-gray-400 mb-2">修改状态</p>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map(s => (
                  <button
                    key={s.value}
                    onClick={() => updateStatus(selectedOrder.id, s.value)}
                    disabled={updating || selectedOrder.status === s.value}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${selectedOrder.status === s.value ? `${s.color} border-current opacity-50` : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {selectedOrder.type === 'custom' && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-400 mb-2">联系状态（定制旅行）</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateContactStatus(selectedOrder.id, 'pending_contact')}
                      disabled={updating || selectedOrder.contact_status === 'pending_contact'}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${selectedOrder.contact_status === 'pending_contact' ? 'text-amber-600 border-amber-300 opacity-50' : 'border-gray-200 text-amber-600 hover:border-amber-300 hover:bg-amber-50'}`}
                    >
                      待联系
                    </button>
                    <button
                      onClick={() => updateContactStatus(selectedOrder.id, 'contacted')}
                      disabled={updating || selectedOrder.contact_status === 'contacted'}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${selectedOrder.contact_status === 'contacted' ? 'text-green-600 border-green-300 opacity-50' : 'border-gray-200 text-green-600 hover:border-green-300 hover:bg-green-50'}`}
                    >
                      已联系
                    </button>
                  </div>
                </div>
              )}
            </div>

            {selectedOrder.payment_status !== 'paid' && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-gray-400 mb-2">付款审核</p>
                <div className="flex flex-wrap gap-2">
                  {selectedOrder.payment_proof_url ? (
                    <>
                      <button
                        onClick={() => updatePaymentStatus(selectedOrder.id, 'paid')}
                        disabled={updating}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center gap-1 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" /> 确认收款
                      </button>
                      <button
                        onClick={() => updatePaymentStatus(selectedOrder.id, 'rejected')}
                        disabled={updating}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-1 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" /> 拒绝
                      </button>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">等待客户上传付款凭证</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
