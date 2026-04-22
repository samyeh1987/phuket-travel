'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Sailboat, Anchor, Ticket, Palmtree, Sparkles, Users, Camera } from 'lucide-react';

const services = [
  {
    title: '定制旅行',
    description: '专属定制普吉之旅',
    icon: <Sparkles className="w-7 h-7" />,
    href: '/custom-trip',
    color: 'bg-gradient-to-br from-ocean-500 to-ocean-600',
  },
  {
    title: '深潜体验',
    description: '探索海底世界',
    icon: <Anchor className="w-7 h-7" />,
    href: '/diving',
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
  },
  {
    title: '跳岛一日游',
    description: '皇帝岛/皮皮岛/斯米兰',
    icon: <Sailboat className="w-7 h-7" />,
    href: '/island-tour',
    color: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
  },
  {
    title: '秀场表演',
    description: '天皇秀/西蒙秀',
    icon: <Ticket className="w-7 h-7" />,
    href: '/show',
    color: 'bg-gradient-to-br from-purple-500 to-purple-600',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col pb-20 md:pb-0">
      {/* Hero Section */}
      <section className="relative h-[75vh] min-h-[550px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80"
            alt="普吉岛风景"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        </div>
        
        <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg">
            泰嗨了
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl mb-2 drop-shadow-md">
            普吉旅行专家
          </p>
          <p className="text-base sm:text-lg md:text-xl text-white/80 drop-shadow-md px-2">
            高端定制 · 深潜考证 · 跳岛游 · 秀场表演
          </p>
          
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link
              href="/custom-trip"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-ocean-500 hover:bg-ocean-600 text-white rounded-full font-semibold text-base sm:text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              开始定制旅行
            </Link>
            <Link
              href="/island-tour"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full font-semibold text-base sm:text-lg transition-all transform hover:scale-105 border border-white/30"
            >
              查看一日游
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">我们的服务</h2>
            <p className="text-base sm:text-lg text-gray-600">专业的普吉旅行服务，让你的假期与众不同</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {services.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className="group bg-white rounded-2xl p-5 sm:p-8 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`${service.color} w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-white mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}>
                  {service.icon}
                </div>
                <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">{service.title}</h3>
                <p className="text-xs sm:text-base text-gray-600">{service.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-6 sm:p-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-ocean-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">专属定制</h3>
              <p className="text-sm sm:text-base text-gray-600">根据你的预算、人数和喜好，量身打造专属行程</p>
            </div>
            <div className="text-center p-6 sm:p-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Palmtree className="w-8 h-8 sm:w-10 sm:h-10 text-ocean-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">精选岛屿</h3>
              <p className="text-sm sm:text-base text-gray-600">皇帝岛、皮皮岛、斯米兰，带你玩转普吉海域</p>
            </div>
            <div className="text-center p-6 sm:p-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-ocean-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">出片圣地</h3>
              <p className="text-sm sm:text-base text-gray-600">推荐最佳拍照点，留下难忘的旅行回忆</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-r from-ocean-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">准备好开启你的普吉之旅了吗？</h2>
          <p className="text-base sm:text-xl mb-6 sm:mb-8 text-white/90">联系我们，获取专属定制行程</p>
          <Link
            href="/custom-trip"
            className="inline-block px-8 sm:px-10 py-3 sm:py-4 bg-white text-ocean-600 rounded-full font-bold text-base sm:text-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            立即定制
          </Link>
        </div>
      </section>
    </div>
  );
}
