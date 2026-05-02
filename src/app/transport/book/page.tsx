'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Plane, Car, Clock, Users, Calendar, User, Phone, MessageCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

interface VehiclePackage {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  capacity: number;
  luggage_count: number;
  price_pickup: number;
  price_pickup_cny: number;
  price_charter_4h: number;
  price_charter_6h: number;
  price_charter_8h: number;
  price_charter_10h: number;
  price_charter_full: number;
}

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const [packages, setPackages] = useState<VehiclePackage[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [orderType, setOrderType] = useState<'pickup' | 'dropoff' | 'charter'>('pickup');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [charterHours, setCharterHours] = useState<number>(8);
  const [flightNumber, setFlightNumber] = useState('');
  const [flightDate, setFlightDate] = useState('');
  const [flightTime, setFlightTime] = useState('');
  const [charterDate, setCharterDate] = useState('');
  const [charterStartTime, setCharterStartTime] = useState('09:00');
  const [charterEndTime, setCharterEndTime] = useState('17:00');
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [passengerWechat, setPassengerWechat] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [hotelAddress, setHotelAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch('/api/packages/transport');
        const data = await res.json();
        if (data.data) {
          setPackages(data.data);
          // Set default vehicle from URL params
          const vehicleSlug = searchParams.get('vehicle');
          const type = searchParams.get('type') as 'pickup' | 'dropoff' | 'charter';
          if (type) setOrderType(type);
          if (vehicleSlug) {
            const pkg = data.data.find((p: any) => p.slug === vehicleSlug);
            if (pkg) setSelectedVehicle(pkg.id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, [searchParams]);

  const selectedPkg = packages.find(p => p.id === selectedVehicle);

  const calculatePrice = () => {
    if (!selectedPkg) return 0;
    if (orderType === 'pickup' || orderType === 'dropoff') {
      return selectedPkg.price_pickup;
    }
    switch (charterHours) {
      case 4: return selectedPkg.price_charter_4h || 0;
      case 6: return selectedPkg.price_charter_6h || 0;
      case 8: return selectedPkg.price_charter_8h || 0;
      case 10: return selectedPkg.price_charter_10h || 0;
      default: return selectedPkg.price_charter_full || 0;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!selectedVehicle) {
      setError('請選擇車型');
      return;
    }
    if (!passengerName || !passengerPhone) {
      setError('請填寫聯繫人信息');
      return;
    }
    if (orderType === 'charter' && !charterDate) {
      setError('請選擇用車日期');
      return;
    }
    if ((orderType === 'pickup' || orderType === 'dropoff') && (!flightDate || !flightTime)) {
      setError('請填寫航班信息');
      return;
    }

    setSubmitting(true);

    try {
      const payload: any = {
        order_type: orderType,
        vehicle_package_id: selectedVehicle,
        vehicle_name: selectedPkg?.name,
        total_price: calculatePrice(),
        passenger_name: passengerName,
        passenger_phone: passengerPhone,
        passenger_wechat: passengerWechat,
        hotel_name: hotelName,
        hotel_address: hotelAddress,
        notes,
        user_id: user?.id
      };

      if (orderType === 'charter') {
        payload.charter_hours = charterHours;
        payload.charter_date = charterDate;
        payload.charter_start_time = charterStartTime;
        payload.charter_end_time = charterEndTime;
      } else {
        payload.flight_number = flightNumber;
        payload.flight_date = flightDate;
        payload.flight_time = flightTime;
        payload.pickup_location = orderType === 'pickup' ? '機場→酒店' : '酒店→機場';
      }

      const res = await fetch('/api/transport/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }

      setOrderNumber(data.data.order_number);
      setOrderSuccess(true);
      
      // Redirect to payment page
      router.push(`/payment/${data.data.id}`);
    } catch (err) {
      setError('提交失敗，請稍後重試');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeLabel = () => {
    switch (orderType) {
      case 'pickup': return '接機';
      case 'dropoff': return '送機';
      case 'charter': return '包車';
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 md:pt-16 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-4 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">預訂成功！</h2>
          <p className="text-gray-500 mb-4">訂單號：{orderNumber}</p>
          <p className="text-gray-600 mb-6">請在24小時內完成付款，我們將為您安排司機</p>
          <Link
            href="/my/orders"
            className="inline-block px-6 py-3 bg-ocean-500 text-white rounded-full font-semibold hover:bg-ocean-600 transition-colors"
          >
            查看訂單
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-16">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/transport" className="inline-flex items-center text-gray-600 hover:text-ocean-600">
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">預訂{getTypeLabel()}</h1>
        <p className="text-gray-500 mb-8">填寫以下信息完成預訂</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Type */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">選擇服務類型</h3>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  orderType === 'pickup'
                    ? 'border-ocean-500 bg-ocean-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Plane className={`w-8 h-8 mx-auto mb-2 ${orderType === 'pickup' ? 'text-ocean-500' : 'text-gray-400'}`} />
                <p className={`font-medium ${orderType === 'pickup' ? 'text-ocean-600' : 'text-gray-600'}`}>接機</p>
              </button>
              <button
                type="button"
                onClick={() => setOrderType('dropoff')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  orderType === 'dropoff'
                    ? 'border-ocean-500 bg-ocean-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Plane className={`w-8 h-8 mx-auto mb-2 ${orderType === 'dropoff' ? 'text-ocean-500' : 'text-gray-400'}`} />
                <p className={`font-medium ${orderType === 'dropoff' ? 'text-ocean-600' : 'text-gray-600'}`}>送機</p>
              </button>
              <button
                type="button"
                onClick={() => setOrderType('charter')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  orderType === 'charter'
                    ? 'border-ocean-500 bg-ocean-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Car className={`w-8 h-8 mx-auto mb-2 ${orderType === 'charter' ? 'text-ocean-500' : 'text-gray-400'}`} />
                <p className={`font-medium ${orderType === 'charter' ? 'text-ocean-600' : 'text-gray-600'}`}>包車</p>
              </button>
            </div>
          </div>

          {/* Vehicle Selection */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">選擇車型</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setSelectedVehicle(pkg.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedVehicle === pkg.id
                      ? 'border-ocean-500 bg-ocean-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {pkg.image_url && (
                    <div className="relative h-24 mb-3 rounded-lg overflow-hidden">
                      <Image src={pkg.image_url} alt={pkg.name} fill className="object-cover" />
                    </div>
                  )}
                  <p className={`font-semibold ${selectedVehicle === pkg.id ? 'text-ocean-600' : 'text-gray-800'}`}>
                    {pkg.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{pkg.capacity}人</span>
                  </div>
                  <p className="text-ocean-600 font-bold mt-2">
                    ฿{(orderType === 'charter' ? pkg.price_charter_8h : pkg.price_pickup)?.toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Time Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {orderType === 'charter' ? '用車時間' : '航班信息'}
            </h3>
            
            {orderType === 'charter' ? (
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">用車日期</label>
                  <input
                    type="date"
                    value={charterDate}
                    onChange={(e) => setCharterDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">開始時間</label>
                  <input
                    type="time"
                    value={charterStartTime}
                    onChange={(e) => setCharterStartTime(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">結束時間</label>
                  <input
                    type="time"
                    value={charterEndTime}
                    onChange={(e) => setCharterEndTime(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">包車時長</label>
                  <select
                    value={charterHours}
                    onChange={(e) => setCharterHours(Number(e.target.value))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  >
                    <option value={4}>4小時</option>
                    <option value={6}>6小時</option>
                    <option value={8}>8小時</option>
                    <option value={10}>10小時</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">航班號</label>
                  <input
                    type="text"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    placeholder="如：MU1234"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">航班日期</label>
                  <input
                    type="date"
                    value={flightDate}
                    onChange={(e) => setFlightDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {orderType === 'pickup' ? '抵達時間' : '起飛時間'}
                  </label>
                  <input
                    type="time"
                    value={flightTime}
                    onChange={(e) => setFlightTime(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">聯繫人信息</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="w-4 h-4 inline mr-1" />
                  姓名
                </label>
                <input
                  type="text"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  placeholder="您的姓名"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  電話
                </label>
                <input
                  type="tel"
                  value={passengerPhone}
                  onChange={(e) => setPassengerPhone(e.target.value)}
                  placeholder="+86 138****8888"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MessageCircle className="w-4 h-4 inline mr-1" />
                  微信（可選）
                </label>
                <input
                  type="text"
                  value={passengerWechat}
                  onChange={(e) => setPassengerWechat(e.target.value)}
                  placeholder="您的微信號"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                />
              </div>
            </div>
          </div>

          {/* Hotel Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {orderType === 'charter' ? '出發地點' : '酒店信息'}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">酒店/地點名稱</label>
                <input
                  type="text"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  placeholder="酒店名稱"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">詳細地址</label>
                <input
                  type="text"
                  value={hotelAddress}
                  onChange={(e) => setHotelAddress(e.target.value)}
                  placeholder="詳細地址"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">備註（可選）</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="有什麼特殊需求？告訴我們"
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
            />
          </div>

          {/* Price Summary */}
          {selectedPkg && (
            <div className="bg-ocean-50 rounded-xl p-6 border border-ocean-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium text-gray-700">預估價格</span>
                <span className="text-3xl font-bold text-ocean-600">
                  ฿{calculatePrice().toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                * 最終價格以確認為準，包含過路費和停車費
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-ocean-500 text-white rounded-xl font-semibold text-lg hover:bg-ocean-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? '提交中...' : '立即預訂'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function TransportBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">加載中...</p>
        </div>
      </div>
    }>
      <BookingForm />
    </Suspense>
  );
}
