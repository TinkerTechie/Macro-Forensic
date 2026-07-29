'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FileText, Building2, CreditCard, GitFork,
  Share2, AlertTriangle, Search, Upload,
  TrendingUp, Clock, ArrowRight, BarChart3,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { PlatformStats, RiskLevel } from '@/types';
import { formatNumber, riskBg } from '@/lib/utils';

const MOCK_STATS: PlatformStats = {
  documents_indexed: 42,
  companies: 318,
  debt_obligations: 1_240,
  graph_nodes: 8_590,
  graph_relationships: 22_340,
  risk_alerts: 17,
};

const RECENT_INVESTIGATIONS = [
  { id: '1', query: 'Apple debt exposure through subsidiaries', risk: 'high' as RiskLevel, time: '2 min ago', company: 'Apple Inc.' },
  { id: '2', query: 'Northgate Capital ownership structure', risk: 'medium' as RiskLevel, time: '18 min ago', company: 'Northgate Capital' },
  { id: '3', query: 'Which companies guarantee debt obligations?', risk: 'high' as RiskLevel, time: '1 hr ago', company: 'Multi-entity' },
  { id: '4', query: 'Contagion paths in financial network', risk: 'medium' as RiskLevel, time: '3 hr ago', company: 'Cross-sector' },
  { id: '5', query: 'Hidden liabilities in Q2 10-Q filings', risk: 'low' as RiskLevel, time: '1 day ago', company: 'Various' },
];

const QUICK_ACTIONS = [
  { label: 'Upload Filing', icon: Upload, href: '/upload', accent: '#3B82F6', desc: 'Ingest a new SEC document' },
  { label: 'Investigate',   icon: Search,  href: '/investigation', accent: '#6366F1', desc: 'Run AI forensic query' },
  { label: 'View Graph',    icon: GitFork, href: '/graph', accent: '#22C55E', desc: 'Explore knowledge graph' },
  { label: 'Risk Alerts',   icon: AlertTriangle, href: '/alerts', accent: '#F59E0B', desc: 'Review open alerts' },
];

const STAT_CARDS = [
  { key: 'documents_indexed',  label: 'Documents Indexed',  icon: FileText,      color: '#3B82F6' },
  { key: 'companies',          label: 'Companies',           icon: Building2,     color: '#6366F1' },
  { key: 'debt_obligations',   label: 'Debt Obligations',    icon: CreditCard,    color: '#F59E0B' },
  { key: 'graph_nodes',        label: 'Graph Nodes',         icon: GitFork,       color: '#22C55E' },
  { key: 'graph_relationships',label: 'Relationships',       icon: Share2,        color: '#8B5CF6' },
  { key: 'risk_alerts',        label: 'Risk Alerts',         icon: AlertTriangle, color: '#EF4444' },
] as const;

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.06 } } },
  item: { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } } },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch with mock data
    const t = setTimeout(() => { setStats(MOCK_STATS); setLoading(false); }, 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="p-6 space-y-8">

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl border border-[#1F1F23] bg-gradient-to-br from-[#111113] via-[#0d0d10] to-[#09090B] p-8 grid-pattern"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#3B82F6]/5 via-transparent to-[#6366F1]/5" />
        <div className="relative">
          <Badge variant="outline" className="mb-4">Live Platform</Badge>
          <h2 className="text-3xl font-bold tracking-tight text-[#FAFAFA]">
            Macro-Forensic<br />
            <span className="gradient-text-blue">Alert System</span>
          </h2>
          <p className="mt-3 max-w-xl text-sm text-[#71717A] leading-relaxed">
            Enterprise AI platform for SEC filing investigation. Combines Knowledge Graph reasoning,
            temporal RAG retrieval, and multi-agent forensic analysis to surface hidden financial risks.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/investigation"
              className="inline-flex items-center gap-2 rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-[#2563EB] transition-colors"
            >
              <Search className="h-4 w-4" /> Start Investigation
            </Link>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-lg border border-[#1F1F23] bg-[#111113] px-4 py-2 text-sm font-semibold text-[#A1A1AA] hover:bg-[#1F1F23] hover:text-[#FAFAFA] transition-colors"
            >
              <Upload className="h-4 w-4" /> Upload Filing
            </Link>
          </div>
        </div>
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#3B82F6]/8 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 right-40 h-40 w-40 rounded-full bg-[#6366F1]/8 blur-3xl" />
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={stagger.container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6"
      >
        {STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
          <motion.div key={key} variants={stagger.item}>
            <Card className="group relative overflow-hidden hover:border-[#3B82F6]/30 transition-colors duration-300">
              <CardContent className="p-5">
                <div
                  className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: `${color}18` }}
                >
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                {loading ? (
                  <Skeleton className="h-7 w-16 mb-1.5" />
                ) : (
                  <p className="text-2xl font-bold text-[#FAFAFA]">
                    {formatNumber(stats![key as keyof PlatformStats] as number)}
                  </p>
                )}
                <p className="text-[11px] text-[#52525B] mt-0.5">{label}</p>
              </CardContent>
              <div
                className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500"
                style={{ background: color }}
              />
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions + Recent Investigations */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5" /> Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {QUICK_ACTIONS.map(({ label, icon: Icon, href, accent, desc }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-3 rounded-lg border border-[#1F1F23] bg-[#09090B] p-3 transition-all duration-200 hover:border-[#3B82F6]/30 hover:bg-[#111113]"
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${accent}18` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: accent }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#FAFAFA]">{label}</p>
                    <p className="text-[11px] text-[#52525B]">{desc}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-[#3F3F46] transition-transform group-hover:translate-x-0.5 group-hover:text-[#3B82F6]" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Investigations */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" /> Recent Investigations
                </CardTitle>
                <Link
                  href="/investigation"
                  className="text-[11px] text-[#3B82F6] hover:underline"
                >
                  New investigation →
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {RECENT_INVESTIGATIONS.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-start gap-3 rounded-lg border border-[#1F1F23] bg-[#09090B] p-3 hover:border-[#3B82F6]/20 transition-colors cursor-pointer"
                >
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#1F1F23]">
                    <BarChart3 className="h-3 w-3 text-[#52525B]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-[#FAFAFA]">{inv.query}</p>
                    <p className="mt-0.5 text-[11px] text-[#52525B]">
                      {inv.company} · {inv.time}
                    </p>
                  </div>
                  <Badge variant="risk" risk={inv.risk}>
                    {inv.risk}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
