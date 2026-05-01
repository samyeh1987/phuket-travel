'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Anchor, CheckCircle, Clock } from 'lucide-react';

interface DivingPackage {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  price_cny: string;
  type: string;
  duration: string;
  is_active: boolean;
  includes?: string[];
}

export default function DivingPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<DivingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch('/api/packages/diving')
      .then(r => r.json())
      .then(j => setPackages(j.data || []))
      .finally(() => setLoading(false));
  }, []);

  const updateQty = (id: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  const fmtCny = (v: string | number | null | undefined) => {
    const n = Number(v);
    return isNaN(n) || n <= 0 ? null : n.toLocaleString();
  };

  const totalPrice = Object.entries(quantities).reduce((sum, [id, qty]) => {
    const pkg = packages.find(d => d.id === id);
    const price = Number(pkg?.price_cny) || Number(pkg?.price) || 0;
    return sum + price * qty;
  }, 0);

  const totalQty = Object.values(quantities).reduce((a, b) => a + b, 0);

  const selectedSummary = packages
    .filter(d => (quantities[d.id] || 0) > 0)
    .map(d => `${d.name}×${quantities[d.id]}`)
    .join('、');

  const handleBook = () => {
    const items = packages
      .filter(d => (quantities[d.id] || 0) > 0)
      .map(d => `${d.id}:${quantities[d.id]}`)
      .join(',');
    router.push(`/diving/book?items=${encodeURIComponent(items)}`);
  };

  const typeLabels: Record<string, string> = {
    experience: '体验深潜',
    ow: '水肺OW考证',
    aow: 'AOW进阶考证',
    free2: '自由潜2星',
    free3: '自由潜3星',
  };

  const defaultIncludes: Record<string, string[]> = {
    experience: ['专业教练全程陪同', '全套潜水装备', '水下拍照', '午餐供应', '酒店接送'],
    ow: ['PADI认证课程', '专业教练', '教材与装备', '泳池训练', '开放水域2次', '证书邮寄'],
    aow: ['PADI认证课程', '5次开放水域', '深潜+导航专长', '专业教练', '全套装备'],
    free2: ['PADI/SSI认证', '理论课程', '平静水域', '开放水域2次', '装备租用'],
    free3: ['PADI/SSI认证', '深度训练', '救援技巧', '理论+实践', '装备全套'],
  };

  const images: Record<string, string> = {
    experience: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    ow: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80',
    aow: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
    free2: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
    free3: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
  };

  const getPkgImage = (pkg: DivingPackage) =>
    (pkg as any).image_url || images[pkg.type] || images['experience'];

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
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="w-6 h-6 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm">加载中...</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="p-12 text-center text-gray-400 bg-white rounded-2xl shadow-sm text-sm">暂无套餐</div>
        ) : (
          packages.filter(p => p.is_active).map(pkg => {
            const qty = quantities[pkg.id] || 0;
            const isExpanded = expandedId === pkg.id;
            const priceThb = Number(pkg.price) || 0;
            const priceCny = Number(pkg.price_cny) || 0;
            const includes = defaultIncludes[pkg.type] || pkg.description?.split('、') || [];

            return (
              <div
                key={pkg.id}
                className={`bg-white rounded-2xl overflow-hidden shadow-sm transition-all ${qty > 0 ? 'ring-2 ring-ocean-500' : 'hover:shadow-md'}`}
              >
                <div
                  className="flex cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : pkg.id)}
                >
                  <div className="relative w-28 h-28 sm:w-40 sm:h-32 flex-shrink-0">
                    <Image src={getPkgImage(pkg)} alt={pkg.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900">{pkg.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{pkg.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-ocean-600 font-bold text-lg">฿{priceThb.toLocaleString()}</div>
                          <div className="text-green-600 font-semibold text-sm">¥{fmtCny(pkg.price_cny) || '-'}</div>
                          <div className="text-xs text-gray-400">/人</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        {pkg.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{pkg.duration}</span>}
                        {['ow', 'aow', 'free2', 'free3'].includes(pkg.type) && (
                          <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-xs">考证·需邮箱</span>
                        )}
                      </div>
                    </div>

                    {/* 数量控制 */}
                    <div className="mt-3 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => updateQty(pkg.id, -1)}
                        className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center hover:bg-gray-200"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-semibold text-gray-900">{qty}</span>
                      <button
                        onClick={() => updateQty(pkg.id, 1)}
                        className="w-8 h-8 rounded-full bg-ocean-500 text-white font-bold flex items-center justify-center hover:bg-ocean-600"
                      >
                        +
                      </button>
                      {qty > 0 && (
                        <span className="text-xs text-green-600 font-medium ml-1">= ¥{fmtCny(priceCny * qty) || '-'}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 展开详情 */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {includes.map((inc, i) => (
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
          })
        )}
      </div>

      {/* Floating CTA */}
      {totalQty > 0 && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-ocean-600 text-white p-4 z-50 shadow-2xl">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <div className="text-sm opacity-80">{selectedSummary}</div>
              <div className="text-2xl font-bold">¥{fmtCny(totalPrice) || '-'}</div>
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
