'use client';

import { useState, useRef } from 'react';
import { Upload, X, ImageIcon, Link } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string; // supabase storage folder prefix
}

export default function ImageUpload({ value, onChange, label = '图片', folder = 'products' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('请选择图片文件（JPG、PNG、WebP 等）');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('图片大小不能超过 5MB');
      return;
    }
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: formData });
      const json = await res.json();
      if (!res.ok || json.error) {
        setUploadError(json.error || '上传失败，请重试');
      } else {
        onChange(json.url);
      }
    } catch (e: any) {
      setUploadError('网络错误，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleUrlConfirm = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
    }
  };

  return (
    <div>
      {label && <label className="text-sm font-medium text-gray-700 mb-1.5 block">{label}</label>}

      {/* Tab */}
      <div className="flex gap-1 mb-2">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors ${mode === 'upload' ? 'bg-ocean-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
          <Upload className="w-3 h-3" /> 上传图片
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors ${mode === 'url' ? 'bg-ocean-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
          <Link className="w-3 h-3" /> 填写URL
        </button>
      </div>

      {mode === 'url' ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleUrlConfirm(); } }}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
          />
          <button
            type="button"
            onClick={handleUrlConfirm}
            className="px-3 py-2 bg-ocean-500 text-white rounded-xl text-sm font-medium hover:bg-ocean-600"
          >
            确认
          </button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-ocean-400 hover:bg-ocean-50/40 transition-colors"
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-3">
              <div className="w-6 h-6 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-400">上传中...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 py-2">
              <Upload className="w-6 h-6 text-gray-300" />
              <p className="text-xs text-gray-400">点击选择或拖拽图片到这里</p>
              <p className="text-xs text-gray-300">JPG、PNG、WebP，最大 5MB</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
          />
        </div>
      )}

      {uploadError && (
        <p className="text-xs text-red-500 mt-1">{uploadError}</p>
      )}

      {/* Preview */}
      {value && (
        <div className="mt-2 relative group">
          <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-100">
            <Image
              src={value}
              alt="预览"
              fill
              className="object-cover"
              onError={() => {/* ignore broken images */}}
              unoptimized
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {!value && (
        <div className="mt-2 flex items-center justify-center w-full h-20 rounded-xl border border-gray-100 bg-gray-50">
          <div className="flex flex-col items-center gap-1 text-gray-300">
            <ImageIcon className="w-6 h-6" />
            <span className="text-xs">暂无图片</span>
          </div>
        </div>
      )}
    </div>
  );
}
