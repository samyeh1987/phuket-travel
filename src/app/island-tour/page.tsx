'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';

interface Island {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
}

export default function IslandTourPage() {
  const [islands, setIslands] = useState<Island[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/packages/islands')
      .then(r => r.json())
      .then(json => {
        setIslands(json.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
          <p className="text-sm md:text-lg text-white/80 mt-1">精选普吉周边离岛，一日往返</p>
        </div>
      </div>

      {/* Islands */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="w-6 h-6 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm">加载中...</p>
          </div>
        ) : islands.length === 0 ? (
          <div className="p-12 text-center text-gray-400 bg-white rounded-2xl shadow-sm text-sm">
            暂无岛屿数据
          </div>
        ) : (
          islands.map(island => (
            <Link
              key={island.id}
              href={`/island-tour/${island.slug}`}
              className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group"
            >
              {/* Image */}
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <Image
                  src={island.image_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'}
                  alt={island.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{island.name}</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{island.description || ''}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      一日游
                    </span>
                  </div>
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
