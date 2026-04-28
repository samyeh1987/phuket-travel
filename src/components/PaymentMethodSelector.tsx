'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Check } from 'lucide-react';

interface PaymentMethodSelectorProps {
  value: string;
  onChange: (method: string) => void;
}

interface PaymentQR {
  alipay: string;
  wechat: string;
  thai_qr: string;
}

const paymentMethods = [
  {
    id: 'alipay',
    name: '支付宝',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#1677FF"/>
        <path d="M12 5C8.134 5 5 7.686 5 11c0 1.97.94 3.74 2.42 4.92L6 18h3l1.5-3c.5.1 1 .15 1.5.15 3.866 0 7-2.686 7-6s-3.134-6-7-6z" fill="#fff"/>
      </svg>
    ),
  },
  {
    id: 'wechat',
    name: '微信支付',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#07C160"/>
        <path d="M8.5 11.5c.5-1 1.5-1.5 2.5-1.5 1.5 0 2.5 1 2.5 2.5 0 1.5-1 2.5-2.5 2.5-1 0-2-.5-2.5-1.5" stroke="#fff" strokeWidth="1.5" fill="none"/>
        <path d="M12 7.5c-2 0-4 1.5-4 3.5 0 1.2.5 2.2 1.5 3 .5.4 1 .7 1.5.8-.1.3-.2.5-.2.7 0 .5.5 1 1 1h.4c2 0 4-1.5 4-3.5S14 7.5 12 7.5z" fill="#fff"/>
        <path d="M15 14.5c.3-.4.5-.9.5-1.5 0-.3-.1-.6-.2-.9.4.1.8.2 1.2.2.3 0 .5 0 .8-.1" stroke="#fff" strokeWidth="1.2" fill="none"/>
      </svg>
    ),
  },
  {
    id: 'thai_qr',
    name: '泰国QR码',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#FF6B00"/>
        <rect x="5" y="5" width="6" height="6" rx="1" fill="#fff"/>
        <rect x="13" y="5" width="2" height="2" fill="#fff"/>
        <rect x="17" y="5" width="2" height="2" fill="#fff"/>
        <rect x="13" y="9" width="2" height="2" fill="#fff"/>
        <rect x="5" y="13" width="2" height="2" fill="#fff"/>
        <rect x="9" y="13" width="2" height="2" fill="#fff"/>
        <rect x="13" y="13" width="4" height="4" rx="1" fill="#fff"/>
        <rect x="5" y="17" width="2" height="2" fill="#fff"/>
        <rect x="9" y="17" width="2" height="2" fill="#fff"/>
      </svg>
    ),
  },
];

export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  // 付款方式选择组件
  const [qrCodes, setQrCodes] = useState<PaymentQR>({
    alipay: '',
    wechat: '',
    thai_qr: '',
  });

  useEffect(() => {
    const fetchQrCodes = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['alipay_qr', 'wechat_qr', 'thai_qr']);

      if (data) {
        const codes: PaymentQR = { alipay: '', wechat: '', thai_qr: '' };
        data.forEach((item: any) => {
          if (item.key === 'alipay_qr') codes.alipay = item.value;
          if (item.key === 'wechat_qr') codes.wechat = item.value;
          if (item.key === 'thai_qr') codes.thai_qr = item.value;
        });
        setQrCodes(codes);
      }
    };
    fetchQrCodes();
  }, []);

  const selectedQr = qrCodes[value as keyof PaymentQR] || '';

  return (
    <div className="space-y-4">
      {/* 付款方式选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          请选择付款方式
        </label>
        <div className="grid grid-cols-3 gap-3">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => onChange(method.id)}
              className={`relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
                value === method.id
                  ? 'border-ocean-500 bg-ocean-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {value === method.id && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-ocean-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="mb-2">{method.icon}</div>
              <span className={`text-sm font-medium ${
                value === method.id ? 'text-ocean-600' : 'text-gray-700'
              }`}>
                {method.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 收款码展示 */}
      {value && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            请扫描{maymentMethods.find((m) => m.id === value)?.name}收款码进行付款
          </label>
          <div className="bg-gray-50 rounded-2xl p-6 flex justify-center">
            {selectedQr ? (
              <img
                src={selectedQr}
                alt={`${value}收款码`}
                className="w-64 h-64 object-contain rounded-xl bg-white shadow-sm"
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-xl">
                <p className="text-gray-400 text-sm">暂未设置收款码<br/>请联系客服</p>
              </div>
            )}
          </div>
          <p className="text-center text-sm text-gray-500 mt-3">
            付款完成后，请上传付款凭证
          </p>
        </div>
      )}
    </div>
  );
}
