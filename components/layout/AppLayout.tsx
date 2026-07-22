'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AUTH_PAGES = ['/login', '/signup', '/auth'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user,    setUser]    = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem('ms_user');
      setUser(s ? JSON.parse(s) : null);
    } catch { setUser(null); }
    setMounted(true);
  }, [pathname]);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  useEffect(() => {
    if (!mounted) return;
    if (!user && !AUTH_PAGES.some(p => pathname.startsWith(p))) {
      router.replace('/login');
    }
  }, [mounted, user, pathname, router]);

  // Auth pages — ALWAYS render immediately, no waiting
  if (AUTH_PAGES.some(p => pathname.startsWith(p))) {
    return <>{children}</>;
  }

  // Protected pages — wait for mount + user check
  if (!mounted || !user) return null;

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content" role="main">
        <Topbar onMenuClick={() => setSidebarOpen(p => !p)} />
        <main style={{ padding: 22, minHeight: 'calc(100vh - 60px)' }}>
          {children}
        </main>
      </div>
    </>
  );
}