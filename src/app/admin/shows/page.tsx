'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

const showsData = [
  {
    id: '1', name: '天皇秀', slug: 'korean-show', price: 380,
    packages: [
      { id: 'p1', name: '普通票', price: 380 },
      { id: 'p2', name: 'VIP票', price: 580 },
      { id: 'p3', name: 'VVIP票', price: 880 },
    ]
  },
  {
    id: '2', name: '西蒙秀', slug: 'simon-show', price: 280,
    packages: [
      { id: 'p4', name: '普通票', price: 280 },
      { id: 'p5', name: 'VIP票', price: 480 },
      { id: 'p6', name: '黄金票', price: 680 },
    ]
  },
];

export default function AdminShowsPage() {
  const [expanded, setExpanded] = useState<string | null>('1');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">秀场管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理秀场和套餐</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-ocean-500 text-white rounded-xl font-medium hover:bg-ocean-600 transition-colors">
          <Plus className="w-4 h-4" /> 添加秀场
        </button>
      </div>

      <div className="space-y-3">
        {showsData.map(show => (
          <div key={show.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div onClick={() => setExpanded(prev => prev === show.id ? null : show.id)} className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                {expanded === show.id ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                <span className="font-bold text-gray-900">{show.name}</span>
                <span className="text-xs text-gray-400">/{show.slug}</span>
                <span className="text-xs text-gray-400">起价 ¥{show.price}</span>
              </div>
              <button className="p-1.5 text-gray-400 hover:text-ocean-500 hover:bg-ocean-50 rounded-lg transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
            </div>

            {expanded === show.id && (
              <div className="border-t">
                <div className="px-5 py-3 bg-gray-50 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">套餐列表</span>
                  <button className="flex items-center gap-1 text-xs text-ocean-500 font-medium">
                    <Plus className="w-3.5 h-3.5" /> 添加套餐
                  </button>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 text-xs">
                      <th className="px-5 py-2.5 font-medium">套餐名称</th>
                      <th className="px-5 py-2.5 font-medium">价格</th>
                      <th className="px-5 py-2.5 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {show.packages.map(pkg => (
                      <tr key={pkg.id} className="hover:bg-gray-50">
                        <td className="px-5 py-2.5 font-medium text-gray-900">{pkg.name}</td>
                        <td className="px-5 py-2.5 text-ocean-600 font-semibold">¥{pkg.price}</td>
                        <td className="px-5 py-2.5">
                          <div className="flex gap-2">
                            <button className="p-1 text-gray-400 hover:text-ocean-500"><Pencil className="w-3.5 h-3.5" /></button>
                            <button className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
