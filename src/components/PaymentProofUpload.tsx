'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { Upload, X, Image, Loader2, AlertCircle } from 'lucide-react';

interface PaymentProofUploadProps {
  orderId: string;
  onUploadComplete: (proofUrl: string) => void;
}

export function PaymentProofUpload({ orderId, onUploadComplete }: PaymentProofUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过5MB');
      return;
    }

    setError(null);
    setUploading(true);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${orderId}_${Date.now()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      if (urlData.publicUrl) {
        onUploadComplete(urlData.publicUrl);
      }
    } catch (err: any) {
      setError(err.message || '上传失败，请重试');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
      fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          请上传付款凭证
        </label>
        <p className="text-xs text-gray-500 mb-4">
          支持 JPG、PNG 格式，文件大小不超过 5MB
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="proof-upload"
      />

      {/* 错误提示 */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* 上传区域 */}
      {!preview && !uploading && (
        <label
          htmlFor="proof-upload"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-ocean-400 hover:bg-ocean-50/50 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-10 h-10 text-gray-400 mb-3" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold text-ocean-500">点击上传</span>或拖拽图片到这里
            </p>
            <p className="text-xs text-gray-400">截图付款页面即可</p>
          </div>
        </label>
      )}

      {/* 预览 */}
      {preview && (
        <div className="relative">
          <div className="rounded-2xl overflow-hidden border border-gray-200">
            <img
              src={preview}
              alt="付款凭证预览"
              className="w-full h-auto max-h-80 object-contain bg-gray-50"
            />
          </div>
          <button
            onClick={() => {
              setPreview(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="flex flex-col items-center text-white">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <span className="text-sm">上传中...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 上传中状态 */}
      {uploading && !preview && (
        <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-ocean-200 border-dashed rounded-2xl bg-ocean-50/50">
          <Loader2 className="w-10 h-10 text-ocean-500 animate-spin mb-3" />
          <p className="text-sm text-ocean-600">上传中...</p>
        </div>
      )}
    </div>
  );
}
