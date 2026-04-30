'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';

interface DivingPackage {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  price_cny: string;
  type: string;
  duration: string;
  is_active: boolean;
}

export default function AdminDivingPage() {
  const [packages, setPackages] = useState<DivingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<DivingPackage | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchPackages = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/diving');
    const json = await res.json();
    setPackages(json.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPackages(); }, []);

  const openAdd = () => { setEditItem({ name: '', slug: '', description: '', price: '', price_cny: '', type: 'experience', duration: '', is_active: true }); setShowModal(true); };
  const openEdit = (pkg: any) => { setEditItem({ ...pkg, price: String(pkg.price || ''), price_cny: String(pkg.price_cny || '') }); setShowModal(true); };

  const [saveError, setSaveError] = useState('');
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editItem) return;
    setSaving(true);
    setSaveError('');
    const { name, slug, description, price, price_cny, type, duration, is_active } = editItem;
    const payload = { name, slug, description, price: Number(price), price_cny: Number(price_cny) || null, type, duration, is_active };
    const res = await fetch(editItem.id ? '/api/admin/diving' : '/api/admin/diving', {
      method: editItem.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editItem.id ? { id: editItem.id, ...payload } : payload),
    });
    const json = await res.json();
    if (!res.ok || json.error) {
      setSaveError(json.error || '保存失败，请重试');
      setSaving(false);
      return;
    }
    setShowModal(false);
    await fetchPackages();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定刪除此套餐？')) return;
    setDeleting(id);
    await fetch(`/api/admin/diving?id=${id}`, { method: 'DELETE' });
    await fetchPackages();
    setDeleting(null);
  };

  const handleToggle = async (pkg: any) => {
    await fetch('/api/admin/diving', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: pkg.id, is_active: !pkg.is_active }),
    });
    fetchPackages();
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-').replace(/-+/g, '-');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">深潜套餐管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理深潜体验和考证套餐</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-ocean-500 text-white rounded-xl font-medium hover:bg-ocean-600 transition-colors">
          <Plus className="w-4 h-4" /> 添加套餐
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400"><div className="w-6 h-6 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" /><p className="text-sm">加载中...</p></div>
        ) : packages.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">暂无套餐，点击上方添加</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500">
                <th className="px-5 py-3.5 font-medium">套餐名称</th>
                <th className="px-5 py-3.5 font-medium">类型</th>
                <th className="px-5 py-3.5 font-medium">时长</th>
                <th className="px-5 py-3.5 font-medium">泰铢价格</th>
                <th className="px-5 py-3.5 font-medium">人民币价格</th>
                <th className="px-5 py-3.5 font-medium">状态</th>
                <th className="px-5 py-3.5 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {packages.map(pkg => (
                <tr key={pkg.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-gray-900">{pkg.name}</div>
                    <div className="text-xs text-gray-400">/{pkg.slug}</div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs">
                    {pkg.type === 'experience' ? '体验' : pkg.type === 'ow' ? 'OW考证' : pkg.type === 'aow' ? 'AOW考证' : pkg.type === 'free2' ? '自由潜2星' : pkg.type === 'free3' ? '自由潜3星' : pkg.type}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{pkg.duration || '—'}</td>
                  <td className="px-5 py-3.5 text-ocean-600 font-semibold">฿{Number(pkg.price).toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-green-600 font-semibold">¥{(pkg.price_cny && !isNaN(Number(pkg.price_cny)) && Number(pkg.price_cny) > 0) ? Number(pkg.price_cny).toLocaleString() : '-'}</td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => handleToggle(pkg)} className={`flex items-center gap-1 text-xs font-medium ${pkg.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${pkg.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                      {pkg.is_active ? '上架中' : '已下架'}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(pkg)} className="p-1.5 text-gray-400 hover:text-ocean-500 hover:bg-ocean-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(pkg.id!)} disabled={deleting === pkg.id} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && editItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editItem.id ? '编辑套餐' : '添加套餐'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              {saveError && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{saveError}</div>}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">套餐名称 *</label>
                <input type="text" required value={editItem.name} onChange={e => setEditItem({ ...editItem, name: e.target.value, slug: generateSlug(e.target.value) })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" placeholder="例如：体验深潜" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Slug</label>
                <input type="text" value={editItem.slug} onChange={e => setEditItem({ ...editItem, slug: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" placeholder="auto-generated-from-name" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">类型</label>
                <select value={editItem.type} onChange={e => setEditItem({ ...editItem, type: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500">
                  <option value="experience">体验深潜</option>
                  <option value="ow">OW水肺考证</option>
                  <option value="aow">AOW进阶考证</option>
                  <option value="free2">自由潜2星</option>
                  <option value="free3">自由潜3星</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">泰铢价格（฿）*</label>
                  <input type="number" required step="0.01" value={editItem.price} onChange={e => setEditItem({ ...editItem, price: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" placeholder="例如：680" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">人民币价格（¥）</label>
                  <input type="number" step="0.01" value={editItem.price_cny} onChange={e => setEditItem({ ...editItem, price_cny: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" placeholder="例如：135" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">时长</label>
                <input type="text" value={editItem.duration} onChange={e => setEditItem({ ...editItem, duration: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" placeholder="例如：2-3小时" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">描述</label>
                <textarea value={editItem.description} onChange={e => setEditItem({ ...editItem, description: e.target.value })} rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50">取消</button>
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
