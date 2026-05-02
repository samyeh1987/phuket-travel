'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';

interface VehiclePackage {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  capacity: number;
  luggage_count: number;
  price_pickup: string;
  price_pickup_cny: string;
  price_charter_4h: string;
  price_charter_6h: string;
  price_charter_8h: string;
  price_charter_10h: string;
  price_charter_full: string;
  sort_order: number;
  is_active: boolean;
}

export default function AdminTransportPage() {
  const [packages, setPackages] = useState<VehiclePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<VehiclePackage | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const fetchPackages = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await fetch('/api/admin/transport');
      const json = await res.json();
      if (!res.ok || json.error) {
        setFetchError(json.error || `HTTP ${res.status}`);
        setPackages([]);
      } else {
        setPackages(json.data || []);
      }
    } catch (err: any) {
      setFetchError(err.message || '網絡錯誤');
      setPackages([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPackages(); }, []);

  const openAdd = () => {
    setEditItem({
      name: '', slug: '', description: '', image_url: '',
      capacity: 4, luggage_count: 2,
      price_pickup: '', price_pickup_cny: '',
      price_charter_4h: '', price_charter_6h: '',
      price_charter_8h: '', price_charter_10h: '',
      price_charter_full: '',
      sort_order: 0, is_active: true
    });
    setShowModal(true);
  };

  const openEdit = (pkg: any) => {
    setEditItem({
      ...pkg,
      price_pickup: pkg.price_pickup != null ? String(pkg.price_pickup) : '',
      price_pickup_cny: pkg.price_pickup_cny != null ? String(pkg.price_pickup_cny) : '',
      price_charter_4h: pkg.price_charter_4h != null ? String(pkg.price_charter_4h) : '',
      price_charter_6h: pkg.price_charter_6h != null ? String(pkg.price_charter_6h) : '',
      price_charter_8h: pkg.price_charter_8h != null ? String(pkg.price_charter_8h) : '',
      price_charter_10h: pkg.price_charter_10h != null ? String(pkg.price_charter_10h) : '',
      price_charter_full: pkg.price_charter_full != null ? String(pkg.price_charter_full) : '',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editItem) return;
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');

    const payload = {
      ...editItem,
      price_pickup: editItem.price_pickup ? Number(editItem.price_pickup) : null,
      price_pickup_cny: editItem.price_pickup_cny ? Number(editItem.price_pickup_cny) : null,
      price_charter_4h: editItem.price_charter_4h ? Number(editItem.price_charter_4h) : null,
      price_charter_6h: editItem.price_charter_6h ? Number(editItem.price_charter_6h) : null,
      price_charter_8h: editItem.price_charter_8h ? Number(editItem.price_charter_8h) : null,
      price_charter_10h: editItem.price_charter_10h ? Number(editItem.price_charter_10h) : null,
      price_charter_full: editItem.price_charter_full ? Number(editItem.price_charter_full) : null,
    };

    const res = await fetch('/api/admin/transport', {
      method: editItem.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || json.error) {
      setSaveError(json.error || '保存失敗');
      setSaving(false);
      return;
    }
    setSaveSuccess('✓ 保存成功');
    setTimeout(() => { setShowModal(false); setSaveSuccess(''); }, 1500);
    await fetchPackages();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定刪除此車型？')) return;
    setDeleting(id);
    await fetch(`/api/admin/transport?id=${id}`, { method: 'DELETE' });
    await fetchPackages();
    setDeleting(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">車型管理</h1>
          <p className="text-gray-500">管理接機、送機、包車服務的車型</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-ocean-500 text-white rounded-lg hover:bg-ocean-600">
          <Plus className="w-4 h-4" /> 新增車型
        </button>
      </div>

      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
          {fetchError}
          <br />
          <span className="text-sm">請檢查 Vercel 環境變數 SUPABASE_SERVICE_ROLE_KEY 是否正確配置。</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">加載中...</div>
      ) : packages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">暫無車型，點擊右上角新增</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">車型名稱</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">人數/行李</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">接機價格</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">8小時包車</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">狀態</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{pkg.name}</div>
                    <div className="text-sm text-gray-500">{pkg.description?.slice(0, 50)}...</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{pkg.capacity}人 / {pkg.luggage_count}件</td>
                  <td className="px-4 py-3 text-ocean-600 font-medium">฿{pkg.price_pickup?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-ocean-600 font-medium">฿{pkg.price_charter_8h?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${pkg.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      {pkg.is_active ? '上架' : '下架'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(pkg)} className="p-2 text-gray-400 hover:text-ocean-500">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(pkg.id!)} className="p-2 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && editItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">{editItem.id ? '編輯車型' : '新增車型'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">車型名稱 *</label>
                  <input type="text" value={editItem.name} onChange={e => setEditItem({...editItem, name: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" placeholder="如：舒適轎車" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                  <input type="text" value={editItem.slug} onChange={e => setEditItem({...editItem, slug: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" placeholder="如：sedan" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea value={editItem.description} onChange={e => setEditItem({...editItem, description: e.target.value})} rows={2} className="w-full px-3 py-2 border rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">圖片URL</label>
                <input type="url" value={editItem.image_url} onChange={e => setEditItem({...editItem, image_url: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="https://..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">乘客人數</label>
                  <input type="number" value={editItem.capacity} onChange={e => setEditItem({...editItem, capacity: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">行李數量</label>
                  <input type="number" value={editItem.luggage_count} onChange={e => setEditItem({...editItem, luggage_count: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">接機/送機價格 (฿)</label>
                  <input type="number" value={editItem.price_pickup} onChange={e => setEditItem({...editItem, price_pickup: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">接機/送機價格 (¥)</label>
                  <input type="number" value={editItem.price_pickup_cny} onChange={e => setEditItem({...editItem, price_pickup_cny: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">包車價格 (฿)</label>
                <div className="grid grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">4小時</label>
                    <input type="number" value={editItem.price_charter_4h} onChange={e => setEditItem({...editItem, price_charter_4h: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">6小時</label>
                    <input type="number" value={editItem.price_charter_6h} onChange={e => setEditItem({...editItem, price_charter_6h: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">8小時</label>
                    <input type="number" value={editItem.price_charter_8h} onChange={e => setEditItem({...editItem, price_charter_8h: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">10小時</label>
                    <input type="number" value={editItem.price_charter_10h} onChange={e => setEditItem({...editItem, price_charter_10h: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">包日</label>
                    <input type="number" value={editItem.price_charter_full} onChange={e => setEditItem({...editItem, price_charter_full: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                  <input type="number" value={editItem.sort_order} onChange={e => setEditItem({...editItem, sort_order: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editItem.is_active} onChange={e => setEditItem({...editItem, is_active: e.target.checked})} className="w-4 h-4 text-ocean-500 rounded" />
                    <span className="text-sm">上架銷售</span>
                  </label>
                </div>
              </div>

              {saveError && <div className="text-red-500 text-sm">{saveError}</div>}
              {saveSuccess && <div className="text-green-500 text-sm">{saveSuccess}</div>}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-ocean-500 text-white rounded-lg hover:bg-ocean-600 disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
