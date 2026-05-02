'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Home, Sailboat, Anchor, Ticket, MessageCircle, User, LogOut, Package, Car, Ship } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

const navItems = [
  { label: '首页', href: '/', icon: Home },
  { label: '定制旅行', href: '/custom-trip', icon: MessageCircle },
  { label: '深潜', href: '/diving', icon: Anchor },
  { label: '跳岛游', href: '/island-tour', icon: Sailboat },
  { label: '秀场', href: '/show', icon: Ticket },
  { label: '包车接机', href: '/transport', icon: Car },
  { label: '包船服务', href: '/yacht', icon: Ship },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  const userLabel = user?.user_metadata?.name_cn || user?.email?.split('@')[0] || '会员';

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image src="/images/higogo-logo-transparent.png" alt="HiGOGO Travel" width={140} height={45} className="h-11 w-auto" />
            </Link>

            {/* Desktop Navigation */}
            <div className="flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 hover:text-ocean-600 font-medium transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* User Area */}
            <div className="flex items-center gap-3">
              {loading ? null : user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-ocean-50 text-ocean-700 font-medium hover:bg-ocean-100 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    {userLabel}
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border py-1">
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="w-4 h-4" /> 个人资料
                      </Link>
                      <Link
                        href="/my/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Package className="w-4 h-4" /> 我的订单
                      </Link>
                      <div className="border-t my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" /> 退出登录
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 px-4 py-2 border-2 border-ocean-500 text-ocean-500 hover:bg-ocean-50 rounded-full font-medium transition-colors"
                >
                  <User className="w-4 h-4" />
                  登录
                </Link>
              )}
              <Link
                href="/contact"
                className="flex items-center gap-2 px-4 py-2 bg-ocean-500 hover:bg-ocean-600 text-white rounded-full font-medium transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                联系客服
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/" className="flex items-center -ml-2">
            <Image src="/images/higogo-logo-transparent.png" alt="HiGOGO Travel" width={160} height={50} className="h-12 w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            {user && (
              <Link href="/my/orders" className="p-2 text-gray-700">
                <Package className="w-5 h-5" />
              </Link>
            )}
            <button
              className="p-2 text-gray-700"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isOpen && (
          <div className="absolute top-14 left-0 right-0 bg-white shadow-lg border-t z-50">
            <div className="py-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-ocean-50 hover:text-ocean-600"
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              <div className="border-t my-2 mx-4" />
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-ocean-50"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">个人资料</span>
                  </Link>
                  <Link
                    href="/my/orders"
                    className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-ocean-50"
                    onClick={() => setIsOpen(false)}
                  >
                    <Package className="w-5 h-5" />
                    <span className="font-medium">我的订单</span>
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-red-500 hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">退出登录</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-3 px-5 py-3 text-ocean-600 hover:bg-ocean-50"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">登录 / 注册</span>
                </Link>
              )}
              <div className="border-t my-2 mx-4" />
              <Link
                href="/contact"
                className="flex items-center gap-3 mx-4 my-2 px-4 py-3 bg-ocean-500 text-white rounded-lg font-medium"
                onClick={() => setIsOpen(false)}
              >
                <MessageCircle className="w-5 h-5" />
                联系客服
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg">
        <div className="px-2 pb-safe">
          {/* 用户区：已登录显示头像+名字，未登录显示登录入口 */}
          <div className="flex items-center justify-between px-3 py-2 mb-1.5">
            {user ? (
              <>
                <Link href="/profile" className="flex items-center gap-2.5 group">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 leading-tight">{userLabel}</p>
                    <p className="text-xs text-gray-400 leading-tight">查看个人资料</p>
                  </div>
                </Link>
                <div className="flex items-center gap-1">
                  <Link
                    href="/my/orders"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ocean-50 text-ocean-600 text-xs font-medium hover:bg-ocean-100 transition-colors"
                  >
                    <Package className="w-3.5 h-3.5" />
                    我的订单
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    title="退出登录"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between w-full">
                <p className="text-sm text-gray-500">登录后享受更多服务</p>
                <Link
                  href="/auth/login"
                  className="px-4 py-1.5 bg-ocean-500 text-white text-xs font-semibold rounded-full hover:bg-ocean-600 transition-colors"
                >
                  登录 / 注册
                </Link>
              </div>
            )}
          </div>

          {/* 导航分隔线 */}
          <div className="border-t border-gray-100 mx-3 mb-1.5" />

          {/* 功能导航图标 */}
          <div className="flex items-center justify-around h-14">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center gap-0.5 py-1 px-2 text-gray-500 hover:text-ocean-500 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium leading-tight">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
