'use client';

import Link from 'next/link';
import { Sailboat, MessageCircle, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

const footerLinks = {
  服务: [
    { label: '定制旅行', href: '/custom-trip' },
    { label: '深潜体验', href: '/diving' },
    { label: '跳岛一日游', href: '/island-tour' },
    { label: '秀场表演', href: '/show' },
  ],
  岛屿: [
    { label: '皇帝岛', href: '/island-tour/racha' },
    { label: '皮皮岛', href: '/island-tour/pp' },
    { label: '斯米兰', href: '/island-tour/similan' },
  ],
};

export function Footer() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchSettings = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['whatsapp', 'email', 'whatsapp_visible', 'email_visible']);

      if (data) {
        const map: Record<string, string> = {};
        data.forEach((item: any) => { map[item.key] = item.value || ''; });
        setSettings(map);
      }
    };
    fetchSettings();
  }, []);

  const whatsapp = settings['whatsapp'] || '';
  const email = settings['email'] || '';
  const showWhatsapp = settings['whatsapp_visible'] !== 'false';
  const showEmail = settings['email_visible'] !== 'false';

  return (
    <footer className="bg-gray-900 text-gray-300 hidden md:block">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Sailboat className="w-8 h-8 text-ocean-400" />
              <span className="text-2xl font-bold text-white">泰嗨了</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              专业普吉旅行服务，提供高端定制旅行、深潜考证、跳岛一日游、秀场表演预订。让你轻松玩转普吉！
            </p>
            <div className="space-y-2">
              {showWhatsapp && whatsapp && (
                <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} className="flex items-center gap-2 text-gray-400 hover:text-ocean-400 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp: {whatsapp}
                </a>
              )}
              {showEmail && email && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Mail className="w-4 h-4" />
                  {email}
                </div>
              )}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-ocean-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} 泰嗨了普吉旅行. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
