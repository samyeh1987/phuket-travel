'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Ship, Users, Calendar, User, Phone, MessageCircle, Plus, X, CheckCircle, CreditCard } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

interface YachtPackage {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  capacity: number;
  duration: string;
  price: number;
  price_cny: number;
  includes: string[];
}

interface Passenger {
  name: string;
  passport: string;
  is_child: boolean;
}

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const [packages, setPackages] = useState<YachtPackage[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [selectedYacht, setSelectedYacht] = useState<string>('');
  const [charterDate, setCharterDate] = useState('');
  const [passengerCount, setPassengerCount] = useState(1);
  
  // Main passenger
  const [mainName, setMainName] = useState('');
  const [mainPhone, setMainPhone] = useState('');
  const [mainWechat, setMainWechat] = useState('');
  const [mainPassport, setMainPassport] = useState('');
  const [mainBirthday, setMainBirthday] = useState('');
  
  // Hotel info
  const [hotelName, setHotelName] = useState('');
  const [hotelAddress, setHotelAddress] = useState('');
  const [boardingLocation, setBoardingLocation] = useState('');
  
  // Other passengers
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  
  // Notes
  const [notes, setNotes] = useState('');
  
  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch('/api/packages/yacht');
        const data = await res.json();
        if (data.data) {
          setPackages(data.data);
          // Set default yacht from URL params
          const yachtSlug = searchParams.get('yacht');
          if (yachtSlug) {
            const pkg = data.data.find((p: any) => p.slug === yachtSlug);
            if (pkg) setSelectedYacht(pkg.id);
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

  // Update passenger count
  useEffect(() => {
    const count = passengerCount - 1; // Minus 1 for main passenger
    setPassengers(prev => {
      if (count > prev.length) {
        return [...prev, ...Array(count - prev.length).fill({ name: '', passport: '', is_child: false })];
      }
      return prev.slice(0, count);
    });
  }, [passengerCount]);

  const selectedPkg = packages.find(p => p.id === selectedYacht);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!selectedYacht) {
      setError('請選擇船型');
      return;
    }
    if (!charterDate) {
      setError('請選擇出航日期');
      return;
    }
    if (!mainName || !mainPhone) {
      setError('請填寫主乘客信息');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        yacht_package_id: selectedYacht,
        yacht_name: selectedPkg?.name,
        charter_date: charterDate,
        passenger_count: passengerCount,
        total_price: selectedPkg?.price || 0,
        main_passenger_name: mainName,
        main_passenger_phone: mainPhone,
        main_passenger_wechat: mainWechat,
        main_passenger_passport: mainPassport,
        main_passenger_birthday: mainBirthday,
        hotel_name: hotelName,
        hotel_address: hotelAddress,
        boarding_location: boardingLocation,
        notes,
        passengers: passengers.filter(p => p.name.trim()),
        user_id: user?.id
      };

      const res = await fetch('/api/yacht/orders', {
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

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 md:pt-16 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-4 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">預訂成功！</h2>
          <p className="text-gray-500 mb-4">訂單號：{orderNumber}</p>
          <p className="text-gray-600 mb-6">請在24小時內完成付款，我們將為您安排船隻</p>
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
          <Link href="/yacht" className="inline-flex items-center text-gray-600 hover:text-ocean-600">
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">包船預訂</h1>
        <p className="text-gray-500 mb-8">填寫以下信息完成預訂</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Yacht Selection */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">選擇船型</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setSelectedYacht(pkg.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedYacht === pkg.id
                      ? 'border-ocean-500 bg-ocean-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {pkg.image_url && (
                    <div className="relative h-28 mb-3 rounded-lg overflow-hidden">
                      <Image src={pkg.image_url} alt={pkg.name} fill className="object-cover" />
                    </div>
                  )}
                  <p className={`font-semibold ${selectedYacht === pkg.id ? 'text-ocean-600' : 'text-gray-800'}`}>
                    {pkg.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{pkg.capacity}人</span>
                    <span>·</span>
                    <span>{pkg.duration}</span>
                  </div>
                  <p className="text-ocean-600 font-bold mt-2">
                    ฿{pkg.price.toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Charter Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">出航信息</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  出航日期
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Users className="w-4 h-4 inline mr-1" />
                  乘客數量
                </label>
                <select
                  value={passengerCount}
                  onChange={(e) => setPassengerCount(Number(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                >
                  {selectedPkg ? (
                    Array.from({ length: selectedPkg.capacity }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n} 人</option>
                    ))
                  ) : (
                    Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n} 人</option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Main Passenger */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">主乘客信息（預訂人）</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="w-4 h-4 inline mr-1" />
                  姓名 *
                </label>
                <input
                  type="text"
                  value={mainName}
                  onChange={(e) => setMainName(e.target.value)}
                  placeholder="護照上的姓名"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  電話 *
                </label>
                <input
                  type="tel"
                  value={mainPhone}
                  onChange={(e) => setMainPhone(e.target.value)}
                  placeholder="+86 138****8888"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MessageCircle className="w-4 h-4 inline mr-1" />
                  微信
                </label>
                <input
                  type="text"
                  value={mainWechat}
                  onChange={(e) => setMainWechat(e.target.value)}
                  placeholder="您的微信號"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  護照號
                </label>
                <input
                  type="text"
                  value={mainPassport}
                  onChange={(e) => setMainPassport(e.target.value)}
                  placeholder="護照號碼"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  生日
                </label>
                <input
                  type="date"
                  value={mainBirthday}
                  onChange={(e) => setMainBirthday(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                />
              </div>
            </div>
          </div>

          {/* Other Passengers */}
          {passengerCount > 1 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">同行乘客信息</h3>
              <div className="space-y-4">
                {passengers.map((_, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">姓名</label>
                        <input
                          type="text"
                          value={passengers[index].name}
                          onChange={(e) => {
                            const newPassengers = [...passengers];
                            newPassengers[index].name = e.target.value;
                            setPassengers(newPassengers);
                          }}
                          placeholder={`乘客 ${index + 2} 姓名`}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">護照號</label>
                        <input
                          type="text"
                          value={passengers[index].passport}
                          onChange={(e) => {
                            const newPassengers = [...passengers];
                            newPassengers[index].passport = e.target.value;
                            setPassengers(newPassengers);
                          }}
                          placeholder="護照號"
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 text-sm"
                        />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={passengers[index].is_child}
                            onChange={(e) => {
                              const newPassengers = [...passengers];
                              newPassengers[index].is_child = e.target.checked;
                              setPassengers(newPassengers);
                            }}
                            className="w-4 h-4 text-ocean-500 rounded"
                          />
                          <span className="text-sm text-gray-600">兒童</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hotel Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">酒店/接送信息</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">酒店名稱</label>
                <input
                  type="text"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  placeholder="入住酒店名稱"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">酒店地址</label>
                <input
                  type="text"
                  value={hotelAddress}
                  onChange={(e) => setHotelAddress(e.target.value)}
                  placeholder="酒店地址"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">上船地點</label>
                <input
                  type="text"
                  value={boardingLocation}
                  onChange={(e) => setBoardingLocation(e.target.value)}
                  placeholder="如：查龍碼頭 / 香蕉海灘"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">特殊需求（可選）</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="有什麼特殊需求？如：慶祝活動、需要特殊餐飲等"
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
            />
          </div>

          {/* Price Summary */}
          {selectedPkg && (
            <div className="bg-ocean-50 rounded-xl p-6 border border-ocean-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium text-gray-700">套餐價格</span>
                <span className="text-3xl font-bold text-ocean-600">
                  ฿{selectedPkg.price.toLocaleString()}
                </span>
              </div>
              {selectedPkg.includes && selectedPkg.includes.length > 0 && (
                <div className="text-sm text-gray-600 mb-4">
                  <p className="font-medium mb-2">包含內容：</p>
                  <ul className="list-disc list-inside text-gray-500">
                    {selectedPkg.includes.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-sm text-gray-500">
                * 最終價格以確認為準
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

export default function YachtBookingPage() {
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
