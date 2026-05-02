'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Loader2, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/lib/supabase';
import ErrorBoundary from '@/components/ErrorBoundary';

interface ShowPkg {
  id: string; show_id: string; name: string; description: string; price: string; price_cny: string;
}

interface ShowInfo {
  id: string; name: string; description: string; image_url: string;
}

function genOrderNo() { return 'SW' + Date.now().toString().slice(-8); }

const fmtCny = (v: string | number | null | undefined) => {
  const n = Number(v);
  return isNaN(n) || n <= 0 ? null : n.toLocaleString();
};

export default function ShowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const showKey = params.show as string;

  const [showInfo, setShowInfo] = useState<ShowInfo | null>(null);
  const [packages, setPackages] = useState<ShowPkg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderNo = useMemo(() => genOrderNo(), []);
  const [selectedPkg, setSelectedPkg] = useState<ShowPkg | null>(null);
  const [quantity, setQuantity] = useState(2);
  const [showDate, setShowDate] = useState('');
  const [nameCn, setNameCn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [wechat, setWechat] = useState('');
  const [hotel, setHotel] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!showKey) {
      setError('無效的秀場參數');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const supabase = createClient();
        
        // 先查 show - 使用 maybeSingle 避免多条数据报错
        const { data: showData, error: showError } = await supabase
          .from('shows')
          .select('*')
          .eq('slug', showKey)
          .maybeSingle();
        
        if (showError) {
          console.error('秀場查詢錯誤:', showError);
          setError(`秀場查詢失敗: ${showError.message}`);
          return;
        }
        
        if (!showData) {
          setError('秀場不存在');
          return;
        }
        
        setShowInfo(showData);
        
        // 再查其套餐
        const { data: pkgData, error: pkgError } = await supabase
          .from('show_packages')
          .select('*')
          .eq('show_id', showData.id)
          .eq('is_active', true)
          .order('sort_order');
        
        if (pkgError) {
          console.error('套餐讀取失敗:', pkgError);
        }
        
        setPackages(pkgData || []);
      } catch (err: any) {
        console.error('載入錯誤:', err);
        setError(err.message || '發生未知錯誤');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [showKey]);

  // 錯誤顯示
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">載入失敗</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/show')}
            className="px-6 py-3 bg-ocean-500 text-white rounded-xl hover:bg-ocean-600 transition-colors"
          >
            返回秀場列表
          </button>
        </div>
      </div>
    );
  }

  // 秀場不存在
  if (!showInfo && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-gray-400 text-6xl mb-4">🎭</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">秀場不存在</h2>
          <p className="text-gray-600 mb-6">該秀場可能已被刪除或網址不正確</p>
          <button
            onClick={() => router.push('/show')}
            className="px-6 py-3 bg-ocean-500 text-white rounded-xl hover:bg-ocean-600 transition-colors"
          >
            返回秀場列表
          </button>
        </div>
      </div>
    );
  }

  // 載入中
  if (loading || !showInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-ocean-500" />
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!user) {
      router.push(`/auth/login?next=${encodeURIComponent(`/show/${showKey}`)}`);
      return;
    }
    if (!selectedPkg || !showDate || !nameCn || !phone) {
      alert('请填写必填信息（日期、姓名、联系电话）');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    const supabase = createClient();

    // 构建订单数据
    const orderData = {
      order_number: orderNo,
      user_id: user.id,
      type: 'show',
      status: 'pending',
      payment_status: 'unpaid',
      travel_date: showDate,
      quantity: quantity,
      total_price: selectedPkg ? Number(selectedPkg.price) * quantity : 0,
      contact_name_cn: nameCn,
      contact_name_en: nameEn,
      contact_phone: phone,
      contact_email: email,
      contact_wechat: wechat,
      hotel_name: hotel,
      extra_data: {
        show_key: showKey,
        show_name: showInfo.name,
        package: selectedPkg,
      },
    };

    // 保存到数据库
    const { data, error } = await supabase.from('orders').insert(orderData).select('id').single();
    if (error) {
      console.error('订单保存失败:', error);
      const errorMsg = error.message || '订单保存失败，请重试';
      setSubmitError(errorMsg.includes('order_number') 
        ? '系统配置错误，请联系客服' 
        : errorMsg);
      setSubmitting(false);
      return;
    }

    // 跳转到付款页面
    router.push(`/payment/${data.id}`);
    setSubmitting(false);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="relative h-48 md:h-64 overflow-hidden">
          <Image src={showInfo?.image_url || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1920&q=80'} alt={showInfo?.name || '秀场'} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <a href="/show" className="absolute top-4 left-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center md:hidden">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </a>
          <div className="absolute bottom-4 left-4 md:left-8 text-white">
            <h1 className="text-2xl md:text-4xl font-bold">{showInfo?.name || '秀场'}</h1>
          </div>
        </div>

        <div className="max-w-xl mx-auto px-4 py-6 pb-10 space-y-4">
          {/* Info */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-600 leading-relaxed">{showInfo?.description || '暂无描述'}</p>
          </div>

          {/* Packages */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">选择套餐 *</h2>
            <div className="space-y-3">
              {packages.map(pkg => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPkg(pkg.id === selectedPkg?.id ? null : pkg)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPkg?.id === pkg.id ? 'border-ocean-500 bg-ocean-50' : 'border-gray-100 bg-gray-50 hover:border-ocean-200'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">{pkg.name}</h3>
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{pkg.description}</p>
                    </div>
                    <div className="text-right ml-3 flex-shrink-0">
                      <div className="text-ocean-600 font-bold text-xl">฿{Number(pkg.price).toLocaleString()}</div>
                      <div className="text-xs text-gray-400">¥{fmtCny(pkg.price_cny) || '-'}人</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900">预订信息</h2>

            {/* 订单号 */}
            <div className="flex justify-between items-center bg-ocean-50 rounded-xl px-4 py-2">
              <span className="text-xs text-ocean-600">订单号</span>
              <span className="font-mono text-sm font-bold text-ocean-700">{orderNo}</span>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">观看日期 *</label>
              <div className="relative">
                <input type="date" value={showDate} onChange={e => setShowDate(e.target.value)} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 transition-colors bg-white appearance-none cursor-pointer" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">📅</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">人数</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-lg">−</button>
                <span className="w-10 text-center font-bold text-xl">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-full bg-ocean-500 text-white flex items-center justify-center font-bold text-lg">+</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">中文姓名 *</label>
                <input type="text" placeholder="张三" value={nameCn} onChange={e => setNameCn(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">英文姓名</label>
                <input type="text" placeholder="ZHANG SAN" value={nameEn} onChange={e => setNameEn(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">联系电话 *</label>
                <input type="tel" placeholder="+86 138xxxx" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">邮箱</label>
                <input type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">微信号</label>
                <input type="text" placeholder="方便客服联系" value={wechat} onChange={e => setWechat(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">预订酒店</label>
                <input type="text" placeholder="入住酒店名称" value={hotel} onChange={e => setHotel(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
              </div>
            </div>
          </div>

          {/* Total & Submit */}
          {selectedPkg && (
            <div className="space-y-3">
              {/* 错误提示 */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
                  {submitError}
                </div>
              )}
              <div className="bg-ocean-500 text-white rounded-2xl p-5 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-sm opacity-80">应付总额</div>
                    <div className="text-3xl font-bold">฿{(Number(selectedPkg.price) * quantity).toLocaleString()}</div>
                    <div className="text-xs opacity-70">约 ¥{fmtCny(Number(selectedPkg.price_cny) * quantity) || '-'} / {selectedPkg.name} × {quantity}人</div>
                  </div>
                  <div className="text-right text-xs opacity-70">
                    <div>订单号</div>
                    <div className="font-mono">{orderNo}</div>
                  </div>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-4 bg-white text-ocean-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {submitting ? '提交中...' : '提交订单 · 前往支付'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
