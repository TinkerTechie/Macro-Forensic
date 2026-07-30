'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, GitCompare, ArrowRight, Activity, Calendar } from 'lucide-react';
import * as Diff from 'diff';

interface Investigation {
  id: number;
  query: string;
  created_at: string;
  risk_level: string;
  confidence: number;
  result_json?: string;
}

function DiffText({ oldText, newText }: { oldText: string, newText: string }) {
  const diff = Diff.diffWords(oldText, newText);

  return (
    <div className="whitespace-pre-wrap leading-relaxed text-sm">
      {diff.map((part, index) => {
        const color = part.added ? 'bg-green-500/20 text-green-200' :
                      part.removed ? 'bg-red-500/20 text-red-200 line-through' :
                      'text-[#FAFAFA]';
        return <span key={index} className={color}>{part.value}</span>;
      })}
    </div>
  );
}

export default function ComparePage() {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [selectedA, setSelectedA] = useState<Investigation | null>(null);
  const [selectedB, setSelectedB] = useState<Investigation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/investigations')
      .then(res => res.json())
      .then(data => {
        setInvestigations(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getResult = (inv: Investigation | null) => {
    if (!inv || !inv.result_json) return null;
    try {
      return JSON.parse(inv.result_json);
    } catch {
      return null;
    }
  };

  const resA = getResult(selectedA);
  const resB = getResult(selectedB);

  return (
    <div className="flex flex-col h-[calc(100vh-84px)] p-6 gap-6 bg-[#09090B] overflow-auto custom-scrollbar">
      <div className="flex items-center gap-3">
        <GitCompare className="h-6 w-6 text-[#3B82F6]" />
        <h1 className="text-2xl font-bold text-[#FAFAFA]">Investigation Diff</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-10"><Loader2 className="animate-spin text-[#3B82F6]" /></div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <Card className="bg-[#111113] border-[#1F1F23]">
            <CardHeader className="border-b border-[#1F1F23]">
              <CardTitle className="text-sm font-semibold text-[#A1A1AA]">Report A (Baseline)</CardTitle>
              <select 
                className="w-full bg-[#09090B] border border-[#27272A] text-sm text-[#FAFAFA] p-2 rounded mt-2"
                value={selectedA?.id || ''}
                onChange={e => setSelectedA(investigations.find(i => i.id === parseInt(e.target.value)) || null)}
              >
                <option value="">Select Investigation A...</option>
                {investigations.map(inv => (
                  <option key={inv.id} value={inv.id}>
                    [{new Date(inv.created_at).toLocaleString()}] {inv.query}
                  </option>
                ))}
              </select>
            </CardHeader>
          </Card>

          <Card className="bg-[#111113] border-[#1F1F23]">
            <CardHeader className="border-b border-[#1F1F23]">
              <CardTitle className="text-sm font-semibold text-[#A1A1AA]">Report B (Comparison)</CardTitle>
              <select 
                className="w-full bg-[#09090B] border border-[#27272A] text-sm text-[#FAFAFA] p-2 rounded mt-2"
                value={selectedB?.id || ''}
                onChange={e => setSelectedB(investigations.find(i => i.id === parseInt(e.target.value)) || null)}
              >
                <option value="">Select Investigation B...</option>
                {investigations.map(inv => (
                  <option key={inv.id} value={inv.id}>
                    [{new Date(inv.created_at).toLocaleString()}] {inv.query}
                  </option>
                ))}
              </select>
            </CardHeader>
          </Card>
        </div>
      )}

      {selectedA && selectedB && resA && resB && (
        <div className="grid grid-cols-2 gap-6 mt-4">
          <Card className="col-span-2 bg-[#111113] border-[#1F1F23]">
            <CardHeader className="border-b border-[#1F1F23]">
              <CardTitle className="text-sm font-semibold text-[#FAFAFA]">Executive Summary Diff</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <DiffText oldText={resA.final_answer || ''} newText={resB.final_answer || ''} />
            </CardContent>
          </Card>

          <Card className="col-span-2 bg-[#111113] border-[#1F1F23]">
            <CardHeader className="border-b border-[#1F1F23]">
              <CardTitle className="text-sm font-semibold text-[#FAFAFA]">Risk Narrative Diff</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <DiffText oldText={resA.risk_narrative || ''} newText={resB.risk_narrative || ''} />
            </CardContent>
          </Card>
          
          <Card className="col-span-1 bg-[#111113] border-[#1F1F23]">
             <CardHeader className="border-b border-[#1F1F23]">
              <CardTitle className="text-sm font-semibold text-[#FAFAFA]">Report A Meta</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <p className="text-xs text-[#A1A1AA]">Risk: <Badge variant="outline">{resA.risk_level}</Badge></p>
              <p className="text-xs text-[#A1A1AA]">Confidence: {(resA.confidence * 100).toFixed(0)}%</p>
            </CardContent>
          </Card>
          <Card className="col-span-1 bg-[#111113] border-[#1F1F23]">
             <CardHeader className="border-b border-[#1F1F23]">
              <CardTitle className="text-sm font-semibold text-[#FAFAFA]">Report B Meta</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <p className="text-xs text-[#A1A1AA]">Risk: <Badge variant="outline">{resB.risk_level}</Badge></p>
              <p className="text-xs text-[#A1A1AA]">Confidence: {(resB.confidence * 100).toFixed(0)}%</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
