'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';
import { StatusBar } from '@/components/layout/StatusBar';

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/showcase'];

export function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <TopNav />
      <main className="ml-[220px] mt-14 mb-7 min-h-[calc(100vh-84px)] overflow-x-hidden">
        {children}
      </main>
      <StatusBar />
    </>
  );
}
