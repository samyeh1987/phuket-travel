'use client';

import { useState, useRef } from 'react';
import { Upload, X, ImageIcon, GripVertical, Plus } from 'lucide-react';
import Image from 'next/image';

interface MultiImageUploadProps {
  values: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  folder?: string; // supabase storage folder prefix
  maxImages?: number;
  enableUrlInput?: boolean; // 启用URL输入模式
}

export default function MultiImageUpload({
  values = [],
  onChange,
  label = '图片',
  folder = 'products',
  maxImages = 10,
  enableUrlInput = true,
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('请选择图片文件（JPG、PNG、WebP 等）');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('图片大小不能超过 5MB');
      return;
    }
    if (values.length >= maxImages) {
      setUploadError(`最多只能上传 ${maxImages} 张图片`);
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
        onChange([...values, json.url]);
      }
    } catch (e: any) {
      setUploadError('网络错误，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    files.forEach(file => handleFile(file));
  };

  const handleUrlConfirm = () => {
    if (urlInput.trim()) {
      if (values.length >= maxImages) {
        setUploadError(`最多只能上传 ${maxImages} 张图片`);
        return;
      }
      onChange([...values, urlInput.trim()]);
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  const removeImage = (index: number) => {
    const newValues = [...values];
    newValues.splice(index, 1);
    onChange(newValues);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= values.length) return;
    const newValues = [...values];
    const [removed] = newValues.splice(fromIndex, 1);
    newValues.splice(toIndex, 0, removed);
    onChange(newValues);
  };

  // Drag handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDropOnItem = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      moveImage(draggedIndex, index);
    }
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div>
      {label && <label className="text-sm font-medium text-gray-700 mb-1.5 block">{label}</label>}
      
      {/* Upload options */}
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || values.length >= maxImages}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-ocean-500 text-white rounded-lg hover:bg-ocean-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-3.5 h-3.5" /> 上传图片
        </button>
        {enableUrlInput && (
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${
              showUrlInput ? 'bg-ocean-100 text-ocean-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            添加URL
          </button>
        )}
        <span className="text-xs text-gray-400 self-center ml-auto">
          {values.length}/{maxImages} 张
        </span>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => {
          const files = Array.from(e.target.files || []);
          files.forEach(file => handleFile(file));
          e.target.value = '';
        }}
      />

      {/* URL input */}
      {showUrlInput && (
        <div className="flex gap-2 mb-3">
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
            添加
          </button>
        </div>
      )}

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
          uploading
            ? 'border-ocean-300 bg-ocean-50/50'
            : 'border-gray-200 hover:border-ocean-400 hover:bg-ocean-50/40'
        } ${values.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => values.length < maxImages && !uploading && fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-3">
            <div className="w-6 h-6 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-gray-400">上传中...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 py-2">
            <Plus className="w-6 h-6 text-gray-300" />
            <p className="text-xs text-gray-400">点击选择或拖拽图片到这里</p>
            <p className="text-xs text-gray-300">JPG、PNG、WebP，最大 5MB</p>
          </div>
        )}
      </div>

      {uploadError && (
        <p className="text-xs text-red-500 mt-1">{uploadError}</p>
      )}

      {/* Image previews */}
      {values.length > 0 && (
        <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {values.map((url, index) => (
            <div
              key={index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={e => handleDragOver(e, index)}
              onDrop={e => handleDropOnItem(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                draggedIndex === index
                  ? 'border-ocean-400 opacity-50'
                  : 'border-gray-100 hover:border-ocean-300'
              }`}
            >
              <div className="relative aspect-square">
                <Image
                  src={url}
                  alt={`图片 ${index + 1}`}
                  fill
                  className="object-cover"
                  onError={() => {/* ignore broken images */}}
                  unoptimized
                />
              </div>
              
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1">
                {/* Drag handle */}
                <div className="absolute top-1 left-1 p-1 bg-black/40 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                  <GripVertical className="w-3 h-3" />
                </div>
                
                {/* Index badge */}
                <div className="absolute top-1 right-8 px-1.5 py-0.5 bg-black/50 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {index + 1}
                </div>
                
                {/* Delete button */}
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {values.length === 0 && !uploading && (
        <div className="mt-3 flex items-center justify-center w-full h-20 rounded-xl border border-gray-100 bg-gray-50">
          <div className="flex flex-col items-center gap-1 text-gray-300">
            <ImageIcon className="w-6 h-6" />
            <span className="text-xs">暂无图片</span>
          </div>
        </div>
      )}

      {/* Tips */}
      <p className="text-xs text-gray-400 mt-2">
        💡 提示：拖拽可调整图片顺序，第一张将作为封面图
      </p>
    </div>
  );
}
