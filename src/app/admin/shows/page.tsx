'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, X, Save } from 'lucide-react';

interface ShowPackage { id?: string; show_id: string; name: string; description: string; price: string; price_cny: string; is_active: boolean; }

export default function AdminShowsPage() {
  const [shows, setShows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showShowModal, setShowShowModal] = useState(false);
  const [showPkgModal, setShowPkgModal] = useState(false);
  const [editShow, setEditShow] = useState<any>(null);
  const [editPkg, setEditPkg] = useState<ShowPackage>({ show_id: '', name: '', description: '', price: '', price_cny: '', is_active: true });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/shows');
    const json = await res.json();
    if (json.data) {
      const merged = (json.data.shows || []).map((show: any) => ({
        ...show,
        packages: (json.data.packages || []).filter((p: any) => p.show_id === show.id),
      }));
      setShows(merged);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-').replace(/-+/g, '-');

  const openAddShow = () => { setEditShow({ name: '', slug: '', description: '', image_url: '', is_active: true }); setShowShowModal(true); };
  const openEditShow = (show: any) => { setEditShow({ ...show }); setShowShowModal(true); };
  const openAddPkg = (showId: string) => { setEditPkg({ show_id: showId, name: '', description: '', price: '', price_cny: '', is_active: true }); setShowPkgModal(true); };
  const openEditPkg = (pkg: any) => { setEditPkg({ ...pkg, price: String(pkg.price || ''), price_cny: String(pkg.price_cny || '') }); setShowPkgModal(true); };

  const saveShow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editShow) return;
    setSaving(true);
    setSaveError('');
    const payload = { table: 'shows', name: editShow.name, slug: editShow.slug || generateSlug(editShow.name), description: editShow.description, image_url: editShow.image_url, is_active: editShow.is_active };
    const method = editShow.id ? 'PUT' : 'POST';
    const res = await fetch('/api/admin/shows', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editShow.id ? { id: editShow.id, ...payload } : payload),
    });
    const json = await res.json();
    if (!res.ok || json.error) {
      setSaveError(json.error || '保存失败，请重试');
      setSaving(false);
      return;
    }
    setShowShowModal(false);
    await fetchAll();
    setSaving(false);
  };

  const savePkg = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    const payload = { table: 'show_packages', show_id: editPkg.show_id, name: editPkg.name, description: editPkg.description, price: Number(editPkg.price), price_cny: Number(editPkg.price_cny) || null, is_active: editPkg.is_active };
    const method = editPkg.id ? 'PUT' : 'POST';
    const res = await fetch('/api/admin/shows', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editPkg.id ? { id: editPkg.id, ...payload } : payload),
    });
    const json = await res.json();
    if (!res.ok || json.error) {
      setSaveError(json.error || '保存失败，请重试');
      setSaving(false);
      return;
    }
    setShowPkgModal(false);
    await fetchAll();
    setSaving(false);
  };

  const deleteShow = async (id: string) => {
    if (!confirm('刪除秀場會連帶刪除所有套餐，確定？')) return;
    await fetch(`/api/admin/shows?table=shows&id=${id}`, { method: 'DELETE' });
    await fetchAll();
  };

  const deletePkg = async (id: string) => {
    if (!confirm('確定刪除此套餐？')) return;
    await fetch(`/api/admin/shows?table=show_packages&id=${id}`, { method: 'DELETE' });
    await fetchAll();
  };

  const toggleShow = async (show: any) => {
    await fetch('/api/admin/shows', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'shows', id: show.id, is_active: !show.is_active }),
    });
    fetchAll();
  };

  const togglePkg = async (pkg: any) => {
    await fetch('/api/admin/shows', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'show_packages', id: pkg.id, is_active: !pkg.is_active }),
    });
    fetchAll();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">秀场管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理秀场和套餐</p>
        </div>
        <button onClick={openAddShow} className="flex items-center gap-2 px-4 py-2.5 bg-ocean-500 text-white rounded-xl font-medium hover:bg-ocean-600 transition-colors">
          <Plus className="w-4 h-4" /> 添加秀场
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400"><div className="w-6 h-6 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" /><p className="text-sm">加载中...</p></div>
      ) : shows.length === 0 ? (
        <div className="p-12 text-center text-gray-400 bg-white rounded-2xl shadow-sm text-sm">暂无秀场，点击上方添加</div>
      ) : (
        <div className="space-y-3">
          {shows.map(show => (
            <div key={show.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div onClick={() => setExpanded(expanded === show.id ? null : show.id)}
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  {expanded === show.id ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                  <span className="font-bold text-gray-900">{show.name}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">/{show.slug}</span>
                  <div className={`w-2 h-2 rounded-full ${show.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-xs text-gray-400">起价 ฿{show.packages?.[0]?.price || '—'} / ¥{show.packages?.[0]?.price_cny || '-'}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); openAddPkg(show.id); }} className="p-1.5 text-gray-400 hover:text-ocean-500 hover:bg-ocean-50 rounded-lg"><Plus className="w-4 h-4" /></button>
                  <button onClick={(e) => { e.stopPropagation(); openEditShow(show); }} className="p-1.5 text-gray-400 hover:text-ocean-500 hover:bg-ocean-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                  <button onClick={(e) => { e.stopPropagation(); deleteShow(show.id); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              {expanded === show.id && (
                <div className="border-t">
                  <div className="px-5 py-3 bg-gray-50 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">套餐列表</span>
                  </div>
                  {(!show.packages || show.packages.length === 0) ? (
                    <div className="px-5 py-4 text-sm text-gray-400">暂无套餐</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 text-xs">
                          <th className="px-5 py-2.5 font-medium">套餐名称</th>
                          <th className="px-5 py-2.5 font-medium">描述</th>
                          <th className="px-5 py-2.5 font-medium">价格</th>
                          <th className="px-5 py-2.5 font-medium">状态</th>
                          <th className="px-5 py-2.5 font-medium">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {show.packages.map((pkg: any) => (
                          <tr key={pkg.id} className="hover:bg-gray-50">
                            <td className="px-5 py-2.5 font-medium text-gray-900">{pkg.name}</td>
                            <td className="px-5 py-2.5 text-gray-500 text-xs">{pkg.description || '—'}</td>
                            <td className="px-5 py-2.5">
                              <div className="text-ocean-600 font-semibold">฿{Number(pkg.price).toLocaleString()}</div>
                              <div className="text-green-600 text-xs">¥{(pkg.price_cny && !isNaN(Number(pkg.price_cny)) && Number(pkg.price_cny) > 0) ? Number(pkg.price_cny).toLocaleString() : '-'}</div>
                            </td>
                            <td className="px-5 py-2.5">
                              <button onClick={() => togglePkg(pkg)} className={`text-xs font-medium ${pkg.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                                {pkg.is_active ? '上架中' : '已下架'}
                              </button>
                            </td>
                            <td className="px-5 py-2.5">
                              <div className="flex gap-2">
                                <button onClick={() => openEditPkg(pkg)} className="p-1 text-gray-400 hover:text-ocean-500"><Pencil className="w-3.5 h-3.5" /></button>
                                <button onClick={() => deletePkg(pkg.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
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

      {/* Show Modal */}
      {showShowModal && editShow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editShow.id ? '编辑秀场' : '添加秀场'}</h2>
              <button onClick={() => setShowShowModal(false)} className="p-1 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={saveShow} className="space-y-4">
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">秀场名称 *</label>
                <input type="text" required value={editShow.name} onChange={e => setEditShow({ ...editShow, name: e.target.value, slug: generateSlug(e.target.value) })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
              </div>
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">Slug</label>
                <input type="text" value={editShow.slug} onChange={e => setEditShow({ ...editShow, slug: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
              </div>
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">描述</label>
                <textarea value={editShow.description} onChange={e => setEditShow({ ...editShow, description: e.target.value })} rows={2} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 resize-none" />
              </div>
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">图片URL</label>
                <input type="text" value={editShow.image_url} onChange={e => setEditShow({ ...editShow, image_url: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50">取消</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-ocean-500 text-white rounded-xl font-medium hover:bg-ocean-600 flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Package Modal */}
      {showPkgModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editPkg.id ? '编辑套餐' : '添加套餐'}</h2>
              <button onClick={() => setShowPkgModal(false)} className="p-1 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={savePkg} className="space-y-4">
              {saveError && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{saveError}</div>}
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">套餐名称 *</label>
                <input type="text" required value={editPkg.name} onChange={e => setEditPkg({ ...editPkg, name: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" placeholder="例如：普通票 / VIP票" />
              </div>
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">描述</label>
                <input type="text" value={editPkg.description} onChange={e => setEditPkg({ ...editPkg, description: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">泰铢价格（฿）*</label>
                  <input type="number" required step="0.01" value={editPkg.price} onChange={e => setEditPkg({ ...editPkg, price: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
                </div>
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">人民币价格（¥）</label>
                  <input type="number" step="0.01" value={editPkg.price_cny} onChange={e => setEditPkg({ ...editPkg, price_cny: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPkgModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50">取消</button>
                <button type="submit" disabled={saving} className="flex-1 py-2-5 bg-ocean-500 text-white rounded-xl font-medium hover:bg-ocean-600 flex items-center justify-center gap-2 disabled:opacity-50">
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
