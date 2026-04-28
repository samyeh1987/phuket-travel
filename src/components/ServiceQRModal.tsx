'use client';

import { useEffect, useState } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface ServiceQRModalProps {
  orderNo: string;
  onClose: () => void;
}

export function ServiceQRModal({ orderNo, onClose }: ServiceQRModalProps) {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQR = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'service_qr')
        .single();
      
      if (data?.value) {
        setQrUrl(data.value);
      }
      setLoading(false);
    };
    fetchQR();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      
      {/* Modal 內容 */}
      <div className="relative bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
        {/* 關閉按鈕 */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 標題區 */}
        <div className="bg-ocean-500 text-white p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <MessageCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold">预订成功！</h2>
          <p className="text-white/80 text-sm mt-1">订单号：{orderNo}</p>
        </div>

        {/* 二維碼區 */}
        <div className="p-6 text-center">
          {loading ? (
            <div className="py-8">
              <div className="w-8 h-8 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : qrUrl ? (
            <>
              <p className="text-gray-600 text-sm mb-4">请扫描二维码联系客服确认订单</p>
              <div className="bg-gray-50 rounded-2xl p-4 inline-block">
                <img 
                  src={qrUrl} 
                  alt="客服二维码" 
                  className="w-64 h-64 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </>
          ) : (
            <div className="py-8 text-gray-400">
              <p>暂未设置客服二维码</p>
              <p className="text-sm mt-2">请在后台设置中添加</p>
            </div>
          )}

          {/* 操作按鈕 */}
          <div className="mt-6 space-y-3">
            <button
              onClick={onClose}
              className="w-full py-3 bg-ocean-500 text-white rounded-full font-medium hover:bg-ocean-600 transition-colors"
            >
              完成
            </button>
            <p className="text-xs text-gray-400">
              订单已保存，可在「我的订单」查看
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
