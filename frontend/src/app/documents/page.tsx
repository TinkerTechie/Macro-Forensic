'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, ChevronRight, File, Clock, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const MOCK_DOCS = [
  { id:'1', name:'apple_10k_2023.pdf', company:'Apple Inc.', type:'10-K', pages:84, chunks:1240, nodes:312, indexed_at:'2024-01-10T09:00:00Z' },
  { id:'2', name:'apple_10k_2022.pdf', company:'Apple Inc.', type:'10-K', pages:76, chunks:1100, nodes:284, indexed_at:'2024-01-10T10:30:00Z' },
  { id:'3', name:'northgate_10q_q3.pdf', company:'Northgate Capital', type:'10-Q', pages:32, chunks:440, nodes:98, indexed_at:'2024-01-12T14:00:00Z' },
  { id:'4', name:'techhold_10k_2023.pdf', company:'Tech Holdings LLC', type:'10-K', pages:60, chunks:820, nodes:175, indexed_at:'2024-01-13T08:45:00Z' },
  { id:'5', name:'horizon_10q_q2.pdf', company:'Horizon Capital', type:'10-Q', pages:28, chunks:380, nodes:72, indexed_at:'2024-01-14T11:20:00Z' },
];

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const filtered = MOCK_DOCS.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#52525B]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search documents…"
            className="w-full rounded-lg border border-[#1F1F23] bg-[#111113] pl-9 pr-4 py-2 text-sm text-[#FAFAFA] placeholder:text-[#52525B] focus:outline-none focus:border-[#3B82F6]/50"
          />
        </div>
        <p className="text-sm text-[#52525B]">{filtered.length} document{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="space-y-2">
        {filtered.map((doc, i) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className="hover:border-[#3B82F6]/20 cursor-pointer transition-colors group">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3B82F6]/10">
                    <File className="h-5 w-5 text-[#3B82F6]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-[#FAFAFA] truncate">{doc.name}</p>
                      <Badge variant="outline">{doc.type}</Badge>
                    </div>
                    <p className="text-xs text-[#52525B]">{doc.company}</p>
                  </div>
                  <div className="hidden md:grid grid-cols-3 gap-8 shrink-0">
                    <div className="text-center">
                      <p className="text-[10px] text-[#3F3F46]">Pages</p>
                      <p className="text-sm font-bold font-mono text-[#FAFAFA]">{doc.pages}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-[#3F3F46]">Chunks</p>
                      <p className="text-sm font-bold font-mono text-[#FAFAFA]">{doc.chunks.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-[#3F3F46]">Graph Nodes</p>
                      <p className="text-sm font-bold font-mono text-[#FAFAFA]">{doc.nodes}</p>
                    </div>
                  </div>
                  <div className="hidden lg:flex items-center gap-1 text-[11px] text-[#52525B] shrink-0">
                    <Clock className="h-3 w-3" /> {fmt(doc.indexed_at)}
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#3F3F46] group-hover:text-[#3B82F6] transition-colors shrink-0" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
