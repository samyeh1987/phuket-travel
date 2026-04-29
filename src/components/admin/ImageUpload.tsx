'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  className?: string;
}

export default function ImageUpload({ 
  value, 
  onChange, 
  label,
  aspectRatio = 'portrait',
  className = ''
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    // 验证文件大小 (最大 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'settings');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (json.success && json.url) {
        onChange(json.url);
      } else {
        setError(json.error || '上传失败');
      }
    } catch (err) {
      setError('上传失败，请重试');
    }

    setUploading(false);
    // 清除 input 值，允许重新选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const aspectClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-video',
  };

  return (
    <div className={className}>
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-2 block">{label}</label>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id={`upload-${label || Math.random().toString(36)}`}
      />

      {value ? (
        <div className="relative">
          <div className={`rounded-xl overflow-hidden bg-gray-50 border border-gray-200 ${aspectClasses[aspectRatio]}`}>
            <img 
              src={value} 
              alt="预览" 
              className="w-full h-full object-contain"
              onError={() => setError('图片加载失败')}
            />
          </div>
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-ocean-500 hover:bg-white shadow-sm transition-colors"
              title="更换图片"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-red-500 hover:bg-white shadow-sm transition-colors"
              title="删除图片"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={`upload-${label || Math.random().toString(36)}`}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-ocean-400 hover:bg-ocean-50/30 transition-colors ${aspectClasses[aspectRatio]} ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        >
          {uploading ? (
            <>
              <div className="w-6 h-6 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-400">上传中...</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-gray-400" />
              <span className="text-xs text-gray-500">点击上传图片</span>
            </>
          )}
        </label>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
