'use client';

import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle, Copy, MessageCircle, Clock } from 'lucide-react';
import { Suspense } from 'react';

const paymentMethods = [
  {
    name: '微信支付',
    icon: '💚',
    color: 'bg-green-50 border-green-200',
    titleColor: 'text-green-700',
    qrPlaceholder: '微信收款码',
  },
  {
    name: '支付宝',
    icon: '🔵',
    color: 'bg-blue-50 border-blue-200',
    titleColor: 'text-blue-700',
    qrPlaceholder: '支付宝收款码',
  },
  {
    name: '泰国扫码付',
    icon: '🇹🇭',
    color: 'bg-orange-50 border-orange-200',
    titleColor: 'text-orange-700',
    qrPlaceholder: '泰国 PromptPay / QR Code',
  },
];

function PaymentContent() {
  const params = useSearchParams();
  const island = params.get('island') || 'racha';
  const boat = params.get('boat') || '';
  const people = params.get('people') || '2';
  const total = params.get('total') || '1160';

  const islandNames: Record<string, string> = { racha: '皇帝岛', pp: '皮皮岛', similan: '斯米兰' };
  const wechatId = 'phukettravel';

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-ocean-500 to-blue-500 text-white p-6 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold">订单已提交！</h1>
        <p className="text-white/80 mt-1">请在24小时内完成付款</p>
      </div>

      {/* Order Summary */}
      <div className="max-w-xl mx-auto px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <h2 className="font-bold text-gray-900 mb-4">订单摘要</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">目的地</span><span className="font-medium">{islandNames[island] || island}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">出行人数</span><span className="font-medium">{people}人</span></div>
            <div className="flex justify-between"><span className="text-gray-500">应付金额</span><span className="font-bold text-ocean-600 text-lg">¥{Number(total).toLocaleString()}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-500">订单编号</span><span className="font-mono text-xs text-gray-400">#TH{Date.now().toString().slice(-8)}</span></div>
          </div>
        </div>

        {/* Payment QR Codes */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <h2 className="font-bold text-gray-900 mb-4">选择付款方式</h2>
          <div className="space-y-4">
            {paymentMethods.map(pm => (
              <div key={pm.name} className={`${pm.color} border rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{pm.icon}</span>
                  <h3 className={`font-bold ${pm.titleColor}`}>{pm.name}</h3>
                </div>
                <div className="bg-white rounded-xl p-4 flex items-center justify-center">
                  {/* 演示二维码占位 */}
                  <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm text-center border-2 border-dashed border-gray-300">
                    {pm.qrPlaceholder}<br />请上传收款码图片
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Service */}
        <div className="bg-gradient-to-r from-ocean-500 to-blue-500 rounded-2xl p-5 text-white mb-4">
          <h2 className="font-bold mb-3 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            客服联系方式
          </h2>
          <p className="text-sm text-white/80 mb-4">付款后请添加客服微信，发送付款截图，客服将确认您的订单并发送出行通知。</p>
          <div className="bg-white/20 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-white/60 mb-1">客服微信</div>
              <div className="font-bold text-xl">{wechatId}</div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigator.clipboard.writeText(wechatId)}
                className="px-4 py-2 bg-white/20 rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-white/30 transition-colors"
              >
                <Copy className="w-4 h-4" /> 复制
              </button>
              <a href="https://wa.me/66XXXXXXXXX" className="px-4 py-2 bg-green-500 rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-green-600 transition-colors">
                WhatsApp
              </a>
            </div>
          </div>
          {/* 客服二维码占位 */}
          <div className="mt-4 bg-white rounded-xl p-4 flex items-center justify-center">
            <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-xs text-center border-2 border-dashed border-gray-300">
              客服微信二维码
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-700">
              <strong>温馨提示：</strong>请在24小时内完成付款，逾期订单将自动取消。付款成功后，请截图并发送给客服确认。
            </div>
          </div>
        </div>

        <a href="/" className="block mt-6 text-center text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← 返回首页
        </a>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">加载中...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
