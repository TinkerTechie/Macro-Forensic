'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FileText, Building2, GitFork, Share2, AlertTriangle,
  Search, Upload, TrendingUp, Clock, ArrowRight, BarChart3,
  Activity, Zap, Shield, ChevronUp,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────── */
type RiskLevel = 'high' | 'medium' | 'low';

interface Stat {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  change: string;
  up: boolean;
}

const STATS: Stat[] = [
  { label: 'Documents Indexed', value: 42, icon: FileText, color: '#F59E0B', change: '+3 today', up: true },
  { label: 'Companies Tracked', value: 318, icon: Building2, color: '#A78BFA', change: '+12 week', up: true },
  { label: 'Graph Nodes', value: 8590, icon: GitFork, color: '#34D399', change: '+240 today', up: true },
  { label: 'Relationships', value: 22340, icon: Share2, color: '#60A5FA', change: '+1.2k week', up: true },
  { label: 'Risk Alerts', value: 17, icon: AlertTriangle, color: '#F87171', change: '3 critical', up: false },
  { label: 'Queries Run', value: 204, icon: Activity, color: '#FBBF24', change: '+28 today', up: true },
];

const INVESTIGATIONS = [
  { id: '1', query: 'Apple debt exposure through subsidiaries', risk: 'high' as RiskLevel, time: '2 min ago', company: 'Apple Inc.' },
  { id: '2', query: 'Northgate Capital ownership structure', risk: 'medium' as RiskLevel, time: '18 min ago', company: 'Northgate Capital' },
  { id: '3', query: 'Companies guaranteeing debt obligations', risk: 'high' as RiskLevel, time: '1 hr ago', company: 'Multi-entity' },
  { id: '4', query: 'Contagion paths in financial network', risk: 'medium' as RiskLevel, time: '3 hr ago', company: 'Cross-sector' },
  { id: '5', query: 'Hidden liabilities in Q2 10-Q filings', risk: 'low' as RiskLevel, time: '1 day ago', company: 'Various' },
];

const QUICK_ACTIONS = [
  { label: 'Upload Filing', icon: Upload, href: '/upload', color: '#F59E0B', desc: 'Ingest a new SEC document' },
  { label: 'Investigate', icon: Search, href: '/investigation', color: '#A78BFA', desc: 'Run AI forensic query' },
  { label: 'Knowledge Graph', icon: GitFork, href: '/graph', color: '#34D399', desc: 'Explore entity graph' },
];

const RISK_STYLES: Record<string, string> = {
  HIGH: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  CRITICAL: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  UNKNOWN: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

function formatNum(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

const fade = { hidden: { opacity: 0, y: 14 }, show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }) };

export default function DashboardPage() {
  const [user, setUser] = useState<{ full_name: string } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [stats, setStats] = useState<any>({ documents_indexed: 0, companies_tracked: 0, graph_nodes: 0, relationships: 0, risk_alerts: 0, queries_run: 0 });
  const [investigations, setInvestigations] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const u = localStorage.getItem('mfas_user');
    if (u) setUser(JSON.parse(u));
    
    // Fetch stats
    fetch('http://localhost:8000/api/dashboard/stats').then(r => r.json()).then(data => setStats(data)).catch(console.error);
    fetch('http://localhost:8000/api/investigations?limit=5').then(r => r.json()).then(data => setInvestigations(data)).catch(console.error);
    fetch('http://localhost:8000/api/alerts?limit=5').then(r => r.json()).then(data => setAlerts(data)).catch(console.error);

    setTimeout(() => setLoaded(true), 400);
  }, []);

  const firstName = user?.full_name?.split(' ')[0] ?? 'Analyst';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const DYNAMIC_STATS: Stat[] = [
    { label: 'Documents Indexed', value: stats.documents_indexed, icon: FileText, color: '#F59E0B', change: 'Total ingested', up: true },
    { label: 'Companies Tracked', value: stats.companies_tracked, icon: Building2, color: '#A78BFA', change: 'Entities', up: true },
    { label: 'Graph Nodes', value: stats.graph_nodes, icon: GitFork, color: '#34D399', change: 'Entities', up: true },
    { label: 'Relationships', value: stats.relationships, icon: Share2, color: '#60A5FA', change: 'Edges', up: true },
    { label: 'Risk Alerts', value: stats.risk_alerts, icon: AlertTriangle, color: '#F87171', change: 'High risk', up: false },
    { label: 'Queries Run', value: stats.queries_run, icon: Activity, color: '#FBBF24', change: 'Investigations', up: true },
  ];

  return (
    <div className="p-6 space-y-7">

      {/* ── Hero ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-[#1F1F23] bg-gradient-to-br from-[#111113] to-[#09090B] p-8"
        style={{ backgroundImage: 'linear-gradient(to right, rgba(245,158,11,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(245,158,11,0.04) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      >
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 right-32 w-40 h-40 bg-rose-500/6 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Live Platform</span>
            </div>
            <h2 className="text-3xl font-black text-[#FAFAFA] tracking-tight leading-tight">
              {greeting}, {firstName} 👋
            </h2>
            <p className="mt-2 max-w-lg text-sm text-[#71717A] leading-relaxed">
              Your AI forensic workspace. Upload SEC filings, run multi-agent investigations, and surface hidden financial risks in seconds.
            </p>
          </div>

          <div className="flex gap-3 flex-shrink-0">
            <Link href="/investigation" className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 hover:scale-105 transition-all">
              <Search className="h-4 w-4" /> Investigate
            </Link>
            <Link href="/upload" className="flex items-center gap-2 px-5 py-2.5 border border-[#1F1F23] bg-[#111113] text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-[#3F3F46] font-semibold text-sm rounded-xl transition-all">
              <Upload className="h-4 w-4" /> Upload
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {DYNAMIC_STATS.map((s, i) => (
          <motion.div key={s.label} custom={i} variants={fade} initial="hidden" animate={loaded ? 'show' : 'hidden'}>
            <div className="group relative overflow-hidden bg-[#111113] border border-[#1F1F23] rounded-2xl p-5 hover:border-[#2A2A2E] transition-all">
              <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500" style={{ background: s.color }} />
              <div className="mb-3 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}18` }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <p className="text-2xl font-black text-[#FAFAFA]">{formatNum(s.value)}</p>
              <p className="text-[10px] text-[#52525B] mt-0.5 leading-tight">{s.label}</p>
              <div className={`mt-2 flex items-center gap-1 text-[10px] font-semibold ${s.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                {s.change}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Quick Actions + Recent Investigations ─────────── */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* System Alerts */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <div className="bg-[#111113] border border-[#1F1F23] rounded-2xl p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <h3 className="text-xs font-bold text-[#52525B] uppercase tracking-widest">System Alerts</h3>
              </div>
              <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-1.5 py-0.5 rounded-sm text-xs font-mono">
                {alerts.length} NEW
              </span>
            </div>
            
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="text-xs text-zinc-500">No recent alerts.</div>
              ) : alerts.map(alert => (
                <div key={alert.id} className="rounded-xl border border-[#1F1F23] bg-[#09090B] p-3 hover:border-[#2A2A2E] transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${RISK_STYLES[alert.risk_level] || RISK_STYLES.HIGH}`}>
                      {alert.risk_level}
                    </span>
                    <span className="text-[9px] text-zinc-600 font-mono">{new Date(alert.created_at).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-xs text-[#FAFAFA] font-medium mb-1 truncate">{alert.company}</div>
                  <div className="text-[10px] text-[#A1A1AA] line-clamp-2">{alert.description}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Investigations */}
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
          <div className="bg-[#111113] border border-[#1F1F23] rounded-2xl p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#52525B]" />
                <h3 className="text-xs font-bold text-[#52525B] uppercase tracking-widest">Recent Investigations</h3>
              </div>
              <Link href="/investigation" className="text-[11px] text-amber-400 hover:underline font-semibold">
                New →
              </Link>
            </div>
            <div className="space-y-2">
              {investigations.length === 0 ? (
                <div className="text-xs text-zinc-500">No recent investigations.</div>
              ) : investigations.map(inv => (
                <Link key={inv.id} href={`/reports/${inv.id}`}
                  className="flex items-center gap-3 rounded-xl border border-[#1F1F23] bg-[#09090B] p-3 hover:border-[#2A2A2E] transition-colors cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#1F1F23] flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-3.5 h-3.5 text-[#52525B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#FAFAFA] truncate group-hover:text-white">{inv.query}</p>
                    <p className="text-[10px] text-[#52525B]">{new Date(inv.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-lg border uppercase flex-shrink-0 ${RISK_STYLES[inv.risk_level] || RISK_STYLES.UNKNOWN}`}>
                    {inv.risk_level}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

      </div>

      {/* ── System Status Bar ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-6 bg-[#111113] border border-[#1F1F23] rounded-2xl px-6 py-4"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-[#52525B]" />
          <span className="text-[11px] text-[#52525B] font-semibold uppercase tracking-widest">System Status</span>
        </div>
        {[
          { label: 'API', ok: true },
          { label: 'Neo4j', ok: true },
          { label: 'Qdrant', ok: true },
          { label: 'LangGraph', ok: true },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${s.ok ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse`} />
            <span className={`text-[11px] font-medium ${s.ok ? 'text-emerald-400' : 'text-rose-400'}`}>{s.label}</span>
          </div>
        ))}
        <div className="ml-auto text-[10px] text-[#3F3F46]">All systems operational</div>
      </motion.div>

    </div>
  );
}
