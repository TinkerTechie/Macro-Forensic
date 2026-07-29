'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, CheckCircle2, Filter, Search, Building2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Alert, RiskLevel } from '@/types';
import { riskBg, riskLabel, formatDate } from '@/lib/utils';

const MOCK_ALERTS: Alert[] = [
  { id:'1', title:'Cross-entity debt guarantee detected', description:'Apple Inc. guarantees $18.5B in AOI/AOE obligations. Cross-default clause creates systemic exposure.', risk_level:'high', company:'Apple Inc.', exposure:18_500_000_000, created_at:'2024-01-15T09:12:00Z', acknowledged:false },
  { id:'2', title:'Off-balance-sheet commitment spike', description:'Northgate Capital has $2.1B in undisclosed operating lease commitments not reflected in headline leverage ratios.', risk_level:'high', company:'Northgate Capital', exposure:2_100_000_000, created_at:'2024-01-14T14:30:00Z', acknowledged:false },
  { id:'3', title:'Contagion path identified', description:'Three-hop ownership chain from offshore SPV to regulated entity creates potential regulatory arbitrage.', risk_level:'medium', company:'Multi-entity', exposure:450_000_000, created_at:'2024-01-13T11:00:00Z', acknowledged:false },
  { id:'4', title:'Debt maturity wall — Q1 2025', description:'$8.2B of term debt matures within 90 days with limited refinancing disclosures in the filing.', risk_level:'medium', company:'Tech Holdings LLC', exposure:8_200_000_000, created_at:'2024-01-12T08:00:00Z', acknowledged:true },
  { id:'5', title:'Related-party transaction anomaly', description:'Undisclosed related-party loans totalling $120M identified in footnote disclosures.', risk_level:'low', company:'Horizon Capital', exposure:120_000_000, created_at:'2024-01-11T17:45:00Z', acknowledged:true },
];

function formatExposure(n?: number) {
  if (!n) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

function riskIcon(level: RiskLevel) {
  switch (level) {
    case 'high':   return <AlertTriangle className="h-4 w-4 text-red-400" />;
    case 'medium': return <AlertCircle className="h-4 w-4 text-amber-400" />;
    default:       return <CheckCircle2 className="h-4 w-4 text-green-400" />;
  }
}

export default function AlertsPage() {
  const [filter, setFilter] = useState<'all' | RiskLevel>('all');
  const [search, setSearch] = useState('');

  const filtered = MOCK_ALERTS.filter(a => {
    const matchRisk = filter === 'all' || a.risk_level === filter;
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.company.toLowerCase().includes(search.toLowerCase());
    return matchRisk && matchSearch;
  });

  const counts = {
    high:   MOCK_ALERTS.filter(a => a.risk_level === 'high').length,
    medium: MOCK_ALERTS.filter(a => a.risk_level === 'medium').length,
    low:    MOCK_ALERTS.filter(a => a.risk_level === 'low').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        {(['high','medium','low'] as RiskLevel[]).map(level => (
          <button
            key={level}
            onClick={() => setFilter(f => f === level ? 'all' : level)}
            className={`rounded-xl border p-4 text-left transition-all ${
              filter === level ? riskBg(level) : 'border-[#1F1F23] bg-[#111113] hover:border-[#3B82F6]/20'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">{riskIcon(level)}<span className="text-[11px] uppercase tracking-widest text-[#52525B]">{level}</span></div>
            <p className="text-2xl font-bold text-[#FAFAFA]">{counts[level]}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#52525B]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search alerts…"
            className="w-full rounded-lg border border-[#1F1F23] bg-[#111113] pl-9 pr-4 py-2 text-sm text-[#FAFAFA] placeholder:text-[#52525B] focus:outline-none focus:border-[#3B82F6]/50"
          />
        </div>
        <Button variant="ghost" size="sm">
          <Filter className="h-3.5 w-3.5" /> Filters
        </Button>
      </div>

      {/* Timeline */}
      <div className="relative space-y-3">
        <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-[#1F1F23] via-[#1F1F23] to-transparent" />
        {filtered.map((alert, i) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="relative pl-12"
          >
            {/* Timeline dot */}
            <div className={`absolute left-3.5 top-5 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-[#09090B] ${
              alert.risk_level === 'high' ? 'bg-red-500' :
              alert.risk_level === 'medium' ? 'bg-amber-500' : 'bg-green-500'
            }`} />
            <Card className={`transition-all hover:border-[#3B82F6]/20 ${alert.acknowledged ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badge variant="risk" risk={alert.risk_level}>{riskLabel(alert.risk_level)}</Badge>
                      {alert.acknowledged && <Badge variant="default">ACKNOWLEDGED</Badge>}
                    </div>
                    <h3 className="text-sm font-semibold text-[#FAFAFA] mb-1">{alert.title}</h3>
                    <p className="text-xs text-[#71717A] leading-relaxed">{alert.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-[11px] text-[#52525B]">
                      <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{alert.company}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(alert.created_at)}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-[#52525B]">Exposure</p>
                    <p className="text-sm font-bold font-mono text-[#FAFAFA]">{formatExposure(alert.exposure)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
