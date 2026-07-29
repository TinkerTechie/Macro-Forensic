'use client';

import { usePathname } from 'next/navigation';
import { Bell, Search, Terminal } from 'lucide-react';

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
};

export function TopNav() {
  const pathname = usePathname();
  const matched = Object.entries(PAGE_LABELS).find(([k]) => pathname.startsWith(k));
  const meta = matched?.[1] ?? { title: 'MFAS', subtitle: 'Macro-Forensic Alert System' };

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

        {/* Avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#6366F1] text-[11px] font-bold text-white">
          AI
        </div>
      </div>
    </header>
  );
}
