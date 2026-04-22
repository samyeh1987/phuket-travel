'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { CheckCircle, Clock, MapPin, ChevronLeft, Users } from 'lucide-react';

const showData: Record<string, {
  name: string; subtitle: string; description: string;
  heroImage: string; duration: string; location: string;
  packages: { id: string; name: string; price: number; includes: string[] }[];
}> = {
  'korean-show': {
    name: '天皇秀', subtitle: 'Korean Cabaret Show',
    description: '天皇秀是普吉最受欢迎的韩国歌舞秀，融合了韩国流行文化元素，演员阵容强大，舞台效果震撼。华丽的服装、热情的舞蹈、精彩的互动环节，适合所有年龄段的观众。秀场提供往返接送服务，专业中文导游陪同。',
    heroImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80',
    duration: '75分钟', location: '普吉镇天皇秀剧场',
    packages: [
      { id: 'standard', name: '普通票', price: 380, includes: ['秀场普通区座位', '往返接送', '中文导游'] },
      { id: 'vip', name: 'VIP票', price: 580, includes: ['VIP专属区域', '优先入场', '往返接送', '中文导游', '纪念品'] },
      { id: 'vvip', name: 'VVIP票', price: 880, includes: ['VVIP前排座位', '演员合影', 'VIP室休息', '往返接送', '全程中文导游', '定制礼品'] },
    ],
  },
  'simon-show': {
    name: '西蒙秀', subtitle: 'Simon Cabaret Show',
    description: '西蒙秀是普吉岛最著名的人妖秀，自1989年开业以来已接待超过千万游客。演员们的变装表演精湛绝伦，服装华丽炫目，舞台效果震撼人心。秀场提供多种座位选择，演出期间禁止拍照摄像。',
    heroImage: 'https://images.unsplash.com/photo-1516475429286-465d815a0df7?w=1920&q=80',
    duration: '70分钟', location: '芭东海滩西蒙秀剧场',
    packages: [
      { id: 'standard', name: '普通票', price: 280, includes: ['普通区座位', '往返接送'] },
      { id: 'vip', name: 'VIP票', price: 480, includes: ['VIP专属区域', '优先入场', '往返接送', '中文导游'] },
      { id: 'gold', name: '黄金票', price: 680, includes: ['黄金区座位', '演员互动', '往返接送', '中文导游', '合影券'] },
    ],
  },
};

export default function ShowDetailPage() {
  const params = useParams();
  const showKey = params.show as string;
  const info = showData[showKey];

  const [selectedPkg, setSelectedPkg] = useState<typeof info.packages[0] | null>(null);
  const [quantity, setQuantity] = useState(2);
  const [showDate, setShowDate] = useState('');
  const [nameCn, setNameCn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  if (!info) return <div className="p-8 text-center">秀场不存在</div>;

  const handleSubmit = () => {
    if (!selectedPkg || !showDate || !nameCn || !phone) {
      alert('请填写必填信息');
      return;
    }
    window.location.href = `/payment/confirmation?show=${showKey}&pkg=${selectedPkg.id}&people=${quantity}&date=${showDate}&total=${selectedPkg.price * quantity}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32 md:pb-0">
      {/* Hero */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <Image src={info.heroImage} alt={info.name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <a href="/show" className="absolute top-4 left-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center md:hidden">
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </a>
        <div className="absolute bottom-4 left-4 md:left-8 text-white">
          <h1 className="text-2xl md:text-4xl font-bold">{info.name}</h1>
          <p className="text-sm md:text-lg text-white/80">{info.subtitle}</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
        {/* Info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-600 leading-relaxed">{info.description}</p>
          <div className="flex gap-4 mt-4 pt-4 border-t text-sm text-gray-500">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{info.duration}</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{info.location}</span>
          </div>
        </div>

        {/* Packages */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">选择套餐</h2>
          <div className="space-y-3">
            {info.packages.map(pkg => (
              <div
                key={pkg.id}
                onClick={() => setSelectedPkg(pkg.id === selectedPkg?.id ? null : pkg)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPkg?.id === pkg.id ? 'border-ocean-500 bg-ocean-50' : 'border-gray-100 bg-gray-50 hover:border-ocean-200'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">{pkg.name}</h3>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {pkg.includes.map(inc => (
                        <span key={inc} className="text-xs text-gray-500 flex items-center gap-0.5">
                          <CheckCircle className="w-3 h-3 text-ocean-400" />{inc}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-ocean-600 font-bold text-xl">¥{pkg.price}</div>
                    <div className="text-xs text-gray-400">/人</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Form */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900">预订信息</h2>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">观看日期 *</label>
            <input type="date" value={showDate} onChange={e => setShowDate(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
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
          </div>
        </div>

        {/* Total */}
        {selectedPkg && (
          <div className="bg-ocean-500 text-white rounded-2xl p-5 shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm opacity-80">应付总额</div>
                <div className="text-3xl font-bold">¥{(selectedPkg.price * quantity).toLocaleString()}</div>
                <div className="text-xs opacity-70 mt-1">{selectedPkg.name} × {quantity}人</div>
              </div>
              <button
                onClick={handleSubmit}
                className="px-8 py-4 bg-white text-ocean-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors"
              >
                提交订单
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
