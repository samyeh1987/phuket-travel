'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, X, Save } from 'lucide-react';

interface Boat { id?: string; island_id: string; name: string; description: string; price: string; duration: string; is_active: boolean; }

export default function AdminIslandsPage() {
  const [islands, setIslands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showIslandModal, setShowIslandModal] = useState(false);
  const [showBoatModal, setShowBoatModal] = useState(false);
  const [editIsland, setEditIsland] = useState<any>(null);
  const [editBoat, setEditBoat] = useState<Boat>({ island_id: '', name: '', description: '', price: '', duration: '', is_active: true });
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/islands');
    const json = await res.json();
    if (json.data) {
      const merged = (json.data.islands || []).map((island: any) => ({
        ...island,
        boats: (json.data.boats || []).filter((b: any) => b.island_id === island.id),
      }));
      setIslands(merged);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const openAddIsland = () => { setEditIsland({ name: '', slug: '', description: '', image_url: '', is_active: true }); setShowIslandModal(true); };
  const openEditIsland = (island: any) => { setEditIsland({ ...island }); setShowIslandModal(true); };
  const openAddBoat = (islandId: string) => { setEditBoat({ island_id: islandId, name: '', description: '', price: '', duration: '', is_active: true }); setShowBoatModal(true); };
  const openEditBoat = (boat: any) => { setEditBoat({ ...boat, price: String(boat.price) }); setShowBoatModal(true); };

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-').replace(/-+/g, '-');

  const saveIsland = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editIsland) return;
    setSaving(true);
    const payload = { table: 'islands', name: editIsland.name, slug: editIsland.slug || generateSlug(editIsland.name), description: editIsland.description, image_url: editIsland.image_url, is_active: editIsland.is_active };
    const method = editIsland.id ? 'PUT' : 'POST';
    await fetch('/api/admin/islands', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editIsland.id ? { id: editIsland.id, ...payload } : payload),
    });
    setShowIslandModal(false);
    await fetchAll();
    setSaving(false);
  };

  const saveBoat = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { table: 'island_boats', island_id: editBoat.island_id, name: editBoat.name, description: editBoat.description, price: Number(editBoat.price), duration: editBoat.duration, is_active: editBoat.is_active };
    const method = editBoat.id ? 'PUT' : 'POST';
    await fetch('/api/admin/islands', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editBoat.id ? { id: editBoat.id, ...payload } : payload),
    });
    setShowBoatModal(false);
    await fetchAll();
    setSaving(false);
  };

  const deleteIsland = async (id: string) => {
    if (!confirm('刪除島嶼會連帶刪除所有關聯船隻，確定？')) return;
    await fetch(`/api/admin/islands?table=islands&id=${id}`, { method: 'DELETE' });
    await fetchAll();
  };

  const deleteBoat = async (id: string) => {
    if (!confirm('確定刪除此船隻？')) return;
    await fetch(`/api/admin/islands?table=island_boats&id=${id}`, { method: 'DELETE' });
    await fetchAll();
  };

  const toggleIsland = async (island: any) => {
    await fetch('/api/admin/islands', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'islands', id: island.id, is_active: !island.is_active }),
    });
    fetchAll();
  };

  const toggleBoat = async (boat: any) => {
    await fetch('/api/admin/islands', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'island_boats', id: boat.id, is_active: !boat.is_active }),
    });
    fetchAll();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">岛屿 & 船只管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理跳岛游岛屿和船只信息</p>
        </div>
        <button onClick={openAddIsland} className="flex items-center gap-2 px-4 py-2.5 bg-ocean-500 text-white rounded-xl font-medium hover:bg-ocean-600 transition-colors">
          <Plus className="w-4 h-4" /> 添加岛屿
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400"><div className="w-6 h-6 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" /><p className="text-sm">加载中...</p></div>
      ) : islands.length === 0 ? (
        <div className="p-12 text-center text-gray-400 bg-white rounded-2xl shadow-sm text-sm">暂无岛屿，点击上方添加</div>
      ) : (
        <div className="space-y-3">
          {islands.map(island => (
            <div key={island.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div onClick={() => setExpanded(expanded === island.id ? null : island.id)}
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  {expanded === island.id ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                  <span className="font-bold text-gray-900">{island.name}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">/{island.slug}</span>
                  <div className={`w-2 h-2 rounded-full ${island.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-xs text-gray-400">{island.boats.length} 艘船</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); openAddBoat(island.id); }} className="p-1.5 text-gray-400 hover:text-ocean-500 hover:bg-ocean-50 rounded-lg"><Plus className="w-4 h-4" /></button>
                  <button onClick={(e) => { e.stopPropagation(); openEditIsland(island); }} className="p-1.5 text-gray-400 hover:text-ocean-500 hover:bg-ocean-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                  <button onClick={(e) => { e.stopPropagation(); deleteIsland(island.id); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              {expanded === island.id && (
                <div className="border-t">
                  <div className="px-5 py-3 bg-gray-50 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">船只列表</span>
                  </div>
                  {island.boats.length === 0 ? (
                    <div className="px-5 py-4 text-sm text-gray-400">暂无船隻</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 text-xs">
                          <th className="px-5 py-2.5 font-medium">船只名称</th>
                          <th className="px-5 py-2.5 font-medium">价格</th>
                          <th className="px-5 py-2.5 font-medium">时长</th>
                          <th className="px-5 py-2.5 font-medium">状态</th>
                          <th className="px-5 py-2.5 font-medium">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {island.boats.map((boat: any) => (
                          <tr key={boat.id} className="hover:bg-gray-50">
                            <td className="px-5 py-2.5 font-medium text-gray-900">{boat.name}</td>
                            <td className="px-5 py-2.5 text-ocean-600 font-semibold">¥{Number(boat.price).toLocaleString()}</td>
                            <td className="px-5 py-2.5 text-gray-500">{boat.duration || '—'}</td>
                            <td className="px-5 py-2.5">
                              <button onClick={() => toggleBoat(boat)} className={`text-xs font-medium ${boat.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                                {boat.is_active ? '上架中' : '已下架'}
                              </button>
                            </td>
                            <td className="px-5 py-2.5">
                              <div className="flex gap-2">
                                <button onClick={() => openEditBoat(boat)} className="p-1 text-gray-400 hover:text-ocean-500"><Pencil className="w-3.5 h-3.5" /></button>
                                <button onClick={() => deleteBoat(boat.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Island Modal */}
      {showIslandModal && editIsland && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editIsland.id ? '编辑岛屿' : '添加岛屿'}</h2>
              <button onClick={() => setShowIslandModal(false)} className="p-1 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={saveIsland} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">岛屿名称 *</label>
                <input type="text" required value={editIsland.name} onChange={e => setEditIsland({ ...editIsland, name: e.target.value, slug: generateSlug(e.target.value) })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
              </div>
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">Slug</label>
                <input type="text" value={editIsland.slug} onChange={e => setEditIsland({ ...editIsland, slug: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
              </div>
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">描述</label>
                <textarea value={editIsland.description} onChange={e => setEditIsland({ ...editIsland, description: e.target.value })} rows={2} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 resize-none" />
              </div>
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">图片URL</label>
                <input type="text" value={editIsland.image_url} onChange={e => setEditIsland({ ...editIsland, image_url: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowIslandModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50">取消</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-ocean-500 text-white rounded-xl font-medium hover:bg-ocean-600 flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Boat Modal */}
      {showBoatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editBoat.id ? '编辑船只' : '添加船只'}</h2>
              <button onClick={() => setShowBoatModal(false)} className="p-1 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={saveBoat} className="space-y-4">
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">船只名称 *</label>
                <input type="text" required value={editBoat.name} onChange={e => setEditBoat({ ...editBoat, name: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
              </div>
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">描述</label>
                <textarea value={editBoat.description} onChange={e => setEditBoat({ ...editBoat, description: e.target.value })} rows={2} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">价格（¥）*</label>
                  <input type="number" required value={editBoat.price} onChange={e => setEditBoat({ ...editBoat, price: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
                </div>
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">时长</label>
                  <input type="text" value={editBoat.duration} onChange={e => setEditBoat({ ...editBoat, duration: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowBoatModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50">取消</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-ocean-500 text-white rounded-xl font-medium hover:bg-ocean-600 flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
