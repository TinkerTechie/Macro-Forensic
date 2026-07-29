'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Printer, ChevronDown, ChevronUp, Copy, CheckCircle, Clock, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { riskBg, riskLabel, formatDate } from '@/lib/utils';
import { useClipboard } from '@/hooks/useClipboard';
import type { RiskLevel } from '@/types';

const MOCK_REPORTS = [
  {
    id: '1',
    title: 'Apple Inc. — Subsidiary Debt Exposure Analysis',
    company: 'Apple Inc.',
    risk_level: 'high' as RiskLevel,
    created_at: '2024-01-15T09:12:00Z',
    summary: 'Apple Inc. maintains significant debt exposure through wholly-owned subsidiaries AOI and AOE, with $18.5B in cross-guaranteed obligations creating systemic contagion risk.',
    sections: [
      { title: 'Executive Summary', content: 'Apple Inc. maintains $111.1B in total debt. Cross-entity guarantees through Apple Operations International (AOI) and Apple Operations Europe (AOE) create systemic exposure. The guarantee structure means parent-level stress events cascade to subsidiary debt and vice versa.' },
      { title: 'Graph Findings', content: 'Neo4j analysis revealed a 3-node ownership chain: Apple Inc. → AOI → Term Loan B ($6.5B). Guarantee relationships found on 4 debt instruments totalling $18.5B. Two commercial paper programs with rolling maturities flagged as refinancing risk.' },
      { title: 'Supporting Evidence', content: 'Chunk #142 (similarity: 0.94): "Apple Operations International Limited...is a wholly-owned subsidiary...all indebtedness of AOI is guaranteed by Apple Inc." | Chunk #187 (similarity: 0.88): "$111.1 billion in total term debt outstanding..."' },
      { title: 'Risk Narrative', content: 'HIGH RISK. Cross-guarantee obligations totalling $18.5B across AOI and AOE. Commercial paper programs with rolling maturities. Offshore holding structures in low-disclosure jurisdictions. Recommend regulatory review and monitoring of Q1–Q2 2024 debt maturities.' },
    ],
  },
];

function ReportSection({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-[#1F1F23] last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-[#1F1F23]/30 transition-colors"
      >
        <span className="text-sm font-semibold text-[#FAFAFA]">{title}</span>
        {open ? <ChevronUp className="h-4 w-4 text-[#52525B]" /> : <ChevronDown className="h-4 w-4 text-[#52525B]" />}
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-sm leading-relaxed text-[#A1A1AA]">{content}</p>
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  const [selected, setSelected] = useState(MOCK_REPORTS[0]);
  const { copied, copy } = useClipboard();

  return (
    <div className="flex h-[calc(100vh-84px)] overflow-hidden">
      {/* Report list sidebar */}
      <div className="w-80 shrink-0 overflow-y-auto border-r border-[#1F1F23] bg-[#09090B] p-4 space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-[#3F3F46] pb-2">Saved Reports</p>
        {MOCK_REPORTS.map(r => (
          <button
            key={r.id}
            onClick={() => setSelected(r)}
            className={`w-full rounded-xl border p-3 text-left transition-all ${
              selected.id === r.id
                ? 'border-[#3B82F6]/30 bg-[#3B82F6]/5'
                : 'border-[#1F1F23] bg-[#111113] hover:border-[#3B82F6]/20'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <FileText className="h-4 w-4 mt-0.5 text-[#52525B] shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#FAFAFA] line-clamp-2 leading-tight mb-1">{r.title}</p>
                <div className="flex items-center gap-1.5">
                  <Badge variant="risk" risk={r.risk_level}>{r.risk_level}</Badge>
                </div>
                <p className="mt-1.5 text-[10px] text-[#52525B]">{formatDate(r.created_at)}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Report viewer */}
      <div className="flex-1 overflow-y-auto">
        <motion.div
          key={selected.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 space-y-4"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="risk" risk={selected.risk_level}>{riskLabel(selected.risk_level)}</Badge>
                <Badge variant="default">FORENSIC REPORT</Badge>
              </div>
              <h2 className="text-xl font-bold text-[#FAFAFA]">{selected.title}</h2>
              <div className="flex items-center gap-4 mt-1.5 text-[11px] text-[#52525B]">
                <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{selected.company}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(selected.created_at)}</span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => copy(selected.sections.map(s => `## ${s.title}\n${s.content}`).join('\n\n'))}>
                {copied ? <CheckCircle className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-3.5 w-3.5" /> PDF
              </Button>
              <Button variant="ghost" size="sm">
                <Printer className="h-3.5 w-3.5" /> Print
              </Button>
            </div>
          </div>

          {/* Summary card */}
          <Card glow>
            <CardContent className="p-5">
              <p className="text-[11px] uppercase tracking-widest text-[#3F3F46] mb-2">Executive Summary</p>
              <p className="text-sm leading-relaxed text-[#A1A1AA]">{selected.summary}</p>
            </CardContent>
          </Card>

          {/* Sections */}
          <Card>
            {selected.sections.map(s => (
              <ReportSection key={s.title} title={s.title} content={s.content} />
            ))}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
