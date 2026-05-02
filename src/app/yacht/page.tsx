'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Ship, Users, Clock, CheckCircle, Anchor } from 'lucide-react';

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
  price_per_person: number;
  includes: string[];
}

export default function YachtPage() {
  const [packages, setPackages] = useState<YachtPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch('/api/packages/yacht');
        const data = await res.json();
        if (data.data) {
          setPackages(data.data);
        }
      } catch (err) {
        setError('Failed to load yacht packages');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">加載中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-16">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[450px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1920&q=80"
            alt="包船服務"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/50" />
        </div>
        
        <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">尊享包船服務</h1>
          <p className="text-xl text-white/90 mb-8 drop-shadow-md">
            豪華遊艇出海，私人定製行程，體驗不一樣的普吉
          </p>
          <Link
            href="/yacht/book"
            className="inline-block px-8 py-4 bg-ocean-500 hover:bg-ocean-600 text-white rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            立即預訂
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">為什麼選擇包船</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <Ship className="w-10 h-10 text-ocean-500 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-800">私人定制</h4>
              <p className="text-gray-500 text-sm">完全私密的海上時光</p>
            </div>
            <div className="text-center">
              <Users className="w-10 h-10 text-ocean-500 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-800">人數靈活</h4>
              <p className="text-gray-500 text-sm">8-20人可選</p>
            </div>
            <div className="text-center">
              <Clock className="w-10 h-10 text-ocean-500 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-800">時間自由</h4>
              <p className="text-gray-500 text-sm">4-8小時可選</p>
            </div>
            <div className="text-center">
              <Anchor className="w-10 h-10 text-ocean-500 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-800">玩樂豐富</h4>
              <p className="text-gray-500 text-sm">浮潛/游泳/派對</p>
            </div>
          </div>
        </div>
      </section>

      {/* Yacht Packages */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">選擇船型</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                {pkg.image_url && (
                  <div className="relative h-56">
                    <Image
                      src={pkg.image_url}
                      alt={pkg.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-ocean-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {pkg.duration}
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{pkg.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{pkg.description}</p>
                  
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>最多 {pkg.capacity} 人</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{pkg.duration}</span>
                    </div>
                  </div>

                  {pkg.includes && pkg.includes.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">包含內容</p>
                      <div className="flex flex-wrap gap-2">
                        {pkg.includes.slice(0, 5).map((item, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {item}
                          </span>
                        ))}
                        {pkg.includes.length > 5 && (
                          <span className="text-xs text-gray-400">+{pkg.includes.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">套餐價格</span>
                      <div>
                        <span className="text-2xl font-bold text-ocean-600">฿{pkg.price.toLocaleString()}</span>
                        <span className="text-gray-400 text-sm"> / 起步</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/yacht/book?yacht=${pkg.slug}`}
                    className="mt-4 w-full block text-center py-3 bg-ocean-500 text-white rounded-lg font-semibold hover:bg-ocean-600 transition-colors"
                  >
                    選擇此船型
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">推薦路線</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-ocean-500 to-ocean-600 text-white rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-2">皇帝島線</h3>
              <p className="text-white/80 text-sm mb-4">適合浮潛和休閒，水質清澈</p>
              <div className="text-white/60 text-sm">來回約 3-4 小時</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-2">皮皮島線</h3>
              <p className="text-white/80 text-sm mb-4">遊覽瑪雅灣，網紅打卡地</p>
              <div className="text-white/60 text-sm">來回約 5-6 小時</div>
            </div>
            <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-2">珊瑚島線</h3>
              <p className="text-white/80 text-sm mb-4">水上項目豐富，適合家庭</p>
              <div className="text-white/60 text-sm">來回約 2-3 小時</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">服務保障</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-800">持牌船長</h4>
              <p className="text-gray-500 text-sm">專業資質，安全保障</p>
            </div>
            <div className="text-center">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-800">保險覆蓋</h4>
              <p className="text-gray-500 text-sm">全員保險，出行無憂</p>
            </div>
            <div className="text-center">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-800">餐飲全包</h4>
              <p className="text-gray-500 text-sm">船上用餐，新鮮食材</p>
            </div>
            <div className="text-center">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-800">裝備齊全</h4>
              <p className="text-gray-500 text-sm">浮潛/救生裝備免費用</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-ocean-600">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">想要定制專屬行程？</h2>
          <p className="text-lg mb-6">告訴我們您的需求，我們為您安排一切</p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 bg-white text-ocean-600 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            聯繫客服
          </Link>
        </div>
      </section>
    </div>
  );
}
