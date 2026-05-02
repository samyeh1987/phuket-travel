'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Car, ArrowRightLeft, Clock, Users, CheckCircle } from 'lucide-react';

interface VehiclePackage {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  capacity: number;
  luggage_count: number;
  price_pickup: number;
  price_pickup_cny: number;
  price_charter_4h: number;
  price_charter_6h: number;
  price_charter_8h: number;
  price_charter_10h: number;
  price_charter_full: number;
}

export default function TransportPage() {
  const [packages, setPackages] = useState<VehiclePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch('/api/packages/transport');
        const data = await res.json();
        if (data.data) {
          setPackages(data.data);
        }
      } catch (err) {
        setError('Failed to load vehicle packages');
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
      <section className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">包車 & 接機送機</h1>
          <p className="text-xl text-white/90 mb-8">普吉島專業司機服務，安全舒適的出行體驗</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/transport/book?type=pickup"
              className="px-6 py-3 bg-white text-ocean-600 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              預訂接機
            </Link>
            <Link
              href="/transport/book?type=dropoff"
              className="px-6 py-3 bg-ocean-500 text-white rounded-full font-semibold hover:bg-ocean-400 transition-colors border-2 border-white"
            >
              預訂送機
            </Link>
            <Link
              href="/transport/book?type=charter"
              className="px-6 py-3 bg-ocean-500 text-white rounded-full font-semibold hover:bg-ocean-400 transition-colors border-2 border-white"
            >
              包車遊覽
            </Link>
          </div>
        </div>
      </section>

      {/* Service Types */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">我們的服務</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* 接機 */}
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8 text-ocean-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">機場接機</h3>
              <p className="text-gray-500 mb-4">航班抵達後，司機準時等候，免費等待90分鐘</p>
              <Link
                href="/transport/book?type=pickup"
                className="text-ocean-600 font-medium hover:text-ocean-700"
              >
                立即預訂 →
              </Link>
            </div>

            {/* 送機 */}
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRightLeft className="w-8 h-8 text-ocean-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">機場送機</h3>
              <p className="text-gray-500 mb-4">提前2.5小時出發，確保您從容抵達機場</p>
              <Link
                href="/transport/book?type=dropoff"
                className="text-ocean-600 font-medium hover:text-ocean-700"
              >
                立即預訂 →
              </Link>
            </div>

            {/* 包車 */}
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-ocean-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">包車遊覽</h3>
              <p className="text-gray-500 mb-4">自由規劃行程，專業司機帶您遊覽普吉</p>
              <Link
                href="/transport/book?type=charter"
                className="text-ocean-600 font-medium hover:text-ocean-700"
              >
                立即預訂 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Packages */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">選擇車型</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                {pkg.image_url && (
                  <div className="relative h-48">
                    <Image
                      src={pkg.image_url}
                      alt={pkg.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{pkg.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{pkg.description}</p>
                  
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{pkg.capacity}人</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Car className="w-4 h-4" />
                      <span>{pkg.luggage_count}件行李</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-500">接機/送機</span>
                      <span className="text-ocean-600 font-bold">฿{pkg.price_pickup.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-500">4小時包車</span>
                      <span className="text-ocean-600 font-bold">฿{pkg.price_charter_4h?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-500">8小時包車</span>
                      <span className="text-ocean-600 font-bold">฿{pkg.price_charter_8h?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">包日(10小時)</span>
                      <span className="text-ocean-600 font-bold">฿{pkg.price_charter_full?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <Link
                      href={`/transport/book?type=pickup&vehicle=${pkg.slug}`}
                      className="py-2 text-center text-xs bg-ocean-50 text-ocean-600 rounded-lg hover:bg-ocean-100 transition-colors"
                    >
                      接機
                    </Link>
                    <Link
                      href={`/transport/book?type=dropoff&vehicle=${pkg.slug}`}
                      className="py-2 text-center text-xs bg-ocean-50 text-ocean-600 rounded-lg hover:bg-ocean-100 transition-colors"
                    >
                      送機
                    </Link>
                    <Link
                      href={`/transport/book?type=charter&vehicle=${pkg.slug}`}
                      className="py-2 text-center text-xs bg-ocean-500 text-white rounded-lg hover:bg-ocean-600 transition-colors"
                    >
                      包車
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">為什麼選擇我們</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-800">專業司機</h4>
              <p className="text-gray-500 text-sm">經驗豐富，熟悉路線</p>
            </div>
            <div className="text-center">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-800">準時接送</h4>
              <p className="text-gray-500 text-sm">航班免費等待90分鐘</p>
            </div>
            <div className="text-center">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-800">價格透明</h4>
              <p className="text-gray-500 text-sm">無隱藏費用</p>
            </div>
            <div className="text-center">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-800">客服支持</h4>
              <p className="text-gray-500 text-sm">24小時在線</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-ocean-600">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">需要定制服務？</h2>
          <p className="text-lg mb-6">聯繫我們獲取更多個性化服務</p>
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
