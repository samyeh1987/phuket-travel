import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star, Users } from 'lucide-react';

const islands = [
  {
    slug: 'racha',
    name: '皇帝岛',
    subtitle: 'Racha Island',
    description: '普吉最佳浮潜圣地，澄澈见底的玻璃海，白色沙滩，浮潜爱好者的天堂',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    rating: 4.9,
    reviews: 328,
    startingPrice: 580,
    features: ['浮潜', '玻璃海', '沙滩'],
    days: '一日游',
  },
  {
    slug: 'pp',
    name: '皮皮岛',
    subtitle: 'Phi Phi Island',
    description: '好莱坞电影取景地，绝美泻湖和悬崖景观，玛雅湾的标志性美景',
    image: 'https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=800&q=80',
    rating: 4.8,
    reviews: 512,
    startingPrice: 680,
    features: ['观光', '浮潜', '摄影'],
    days: '一日游',
  },
  {
    slug: 'similan',
    name: '斯米兰',
    subtitle: 'Similan Island',
    description: '世界十大潜水圣地之一，每年仅开放半年，保护完好的原始海底世界',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    rating: 4.9,
    reviews: 276,
    startingPrice: 880,
    features: ['深潜', '浮潜', '原始海'],
    days: '一日游',
  },
];

export default function IslandTourPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Hero */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80"
          alt="跳岛游"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-4 left-4 md:left-8 text-white">
          <h1 className="text-2xl md:text-4xl font-bold">跳岛一日游</h1>
          <p className="text-sm md:text-lg text-white/80 mt-1">皇帝岛 · 皮皮岛 · 斯米兰</p>
        </div>
      </div>

      {/* Islands */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {islands.map(island => (
          <Link
            key={island.slug}
            href={`/island-tour/${island.slug}`}
            className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group"
          >
            {/* Image */}
            <div className="relative h-48 sm:h-56 overflow-hidden">
              <Image
                src={island.image}
                alt={island.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                {island.features.map(f => (
                  <span key={f} className="px-2 py-0.5 bg-white/90 rounded-full text-xs font-medium text-gray-700">{f}</span>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{island.name}</h3>
                  <p className="text-sm text-gray-400">{island.subtitle}</p>
                </div>
                <div className="text-right">
                  <div className="text-ocean-600 font-bold text-xl">¥{island.startingPrice}</div>
                  <div className="text-xs text-gray-400">起/人</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{island.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    {island.rating}
                  </span>
                  <span>{island.reviews} 条评价</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {island.days}
                  </span>
                </div>
                <span className="text-ocean-500 font-semibold text-sm group-hover:translate-x-1 transition-transform">查看详情 →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
