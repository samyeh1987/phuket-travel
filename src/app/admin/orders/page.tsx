'use client';

import { useEffect, useState } from 'react';
import { Search, Eye, RefreshCw, X, Calendar, Check, XCircle, Image as ImageIcon, ChevronDown } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('全部');
  const [orderStatusFilter, setOrderStatusFilter] = useState('全部');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('全部');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [editStatus, setEditStatus] = useState<any | null>(null); // 用于追踪修改
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/orders', { credentials: 'include' });
    const json = await res.json();
    if (json.error) {
      console.error('获取订单失败:', json.error);
    }
    setOrders(json.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 打开详情弹窗，初始化编辑状态
  const openDetail = (order: any) => {
    setSelectedOrder({ ...order });
    setEditStatus({
      status: order.status || 'pending',
      payment_status: order.payment_status || 'unpaid',
      contact_status: order.contact_status || 'pending_contact',
    });
  };

  // 关闭弹窗，重置编辑状态
  const closeDetail = () => {
    setSelectedOrder(null);
    setEditStatus(null);
  };

  // 提交所有修改
  const submitChanges = async () => {
    if (!selectedOrder || !editStatus) return;
    setUpdating(true);

    try {
      // 检查并提交订单状态修改
      if (editStatus.status !== (selectedOrder.status || 'pending')) {
        console.log('更新订单状态:', selectedOrder.id, editStatus.status);
        const res1 = await fetch('/api/admin/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ action: 'update_status', orderId: selectedOrder.id, status: editStatus.status }),
        });
        const result1 = await res1.json();
        if (result1.error) {
          console.error('订单状态更新失败:', result1.error);
        }
      }

      // 检查并提交付款状态修改
      if (editStatus.payment_status !== (selectedOrder.payment_status || 'unpaid')) {
        console.log('更新付款状态:', selectedOrder.id, editStatus.payment_status);
        const res2 = await fetch('/api/admin/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            action: 'update_payment',
            orderId: selectedOrder.id,
            payment_status: editStatus.payment_status,
            orderData: { ...selectedOrder, payment_status: editStatus.payment_status },
          }),
        });
        const result2 = await res2.json();
        if (result2.error) {
          console.error('付款状态更新失败:', result2.error);
        }
      }

      // 检查并提交联系状态修改
      if (selectedOrder.type === 'custom' && editStatus.contact_status !== (selectedOrder.contact_status || 'pending_contact')) {
        console.log('更新联系状态:', selectedOrder.id, editStatus.contact_status);
        const res3 = await fetch('/api/admin/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            action: 'update_contact',
            orderId: selectedOrder.id,
            contact_status: editStatus.contact_status,
          }),
        });
        const result3 = await res3.json();
        if (result3.error) {
          console.error('联系状态更新失败:', result3.error);
        }
      }

      // 成功后刷新列表
      await fetchOrders();
    } catch (err) {
      console.error('提交失败:', err);
    }

    closeDetail();
    setUpdating(false);
  };

  const types = ['全部', 'diving', 'island', 'show', 'custom'];
  const typeLabels: Record<string, string> = {
    diving: '深潜', island: '跳岛游', show: '秀场', custom: '定制旅行',
  };

  // 订单状态筛选
  const orderStatuses = ['全部', 'pending', 'confirmed', 'completed', 'cancelled'];
  const orderStatusLabels: Record<string, string> = {
    全部: '全部状态', pending: '待付款', confirmed: '已确认', completed: '已完成', cancelled: '已取消',
  };

  // 付款状态筛选
  const paymentStatuses = ['全部', 'unpaid', 'pending_review', 'paid', 'rejected'];
  const paymentStatusFilterLabels: Record<string, string> = {
    全部: '全部状态', unpaid: '未付款', pending_review: '待审核', paid: '已付款', rejected: '已拒绝',
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
    const orderStatusMatch = orderStatusFilter === '全部' || o.status === orderStatusFilter;
    const paymentStatusMatch = paymentStatusFilter === '全部' || o.payment_status === paymentStatusFilter;
    const q = search.toLowerCase();
    const searchMatch = !q ||
      (o.order_number || '').toLowerCase().includes(q) ||
      (o.profiles?.name_cn || o.contact_name_cn || '').toLowerCase().includes(q) ||
      (o.contact_phone || '').includes(q) ||
      (o.contact_email || '').toLowerCase().includes(q);

    const orderDate = new Date(o.created_at);
    const fromMatch = !dateFrom || orderDate >= new Date(dateFrom);
    const toMatch = !dateTo || orderDate <= new Date(dateTo + 'T23:59:59');

    return typeMatch && orderStatusMatch && paymentStatusMatch && searchMatch && fromMatch && toMatch;
  });

  const statusLabels: Record<string, string> = {
    pending: '待付款', confirmed: '已确认', completed: '已完成', cancelled: '已取消',
  };

  // 检查是否有未保存的修改
  const hasChanges = editStatus && selectedOrder && (
    editStatus.status !== (selectedOrder.status || 'pending') ||
    editStatus.payment_status !== (selectedOrder.payment_status || 'unpaid') ||
    (selectedOrder.type === 'custom' && editStatus.contact_status !== (selectedOrder.contact_status || 'pending_contact'))
  );

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

        {/* 状态筛选 */}
        <div className="flex flex-wrap gap-4 items-center border-t pt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">订单状态：</span>
            <div className="relative">
              <select
                value={orderStatusFilter}
                onChange={e => setOrderStatusFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ocean-500 cursor-pointer hover:border-ocean-300 transition-colors"
              >
                {orderStatuses.map(s => (
                  <option key={s} value={s}>{orderStatusLabels[s]}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">付款状态：</span>
            <div className="relative">
              <select
                value={paymentStatusFilter}
                onChange={e => setPaymentStatusFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ocean-500 cursor-pointer hover:border-ocean-300 transition-colors"
              >
                {paymentStatuses.map(s => (
                  <option key={s} value={s}>{paymentStatusFilterLabels[s]}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {(orderStatusFilter !== '全部' || paymentStatusFilter !== '全部') && (
            <button
              onClick={() => { setOrderStatusFilter('全部'); setPaymentStatusFilter('全部'); }}
              className="px-2 py-1 text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> 清除筛选
            </button>
          )}
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
                        <div className="font-medium">{o.contact_name_cn || '—'}</div>
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
                          onClick={() => openDetail(o)}
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
              <button onClick={closeDetail} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-gray-500">订单号</span><div className="font-mono text-xs font-medium mt-0.5">{selectedOrder.order_number}</div></div>
                <div><span className="text-gray-500">类型</span><div className="font-medium mt-0.5">{typeLabels[selectedOrder.type] || selectedOrder.type}</div></div>
                <div><span className="text-gray-500">旅行日期</span><div className="font-medium mt-0.5">{selectedOrder.travel_date || '—'}</div></div>
                <div><span className="text-gray-500">姓名</span><div className="font-medium mt-0.5">{selectedOrder.contact_name_cn || '—'}</div></div>
                <div><span className="text-gray-500">电话</span><div className="font-medium mt-0.5">{selectedOrder.contact_phone || '—'}</div></div>
                <div><span className="text-gray-500">微信</span><div className="font-medium mt-0.5">{selectedOrder.contact_wechat || '—'}</div></div>
                <div><span className="text-gray-500">邮箱</span><div className="font-medium mt-0.5 text-xs">{selectedOrder.contact_email || '—'}</div></div>
                <div><span className="text-gray-500">人数</span><div className="font-medium mt-0.5">{selectedOrder.quantity || 1}人</div></div>
                <div><span className="text-gray-500">金额</span><div className="font-semibold text-ocean-600 mt-0.5">¥{Number(selectedOrder.total_price || 0).toLocaleString()}</div></div>
                <div><span className="text-gray-500">付款方式</span><div className="font-medium mt-0.5">{selectedOrder.payment_method === 'alipay' ? '支付宝' : selectedOrder.payment_method === 'wechat' ? '微信支付' : selectedOrder.payment_method === 'thai_qr' ? '泰国QR码' : '—'}</div></div>
                <div><span className="text-gray-500">酒店</span><div className="font-medium mt-0.5">{selectedOrder.hotel_name || '—'}</div></div>
                <div><span className="text-gray-500">创建时间</span><div className="font-medium mt-0.5">{new Date(selectedOrder.created_at).toLocaleString('zh-CN')}</div></div>
                {selectedOrder.paid_at && (
                  <div><span className="text-gray-500">付款时间</span><div className="font-medium mt-0.5 text-green-600">{new Date(selectedOrder.paid_at).toLocaleString('zh-CN')}</div></div>
                )}
              </div>

              {/* 状态显示区 - 显示当前修改后的值 */}
              <div className="border-t pt-3 mt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-500">订单状态</span>
                    <div className={`mt-0.5 px-2 py-1 rounded-lg text-xs font-medium ${statusConfig[editStatus?.status]?.color} ${statusConfig[editStatus?.status]?.bg}`}>
                      {statusLabels[editStatus?.status] || editStatus?.status}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">付款状态</span>
                    <div className={`mt-0.5 px-2 py-1 rounded-lg text-xs font-medium ${paymentStatusConfig[editStatus?.payment_status]?.color} ${paymentStatusConfig[editStatus?.payment_status]?.bg}`}>
                      {paymentStatusConfig[editStatus?.payment_status]?.label || '未付款'}
                    </div>
                  </div>
                  {selectedOrder.type === 'custom' && (
                    <div>
                      <span className="text-gray-500">联系状态</span>
                      <div className={`mt-0.5 px-2 py-1 rounded-lg text-xs font-medium ${contactStatusConfig[editStatus?.contact_status]?.color} ${contactStatusConfig[editStatus?.contact_status]?.bg}`}>
                        {contactStatusConfig[editStatus?.contact_status]?.label || '待联系'}
                      </div>
                    </div>
                  )}
                </div>
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
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm space-y-2">
                    {Object.entries(selectedOrder.extra_data).map(([key, value]) => {
                      if (key === 'package_details' && typeof value === 'object') {
                        return (
                          <div key={key}>
                            <span className="text-gray-500 font-medium">套餐详情：</span>
                            <div className="mt-1 pl-3 space-y-1">
                              {Object.entries(value as object).map(([k, v]) => (
                                <div key={k} className="text-gray-700">
                                  <span className="text-gray-400">{k}：</span>
                                  {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      if (value === null || value === undefined || value === '') return null;
                      const labelMap: Record<string, string> = {
                        contact_method: '联系方式',
                        contact_value: '联系账号',
                        is_first_time: '首次体验',
                        diving_experience: '深潜经验',
                        participants: '参与人数',
                        pickup_location: '接车地点',
                        special_requests: '特殊要求',
                        selected_extras: '附加选项',
                        selected_time: '选择时间',
                        island_name: '岛屿名称',
                        boat_name: '船型名称',
                        show_name: '秀场名称',
                        show_type: '秀场类型',
                        ticket_count: '票数',
                      };
                      const label = labelMap[key] || key;
                      return (
                        <div key={key} className="text-gray-700">
                          <span className="text-gray-500 font-medium">{label}：</span>
                          {typeof value === 'boolean' ? (value ? '是' : '否') : String(value)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {selectedOrder.customer_service_notes && (
                <div>
                  <span className="text-gray-500">客服备注</span>
                  <div className="mt-1 p-2 bg-yellow-50 rounded-lg text-xs text-yellow-800">{selectedOrder.customer_service_notes}</div>
                </div>
              )}
            </div>

            {/* 状态修改区域 */}
            <div className="mt-6 border-t pt-4">
              <p className="text-xs text-gray-400 mb-3">修改状态（选择后需点击确认按钮保存）</p>

              {/* 订单状态修改 */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">订单状态：</p>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setEditStatus({ ...editStatus, status: s.value })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-colors ${
                        editStatus?.status === s.value
                          ? `${s.color} border-current bg-opacity-10`
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 付款状态修改 */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">付款状态：</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'unpaid', label: '未付款', color: 'text-gray-600', bg: 'bg-gray-100' },
                    { value: 'pending_review', label: '待审核', color: 'text-orange-600', bg: 'bg-orange-100' },
                    { value: 'paid', label: '已付款', color: 'text-green-600', bg: 'bg-green-100' },
                    { value: 'rejected', label: '已拒绝', color: 'text-red-600', bg: 'bg-red-100' },
                  ].map(s => (
                    <button
                      key={s.value}
                      onClick={() => setEditStatus({ ...editStatus, payment_status: s.value })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-colors ${
                        editStatus?.payment_status === s.value
                          ? `${s.color} border-current bg-opacity-10`
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 联系状态修改（仅定制旅行） */}
              {selectedOrder.type === 'custom' && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">联系状态：</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setEditStatus({ ...editStatus, contact_status: 'pending_contact' })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-colors ${
                        editStatus?.contact_status === 'pending_contact'
                          ? 'text-amber-600 border-amber-400 bg-amber-50'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      待联系
                    </button>
                    <button
                      onClick={() => setEditStatus({ ...editStatus, contact_status: 'contacted' })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-colors ${
                        editStatus?.contact_status === 'contacted'
                          ? 'text-green-600 border-green-400 bg-green-50'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      已联系
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 确认按钮 */}
            {hasChanges && (
              <div className="mt-6 pt-4 border-t border-blue-200 bg-blue-50 -mx-6 -mb-6 px-6 pb-6 rounded-b-2xl">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-blue-700">
                    <span className="font-medium">有未保存的修改</span>
                    <p className="text-xs mt-0.5 opacity-75">请确认后再提交</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={closeDetail}
                      disabled={updating}
                      className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      取消
                    </button>
                    <button
                      onClick={submitChanges}
                      disabled={updating}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-ocean-500 text-white hover:bg-ocean-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {updating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          保存中...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          确认保存
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 没有修改时显示关闭按钮 */}
            {!hasChanges && (
              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={closeDetail}
                  className="w-full px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  关闭
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
