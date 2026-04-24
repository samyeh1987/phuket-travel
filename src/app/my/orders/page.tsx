'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { Package, ChevronRight, Clock } from 'lucide-react';

const typeLabels: Record<string, string> = {
  custom: '定制旅行',
  diving_experience: '深潜体验',
  diving_cert: '潜水考证',
  island: '跳岛游',
  show: '秀场',
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: '待确认',  color: 'text-amber-600',   bg: 'bg-amber-100'   },
  paid:     { label: '已付款',  color: 'text-ocean-600',   bg: 'bg-ocean-100'   },
  confirmed:{ label: '已确认',  color: 'text-green-600',   bg: 'bg-green-100'   },
  cancelled:{ label: '已取消',  color: 'text-gray-400',    bg: 'bg-gray-100'    },
};

function formatDate(d: string) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export default function MyOrdersPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders(data || []);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40 flex items-center gap-3 px-4 py-4 md:py-0 md:h-16 md:justify-center">
        <div className="w-9 h-9 rounded-full bg-ocean-100 flex items-center justify-center">
          <Package className="w-5 h-5 text-ocean-600" />
        </div>
        <h1 className="font-bold text-gray-900">我的订单</h1>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 pb-36">
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">暂无订单</h2>
            <p className="text-gray-400 mb-6">快去预订你的普吉之旅吧！</p>
            <Link href="/" className="text-ocean-600 font-semibold hover:underline">
              浏览产品 →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => {
              const status = statusConfig[order.status] || statusConfig.pending;
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  {/* 订单头部 */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                    <div>
                      <div className="font-mono text-sm text-gray-500">{order.order_number}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatDate(order.created_at)}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* 订单内容 */}
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {typeLabels[order.type] || order.type}
                        </div>
                        {order.travel_date && (
                          <div className="text-sm text-gray-500 mt-0.5">
                            出行日期：{formatDate(order.travel_date)}
                          </div>
                        )}
                        {order.quantity && (
                          <div className="text-sm text-gray-500">
                            数量：{order.quantity}人
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-ocean-600">
                          ¥{Number(order.total_price).toLocaleString()}
                        </div>
                        <Link href="/contact" className="text-xs text-gray-400 hover:text-ocean-500 mt-1 block">
                          联系客服 →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 底部快捷链接 */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm overflow-hidden">
          <Link href="/profile" className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
            <span className="font-medium text-gray-700">编辑个人资料</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
