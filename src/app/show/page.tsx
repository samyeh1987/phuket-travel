'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Clock } from 'lucide-react';

interface ShowItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url: string;
  is_active: boolean;
}

interface ShowPackage {
  id: string;
  show_id: string;
  name: string;
  description: string;
  price: string;
  price_cny: string;
}

export default function ShowPage() {
  const [shows, setShows] = useState<(ShowItem & { minPrice?: string; minPriceCny?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/packages/shows')
      .then(r => r.json())
      .then(j => {
        const showList = j.data?.shows || [];
        const packageList = j.data?.packages || [];
        const merged = showList.map((s: ShowItem) => {
          const pkgs = packageList.filter((p: ShowPackage) => p.show_id === s.id);
          const prices = pkgs.map((p: ShowPackage) => Number(p.price));
          const pricesCny = pkgs.map((p: ShowPackage) => Number(p.price_cny));
          return {
            ...s,
            minPrice: prices.length ? Math.min(...prices).toString() : '0',
            minPriceCny: pricesCny.length ? Math.min(...pricesCny).toString() : '0',
          };
        });
        setShows(merged);
      })
      .finally(() => setLoading(false));
  }, []);

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
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="w-6 h-6 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm">加载中...</p>
          </div>
        ) : shows.length === 0 ? (
          <div className="p-12 text-center text-gray-400 bg-white rounded-2xl shadow-sm text-sm">暂无秀场</div>
        ) : (
          shows.filter(s => s.is_active).map(show => (
            <Link
              key={show.id}
              href={`/show/${show.slug || show.id}`}
              className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <Image
                  src={show.image_url || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80'}
                  alt={show.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 pr-4 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">{show.name}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{show.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-ocean-600 font-bold text-xl">฿{Number(show.minPrice || 0).toLocaleString()}</div>
                    <div className="text-green-600 font-semibold text-sm">¥{Number(show.minPriceCny || 0).toLocaleString()}</div>
                    <div className="text-xs text-gray-400">/人起</div>
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <span className="text-ocean-500 font-semibold text-sm group-hover:translate-x-1 transition-transform">查看详情 →</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
