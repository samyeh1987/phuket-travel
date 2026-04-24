'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Home, Sailboat, Anchor, Ticket, MessageCircle, User, LogOut, Package } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

const navItems = [
  { label: '首页', href: '/', icon: Home },
  { label: '定制旅行', href: '/custom-trip', icon: MessageCircle },
  { label: '深潜', href: '/diving', icon: Anchor },
  { label: '跳岛游', href: '/island-tour', icon: Sailboat },
  { label: '秀场', href: '/show', icon: Ticket },
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
            <Link href="/" className="flex items-center gap-2">
              <Sailboat className="w-8 h-8 text-ocean-500" />
              <span className="text-xl font-bold text-gray-900">泰嗨了</span>
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
          <Link href="/" className="flex items-center gap-2">
            <Sailboat className="w-6 h-6 text-ocean-500" />
            <span className="text-lg font-bold text-gray-900">泰嗨了</span>
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
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 py-2 px-3 text-gray-500 hover:text-ocean-500 transition-colors"
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
          {user && (
            <Link
              href="/my/orders"
              className="flex flex-col items-center justify-center gap-1 py-2 px-3 text-gray-500 hover:text-ocean-500 transition-colors"
            >
              <Package className="w-5 h-5" />
              <span className="text-xs font-medium">订单</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
