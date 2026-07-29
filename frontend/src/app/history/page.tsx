'use client';

import { useEffect, useState } from 'react';
import { getInvestigations, InvestigationHistoryItem } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Clock, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatDate, riskBg, riskLabel } from '@/lib/utils';
import type { RiskLevel } from '@/types';

function riskIcon(level: RiskLevel) {
  switch (level) {
    case 'high':   return <AlertTriangle className="h-4 w-4 text-red-400" />;
    case 'medium': return <AlertCircle className="h-4 w-4 text-amber-400" />;
    default:       return <CheckCircle2 className="h-4 w-4 text-green-400" />;
  }
}

export default function HistoryPage() {
  const [items, setItems] = useState<InvestigationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await getInvestigations();
        setItems(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load history');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = items.filter(item => item.query.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#FAFAFA]">Investigation History</h2>
          <p className="mt-1 text-sm text-[#52525B]">Past queries and forensic results.</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#52525B]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search history…"
            className="w-full rounded-lg border border-[#1F1F23] bg-[#111113] pl-9 pr-4 py-2 text-sm text-[#FAFAFA] placeholder:text-[#52525B] focus:outline-none focus:border-[#3B82F6]/50"
          />
        </div>
      </div>

      {loading && <p className="text-sm text-[#52525B]">Loading history...</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className="text-sm text-[#52525B]">No history found.</p>
      )}

      <div className="space-y-3">
        {filtered.map(item => (
          <Card key={item.id} className="hover:border-[#3B82F6]/20 transition-colors cursor-pointer group">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm font-semibold text-[#FAFAFA] truncate group-hover:text-[#3B82F6] transition-colors">
                  {item.query}
                </p>
                <div className="flex items-center gap-4 mt-2 text-[11px] text-[#52525B]">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(item.created_at)}
                  </span>
                  <span>ID: {item.id}</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="flex items-center justify-end gap-2 mb-1">
                  <span className="text-[11px] text-[#52525B]">Risk</span>
                  <Badge variant="risk" risk={item.risk_level as RiskLevel}>{riskLabel(item.risk_level as RiskLevel)}</Badge>
                </div>
                <div className="text-[11px] text-[#52525B]">
                  Confidence: <span className="font-mono text-[#FAFAFA]">{Math.round(item.confidence * 100)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
