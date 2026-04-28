'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Clock, Users, CheckCircle, ChevronLeft, Plus, MessageCircle } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/lib/supabase';

const islandData: Record<string, {
  name: string; subtitle: string; description: string;
  heroImage: string; galleryImages: string[];
  highlights: string[];
}> = {
  racha: {
    name: '皇帝岛', subtitle: 'Racha Island',
    description: '皇帝岛以其澄澈见底的玻璃海水闻名，是普吉周边最受欢迎的跳岛目的地之一。海水清澈见底，珊瑚礁保存完好，浮潜体验绝佳。',
    heroImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    ],
    highlights: ['玻璃海水', '白沙滩', '浮潜胜地', '深潜天堂', '快艇直达'],
  },
  pp: {
    name: '皮皮岛', subtitle: 'Phi Phi Island',
    description: '皮皮岛因好莱坞电影《海滩》在此取景而闻名世界，拥有壮观的石灰岩悬崖和清澈的泻湖水，是摄影爱好者和自然探索者的必去之地。',
    heroImage: 'https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=1920&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=800&q=80',
      'https://images.unsplash.com/photo-1537953773345-d172ccf13cf4?w=800&q=80',
    ],
    highlights: ['玛雅湾', '猴子沙滩', '维京洞穴', '天然泳池', '观景台'],
  },
  similan: {
    name: '斯米兰群岛', subtitle: 'Similan Islands',
    description: '斯米兰群岛被《国家地理》评为世界十大潜水圣地之一，每年仅开放约6个月（11月-次年4月），原始的海洋生态和珊瑚礁保存完好，是潜水爱好者的朝圣之地。',
    heroImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
    ],
    highlights: ['世界级潜点', '海龟栖息地', '珊瑚花园', '每年限时开放', '原始生态'],
  },
};

const boatData = {
  racha: [
    { id: 'speedboat-1', name: '豪华双体帆船', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80', price: 680, capacity: 25, duration: '8小时', features: ['双体船稳定', '含午餐', '浮潜装备', '水果饮料', '中文导游'] },
    { id: 'speedboat-2', name: '彩虹号快艇', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', price: 580, capacity: 35, duration: '7小时', features: ['快艇直达', '含午餐', '浮潜装备', '水果饮料'] },
  ],
  pp: [
    { id: 'pp-1', name: '皮皮岛专线大船', image: 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=800&q=80', price: 780, capacity: 50, duration: '10小时', features: ['大船平稳', '含午餐', '浮潜装备', '中文导游', '观景点'] },
    { id: 'pp-2', name: '皮皮岛VIP快艇', image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf4?w=800&q=80', price: 980, capacity: 20, duration: '9小时', features: ['VIP小团', '两次浮潜', '海鲜午餐', '中文导游', '无人机拍摄'] },
  ],
  similan: [
    { id: 'similan-1', name: '斯米兰探索号', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80', price: 1080, capacity: 30, duration: '11小时', features: ['深潜首选', '含午餐', '浮潜装备', '英文教练', '装备齐全'] },
    { id: 'similan-2', name: '斯米兰潜水专船', image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80', price: 1280, capacity: 20, duration: '12小时', features: ['专业潜导', '两次深潜', '含午餐', '装备全包', 'PADI认证'] },
  ],
};

interface Traveler {
  nameCn: string; nameEn: string; passport: string; birthdate: string;
}

function genOrderNo() { return 'IS' + Date.now().toString().slice(-8); }

export default function IslandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const island = params.island as string;
  const info = islandData[island];
  const boats = boatData[island as keyof typeof boatData] || [];

  const orderNo = useMemo(() => genOrderNo(), []);
  const [selectedBoat, setSelectedBoat] = useState<typeof boats[0] | null>(null);
  const [tab, setTab] = useState<'detail' | 'book'>('detail');
  const [people, setPeople] = useState(2);
  const [travelDate, setTravelDate] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [hotelAddress, setHotelAddress] = useState('');
  const [contactNameCn, setContactNameCn] = useState('');
  const [contactNameEn, setContactNameEn] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactWechat, setContactWechat] = useState('');
  const [travelers, setTravelers] = useState<Traveler[]>([{ nameCn: '', nameEn: '', passport: '', birthdate: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const supabase = createClient();

  if (!info) return <div className="p-8 text-center">岛屿不存在</div>;

  const addTraveler = () => {
    setTravelers([...travelers, { nameCn: '', nameEn: '', passport: '', birthdate: '' }]);
  };

  const updateTraveler = (index: number, field: keyof Traveler, value: string) => {
    const updated = [...travelers];
    updated[index] = { ...updated[index], [field]: value };
    setTravelers(updated);
  };

  const buildWechatMsg = () => {
    const lines = [
      `🏝️ 跳岛游预订`,
      `📋 订单号：${orderNo}`,
      `📍 目的地：${info.name}`,
      `🚢 船只：${selectedBoat?.name ?? '-'}`,
      `📅 出行日期：${travelDate || '待定'}`,
      `👥 人数：${people}人`,
      `💰 总金额：¥${selectedBoat ? (selectedBoat.price * people).toLocaleString() : '-'}`,
      ``,
      `🏨 酒店：${hotelName || '-'}`,
      `📍 地址：${hotelAddress || '-'}`,
      ``,
      `👤 联系人：${contactNameCn} / ${contactNameEn || '-'}`,
      `📞 电话：${contactPhone || '-'}`,
      `📧 邮箱：${contactEmail || '-'}`,
      `💬 微信：${contactWechat || '-'}`,
      ``,
    ];
    travelers.forEach((t, i) => {
      lines.push(`━━ 出行人 ${i + 1} ━━`);
      lines.push(`姓名：${t.nameCn} / ${t.nameEn || '-'}`);
      lines.push(`护照：${t.passport || '-'}`);
      lines.push(`生日：${t.birthdate || '-'}`);
      lines.push('');
    });
    lines.push('请确认预订，谢谢！🙏');
    return lines.join('\n');
  };

  const handleSubmit = async () => {
    if (!user) {
      router.push(`/auth/login?next=${encodeURIComponent(`/island-tour/${island}`)}`);
      return;
    }
    if (!selectedBoat || !travelDate || !contactNameCn || !contactPhone) {
      alert('请填写必填信息（出行日期、姓名、联系电话）');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    // 构建订单数据
    const orderData = {
      user_id: user.id,
      type: 'island',
      status: 'pending',
      payment_status: 'unpaid',
      travel_date: travelDate,
      quantity: people,
      total_price: selectedBoat ? selectedBoat.price * people : 0,
      contact_name_cn: contactNameCn,
      contact_name_en: contactNameEn,
      contact_phone: contactPhone,
      contact_email: contactEmail,
      contact_wechat: contactWechat,
      hotel_name: hotelName,
      hotel_address: hotelAddress,
      extra_data: {
        island: island,
        island_name: info.name,
        boat: selectedBoat,
        travelers: travelers,
      },
    };

    // 保存到数据库
    const { data, error } = await supabase.from('orders').insert(orderData).select('id').single();
    if (error) {
      console.error('订单保存失败:', error);
      setSubmitError('订单保存失败，请重试');
      setSubmitting(false);
      return;
    }

    const msg = buildWechatMsg();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(msg).catch(() => {});
    }

    // 跳转到付款页面
    router.push(`/payment/${data.id}`);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <Image src={info.heroImage} alt={info.name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <a href="/island-tour" className="absolute top-4 left-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center md:hidden">
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </a>
        <div className="absolute bottom-4 left-4 md:left-8 text-white">
          <h1 className="text-2xl md:text-4xl font-bold">{info.name}</h1>
          <p className="text-sm md:text-lg text-white/80">{info.subtitle}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white sticky top-14 md:top-16 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto flex">
          {[['detail', '岛屿详情'], ['book', '立即预订']].map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t as typeof tab)}
              className={`flex-1 py-3.5 text-sm font-semibold border-b-2 transition-colors ${tab === t ? 'text-ocean-600 border-ocean-500' : 'text-gray-400 border-transparent'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Detail Tab */}
      {tab === 'detail' && (
        <div className="max-w-4xl mx-auto px-4 py-6 pb-36 space-y-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-2">关于{info.name}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{info.description}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">行程亮点</h2>
            <div className="flex flex-wrap gap-2">
              {info.highlights.map(h => (
                <span key={h} className="px-3 py-1.5 bg-ocean-50 text-ocean-700 rounded-full text-sm font-medium">{h}</span>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">实拍图片</h2>
            <div className="grid grid-cols-2 gap-3">
              {info.galleryImages.map((img, i) => (
                <div key={i} className="relative h-40 rounded-xl overflow-hidden">
                  <Image src={img} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">选择船只</h2>
            <div className="space-y-3">
              {boats.map(boat => (
                <div
                  key={boat.id}
                  onClick={() => setSelectedBoat(boat.id === selectedBoat?.id ? null : boat)}
                  className={`flex gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedBoat?.id === boat.id ? 'border-ocean-500 bg-ocean-50' : 'border-gray-100 bg-gray-50 hover:border-ocean-200'}`}
                >
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={boat.image} alt={boat.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900">{boat.name}</h3>
                      <div className="text-right">
                        <div className="text-ocean-600 font-bold">¥{boat.price}</div>
                        <div className="text-xs text-gray-400">/人</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{boat.capacity}人</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{boat.duration}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {boat.features.map(f => (
                        <span key={f} className="px-1.5 py-0.5 bg-white rounded text-xs text-gray-600">{f}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {selectedBoat && (
            <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white border-t p-4 z-50 shadow-lg">
              <div className="max-w-4xl mx-auto flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">已选：{selectedBoat.name}</div>
                  <div className="text-ocean-600 font-bold text-xl">¥{selectedBoat.price}起/人</div>
                </div>
                <button
                  onClick={() => setTab('book')}
                  className="px-8 py-4 bg-ocean-500 text-white rounded-full font-bold text-lg hover:bg-ocean-600 transition-colors"
                >
                  立即预订
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Book Tab */}
      {tab === 'book' && (
        <div className="max-w-xl mx-auto px-4 py-6 pb-10 space-y-4">
          {!selectedBoat && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
              请先在「岛屿详情」中选择船只
            </div>
          )}

          {/* 订单摘要 */}
          {selectedBoat && (
            <div className="bg-ocean-50 border border-ocean-200 rounded-2xl p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-ocean-700 font-medium">{info.name} · {selectedBoat.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{selectedBoat.duration}</div>
                </div>
                <span className="font-mono text-xs text-ocean-600 bg-ocean-100 px-2 py-1 rounded-full">{orderNo}</span>
              </div>
            </div>
          )}

          {/* 预订基本信息 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900">预订信息</h3>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">出行日期 *</label>
              <input type="date" value={travelDate} onChange={e => setTravelDate(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">人数</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setPeople(Math.max(1, people - 1))} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">−</button>
                <span className="w-10 text-center font-semibold text-lg">{people}</span>
                <button onClick={() => setPeople(people + 1)} className="w-10 h-10 rounded-full bg-ocean-500 text-white flex items-center justify-center font-bold">+</button>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">酒店名称 *</label>
              <input type="text" placeholder="入住酒店名称" value={hotelName} onChange={e => setHotelName(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">酒店地址 / Google Maps 链接</label>
              <input type="text" placeholder="粘贴地址或链接" value={hotelAddress} onChange={e => setHotelAddress(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
            </div>
          </div>

          {/* 联系人 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900">联系人信息</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">中文姓名 *</label>
                <input type="text" placeholder="张三" value={contactNameCn} onChange={e => setContactNameCn(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">英文姓名</label>
                <input type="text" placeholder="ZHANG SAN" value={contactNameEn} onChange={e => setContactNameEn(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">联系电话 *</label>
                <input type="tel" placeholder="+86 138xxxx" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">邮箱</label>
                <input type="email" placeholder="email@example.com" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">微信号</label>
                <input type="text" placeholder="方便客服联系" value={contactWechat} onChange={e => setContactWechat(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
              </div>
            </div>
          </div>

          {/* 出行人员 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">出行人员（共{travelers.length}人）</h3>
              <button onClick={addTraveler} className="flex items-center gap-1 text-sm text-ocean-500 font-medium">
                <Plus className="w-4 h-4" /> 添加
              </button>
            </div>
            {travelers.map((t, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
                <div className="text-xs font-medium text-gray-500">出行人 {i + 1}</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">中文姓名</label>
                    <input type="text" placeholder="张三" value={t.nameCn} onChange={e => updateTraveler(i, 'nameCn', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">英文姓名</label>
                    <input type="text" placeholder="ZHANG SAN" value={t.nameEn} onChange={e => updateTraveler(i, 'nameEn', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">护照号码</label>
                    <input type="text" placeholder="E12345678" value={t.passport} onChange={e => updateTraveler(i, 'passport', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">出生日期</label>
                    <input type="date" value={t.birthdate} onChange={e => updateTraveler(i, 'birthdate', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 提交 */}
          {selectedBoat && (
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
                    <div className="text-3xl font-bold">¥{(selectedBoat.price * people).toLocaleString()}</div>
                    <div className="text-xs opacity-70 mt-1">{selectedBoat.name} × {people}人</div>
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
                  <MessageCircle className="w-5 h-5" />
                  {submitting ? '提交中...' : '提交订单 · 前往支付'}
                </button>
                <p className="text-xs text-center text-white/60 mt-2">订单提交后将跳转至支付页面</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
