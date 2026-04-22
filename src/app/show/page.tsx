import Image from 'next/image';
import Link from 'next/link';
import { Star, Clock } from 'lucide-react';

const shows = [
  {
    slug: 'korean-show',
    name: '天皇秀',
    subtitle: 'Korean Cabaret Show',
    description: '普吉最受欢迎的韩国歌舞秀，华丽的服装、精彩的表演、震撼的视听享受，老少皆宜',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
    rating: 4.7,
    reviews: 892,
    price: 380,
    duration: '75分钟',
    tags: ['歌舞秀', '全家适宜'],
  },
  {
    slug: 'simon-show',
    name: '西蒙秀',
    subtitle: 'Simon Cabaret Show',
    description: '世界闻名的泰国人妖秀，以华丽的变装表演和精湛的舞技著称，全球游客必看节目',
    image: 'https://images.unsplash.com/photo-1516475429286-465d815a0df7?w=800&q=80',
    rating: 4.8,
    reviews: 1243,
    price: 280,
    duration: '70分钟',
    tags: ['人妖秀', '变装表演'],
  },
];

export default function ShowPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Hero */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80"
          alt="秀场"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-4 left-4 md:left-8 text-white">
          <h1 className="text-2xl md:text-4xl font-bold">秀场表演</h1>
          <p className="text-sm md:text-lg text-white/80 mt-1">天皇秀 · 西蒙秀</p>
        </div>
      </div>

      {/* Shows */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {shows.map(show => (
          <Link
            key={show.slug}
            href={`/show/${show.slug}`}
            className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group"
          >
            <div className="relative h-48 sm:h-56 overflow-hidden">
              <Image
                src={show.image}
                alt={show.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                {show.tags.map(t => (
                  <span key={t} className="px-2 py-0.5 bg-white/90 rounded-full text-xs font-medium text-gray-700">{t}</span>
                ))}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{show.name}</h3>
                  <p className="text-sm text-gray-400">{show.subtitle}</p>
                </div>
                <div className="text-right">
                  <div className="text-ocean-600 font-bold text-xl">¥{show.price}</div>
                  <div className="text-xs text-gray-400">/人</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{show.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    {show.rating}
                  </span>
                  <span>{show.reviews} 条评价</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {show.duration}
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
