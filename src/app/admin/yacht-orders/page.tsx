'use client';

import { useEffect, useState } from 'react';
import { Eye, CheckCircle, XCircle, Phone, MessageCircle, Users } from 'lucide-react';

interface YachtOrder {
  id: string;
  order_number: string;
  yacht_name: string;
  charter_date: string;
  passenger_count: number;
  total_price: number;
  main_passenger_name: string;
  main_passenger_phone: string;
  main_passenger_wechat: string;
  main_passenger_passport: string;
  main_passenger_birthday: string;
  hotel_name: string;
  hotel_address: string;
  boarding_location: string;
  notes: string;
  status: string;
  payment_status: string;
  created_at: string;
  yacht_passengers?: { id: string; passenger_name: string; passport_number: string; is_child: boolean }[];
}

export default function AdminYachtOrdersPage() {
  const [orders, setOrders] = useState<YachtOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<YachtOrder | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'confirmed'>('all');

  const fetchOrders = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await fetch('/api/admin/yacht-orders');
      if (res.ok) {
        const json = await res.json();
        setOrders(json.data || []);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      setFetchError(err.message || '網絡錯誤');
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId: string, status: string, paymentStatus?: string) => {
    const updates: any = { status };
    if (paymentStatus) updates.payment_status = paymentStatus;
    
    await fetch(`/api/yacht/orders?id=${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    await fetchOrders();
    setSelectedOrder(null);
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') return order.payment_status === 'unpaid' || order.payment_status === 'pending_review';
    if (filter === 'paid') return order.payment_status === 'paid';
    if (filter === 'confirmed') return order.status === 'confirmed';
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">包船訂單</h1>
          <p className="text-gray-500">管理包船服務訂單</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'paid', 'confirmed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                filter === f ? 'bg-ocean-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? '全部' : f === 'pending' ? '待付款' : f === 'paid' ? '已付款' : '已完成'}
            </button>
          ))}
        </div>
      </div>

      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
          {fetchError}
          <br />
          <span className="text-sm">請檢查 Vercel 環境變數 SUPABASE_SERVICE_ROLE_KEY 是否正確配置。</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">加載中...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">暫無訂單</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">訂單號</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">船型</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">主乘客</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">人數/日期</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">金額</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">狀態</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{order.order_number}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{order.yacht_name}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{order.main_passenger_name}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {order.main_passenger_phone}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      {order.passenger_count}人
                    </div>
                    <div className="text-sm text-gray-500">{order.charter_date}</div>
                  </td>
                  <td className="px-4 py-3 text-right text-ocean-600 font-bold">
                    ฿{order.total_price?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.payment_status === 'paid' ? 'bg-green-100 text-green-600' :
                      order.payment_status === 'pending_review' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {order.payment_status === 'paid' ? '已付款' :
                       order.payment_status === 'pending_review' ? '待審核' : '未付款'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 text-gray-400 hover:text-ocean-500"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold">包船訂單詳情</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">訂單號</label>
                  <p className="font-mono">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">船型</label>
                  <p className="font-medium">{selectedOrder.yacht_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">出航日期</label>
                  <p>{selectedOrder.charter_date}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">人數</label>
                  <p>{selectedOrder.passenger_count} 人</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">金額</label>
                  <p className="text-ocean-600 font-bold text-xl">฿{selectedOrder.total_price?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">上船地點</label>
                  <p>{selectedOrder.boarding_location || '-'}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="text-xs text-gray-500">主乘客信息</label>
                <div className="mt-1">
                  <p className="font-medium">{selectedOrder.main_passenger_name}</p>
                  {selectedOrder.main_passenger_passport && <p className="text-sm text-gray-500">護照: {selectedOrder.main_passenger_passport}</p>}
                  {selectedOrder.main_passenger_birthday && <p className="text-sm text-gray-500">生日: {selectedOrder.main_passenger_birthday}</p>}
                  <p className="text-sm text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {selectedOrder.main_passenger_phone}</p>
                  {selectedOrder.main_passenger_wechat && <p className="text-sm text-gray-500 flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {selectedOrder.main_passenger_wechat}</p>}
                </div>
              </div>

              {selectedOrder.yacht_passengers && selectedOrder.yacht_passengers.length > 0 && (
                <div className="border-t pt-4">
                  <label className="text-xs text-gray-500">同行乘客</label>
                  <div className="mt-1 space-y-2">
                    {selectedOrder.yacht_passengers.map((p, i) => (
                      <div key={p.id} className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">{i + 1}.</span>
                        <span>{p.passenger_name}</span>
                        {p.passport_number && <span className="text-gray-400">({p.passport_number})</span>}
                        {p.is_child && <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded">兒童</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedOrder.hotel_name && (
                <div className="border-t pt-4">
                  <label className="text-xs text-gray-500">酒店信息</label>
                  <p>{selectedOrder.hotel_name}</p>
                  {selectedOrder.hotel_address && <p className="text-sm text-gray-500">{selectedOrder.hotel_address}</p>}
                </div>
              )}

              {selectedOrder.notes && (
                <div className="border-t pt-4">
                  <label className="text-xs text-gray-500">備註</label>
                  <p className="text-sm">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="border-t pt-4 flex justify-between items-center">
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    selectedOrder.payment_status === 'paid' ? 'bg-green-100 text-green-600' :
                    selectedOrder.payment_status === 'pending_review' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {selectedOrder.payment_status === 'paid' ? '已付款' :
                     selectedOrder.payment_status === 'pending_review' ? '待審核' : '未付款'}
                  </span>
                </div>
                <div className="flex gap-2">
                  {selectedOrder.payment_status !== 'paid' && (
                    <button
                      onClick={() => updateStatus(selectedOrder.id, 'confirmed', 'paid')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                    >
                      <CheckCircle className="w-4 h-4" /> 確認收款
                    </button>
                  )}
                  {selectedOrder.payment_status === 'pending_review' && (
                    <button
                      onClick={() => updateStatus(selectedOrder.id, 'cancelled', 'rejected')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                    >
                      <XCircle className="w-4 h-4" /> 拒絕
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
