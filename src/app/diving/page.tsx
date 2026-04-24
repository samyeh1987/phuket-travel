'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Anchor, CheckCircle, Clock } from 'lucide-react';

const divingTypes = [
  {
    id: 'experience',
    title: '体验深潜',
    subtitle: '无需证书，初次体验',
    price: 1800,
    unit: '人',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    includes: ['专业教练全程陪同', '全套潜水装备', '水下拍照', '午餐供应', '酒店接送'],
    duration: '约4小时',
    needEmail: false,
  },
  {
    id: 'ow',
    title: '水肺OW考证',
    subtitle: '开放水域潜水员证书',
    price: 2800,
    unit: '人',
    image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80',
    includes: ['PADI认证课程', '专业教练', '教材与装备', '泳池训练', '开放水域2次', '证书邮寄'],
    duration: '3天课程',
    needEmail: true,
  },
  {
    id: 'aow',
    title: '水肺AOW考证',
    subtitle: '进阶开放水域潜水员',
    price: 2500,
    unit: '人',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
    includes: ['PADI认证课程', '5次开放水域', '深潜+导航专长', '专业教练', '全套装备'],
    duration: '2天课程',
    needEmail: true,
  },
  {
    id: 'free2',
    title: '自由潜2星',
    subtitle: '自由潜水员入门',
    price: 2200,
    unit: '人',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
    includes: ['PADI/SSI认证', '理论课程', '平静水域', '开放水域2次', '装备租用'],
    duration: '2天课程',
    needEmail: true,
  },
  {
    id: 'free3',
    title: '自由潜3星',
    subtitle: '自由潜水员进阶',
    price: 3000,
    unit: '人',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
    includes: ['PADI/SSI认证', '深度训练', '救援技巧', '理论+实践', '装备全套'],
    duration: '4天课程',
    needEmail: true,
  },
];

export default function DivingPage() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const updateQty = (id: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  const totalPrice = Object.entries(quantities).reduce((sum, [id, qty]) => {
    const item = divingTypes.find(d => d.id === id);
    return sum + (item?.price || 0) * qty;
  }, 0);

  const totalQty = Object.values(quantities).reduce((a, b) => a + b, 0);

  const selectedSummary = divingTypes
    .filter(d => (quantities[d.id] || 0) > 0)
    .map(d => `${d.title}×${quantities[d.id]}`)
    .join('、');

  const handleBook = () => {
    // 将选课信息编码到 URL，传给报名页
    const items = divingTypes
      .filter(d => (quantities[d.id] || 0) > 0)
      .map(d => `${d.id}:${quantities[d.id]}`)
      .join(',');
    router.push(`/diving/book?items=${encodeURIComponent(items)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      {/* Hero */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=80"
          alt="深潜"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-4 left-4 md:left-8 text-white">
          <h1 className="text-2xl md:text-4xl font-bold">深潜体验 &amp; 考证</h1>
          <p className="text-sm md:text-lg text-white/80 mt-1">探索普吉海底世界，考取国际潜水证书</p>
        </div>
      </div>

      {/* 提示 */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <div className="bg-ocean-50 border border-ocean-200 rounded-xl px-4 py-3 text-sm text-ocean-700 flex items-center gap-2">
          <Anchor className="w-4 h-4 flex-shrink-0" />
          选择项目后点击「立即预订」填写报名信息（每人一份），完成后发给客服确认
        </div>
      </div>

      {/* Diving Types */}
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {divingTypes.map(item => {
          const qty = quantities[item.id] || 0;
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl overflow-hidden shadow-sm transition-all ${qty > 0 ? 'ring-2 ring-ocean-500' : 'hover:shadow-md'}`}
            >
              <div
                className="flex cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <div className="relative w-28 h-28 sm:w-40 sm:h-32 flex-shrink-0">
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                </div>
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900">{item.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{item.subtitle}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-ocean-600 font-bold text-lg">¥{item.price}</div>
                        <div className="text-xs text-gray-400">/{item.unit}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.duration}</span>
                      {item.needEmail && (
                        <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-xs">考证·需邮箱</span>
                      )}
                    </div>
                  </div>

                  {/* 数量控制 */}
                  <div className="mt-3 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center hover:bg-gray-200"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold text-gray-900">{qty}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="w-8 h-8 rounded-full bg-ocean-500 text-white font-bold flex items-center justify-center hover:bg-ocean-600"
                    >
                      +
                    </button>
                    {qty > 0 && (
                      <span className="text-xs text-ocean-600 font-medium ml-1">= ¥{(item.price * qty).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 展开详情 */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {item.includes.map((inc, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                        <CheckCircle className="w-3.5 h-3.5 text-ocean-500 flex-shrink-0" />
                        {inc}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating CTA */}
      {totalQty > 0 && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-ocean-600 text-white p-4 z-50 shadow-2xl">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <div className="text-sm opacity-80">{selectedSummary}</div>
              <div className="text-2xl font-bold">¥{totalPrice.toLocaleString()}</div>
            </div>
            <button
              onClick={handleBook}
              className="px-8 py-4 bg-white text-ocean-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              填写报名表
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
