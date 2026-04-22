'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, CheckCircle } from 'lucide-react';

const demoPackages = [
  { id: '1', name: '体验深潜', price: 1800, unit: '人', status: '上架中', bookings: 45 },
  { id: '2', name: '水肺OW考证', price: 2800, unit: '人', status: '上架中', bookings: 32 },
  { id: '3', name: '水肺AOW考证', price: 2500, unit: '人', status: '上架中', bookings: 28 },
  { id: '4', name: '自由潜2星', price: 2200, unit: '人', status: '上架中', bookings: 18 },
  { id: '5', name: '自由潜3星', price: 3000, unit: '人', status: '上架中', bookings: 12 },
];

export default function AdminDivingPage() {
  const [packages, setPackages] = useState(demoPackages);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<typeof demoPackages[0] | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">深潜套餐管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理深潜体验和考证套餐</p>
        </div>
        <button
          onClick={() => { setEditItem(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-ocean-500 text-white rounded-xl font-medium hover:bg-ocean-600 transition-colors"
        >
          <Plus className="w-4 h-4" /> 添加套餐
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500">
              <th className="px-5 py-3.5 font-medium">套餐名称</th>
              <th className="px-5 py-3.5 font-medium">价格</th>
              <th className="px-5 py-3.5 font-medium">单位</th>
              <th className="px-5 py-3.5 font-medium">状态</th>
              <th className="px-5 py-3.5 font-medium">已预订</th>
              <th className="px-5 py-3.5 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {packages.map(pkg => (
              <tr key={pkg.id} className="hover:bg-gray-50">
                <td className="px-5 py-3.5 font-medium text-gray-900">{pkg.name}</td>
                <td className="px-5 py-3.5 text-ocean-600 font-semibold">¥{pkg.price.toLocaleString()}</td>
                <td className="px-5 py-3.5 text-gray-500">{pkg.unit}</td>
                <td className="px-5 py-3.5">
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-3.5 h-3.5" />{pkg.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-500">{pkg.bookings}单</td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-ocean-500 hover:bg-ocean-50 rounded-lg transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Placeholder */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editItem ? '编辑套餐' : '添加套餐'}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">套餐名称</label>
                <input type="text" defaultValue={editItem?.name} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">价格（¥）</label>
                  <input type="number" defaultValue={editItem?.price} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">单位</label>
                  <input type="text" defaultValue={editItem?.unit} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50">取消</button>
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-ocean-500 text-white rounded-xl font-medium hover:bg-ocean-600">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
