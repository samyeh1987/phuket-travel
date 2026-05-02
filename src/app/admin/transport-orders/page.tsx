'use client';

import { useEffect, useState } from 'react';
import { Eye, CheckCircle, XCircle, Phone, MessageCircle } from 'lucide-react';

interface TransportOrder {
  id: string;
  order_number: string;
  order_type: 'pickup' | 'dropoff' | 'charter';
  vehicle_name: string;
  charter_hours: number;
  flight_number: string;
  flight_date: string;
  flight_time: string;
  charter_date: string;
  charter_start_time: string;
  charter_end_time: string;
  total_price: number;
  passenger_name: string;
  passenger_phone: string;
  passenger_wechat: string;
  hotel_name: string;
  hotel_address: string;
  pickup_location: string;
  notes: string;
  status: string;
  payment_status: string;
  created_at: string;
}

export default function AdminTransportOrdersPage() {
  const [orders, setOrders] = useState<TransportOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<TransportOrder | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'confirmed'>('all');

  const fetchOrders = async () => {
    setLoading(true);
    setFetchError('');
    try {
      // Use admin API to get all orders
      const res = await fetch('/api/admin/transport-orders');
      if (res.ok) {
        const json = await res.json();
        setOrders(json.data || []);
      } else {
        // Fallback: try to fetch from direct API
        const allOrders: TransportOrder[] = [];
        // This is a simplified approach - in production, you'd have a proper admin endpoint
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
    
    await fetch(`/api/transport/orders?id=${orderId}`, {
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'pickup': return '接機';
      case 'dropoff': return '送機';
      case 'charter': return '包車';
      default: return type;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">交通訂單</h1>
          <p className="text-gray-500">管理接機、送機、包車訂單</p>
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
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">類型</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">乘客</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">時間/航班</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">金額</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">狀態</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{order.order_number}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-ocean-100 text-ocean-700 rounded text-xs font-medium">
                      {getTypeLabel(order.order_type)}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">{order.vehicle_name}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{order.passenger_name}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {order.passenger_phone}
                    </div>
                    {order.passenger_wechat && (
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {order.passenger_wechat}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {order.order_type === 'charter' ? (
                      <>
                        <div>{order.charter_date}</div>
                        <div className="text-gray-500">{order.charter_start_time} - {order.charter_end_time}</div>
                      </>
                    ) : (
                      <>
                        <div>{order.flight_date}</div>
                        <div className="text-gray-500">{order.flight_number} @ {order.flight_time}</div>
                      </>
                    )}
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
              <h2 className="text-lg font-bold">訂單詳情</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">訂單號</label>
                  <p className="font-mono">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">服務類型</label>
                  <p className="font-medium">{getTypeLabel(selectedOrder.order_type)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">車型</label>
                  <p>{selectedOrder.vehicle_name}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">金額</label>
                  <p className="text-ocean-600 font-bold">฿{selectedOrder.total_price?.toLocaleString()}</p>
                </div>
              </div>

              {selectedOrder.order_type === 'charter' ? (
                <div>
                  <label className="text-xs text-gray-500">用車時間</label>
                  <p>{selectedOrder.charter_date} {selectedOrder.charter_start_time} - {selectedOrder.charter_end_time}</p>
                  {selectedOrder.charter_hours && <p className="text-sm text-gray-500">包車 {selectedOrder.charter_hours} 小時</p>}
                </div>
              ) : (
                <div>
                  <label className="text-xs text-gray-500">航班信息</label>
                  <p>{selectedOrder.flight_number}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.flight_date} @ {selectedOrder.flight_time}</p>
                </div>
              )}

              <div>
                <label className="text-xs text-gray-500">乘客信息</label>
                <p>{selectedOrder.passenger_name}</p>
                <p className="text-sm text-gray-500">{selectedOrder.passenger_phone}</p>
                {selectedOrder.passenger_wechat && <p className="text-sm text-gray-500">微信: {selectedOrder.passenger_wechat}</p>}
              </div>

              {selectedOrder.hotel_name && (
                <div>
                  <label className="text-xs text-gray-500">酒店信息</label>
                  <p>{selectedOrder.hotel_name}</p>
                  {selectedOrder.hotel_address && <p className="text-sm text-gray-500">{selectedOrder.hotel_address}</p>}
                </div>
              )}

              {selectedOrder.notes && (
                <div>
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
