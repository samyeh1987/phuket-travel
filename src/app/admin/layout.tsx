'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, Anchor, Sailboat, Ticket, ShoppingBag, Settings, Menu, X, Sailboat as SailboatIcon, Wallet } from 'lucide-react';

const adminNav = [
  { href: '/admin', label: '控制台', icon: LayoutDashboard },
  { href: '/admin/diving', label: '深潜管理', icon: Anchor },
  { href: '/admin/islands', label: '岛屿&船只', icon: Sailboat },
  { href: '/admin/shows', label: '秀场管理', icon: Ticket },
  { href: '/admin/orders', label: '订单管理', icon: ShoppingBag },
  { href: '/admin/finance', label: '财务流水', icon: Wallet },
  { href: '/admin/settings', label: '系统设置', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-900 text-white flex-shrink-0">
        <div className="p-6 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-2">
            <SailboatIcon className="w-7 h-7 text-ocean-400" />
            <span className="text-xl font-bold">泰嗨了</span>
          </Link>
          <div className="text-xs text-gray-500 mt-1">后台管理系统</div>
        </div>
        <nav className="flex-1 py-4">
          {adminNav.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 mx-3 my-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-ocean-500 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white rounded-xl transition-colors text-sm mt-1">
            <SailboatIcon className="w-5 h-5" />
            返回首页
          </Link>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-gray-900 text-white">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <SailboatIcon className="w-7 h-7 text-ocean-400" />
                <span className="text-xl font-bold">泰嗨了</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <nav className="py-4">
              {adminNav.map(item => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 mx-3 my-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-ocean-500 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-gray-600">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-gray-900 hidden md:block">后台管理</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-ocean-500 transition-colors hidden sm:block"
            >
              返回前台
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
