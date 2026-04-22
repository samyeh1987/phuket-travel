'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

const islands = [
  {
    id: '1', name: '皇帝岛', slug: 'racha', boats: [
      { id: 'b1', name: '豪华双体帆船', price: 680, capacity: 25, status: '上架' },
      { id: 'b2', name: '彩虹号快艇', price: 580, capacity: 35, status: '上架' },
    ]
  },
  {
    id: '2', name: '皮皮岛', slug: 'pp', boats: [
      { id: 'b3', name: '皮皮岛专线大船', price: 780, capacity: 50, status: '上架' },
      { id: 'b4', name: '皮皮岛VIP快艇', price: 980, capacity: 20, status: '上架' },
    ]
  },
  {
    id: '3', name: '斯米兰', slug: 'similan', boats: [
      { id: 'b5', name: '斯米兰探索号', price: 1080, capacity: 30, status: '上架' },
      { id: 'b6', name: '斯米兰潜水专船', price: 1280, capacity: 20, status: '上架' },
    ]
  },
];

export default function AdminIslandsPage() {
  const [expanded, setExpanded] = useState<string | null>('1');

  const toggle = (id: string) => setExpanded(prev => prev === id ? null : id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">岛屿 & 船只管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理跳岛游岛屿和船只信息</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-ocean-500 text-white rounded-xl font-medium hover:bg-ocean-600 transition-colors">
          <Plus className="w-4 h-4" /> 添加岛屿
        </button>
      </div>

      {/* Islands */}
      <div className="space-y-3">
        {islands.map(island => (
          <div key={island.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Island Header */}
            <div
              onClick={() => toggle(island.id)}
              className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expanded === island.id ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                <span className="font-bold text-gray-900">{island.name}</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">/{island.slug}</span>
                <span className="text-xs text-gray-400">{island.boats.length} 艘船</span>
              </div>
              <button className="p-1.5 text-gray-400 hover:text-ocean-500 hover:bg-ocean-50 rounded-lg transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
            </div>

            {/* Boats */}
            {expanded === island.id && (
              <div className="border-t">
                <div className="px-5 py-3 bg-gray-50 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">船只列表</span>
                  <button className="flex items-center gap-1 text-xs text-ocean-500 font-medium hover:text-ocean-600">
                    <Plus className="w-3.5 h-3.5" /> 添加船只
                  </button>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 text-xs">
                      <th className="px-5 py-2.5 font-medium">船只名称</th>
                      <th className="px-5 py-2.5 font-medium">价格</th>
                      <th className="px-5 py-2.5 font-medium">载客</th>
                      <th className="px-5 py-2.5 font-medium">状态</th>
                      <th className="px-5 py-2.5 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {island.boats.map(boat => (
                      <tr key={boat.id} className="hover:bg-gray-50">
                        <td className="px-5 py-2.5 font-medium text-gray-900">{boat.name}</td>
                        <td className="px-5 py-2.5 text-ocean-600 font-semibold">¥{boat.price}</td>
                        <td className="px-5 py-2.5 text-gray-500">{boat.capacity}人</td>
                        <td className="px-5 py-2.5"><span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-xs">{boat.status}</span></td>
                        <td className="px-5 py-2.5">
                          <div className="flex gap-2">
                            <button className="p-1 text-gray-400 hover:text-ocean-500 rounded transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                            <button className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
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
