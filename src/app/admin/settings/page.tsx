'use client';

import { useEffect, useState } from 'react';
import { Save, Plus, Trash2, CheckCircle, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

interface Setting { key: string; value: string; }
interface Banner { id?: string; title: string; image_url: string; link_url: string; sort_order: number; is_active: boolean; }

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [bannerSaving, setBannerSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/settings');
    const json = await res.json();
    if (json.data) {
      const settingsMap: Record<string, string> = {};
      (json.data.settings || []).forEach((s: Setting) => { settingsMap[s.key] = s.value || ''; });
      setSettings(settingsMap);
      setBanners(json.data.banners || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const updateSetting = (key: string, value: string) => setSettings(prev => ({ ...prev, [key]: value }));

  const saveSettings = async () => {
    setSaving(true);
    for (const [key, value] of Object.entries(settings)) {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upsert_setting', key, value }),
      });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  const addBanner = () => setBanners(prev => [...prev, { title: '', image_url: '', link_url: '', sort_order: prev.length + 1, is_active: true }]);

  const updateBanner = (index: number, field: keyof Banner, value: any) => {
    setBanners(prev => prev.map((b, i) => i === index ? { ...b, [field]: value } : b));
  };

  const deleteBanner = async (index: number, id?: string) => {
    if (!confirm('確定刪除此Banner？')) return;
    if (id) {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', table: 'banners', id }),
      });
    }
    setBanners(prev => prev.filter((_, i) => i !== index));
  };

  const saveBanners = async () => {
    setBannerSaving(true);
    for (const banner of banners) {
      const payload = { title: banner.title, image_url: banner.image_url, link_url: banner.link_url, sort_order: banner.sort_order, is_active: banner.is_active };
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(banner.id
          ? { action: 'update', table: 'banners', id: banner.id, ...payload }
          : { action: 'insert', table: 'banners', ...payload }
        ),
      });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    await fetchData();
    setBannerSaving(false);
  };

  const toggleBanner = async (banner: Banner) => {
    if (!banner.id) return;
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', table: 'banners', id: banner.id, is_active: !banner.is_active }),
    });
    fetchData();
  };

  // Helper: check if a setting should be visible (default true if not set)
  const isVisible = (key: string) => settings[key] !== 'false';

  if (loading) {
    return <div className="p-12 text-center text-gray-400"><div className="w-6 h-6 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" /><p className="text-sm">加载中...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
          <p className="text-sm text-gray-500 mt-1">管理客服信息、收款方式及显示设置</p>
        </div>
        <button onClick={saveSettings} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-ocean-500 text-white rounded-xl font-medium hover:bg-ocean-600 disabled:opacity-50 transition-colors">
          {saved ? <CheckCircle className="w-4 h-4" /> : saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? '保存中...' : saved ? '已保存' : '保存设置'}
        </button>
      </div>

      {/* 客服联系方式 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">客服联系方式</h2>
        <p className="text-xs text-gray-400 mb-4">开启/关闭各渠道在联系页面和页脚的显示</p>
        <div className="space-y-4">
          {[
            { key: 'wechat', label: '微信号', placeholder: 'phukettravel' },
            { key: 'whatsapp', label: 'WhatsApp', placeholder: '+66 XX XXX XXXX' },
            { key: 'phone', label: '联系电话', placeholder: '+66 XX XXX XXXX' },
            { key: 'email', label: '邮箱', placeholder: 'contact@phukettravel.com' },
          ].map(f => (
            <div key={f.key} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">{f.label}</label>
                <input
                  type={f.key === 'email' ? 'email' : 'text'}
                  value={settings[f.key] || ''}
                  onChange={e => updateSetting(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500">显示</span>
                <button
                  type="button"
                  onClick={() => updateSetting(`${f.key}_visible`, isVisible(`${f.key}`) ? 'false' : 'true')}
                  className={`relative w-12 h-7 rounded-full transition-colors ${isVisible(`${f.key}`) ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${isVisible(`${f.key}`) ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 客服二维码 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">客服二维码</h2>
        <p className="text-xs text-gray-400 mb-4">设置后将在定制旅行提交成功页面显示，方便客户添加客服好友</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { key: 'service_wechat_qr', label: '微信客服二维码' },
            { key: 'service_line_qr', label: 'Line 客服二维码' },
          ].map(f => (
            <div key={f.key} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">{f.label}</label>
                  <button
                    type="button"
                    onClick={() => updateSetting(`${f.key}_visible`, isVisible(`${f.key}`) ? 'false' : 'true')}
                    className={`relative w-10 h-5 rounded-full transition-colors ${isVisible(`${f.key}`) ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isVisible(`${f.key}`) ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                <ImageUpload
                  value={settings[f.key] || ''}
                  onChange={v => updateSetting(f.key, v)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 收款码 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">收款码</h2>
        <p className="text-xs text-gray-400 mb-4">开启/关闭各收款方式在付款页面的显示；建议图片尺寸 300x400 像素</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { key: 'alipay_qr', label: '支付宝收款码' },
            { key: 'wechat_qr', label: '微信收款码' },
            { key: 'thai_qr', label: '泰国QR码' },
          ].map(f => (
            <div key={f.key} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">{f.label}</label>
                  <button
                    type="button"
                    onClick={() => updateSetting(`${f.key}_visible`, isVisible(`${f.key}`) ? 'false' : 'true')}
                    className={`relative w-10 h-5 rounded-full transition-colors ${isVisible(`${f.key}`) ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isVisible(`${f.key}`) ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                <ImageUpload
                  value={settings[f.key] || ''}
                  onChange={v => updateSetting(f.key, v)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 首页Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">首页Banner</h2>
            <p className="text-xs text-gray-400 mt-0.5">管理首页轮播图片</p>
          </div>
          <button onClick={addBanner} className="flex items-center gap-1.5 px-3 py-1.5 bg-ocean-50 text-ocean-600 rounded-lg text-sm font-medium hover:bg-ocean-100 transition-colors">
            <Plus className="w-4 h-4" /> 添加Banner
          </button>
        </div>
        <div className="space-y-3">
          {banners.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">暂无Banner，点击上方添加</div>
          )}
          {banners.map((banner, i) => (
            <div key={banner.id || i} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">标题</label>
                      <input type="text" value={banner.title} onChange={e => updateBanner(i, 'title', e.target.value)} placeholder="Banner标题" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">图片</label>
                      <ImageUpload
                        value={banner.image_url}
                        onChange={v => updateBanner(i, 'image_url', v)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">链接URL</label>
                      <input type="text" value={banner.link_url} onChange={e => updateBanner(i, 'link_url', e.target.value)} placeholder="/diving 或 https://..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => toggleBanner(banner)} className={`p-1.5 rounded-lg text-xs font-medium ${banner.is_active ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-50'}`}>
                    {banner.is_active ? '上架' : '下架'}
                  </button>
                  <button onClick={() => deleteBanner(i, banner.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {banners.length > 0 && (
          <div className="mt-4 flex justify-end">
            <button onClick={saveBanners} disabled={bannerSaving} className="flex items-center gap-2 px-4 py-2 bg-ocean-500 text-white rounded-xl text-sm font-medium hover:bg-ocean-600 disabled:opacity-50 transition-colors">
              {bannerSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {bannerSaving ? '保存中...' : '保存Banner'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
