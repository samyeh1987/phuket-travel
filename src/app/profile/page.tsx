'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { User, Save, ChevronRight, LogOut } from 'lucide-react';

interface Profile {
  name_cn: string;
  name_en: string;
  phone: string;
  wechat: string;
  email: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile>({ name_cn: '', name_en: '', phone: '', wechat: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('name_cn, name_en, phone, wechat, email')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (data) setProfile({
          name_cn: data.name_cn || '',
          name_en: data.name_en || '',
          phone: data.phone || '',
          wechat: data.wechat || '',
          email: data.email || user.email || '',
        });
        setLoading(false);
      });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      name_cn: profile.name_cn,
      name_en: profile.name_en,
      phone: profile.phone,
      wechat: profile.wechat,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id);
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40 flex items-center gap-3 px-4 py-4 md:py-0 md:h-16 md:justify-center">
        <div className="w-9 h-9 rounded-full bg-ocean-100 flex items-center justify-center">
          <User className="w-5 h-5 text-ocean-600" />
        </div>
        <h1 className="font-bold text-gray-900">个人资料</h1>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 pb-36">
        {/* 账号信息（只读） */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <h2 className="font-semibold text-gray-700 text-sm mb-3">账号信息</h2>
          <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-ocean-100 flex items-center justify-center">
              <User className="w-5 h-5 text-ocean-500" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{profile.email || user?.email}</div>
              <div className="text-xs text-gray-400">登录邮箱（不可修改）</div>
            </div>
          </div>
        </div>

        {/* 基本资料表单 */}
        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm p-5 space-y-5">
          <h2 className="font-semibold text-gray-700 text-sm">基本信息</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">中文姓名</label>
            <input
              type="text"
              placeholder="张三"
              value={profile.name_cn}
              onChange={e => setProfile(p => ({ ...p, name_cn: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">英文姓名</label>
            <input
              type="text"
              placeholder="ZHANG SAN"
              value={profile.name_en}
              onChange={e => setProfile(p => ({ ...p, name_en: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">联系电话</label>
            <input
              type="tel"
              placeholder="+86 13800138000"
              value={profile.phone}
              onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">微信号</label>
            <input
              type="text"
              placeholder="your_wechat_id"
              value={profile.wechat}
              onChange={e => setProfile(p => ({ ...p, wechat: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
            />
          </div>

          {saved && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-600 flex items-center gap-2">
              ✓ 保存成功
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-ocean-500 hover:bg-ocean-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? '保存中...' : '保存资料'}
          </button>
        </form>

        {/* 快捷入口 */}
        <div className="mt-4 bg-white rounded-2xl shadow-sm overflow-hidden">
          <Link href="/my/orders" className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
            <span className="font-medium text-gray-700">我的订单</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
          <div className="border-t" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 text-left"
          >
            <span className="font-medium text-red-500">退出登录</span>
            <LogOut className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
