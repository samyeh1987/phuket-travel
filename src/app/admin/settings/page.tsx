'use client';

import { useState } from 'react';
import { Upload, Save, Copy } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
        <p className="text-sm text-gray-500 mt-1">管理客服信息和收款方式</p>
      </div>

      {/* Customer Service */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">客服信息</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">客服微信号</label>
              <input type="text" defaultValue="phukettravel" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">WhatsApp</label>
              <input type="text" defaultValue="+66 XX XXX XXXX" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">联系电话</label>
              <input type="text" defaultValue="+66 XX XXX XXXX" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">邮箱</label>
              <input type="email" defaultValue="contact@phukettravel.com" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">客服微信二维码</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center mb-3 text-gray-400">
                <Upload className="w-8 h-8" />
              </div>
              <p className="text-sm text-gray-500">点击上传或拖拽图片到这里</p>
              <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG，建议尺寸 300×300</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">收款方式</h2>
        <div className="space-y-4">
          {/* WeChat Pay */}
          <div className="border border-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">💚</span>
                <span className="font-medium text-gray-900">微信收款码</span>
              </div>
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex items-center justify-center text-center">
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">上传微信收款码</div>
            </div>
          </div>

          {/* Alipay */}
          <div className="border border-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔵</span>
                <span className="font-medium text-gray-900">支付宝账号</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">支付宝账户</label>
              <input type="text" placeholder="account@example.com" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
            </div>
            <div className="mt-3 border-2 border-dashed border-gray-200 rounded-xl p-4 flex items-center justify-center text-center">
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">上传支付宝收款码</div>
            </div>
          </div>

          {/* Thailand QR */}
          <div className="border border-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🇹🇭</span>
                <span className="font-medium text-gray-900">泰国 PromptPay / QR Code</span>
              </div>
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex items-center justify-center text-center">
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">上传泰国收款码</div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">首页Banner</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center min-h-[140px]">
              <div className="w-full h-24 bg-gray-100 rounded-lg mb-2 flex items-center justify-center text-gray-400 text-xs">Banner {i}</div>
              <p className="text-xs text-gray-400">点击上传图片</p>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-6 py-3 bg-ocean-500 text-white rounded-xl font-medium hover:bg-ocean-600 transition-colors">
          <Save className="w-4 h-4" /> 保存设置
        </button>
      </div>
    </div>
  );
}
