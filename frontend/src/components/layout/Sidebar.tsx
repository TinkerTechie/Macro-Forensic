'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Search, FileText, GitFork, Bot,
  Bell, BookOpen, Settings, Activity, Database, Cpu,
  Zap, User, Network, GitCompare,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard',     label: 'Dashboard',       icon: LayoutDashboard },
  { href: '/workspace',     label: 'Workspace',       icon: Search },
  { href: '/investigation', label: 'Investigations',  icon: Search },
  { href: '/documents',     label: 'Documents',       icon: FileText },
  { href: '/explore',       label: 'Knowledge Explorer', icon: GitFork },
  { href: '/compare',       label: 'Compare Reports', icon: GitCompare },
  { href: '/graph',         label: 'Legacy Graph',    icon: GitFork },
  { href: '/agents',        label: 'AI Agents',       icon: Bot },
  { href: '/alerts',        label: 'Alerts',          icon: Bell },
  { href: '/reports',       label: 'Reports',         icon: BookOpen },
  { href: '/profile',       label: 'Profile',         icon: User },
  { href: '/settings',      label: 'Settings',        icon: Settings },
] as const;

const STATUS_ITEMS = [
  { label: 'Neo4j',  icon: Database, color: '#22C55E' },
  { label: 'Qdrant', icon: Activity, color: '#22C55E' },
  { label: 'LLM',    icon: Cpu,      color: '#22C55E' },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[220px] flex-col border-r border-[#1F1F23] bg-[#09090B]">

      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b border-[#1F1F23] px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 shadow-md shadow-amber-500/20">
          <Network className="h-4 w-4 text-white" />
        </div>
        <div>
          <span className="text-sm font-black tracking-tight text-[#FAFAFA]">
            Macro<span className="text-amber-400">Forensic</span>
          </span>
          <p className="text-[9px] uppercase tracking-widest text-[#3F3F46] leading-none mt-0.5">Alert System</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="px-2 pb-2 text-[9px] font-bold uppercase tracking-widest text-[#2A2A2D]">
          Navigation
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150',
                active
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-[#52525B] hover:bg-[#111113] hover:text-[#A1A1AA] border border-transparent'
              )}
            >
              <Icon className={cn(
                'h-4 w-4 shrink-0 transition-colors',
                active ? 'text-amber-400' : 'text-[#3F3F46] group-hover:text-[#71717A]'
              )} />
              <span className="font-medium text-xs">{label}</span>
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Status indicators */}
      <div className="border-t border-[#1F1F23] px-4 py-4">
        <p className="pb-2.5 text-[9px] font-bold uppercase tracking-widest text-[#2A2A2D]">
          System Status
        </p>
        <div className="space-y-2">
          {STATUS_ITEMS.map(({ label, icon: Icon, color }) => (
            <div key={label} className="flex items-center gap-2.5">
              <div className="relative flex h-4 w-4 items-center justify-center">
                <span className="absolute h-2 w-2 rounded-full animate-ping opacity-40" style={{ backgroundColor: color }} />
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              </div>
              <Icon className="h-3 w-3 text-[#3F3F46]" />
              <span className="text-xs text-[#52525B]">{label}</span>
              <span className="ml-auto text-[10px] font-semibold" style={{ color }}>
                OK
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
