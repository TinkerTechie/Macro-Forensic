'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Bell, Search, Terminal, LogOut } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

const PAGE_LABELS: Record<string, { title: string; subtitle: string }> = {
  '/dashboard':     { title: 'Dashboard',       subtitle: 'Platform overview & recent activity' },
  '/investigation': { title: 'Investigations',  subtitle: 'AI-powered forensic analysis' },
  '/documents':     { title: 'Documents',       subtitle: 'Indexed SEC filings & documents' },
  '/graph':         { title: 'Knowledge Graph', subtitle: 'Entity relationships & ownership chains' },
  '/agents':        { title: 'AI Agents',       subtitle: 'LangGraph multi-agent system' },
  '/alerts':        { title: 'Risk Alerts',     subtitle: 'Anomaly detection & risk signals' },
  '/reports':       { title: 'Reports',         subtitle: 'Generated forensic reports' },
  '/settings':      { title: 'Settings',        subtitle: 'Platform configuration' },
  '/upload':        { title: 'Upload Filing',   subtitle: 'Ingest SEC documents into the pipeline' },
  '/profile':       { title: 'Profile',         subtitle: 'Your account & session' },
};

interface User { full_name: string; email: string; organization: string; }

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const matched = Object.entries(PAGE_LABELS).find(([k]) => pathname.startsWith(k));
  const meta = matched?.[1] ?? { title: 'MFAS', subtitle: 'Macro-Forensic Alert System' };

  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('mfas_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AI';

  const handleLogout = () => {
    localStorage.removeItem('mfas_user');
    localStorage.removeItem('mfas_token');
    router.push('/');
  };

  return (
    <header className="fixed left-[220px] right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-[#1F1F23] bg-[#09090B]/80 px-6 backdrop-blur-sm">
      <div className="flex flex-col">
        <h1 className="text-sm font-semibold text-[#FAFAFA]">{meta.title}</h1>
        <p className="text-[11px] text-[#52525B]">{meta.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Command hint */}
        <div className="hidden items-center gap-1.5 rounded-lg border border-[#1F1F23] bg-[#111113] px-3 py-1.5 text-[11px] text-[#52525B] lg:flex">
          <Terminal className="h-3 w-3" />
          <span>⌘K to search</span>
        </div>

        {/* Search */}
        <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1F1F23] bg-[#111113] text-[#52525B] transition-colors hover:border-[#3B82F6]/40 hover:text-[#3B82F6]">
          <Search className="h-3.5 w-3.5" />
        </button>

        {/* Alerts */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[#1F1F23] bg-[#111113] text-[#52525B] transition-colors hover:border-amber-500/40 hover:text-amber-400">
          <Bell className="h-3.5 w-3.5" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
        </button>

        {/* Avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-rose-600 text-[11px] font-black text-white shadow-md shadow-amber-500/20 hover:scale-110 transition-transform"
            title={user ? `${user.full_name} · ${user.email}` : 'Account'}
          >
            {initials}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 w-56 bg-[#111113] border border-[#1F1F23] rounded-2xl shadow-2xl overflow-hidden z-50">
              {/* User info header */}
              <div className="px-4 py-3 border-b border-[#1F1F23]">
                <p className="text-xs font-bold text-[#FAFAFA] truncate">{user?.full_name ?? 'User'}</p>
                <p className="text-[11px] text-[#52525B] truncate">{user?.email ?? ''}</p>
                {user?.organization && (
                  <p className="text-[10px] text-[#3F3F46] truncate mt-0.5">{user.organization}</p>
                )}
              </div>

              {/* Menu items */}
              <div className="py-1">
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-white/5 transition-colors"
                >
                  <span className="w-3.5 h-3.5">👤</span>
                  View Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-white/5 transition-colors"
                >
                  <span className="w-3.5 h-3.5">⚙️</span>
                  Settings
                </Link>
              </div>

              <div className="py-1 border-t border-[#1F1F23]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
