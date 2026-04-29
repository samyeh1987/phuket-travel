'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

export default function ImageUpload({ 
  value, 
  onChange, 
  label,
  className = ''
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
        <div className="relative inline-block">
          <div className="w-36 h-36 rounded-xl overflow-hidden bg-gray-50 border border-gray-200">
            <img 
              src={value} 
              alt="预览" 
              className="w-full h-full object-contain"
              onError={() => setError('图片加载失败')}
            />
          </div>
          <div className="absolute -top-2 -right-2 flex gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 bg-ocean-500 text-white rounded-full hover:bg-ocean-600 shadow-sm transition-colors"
              title="更换图片"
            >
              <Upload className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm transition-colors"
              title="删除图片"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={`upload-${label || Math.random().toString(36)}`}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-ocean-400 hover:bg-ocean-50/30 transition-colors w-36 h-36 ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        >
          {uploading ? (
            <>
              <div className="w-5 h-5 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-400">上传中...</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-500 text-center">点击上传</span>
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
