'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Home, Sailboat, Anchor, Ticket, MessageCircle } from 'lucide-react';

const navItems = [
  { label: '首页', href: '/', icon: Home },
  { label: '定制旅行', href: '/custom-trip', icon: MessageCircle },
  { label: '深潜', href: '/diving', icon: Anchor },
  { label: '跳岛游', href: '/island-tour', icon: Sailboat },
  { label: '秀场', href: '/show', icon: Ticket },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

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
              <Link
                href="#contact"
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
          <button
            className="p-2 text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
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
              <div className="border-t my-2" />
              <Link
                href="#contact"
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
        </div>
      </nav>
    </>
  );
}
