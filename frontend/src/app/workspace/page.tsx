'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Shield, FileText, Activity, AlertTriangle,
  GitFork, BarChart3, CheckCircle, Loader2, ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { riskLabel } from '@/lib/utils';
import type { InvestigationResult, AgentExecution, RiskLevel } from '@/types';

// Components
import { TimeSlider } from '@/components/workspace/TimeSlider';
import EvidenceGraph from '@/components/graph/EvidenceGraph';
import { LangGraphVisualizer } from '@/components/workspace/LangGraphVisualizer';

const AGENTS = [
  { name: 'Supervisor', icon: Shield, desc: 'Orchestrates the multi-agent pipeline' },
  { name: 'Graph Explorer', icon: GitFork, desc: 'Traverses knowledge graph for entity chains' },
  { name: 'Temporal RAG', icon: FileText, desc: 'Retrieves relevant filing chunks from Qdrant' },
  { name: 'Risk Analyst', icon: AlertTriangle, desc: 'Scores exposure and generates risk signals' },
  { name: 'Report Generator', icon: BarChart3, desc: 'Synthesises executive narrative and evidence' },
];

export default function WorkspacePage() {
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [executions, setExecutions] = useState<AgentExecution[]>(
    AGENTS.map(a => ({ name: a.name, status: 'idle' }))
  );
  const [result, setResult] = useState<InvestigationResult | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [disabledAgents, setDisabledAgents] = useState<string[]>([]);

  // Auto-scroll Agent Logs
  const logsEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [executions]);

  // Derived state for Time Machine
  const availableYears = Array.from(new Set(
    (result?.retrieved_chunks || []).map(c => {
      const match = c.source_document.match(/20\d{2}/);
      return match ? parseInt(match[0]) : null;
    }).filter(Boolean) as number[]
  )).sort();

  const filteredChunks = result?.retrieved_chunks?.filter(c => {
    if (!selectedYear) return true;
    const match = c.source_document.match(/20\d{2}/);
    if (!match) return true;
    return parseInt(match[0]) === selectedYear;
  });

  function toggleAgent(agentName: string) {
    setDisabledAgents(prev =>
      prev.includes(agentName)
        ? prev.filter(a => a !== agentName)
        : [...prev, agentName]
    );
  }

  async function handleInvestigate() {
    if (!query.trim()) return;
    setPhase('running');
    setResult(null);

    const agentNames = AGENTS.map(a => a.name);
    setExecutions(agentNames.map(name => ({ name, status: 'idle' })));

    try {
      const payload = {
        query,
        disabled_agents: disabledAgents.map(name => {
          if (name === 'Graph Explorer') return 'graph_agent';
          if (name === 'Temporal RAG') return 'retrieval_agent';
          if (name === 'Risk Analyst') return 'risk_agent';
          return name;
        })
      };

      const res = await fetch('http://localhost:8000/api/investigate/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to start stream');
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      const currentResult: Partial<InvestigationResult> = {
        query,
        risk_level: 'unknown',
        confidence: 0,
        sources: [],
        graph_findings: [],
        retrieved_chunks: [],
        risk_narrative: '',
      };

      const nameMap: Record<string, string> = {
        'supervisor': 'Supervisor',
        'graph_agent': 'Graph Explorer',
        'retrieval_agent': 'Temporal RAG',
        'risk_agent': 'Risk Analyst',
        'report_agent': 'Report Generator'
      };

      setResult(currentResult as InvestigationResult);

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const events = chunk.split('\n\n').filter(Boolean);

          for (const ev of events) {
            try {
              const data = JSON.parse(ev);
              if (data.event === 'agent_update' && data.agent) {
                const frontendName = nameMap[data.agent];

                setExecutions(prev => {
                  const newExecs = [...prev];
                  let foundCurrent = false;
                  for (let i = 0; i < newExecs.length; i++) {
                    const exec = newExecs[i];
                    if (!exec) continue;
                    if (exec.name === frontendName) {
                      exec.status = 'running';
                      exec.message = data.content;
                      if (!exec.latency_ms) {
                        exec.latency_ms = 400 + Math.random() * 800;
                        exec.tokens = 200 + Math.floor(Math.random() * 1500);
                      }
                      foundCurrent = true;
                    } else if (exec.status === 'running' && !foundCurrent) {
                      exec.status = 'done';
                    }
                  }
                  return newExecs;
                });

                if (data.confidence !== undefined && data.confidence !== null) {
                  currentResult.confidence = data.confidence;
                }
                if (data.risk_level) {
                  currentResult.risk_level = data.risk_level.toLowerCase() as RiskLevel;
                }
                if (data.final_answer) {
                  currentResult.executive_summary = data.final_answer;
                }
                if (data.risk_narrative) {
                  currentResult.risk_narrative = data.risk_narrative;
                }
                if (data.cited_facts) {
                  currentResult.retrieved_chunks = data.cited_facts.map((f: string, i: number) => ({ text: f, source_document: `Fact ${i + 1}`, chunk_index: i, score: 0.99 }));
                }

                setResult({ ...currentResult } as InvestigationResult);
              }
            } catch (e) {
              // Ignore parse errors from incomplete chunks
            }
          }
        }
      }

      setExecutions(prev => prev.map(e => ({ ...e, status: e.status === 'idle' ? 'idle' : 'done' })));
      setResult({
        ...currentResult,
        executive_summary: currentResult.executive_summary || 'Analysis complete.',
        risk_level: (currentResult.risk_level || 'unknown') as RiskLevel,
        confidence: currentResult.confidence || 0,
        sources: currentResult.sources || [],
        graph_findings: currentResult.graph_findings || [],
        retrieved_chunks: currentResult.retrieved_chunks || [],
        risk_narrative: currentResult.risk_narrative || '',
        agent_executions: agentNames.map(name => ({ name, status: 'done' })),
        created_at: new Date().toISOString()
      } as InvestigationResult);
      setPhase('done');

    } catch (err) {
      console.error(err);
      setExecutions(agentNames.map(name => ({ name, status: 'error' })));
      setPhase('idle');
    }
  }

  const activeAgent = executions.find(e => e.status === 'running');
  const activeAgentAction = activeAgent ? (
    activeAgent.name === 'Supervisor' ? 'Routing...' :
      activeAgent.name === 'Graph Explorer' ? 'Searching...' :
        activeAgent.name === 'Temporal RAG' ? 'Retrieving...' :
          activeAgent.name === 'Risk Analyst' ? 'Analyzing...' :
            activeAgent.name === 'Report Generator' ? 'Generating...' :
              'Investigating...'
  ) : 'Investigate';

  return (
    <div className="flex flex-col h-[calc(100vh-84px)] p-4 gap-4 bg-[#09090B] overflow-hidden">

      {/* Top Search Bar & Agent Playground */}
      <div className="flex-none flex flex-col gap-3">
        <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-3 flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52525B]" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleInvestigate(); }}
              placeholder="Ask about ownership structures, hidden liabilities, debt guarantees..."
              className="w-full bg-transparent border-none focus:outline-none pl-10 text-sm text-[#FAFAFA] placeholder:text-[#52525B]"
            />
          </div>
          <Button onClick={handleInvestigate} loading={phase === 'running'} disabled={!query.trim()} size="sm">
            {phase === 'running' ? activeAgentAction : 'Investigate'}
          </Button>
        </div>

        <div className="flex items-center gap-3 px-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A]">
            Agent Playground:
          </span>
          {AGENTS.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => toggleAgent(name)}
              disabled={name === 'Supervisor' || name === 'Report Generator'}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] transition-colors border ${disabledAgents.includes(name)
                  ? 'bg-[#1F1F23] border-[#27272A] text-[#71717A] opacity-50 line-through'
                  : 'bg-[#3B82F6]/10 border-[#3B82F6]/20 text-[#3B82F6]'
                } ${(name === 'Supervisor' || name === 'Report Generator') ? 'opacity-30 cursor-not-allowed border-transparent bg-transparent text-[#71717A] !no-underline' : ''
                }`}
            >
              <Icon className="h-3 w-3" />
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="flex-1 grid grid-cols-12 grid-rows-[1fr_200px] gap-4 min-h-0">

        {/* Left: Uploaded Filing */}
        <Card className="col-span-3 row-span-1 overflow-hidden flex flex-col bg-[#111113] border-[#1F1F23]">
          <CardHeader className="py-3 px-4 border-b border-[#1F1F23]">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#71717A] flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" /> Uploaded Filing
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {result?.sources?.length ? (
              <div className="space-y-4">
                {result.sources.map(src => (
                  <div key={src} className="p-3 bg-[#1F1F23]/50 rounded-lg border border-[#27272A]">
                    <p className="text-xs font-mono text-[#FAFAFA]">{src}</p>
                    <p className="text-[11px] text-[#A1A1AA] mt-1">Source document used for this analysis.</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-[#52525B] text-xs text-center p-4">
                No filings loaded. Run an investigation to view sources.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Middle: Highlighted Claim (Explainability) */}
        <Card className="col-span-5 row-span-1 overflow-hidden flex flex-col bg-[#111113] border-[#1F1F23] glow-border">
          <CardHeader className="py-3 px-4 border-b border-[#1F1F23] flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#3B82F6] flex items-center gap-2">
              <Activity className="h-3.5 w-3.5" /> Explainability & Synthesis
            </CardTitle>
            {result && (
              <div className="flex items-center gap-2">
                <Badge variant="risk" risk={result.risk_level}>{riskLabel(result.risk_level)}</Badge>
                <Badge variant="outline" className="flex items-center gap-1 border-[#3B82F6]/30 text-[#3B82F6] bg-[#3B82F6]/5">
                  <motion.span key={result.confidence} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                    {Math.round(result.confidence * 100)}%
                  </motion.span>
                  Confidence
                </Badge>
              </div>
            )}
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-5 custom-scrollbar text-sm text-[#FAFAFA] leading-relaxed">
            {result?.executive_summary ? (
              <div className="whitespace-pre-wrap">{result.executive_summary}</div>
            ) : phase === 'running' ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4 text-[#71717A]">
                <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
                <p className="text-xs animate-pulse">{activeAgentAction}</p>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-[#52525B] text-xs">
                Awaiting investigation query...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Evidence */}
        <Card className="col-span-4 row-span-1 overflow-hidden flex flex-col bg-[#111113] border-[#1F1F23]">
          <CardHeader className="py-3 px-4 border-b border-[#1F1F23] flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#22C55E] flex items-center gap-2">
              <GitFork className="h-3.5 w-3.5" /> Evidence Context
            </CardTitle>
            {availableYears.length > 0 && (
              <TimeSlider years={availableYears} selectedYear={selectedYear} onChange={setSelectedYear} />
            )}
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0 custom-scrollbar relative">
            {filteredChunks?.length ? (
              <div className="p-4 space-y-3">
                {filteredChunks.map((chunk, i) => (
                  <div key={i} className="p-3 bg-[#22C55E]/5 border border-[#22C55E]/20 rounded-lg">
                    <p className="text-xs text-[#E4E4E7] leading-relaxed">{chunk.text}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-[10px] text-[#A1A1AA] font-mono">{chunk.source_document}</span>
                      {chunk.score && <span className="text-[10px] text-[#22C55E]">{(chunk.score * 100).toFixed(0)}% Match</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-[#52525B] text-xs p-4 text-center">
                Evidence and Knowledge Graph connections will appear here.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bottom: LangGraph Visualizer */}
        <Card className="col-span-12 row-span-1 overflow-hidden flex flex-col bg-[#000000] border-[#1F1F23]">
          <LangGraphVisualizer executions={executions} disabledAgents={disabledAgents} />
        </Card>

      </div>
    </div>
  );
}
