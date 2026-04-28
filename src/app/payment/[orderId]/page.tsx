'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { PaymentMethodSelector } from '@/components/PaymentMethodSelector';
import { PaymentProofUpload } from '@/components/PaymentProofUpload';
import { CheckCircle, ArrowLeft, ArrowRight, CreditCard, Upload, PartyPopper, Check } from 'lucide-react';

type Step = 1 | 2 | 3;

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      setOrder(data);
      
      // 如果已有付款信息，恢复到对应步骤
      if (data?.payment_proof_url) {
        setProofUrl(data.payment_proof_url);
        if (data.payment_status === 'pending_review') {
          setCurrentStep(3);
        }
      }
      if (data?.payment_method) {
        setPaymentMethod(data.payment_method);
      }
      setLoading(false);
    };
    fetchOrder();
  }, [orderId]);

  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method);
    setCurrentStep(2);
  };

  const handleProofUpload = async (url: string) => {
    setProofUrl(url);
    setSubmitting(true);

    // 更新订单
    const { error } = await supabase
      .from('orders')
      .update({
        payment_method: paymentMethod,
        payment_proof_url: url,
        payment_status: 'pending_review',
      })
      .eq('id', orderId);

    if (!error) {
      setCurrentStep(3);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">订单不存在</p>
          <button onClick={() => router.push('/')} className="text-ocean-500">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    custom: '定制旅行',
    diving: '深潜预订',
    diving_experience: '深潜体验',
    diving_cert: '潜水考证',
    island: '跳岛游',
    show: '秀场',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="font-bold text-gray-900">订单支付</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* 订单摘要 */}
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-900">
                {typeLabels[order.type] || order.type}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                订单号：{order.order_number}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-ocean-600">
                ¥{Number(order.total_price).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 步骤条 */}
      <div className="max-w-lg mx-auto px-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 1 ? 'bg-ocean-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className="text-xs mt-1.5 text-gray-500">选择支付</span>
          </div>
          <div className={`flex-1 h-0.5 mx-2 ${currentStep >= 2 ? 'bg-ocean-500' : 'bg-gray-200'}`} />
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 2 ? 'bg-ocean-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
            </div>
            <span className="text-xs mt-1.5 text-gray-500">上传凭证</span>
          </div>
          <div className={`flex-1 h-0.5 mx-2 ${currentStep >= 3 ? 'bg-ocean-500' : 'bg-gray-200'}`} />
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 3 ? 'bg-ocean-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {currentStep >= 3 ? <Check className="w-4 h-4" /> : '3'}
            </div>
            <span className="text-xs mt-1.5 text-gray-500">完成</span>
          </div>
        </div>
      </div>

      {/* 步骤内容 */}
      <div className="max-w-lg mx-auto px-4 pb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          {/* Step 1: 选择支付方式 */}
          {currentStep === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-5 h-5 text-ocean-500" />
                <h2 className="font-semibold text-gray-900">选择支付方式</h2>
              </div>
              <PaymentMethodSelector
                value={paymentMethod}
                onChange={handlePaymentMethodSelect}
              />
              {paymentMethod && (
                <button
                  onClick={() => setCurrentStep(2)}
                  className="w-full mt-6 py-3 bg-ocean-500 text-white rounded-xl font-semibold hover:bg-ocean-600 transition-colors"
                >
                  下一步
                </button>
              )}
            </div>
          )}

          {/* Step 2: 上传凭证 */}
          {currentStep === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Upload className="w-5 h-5 text-ocean-500" />
                <h2 className="font-semibold text-gray-900">上传付款凭证</h2>
              </div>
              <PaymentProofUpload
                orderId={orderId}
                onUploadComplete={handleProofUpload}
              />
              <button
                onClick={() => setCurrentStep(1)}
                className="w-full mt-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                返回
              </button>
            </div>
          )}

          {/* Step 3: 完成 */}
          {currentStep === 3 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <PartyPopper className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">提交成功！</h2>
              <p className="text-gray-500 mb-6">
                您的付款凭证已提交，<br />
                我们将在 <span className="font-medium text-ocean-600">1-2 小时</span>内审核确认。
              </p>

              <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">
                      {paymentMethod === 'alipay' && '支付宝'}
                      {paymentMethod === 'wechat' && '微信支付'}
                      {paymentMethod === 'thai_qr' && '泰国QR码'}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      凭证已上传，等待审核
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => router.push('/my/orders')}
                  className="w-full py-3 bg-ocean-500 text-white rounded-xl font-semibold hover:bg-ocean-600 transition-colors"
                >
                  查看我的订单
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  返回首页
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 提示信息 */}
        {currentStep < 3 && (
          <div className="mt-4 p-4 bg-amber-50 rounded-xl">
            <p className="text-sm text-amber-700">
              💡 提示：付款后请保留截图作为凭证，上传后我们将在1-2小时内审核确认您的付款。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
