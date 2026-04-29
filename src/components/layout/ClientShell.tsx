'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    // 後台頁面：不顯示客戶端 Navbar / Footer
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-32 md:pb-0">{children}</main>
      <Footer />
    </>
  );
}
