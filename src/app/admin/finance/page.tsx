'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Calendar, X, Search, TrendingUp, CreditCard, User, Phone } from 'lucide-react';

export default function AdminFinancePage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/finance');
    const json = await res.json();
    setTransactions(json.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTransactions(); }, []);

  const stats = {
    total: transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0),
    count: transactions.length,
    today: transactions
      .filter(t => new Date(t.created_at).toDateString() === new Date().toDateString())
      .reduce((sum, t) => sum + Number(t.amount || 0), 0),
    alipay: transactions.filter(t => t.payment_method === 'alipay').reduce((sum, t) => sum + Number(t.amount || 0), 0),
    wechat: transactions.filter(t => t.payment_method === 'wechat').reduce((sum, t) => sum + Number(t.amount || 0), 0),
    thai_qr: transactions.filter(t => t.payment_method === 'thai_qr').reduce((sum, t) => sum + Number(t.amount || 0), 0),
  };

  const filtered = transactions.filter(t => {
    const q = search.toLowerCase();
    const searchMatch = !q ||
      (t.order_number || '').toLowerCase().includes(q) ||
      (t.order_type || '').toLowerCase().includes(q) ||
      (t.contact_name_cn || '').toLowerCase().includes(q) ||
      (t.contact_phone || '').toLowerCase().includes(q);

    const txDate = new Date(t.created_at);
    const fromMatch = !dateFrom || txDate >= new Date(dateFrom);
    const toMatch = !dateTo || txDate <= new Date(dateTo + 'T23:59:59');

    return searchMatch && fromMatch && toMatch;
  });

  const typeLabels: Record<string, string> = { diving: '深潜', diving_experience: '深潜体验', diving_cert: '潜水考证', island: '跳岛游', show: '秀场', custom: '定制旅行' };
  const methodLabels: Record<string, string> = { alipay: '支付宝', wechat: '微信支付', thai_qr: '泰国QR码', unknown: '未知' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">财务流水</h1>
          <p className="text-sm text-gray-500 mt-1">共 {filtered.length} 笔已付款订单</p>
        </div>
        <button onClick={fetchTransactions} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-ocean-500 border border-gray-200 rounded-xl hover:border-ocean-300 transition-colors">
          <RefreshCw className="w-4 h-4" /> 刷新
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-ocean-500 to-ocean-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 opacity-80" />
            <span className="text-sm opacity-80">总收入</span>
          </div>
          <div className="text-2xl font-bold">¥{stats.total.toLocaleString()}</div>
          <div className="text-xs opacity-70 mt-1">{stats.count} 笔订单</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-500">今日收入</span>
          </div>
          <div className="text-2xl font-bold text-green-600">¥{stats.today.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-500">支付宝</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">¥{stats.alipay.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-500">微信支付</span>
          </div>
          <div className="text-2xl font-bold text-green-600">¥{stats.wechat.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-5 h-5 text-orange-500" />
          <span className="text-sm text-gray-500">泰国QR码</span>
        </div>
        <div className="text-2xl font-bold text-orange-600">¥{stats.thai_qr.toLocaleString()}</div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
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
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
            <span className="text-gray-400">至</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="px-2 py-1 text-xs text-gray-400 hover:text-red-500 flex items-center gap-1">
                <X className="w-3 h-3" /> 清除
              </button>
            )}
          </div>
          <div className="flex gap-1">
            {[
              { label: '今天', days: 0 },
              { label: '近7天', days: 7 },
              { label: '近30天', days: 30 },
            ].map(b => (
              <button
                key={b.label}
                onClick={() => {
                  const today = new Date();
                  const past = new Date(today.getTime() - b.days * 24 * 60 * 60 * 1000);
                  setDateFrom(b.days === 0 ? today.toISOString().split('T')[0] : past.toISOString().split('T')[0]);
                  setDateTo(today.toISOString().split('T')[0]);
                }}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-ocean-500 border border-gray-200 rounded-lg hover:border-ocean-300 transition-colors"
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="w-6 h-6 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm">加载中...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">暂无已付款订单</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500">
                  <th className="px-5 py-3.5 font-medium">付款时间</th>
                  <th className="px-5 py-3.5 font-medium">订单号</th>
                  <th className="px-5 py-3.5 font-medium">类型</th>
                  <th className="px-5 py-3.5 font-medium">联系人</th>
                  <th className="px-5 py-3.5 font-medium">电话</th>
                  <th className="px-5 py-3.5 font-medium">金额</th>
                  <th className="px-5 py-3.5 font-medium">支付方式</th>
                  <th className="px-5 py-3.5 font-medium">凭证</th>
                  <th className="px-5 py-3.5 font-medium">审核人</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {tx.created_at ? new Date(tx.created_at).toLocaleString('zh-CN') : '-'}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-600">{tx.order_number}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {typeLabels[tx.order_type] || tx.order_type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 flex items-center gap-1.5 text-gray-600">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      {tx.contact_name_cn || '-'}
                    </td>
                    <td className="px-5 py-3.5 flex items-center gap-1.5 text-gray-600">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {tx.contact_phone || '-'}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-green-600">+¥{Number(tx.amount || 0).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-gray-600">{methodLabels[tx.payment_method] || tx.payment_method}</td>
                    <td className="px-5 py-3.5">
                      {tx.proof_url ? (
                        <a href={tx.proof_url} target="_blank" rel="noopener noreferrer" className="text-ocean-500 hover:text-ocean-700">查看</a>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{tx.reviewer_email || '系统'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
