'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function DivingBookPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🤿</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">预订功能开发中</h1>
        <p className="text-gray-500 mb-6">深潜预订页面正在开发，请先在深潜列表页选择套餐。</p>
        <Link href="/diving" className="inline-flex items-center gap-2 px-6 py-3 bg-ocean-500 text-white rounded-full font-medium hover:bg-ocean-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> 返回深潜页面
        </Link>
      </div>
    </div>
  );
}
