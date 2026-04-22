'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Boat, MessageCircle } from 'lucide-react';

const navItems = [
  { label: '首页', href: '/' },
  { label: '定制旅行', href: '/custom-trip' },
  { label: '深潜', href: '/diving' },
  { label: '跳岛游', href: '/island-tour' },
  { label: '秀场', href: '/show' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Boat className="w-8 h-8 text-ocean-500" />
            <span className="text-xl font-bold text-gray-900">泰嗨了</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
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

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-3 text-gray-700 hover:text-ocean-600 font-medium"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="#contact"
              className="flex items-center gap-2 mt-4 px-4 py-3 bg-ocean-500 text-white rounded-lg font-medium"
              onClick={() => setIsOpen(false)}
            >
              <MessageCircle className="w-4 h-4" />
              联系客服
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
