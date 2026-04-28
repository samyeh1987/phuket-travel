'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Calendar, X, Search, TrendingUp, CreditCard, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function AdminFinancePage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const supabase = createClient();

  const fetchTransactions = async () => {
    setLoading(true);
    let query = supabase
      .from('payment_transactions')
      .select('*, admin_users(email)')
      .order('created_at', { ascending: false });

    const { data } = await query;
    setTransactions(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTransactions(); }, []);

  // 计算统计数据
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

  // 筛选
  const filtered = transactions.filter(t => {
    const q = search.toLowerCase();
    const searchMatch = !q ||
      (t.order_number || '').toLowerCase().includes(q) ||
      (t.order_type || '').toLowerCase().includes(q);
    
    const txDate = new Date(t.created_at);
    const fromMatch = !dateFrom || txDate >= new Date(dateFrom);
    const toMatch = !dateTo || txDate <= new Date(dateTo + 'T23:59:59');
    
    return searchMatch && fromMatch && toMatch;
  });

  const typeLabels: Record<string, string> = {
    diving: '深潜',
    island: '跳岛游',
    show: '秀场',
    custom: '定制旅行',
  };

  const methodLabels: Record<string, string> = {
    alipay: '支付宝',
    wechat: '微信支付',
    thai_qr: '泰国QR码',
    unknown: '未知',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">财务流水</h1>
          <p className="text-sm text-gray-500 mt-1">共 {filtered.length} 笔交易</p>
        </div>
        <button onClick={fetchTransactions} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-ocean-500 border border-gray-200 rounded-xl hover:border-ocean-300 transition-colors">
          <RefreshCw className="w-4 h-4" /> 刷新
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-ocean-500 to-ocean-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 opacity-80" />
            <span className="text-sm opacity-80">总收入</span>
          </div>
          <div className="text-2xl font-bold">¥{stats.total.toLocaleString()}</div>
          <div className="text-xs opacity-70 mt-1">{stats.count} 笔交易</div>
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

      {/* 泰国QR码收入 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-5 h-5 text-orange-500" />
          <span className="text-sm text-gray-500">泰国QR码</span>
        </div>
        <div className="text-2xl font-bold text-orange-600">¥{stats.thai_qr.toLocaleString()}</div>
      </div>

      {/* 筛选 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索订单号/类型"
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

      {/* 流水列表 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="w-6 h-6 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm">加载中...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">暂无交易记录</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500">
                  <th className="px-5 py-3.5 font-medium">时间</th>
                  <th className="px-5 py-3.5 font-medium">订单号</th>
                  <th className="px-5 py-3.5 font-medium">类型</th>
                  <th className="px-5 py-3.5 font-medium">金额</th>
                  <th className="px-5 py-3.5 font-medium">支付方式</th>
                  <th className="px-5 py-3.5 font-medium">凭证</th>
                  <th className="px-5 py-3.5 font-medium">操作员</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{new Date(tx.created_at).toLocaleString('zh-CN')}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-600">{tx.order_number}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {typeLabels[tx.order_type] || tx.order_type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-green-600">+¥{Number(tx.amount || 0).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-gray-600">{methodLabels[tx.payment_method] || tx.payment_method}</td>
                    <td className="px-5 py-3.5">
                      {tx.proof_url ? (
                        <a href={tx.proof_url} target="_blank" rel="noopener noreferrer" className="text-ocean-500 hover:text-ocean-700">
                          查看
                        </a>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{tx.admin_users?.email || '系统'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 交易详情弹窗 */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTx(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">交易详情</h2>
              <button onClick={() => setSelectedTx(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">交易ID</span>
                <span className="font-mono text-xs">{selectedTx.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">订单号</span>
                <span className="font-mono">{selectedTx.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">订单类型</span>
                <span>{typeLabels[selectedTx.order_type] || selectedTx.order_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">金额</span>
                <span className="font-bold text-green-600">+¥{Number(selectedTx.amount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">支付方式</span>
                <span>{methodLabels[selectedTx.payment_method] || selectedTx.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">状态</span>
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> 已完成
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">操作员</span>
                <span className="text-xs">{selectedTx.admin_users?.email || '系统'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">交易时间</span>
                <span>{new Date(selectedTx.created_at).toLocaleString('zh-CN')}</span>
              </div>
              {selectedTx.proof_url && (
                <div>
                  <span className="text-gray-500">付款凭证</span>
                  <a href={selectedTx.proof_url} target="_blank" rel="noopener noreferrer" className="mt-1 block">
                    <img src={selectedTx.proof_url} alt="付款凭证" className="max-w-full h-auto rounded-lg border border-gray-200" />
                  </a>
                </div>
              )}
              {selectedTx.notes && (
                <div>
                  <span className="text-gray-500">备注</span>
                  <div className="mt-1 p-2 bg-gray-50 rounded-lg text-xs">{selectedTx.notes}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
