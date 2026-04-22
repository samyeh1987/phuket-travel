'use client';

import Image from 'next/image';
import { MessageCircle, Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Hero */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=1920&q=80"
          alt="联系客服"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 md:left-8 text-white">
          <h1 className="text-2xl md:text-4xl font-bold">联系我们</h1>
          <p className="text-sm md:text-lg text-white/80 mt-1">有任何问题随时联系我们</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
        {/* WeChat */}
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">微信客服</h2>
          <p className="text-sm text-gray-500 mb-4">添加客服微信，快速响应</p>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-900 mb-3">phukettravel</div>
            <button
              onClick={() => navigator.clipboard.writeText('phukettravel')}
              className="px-6 py-2.5 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition-colors"
            >
              复制微信号
            </button>
          </div>
          <div className="mt-4 bg-gray-100 rounded-xl h-48 flex items-center justify-center text-gray-400 text-sm">
            微信二维码图片
          </div>
        </div>

        {/* WhatsApp */}
        <a href="https://wa.me/66XXXXXXXXX" className="block bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-green-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">WhatsApp</h2>
              <p className="text-sm text-gray-500">+66 XX XXX XXXX</p>
            </div>
          </div>
        </a>

        {/* Phone */}
        <a href="tel:+66XXXXXXXXX" className="block bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Phone className="w-7 h-7 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">电话</h2>
              <p className="text-sm text-gray-500">+66 XX XXX XXXX</p>
            </div>
          </div>
        </a>

        {/* Email */}
        <a href="mailto:contact@phukettravel.com" className="block bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center">
              <Mail className="w-7 h-7 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">邮箱</h2>
              <p className="text-sm text-gray-500">contact@phukettravel.com</p>
            </div>
          </div>
        </a>

        {/* Location */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-ocean-100 rounded-2xl flex items-center justify-center">
              <MapPin className="w-7 h-7 text-ocean-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">地址</h2>
              <p className="text-sm text-gray-500">普吉岛，卡图，泰国</p>
            </div>
          </div>
        </div>

        {/* Hours */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Clock className="w-7 h-7 text-purple-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">营业时间</h2>
              <p className="text-sm text-gray-500">每天 08:00 - 22:00（泰国时间）</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
